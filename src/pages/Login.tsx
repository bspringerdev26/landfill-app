// src/pages/Login.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { signInWithCustomToken } from "firebase/auth";

import { auth, functions } from "../services/firebase";
import type { Role } from "../types";
import { normalizePin } from "../services/employees";
import { startSession } from "../services/session";

type LoginEmployee = {
  id: string;
  name: string;
  role: Role;
  isActive: true;
};

type ListEmployeesResult = { employees: LoginEmployee[] };
type LoginWithPinResult = {
  token: string;
  user: { employeeId: string; name: string; role: Role };
};

function routeForRole(role: Role) {
  if (role === "admin" || role === "owner") return "/admin";
  if (role === "dispatch") return "/dispatch";
  return "/driver";
}

function toErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<LoginEmployee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [message, setMessage] = useState("");

  const sorted = useMemo(
    () => [...employees].sort((a, b) => a.name.localeCompare(b.name)),
    [employees]
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      setMessage("");
      try {
        const fn = httpsCallable<unknown, ListEmployeesResult>(
          functions,
          "listEmployeesForLogin"
        );
        const res = await fn();
        const list = res.data?.employees ?? [];
        setEmployees(list);

        // pick first employee by default to keep it fast
        if (list.length && !employeeId) setEmployeeId(list[0].id);
      } catch (err) {
        setMessage(`Failed to load employees: ${toErrorMessage(err)}`);
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin() {
    setMessage("");

    if (!employeeId) {
      setMessage("Pick your name.");
      return;
    }

    const cleaned = normalizePin(pin);
    if (cleaned.length !== 4) {
      setMessage("PIN must be exactly 4 digits.");
      return;
    }

    try {
      setLoading(true);

      // 1) Call Cloud Function to validate PIN + return custom token
      const loginFn = httpsCallable<
        { employeeId: string; pin: string },
        LoginWithPinResult
      >(functions, "loginWithPin");

      const res = await loginFn({ employeeId, pin: cleaned });
      const token = res.data.token;
      const user = res.data.user;

      // 2) Sign into Firebase Auth with the custom token
      await signInWithCustomToken(auth, token);

      // 3) Store local session for routing/UI
      startSession({
        employeeId: user.employeeId,
        name: user.name,
        role: user.role,
        startedAt: new Date().toISOString(),
      });

      // 4) Go to the right view
      navigate(routeForRole(user.role), { replace: true });
    } catch (err) {
      setMessage(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginBottom: 8, marginTop: 0 }}>Landfill Login</h2>
      <div style={{ opacity: 0.75, marginBottom: 14 }}>
        Select your name and enter your 4-digit PIN.
      </div>

      <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
        Employee
      </label>
      <select
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        disabled={loading}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ccc",
          marginBottom: 12,
          fontSize: 16,
        }}
      >
        {sorted.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name} ({e.id})
          </option>
        ))}
      </select>

      <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
        PIN
      </label>
      <input
        type="password"
        inputMode="numeric"
        placeholder="0000"
        value={pin}
        disabled={loading}
        onChange={(e) => setPin(normalizePin(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleLogin();
        }}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ccc",
          marginBottom: 12,
          fontSize: 16,
        }}
      />

      <button
        onClick={handleLogin}
        disabled={loading || !employees.length}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: 0,
          cursor: "pointer",
          fontSize: 16,
          fontWeight: 800,
        }}
      >
        {loading ? "Loading…" : "Login"}
      </button>

      {message && (
        <div style={{ marginTop: 12, color: "crimson", fontWeight: 700 }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
        Security note: PIN verification is server-side via Cloud Functions.
      </div>
    </div>
  );
}
