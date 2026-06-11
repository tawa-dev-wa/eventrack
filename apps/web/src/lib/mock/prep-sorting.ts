import type { MockPreparationLine, MockProduct } from "./types";

/** Future: palette, chariot, camion — same priority field, different sort profiles. */
export type LoadingSortContext = "default" | "palette" | "cart" | "truck";

const CATEGORY_FALLBACK_PRIORITY: Record<string, number> = {
  cutlery: 50,
  table: 45,
  decoration: 35,
  drinks: 55,
  linen: 15,
};

export function getProductPrepPriority(product: MockProduct | undefined): number {
  if (!product) return 0;
  if (product.prepPriority != null) return product.prepPriority;
  return CATEGORY_FALLBACK_PRIORITY[product.category] ?? 30;
}

export function sortPreparationLinesByLoadingPriority(
  lines: MockPreparationLine[],
  getProduct: (id: string) => MockProduct | undefined,
  _context: LoadingSortContext = "default"
): MockPreparationLine[] {
  return [...lines].sort((a, b) => {
    const pa = getProductPrepPriority(getProduct(a.productId));
    const pb = getProductPrepPriority(getProduct(b.productId));
    if (pb !== pa) return pb - pa;
    return a.designation.localeCompare(b.designation, "fr");
  });
}
