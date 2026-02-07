// src/services/session.ts
import type { Role } from "../types";

export type Session = {
  employeeId: string;
  name: string;
  role: Role;

  // ISO timestamps (real timestamps, not “last updated at” fluff)
  startedAt: string;
  endedAt?: string;

  // Driver-only (set later inside Driver View)
  truckNumber?: string;
  routeId?: string;
};

const KEY = "lpp_session_v1";

export function getSession(): Session | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function isSignedIn(): boolean {
  const s = getSession();
  return !!s && !s.endedAt;
}

export function startSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function updateSession(patch: Partial<Session>) {
  const current = getSession();
  if (!current) return;
  const next: Session = { ...current, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function endSession() {
  const current = getSession();
  if (!current) return;
  const next: Session = { ...current, endedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}
