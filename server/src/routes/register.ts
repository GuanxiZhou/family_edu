import type { FastifyInstance } from "fastify";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "../lib/db.js";
import {
  children,
  families,
  goals,
  growthLogs,
  risks,
  tasks,
} from "../db/schema.js";
import { getFamilyDashboard } from "../services/dashboardService.js";
import { refreshRisksForFamily, resolveRisk } from "../services/riskEngine.js";

const familyBody = z.object({
  name: z.string().min(1),
  timezone: z.string().optional(),
});

const childBody = z.object({
  name: z.string().min(1),
  grade: z.string().min(1),
  school: z.string().optional(),
  subjects: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  parentNotes: z.string().optional(),
});

const goalBody = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  deadline: z.string().min(1),
  progress: z.number().min(0).max(100).optional(),
});

const taskBody = z.object({
  title: z.string().min(1),
  dueDate: z.string().min(1),
  goalId: z.string().nullable().optional(),
  source: z.enum(["manual", "ai"]).optional(),
  status: z.enum(["pending", "completed", "overdue"]).optional(),
});

const growthBody = z.object({
  type: z.enum(["score", "feedback", "note", "event"]),
  subject: z.string().min(1),
  value: z.unknown().optional(),
  content: z.string().optional(),
  loggedAt: z.string().min(1),
});

