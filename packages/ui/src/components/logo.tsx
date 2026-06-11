"use client";

import { cn } from "../lib/utils";

interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
  /** Affiche le logo en clair sur fond sombre (sidebar) */
  onDark?: boolean;
}

export function Logo({
  variant = "full",
  className,
  onDark = false,
}: LogoProps) {
  const isFull = variant === "full";
  const src = isFull ? "/logo-full.png" : "/logo-icon.png";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Eventrack"
      width={isFull ? 320 : 48}
      height={isFull ? 64 : 48}
      decoding="async"
      className={cn(
        "block object-contain object-left",
        isFull ? "h-16 w-auto" : "h-11 w-11",
        onDark && "brightness-0 invert",
        className
      )}
    />
  );
}
