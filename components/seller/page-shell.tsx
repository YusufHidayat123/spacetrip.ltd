import * as React from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        className
      )}
    >
      {children}
    </div>
  );
}
