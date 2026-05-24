"use client";

import * as React from "react";

import Link from "next/link";

import { ChevronLeft, Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { StoreDrawer } from "@/components/storefront/store-drawer";

export function StoreHeader({
  title,
  backHref,
  rightHref,
  rightLabel,
  showMenu = true,
  className,
}: {
  title?: string;
  backHref?: string;
  rightHref?: string;
  rightLabel?: string;
  showMenu?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  function close() {
    setOpen(false);
  }
  return (
    <header className={cn("flex items-center justify-between gap-3 px-5 pt-6", className)}>
      <div className="w-10">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text)"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 text-center">
        {title ? (
          <div className="truncate text-sm font-semibold tracking-tight text-(--st-text)">
            {title}
          </div>
        ) : (
          <div className="text-sm font-semibold tracking-tight text-(--st-text)">spacetrip</div>
        )}
      </div>

      <div className="flex w-10 items-center justify-end">
        {showMenu ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={rightLabel ?? "Menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text)"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : rightHref ? (
          <Link
            href={rightHref}
            aria-label={rightLabel ?? "Menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text)"
          >
            <Menu className="h-5 w-5" />
          </Link>
        ) : (
          <div className="h-10 w-10" />
        )}
      </div>

      <StoreDrawer open={open} onClose={close} />
    </header>
  );
}
