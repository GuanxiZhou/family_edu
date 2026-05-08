import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiSend, FAMILY_KEY } from "../api";
import { useI18n } from "../i18n/i18n";

type Child = {
  childId: string;
  name: string;
  grade: string;
  subjects: string[];
};

export function ChildrenPage() {
  const { t } = useI18n();
  const familyId = localStorage.getItem(FAMILY_KEY)!;
  const [children, setChildren] = useState<Child[]>([]);
  const [form, setForm] = useState({ name: "", grade: "" });
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    apiGet<{ children: Child[] }>(`/api/families/${familyId}`)
      .then((d) =>
        setChildren(
          d.children.map((c) => ({
            childId: c.childId,
            name: c.name,
            grade: c.grade,
            subjects: c.subjects,
          })),
        ),
      )
      .catch((e: Error) => setErr(e.message));
  };

  useEffect(() => {
    load();
  }, [familyId]);

  const add = async () => {
    setErr(null);
    try {
      await apiSend(`/api/families/${familyId}/children`, "POST", {
        name: form.name,
        grade: form.grade,
        subjects: [],
        interests: [],
      });
      setForm({ name: "", grade: "" });
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div>
      <h1 className="page-title">{t("children.title")}</h1>
      <p className="page-lead">{t("children.lead")}</p>
      {err && <p className="error">{err}</p>}
      <div className="card">
        <h3>{t("children.add")}</h3>
        <div className="form-row">
          <label>{t("children.name")}</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>{t("children.grade")}</label>
          <input value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} />
        </div>
        <button type="button" onClick={add} disabled={!form.name || !form.grade}>
          {t("children.addBtn")}
        </button>
      </div>

      <div className="card">
        <h3>{t("children.list")}</h3>
        <table>
          <thead>
            <tr>
              <th>{t("children.name")}</th>
              <th>{t("children.grade")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {children.map((c) => (
              <tr key={c.childId}>
                <td>{c.name}</td>
                <td>{c.grade}</td>
                <td>
                  <Link to={`/children/${c.childId}`}>{t("children.manage")}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
