import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiSend } from "../api";
import { localDateKey } from "../lib/dataRange";
import { useI18n } from "../i18n/i18n";

type Task = { taskId: string; title: string; dueDate: string; status: string };

export function ChildAppPage() {
  const { childId } = useParams<{ childId: string }>();
  const { t, lang, toggleLang } = useI18n();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const today = localDateKey(new Date());

  const load = () => {
    if (!childId) return;
    setErr(null);
    apiGet<{ tasks: Task[] }>(`/api/child-app/${childId}/today`)
      .then((d) => setTasks(d.tasks))
      .catch((e: Error) => setErr(e.message));
  };

  useEffect(() => {
    load();
  }, [childId]);

  const toggle = async (task: Task) => {
    const next = task.status === "completed" ? "pending" : "completed";
    await apiSend(`/api/tasks/${task.taskId}`, "PATCH", { status: next });
    load();
  };

  if (!childId) return null;
  if (err) return <p className="error">{err}</p>;

  const open = tasks.filter((t) => t.status !== "completed");

  return (
    <div className="child-app">
      <button type="button" className="child-app-lang lang-toggle" onClick={toggleLang} aria-label="Toggle language">
        {lang === "zh" ? t("nav.lang.en") : t("nav.lang.zh")}
      </button>
      <header className="child-app-header">
        <div className="child-app-title">{t("childApp.title")}</div>
        <div className="child-app-sub">{today}</div>
      </header>
      <main className="child-app-main">
        {open.length === 0 ? (
          <p className="muted">{t("childApp.none")}</p>
        ) : (
          <ul className="child-app-list">
            {open.map((task) => (
              <li key={task.taskId} className="child-app-item">
                <div>
                  <div className="child-app-task-title">{task.title}</div>
                  <div className="child-app-meta">
                    {t("childApp.due")} {task.dueDate} · {task.status}
                  </div>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => toggle(task)}>
                  {t("childApp.done")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
