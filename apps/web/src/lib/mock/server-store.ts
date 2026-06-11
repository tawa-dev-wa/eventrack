import { initialMockStore } from "./seed";
import type { MockStore } from "./types";

let memoryStore: MockStore = structuredClone(initialMockStore);
let syncRevision = 0;

export function getServerMockStore() {
  return { store: memoryStore, revision: syncRevision };
}

export function setServerMockStore(store: MockStore) {
  memoryStore = store;
  syncRevision += 1;
  return syncRevision;
}

export function resetServerMockStore() {
  memoryStore = structuredClone(initialMockStore);
  syncRevision += 1;
  return syncRevision;
}
