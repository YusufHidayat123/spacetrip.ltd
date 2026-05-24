"use client";

import * as React from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (!open) return;

    // Prevent background scroll while the sheet is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] transition",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={open ? undefined : true}
    >
      {/* overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/35 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 mx-auto w-full max-w-[420px]",
          "transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog"}
      >
        <div
          className={cn(
            "rounded-t-[28px] border border-(--st-border) bg-white shadow-[0_-18px_60px_rgba(17,24,39,0.25)]",
            className
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-(--st-border) px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-[#E5E7EB]" />
              {title ? (
                <div className="mt-3 truncate text-sm font-semibold tracking-tight text-(--st-text)">
                  {title}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text)"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[min(78dvh,680px)] overflow-auto px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
