"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@eventrack/ui";

interface AccordionItemProps {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function AccordionItem({
  title,
  count,
  defaultOpen = false,
  children,
}: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-brand-neutral bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-brand-primary hover:bg-brand-background/50"
      >
        <span>
          {title}
          {count !== undefined && (
            <span className="ml-2 font-normal text-brand-primary/40">
              ({count})
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-brand-primary/40 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="border-t border-brand-neutral px-4 py-3">{children}</div>}
    </div>
  );
}