export async function registerRoutes(app: FastifyInstance) {
  app.get("/api/health", async () => ({ ok: true }));

  app.get("/api/families", async () => {
    const rows = await db.query.families.findMany({ orderBy: (f, { desc }) => [desc(f.createdAt)] });
    return { families: rows };
  });

  app.post("/api/families", async (req, reply) => {
    const body = familyBody.parse(req.body);
    const [row] = await db
      .insert(families)
      .values({ name: body.name, timezone: body.timezone ?? "Asia/Shanghai" })
      .returning();
    reply.code(201);
    return { family: row };
  });

  app.delete("/api/families/:familyId", async (req, reply) => {
    const { familyId } = req.params as { familyId: string };
    const f = await db.query.families.findFirst({ where: eq(families.familyId, familyId) });
    if (!f) return reply.code(404).send({ error: "家庭不存在" });

    // FK onDelete: cascade will delete children and their related entities
    await db.delete(families).where(eq(families.familyId, familyId));
    return { ok: true };
  });

  app.get("/api/families/:familyId", async (req, reply) => {
    const { familyId } = req.params as { familyId: string };
    const f = await db.query.families.findFirst({ where: eq(families.familyId, familyId) });
    if (!f) {
      return reply.code(404).send({ error: "家庭不存在" });
    }
    const kids = await db.query.children.findMany({ where: eq(children.familyId, familyId) });
    return {
      family: f,
      children: kids.map((k) => ({
        ...k,
        subjects: JSON.parse(k.subjectsJson || "[]"),
        interests: JSON.parse(k.interestsJson || "[]"),
      })),
    };
  });

  app.get("/api/families/:familyId/dashboard", async (req) => {
    const { familyId } = req.params as { familyId: string };
    return getFamilyDashboard(familyId);
  });

  app.post("/api/families/:familyId/children", async (req, reply) => {
    const { familyId } = req.params as { familyId: string };
    const body = childBody.parse(req.body);
    const [row] = await db
      .insert(children)
      .values({
        familyId,
        name: body.name,
        grade: body.grade,
        school: body.school,
        subjectsJson: JSON.stringify(body.subjects),
        interestsJson: JSON.stringify(body.interests),
        parentNotes: body.parentNotes,
      })
      .returning();
    reply.code(201);
    return {
      child: {
        ...row,
        subjects: JSON.parse(row.subjectsJson || "[]"),
        interests: JSON.parse(row.interestsJson || "[]"),
      },
    };
  });

  app.patch("/api/children/:childId", async (req, reply) => {
    const { childId } = req.params as { childId: string };
    const partial = childBody.partial().parse(req.body);
    const [row] = await db
      .update(children)
      .set({
        ...(partial.name !== undefined ? { name: partial.name } : {}),
        ...(partial.grade !== undefined ? { grade: partial.grade } : {}),
        ...(partial.school !== undefined ? { school: partial.school } : {}),
        ...(partial.subjects !== undefined ? { subjectsJson: JSON.stringify(partial.subjects) } : {}),
        ...(partial.interests !== undefined ? { interestsJson: JSON.stringify(partial.interests) } : {}),
        ...(partial.parentNotes !== undefined ? { parentNotes: partial.parentNotes } : {}),
      })
      .where(eq(children.childId, childId))
      .returning();
    if (!row) return reply.code(404).send({ error: "未找到" });
    return {
      child: {
        ...row,
        subjects: JSON.parse(row.subjectsJson || "[]"),
        interests: JSON.parse(row.interestsJson || "[]"),
      },
    };
  });

  app.post("/api/children/:childId/goals", async (req, reply) => {
    const { childId } = req.params as { childId: string };
    const body = goalBody.parse(req.body);
    const [row] = await db
      .insert(goals)
      .values({
        childId,
        title: body.title,
        type: body.type,
        deadline: body.deadline,
        progress: body.progress ?? 0,
      })
      .returning();
    reply.code(201);
    return { goal: row };
  });

  app.get("/api/children/:childId/goals", async (req) => {
    const { childId } = req.params as { childId: string };
    const rows = await db.query.goals.findMany({ where: eq(goals.childId, childId) });
    return { goals: rows };
  });

  app.patch("/api/goals/:goalId", async (req, reply) => {
    const { goalId } = req.params as { goalId: string };
    const partial = goalBody.partial().parse(req.body);
    const [row] = await db
      .update(goals)
      .set({
        ...(partial.title !== undefined ? { title: partial.title } : {}),
        ...(partial.type !== undefined ? { type: partial.type } : {}),
        ...(partial.deadline !== undefined ? { deadline: partial.deadline } : {}),
        ...(partial.progress !== undefined ? { progress: partial.progress } : {}),
      })
      .where(eq(goals.goalId, goalId))
      .returning();
    if (!row) return reply.code(404).send({ error: "未找到" });
    return { goal: row };
  });

  app.post("/api/children/:childId/tasks", async (req, reply) => {
    const { childId } = req.params as { childId: string };
    const body = taskBody.parse(req.body);
    const [row] = await db
      .insert(tasks)
      .values({
        childId,
        title: body.title,
        dueDate: body.dueDate,
        goalId: body.goalId ?? null,
        source: body.source ?? "manual",
        status: body.status ?? "pending",
      })
      .returning();
    reply.code(201);
    return { task: row };
  });

  app.get("/api/children/:childId/tasks", async (req) => {
    const { childId } = req.params as { childId: string };
    const rows = await db.query.tasks.findMany({ where: eq(tasks.childId, childId) });
    return { tasks: rows };
  });

  app.patch("/api/tasks/:taskId", async (req, reply) => {
    const { taskId } = req.params as { taskId: string };
    const partial = taskBody.partial().parse(req.body);
    const completedAt =
      partial.status === "completed"
        ? new Date()
        : partial.status === "pending" || partial.status === "overdue"
          ? null
          : undefined;
    const [row] = await db
      .update(tasks)
      .set({
        ...(partial.title !== undefined ? { title: partial.title } : {}),
        ...(partial.dueDate !== undefined ? { dueDate: partial.dueDate } : {}),
        ...(partial.goalId !== undefined ? { goalId: partial.goalId } : {}),
        ...(partial.source !== undefined ? { source: partial.source } : {}),
        ...(partial.status !== undefined ? { status: partial.status } : {}),
        ...(completedAt !== undefined ? { completedAt } : {}),
      })
      .where(eq(tasks.taskId, taskId))
      .returning();
    if (!row) return reply.code(404).send({ error: "未找到" });

    const childRow = await db.query.children.findFirst({
      where: eq(children.childId, row.childId),
      columns: { familyId: true },
    });
    if (childRow?.familyId) await refreshRisksForFamily(childRow.familyId);

    return { task: row };
  });

  app.delete("/api/tasks/:taskId", async (req, reply) => {
    const { taskId } = req.params as { taskId: string };
    const existing = await db.query.tasks.findFirst({ where: eq(tasks.taskId, taskId) });
    if (!existing) return reply.code(404).send({ error: "未找到" });

    await db.delete(tasks).where(eq(tasks.taskId, taskId));

    const childRow = await db.query.children.findFirst({
      where: eq(children.childId, existing.childId),
      columns: { familyId: true },
    });
    if (childRow?.familyId) await refreshRisksForFamily(childRow.familyId);

    reply.code(204);
    return;
  });

  /** 孩子端轻量：仅查看与打卡 */
  app.get("/api/child-app/:childId/today", async (req) => {
    const { childId } = req.params as { childId: string };
    const today = new Date().toISOString().slice(0, 10);
    const rows = await db.query.tasks.findMany({
      where: eq(tasks.childId, childId),
    });
    const todayTasks = rows.filter((t) => t.dueDate === today || t.status === "pending" || t.status === "overdue");
    return { tasks: todayTasks.slice(0, 50) };
  });

  app.post("/api/children/:childId/growth-logs", async (req, reply) => {
    const { childId } = req.params as { childId: string };
    const body = growthBody.parse(req.body);
    const [row] = await db
      .insert(growthLogs)
      .values({
        childId,
        type: body.type,
        subject: body.subject,
        valueJson: body.value !== undefined ? JSON.stringify(body.value) : null,
        content: body.content ?? null,
        loggedAt: body.loggedAt,
      })
      .returning();
    reply.code(201);
    return { log: row };
  });

  app.get("/api/children/:childId/growth-logs", async (req) => {
    const { childId } = req.params as { childId: string };
    const rows = await db.query.growthLogs.findMany({
      where: eq(growthLogs.childId, childId),
      orderBy: (g, { desc }) => [desc(g.loggedAt)],
    });
    return { logs: rows };
  });

  app.get("/api/children/:childId/risks", async (req) => {
    const { childId } = req.params as { childId: string };
    const q = z
      .object({
        status: z.enum(["open", "all"]).optional(),
      })
      .parse((req.query ?? {}) as Record<string, unknown>);

    const rows = await db.query.risks.findMany({
      where:
        q.status === "all" ? eq(risks.childId, childId) : and(eq(risks.childId, childId), isNull(risks.resolvedAt)),
      orderBy: (r, { desc }) => [desc(r.createdAt)],
    });
    return { risks: rows };
  });

  app.post("/api/risks/:riskId/resolve", async (req) => {
    const { riskId } = req.params as { riskId: string };
    await resolveRisk(riskId);
    return { ok: true };
  });

  /** AI 草稿：目标拆任务（MVP 用模板规则，可换 LLM） */
  app.post("/api/goals/:goalId/draft-tasks", async (req, reply) => {
    const { goalId } = req.params as { goalId: string };
    const g = await db.query.goals.findFirst({ where: eq(goals.goalId, goalId) });
    if (!g) return reply.code(404).send({ error: "目标不存在" });
    const start = new Date();
    const drafts = [0, 1, 2, 3].map((i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i * 2);
      return {
        title: `「${g.title}」第 ${i + 1} 步（草稿）`,
        dueDate: d.toISOString().slice(0, 10),
        source: "ai" as const,
        goalId,
      };
    });
    return { drafts, notice: "以上为 AI 草稿，确认后写入任务表" };
  });

  app.post("/api/goals/:goalId/apply-drafts", async (req, reply) => {
    const { goalId } = req.params as { goalId: string };
    const g = await db.query.goals.findFirst({ where: eq(goals.goalId, goalId) });
    if (!g) return reply.code(404).send({ error: "目标不存在" });
    const schema = z.object({
      items: z.array(z.object({ title: z.string(), dueDate: z.string() })),
    });
    const body = schema.parse(req.body);
    const inserted = [];
    for (const item of body.items) {
      const [t] = await db
        .insert(tasks)
        .values({
          childId: g.childId,
          goalId,
          title: item.title,
          dueDate: item.dueDate,
          source: "ai",
          status: "pending",
        })
        .returning();
      inserted.push(t);
    }
    reply.code(201);
    return { tasks: inserted };
  });
}
