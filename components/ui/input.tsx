import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-(--st-border) bg-white px-3.5 py-2 text-sm text-(--st-text) placeholder:text-(--st-text-muted) focus-visible:border-[#0D0D0D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]/25 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
