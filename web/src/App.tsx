import type { ReactNode } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { FAMILY_KEY } from "./api";
import { SiteHeader } from "./components/SiteHeader";
import { HomePage } from "./pages/HomePage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { Dashboard } from "./pages/Dashboard";
import { ChildrenPage } from "./pages/ChildrenPage";
import { ChildDetailPage } from "./pages/ChildDetailPage";
import { ChildAppPage } from "./pages/ChildAppPage";

function ShellLayout() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <div className="app-shell">
      <SiteHeader />
      {isLanding ? <Outlet /> : (
        <div className="page-inner">
          <Outlet />
        </div>
      )}
    </div>
  );
}

function RequireFamily({ children }: { children: ReactNode }) {
  const id = localStorage.getItem(FAMILY_KEY);
  if (!id) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/child-app/:childId" element={<ChildAppPage />} />

      <Route element={<ShellLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route
          path="/dashboard"
          element={
            <RequireFamily>
              <Dashboard />
            </RequireFamily>
          }
        />
        <Route
          path="/children"
          element={
            <RequireFamily>
              <ChildrenPage />
            </RequireFamily>
          }
        />
        <Route
          path="/children/:childId"
          element={
            <RequireFamily>
              <ChildDetailPage />
            </RequireFamily>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
