import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[96px] w-full resize-y rounded-md border border-[color:var(--st-border)] bg-white px-3 py-2 text-sm text-[color:var(--st-text)] placeholder:text-[color:var(--st-text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--st-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
