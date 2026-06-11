/** Future: carton, palette, multi-level — MVP uses one primary case size per product. */
export type PackagingKind = "case" | "carton" | "pallet";

export interface ProductPackagingConfig {
  kind: PackagingKind;
  unitsPerPack: number;
  label?: string;
}

export interface PackagingBreakdown {
  totalUnits: number;
  packSize: number;
  fullPacks: number;
  remainderUnits: number;
  /** False when packSize <= 1 (unités seules). */
  hasPackaging: boolean;
  packLabel: string;
}

const PACK_LABELS: Record<PackagingKind, string> = {
  case: "caisse",
  carton: "carton",
  pallet: "palette",
};

export function pluralPackLabel(label: string, count: number) {
  if (count <= 1) return label;
  if (label === "caisse") return "caisses";
  if (label.endsWith("s")) return label;
  return `${label}s`;
}

export function getProductPackSize(
  packSize: number | undefined,
  _kind: PackagingKind = "case"
): number {
  const size = packSize ?? 1;
  return size < 1 ? 1 : Math.round(size);
}

export function splitQuantityIntoPackaging(
  quantity: number,
  packSize: number,
  kind: PackagingKind = "case"
): PackagingBreakdown {
  const size = getProductPackSize(packSize, kind);
  const totalUnits = Math.max(0, Math.round(quantity));
  const label = PACK_LABELS[kind];

  if (size <= 1) {
    return {
      totalUnits,
      packSize: 1,
      fullPacks: 0,
      remainderUnits: totalUnits,
      hasPackaging: false,
      packLabel: label,
    };
  }

  return {
    totalUnits,
    packSize: size,
    fullPacks: Math.floor(totalUnits / size),
    remainderUnits: totalUnits % size,
    hasPackaging: true,
    packLabel: label,
  };
}

export function formatPackagingSummary(
  breakdown: PackagingBreakdown
): string {
  if (!breakdown.hasPackaging) {
    return `${breakdown.totalUnits} unité${breakdown.totalUnits > 1 ? "s" : ""}`;
  }
  const parts: string[] = [];
  if (breakdown.fullPacks > 0) {
    parts.push(
      `${breakdown.fullPacks} ${pluralPackLabel(breakdown.packLabel, breakdown.fullPacks)}`
    );
  }
  if (breakdown.remainderUnits > 0) {
    parts.push(
      `${breakdown.remainderUnits} unité${breakdown.remainderUnits > 1 ? "s" : ""}`
    );
  }
  return parts.join(" + ") || "0";
}
