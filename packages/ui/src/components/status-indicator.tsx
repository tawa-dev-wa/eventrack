import { cn } from "../lib/utils";

type StatusLevel = "critical" | "warning" | "ok";

const config: Record<StatusLevel, { dot: string; label: string }> = {
  critical: { dot: "bg-brand-critical", label: "Critique" },
  warning: { dot: "bg-brand-alert", label: "Attention" },
  ok: { dot: "bg-brand-success", label: "Conforme" },
};

interface StatusIndicatorProps {
  level: StatusLevel;
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({
  level,
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const { dot, label } = config[level];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("h-2.5 w-2.5 rounded-full", dot)} />
      {showLabel && (
        <span className="text-xs text-brand-primary/70">{label}</span>
      )}
    </span>
  );
}
