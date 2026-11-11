import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 font-mono-label text-[10px] uppercase tracking-[0.12em]"
    >
      <span
        aria-hidden="true"
        className="mr-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5500] text-[9px] font-bold text-white"
      >
        &#10035;
      </span>
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <div key={`${item.label}-${idx}`} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-(--st-text-muted) transition hover:text-[#FF5500]"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-[#0D0D0D]" : "text-(--st-text-muted)"}>
                {item.label}
              </span>
            )}
            {!isLast ? <ChevronRight className="h-3 w-3 text-(--st-text-muted)" /> : null}
          </div>
        );
      })}
    </nav>
  );
}
