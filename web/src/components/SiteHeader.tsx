import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FAMILY_KEY } from "../api";
import { useI18n } from "../i18n/i18n";

export function SiteHeader() {
  const { pathname } = useLocation();
  const { lang, toggleLang, t } = useI18n();
  const [familyId, setFamilyId] = useState<string | null>(() =>
    typeof localStorage !== "undefined" ? localStorage.getItem(FAMILY_KEY) : null,
  );

  useEffect(() => {
    setFamilyId(localStorage.getItem(FAMILY_KEY));
  }, [pathname]);

  const isLanding = pathname === "/";

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <NavLink to="/" className="site-logo">
          {t("app.name")}
        </NavLink>
        <nav className="site-nav" aria-label="Primary navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => {
              localStorage.removeItem(FAMILY_KEY);
              setFamilyId(null);
            }}
          >
            {t("nav.home")}
          </NavLink>
          {familyId && (
            <>
              <NavLink to="/workspace" className={({ isActive }) => (isActive ? "active" : "")}>
                {t("nav.workspace")}
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                {t("nav.dashboard")}
              </NavLink>
              <NavLink to="/children" className={({ isActive }) => (isActive ? "active" : "")}>
                {t("nav.children")}
              </NavLink>
            </>
          )}
          {isLanding && (
            <>
              <a href="#features">{t("nav.features")}</a>
              <a href="#testimonials">{t("nav.testimonials")}</a>
              <NavLink to="/workspace" className="nav-anchor-cta">
                {t("nav.start")}
              </NavLink>
            </>
          )}
          <button
            type="button"
            className="lang-toggle"
            onClick={toggleLang}
            aria-label="Toggle language"
            title="Toggle language"
          >
            {lang === "zh" ? t("nav.lang.en") : t("nav.lang.zh")}
          </button>
        </nav>
      </div>
    </header>
  );
}
