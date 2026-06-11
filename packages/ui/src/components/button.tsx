import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-navy text-white hover:bg-brand-navy/90",
        secondary: "bg-brand-secondary text-white hover:bg-brand-secondary/90",
        alert: "bg-brand-alert text-white hover:bg-brand-alert/90",
        success: "bg-brand-success text-white hover:bg-brand-success/90",
        outline:
          "border border-brand-neutral bg-brand-surface text-brand-primary hover:bg-brand-background",
        ghost: "text-brand-primary hover:bg-brand-neutral/50",
        destructive:
          "border border-brand-critical text-brand-critical bg-brand-surface hover:bg-brand-critical/10",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
