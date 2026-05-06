import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet, apiSend, FAMILY_KEY } from "../api";
import { currentWeekRangeLocal, localDateKey } from "../lib/dataRange";

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
            subject: logForm.subject || (logForm.type === "event" ? "重要事件" : "综合"),
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

  const deleteTask = async (t: Task) => {
    const ok = window.confirm(`确定删除任务「${t.title}」吗？此操作不可恢复。`);
    if (!ok) return;
    await apiSend(`/api/tasks/${t.taskId}`, "DELETE");
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
        ← 返回孩子列表
      </Link>
      <h1 className="page-title">孩子工作台</h1>
      <p className="page-lead">目标 → 任务 → 成长记录，形成完整执行与反馈闭环。</p>

      <div className="card">
        <h3>孩子档案</h3>
        <p className="muted" style={{ marginTop: "-0.25rem" }}>
          管理对象是谁：基础信息、学校、科目与兴趣、家长备注。孩子轻量端：{" "}
          <Link to={`/child-app/${childId}`} target="_blank" rel="noreferrer">
            打开今日任务（孩子端）
          </Link>
        </p>
        <div className="form-row">
          <label>姓名</label>
          <input value={profileForm.name} onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>年级</label>
          <input value={profileForm.grade} onChange={(e) => setProfileForm((f) => ({ ...f, grade: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>学校</label>
          <input value={profileForm.school} onChange={(e) => setProfileForm((f) => ({ ...f, school: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>科目（用逗号分隔）</label>
          <input
            value={profileForm.subjectsText}
            onChange={(e) => setProfileForm((f) => ({ ...f, subjectsText: e.target.value }))}
            placeholder="数学, 语文, 英语"
          />
        </div>
        <div className="form-row">
          <label>兴趣（用逗号分隔）</label>
          <input
            value={profileForm.interestsText}
            onChange={(e) => setProfileForm((f) => ({ ...f, interestsText: e.target.value }))}
            placeholder="钢琴, 游泳"
          />
        </div>
        <div className="form-row">
          <label>家长备注</label>
          <textarea rows={3} value={profileForm.parentNotes} onChange={(e) => setProfileForm((f) => ({ ...f, parentNotes: e.target.value }))} />
        </div>
        <button type="button" onClick={saveProfile} disabled={!profileForm.name || !profileForm.grade}>
          保存档案
        </button>
        {!profile && <p className="muted">提示：若档案加载失败，请从「孩子档案」重新进入。</p>}
      </div>

      <div className="card">
        <h3>长期目标</h3>
        <div className="form-row">
          <label>标题</label>
          <input value={goalForm.title} onChange={(e) => setGoalForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>类型</label>
          <select value={goalForm.type} onChange={(e) => setGoalForm((f) => ({ ...f, type: e.target.value }))}>
            <option value="学期目标">学期目标</option>
            <option value="年度目标">年度目标</option>
            <option value="学科">学科</option>
            <option value="兴趣">兴趣</option>
            <option value="综合">综合</option>
          </select>
        </div>
        <div className="form-row">
          <label>截止日期</label>
          <input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm((f) => ({ ...f, deadline: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>初始进度（0–100）</label>
          <input
            type="number"
            min={0}
            max={100}
            value={goalForm.progress}
            onChange={(e) => setGoalForm((f) => ({ ...f, progress: Number(e.target.value) }))}
          />
        </div>
        <button type="button" onClick={addGoal} disabled={!goalForm.title}>
          添加目标
        </button>
        <table style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>目标</th>
              <th>进度</th>
              <th>截止</th>
              <th>AI 草稿任务</th>
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
                    生成并落库
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>任务</h3>
        <div className="form-row" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ margin: 0 }}>视图</label>
          <select value={taskView} onChange={(e) => setTaskView(e.target.value as "all" | "week")}>
            <option value="all">全部</option>
            <option value="week">本周（{weekRange.start} ~ {weekRange.end}）</option>
          </select>
        </div>
        <div className="form-row">
          <label>标题</label>
          <input value={taskForm.title} onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>日期</label>
          <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))} />
        </div>
        <button type="button" onClick={addTask} disabled={!taskForm.title}>
          添加任务
        </button>
        <table style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>任务</th>
              <th>日期</th>
              <th>状态</th>
              <th>来源</th>
              <th>打卡</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tasksShown.map((t) => (
              <tr key={t.taskId}>
                <td>{t.title}</td>
                <td>{t.dueDate}</td>
                <td>{t.status}</td>
                <td>{t.source}</td>
                <td>
                  <button type="button" className="secondary" onClick={() => toggleTask(t)}>
                    {t.status === "completed" ? "标为未完成" : "完成"}
                  </button>
                </td>
                <td>
                  <button type="button" className="secondary" onClick={() => deleteTask(t)}>
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>成长记录</h3>
        <div className="form-row">
          <label>类型</label>
          <select value={logForm.type} onChange={(e) => setLogForm((f) => ({ ...f, type: e.target.value as typeof f.type }))}>
            <option value="score">成绩</option>
            <option value="feedback">老师反馈</option>
            <option value="note">观察笔记</option>
            <option value="event">重要事件（考试/比赛等）</option>
          </select>
        </div>
        <div className="form-row">
          <label>{logForm.type === "event" ? "事件标题" : "科目"}</label>
          <input value={logForm.subject} onChange={(e) => setLogForm((f) => ({ ...f, subject: e.target.value }))} />
        </div>
        {logForm.type === "score" ? (
          <div className="form-row">
            <label>分数</label>
            <input value={logForm.score} onChange={(e) => setLogForm((f) => ({ ...f, score: e.target.value }))} />
          </div>
        ) : (
          <div className="form-row">
            <label>{logForm.type === "event" ? "详情" : "内容"}</label>
            <textarea rows={3} value={logForm.content} onChange={(e) => setLogForm((f) => ({ ...f, content: e.target.value }))} />
          </div>
        )}
        <div className="form-row">
          <label>日期</label>
          <input type="date" value={logForm.loggedAt} onChange={(e) => setLogForm((f) => ({ ...f, loggedAt: e.target.value }))} />
        </div>
        <button type="button" onClick={addLog}>
          保存记录
        </button>
        <table style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>类型</th>
              <th>科目</th>
              <th>内容/分数</th>
              <th>日期</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.logId}>
                <td>{l.type}</td>
                <td>{l.subject}</td>
                <td>{l.valueJson ?? l.content ?? "—"}</td>
                <td>{l.loggedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>风险提醒</h3>
        <p className="muted" style={{ marginTop: "-0.25rem" }}>
          默认只显示<strong>待处理</strong>。处理后会在列表中消失；需要查看历史可打开开关。
        </p>
        <div className="form-row" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", margin: 0 }}>
            <input type="checkbox" checked={showRiskHistory} onChange={(e) => setShowRiskHistory(e.target.checked)} />
            显示已处理记录
          </label>
        </div>
        <table>
          <thead>
            <tr>
              <th>等级</th>
              <th>说明</th>
              <th>规则</th>
              <th>状态</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {risks.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  {showRiskHistory ? "暂无记录。" : "暂无待处理风险。"}
                </td>
              </tr>
            ) : (
              risks.map((r) => (
                <tr key={r.riskId}>
                  <td>
                    <span className={`tag ${r.level}`}>{r.level}</span>
                  </td>
                  <td>{r.detail ?? "—"}</td>
                  <td className="muted">{r.triggerRule}</td>
                  <td className="muted">{r.resolvedAt ? "已处理" : "待处理"}</td>
                  <td>
                    {!r.resolvedAt && (
                      <button type="button" className="secondary" onClick={() => resolveRisk(r.riskId)}>
                        标记已处理
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
