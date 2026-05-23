import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5",
  {
    variants: {
      variant: {
        default:
          "border-[color:var(--st-border)] bg-[#F7F8FA] text-[color:var(--st-text-muted)]",
        amber:
          "border-[color:var(--st-accent-border)] bg-[color:var(--st-accent-soft)] text-[color:var(--st-text)]",
        blue: "border-[#DBEAFE] bg-[#EFF6FF] text-[#1D4ED8]",
        green: "border-[#D1FAE5] bg-[#ECFDF5] text-[#047857]",
        purple: "border-[#E9D5FF] bg-[#F5F3FF] text-[#6D28D9]",
        red: "border-[#FEE2E2] bg-[#FEF2F2] text-[#B91C1C]",
        neutral:
          "border-[color:var(--st-border)] bg-white text-[color:var(--st-text-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
