import * as React from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  right,
  badge,
  breadcrumb,
  className,
}: {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-semibold tracking-tight text-(--st-text)">
              {title}
            </h1>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 text-sm text-(--st-text-muted)">
              {description}
            </p>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
      {breadcrumb}
    </div>
  );
}
