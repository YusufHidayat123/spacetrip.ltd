import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-24 w-full resize-y rounded-xl border border-(--st-border) bg-white px-3.5 py-2.5 text-sm text-(--st-text) placeholder:text-(--st-text-muted) focus-visible:border-[#0D0D0D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5500]/25 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
