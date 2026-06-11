const BUNDLE_PREFIX = "eventrack-prep-bundle:";
const QUEUE_KEY = "eventrack-offline-queue";

export type PrepBundle = {
  eventId: string;
  cachedAt: string;
  event: unknown;
  orderLines: unknown[];
  preparationLines: unknown[];
  products: unknown[];
  missingItems: unknown[];
};

export type OfflineMutation = {
  id: string;
  type: "update_prep_qty" | "validate_prep_line";
  payload: Record<string, unknown>;
  createdAt: string;
};

export function cachePrepBundle(bundle: PrepBundle) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${BUNDLE_PREFIX}${bundle.eventId}`,
      JSON.stringify(bundle)
    );
  } catch {
    /* quota */
  }
}

export function loadPrepBundle(eventId: string): PrepBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${BUNDLE_PREFIX}${eventId}`);
    return raw ? (JSON.parse(raw) as PrepBundle) : null;
  } catch {
    return null;
  }
}

export function queueOfflineMutation(mutation: Omit<OfflineMutation, "id" | "createdAt">) {
  if (typeof window === "undefined") return;
  const entry: OfflineMutation = {
    ...mutation,
    id: `q-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const queue = readQueue();
  queue.push(entry);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function readQueue(): OfflineMutation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineMutation[]) : [];
  } catch {
    return [];
  }
}

export function clearQueue() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}
