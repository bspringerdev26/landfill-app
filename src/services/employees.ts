// src/services/employees.ts
// Firestore helpers for employees (login + admin management).

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db, nowIso } from "./firebase";
import type { Employee, Role } from "../types";
import { COLLECTIONS } from "../firestorePaths";

// ---------- Types for the Login dropdown ----------
export type EmployeeLoginOption = {
  id: string;   // Firestore doc id
  name: string;
  role: Role;
  isActive: boolean;
};

// ---------- List employees for the login dropdown ----------
export async function listEmployeesForLogin(): Promise<EmployeeLoginOption[]> {
  const ref = collection(db, COLLECTIONS.employees);

  // Only active employees should show in login dropdown
  const q = query(ref, where("isActive", "==", true), orderBy("name", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const data = d.data() as Partial<Employee>;
    return {
      id: d.id,
      name: String(data.name ?? ""),
      role: (data.role as Role) ?? "driver",
      isActive: true,
    };
  });
}

// ---------- Verify PIN for login ----------
export async function verifyEmployeePin(employeeId: string, pin: string) {
  const cleanedPin = normalizePin(pin);

  if (cleanedPin.length !== 4) {
    return { ok: false as const, reason: "PIN must be 4 digits." };
  }

  const ref = doc(db, COLLECTIONS.employees, employeeId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { ok: false as const, reason: "Employee not found." };
  }

  const emp = snap.data() as Employee;

  if (!emp.isActive) {
    return { ok: false as const, reason: "Employee is inactive." };
  }

  // Prototype approach: PIN stored as plain string.
  // Later we’ll upgrade to a hash (pinHash) so Firestore never stores raw PINs.
  if (!emp.pin || emp.pin !== cleanedPin) {
    return { ok: false as const, reason: "Invalid PIN." };
  }

    // Optional audit logging:
  // We are NOT writing on login yet because Firestore rules currently deny writes.
  // We'll re-enable this once we add real auth / role-based writes.
  try {
    // await updateDoc(ref, {
    //   lastLoginAt: nowIso(),
    //   updatedAt: nowIso(),
    //   updatedAtServer: serverTimestamp(),
    // });
  } catch {
    // ignore
  }


  return {
    ok: true as const,
    employee: {
      id: snap.id,
      name: emp.name,
      role: emp.role,
      isActive: emp.isActive,
    },
  };
}

// ---------- Admin functions (we’ll use these soon) ----------

// Create an employee record (admin action).
// Employee chooses their PIN after being created (we'll build that UI next).
export async function adminCreateEmployee(input: { id: string; name: string; role: Role }) {
  const id = input.id.trim();
  const name = input.name.trim();

  if (!id) throw new Error("Employee ID is required.");
  if (!name) throw new Error("Employee name is required.");

  const ref = doc(db, COLLECTIONS.employees, id);

  const employee: Omit<Employee, "id"> = {
    name,
    role: input.role,
    isActive: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  // setDoc will overwrite if it exists.
  // Later we can change to "fail if exists" if you want.
  await setDoc(ref, {
    ...employee,
    createdAtServer: serverTimestamp(),
    updatedAtServer: serverTimestamp(),
  });

  return { id, ...employee };
}

// Set (or change) an employee PIN (admin-assisted or “first-time setup” flow).
export async function setEmployeePin(employeeId: string, pin: string) {
  const cleanedPin = normalizePin(pin);
  if (cleanedPin.length !== 4) throw new Error("PIN must be exactly 4 digits.");

  const ref = doc(db, COLLECTIONS.employees, employeeId);

  await updateDoc(ref, {
    pin: cleanedPin, // prototype only
    updatedAt: nowIso(),
    updatedAtServer: serverTimestamp(),
  });
}

// ---------- Helpers ----------
export function normalizePin(value: string) {
  return value.replace(/\D/g, "").slice(0, 4);
}
