import type { MockInventorySession, MockProduct } from "@/lib/mock/types";
import { DEMO_DATE } from "@/lib/demo-date";

export type InventoryZoneId =
  | "verres"
  | "assiettes"
  | "decoration"
  | "linge"
  | "boissons";

export const INVENTORY_ROTATION: {
  day: number;
  zoneId: InventoryZoneId;
  label: string;
  emoji: string;
  categories: string[];
  nameFilter?: (p: MockProduct) => boolean;
}[] = [
  {
    day: 1,
    zoneId: "verres",
    label: "Verres & couverts légers",
    emoji: "🍷",
    categories: ["cutlery"],
    nameFilter: (p) =>
      /verre|gobelet|flûte|flute|tasse/i.test(p.name) &&
      !/assiette|fourchette|couteau/i.test(p.name),
  },
  {
    day: 2,
    zoneId: "assiettes",
    label: "Assiettes & couverts",
    emoji: "🍽️",
    categories: ["cutlery"],
    nameFilter: (p) =>
      /assiette|fourchette|couteau|bol/i.test(p.name) ||
      p.reference === "520",
  },
  {
    day: 3,
    zoneId: "decoration",
    label: "Décoration",
    emoji: "🌿",
    categories: ["decoration", "table"],
    nameFilter: (p) => p.category === "decoration" || p.reference === "701",
  },
  {
    day: 4,
    zoneId: "linge",
    label: "Linge",
    emoji: "🧺",
    categories: ["linen"],
  },
  {
    day: 5,
    zoneId: "boissons",
    label: "Boissons",
    emoji: "🍷",
    categories: ["drinks"],
  },
];

export const PREPARERS = ["Kevin", "Lucas", "Julie", "Thomas"] as const;
export type PreparerName = (typeof PREPARERS)[number];

export function getRotationForDate(dateStr = DEMO_DATE) {
  const day = new Date(`${dateStr}T12:00:00`).getDay();
  const rotation =
    INVENTORY_ROTATION.find((r) => r.day === day) ??
    INVENTORY_ROTATION[2];
  return rotation;
}

export function getMissionProducts(
  products: MockProduct[],
  dateStr = DEMO_DATE
): MockProduct[] {
  const rotation = getRotationForDate(dateStr);
  return products.filter((p) => {
    if (!rotation.categories.includes(p.category)) return false;
    if (rotation.nameFilter) return rotation.nameFilter(p);
    return true;
  });
}

export function estimateMissionMinutes(productCount: number): number {
  return Math.max(5, Math.ceil(productCount * 0.67));
}

/** Stock attendu au dépôt uniquement — hors prestations. */
export function getExpectedDepotStock(product: MockProduct): number {
  return product.stockAvailable;
}

export function getOnPrestationCount(product: MockProduct): number {
  return product.stockReserved;
}

export function computeStockReliability(
  sessions: MockInventorySession[]
): number {
  if (sessions.length === 0) return 92;

  const recent = sessions.slice(0, 8);
  let total = 0;
  let accurate = 0;

  for (const session of recent) {
    for (const line of session.lines) {
      total++;
      if (line.variance === 0) accurate++;
    }
  }

  if (total === 0) return 92;
  return Math.round((accurate / total) * 100);
}
