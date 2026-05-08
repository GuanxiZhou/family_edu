import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiSend, FAMILY_KEY } from "../api";
import { currentWeekRangeLocal, localDateKey } from "../lib/dataRange";
import { useI18n } from "../i18n/i18n";

type Goal = { goalId: string; title: string; type: string; deadline: string; progress: number };
type Task = {
  taskId: string;
  title: string;
  dueDate: string;
  status: string;
  source: string;
};
type Log = { logId: string; type: string; subject: string; content: string | null; loggedAt: string; valueJson: string | null };
type ChildProfile = {
  childId: string;
  name: string;
  grade: string;
  school: string | null;
  subjects: string[];
  interests: string[];
  parentNotes: string | null;
};
type Risk = {
  riskId: string;
  level: string;
  detail: string | null;
  resolvedAt: number | string | null;
  triggerRule: string;
};

export function ChildDetailPage() {
  const { childId } = useParams<{ childId: string }>();
  const { t } = useI18n();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    grade: "",
    school: "",
    subjectsText: "",
    interestsText: "",
    parentNotes: "",
  });

  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [showRiskHistory, setShowRiskHistory] = useState(false);
  const [taskView, setTaskView] = useState<"all" | "week">("all");

  const [goalForm, setGoalForm] = useState({ title: "", type: "学科", deadline: "", progress: 0 });
  const [taskForm, setTaskForm] = useState({ title: "", dueDate: localDateKey(new Date()) });
  const [logForm, setLogForm] = useState({
    type: "note" as "score" | "feedback" | "note" | "event",
    subject: "",
    content: "",
    score: "",
    loggedAt: localDateKey(new Date()),
  });

  const weekRange = useMemo(() => currentWeekRangeLocal(), []);

  const loadAll = () => {
    if (!childId) return;
    setErr(null);
    const riskQs = showRiskHistory ? "?status=all" : "?status=open";
    const familyId = localStorage.getItem(FAMILY_KEY);
    Promise.all([
      familyId ? apiGet<{ children: ChildProfile[] }>(`/api/families/${familyId}`) : Promise.resolve(null),
      apiGet<{ goals: Goal[] }>(`/api/children/${childId}/goals`),
      apiGet<{ tasks: Task[] }>(`/api/children/${childId}/tasks`),
      apiGet<{ logs: Log[] }>(`/api/children/${childId}/growth-logs`),
      apiGet<{ risks: Risk[] }>(`/api/children/${childId}/risks${riskQs}`),
    ])
      .then(([fam, g, t, l, r]) => {
        const me = fam?.children.find((c) => c.childId === childId);
        if (me) {
          setProfile(me);
          setProfileForm({
            name: me.name,
            grade: me.grade,
            school: me.school ?? "",
            subjectsText: me.subjects.join(", "),
            interestsText: me.interests.join(", "),
            parentNotes: me.parentNotes ?? "",
          });
        }
        setGoals(g.goals);
        setTasks(t.tasks);
        setLogs(l.logs);
        setRisks(r.risks);
      })
      .catch((e: Error) => setErr(e.message));
  };

  useEffect(() => {
    loadAll();
  }, [childId, showRiskHistory]);

  const addGoal = async () => {
    if (!childId) return;
    await apiSend(`/api/children/${childId}/goals`, "POST", {
      title: goalForm.title,
      type: goalForm.type,
      deadline: goalForm.deadline || "2026-12-31",
      progress: goalForm.progress,
    });
    setGoalForm({ title: "", type: "学科", deadline: "", progress: 0 });
    loadAll();
  };

  const saveProfile = async () => {
    if (!childId) return;
    const subjects = profileForm.subjectsText
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const interests = profileForm.interestsText
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);
    await apiSend(`/api/children/${childId}`, "PATCH", {
      name: profileForm.name,
      grade: profileForm.grade,
      school: profileForm.school || undefined,
      subjects,
      interests,
      parentNotes: profileForm.parentNotes || undefined,
    });
    loadAll();
  };

  const updateGoalProgress = async (goalId: string, progress: number) => {
    await apiSend(`/api/goals/${goalId}`, "PATCH", { progress });
    loadAll();
  };

  const addTask = async () => {
    if (!childId) return;
    await apiSend(`/api/children/${childId}/tasks`, "POST", {
      title: taskForm.title,
      dueDate: taskForm.dueDate,
    });
    setTaskForm({ title: "", dueDate: localDateKey(new Date()) });
    loadAll();
  };

  const toggleTask = async (t: Task) => {
    const next = t.status === "completed" ? "pending" : "completed";
    await apiSend(`/api/tasks/${t.taskId}`, "PATCH", { status: next });
    loadAll();
  };

  const addLog = async () => {
    if (!childId) return;
    const body =
      logForm.type === "score"
        ? {
            type: logForm.type,
            subject: logForm.subject,
            loggedAt: logForm.loggedAt,
            value: Number(logForm.score),
          }
        : {
            type: logForm.type,
            subject:
              logForm.subject ||
              (logForm.type === "event"
                ? t("childDetail.logs.defaultEventSubject")
                : t("childDetail.logs.defaultGeneralSubject")),
            loggedAt: logForm.loggedAt,
            content: logForm.content,
          };
    await apiSend(`/api/children/${childId}/growth-logs`, "POST", body);
    setLogForm((f) => ({ ...f, content: "", score: "" }));
    loadAll();
  };

  const resolveRisk = async (id: string) => {
    await apiSend(`/api/risks/${id}/resolve`, "POST");
    loadAll();
  };

  const deleteTask = async (task: Task) => {
    const ok = window.confirm(t("childDetail.tasks.confirmDelete", { title: task.title }));
    if (!ok) return;
    await apiSend(`/api/tasks/${task.taskId}`, "DELETE");
    loadAll();
  };

  const draftFromGoal = async (goalId: string) => {
    const d = await apiSend<{ drafts: { title: string; dueDate: string }[] }>(`/api/goals/${goalId}/draft-tasks`, "POST");
    await apiSend(`/api/goals/${goalId}/apply-drafts`, "POST", { items: d.drafts });
    loadAll();
  };

  if (!childId) return null;
  if (err) return <p className="error">{err}</p>;

  const tasksShown =
    taskView === "week"
      ? tasks.filter((t) => t.dueDate >= weekRange.start && t.dueDate <= weekRange.end)
      : tasks;

  return (
    <div>
      <Link className="back-link" to="/children">
        {t("childDetail.back")}
      </Link>
      <h1 className="page-title">{t("childDetail.title")}</h1>
      <p className="page-lead">{t("childDetail.lead")}</p>

      <div className="card">
        <h3>{t("childDetail.profileTitle")}</h3>
        <p className="muted" style={{ marginTop: "-0.25rem" }}>
          {t("childDetail.profileLead")}{" "}
          <Link to={`/child-app/${childId}`} target="_blank" rel="noreferrer">
            {t("childDetail.childLink")}
          </Link>
        </p>
        <div className="form-row">
          <label>{t("childDetail.profile.name")}</label>
          <input value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>{t("childDetail.profile.grade")}</label>
          <input value={profileForm.grade} onChange={(e) => setProfileForm((f) => ({ ...f, grade: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>{t("childDetail.profile.school")}</label>
          <input value={profileForm.school} onChange={(e) => setProfileForm((f) => ({ ...f, school: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>{t("childDetail.profile.subjects")}</label>
          <input
            value={profileForm.subjectsText}
            onChange={(e) => setProfileForm((f) => ({ ...f, subjectsText: e.target.value }))}
            placeholder={t("childDetail.profile.subjectsPh")}
          />
        </div>
        <div className="form-row">
          <label>{t("childDetail.profile.interests")}</label>
          <input
            value={profileForm.interestsText}
            onChange={(e) => setProfileForm((f) => ({ ...f, interestsText: e.target.value }))}
            placeholder={t("childDetail.profile.interestsPh")}
          />
        </div>
        <div className="form-row">
          <label>{t("childDetail.profile.notes")}</label>
          <textarea rows={3} value={profileForm.parentNotes} onChange={(e) => setProfileForm((f) => ({ ...f, parentNotes: e.target.value }))} />
        </div>
        <button type="button" onClick={saveProfile} disabled={!profileForm.name || !profileForm.grade}>
          {t("childDetail.profile.save")}
        </button>
        {!profile && <p className="muted">{t("childDetail.profile.hint")}</p>}
      </div>

      <div className="card">
        <h3>{t("childDetail.goalsTitle")}</h3>
        <div className="form-row">
          <label>{t("childDetail.goal.title")}</label>
          <input value={goalForm.title} onChange={(e) => setGoalForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>{t("childDetail.goal.type")}</label>
          <select value={goalForm.type} onChange={(e) => setGoalForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="学期目标">{t("childDetail.goal.preset.term")}</option>
            <option value="年度目标">{t("childDetail.goal.preset.year")}</option>
            <option value="学科">{t("childDetail.goal.preset.subject")}</option>
            <option value="兴趣">{t("childDetail.goal.preset.interest")}</option>
            <option value="综合">{t("childDetail.goal.preset.general")}</option>
          </select>
        </div>
        <div className="form-row">
          <label>{t("childDetail.goal.deadline")}</label>
          <input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm((f) => ({ ...f, deadline: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>{t("childDetail.goal.progress0_100")}</label>
          <input
            type="number"
            min={0}
            max={100}
            value={goalForm.progress}
            onChange={(e) => setGoalForm((f) => ({ ...f, progress: Number(e.target.value) }))}
          />
        </div>
        <button type="button" onClick={addGoal} disabled={!goalForm.title}>
          {t("childDetail.goal.add")}
        </button>
        <table style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>{t("childDetail.goal.table.goal")}</th>
              <th>{t("childDetail.goal.table.progress")}</th>
              <th>{t("childDetail.goal.table.deadline")}</th>
              <th>{t("childDetail.goal.table.aiDraft")}</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g.goalId}>
                <td>{g.title}</td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={g.progress}
                    style={{ maxWidth: "110px" }}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setGoals((prev) => prev.map((x) => (x.goalId === g.goalId ? { ...x, progress: v } : x)));
                    }}
                    onBlur={(e) => updateGoalProgress(g.goalId, Number(e.target.value))}
                  />
                  %
                </td>
                <td>{g.deadline}</td>
                <td>
                  <button type="button" className="secondary" onClick={() => draftFromGoal(g.goalId)}>
                    {t("childDetail.goal.aiApply")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>{t("childDetail.tasksTitle")}</h3>
        <div className="form-row" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ margin: 0 }}>{t("childDetail.tasks.view")}</label>
          <select value={taskView} onChange={(e) => setTaskView(e.target.value as "all" | "week")}>
            <option value="all">{t("childDetail.tasks.view.all")}</option>
            <option value="week">{t("childDetail.tasks.view.week", { start: weekRange.start, end: weekRange.end })}</option>
          </select>
        </div>
        <div className="form-row">
          <label>{t("childDetail.tasks.title")}</label>
          <input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>{t("childDetail.tasks.date")}</label>
          <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))} />
        </div>
        <button type="button" onClick={addTask} disabled={!taskForm.title}>
          {t("childDetail.tasks.add")}
        </button>
        <table style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>{t("childDetail.tasks.table.task")}</th>
              <th>{t("childDetail.tasks.table.date")}</th>
              <th>{t("childDetail.tasks.table.status")}</th>
              <th>{t("childDetail.tasks.table.source")}</th>
              <th>{t("childDetail.tasks.table.check")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tasksShown.map((task) => (
              <tr key={task.taskId}>
                <td>{task.title}</td>
                <td>{task.dueDate}</td>
                <td>{task.status}</td>
                <td>{task.source}</td>
                <td>
                  <button type="button" className="secondary" onClick={() => toggleTask(task)}>
                    {task.status === "completed" ? t("childDetail.tasks.markUndone") : t("childDetail.tasks.done")}
                  </button>
                </td>
                <td>
                  <button type="button" className="secondary" onClick={() => deleteTask(task)}>
                    {t("childDetail.tasks.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>{t("childDetail.logsTitle")}</h3>
        <div className="form-row">
          <label>{t("childDetail.logs.type")}</label>
          <select value={logForm.type} onChange={(e) => setLogForm((f) => ({ ...f, type: e.target.value as typeof f.type }))}>
            <option value="score">{t("childDetail.logs.type.score")}</option>
            <option value="feedback">{t("childDetail.logs.type.feedback")}</option>
            <option value="note">{t("childDetail.logs.type.note")}</option>
            <option value="event">{t("childDetail.logs.type.event")}</option>
          </select>
        </div>
        <div className="form-row">
          <label>{logForm.type === "event" ? t("childDetail.logs.eventTitle") : t("childDetail.logs.subject")}</label>
          <input value={logForm.subject} onChange={(e) => setLogForm((f) => ({ ...f, subject: e.target.value }))} />
        </div>
        {logForm.type === "score" ? (
          <div className="form-row">
            <label>{t("childDetail.logs.score")}</label>
            <input value={logForm.score} onChange={(e) => setLogForm((f) => ({ ...f, score: e.target.value }))} />
          </div>
        ) : (
          <div className="form-row">
            <label>{logForm.type === "event" ? t("childDetail.logs.details") : t("childDetail.logs.content")}</label>
            <textarea rows={3} value={logForm.content} onChange={(e) => setLogForm((f) => ({ ...f, content: e.target.value }))} />
          </div>
        )}
        <div className="form-row">
          <label>{t("childDetail.logs.date")}</label>
          <input type="date" value={logForm.loggedAt} onChange={(e) => setLogForm((f) => ({ ...f, loggedAt: e.target.value }))} />
        </div>
        <button type="button" onClick={addLog}>
          {t("childDetail.logs.save")}
        </button>
        <table style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>{t("childDetail.logs.table.type")}</th>
              <th>{t("childDetail.logs.table.subject")}</th>
              <th>{t("childDetail.logs.table.value")}</th>
              <th>{t("childDetail.logs.table.date")}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.logId}>
                <td>{l.type}</td>
                <td>{l.subject}</td>
                <td>{l.valueJson ?? l.content ?? t("common.dash")}</td>
                <td>{l.loggedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>{t("childDetail.risksTitle")}</h3>
        <p className="muted" style={{ marginTop: "-0.25rem" }}>
          {t("childDetail.risks.lead")}
        </p>
        <div className="form-row" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", margin: 0 }}>
            <input type="checkbox" checked={showRiskHistory} onChange={(e) => setShowRiskHistory(e.target.checked)} />
            {t("childDetail.risks.toggleHistory")}
          </label>
        </div>
        <table>
          <thead>
            <tr>
              <th>{t("childDetail.risks.table.level")}</th>
              <th>{t("childDetail.risks.table.detail")}</th>
              <th>{t("childDetail.risks.table.rule")}</th>
              <th>{t("childDetail.risks.table.status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {risks.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  {showRiskHistory ? t("childDetail.risks.empty.all") : t("childDetail.risks.empty.open")}
                </td>
              </tr>
            ) : (
              risks.map((r) => (
                <tr key={r.riskId}>
                  <td>
                    <span className={`tag ${r.level}`}>{r.level}</span>
                  </td>
                  <td>{r.detail ?? t("common.dash")}</td>
                  <td className="muted">{r.triggerRule}</td>
                  <td className="muted">{r.resolvedAt ? t("childDetail.risks.status.resolved") : t("childDetail.risks.status.open")}</td>
                  <td>
                    {!r.resolvedAt && (
                      <button type="button" className="secondary" onClick={() => resolveRisk(r.riskId)}>
                        {t("childDetail.risks.resolve")}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
