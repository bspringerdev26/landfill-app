// src/App.tsx
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { getSession, isSignedIn } from "./services/session";
import type { Role } from "./types";
import AdminEmployees from "./pages/AdminEmployees";


// Simple placeholder pages for now.
// We'll replace these with real views one-by-one.
function Placeholder({ title }: { title: string }) {
  const session = getSession();
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>

      <div style={{ marginTop: 12, padding: 12, border: "1px solid #ccc", borderRadius: 10 }}>
        <div><b>Signed in:</b> {String(isSignedIn())}</div>
        <div><b>Name:</b> {session?.name ?? "—"}</div>
        <div><b>Role:</b> {session?.role ?? "—"}</div>
        <div><b>Truck:</b> {session?.truckNumber ?? "—"}</div>
        <div><b>Login time:</b> {session?.startedAt ?? "—"}</div>
        <div><b>Logout time:</b> {session?.endedAt ?? "—"}</div>
      </div>

      <p style={{ marginTop: 16, opacity: 0.75 }}>
        This is a placeholder. We’ll build the real view next.
      </p>
    </div>
  );
}

// Route guard: blocks access if not logged in OR wrong role.
function RequireRole({
  allowed,
  children,
}: {
  allowed: Role[];
  children: React.ReactNode;
}) {
  const session = getSession();

  // Not logged in (or session ended)
  if (!session || session.endedAt) {
    return <Navigate to="/" replace />;
  }

  // Wrong role
  if (!allowed.includes(session.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Protected pages */}
        <Route
  path="/admin"
  element={
    <RequireRole allowed={["admin"]}>
      <AdminEmployees />
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

        <Route
          path="/driver"
          element={
            <RequireRole allowed={["driver"]}>
              <Placeholder title="Driver View" />
            </RequireRole>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
