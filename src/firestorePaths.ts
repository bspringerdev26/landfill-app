// src/firestorePaths.ts
// Central place for Firestore collection names and common document paths.
// Prevents typos and keeps naming consistent.

export const COLLECTIONS = {
  employees: "employees",
  tickets: "tickets",
  serviceEvents: "serviceEvents",

  // We'll add these later when we build route/site lists + temporary container placement:
  // routes: "routes",
  // sites: "sites",
  // siteContainers: "siteContainers",
  // sessionEvents: "sessionEvents",
} as const;

export const paths = {
  employee: (id: string) => `${COLLECTIONS.employees}/${id}`,
  ticket: (id: string) => `${COLLECTIONS.tickets}/${id}`,
  serviceEvent: (id: string) => `${COLLECTIONS.serviceEvents}/${id}`,
} as const;
