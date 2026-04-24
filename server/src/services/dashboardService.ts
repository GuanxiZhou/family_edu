import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "../lib/db.js";
import { children, families, risks, tasks } from "../db/schema.js";
import { refreshRisksForFamily } from "./riskEngine.js";
import { dateKeyInTimeZone } from "../lib/dateKey.js";

function addDaysYmd(ymd: string, deltaDays: number): string {
  const d = new Date(`${ymd}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 本周（周一至周日）在指定时区的 [start,end]（闭区间，字符串 YYYY-MM-DD） */
function currentWeekRangeKeysInTimeZone(timeZone: string): { start: string; end: string } {
  const todayYmd = dateKeyInTimeZone(new Date(), timeZone);
  const dow = new Date(`${todayYmd}T12:00:00.000Z`).getUTCDay(); // 0 Sun ... 6 Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const mondayYmd = addDaysYmd(todayYmd, mondayOffset);
  const sundayYmd = addDaysYmd(mondayYmd, 6);
  return { start: mondayYmd, end: sundayYmd };
}

export async function getFamilyDashboard(familyId: string) {
  const fam = await db.query.families.findFirst({
    where: eq(families.familyId, familyId),
    columns: { timezone: true },
  });
  const tz = fam?.timezone && fam.timezone.length > 0 ? fam.timezone : "Asia/Shanghai";

  await refreshRisksForFamily(familyId);

  const kids = await db.query.children.findMany({
    where: eq(children.familyId, familyId),
    orderBy: [children.name],
  });

  const childIds = kids.map((k) => k.childId);
  if (childIds.length === 0) {
    return {
      familyId,
      children: [] as const,
      todayFocus: [] as { childName: string; title: string; dueDate: string }[],
      riskRank: [] as { childName: string; level: string; detail: string | null }[],
      weekCompletion: [] as { childName: string; rate: number; completed: number; total: number }[],
    };
  }

  const { start: weekStartStr, end: weekEndStr } = currentWeekRangeKeysInTimeZone(tz);

  const allTasks = await db.query.tasks.findMany({
    where: inArray(tasks.childId, childIds),
  });

  const openRisks = await db.query.risks.findMany({
    where: and(inArray(risks.childId, childIds), isNull(risks.resolvedAt)),
    orderBy: [desc(risks.createdAt)],
  });

  const nameById = new Map(kids.map((k) => [k.childId, k.name] as const));

  const today = dateKeyInTimeZone(new Date(), tz);
  const todayFocus = allTasks
    .filter((t) => t.status !== "completed" && t.dueDate <= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 12)
    .map((t) => ({
      childName: nameById.get(t.childId) ?? "",
      title: t.title,
      dueDate: t.dueDate,
    }));

  const levelOrder = { high: 0, med: 1, low: 2 };
  const riskRank = [...openRisks]
    .sort((a, b) => levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder])
    .slice(0, 20)
    .map((r) => ({
      childName: nameById.get(r.childId) ?? "",
      level: r.level,
      detail: r.detail,
    }));

  const weekCompletion = childIds.map((cid) => {
    const mine = allTasks.filter(
      (t) => t.childId === cid && t.dueDate >= weekStartStr && t.dueDate <= weekEndStr,
    );
    const total = mine.length;
    const completed = mine.filter((t) => t.status === "completed").length;
    const rate = total === 0 ? 1 : completed / total;
    return {
      childName: nameById.get(cid) ?? "",
      rate,
      completed,
      total,
    };
  });

  return {
    familyId,
    children: kids.map((k) => ({
      childId: k.childId,
      name: k.name,
      grade: k.grade,
      subjects: JSON.parse(k.subjectsJson || "[]") as string[],
      interests: JSON.parse(k.interestsJson || "[]") as string[],
    })),
    todayFocus,
    riskRank,
    weekCompletion,
  };
}
