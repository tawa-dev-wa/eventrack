"use client";

import { ThemeToggle } from "@eventrack/ui";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <ThemeToggle theme={theme} onToggle={toggleTheme} className={className} />
  );
}
