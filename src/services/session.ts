// src/services/session.ts
// Handles who is currently logged in (stored in localStorage).
// This is NOT secure auth yet. It's app session state.
//
// IMPORTANT:
// - "endedAt" only gets set when the user presses Logout.
// - Closing the app does NOT count as logout.

import type { Role } from "../types";

export type Session = {
  employeeId: string;
  name: string;
  role: Role;

  // Only relevant for drivers
  truckNumber?: string;

  // Real timestamps (ISO strings)
  startedAt: string; // login time
  endedAt?: string;  // logout time (set only by manual logout)
};

const KEY = "landfill_session_v1";

export function startSession(input: Omit<Session, "startedAt" | "endedAt">) {
  const session: Session = {
    ...input,
    startedAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Session;

    // Basic checks so bad storage doesn't crash the app
    if (!parsed.employeeId || !parsed.name || !parsed.role || !parsed.startedAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function updateSession(patch: Partial<Omit<Session, "employeeId" | "role">>) {
  const existing = getSession();
  if (!existing) return null;

  const next: Session = { ...existing, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function logoutSession() {
  const existing = getSession();
  if (!existing) {
    localStorage.removeItem(KEY);
    return null;
  }

  const endedAt = new Date().toISOString();
  const next: Session = { ...existing, endedAt };
  localStorage.setItem(KEY, JSON.stringify(next));

  // We keep it stored (with endedAt) so we can optionally show “last login/logout”
  // Later we’ll also write login/logout events to Firestore for Admin history.
  return next;
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function isSignedIn() {
  const s = getSession();
  return !!s && !s.endedAt;
}

export function requireSignedIn(): Session {
  const session = getSession();
  if (!session || session.endedAt) {
    throw new Error("Not signed in");
  }
  return session;
}

export function requireRole(allowed: Role[]): Session {
  const session = requireSignedIn();
  if (!allowed.includes(session.role)) {
    throw new Error("Not authorized");
  }
  return session;
}
