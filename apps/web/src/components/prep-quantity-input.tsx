"use client";

import { useEffect, useState } from "react";
import { Input } from "@eventrack/ui";
import { cn } from "@eventrack/ui";

export function PrepQuantityInput({
  value,
  max,
  onChange,
  mobile = false,
}: {
  value: number;
  max: number;
  onChange: (quantity: number) => void;
  mobile?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  function commit() {
    const parsed = Number(draft);
    if (draft.trim() === "" || Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const clamped = Math.max(0, Math.min(Math.round(parsed), max));
    setDraft(String(clamped));
    if (clamped !== value) onChange(clamped);
  }

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={0}
      max={max}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onFocus={(e) => {
        setFocused(true);
        e.target.select();
      }}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
      aria-label="Quantité préparée"
      className={cn(
        "text-center font-bold text-brand-primary",
        mobile ? "h-14 w-24 text-2xl" : "h-11 w-24 text-lg"
      )}
    />
  );
}
