"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export type CarouselImage = {
  id: string;
  url: string;
  alt: string;
};

export function ProductImageCarousel({
  images,
  badge,
  isSoldOut,
  className,
}: {
  images: CarouselImage[];
  badge?: string | null;
  isSoldOut?: boolean;
  className?: string;
}) {
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const imageCount = images.length;

  const updateActiveFromScroll = React.useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    const w = el.clientWidth;
    if (!w) return;

    const nextIndex = Math.max(0, Math.min(imageCount - 1, Math.round(el.scrollLeft / w)));
    setActiveIndex(nextIndex);
  }, [imageCount]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActiveFromScroll);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    updateActiveFromScroll();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [updateActiveFromScroll]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updateActiveFromScroll());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateActiveFromScroll]);

  const scrollToIndex = React.useCallback(
    (index: number) => {
      const el = viewportRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(imageCount - 1, index));
      const w = el.clientWidth;
      el.scrollTo({ left: clamped * w, behavior: "smooth" });
      setActiveIndex(clamped);
    },
    [imageCount]
  );

  if (imageCount === 0) {
    return (
      <section
        className={cn(
          "clip-chamfer-diagonal relative flex aspect-[3/4] w-full items-center justify-center rounded-2xl bg-(--st-surface-alt) font-mono-label text-xs uppercase tracking-[0.14em] text-(--st-text-muted)",
          className
        )}
      >
        Foto belum tersedia
      </section>
    );
  }

  return (
    <div className={cn("relative flex flex-col gap-3.5", className)}>
      {/* Signature Top-Left Asterisk */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-2 -top-2 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5500] text-sm font-bold text-white shadow-sm"
      >
        &#10035;
      </span>

      <section
        className="clip-chamfer-diagonal group relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-(--st-surface-alt)"
        aria-roledescription="carousel"
        aria-label="Galeri foto produk"
      >
        <div
          ref={viewportRef}
          className="no-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth overscroll-x-contain"
        >
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="relative h-full w-full shrink-0 snap-center"
              aria-roledescription="slide"
              aria-label={`Foto ${idx + 1} dari ${imageCount}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt}
                className={cn("h-full w-full object-cover", isSoldOut && "opacity-65 grayscale")}
              />
            </div>
          ))}
        </div>

        {/* Status / Drop badge top-left */}
        <div className="absolute left-5 top-5 flex flex-col gap-1.5">
          {isSoldOut ? (
            <span className="rounded-full bg-[#0D0D0D] px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
              SOLD OUT
            </span>
          ) : badge ? (
            <span className="rounded-full bg-[#FF5500] px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-xs">
              {badge}
            </span>
          ) : null}
        </div>

        {/* Counter top-right */}
        {imageCount > 1 ? (
          <div className="absolute right-4 top-4 rounded-full bg-[#0D0D0D]/80 px-3 py-1 font-mono-label text-[10px] font-medium tracking-[0.12em] text-white backdrop-blur-xs">
            0{activeIndex + 1} / 0{imageCount}
          </div>
        ) : null}

        {/* Prev / Next arrows on desktop hover */}
        {imageCount > 1 ? (
          <>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Foto sebelumnya"
              className="absolute left-3.5 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-(--st-border) bg-white/95 text-[#0D0D0D] opacity-0 shadow-sm transition hover:border-[#FF5500] hover:bg-[#FF5500] hover:text-white disabled:opacity-0 group-hover:opacity-100 md:inline-flex"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToIndex(activeIndex + 1)}
              disabled={activeIndex === imageCount - 1}
              aria-label="Foto berikutnya"
              className="absolute right-3.5 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-(--st-border) bg-white/95 text-[#0D0D0D] opacity-0 shadow-sm transition hover:border-[#FF5500] hover:bg-[#FF5500] hover:text-white disabled:opacity-0 group-hover:opacity-100 md:inline-flex"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}

        {/* Indicator pill bar on mobile */}
        {imageCount > 1 ? (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 md:hidden">
            {images.map((img, idx) => {
              const active = idx === activeIndex;
              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    active ? "w-6 bg-[#FF5500]" : "w-1.5 bg-white/85"
                  )}
                  aria-label={`Lihat foto ${idx + 1}`}
                  aria-current={active ? "true" : undefined}
                />
              );
            })}
          </div>
        ) : null}
      </section>

      {/* Thumbnail strip */}
      {imageCount > 1 ? (
        <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-6">
          {images.map((img, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => scrollToIndex(idx)}
                className={cn(
                  "relative aspect-[3/4] overflow-hidden rounded-xl border bg-(--st-surface-alt) transition",
                  active
                    ? "border-[#FF5500] ring-2 ring-[#FF5500]/25"
                    : "border-(--st-border) opacity-70 hover:opacity-100"
                )}
                aria-label={`Pilih thumbnail ${idx + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
