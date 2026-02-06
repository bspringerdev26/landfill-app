// src/types.ts
// Central “shape definitions” for our app data.
// This file has NO Firebase code. Just types and shared constants.

// --- Roles ---
export type Role = "admin" | "driver" | "dispatch";

// --- Container classifications (two different worlds) ---

// src/types.ts

// Routes in your system
export type RouteId = "route_a" | "route_b" | "route_c" | "route_d" | "route_e";

// Dispatch/Driver container kinds (NOT the admin 20/25/30 yard sizes)
export type ContainerKind =
  | "compactor"
  | "brown_goods"
  | "plastic"
  | "plastic_compactor"
  | "cardboard"
  | "metal";


// 1) What Dispatch/Driver care about (material / can type)
export type MaterialContainerType =
  | "compactor"
  | "brown_goods"
  | "plastic"
  | "plastic_compactor"
  | "cardboard"
  | "metal";

// Display labels for UI dropdowns (so we don’t hardcode text everywhere)
export const MATERIAL_CONTAINER_LABELS: Record<MaterialContainerType, string> = {
  compactor: "Compactor",
  brown_goods: "Brown Goods",
  plastic: "Plastic",
  plastic_compactor: "Plastic Compactor",
  cardboard: "Cardboard",
  metal: "Metal",
};

// 2) What Admin assigns (roll-off size)
export type RollOffSize = 20 | 25 | 30;

// --- Ticket lifecycle ---
// Ticket = a “full pickup” workflow item moving through steps.
export type TicketStatus = "full" | "enroute" | "serviced" | "closed";

// --- Time ---
// We want REAL timestamps for every important action.
// We store these as Date in the app, and as Firestore Timestamp in the DB.
// Using Date here keeps your app code simple.
export type ISODateString = string; // e.g. "2026-02-05T19:12:33.123Z"

// --- Employees ---
// Admin creates employees + assigns role.
// Employee sets their PIN during onboarding (we’ll implement that flow later).
export interface Employee {
  id: string; // Firestore document id
  name: string;
  role: Role;
  isActive: boolean;

  // For prototype: plain pin (NOT ideal). Later: pinHash.
  // Keeping it optional so we can migrate without breaking everything.
  pin?: string;
  pinHash?: string;

  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastLoginAt?: ISODateString;
}

// --- Tickets ---
// This is the “live/current transaction” item you described.
export interface Ticket {
  id: string;

  // Where is it?
  locationName: string;

  // What kind of container is it (Dispatch/Driver classification)?
  materialType: MaterialContainerType;

  // If Admin assigned a roll-off size for that site/container, it can be stored here.
  // (This is separate from material type on purpose.)
  rollOffSize?: RollOffSize;

  status: TicketStatus;

  // Weight entered at scales by Dispatch (optional until closed)
  weightTons?: number;

  notes?: string;

  // Who did what
  createdBy: { employeeId: string; role: Role };
  updatedBy?: { employeeId: string; role: Role };

  // REAL timestamps for the lifecycle
  createdAt: ISODateString;
  updatedAt: ISODateString;

  // Optional: lifecycle-specific timestamps (so Admin history is super clear)
  fullAt?: ISODateString;
  enrouteAt?: ISODateString;
  servicedAt?: ISODateString;
  closedAt?: ISODateString;
}

// --- History events ---
// When Dispatch enters weight + closes the ticket, we create a ServiceEvent record.
// This makes “History” and “30-day reports” easy and fast.
export interface ServiceEvent {
  id: string;

  ticketId: string;
  locationName: string;
  materialType: MaterialContainerType;
  rollOffSize?: RollOffSize;

  weightTons: number;

  servicedBy: { employeeId: string };
  dispatchBy: { employeeId: string };

  // REAL timestamp for the completed service
  occurredAt: ISODateString;
}

// This is the Session export interface that session.ts was looking for.
export interface Session {
  employeeId: string;
  name: string;
  role: Role;

  truckNumber?: string;

  startedAt: ISODateString;
  endedAt?: ISODateString;
}
