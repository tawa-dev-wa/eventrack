"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "../lib/utils";

export function ThemeToggle({
  theme,
  onToggle,
  className,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
  className?: string;
}) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "relative flex h-10 w-10 touch-manipulation items-center justify-center rounded-md border border-brand-neutral bg-brand-surface text-brand-primary transition-colors",
        "hover:bg-brand-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary/40",
        className
      )}
      aria-label={isDark ? "Passer en mode jour" : "Passer en mode nuit"}
      title={isDark ? "Mode jour" : "Mode nuit"}
    >
      <Sun
        className={cn(
          "h-5 w-5 transition-all",
          isDark ? "scale-0 opacity-0" : "scale-100 opacity-100"
        )}
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 transition-all",
          isDark ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}
      />
    </button>
  );
}
