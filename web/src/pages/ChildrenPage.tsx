import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet, apiSend, FAMILY_KEY } from "../api";

type Child = {
  childId: string;
  name: string;
  grade: string;
  subjects: string[];
};

export function ChildrenPage() {
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
      <h1 className="page-title">孩子档案</h1>
      <p className="page-lead">每个孩子独立档案；点「管理」进入目标、任务与成长记录。</p>
      {err && <p className="error">{err}</p>}
      <div className="card">
        <h3>新增孩子</h3>
        <div className="form-row">
          <label>姓名</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-row">
          <label>年级</label>
          <input value={form.grade} onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))} />
        </div>
        <button type="button" onClick={add} disabled={!form.name || !form.grade}>
          添加
        </button>
      </div>

      <div className="card">
        <h3>列表</h3>
        <table>
          <thead>
            <tr>
              <th>姓名</th>
              <th>年级</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {children.map((c) => (
              <tr key={c.childId}>
                <td>{c.name}</td>
                <td>{c.grade}</td>
                <td>
                  <Link to={`/children/${c.childId}`}>管理</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
