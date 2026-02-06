// src/data/routes.ts
// Source of truth for routes + sites + default container inventory.
//
// NOTE: "name" can change for display purposes.
// "siteId" should never change once the app is live.

import type { ContainerKind, RouteId } from "../types";

export type SiteInventory = Partial<Record<ContainerKind, number>>;

export type SiteDefinition = {
  siteId: string;
  name: string;
  defaultInventory: SiteInventory;
};

export type RouteDefinition = {
  routeId: RouteId;
  label: string; // what the driver/dispatch sees
  sites: SiteDefinition[];
};

// Helper to reduce typing (and mistakes)
function inv(items: Array<[ContainerKind, number]>): SiteInventory {
  return Object.fromEntries(items) as SiteInventory;
}

// Stable IDs: lowercase, no spaces, no punctuation.
export const ROUTES: RouteDefinition[] = [
  {
    routeId: "route_a",
    label: "Route A",
    sites: [
      { siteId: "midway", name: "Midway", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "branch", name: "Branch", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "hammonds", name: "Hammonds", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "sanchez", name: "Sanchez", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic_compactor", 1]]) },
      { siteId: "red_springs_housing_authority", name: "Red Springs Housing Authority", defaultInventory: inv([["brown_goods", 1]]) },
    ],
  },
  {
    routeId: "route_b",
    label: "Route B",
    sites: [
      { siteId: "marietta", name: "Marietta", defaultInventory: inv([["brown_goods", 3]]) },
      { siteId: "beaver_dam", name: "Beaver Dam", defaultInventory: inv([["compactor", 1], ["brown_goods", 1], ["metal", 1], ["plastic", 1]]) },
      { siteId: "chicken", name: "Chicken", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic_compactor", 1]]) },
      { siteId: "lewis_mcneill", name: "Lewis McNeill", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "southeastern_ag_center", name: "Southeastern Agricultural Center", defaultInventory: inv([["brown_goods", 1]]) },
    ],
  },
  {
    routeId: "route_c",
    label: "Route C",
    sites: [
      { siteId: "wiregrass", name: "Wiregrass", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["cardboard", 1], ["plastic", 1]]) },
      { siteId: "alma", name: "Alma", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "morgan_j", name: "Morgan J", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "king_tuck", name: "King Tuck", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "balance_farm", name: "Balance Farm", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
    ],
  },
  {
    routeId: "route_d",
    label: "Route D",
    sites: [
      { siteId: "lowe_rd", name: "Lowe Rd", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "south_robeson", name: "South Robeson", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "purvis", name: "Purvis", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "parkton", name: "Parkton", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "church_community", name: "Church & Community", defaultInventory: inv([["brown_goods", 1]]) },
      { siteId: "homestore_warehouse", name: "Homestore & Warehouse", defaultInventory: inv([["brown_goods", 1]]) },
    ],
  },
  {
    routeId: "route_e",
    label: "Route E",
    sites: [
      { siteId: "prospect", name: "Prospect", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic_compactor", 1]]) },
      { siteId: "sandrock", name: "Sandrock", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "ivey", name: "Ivey", defaultInventory: inv([["compactor", 2], ["brown_goods", 3], ["metal", 1], ["plastic_compactor", 1]]) },
      { siteId: "lamb", name: "Lamb", defaultInventory: inv([["compactor", 1], ["brown_goods", 2], ["metal", 1], ["plastic", 1]]) },
      { siteId: "lumberton_housing_authority", name: "Lumberton Housing Authority", defaultInventory: inv([["brown_goods", 1]]) },
    ],
  },
];

// Flattened list (useful for dropdowns and lookups)
export const ALL_SITES: SiteDefinition[] = ROUTES.flatMap((r) => r.sites);

// Quick lookup by siteId
export const SITE_BY_ID: Record<string, SiteDefinition> = Object.fromEntries(
  ALL_SITES.map((s) => [s.siteId, s])
);
