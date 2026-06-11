import { Package, Plus } from "lucide-react";
import { cn } from "@eventrack/ui";
import {
  pluralPackLabel,
  splitQuantityIntoPackaging,
} from "@/lib/mock/packaging";

export function PrepPackagingBreakdown({
  quantity,
  packSize,
  compact = false,
  className,
}: {
  quantity: number;
  packSize: number;
  compact?: boolean;
  className?: string;
}) {
  const breakdown = splitQuantityIntoPackaging(quantity, packSize);

  if (!breakdown.hasPackaging) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1",
        compact ? "text-xs" : "text-sm",
        className
      )}
    >
      {breakdown.fullPacks > 0 && (
        <span className="inline-flex items-center gap-1 font-medium text-brand-primary">
          <Package className="h-3.5 w-3.5 shrink-0 text-brand-secondary" />
          {breakdown.fullPacks}{" "}
          {pluralPackLabel(breakdown.packLabel, breakdown.fullPacks)}
        </span>
      )}
      {breakdown.remainderUnits > 0 && (
        <span className="inline-flex items-center gap-1 font-medium text-brand-primary/80">
          <Plus className="h-3.5 w-3.5 shrink-0 text-brand-alert" />
          {breakdown.remainderUnits} unité
          {breakdown.remainderUnits > 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}
