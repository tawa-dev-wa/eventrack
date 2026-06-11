import type { StockBreakOrigin } from "./types";

export const STOCK_BREAK_LABELS: Record<StockBreakOrigin, string> = {
  retour_event: "Retour événement",
  plonge: "Plonge",
  entrepot: "Entrepôt",
  preparation: "Préparation",
  transport: "Transport",
  autre: "Autre",
};

export function getDepotAllocation(
  allocations: import("./types").MockStockAllocation[],
  productId: string
) {
  return allocations.find(
    (a) => a.productId === productId && a.status === "available"
  );
}

export function getBrokenAllocation(
  allocations: import("./types").MockStockAllocation[],
  productId: string
) {
  return allocations.find(
    (a) => a.productId === productId && a.status === "broken"
  );
}

export function applyDepotDelta(
  allocations: import("./types").MockStockAllocation[],
  productId: string,
  delta: number,
  createId: () => string
) {
  const depot = getDepotAllocation(allocations, productId);

  if (depot) {
    const nextQty = depot.quantity + delta;
    if (nextQty <= 0) {
      return allocations.filter((a) => a.id !== depot.id);
    }
    return allocations.map((a) =>
      a.id === depot.id ? { ...a, quantity: nextQty } : a
    );
  }

  if (delta > 0) {
    return [
      ...allocations,
      {
        id: createId(),
        productId,
        quantity: delta,
        status: "available" as const,
      },
    ];
  }

  return allocations;
}

export function applyBrokenQuantity(
  allocations: import("./types").MockStockAllocation[],
  productId: string,
  quantity: number,
  createId: () => string
) {
  const broken = getBrokenAllocation(allocations, productId);
  if (broken) {
    return allocations.map((a) =>
      a.id === broken.id ? { ...a, quantity: a.quantity + quantity } : a
    );
  }
  return [
    ...allocations,
    {
      id: createId(),
      productId,
      quantity,
      status: "broken" as const,
    },
  ];
}

export function updateProductStock(
  product: import("./types").MockProduct,
  patch: Partial<
    Pick<
      import("./types").MockProduct,
      "stockAvailable" | "stockTotal" | "stockBroken"
    >
  >
) {
  return { ...product, ...patch };
}

export function buildStockAdjustment(
  input: Omit<import("./types").MockStockAdjustment, "id" | "at">,
  createId: () => string
) {
  return {
    ...input,
    id: createId(),
    at: new Date().toISOString(),
  };
}

export function getProductBreakageStats(
  adjustments: import("./types").MockStockAdjustment[],
  productId: string,
  now = new Date("2026-06-11T12:00:00")
) {
  const broken = adjustments.filter(
    (a) => a.productId === productId && a.type === "broken"
  );
  const month = now.getMonth();
  const year = now.getFullYear();

  const thisMonth = broken.filter((a) => {
    const d = new Date(a.at);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const thisYear = broken.filter((a) => new Date(a.at).getFullYear() === year);

  return {
    monthCount: thisMonth.reduce((s, a) => s + a.quantity, 0),
    yearCount: thisYear.reduce((s, a) => s + a.quantity, 0),
    history: broken,
  };
}

export function getGlobalBreakageStats(
  adjustments: import("./types").MockStockAdjustment[],
  products: import("./types").MockProduct[],
  now = new Date("2026-06-11T12:00:00")
) {
  const month = now.getMonth();
  const year = now.getFullYear();
  const broken = adjustments.filter((a) => a.type === "broken");

  const monthItems = broken.filter((a) => {
    const d = new Date(a.at);
    return d.getMonth() === month && d.getFullYear() === year;
  });
  const yearItems = broken.filter(
    (a) => new Date(a.at).getFullYear() === year
  );

  const byProduct = new Map<string, number>();
  const byOrigin = new Map<StockBreakOrigin, number>();

  for (const item of monthItems) {
    byProduct.set(item.productId, (byProduct.get(item.productId) ?? 0) + item.quantity);
    if (item.context) {
      byOrigin.set(item.context, (byOrigin.get(item.context) ?? 0) + item.quantity);
    }
  }

  const topProducts = [...byProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([productId, count]) => ({
      product: products.find((p) => p.id === productId),
      count,
    }))
    .filter((x) => x.product);

  const topOrigin = [...byOrigin.entries()].sort((a, b) => b[1] - a[1])[0];

  return {
    monthTotal: monthItems.reduce((s, a) => s + a.quantity, 0),
    yearTotal: yearItems.reduce((s, a) => s + a.quantity, 0),
    topProducts,
    mainOrigin: topOrigin
      ? { origin: topOrigin[0], count: topOrigin[1] }
      : undefined,
  };
}
