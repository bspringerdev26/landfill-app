import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminEmployees from "./pages/AdminEmployees";
import DriverView from "./pages/DriverView";
import { getSession } from "./services/session";

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: 24 }}>
      <h2>{title}</h2>
      <p>Placeholder view. We’ll build this next.</p>
    </div>
  );
}

function RequireRole({
  allowed,
  children,
}: {
  allowed: Array<"admin" | "dispatch" | "driver">;
  children: React.ReactNode;
}) {
  const session = getSession();
  if (!session) return <Navigate to="/" replace />;

  if (!allowed.includes(session.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/admin"
          element={
            <RequireRole allowed={["admin"]}>
              <AdminEmployees />
            </RequireRole>
          }
        />

        <Route
          path="/driver"
          element={
            <RequireRole allowed={["driver"]}>
              <DriverView />
            </RequireRole>
          }
        />

        <Route
          path="/dispatch"
          element={
            <RequireRole allowed={["dispatch"]}>
              <Placeholder title="Dispatch View" />
            </RequireRole>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
