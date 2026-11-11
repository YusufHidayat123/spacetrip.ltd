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
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-(--st-border) pb-5 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0 space-y-2">
        {breadcrumb}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-medium tracking-tight text-[#0D0D0D] sm:text-3xl lg:text-[2.15rem]">
            {title}
          </h1>
          {badge}
        </div>
        {description ? (
          <p className="text-xs text-(--st-text-muted) sm:text-sm">{description}</p>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
