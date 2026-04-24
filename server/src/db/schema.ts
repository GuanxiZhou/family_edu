import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** PRD §08 — Family 聚合层 */
export const families = sqliteTable("families", {
  familyId: text("family_id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("Asia/Shanghai"),
  settingsJson: text("settings_json").notNull().default("{}"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

/** PRD §08 — Child 核心单元 */
export const children = sqliteTable(
  "children",
  {
    childId: text("child_id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    familyId: text("family_id")
      .notNull()
      .references(() => families.familyId, { onDelete: "cascade" }),
    name: text("name").notNull(),
    grade: text("grade").notNull(),
    school: text("school"),
    subjectsJson: text("subjects_json").notNull().default("[]"),
    interestsJson: text("interests_json").notNull().default("[]"),
    parentNotes: text("parent_notes"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("idx_children_family").on(t.familyId)],
);

/** PRD §08 — Goal 执行链 */
export const goals = sqliteTable(
  "goals",
  {
    goalId: text("goal_id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: text("type").notNull(),
    deadline: text("deadline").notNull(),
    progress: integer("progress").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("idx_goals_child").on(t.childId)],
);

export const taskStatusEnum = ["pending", "completed", "overdue"] as const;
export const taskSourceEnum = ["manual", "ai"] as const;

/** PRD §08 — Task（goal 可选：日常任务可暂不挂目标） */
export const tasks = sqliteTable(
  "tasks",
  {
    taskId: text("task_id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),
    goalId: text("goal_id").references(() => goals.goalId, { onDelete: "set null" }),
    title: text("title").notNull(),
    dueDate: text("due_date").notNull(),
    status: text("status", { enum: taskStatusEnum }).notNull().default("pending"),
    source: text("source", { enum: taskSourceEnum }).notNull().default("manual"),
    completedAt: integer("completed_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    index("idx_tasks_child").on(t.childId),
    index("idx_tasks_goal").on(t.goalId),
    index("idx_tasks_due").on(t.dueDate),
  ],
);

export const growthLogTypeEnum = ["score", "feedback", "note", "event"] as const;

/** PRD §08 — GrowthLog 成长链 */
export const growthLogs = sqliteTable(
  "growth_logs",
  {
    logId: text("log_id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),
    type: text("type", { enum: growthLogTypeEnum }).notNull(),
    subject: text("subject").notNull(),
    valueJson: text("value_json"),
    content: text("content"),
    loggedAt: text("logged_at").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("idx_growth_child").on(t.childId)],
);

export const riskLevelEnum = ["high", "med", "low"] as const;

/** PRD §08 — Risk 提醒层 */
export const risks = sqliteTable(
  "risks",
  {
    riskId: text("risk_id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),
    level: text("level", { enum: riskLevelEnum }).notNull(),
    triggerRule: text("trigger_rule").notNull(),
    detail: text("detail"),
    resolvedAt: integer("resolved_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index("idx_risks_child").on(t.childId)],
);

/** 家长确认后，短时间内不重复生成同一 auto 规则风险 */
export const riskSuppressions = sqliteTable(
  "risk_suppressions",
  {
    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),
    triggerRule: text("trigger_rule").notNull(),
    suppressedUntil: integer("suppressed_until", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [
    primaryKey({ columns: [t.childId, t.triggerRule] }),
    index("idx_risk_suppressions_child").on(t.childId),
    index("idx_risk_suppressions_rule").on(t.triggerRule),
  ],
);

export const familiesRelations = relations(families, ({ many }) => ({
  children: many(children),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  family: one(families, { fields: [children.familyId], references: [families.familyId] }),
  goals: many(goals),
  tasks: many(tasks),
  growthLogs: many(growthLogs),
  risks: many(risks),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  child: one(children, { fields: [goals.childId], references: [children.childId] }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  child: one(children, { fields: [tasks.childId], references: [children.childId] }),
  goal: one(goals, { fields: [tasks.goalId], references: [goals.goalId] }),
}));

export const growthLogsRelations = relations(growthLogs, ({ one }) => ({
  child: one(children, { fields: [growthLogs.childId], references: [children.childId] }),
}));

export const risksRelations = relations(risks, ({ one }) => ({
  child: one(children, { fields: [risks.childId], references: [children.childId] }),
}));
