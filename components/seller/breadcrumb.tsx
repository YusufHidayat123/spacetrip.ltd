import Link from "next/link";

import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={`${item.label}-${idx}`} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-(--st-text-muted) hover:text-(--st-text)"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "text-(--st-text)"
                    : "text-(--st-text-muted)"
                }
              >
                {item.label}
              </span>
            )}
            {!isLast ? (
              <ChevronRight className="h-3.5 w-3.5 text-(--st-text-muted)" />
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
