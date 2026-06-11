import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-brand-neutral text-brand-primary",
        secondary: "bg-brand-secondary/10 text-brand-secondary",
        success: "bg-brand-success/10 text-green-700",
        warning: "bg-brand-alert/10 text-orange-700",
        critical: "bg-brand-critical/10 text-red-700",
        outline: "border border-brand-neutral text-brand-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
