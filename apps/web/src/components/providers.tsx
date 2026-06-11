"use client";

import { MockStoreProvider } from "@/lib/mock/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <MockStoreProvider>{children}</MockStoreProvider>;
}
