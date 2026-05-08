import { useEffect, useState } from "react";
import { apiGet, FAMILY_KEY } from "../api";
import { useI18n } from "../i18n/i18n";

type Dash = {
  todayFocus: { childName: string; title: string; dueDate: string }[];
  riskRank: { childName: string; level: string; detail: string | null }[];
  weekCompletion: { childName: string; rate: number; completed: number; total: number }[];
  children: { childId: string; name: string; grade: string }[];
};

export function Dashboard() {
  const { t } = useI18n();
  const familyId = localStorage.getItem(FAMILY_KEY)!;
  const [data, setData] = useState<Dash | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Dash>(`/api/families/${familyId}/dashboard`)
      .then(setData)
      .catch((e: Error) => setErr(e.message));
  }, [familyId]);

  if (err) return <p className="error">{err}</p>;
  if (!data) return <p className="muted">{t("common.loading")}</p>;

  return (
    <div>
      <h1 className="page-title">{t("dashboard.title")}</h1>
      <p className="page-lead">{t("dashboard.lead")}</p>

      <div className="grid2">
        <div className="card">
          <h3>{t("dashboard.todayFocus")}</h3>
          {data.todayFocus.length === 0 ? (
            <p className="muted">{t("dashboard.noDue")}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t("dashboard.col.child")}</th>
                  <th>{t("dashboard.col.task")}</th>
                  <th>{t("dashboard.col.date")}</th>
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
          <h3>{t("dashboard.risks")}</h3>
          {data.riskRank.length === 0 ? (
            <p className="muted">{t("dashboard.noRisks")}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t("dashboard.col.level")}</th>
                  <th>{t("dashboard.col.child")}</th>
                  <th>{t("dashboard.col.detail")}</th>
                </tr>
              </thead>
              <tbody>
                {data.riskRank.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`tag ${r.level}`}>{r.level}</span>
                    </td>
                    <td>{r.childName}</td>
                    <td>{r.detail ?? t("common.dash")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h3>{t("dashboard.week")}</h3>
        <table>
          <thead>
            <tr>
              <th>{t("dashboard.col.child")}</th>
              <th>{t("dashboard.col.done")}</th>
              <th>{t("dashboard.col.rate")}</th>
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
        <h3>{t("dashboard.children")}</h3>
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
