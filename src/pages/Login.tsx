// src/pages/Login.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listEmployeesForLogin, normalizePin, verifyEmployeePin } from "../services/employees";
import { saveSession } from "../services/session";



type Option = {
  id: string;
  name: string;
  role: "admin" | "driver" | "dispatch";
};

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong.";
}

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string>("");

  const selected = useMemo(
    () => options.find((o) => o.id === selectedId) || null,
    [options, selectedId]
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const list = await listEmployeesForLogin();
        if (!alive) return;

        const mapped: Option[] = list.map((e) => ({
          id: e.id,
          name: e.name,
          role: e.role,
        }));

        setOptions(mapped);

        if (mapped.length && !selectedId) {
          setSelectedId(mapped[0].id);
        }
      } catch (err: unknown) {
        if (!alive) return;
        setError(getErrorMessage(err) || "Failed to load employees.");
      }

      if (!alive) return;
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function routeForRole(role: Option["role"]) {
    if (role === "admin") return "/admin";
    if (role === "dispatch") return "/dispatch";
    return "/driver";
  }

  async function handleLogin() {
    setError("");

    if (!selectedId) {
      setError("Pick your name from the dropdown.");
      return;
    }

    const cleanedPin = normalizePin(pin);
    if (cleanedPin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    try {
      const result = await verifyEmployeePin(selectedId, cleanedPin);

      if (!result.ok) {
        setError(result.reason);
        return;
      }

      const emp = result.employee;

      saveSession({
  employeeId: emp.id,
  name: emp.name,
  role: emp.role,
  loginAt: new Date().toISOString(),
});


      navigate(routeForRole(emp.role), { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err) || "Login failed.");
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "56px auto", padding: 16 }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Landfill Pickup App</h1>
      <p style={{ marginTop: 8, opacity: 0.75 }}>
        Select your name, enter your 4-digit PIN, and try not to break anything.
      </p>

      <div style={{ marginTop: 18 }}>
        <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
          Employee
        </label>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        >
          {loading ? (
            <option value="">Loading…</option>
          ) : options.length ? (
            options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name} ({o.id})
              </option>
            ))
          ) : (
            <option value="">No active employees found</option>
          )}
        </select>

        <div style={{ marginTop: 14 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 700 }}>
            PIN
          </label>

          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(normalizePin(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleLogin();
            }}
            placeholder="4-digit PIN"
            style={{
              width: "100%",
              padding: 12,
              borderRadius: 10,
              border: "1px solid #ccc",
              fontSize: 16,
              letterSpacing: 6,
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading || !selected || options.length === 0}
          style={{
            width: "100%",
            marginTop: 16,
            padding: 12,
            borderRadius: 10,
            border: 0,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16,
            fontWeight: 800,
          }}
        >
          Login
        </button>

        {error && (
          <div style={{ marginTop: 12, color: "crimson", fontWeight: 700 }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: 18, fontSize: 12, opacity: 0.7 }}>
          Prototype login only. Real security comes from Firebase rules.
        </div>
      </div>
    </div>
  );
}
