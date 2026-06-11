export function getDepotAllocation(
  allocations: import("./types").MockStockAllocation[],
  productId: string
) {
  return allocations.find(
    (a) => a.productId === productId && a.status === "available"
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

export function updateProductStock(
  product: import("./types").MockProduct,
  patch: Partial<
    Pick<import("./types").MockProduct, "stockAvailable" | "stockTotal">
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
