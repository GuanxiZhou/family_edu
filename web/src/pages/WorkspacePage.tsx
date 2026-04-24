import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiSend, FAMILY_KEY } from "../api";

type FamilyRow = { familyId: string; name: string };

export function WorkspacePage() {
  const nav = useNavigate();
  const [list, setList] = useState<FamilyRow[]>([]);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const load = () => {
    apiGet<{ families: FamilyRow[] }>("/api/families")
      .then((d) => setList(d.families))
      .catch((e: Error) => setErr(e.message));
  };

  useEffect(() => {
    load();
  }, []);

  const choose = (id: string) => {
    localStorage.setItem(FAMILY_KEY, id);
    nav("/dashboard");
  };

  const create = async () => {
    setErr(null);
    try {
      const { family } = await apiSend<{ family: FamilyRow }>("/api/families", "POST", { name: name || "我的家庭" });
      setName("");
      choose(family.familyId);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const removeFamily = async (family: FamilyRow) => {
    setErr(null);
    const ok = window.confirm(`确定删除家庭「${family.name}」吗？\n\n这会删除该家庭下的孩子、目标、任务、成长记录与风险提醒，且不可恢复。`);
    if (!ok) return;
    try {
      await apiSend(`/api/families/${family.familyId}`, "DELETE");
      const current = localStorage.getItem(FAMILY_KEY);
      if (current === family.familyId) localStorage.removeItem(FAMILY_KEY);
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div>
      <h1 className="page-title">创建/选择家庭</h1>
      <p className="page-lead">这是你的家庭工作空间入口。选中后会进入「家庭看板」。</p>

      {err && <p className="error">{err}</p>}

      <div className="grid2">
        <div className="card">
          <h3>已有家庭</h3>
          {list.length === 0 ? (
            <p className="muted">暂无家庭，可在右侧新建。</p>
          ) : (
            <ul className="family-list">
              {list.map((f) => (
                <li key={f.familyId}>
                  <div className="family-row">
                    <button type="button" className="btn btn-primary family-enter" onClick={() => choose(f.familyId)}>
                      进入 {f.name}
                    </button>
                    <button type="button" className="btn btn-secondary family-delete" onClick={() => removeFamily(f)}>
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>新建家庭</h3>
          <div className="form-row">
            <label htmlFor="fname">家庭名称</label>
            <input id="fname" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：张家" />
          </div>
          <button type="button" className="btn btn-secondary" onClick={create}>
            创建并进入看板
          </button>
        </div>
      </div>
    </div>
  );
}

