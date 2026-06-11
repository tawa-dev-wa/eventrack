"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@eventrack/ui";
import { MOBILE_TAB_ITEMS } from "@/lib/navigation";
import { useMockStore } from "@/lib/mock/store";
import { MobileMenuDrawer } from "@/components/mobile-menu-drawer";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openMissingCount } = useMockStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-brand-neutral bg-white md:hidden"
        aria-label="Navigation principale"
      >
        <div className="flex items-stretch justify-around px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {MOBILE_TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            const isMenu = item.href === "__menu__";
            const active =
              !isMenu &&
              (pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(item.href)));

            if (isMenu) {
              return (
                <button
                  key="menu"
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2"
                >
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      menuOpen
                        ? "text-brand-secondary"
                        : "text-brand-primary/50"
                    )}
                  />
                  <span
                    className={cn(
                      "truncate text-[10px] font-medium",
                      menuOpen
                        ? "text-brand-secondary"
                        : "text-brand-primary/50"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2"
              >
                <span className="relative">
                  <Icon
                    className={cn(
                      "h-6 w-6",
                      active
                        ? "text-brand-secondary"
                        : "text-brand-primary/50"
                    )}
                  />
                  {"badge" in item && item.badge && openMissingCount > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-critical px-1 text-[10px] font-bold text-white">
                      {openMissingCount}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "truncate text-[10px] font-medium",
                    active
                      ? "text-brand-secondary"
                      : "text-brand-primary/50"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
