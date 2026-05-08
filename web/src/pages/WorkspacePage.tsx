import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiSend, FAMILY_KEY } from "../api";
import { useI18n } from "../i18n/i18n";

type FamilyRow = { familyId: string; name: string };

export function WorkspacePage() {
  const nav = useNavigate();
  const { t } = useI18n();
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
      const { family } = await apiSend<{ family: FamilyRow }>("/api/families", "POST", { name: name || t("workspace.defaultName") });
      setName("");
      choose(family.familyId);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const removeFamily = async (family: FamilyRow) => {
    setErr(null);
    const ok = window.confirm(t("workspace.confirmDelete", { name: family.name }));
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
      <h1 className="page-title">{t("workspace.title")}</h1>
      <p className="page-lead">{t("workspace.lead")}</p>

      {err && <p className="error">{err}</p>}

      <div className="grid2">
        <div className="card">
          <h3>{t("workspace.existing")}</h3>
          {list.length === 0 ? (
            <p className="muted">{t("workspace.none")}</p>
          ) : (
            <ul className="family-list">
              {list.map((f) => (
                <li key={f.familyId}>
                  <div className="family-row">
                    <button type="button" className="btn btn-primary family-enter" onClick={() => choose(f.familyId)}>
                      {t("workspace.enter")} {f.name}
                    </button>
                    <button type="button" className="btn btn-secondary family-delete" onClick={() => removeFamily(f)}>
                      {t("workspace.delete")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>{t("workspace.new")}</h3>
          <div className="form-row">
            <label htmlFor="fname">{t("workspace.familyName")}</label>
            <input id="fname" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("workspace.familyNamePh")} />
          </div>
          <button type="button" className="btn btn-secondary" onClick={create}>
            {t("workspace.createAndEnter")}
          </button>
        </div>
      </div>
    </div>
  );
}

