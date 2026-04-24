import { useEffect, useState } from "react";
import { apiGet, FAMILY_KEY } from "../api";

type Dash = {
  todayFocus: { childName: string; title: string; dueDate: string }[];
  riskRank: { childName: string; level: string; detail: string | null }[];
  weekCompletion: { childName: string; rate: number; completed: number; total: number }[];
  children: { childId: string; name: string; grade: string }[];
};

export function Dashboard() {
  const familyId = localStorage.getItem(FAMILY_KEY)!;
  const [data, setData] = useState<Dash | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Dash>(`/api/families/${familyId}/dashboard`)
      .then(setData)
      .catch((e: Error) => setErr(e.message));
  }, [familyId]);

  if (err) return <p className="error">{err}</p>;
  if (!data) return <p className="muted">加载中…</p>;

  return (
    <div>
      <h1 className="page-title">家庭看板</h1>
      <p className="page-lead">今日重点 · 风险排序 · 本周完成率。只展示可行动信息，帮你快速做决定。</p>

      <div className="grid2">
        <div className="card">
          <h3>今日重点</h3>
          {data.todayFocus.length === 0 ? (
            <p className="muted">暂无到期任务。</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>孩子</th>
                  <th>任务</th>
                  <th>日期</th>
                </tr>
              </thead>
              <tbody>
                {data.todayFocus.map((t, i) => (
                  <tr key={i}>
                    <td>{t.childName}</td>
                    <td>{t.title}</td>
                    <td>{t.dueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>风险信号</h3>
          {data.riskRank.length === 0 ? (
            <p className="muted">暂无未处理风险。</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>等级</th>
                  <th>孩子</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                {data.riskRank.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`tag ${r.level}`}>{r.level}</span>
                    </td>
                    <td>{r.childName}</td>
                    <td>{r.detail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h3>本周任务完成率</h3>
        <table>
          <thead>
            <tr>
              <th>孩子</th>
              <th>完成 / 总计</th>
              <th>比率</th>
            </tr>
          </thead>
          <tbody>
            {data.weekCompletion.map((w) => (
              <tr key={w.childName}>
                <td>{w.childName}</td>
                <td>
                  {w.completed} / {w.total}
                </td>
                <td>{(w.rate * 100).toFixed(0)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>孩子一览</h3>
        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
          {data.children.map((c) => (
            <li key={c.childId}>
              {c.name} · {c.grade}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
