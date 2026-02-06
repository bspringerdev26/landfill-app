// src/services/session.ts
// Stores the active session in localStorage.
// This is not "security" yet. It's just "who is using the app right now".

import type { Role, Session } from "../types";

const KEY = "landfill_session_v1";

export function startSession(input: {
  employeeId: string;
  name: string;
  role: Role;
  truckNumber?: string;
}) {
  const session: Session = {
    employeeId: input.employeeId,
    name: input.name,
    role: input.role,
    truckNumber: input.truckNumber,
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

    // Basic sanity checks so corrupted storage doesn’t crash the app
    if (!parsed.employeeId || !parsed.name || !parsed.role || !parsed.startedAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isSignedIn() {
  const s = getSession();
  return !!s && !s.endedAt;
}

export function logoutSession() {
  const existing = getSession();
  if (!existing) {
    localStorage.removeItem(KEY);
    return null;
  }

  const next: Session = {
    ...existing,
    endedAt: new Date().toISOString(),
  };

  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function requireSignedIn(): Session {
  const session = getSession();
  if (!session || session.endedAt) throw new Error("Not signed in");
  return session;
}

export function requireRole(allowed: Role[]): Session {
  const session = requireSignedIn();
  if (!allowed.includes(session.role)) throw new Error("Not authorized");
  return session;
}
