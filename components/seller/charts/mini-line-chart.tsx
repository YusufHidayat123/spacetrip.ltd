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

  const safeValues = values.length > 0 ? values : [0, 0];
  const min = Math.min(...safeValues, 0);
  const max = Math.max(...safeValues, 1);
  const range = max - min || 1;
  const denom = Math.max(1, safeValues.length - 1);

  const points = safeValues
    .map((v, i) => {
      const x = padding + (i * (width - padding * 2)) / denom;
      const y = height - padding - ((v - min) * (height - padding * 2)) / range;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-[56px] w-full", className)}
      role="img"
      aria-label="Chart"
    >
      <polyline
        fill="none"
        stroke="#FF5500"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
      <polyline
        fill="none"
        stroke="#DFDFDA"
        strokeWidth="1"
        points={`${padding},${height - padding} ${width - padding},${height - padding}`}
      />
    </svg>
  );
}
