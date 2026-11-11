"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type ChamferVariant = "diagonal" | "diagonal-sm" | "notch-tr" | "notch-br";

/**
 * Reusable Momento signature chamfered/notched frame.
 * Combines smooth rounded outer corners with 45-degree diagonal cuts and an optional
 * inverted corner notch housing the floating circular/rounded-square `↗` action button.
 */
export function ChamferedCard({
  variant = "diagonal",
  aspectClass = "aspect-[3/4]",
  href,
  onActionClick,
  actionLabel = "Explore",
  hideActionButton = false,
  actionVariant = "light",
  showAsterisk = false,
  topLeftSlot,
  topRightSlot,
  bottomLeftSlot,
  children,
  className,
  mediaClassName,
}: {
  variant?: ChamferVariant;
  aspectClass?: string;
  href?: string;
  onActionClick?: (e: React.MouseEvent) => void;
  actionLabel?: string;
  hideActionButton?: boolean;
  actionVariant?: "light" | "dark" | "orange";
  showAsterisk?: boolean;
  topLeftSlot?: React.ReactNode;
  topRightSlot?: React.ReactNode;
  bottomLeftSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  mediaClassName?: string;
}) {
  const clipClass =
    variant === "notch-tr"
      ? "clip-chamfer-notch-tr"
      : variant === "notch-br"
        ? "clip-chamfer-notch-br"
        : variant === "diagonal-sm"
          ? "clip-chamfer-diagonal-sm"
          : "clip-chamfer-diagonal";

  const hasNotch = variant === "notch-tr" || variant === "notch-br";
  const notchPosClass =
    variant === "notch-tr"
      ? "right-0 top-0"
      : variant === "notch-br"
        ? "right-0 bottom-0"
        : "right-3 bottom-3";

  const btnStyle =
    actionVariant === "dark"
      ? "bg-[#0D0D0D] text-white border-[#0D0D0D] hover:bg-[#FF5500] hover:border-[#FF5500]"
      : actionVariant === "orange"
        ? "bg-[#FF5500] text-white border-[#FF5500] hover:bg-[#0D0D0D] hover:border-[#0D0D0D]"
        : "bg-white text-[#0D0D0D] border-(--st-border) hover:bg-[#FF5500] hover:text-white hover:border-[#FF5500]";

  const actionButton = !hideActionButton && (hasNotch || onActionClick || href) ? (
    onActionClick ? (
      <button
        type="button"
        onClick={onActionClick}
        aria-label={actionLabel}
        title={actionLabel}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-xs transition duration-200 active:scale-95 sm:h-12 sm:w-12 sm:rounded-2xl",
          btnStyle
        )}
      >
        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    ) : href ? (
      <Link
        href={href}
        aria-label={actionLabel}
        title={actionLabel}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl border shadow-xs transition duration-200 active:scale-95 sm:h-12 sm:w-12 sm:rounded-2xl",
          btnStyle
        )}
      >
        <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </Link>
    ) : null
  ) : null;

  return (
    <div className={cn("group relative min-w-0", className)}>
      {/* Optional outer top-left eight-spoke orange asterisk signature badge */}
      {showAsterisk ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-2 -top-2 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5500] text-sm font-bold leading-none text-white shadow-sm sm:h-8 sm:w-8 sm:text-base"
        >
          &#10035;
        </span>
      ) : null}

      {/* Clipped Media Stage */}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-2xl bg-(--st-surface-alt)",
          aspectClass,
          clipClass,
          mediaClassName
        )}
      >
        {children}

        {topLeftSlot ? (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
            {topLeftSlot}
          </div>
        ) : null}

        {topRightSlot ? (
          <div className="absolute right-3 top-3 z-20 flex flex-col gap-1.5">
            {topRightSlot}
          </div>
        ) : null}

        {bottomLeftSlot ? (
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5">
            {bottomLeftSlot}
          </div>
        ) : null}
      </div>

      {/* Action `↗` button seated cleanly inside the cutout corner (or bottom-right overlay for notch cards) */}
      {hasNotch && actionButton ? (
        <div className={cn("absolute z-20 flex items-center justify-center", notchPosClass)}>
          {actionButton}
        </div>
      ) : null}
    </div>
  );
}

