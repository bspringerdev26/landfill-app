// src/firestorePaths.ts
// One place to define Firestore collection names and common document paths.
// Keeps us from hardcoding strings everywhere (and typo-ing ourselves into pain).

export const COLLECTIONS = {
  employees: "employees",
  tickets: "tickets",
  serviceEvents: "serviceEvents",

  // We'll add these later when we build Admin container assignment:
  // locations: "locations",
  // containers: "containers",
} as const;

// Optional helpers (quality-of-life)
// Example usage: doc(db, paths.ticket(ticketId))
export const paths = {
  employee: (id: string) => `${COLLECTIONS.employees}/${id}`,
  ticket: (id: string) => `${COLLECTIONS.tickets}/${id}`,
  serviceEvent: (id: string) => `${COLLECTIONS.serviceEvents}/${id}`,
} as const;
