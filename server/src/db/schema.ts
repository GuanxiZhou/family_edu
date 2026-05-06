import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";

/** Family 聚合层 */
export const families = pgTable(
  "families",
  {
    familyId: text("family_id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    name: text("name").notNull(),

    timezone: text("timezone").notNull().default("Asia/Shanghai"),

    settingsJson: text("settings_json").notNull().default("{}"),

    ownerUserId: text("owner_user_id"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_families_owner").on(t.ownerUserId)],
);

/** Child 核心单元 */
export const children = pgTable(
  "children",
  {
    childId: text("child_id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    familyId: text("family_id")
      .notNull()
      .references(() => families.familyId, { onDelete: "cascade" }),

    name: text("name").notNull(),

    grade: text("grade").notNull(),

    school: text("school"),

    subjectsJson: text("subjects_json").notNull().default("[]"),

    interestsJson: text("interests_json").notNull().default("[]"),

    parentNotes: text("parent_notes"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_children_family").on(t.familyId)],
);

/** Goal 执行链 */
export const goals = pgTable(
  "goals",
  {
    goalId: text("goal_id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),

    title: text("title").notNull(),

    type: text("type").notNull(),

    deadline: text("deadline").notNull(),

    progress: integer("progress").notNull().default(0),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_goals_child").on(t.childId)],
);

export const taskStatusEnum = ["pending", "completed", "overdue"] as const;
export const taskSourceEnum = ["manual", "ai"] as const;

/** Task */
export const tasks = pgTable(
  "tasks",
  {
    taskId: text("task_id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),

    goalId: text("goal_id").references(() => goals.goalId, {
      onDelete: "set null",
    }),

    title: text("title").notNull(),

    dueDate: text("due_date").notNull(),

    status: text("status", { enum: taskStatusEnum })
      .notNull()
      .default("pending"),

    source: text("source", { enum: taskSourceEnum })
      .notNull()
      .default("manual"),

    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_tasks_child").on(t.childId),
    index("idx_tasks_goal").on(t.goalId),
    index("idx_tasks_due").on(t.dueDate),
  ],
);

export const growthLogTypeEnum = ["score", "feedback", "note", "event"] as const;

/** GrowthLog 成长链 */
export const growthLogs = pgTable(
  "growth_logs",
  {
    logId: text("log_id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),

    type: text("type", { enum: growthLogTypeEnum }).notNull(),

    subject: text("subject").notNull(),

    valueJson: text("value_json"),

    content: text("content"),

    loggedAt: text("logged_at").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_growth_child").on(t.childId)],
);

export const riskLevelEnum = ["high", "med", "low"] as const;

/** Risk 提醒层 */
export const risks = pgTable(
  "risks",
  {
    riskId: text("risk_id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),

    level: text("level", { enum: riskLevelEnum }).notNull(),

    triggerRule: text("trigger_rule").notNull(),

    detail: text("detail"),

    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
      mode: "date",
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_risks_child").on(t.childId)],
);

/** 家长确认后，短时间内不重复生成同一 auto 规则风险 */
export const riskSuppressions = pgTable(
  "risk_suppressions",
  {
    childId: text("child_id")
      .notNull()
      .references(() => children.childId, { onDelete: "cascade" }),

    triggerRule: text("trigger_rule").notNull(),

    suppressedUntil: timestamp("suppressed_until", {
      withTimezone: true,
      mode: "date",
    }).notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.childId, t.triggerRule] }),
    index("idx_risk_suppressions_child").on(t.childId),
    index("idx_risk_suppressions_rule").on(t.triggerRule),
  ],
);

/** Relations */
export const familiesRelations = relations(families, ({ many }) => ({
  children: many(children),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  family: one(families, {
    fields: [children.familyId],
    references: [families.familyId],
  }),

  goals: many(goals),
  tasks: many(tasks),
  growthLogs: many(growthLogs),
  risks: many(risks),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  child: one(children, {
    fields: [goals.childId],
    references: [children.childId],
  }),

  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  child: one(children, {
    fields: [tasks.childId],
    references: [children.childId],
  }),

  goal: one(goals, {
    fields: [tasks.goalId],
    references: [goals.goalId],
  }),
}));

export const growthLogsRelations = relations(growthLogs, ({ one }) => ({
  child: one(children, {
    fields: [growthLogs.childId],
    references: [children.childId],
  }),
}));

export const risksRelations = relations(risks, ({ one }) => ({
  child: one(children, {
    fields: [risks.childId],
    references: [children.childId],
  }),
}));

export const riskSuppressionsRelations = relations(
  riskSuppressions,
  ({ one }) => ({
    child: one(children, {
      fields: [riskSuppressions.childId],
      references: [children.childId],
    }),
  }),
);