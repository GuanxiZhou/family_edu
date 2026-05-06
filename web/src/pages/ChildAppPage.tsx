import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiSend } from "../api";
import { localDateKey } from "../lib/db";

type Task = { taskId: string; title: string; dueDate: string; status: string };

export function ChildAppPage() {
  const { childId } = useParams<{ childId: string }>();
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

  const toggle = async (t: Task) => {
    const next = t.status === "completed" ? "pending" : "completed";
    await apiSend(`/api/tasks/${t.taskId}`, "PATCH", { status: next });
    load();
  };

  if (!childId) return null;
  if (err) return <p className="error">{err}</p>;

  const open = tasks.filter((t) => t.status !== "completed");

  return (
    <div className="child-app">
      <header className="child-app-header">
        <div className="child-app-title">今日任务</div>
        <div className="child-app-sub">{today}</div>
      </header>
      <main className="child-app-main">
        {open.length === 0 ? (
          <p className="muted">今天没有待完成任务。</p>
        ) : (
          <ul className="child-app-list">
            {open.map((t) => (
              <li key={t.taskId} className="child-app-item">
                <div>
                  <div className="child-app-task-title">{t.title}</div>
                  <div className="child-app-meta">
                    截止 {t.dueDate} · {t.status}
                  </div>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => toggle(t)}>
                  完成
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
