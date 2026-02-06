// src/pages/DriverView.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../data/routes";
import { TRUCK_NUMBERS, type TruckNumber } from "../data/trucks";
import type { RouteId } from "../types";
import { getSession, saveSession, clearSession } from "../services/session";

export default function DriverView() {
  const navigate = useNavigate();
  const session = useMemo(() => getSession(), []);
  const [truckNumber, setTruckNumber] = useState<TruckNumber>(() => {
    return (session?.truckNumber as TruckNumber) || TRUCK_NUMBERS[0];
  });
  const [routeId, setRouteId] = useState<RouteId>(() => {
    return (session?.routeId as RouteId) || ROUTES[0].routeId;
  });
  const [message, setMessage] = useState("");

  const shiftReady = Boolean(truckNumber && routeId);
  const shiftActive = Boolean(session?.role === "driver" && session?.truckNumber && session?.routeId);

  function startShift() {
    setMessage("");
    if (!session) {
      setMessage("No session found. Please log in again.");
      navigate("/");
      return;
    }
    if (session.role !== "driver") {
      setMessage("This screen is for drivers only.");
      return;
    }
    if (!shiftReady) {
      setMessage("Pick a truck number and a route.");
      return;
    }

    saveSession({
      ...session,
      truckNumber,
      routeId,
      shiftStartedAt: new Date().toISOString(),
    });
    // reload view state (simple prototype)
    window.location.reload();
  }

  function logout() {
    clearSession();
    navigate("/");
  }

  // Mobile-friendly button style (big hit targets)
  const primaryBtn: React.CSSProperties = {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: 0,
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16,
  };

  const card: React.CSSProperties = {
    padding: 16,
    border: "1px solid #ccc",
    borderRadius: 14,
    marginTop: 14,
  };

  return (
    <div style={{ maxWidth: 560, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Driver</h2>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            Logged in as <b>{session?.name || "Unknown"}</b> ({session?.employeeId || "—"})
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #ccc",
            background: "transparent",
            cursor: "pointer",
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          Logout
        </button>
      </div>

      {!shiftActive ? (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Start Shift</h3>
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 12 }}>
            Pick your truck and route for today. Big buttons, minimal pain.
          </div>

          <label style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>
            Truck Number
          </label>
          <select
            value={truckNumber}
            onChange={(e) => setTruckNumber(e.target.value as TruckNumber)}
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ccc", marginBottom: 12 }}
          >
            {TRUCK_NUMBERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label style={{ fontWeight: 800, display: "block", marginBottom: 6 }}>
            Route
          </label>
          <select
            value={routeId}
            onChange={(e) => setRouteId(e.target.value as RouteId)}
            style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ccc", marginBottom: 12 }}
          >
            {ROUTES.map((r) => (
              <option key={r.routeId} value={r.routeId}>
                {r.label}
              </option>
            ))}
          </select>

          <button onClick={startShift} disabled={!shiftReady} style={primaryBtn}>
            Start Shift
          </button>

          {message && (
            <div style={{ marginTop: 12, fontWeight: 800, color: "crimson" }}>
              {message}
            </div>
          )}
        </div>
      ) : (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Shift Active</h3>
          <div style={{ marginTop: 6 }}>
            Truck: <b>{session?.truckNumber}</b>
          </div>
          <div style={{ marginTop: 6 }}>
            Route: <b>{ROUTES.find((r) => r.routeId === session?.routeId)?.label || session?.routeId}</b>
          </div>
          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
            Next: we build your live queue (Full → Enroute → Serviced) and the “Add Brown Goods temp” button.
          </div>
        </div>
      )}
    </div>
  );
}
