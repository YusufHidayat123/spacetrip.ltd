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
      <div className="text-xs text-(--st-text-muted)">
        Halaman <span className="font-medium text-(--st-text)">{page}</span> dari {totalPages} · {total} item
      </div>

      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span className="rounded-md border border-(--st-border) bg-white px-3 py-1.5 text-xs text-(--st-text-muted) opacity-50">
            Sebelumnya
          </span>
        ) : (
          <Link
            href={href(page - 1)}
            className="rounded-md border border-(--st-border) bg-white px-3 py-1.5 text-xs font-medium text-(--st-text) hover:bg-[#F7F8FA]"
          >
            Sebelumnya
          </Link>
        )}

        {nextDisabled ? (
          <span className="rounded-md border border-(--st-border) bg-white px-3 py-1.5 text-xs text-(--st-text-muted) opacity-50">
            Berikutnya
          </span>
        ) : (
          <Link
            href={href(page + 1)}
            className="rounded-md border border-(--st-border) bg-white px-3 py-1.5 text-xs font-medium text-(--st-text) hover:bg-[#F7F8FA]"
          >
            Berikutnya
          </Link>
        )}
      </div>
    </div>
  );
}
