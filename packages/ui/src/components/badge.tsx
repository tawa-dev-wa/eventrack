import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "bg-brand-neutral/80 text-brand-primary dark:bg-brand-surface-raised dark:text-brand-primary",
        secondary:
          "bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/15",
        success:
          "bg-brand-success/10 text-green-700 dark:bg-brand-success/15 dark:text-brand-success",
        warning:
          "bg-brand-alert/10 text-orange-700 dark:bg-brand-alert/15 dark:text-brand-alert",
        critical:
          "bg-brand-critical/10 text-red-700 dark:bg-brand-critical/15 dark:text-brand-critical",
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
