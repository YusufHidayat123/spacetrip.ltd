import * as React from "react";

import { cn } from "@/lib/utils";

export function MiniLineChart({
  values,
  className,
}: {
  values: number[];
  className?: string;
}) {
  const width = 260;
  const height = 72;
  const padding = 6;

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = padding + (i * (width - padding * 2)) / (values.length - 1);
      const y =
        height -
        padding -
        ((v - min) * (height - padding * 2)) / range;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-[72px] w-full", className)}
      role="img"
      aria-label="Chart"
    >
      <polyline
        fill="none"
        stroke="var(--st-accent)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      <polyline
        fill="none"
        stroke="rgba(17,24,39,0.08)"
        strokeWidth="1"
        points={`${padding},${height - padding} ${width - padding},${height - padding}`}
      />
    </svg>
  );
}
