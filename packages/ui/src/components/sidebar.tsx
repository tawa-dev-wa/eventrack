"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  Truck,
  UserCircle,
  Package,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Users,
  HelpCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import { Logo } from "./logo";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const defaultNavItems: NavItem[] = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/events", label: "Événements", icon: CalendarDays },
  { href: "/calendar", label: "Calendrier", icon: Calendar },
  { href: "/trucks", label: "Camions", icon: Truck },
  { href: "/drivers", label: "Chauffeurs", icon: UserCircle },
  { href: "/stock", label: "Matériel & Stock", icon: Package },
  { href: "/missing", label: "Manquants", icon: AlertTriangle },
  { href: "/returns", label: "Retours", icon: RotateCcw },
  { href: "/reports", label: "Rapports", icon: BarChart3 },
  { href: "/contacts", label: "Contacts", icon: Users },
];

interface SidebarProps {
  items?: NavItem[];
  missingCount?: number;
}

export function Sidebar({ items, missingCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const navItems =
    items ??
    defaultNavItems.map((item) =>
      item.href === "/missing"
        ? { ...item, badge: missingCount > 0 ? missingCount : undefined }
        : item
    );

  return (
    <aside className="flex h-full min-h-0 w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-28 items-center border-b border-sidebar-border px-3">
        <Link href="/dashboard" className="block">
          <Logo variant="full" onDark className="h-24 w-auto max-w-[232px]" />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-sidebar-muted hover:bg-sidebar-border/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-critical px-1.5 text-xs font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <Link
          href="/help"
          className="flex items-center gap-2 text-sm text-sidebar-muted hover:text-sidebar-foreground"
        >
          <HelpCircle className="h-4 w-4" />
          Besoin d&apos;aide ?
        </Link>
        <div className="mt-4 flex justify-center">
          <Logo variant="icon" onDark />
        </div>
      </div>
    </aside>
  );
}
