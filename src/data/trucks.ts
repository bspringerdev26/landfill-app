// src/data/trucks.ts
// Static list of available truck numbers.
// This is NOT stored in Firestore, because trucks are equipment, not user data.
// Drivers pick from this list when starting their shift.

export const TRUCK_NUMBERS = [
  "153",
  "154",
  "132",
  "133",
  "134",
  "141",
  "119",

  // Placeholders for future trucks
  "TRUCK-01",
  "TRUCK-02",
  "TRUCK-03"
] as const;

export type TruckNumber = (typeof TRUCK_NUMBERS)[number];
