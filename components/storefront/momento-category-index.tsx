"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { CategoryWithCount } from "@/lib/catalog/public";
import { formatIDR } from "@/lib/orders/format";
import { ChamferedCard } from "@/components/storefront/chamfered-card";
import { cn } from "@/lib/utils";

function resolveImgUrl(storagePath: string | null | undefined, fallback: string) {
  if (!storagePath) return fallback;
  if (storagePath.startsWith("http")) return storagePath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";
  return `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export function MomentoCategoryIndex({
  categories,
  fallbackImageUrl,
}: {
  categories: CategoryWithCount[];
  fallbackImageUrl: string;
}) {
  const nonEmpty = categories.filter((c) => c.productCount > 0);
  const items = nonEmpty.length > 0 ? nonEmpty : categories;
  const [activeId, setActiveId] = React.useState<string>(items[0]?.id ?? "");

  if (items.length === 0) return null;

  const activeIndex = Math.max(
    0,
    items.findIndex((c) => c.id === activeId)
  );
  const current = items[activeIndex] ?? items[0];
  const previewImage = resolveImgUrl(current.previewImagePath, fallbackImageUrl);
  const categoryHref = `/products?category=${encodeURIComponent(current.slug)}`;

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 lg:py-20">
      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left: Micro Metadata + Interactive Category List */}
        <div className="min-w-0 lg:col-span-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5500] text-xs font-bold text-white"
              >
                &#10035;
              </span>
              <span className="font-mono-label text-[11px] font-medium uppercase tracking-[0.12em] text-(--st-text-muted)">
                (100% Curated)
              </span>
            </div>

            <span className="font-mono-label text-[11px] font-medium uppercase tracking-[0.14em] text-(--st-text-muted)">
              [{String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(items.length).padStart(2, "0")}]
            </span>
          </div>

          <div className="mt-6 space-y-1 sm:mt-8">
            {items.map((cat) => {
              const active = cat.id === current.id;
              return (
                <div key={cat.id} className="group flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onMouseEnter={() => setActiveId(cat.id)}
                    onClick={() => setActiveId(cat.id)}
                    className={cn(
                      "flex min-w-0 flex-1 items-baseline gap-2.5 py-1.5 text-left font-display text-2xl tracking-tight transition sm:text-3xl lg:text-[2.35rem] lg:leading-[1.12]",
                      active
                        ? "font-semibold text-[#0D0D0D]"
                        : "font-medium text-(--st-text-muted)/70 hover:text-[#0D0D0D]"
                    )}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span
                      className={cn(
                        "shrink-0 font-mono-label text-xs sm:text-sm",
                        active ? "text-[#FF5500]" : "text-(--st-text-muted)/70"
                      )}
                    >
                      ({cat.productCount})
                    </span>
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
                      >
                        &#10035;
                      </span>
                    ) : null}
                  </button>

                  <Link
                    href={`/products?category=${encodeURIComponent(cat.slug)}`}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] transition",
                      active
                        ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                        : "border-transparent text-transparent group-hover:border-(--st-border) group-hover:text-(--st-text)"
                    )}
                  >
                    <span>Shop</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex items-center gap-3">
            <Link
              href={categoryHref}
              className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#FF5500]"
            >
              <span>Explore {current.name}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-full border border-(--st-border) bg-white px-5 py-3 text-xs font-medium text-(--st-text) transition hover:border-[#0D0D0D]"
            >
              <span>All Archive</span>
            </Link>
          </div>
        </div>

        {/* Right: Clipped Dynamic Category Look Preview */}
        <div className="min-w-0 lg:col-span-6">
          <ChamferedCard
            variant="notch-br"
            aspectClass="aspect-[4/4.3] sm:aspect-[5/4.8]"
            href={categoryHref}
            actionLabel={`Explore ${current.name}`}
            actionVariant="dark"
            topLeftSlot={
              <span className="rounded-full bg-white/95 px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0D0D0D] backdrop-blur-xs">
                [2026 Drop]
              </span>
            }
            bottomLeftSlot={
              current.previewTitle ? (
                <div className="max-w-[calc(100vw-116px)] rounded-2xl bg-white/92 px-3.5 py-2 backdrop-blur-md sm:max-w-none">
                  <div className="max-w-[180px] truncate text-xs font-semibold text-[#0D0D0D] sm:max-w-[230px]">
                    {current.previewTitle}
                  </div>
                  {current.previewPrice ? (
                    <div className="font-mono-label text-[11px] font-medium text-[#FF5500]">
                      Start from {formatIDR(current.previewPrice)}
                    </div>
                  ) : null}
                </div>
              ) : null
            }
          >
            <Link href={categoryHref} className="block h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={previewImage}
                src={previewImage}
                alt={current.name}
                className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
              />
            </Link>
          </ChamferedCard>
        </div>
      </div>
    </section>
  );
}
