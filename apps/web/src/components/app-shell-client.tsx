"use client";

import { AppShell } from "@eventrack/ui";
import { useMockStore } from "@/lib/mock/store";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { ThemeToggleButton } from "@/components/theme-toggle-button";

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const { openMissingCount, unreadNotificationCount } = useMockStore();

  return (
    <AppShell
      userName="Mina"
      userRole="Commercial"
      notificationCount={unreadNotificationCount}
      missingCount={openMissingCount}
      mobileNav={<MobileBottomNav />}
      headerExtra={<ThemeToggleButton />}
    >
      {children}
    </AppShell>
  );
}
