"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, StatusIndicator } from "@eventrack/ui";
import { cn } from "@eventrack/ui";

export function DashboardStatCard({
  label,
  value,
  level,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  value: number;
  level: "ok" | "warning" | "critical";
  icon: LucideIcon;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={active}
      className={cn(
        "group w-full touch-manipulation rounded-xl text-left transition-all duration-200",
        "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/40",
        "md:hover:-translate-y-0.5 md:hover:shadow-md",
        active && "ring-2 ring-brand-secondary/50 shadow-md"
      )}
    >
      <Card
        className={cn(
          "h-full border-brand-neutral transition-colors",
          "md:group-hover:border-brand-secondary/40 md:group-hover:bg-brand-background/30",
          active && "border-brand-secondary/40 bg-brand-secondary/5 dark:bg-brand-secondary/10"
        )}
      >
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-brand-secondary/10 transition-colors",
              "md:group-hover:bg-brand-secondary/15"
            )}
          >
            <Icon className="h-5 w-5 text-brand-secondary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-brand-primary/60">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-brand-primary">{value}</p>
              <StatusIndicator level={level} />
            </div>
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-xs font-medium text-brand-secondary transition-opacity",
                active ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
              )}
            >
              {active ? "Masquer le détail" : "Voir le détail"}
              <ChevronRight className="h-3.5 w-3.5" />
            </p>
          </div>
          <ChevronRight
            className={cn(
              "h-5 w-5 shrink-0 text-brand-primary/30 transition-transform",
              active && "rotate-90 text-brand-secondary",
              "md:group-hover:text-brand-secondary"
            )}
          />
        </CardContent>
      </Card>
    </button>
  );
}
