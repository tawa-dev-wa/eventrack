"use client";

import { MockStoreProvider } from "@/lib/mock/store";
import { ThemeProvider } from "@/components/theme-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MockStoreProvider>{children}</MockStoreProvider>
    </ThemeProvider>
  );
}
