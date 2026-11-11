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
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <div className="font-mono-label text-[11px] uppercase tracking-[0.08em] text-(--st-text-muted)">
        Page <span className="font-semibold text-[#0D0D0D]">{page}</span> / {totalPages} &middot;{" "}
        {total} items
      </div>

      <div className="flex items-center gap-2">
        {prevDisabled ? (
          <span className="rounded-full border border-(--st-border) bg-white px-4 py-1.5 font-mono-label text-[11px] font-medium text-(--st-text-muted) opacity-45">
            Sebelumnya
          </span>
        ) : (
          <Link
            href={href(page - 1)}
            className="rounded-full border border-(--st-border) bg-white px-4 py-1.5 font-mono-label text-[11px] font-medium text-[#0D0D0D] transition hover:border-[#FF5500] hover:text-[#FF5500]"
          >
            Sebelumnya
          </Link>
        )}

        {nextDisabled ? (
          <span className="rounded-full border border-(--st-border) bg-white px-4 py-1.5 font-mono-label text-[11px] font-medium text-(--st-text-muted) opacity-45">
            Berikutnya
          </span>
        ) : (
          <Link
            href={href(page + 1)}
            className="rounded-full border border-(--st-border) bg-white px-4 py-1.5 font-mono-label text-[11px] font-medium text-[#0D0D0D] transition hover:border-[#FF5500] hover:text-[#FF5500]"
          >
            Berikutnya
          </Link>
        )}
      </div>
    </div>
  );
}
