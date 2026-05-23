import Link from "next/link";

import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageSize,
  total,
  href,
  className,
}: {
  page: number;
  pageSize: number;
  total: number;
  href: (page: number) => string;
  className?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="text-xs text-[color:var(--st-text-muted)]">
        Page <span className="font-medium text-[color:var(--st-text)]">{page}</span> of {totalPages} · {total} items
      </div>

      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span className="rounded-md border border-[color:var(--st-border)] bg-white px-3 py-1.5 text-xs text-[color:var(--st-text-muted)] opacity-50">
            Prev
          </span>
        ) : (
          <Link
            href={href(page - 1)}
            className="rounded-md border border-[color:var(--st-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--st-text)] hover:bg-[#F7F8FA]"
          >
            Prev
          </Link>
        )}

        {nextDisabled ? (
          <span className="rounded-md border border-[color:var(--st-border)] bg-white px-3 py-1.5 text-xs text-[color:var(--st-text-muted)] opacity-50">
            Next
          </span>
        ) : (
          <Link
            href={href(page + 1)}
            className="rounded-md border border-[color:var(--st-border)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--st-text)] hover:bg-[#F7F8FA]"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
