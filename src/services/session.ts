// src/services/session.ts
import type { RouteId } from "../types";

export type SessionRole = "admin" | "dispatch" | "driver";

export type Session = {
  employeeId: string;
  name: string;
  role: SessionRole;

  // Driver shift setup (optional for non-drivers)
  truckNumber?: string;
  routeId?: RouteId;
  shiftStartedAt?: string;

  // timestamps (audit-ish)
  loginAt: string;
  logoutAt?: string;
};

const KEY = "lp_session_v1";

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
