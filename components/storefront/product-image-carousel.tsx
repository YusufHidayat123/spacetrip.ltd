"use client";

import * as React from "react";

import Image from "next/image";

import { cn } from "@/lib/utils";

export type CarouselImage = {
  id: string;
  url: string;
  alt: string;
};

export function ProductImageCarousel({
  images,
  className,
}: {
  images: CarouselImage[];
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
    if (!el) return;
    if (typeof ResizeObserver === "undefined") return;

    // Keep dot state correct if viewport width changes (rotation / responsive).
    const ro = new ResizeObserver(() => updateActiveFromScroll());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateActiveFromScroll]);

  const scrollToIndex = React.useCallback((index: number) => {
    const el = viewportRef.current;
    if (!el) return;

    const w = el.clientWidth;
    el.scrollTo({ left: index * w, behavior: "smooth" });
  }, []);

  if (imageCount === 0) {
    return (
      <section
        className={cn(
          "relative aspect-[4/5] w-full bg-[#F7F8FA]",
          "flex items-center justify-center text-xs text-(--st-text-muted)",
          className
        )}
      >
        Belum ada gambar
      </section>
    );
  }

  return (
    <section
      className={cn("relative aspect-[4/5] w-full bg-[#F7F8FA]", className)}
      aria-roledescription="carousel"
      aria-label="Foto produk"
    >
      <div
        ref={viewportRef}
        className={cn(
          "h-full w-full overflow-x-auto scroll-smooth",
          "flex snap-x snap-mandatory",
          "overscroll-x-contain"
        )}
      >
        {images.map((img, idx) => (
          <div
            key={img.id}
            className="relative h-full w-full shrink-0 snap-center"
            aria-roledescription="slide"
            aria-label={`Foto ${idx + 1} dari ${imageCount}`}
          >
            <Image
              src={img.url}
              alt={img.alt}
              fill
              sizes="(max-width: 420px) 100vw, 420px"
              className="object-cover"
              priority={idx === 0}
            />
          </div>
        ))}
      </div>

      {imageCount > 1 ? (
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2">
          {images.map((img, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => scrollToIndex(idx)}
                className={cn(
                  "h-2 w-2 rounded-full transition",
                  active ? "bg-(--st-accent)" : "bg-white/80",
                  "shadow-[0_2px_8px_rgba(17,24,39,0.18)]"
                )}
                aria-label={`Ke foto ${idx + 1}`}
                aria-current={active ? "true" : undefined}
              />
            );
          })}
        </div>
      ) : null}

      {/* Counter pill (nice on desktop too) */}
      {imageCount > 1 ? (
        <div className="absolute right-4 top-4 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white">
          {activeIndex + 1}/{imageCount}
        </div>
      ) : null}
    </section>
  );
}
