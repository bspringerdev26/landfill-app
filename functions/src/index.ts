import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import bcrypt from "bcryptjs";

admin.initializeApp();

type Role = "owner" | "admin" | "dispatch" | "driver";

type EmployeeDoc = {
  name: string;
  role: Role;
  isActive: boolean;
  // ✅ store ONLY hash
  pinHash?: string;

  createdAt?: string;
  updatedAt?: string;
};

function nowIso() {
  return new Date().toISOString();
}

export const loginWithPin = onCall(async (request) => {
  const employeeIdRaw = String(request.data?.employeeId ?? "");
  const pinRaw = String(request.data?.pin ?? "");

  const employeeId = employeeIdRaw.trim().toLowerCase();
  const pin = pinRaw.trim();

  if (!employeeId || employeeId.length < 3) {
    throw new HttpsError("invalid-argument", "Employee ID is required.");
  }
  if (!/^\d{4}$/.test(pin)) {
    throw new HttpsError("invalid-argument", "PIN must be exactly 4 digits.");
  }

  const ref = admin.firestore().collection("employees").doc(employeeId);
  const snap = await ref.get();

  if (!snap.exists) {
    throw new HttpsError("not-found", "Employee not found.");
  }

  const emp = snap.data() as EmployeeDoc;

  if (!emp.isActive) {
    throw new HttpsError("permission-denied", "Employee is inactive.");
  }
  if (!emp.pinHash) {
    throw new HttpsError("failed-precondition", "PIN is not set for this employee.");
  }

  const ok = await bcrypt.compare(pin, emp.pinHash);
  if (!ok) {
    throw new HttpsError("unauthenticated", "Invalid PIN.");
  }

  // ✅ Custom claims power Firestore rules
  const token = await admin.auth().createCustomToken(employeeId, {
    role: emp.role,
    employeeId,
    name: emp.name,
  });

  return {
    token,
    user: {
      employeeId,
      name: emp.name,
      role: emp.role,
    },
  };
});

export const adminSetEmployeePin = onCall(async (request) => {
  // Must be signed in with a custom token already
  const auth = request.auth;
  if (!auth) {
    throw new HttpsError("unauthenticated", "Sign in required.");
  }

  const callerRole = (auth.token as any)?.role as Role | undefined;
  if (callerRole !== "owner" && callerRole !== "admin") {
    throw new HttpsError("permission-denied", "Admin role required.");
  }

  const employeeIdRaw = String(request.data?.employeeId ?? "");
  const pinRaw = String(request.data?.pin ?? "");

  const employeeId = employeeIdRaw.trim().toLowerCase();
  const pin = pinRaw.trim();

  if (!employeeId) {
    throw new HttpsError("invalid-argument", "Employee ID is required.");
  }
  if (!/^\d{4}$/.test(pin)) {
    throw new HttpsError("invalid-argument", "PIN must be exactly 4 digits.");
  }

  const ref = admin.firestore().collection("employees").doc(employeeId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Employee not found.");
  }

  const pinHash = await bcrypt.hash(pin, 10);

  await ref.update({
    pinHash,
    updatedAt: nowIso(),
  });

  return { ok: true };
});

export const listEmployeesForLogin = onCall(async () => {
  // Public endpoint: returns ONLY safe fields for the login dropdown.
  // We do NOT return pinHash (or anything sensitive).

  const snap = await admin
    .firestore()
    .collection("employees")
    .where("isActive", "==", true)
    .orderBy("name", "asc")
    .get();

  const employees = snap.docs.map((d) => {
    const data = d.data() as EmployeeDoc;
    return {
      id: d.id,
      name: data.name,
      role: data.role,
      isActive: true as const,
    };
  });

  return { employees };
});
