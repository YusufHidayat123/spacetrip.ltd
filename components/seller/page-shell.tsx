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
    <div className={cn("mx-auto w-full max-w-[1200px] px-6 py-6", className)}>
      {children}
    </div>
  );
}
