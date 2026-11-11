import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] leading-5",
  {
    variants: {
      variant: {
        default: "border-(--st-border) bg-[#F3F3F1] text-(--st-text-muted)",
        amber: "border-[#FF5500] bg-[#FF5500] text-white",
        orangeSoft: "border-(--st-accent-border) bg-(--st-accent-soft) text-[#CC4400]",
        dark: "border-[#0D0D0D] bg-[#0D0D0D] text-white",
        blue: "border-[#DBEAFE] bg-[#EFF6FF] text-[#1D4ED8]",
        green: "border-[#D1FAE5] bg-[#ECFDF5] text-[#047857]",
        purple: "border-[#E9D5FF] bg-[#F5F3FF] text-[#6D28D9]",
        red: "border-[#FEE2E2] bg-[#FEF2F2] text-[#B91C1C]",
        neutral: "border-(--st-border) bg-white text-(--st-text-muted)",
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
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
