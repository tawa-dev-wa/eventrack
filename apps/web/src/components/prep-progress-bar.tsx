"use client";

import type { PrepProgress } from "@/lib/mock/preparation";
import { cn } from "@eventrack/ui";

export function PrepProgressBar({
  progress,
  compact = false,
}: {
  progress: PrepProgress;
  compact?: boolean;
}) {
  const { percent, totalLines, preparedLines, remainingLines, missingCount, totalUnits, preparedUnits } =
    progress;

  return (
    <div className={cn("space-y-2", compact && "space-y-1")}>
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-medium text-brand-primary",
            compact ? "text-sm" : "text-base"
          )}
        >
          Préparation : {percent}%
        </span>
        {!compact && (
          <span className="text-xs text-brand-primary/50">
            {preparedUnits.toLocaleString("fr-FR")}/
            {totalUnits.toLocaleString("fr-FR")} unités · {preparedLines}/
            {totalLines} lignes
          </span>
        )}
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-brand-neutral">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent >= 100
              ? "bg-brand-success"
              : percent >= 50
                ? "bg-brand-secondary"
                : "bg-brand-warning"
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      {!compact && totalLines > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-primary/60">
          <span>{totalLines} lignes</span>
          <span className="text-brand-success">{preparedLines} préparées</span>
          <span>{remainingLines} restantes</span>
          {missingCount > 0 && (
            <span className="text-brand-critical">{missingCount} manquants</span>
          )}
        </div>
      )}
    </div>
  );
}
