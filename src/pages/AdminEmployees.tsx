// src/pages/AdminEmployees.tsx
import { useEffect, useMemo, useState } from "react";
import type { Role } from "../types";
import {
  adminCreateEmployee,
  listEmployeesForLogin,
  normalizePin,
  setEmployeePin,
} from "../services/employees";

function sanitizeEmployeeId(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")       // remove spaces
    .replace(/[^a-z0-9]/g, ""); // keep only letters/numbers
}

type EmployeeRow = {
  id: string;
  name: string;
  role: Role;
};

function toErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export default function AdminEmployees() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [message, setMessage] = useState<string>("");

  // Create employee form
  const [newId, setNewId] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Role>("driver");

  // Set PIN form
  const [pinEmployeeId, setPinEmployeeId] = useState("");
  const [pinValue, setPinValue] = useState("");

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }, [rows]);

  async function refresh() {
    setLoading(true);
    setMessage("");
    try {
      const list = await listEmployeesForLogin();
      setRows(list.map((e) => ({ id: e.id, name: e.name, role: e.role })));
      if (!pinEmployeeId && list.length) setPinEmployeeId(list[0].id);
    } catch {
      setMessage("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateEmployee() {
    setMessage("");

    const id = sanitizeEmployeeId(newId);
    const name = newName.trim();

    if (!id) {
      setMessage("Employee ID is required (letters/numbers only).");
      return;
    }
    if (!name) {
      setMessage("Employee name is required.");
      return;
    }

    try {
      await adminCreateEmployee({ id, name, role: newRole });
      setMessage(`Created employee: ${name} (${id})`);
      setNewId("");
      setNewName("");
      await refresh();
    } catch (err: unknown) {
  setMessage(toErrorMessage(err) || "Failed to create employee.");
}

  }

  async function handleSetPin() {
    setMessage("");

    if (!pinEmployeeId) {
      setMessage("Select an employee first.");
      return;
    }

    const cleaned = normalizePin(pinValue);
    if (cleaned.length !== 4) {
      setMessage("PIN must be exactly 4 digits.");
      return;
    }

    try {
      await setEmployeePin(pinEmployeeId, cleaned);
      setMessage("PIN updated.");
      setPinValue("");
      await refresh();
    } catch (err: unknown) {
  setMessage(toErrorMessage(err) || "Failed to set PIN.");
}

  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Admin: Employees</h2>
      <p style={{ opacity: 0.75, marginTop: 6 }}>
        Create employees and set their 4-digit PINs.
      </p>

      {/* Create Employee */}
      <div style={{ marginTop: 18, padding: 16, border: "1px solid #ccc", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Create Employee</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 160px", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Employee ID
            </label>
            <input
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="e.g. bspringer"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
              Saved as: <b>{sanitizeEmployeeId(newId) || "—"}</b>
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Name
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Brian Springer"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            >
              <option value="driver">Driver</option>
              <option value="dispatch">Dispatch</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCreateEmployee}
          disabled={loading}
          style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 10,
            border: 0,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Create Employee
        </button>
      </div>

      {/* Set PIN */}
      <div style={{ marginTop: 18, padding: 16, border: "1px solid #ccc", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Set / Change PIN</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              Employee
            </label>
            <select
              value={pinEmployeeId}
              onChange={(e) => setPinEmployeeId(e.target.value)}
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            >
              {sortedRows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.id}) - {r.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 700, display: "block", marginBottom: 6 }}>
              PIN (4 digits)
            </label>
            <input
              value={pinValue}
              onChange={(e) => setPinValue(normalizePin(e.target.value))}
              inputMode="numeric"
              placeholder="0000"
              style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
            />
          </div>
        </div>

        <button
          onClick={handleSetPin}
          disabled={loading || !rows.length}
          style={{
            marginTop: 14,
            padding: "10px 14px",
            borderRadius: 10,
            border: 0,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Save PIN
        </button>
      </div>

      {message && (
        <div style={{ marginTop: 14, fontWeight: 700 }}>
          {message}
        </div>
      )}

      {/* Employee List */}
      <div style={{ marginTop: 18, padding: 16, border: "1px solid #ccc", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Active Employees</h3>

        {loading ? (
          <div>Loading…</div>
        ) : rows.length ? (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {sortedRows.map((r) => (
              <li key={r.id}>
                <b>{r.name}</b> ({r.id}) – {r.role}
              </li>
            ))}
          </ul>
        ) : (
          <div>No employees yet.</div>
        )}
      </div>
    </div>
  );
}
