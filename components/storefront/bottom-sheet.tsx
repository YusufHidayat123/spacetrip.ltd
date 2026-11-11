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

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] overflow-hidden transition",
        open ? "pointer-events-auto visible" : "pointer-events-none invisible"
      )}
      aria-hidden={open ? undefined : true}
    >
      {/* overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* sheet / modal */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 mx-auto w-full max-w-[480px] md:bottom-auto md:top-1/2 md:max-w-lg md:-translate-y-1/2 md:px-4",
          "transition-all duration-200",
          open
            ? "translate-y-0 opacity-100 md:scale-100"
            : "translate-y-full opacity-0 md:translate-y-0 md:scale-95"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog"}
      >
        <div
          className={cn(
            "rounded-t-3xl border border-(--st-border) bg-white shadow-[0_-18px_60px_rgba(13,13,13,0.22)] md:rounded-3xl md:shadow-[0_24px_64px_rgba(13,13,13,0.22)]",
            className
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-(--st-border) px-6 py-4">
            <div className="min-w-0 flex-1">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-(--st-border) md:hidden" />
              {title ? (
                <div className="mt-3 truncate font-display text-sm font-semibold tracking-tight text-(--st-text) md:mt-0 md:text-base">
                  {title}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--st-border) bg-(--st-bg) text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[min(78dvh,680px)] overflow-auto px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
