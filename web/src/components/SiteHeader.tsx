import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FAMILY_KEY } from "../api";

export function SiteHeader() {
  const { pathname } = useLocation();
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
          家庭教育管家
        </NavLink>
        <nav className="site-nav" aria-label="主导航">
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
            onClick={() => {
              localStorage.removeItem(FAMILY_KEY);
              setFamilyId(null);
            }}
          >
            主页
          </NavLink>
          {familyId && (
            <>
              <NavLink to="/workspace" className={({ isActive }) => (isActive ? "active" : "")}>
                家庭
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                家庭看板
              </NavLink>
              <NavLink to="/children" className={({ isActive }) => (isActive ? "active" : "")}>
                孩子档案
              </NavLink>
            </>
          )}
          {isLanding && (
            <>
              <a href="#features">功能亮点</a>
              <a href="#testimonials">家长反馈</a>
              <NavLink to="/workspace" className="nav-anchor-cta">
                开始使用
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
