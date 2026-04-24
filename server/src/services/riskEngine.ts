import { and, eq, gt, inArray, isNull, like, lt } from "drizzle-orm";
import { db } from "../lib/db.js";
import { children, families, goals, growthLogs, risks, riskSuppressions, tasks } from "../db/schema.js";
import { dateKeyInTimeZone } from "../lib/dateKey.js";

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T12:00:00");
  const db_ = new Date(b + "T12:00:00");
  return Math.round((db_.getTime() - da.getTime()) / 86400000);
}

/** 规则层：逾期任务标记 + 自动生成风险（PRD 风险提醒 / AI Phase 1 规则触发） */
export async function refreshRisksForFamily(familyId: string): Promise<void> {
  const fam = await db.query.families.findFirst({
    where: eq(families.familyId, familyId),
    columns: { timezone: true },
  });
  const tz = fam?.timezone && fam.timezone.length > 0 ? fam.timezone : "Asia/Shanghai";

  const kids = await db.query.children.findMany({
    where: eq(children.familyId, familyId),
    columns: { childId: true },
  });
  const childIds = kids.map((k) => k.childId);
  if (childIds.length === 0) return;

  const t = dateKeyInTimeZone(new Date(), tz);

  await db
    .update(tasks)
    .set({ status: "overdue" })
    .where(
      and(
        inArray(tasks.childId, childIds),
        eq(tasks.status, "pending"),
        lt(tasks.dueDate, t),
      ),
    );

  await db
    .delete(risks)
    .where(
      and(inArray(risks.childId, childIds), like(risks.triggerRule, "auto:%"), isNull(risks.resolvedAt)),
    );

  const now = Date.now();
  const activeSuppressions = await db.query.riskSuppressions.findMany({
    where: and(inArray(riskSuppressions.childId, childIds), gt(riskSuppressions.suppressedUntil, new Date(now))),
  });
  const suppressed = new Set(activeSuppressions.map((s) => `${s.childId}::${s.triggerRule}`));

  const taskRows = await db.query.tasks.findMany({
    where: inArray(tasks.childId, childIds),
  });

  for (const cid of childIds) {
    const mine = taskRows.filter((x) => x.childId === cid);
    const overdue = mine.filter((x) => x.status === "overdue").length;
    const total = mine.filter((x) => x.status !== "completed").length + mine.filter((x) => x.status === "completed").length;
    const pending = mine.filter((x) => x.status === "pending" || x.status === "overdue").length;

    if (overdue >= 3) {
      const rule = "auto:overdue_count";
      if (!suppressed.has(`${cid}::${rule}`)) {
        await db.insert(risks).values({
          childId: cid,
          level: "high",
          triggerRule: rule,
          detail: `当前逾期任务 ${overdue} 条，请及时处理`,
        });
      }
    } else if (overdue >= 1) {
      const rule = "auto:overdue_any";
      if (!suppressed.has(`${cid}::${rule}`)) {
        await db.insert(risks).values({
          childId: cid,
          level: "med",
          triggerRule: rule,
          detail: `有 ${overdue} 条任务已逾期`,
        });
      }
    }

    if (total > 0 && pending / total > 0.5 && overdue === 0) {
      const rule = "auto:completion_rate";
      if (!suppressed.has(`${cid}::${rule}`)) {
        await db.insert(risks).values({
          childId: cid,
          level: "low",
          triggerRule: rule,
          detail: "本周待完成任务占比较高，建议调整计划",
        });
      }
    }
  }

  const goalRows = await db.query.goals.findMany({
    where: inArray(goals.childId, childIds),
  });

  for (const g of goalRows) {
    const left = daysBetween(t, g.deadline);
    if (left >= 0 && left <= 14 && g.progress < 40) {
      const rule = "auto:goal_progress";
      if (!suppressed.has(`${g.childId}::${rule}`)) {
        await db.insert(risks).values({
          childId: g.childId,
          level: left <= 7 ? "high" : "med",
          triggerRule: rule,
          detail: `目标「${g.title}」截止临近但完成度仅 ${g.progress}%`,
        });
      }
    }
  }

  const logs = await db.query.growthLogs.findMany({
    where: and(inArray(growthLogs.childId, childIds), eq(growthLogs.type, "score")),
  });

  const byChild = new Map<string, typeof logs>();
  for (const l of logs) {
    const arr = byChild.get(l.childId) ?? [];
    arr.push(l);
    byChild.set(l.childId, arr);
  }

  for (const [cid, list] of byChild) {
    const bySubject = new Map<string, typeof list>();
    for (const l of list) {
      const arr = bySubject.get(l.subject) ?? [];
      arr.push(l);
      bySubject.set(l.subject, arr);
    }
    for (const [subj, scores] of bySubject) {
      const sorted = [...scores].sort((a, b) => b.loggedAt.localeCompare(a.loggedAt));
      if (sorted.length < 2) continue;
      const parseNum = (s: string | null) => {
        if (!s) return NaN;
        try {
          const j = JSON.parse(s);
          return typeof j === "number" ? j : Number(j);
        } catch {
          return Number(s);
        }
      };
      const cur = parseNum(sorted[0].valueJson);
      const prev = parseNum(sorted[1].valueJson);
      if (!Number.isFinite(cur) || !Number.isFinite(prev)) continue;
      if (cur < prev - 10) {
        const rule = "auto:grade_trend";
        if (!suppressed.has(`${cid}::${rule}`)) {
          await db.insert(risks).values({
            childId: cid,
            level: "med",
            triggerRule: rule,
            detail: `${subj} 成绩较上次明显下降（${prev} → ${cur}）`,
          });
        }
      }
    }
  }
}

export async function resolveRisk(riskId: string): Promise<void> {
  await db
    .update(risks)
    .set({ resolvedAt: new Date() })
    .where(and(eq(risks.riskId, riskId), isNull(risks.resolvedAt)));

  const row = await db.query.risks.findFirst({ where: eq(risks.riskId, riskId) });
  if (!row) return;
  if (!row.triggerRule.startsWith("auto:")) return;

  const until = new Date(Date.now() + 7 * 86400000);
  await db
    .insert(riskSuppressions)
    .values({
      childId: row.childId,
      triggerRule: row.triggerRule,
      suppressedUntil: until,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [riskSuppressions.childId, riskSuppressions.triggerRule],
      set: { suppressedUntil: until, updatedAt: new Date() },
    });
}
