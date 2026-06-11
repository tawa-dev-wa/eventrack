"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "./sidebar";
import { Logo } from "./logo";

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userRole?: string;
  notificationCount?: number;
  missingCount?: number;
  mobileNav?: React.ReactNode;
  mobileFab?: React.ReactNode;
}

export function AppShell({
  children,
  userName = "Utilisateur",
  userRole = "Commercial",
  notificationCount = 0,
  missingCount,
  mobileNav,
  mobileFab,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh w-full">
      <div className="hidden h-dvh shrink-0 md:sticky md:top-0 md:flex">
        <Sidebar missingCount={missingCount} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-24 shrink-0 items-center justify-between border-b border-brand-neutral bg-white px-4 md:h-20 md:px-6">
          <Link href="/dashboard" className="shrink-0 md:hidden">
            <Logo variant="full" className="h-20 w-auto" />
          </Link>
          <div className="hidden flex-1 md:block" aria-hidden />

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="relative rounded-md p-2 text-brand-primary/60 hover:bg-brand-background"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-critical text-[10px] font-bold text-white">
                  {notificationCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary text-sm font-semibold text-white">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-brand-primary">
                  {userName}
                </p>
                <p className="text-xs text-brand-primary/50">{userRole}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-brand-background p-4 md:p-6">
          {children}
          <div
            className="h-mobile-nav shrink-0 md:hidden"
            aria-hidden
          />
        </main>

        {mobileFab}
        {mobileNav}
      </div>
    </div>
  );
}
