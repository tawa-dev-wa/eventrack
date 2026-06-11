"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@eventrack/ui";
import { APP_NAV_ITEMS } from "@/lib/navigation";
import { useMockStore } from "@/lib/mock/store";

export function MobileMenuDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { openMissingCount } = useMockStore();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-brand-navy/50"
        aria-label="Fermer le menu"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 z-10 max-h-[85dvh] overflow-y-auto overscroll-y-contain rounded-t-2xl bg-brand-surface-raised pb-[env(safe-area-inset-bottom)] shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-brand-neutral bg-brand-surface-raised px-5 py-4">
          <h2 className="text-lg font-semibold text-brand-primary">
            Tous les modules
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-brand-primary/50 hover:bg-brand-background"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="grid grid-cols-2 gap-2 p-4">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const badge =
              item.href === "/missing" && openMissingCount > 0
                ? openMissingCount
                : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "relative flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors",
                  active
                    ? "border-brand-secondary bg-brand-secondary/5 text-brand-secondary"
                    : "border-brand-neutral bg-brand-surface text-brand-primary hover:bg-brand-background"
                )}
              >
                <Icon className="h-6 w-6 shrink-0" />
                <span className="text-xs font-medium leading-tight">
                  {item.label}
                </span>
                {badge !== undefined && (
                  <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-critical px-1 text-[10px] font-bold text-white">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
