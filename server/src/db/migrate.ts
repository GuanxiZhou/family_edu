import { rawDb as sqlite } from "../lib/db.js";

/** Programmatic bootstrap — no separate migration runner required for MVP */
export function runMigrations() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS families (
      family_id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      timezone TEXT NOT NULL DEFAULT 'Asia/Shanghai',
      settings_json TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE IF NOT EXISTS children (
      child_id TEXT PRIMARY KEY NOT NULL,
      family_id TEXT NOT NULL REFERENCES families(family_id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      school TEXT,
      subjects_json TEXT NOT NULL DEFAULT '[]',
      interests_json TEXT NOT NULL DEFAULT '[]',
      parent_notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE INDEX IF NOT EXISTS idx_children_family ON children(family_id);
    CREATE TABLE IF NOT EXISTS goals (
      goal_id TEXT PRIMARY KEY NOT NULL,
      child_id TEXT NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      deadline TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE INDEX IF NOT EXISTS idx_goals_child ON goals(child_id);
    CREATE TABLE IF NOT EXISTS tasks (
      task_id TEXT PRIMARY KEY NOT NULL,
      child_id TEXT NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
      goal_id TEXT REFERENCES goals(goal_id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      source TEXT NOT NULL DEFAULT 'manual',
      completed_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE INDEX IF NOT EXISTS idx_tasks_child ON tasks(child_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_goal ON tasks(goal_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
    CREATE TABLE IF NOT EXISTS growth_logs (
      log_id TEXT PRIMARY KEY NOT NULL,
      child_id TEXT NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      subject TEXT NOT NULL,
      value_json TEXT,
      content TEXT,
      logged_at TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE INDEX IF NOT EXISTS idx_growth_child ON growth_logs(child_id);
    CREATE TABLE IF NOT EXISTS risks (
      risk_id TEXT PRIMARY KEY NOT NULL,
      child_id TEXT NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
      level TEXT NOT NULL,
      trigger_rule TEXT NOT NULL,
      detail TEXT,
      resolved_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE INDEX IF NOT EXISTS idx_risks_child ON risks(child_id);
    CREATE TABLE IF NOT EXISTS risk_suppressions (
      child_id TEXT NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
      trigger_rule TEXT NOT NULL,
      suppressed_until INTEGER NOT NULL,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      PRIMARY KEY (child_id, trigger_rule)
    );
    CREATE INDEX IF NOT EXISTS idx_risk_suppressions_child ON risk_suppressions(child_id);
    CREATE INDEX IF NOT EXISTS idx_risk_suppressions_rule ON risk_suppressions(trigger_rule);
  `);

  // 旧版本可能在 growth_logs.type 上加了 CHECK；需要支持 event 时重建一次表结构（仅当检测到受限 CHECK）
  try {
    const row = sqlite
      .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='growth_logs'`)
      .get() as { sql: string } | undefined;
    const sql = row?.sql ?? "";
    const hasTypeCheck = /CHECK\s*\(\s*"?type"?\s+IN\s*\(/i.test(sql);
    const checkAllowsEvent = /'event'/.test(sql) || /"event"/.test(sql);
    if (hasTypeCheck && !checkAllowsEvent) {
      sqlite.exec(`
        CREATE TABLE growth_logs__new (
          log_id TEXT PRIMARY KEY NOT NULL,
          child_id TEXT NOT NULL REFERENCES children(child_id) ON DELETE CASCADE,
          type TEXT NOT NULL,
          subject TEXT NOT NULL,
          value_json TEXT,
          content TEXT,
          logged_at TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
        );
        INSERT INTO growth_logs__new (
          log_id, child_id, type, subject, value_json, content, logged_at, created_at
        )
        SELECT
          log_id, child_id, type, subject, value_json, content, logged_at, created_at
        FROM growth_logs;
        DROP TABLE growth_logs;
        ALTER TABLE growth_logs__new RENAME TO growth_logs;
        CREATE INDEX IF NOT EXISTS idx_growth_child ON growth_logs(child_id);
      `);
    }
  } catch {
    // ignore
  }
}
