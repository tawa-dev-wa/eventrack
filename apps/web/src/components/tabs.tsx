"use client";

import { cn } from "@eventrack/ui";

interface TabsProps {
  tabs: { id: string; label: string; badge?: number }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0", className)}>
      <div className="flex min-w-max gap-1 border-b border-brand-neutral">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors",
              active === tab.id
                ? "text-brand-secondary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-brand-secondary"
                : "text-brand-primary/50 hover:text-brand-primary"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-critical px-1 text-[10px] font-bold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
