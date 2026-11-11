"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Eye, Heart, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";
import { formatIDR } from "@/lib/orders/format";
import { ChamferedCard } from "@/components/storefront/chamfered-card";

export type ProductCardVariant = {
  id: string;
  size_label: string;
  stock: number;
  is_active?: boolean;
};

export function ProductCard({
  id,
  slug,
  name,
  description,
  price,
  originalPrice,
  categoryName,
  condition,
  color,
  material,
  measurements,
  styleTags,
  badge,
  image,
  variants,
  showAsterisk,
}: {
  id?: string;
  slug: string;
  name: string;
  description?: string | null;
  price: string;
  originalPrice?: string | null;
  categoryName?: string | null;
  condition?: string | null;
  color?: string | null;
  material?: string | null;
  measurements?: string | null;
  styleTags?: string[] | null;
  badge?: string | null;
  image: { storage_path: string; alt: string | null } | null;
  variants?: ProductCardVariant[];
  showAsterisk?: boolean;
}) {
  const { isWishlisted, toggleWishlist, addItem, openQuickView } = useCart();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";

  const imgUrl = image?.storage_path
    ? image.storage_path.startsWith("http")
      ? image.storage_path
      : `${supabaseUrl}/storage/v1/object/public/${bucket}/${image.storage_path}`
    : null;

  const activeVariants = (variants ?? []).filter((v) => v.is_active !== false);
  const totalStock = activeVariants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  const hasVariantsData = Array.isArray(variants) && variants.length > 0;
  const isSoldOut = hasVariantsData && totalStock <= 0;
  const firstAvailableVariant = activeVariants.find((v) => v.stock > 0) ?? null;

  const numPrice = Number(price);
  const numOrig = originalPrice ? Number(originalPrice) : null;
  const hasDiscount =
    numOrig !== null && Number.isFinite(numOrig) && Number.isFinite(numPrice) && numOrig > numPrice;

  const wishlisted = id ? isWishlisted(id) : false;

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (id) void toggleWishlist(id);
  }

  function handleQuickView(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    openQuickView({
      id,
      slug,
      name,
      description,
      price,
      original_price: originalPrice,
      condition,
      color,
      material,
      measurements,
      style_tags: styleTags,
      badge,
      categoryName,
      images: image ? [{ storage_path: image.storage_path, alt: image.alt }] : [],
      variants: activeVariants,
    });
  }

  function handleVariantQuickAdd(e: React.MouseEvent, variant: ProductCardVariant) {
    e.preventDefault();
    e.stopPropagation();
    if (!id || !imgUrl || variant.stock <= 0) return;
    addItem({
      productId: id,
      variantId: variant.id,
      slug,
      name,
      sizeLabel: variant.size_label,
      price: numPrice,
      maxStock: variant.stock,
      imageUrl: imgUrl,
      categoryName,
      quantity: 1,
    });
  }

  const topLeftSlot = isSoldOut ? (
    <span className="rounded-full bg-[#0D0D0D] px-2.5 py-1 font-mono-label text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
      SOLD OUT
    </span>
  ) : badge ? (
    <span className="rounded-full bg-[#FF5500] px-2.5 py-1 font-mono-label text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
      {badge}
    </span>
  ) : totalStock > 0 && totalStock <= 2 ? (
    <span className="rounded-full bg-white/95 px-2.5 py-1 font-mono-label text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0D0D0D]">
      {totalStock} LEFT
    </span>
  ) : null;

  const topRightSlot = id ? (
    <>
      <button
        type="button"
        onClick={handleWishlist}
        aria-label={wishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-xs transition active:scale-95",
          wishlisted
            ? "border-[#FF5500] bg-[#FF5500] text-white"
            : "border-(--st-border) bg-white/90 text-(--st-text) hover:border-[#FF5500] hover:text-[#FF5500]"
        )}
      >
        <Heart className={cn("h-3.5 w-3.5", wishlisted && "fill-current")} />
      </button>

      <button
        type="button"
        onClick={handleQuickView}
        aria-label={`Quick view ${name}`}
        title="Quick View"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--st-border) bg-white/90 text-(--st-text) backdrop-blur-xs transition hover:border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white active:scale-95 md:opacity-0 md:group-hover:opacity-100"
      >
        <Eye className="h-3.5 w-3.5" />
      </button>
    </>
  ) : null;

  return (
    <div className="group relative flex min-w-0 flex-col">
      <ChamferedCard
        variant="diagonal"
        aspectClass="aspect-[3/4]"
        hideActionButton
        showAsterisk={showAsterisk}
        topLeftSlot={topLeftSlot}
        topRightSlot={topRightSlot}
      >
        <Link href={`/products/${slug}`} className="block h-full w-full">
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt={image?.alt ?? name}
              loading="lazy"
              className={cn(
                "h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.04]",
                isSoldOut && "opacity-60 grayscale"
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-(--st-text-muted)">
              No image
            </div>
          )}
        </Link>

        {/* Mobile Quick Add Pill */}
        {!isSoldOut && firstAvailableVariant && id ? (
          <button
            type="button"
            onClick={(e) =>
              activeVariants.length > 1
                ? handleQuickView(e)
                : handleVariantQuickAdd(e, firstAvailableVariant)
            }
            aria-label={`Tambah cepat ${name}`}
            className="absolute bottom-3 left-3 inline-flex h-8 items-center gap-1 rounded-full bg-[#0D0D0D]/90 px-3 font-mono-label text-[10px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-xs transition active:scale-95 hover:bg-[#FF5500] md:hidden"
          >
            <Plus className="h-3 w-3" />
            {activeVariants.length > 1 ? "Size" : firstAvailableVariant.size_label}
          </button>
        ) : null}

        {/* Desktop Interactive Hover Size Picker Bar */}
        {!isSoldOut && activeVariants.length > 0 && id ? (
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 hidden translate-y-2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 md:block">
            <div className="rounded-xl bg-white/95 p-2.5 shadow-lg backdrop-blur-md">
              <div className="mb-1.5 flex items-center justify-between px-0.5 font-mono-label text-[9px] uppercase tracking-[0.1em] text-(--st-text-muted)">
                <span>Quick Add</span>
                <button
                  type="button"
                  onClick={handleQuickView}
                  className="font-semibold text-[#0D0D0D] hover:text-[#FF5500]"
                >
                  Detail
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {activeVariants.map((v) => {
                  const disabled = v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={disabled}
                      onClick={(e) => handleVariantQuickAdd(e, v)}
                      title={disabled ? `${v.size_label} habis` : `Tambah size ${v.size_label}`}
                      className={cn(
                        "flex-1 min-w-[32px] rounded-lg border py-1.5 font-mono-label text-[10px] font-semibold uppercase transition",
                        disabled
                          ? "cursor-not-allowed border-(--st-border) bg-(--st-bg) text-(--st-text-muted)/45 line-through"
                          : "border-(--st-border) bg-white text-(--st-text) hover:border-[#FF5500] hover:bg-[#FF5500] hover:text-white"
                      )}
                    >
                      {v.size_label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </ChamferedCard>

      {/* Product Metadata Row */}
      <Link href={`/products/${slug}`} className="mt-3 flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-mono-label text-[10px] uppercase tracking-[0.06em] text-(--st-text-muted)">
            <span className="truncate">{categoryName ?? "Curated"}</span>
            {condition ? (
              <>
                <span>·</span>
                <span className="shrink-0 text-[#0D0D0D]">{condition}</span>
              </>
            ) : null}
          </div>

          <h3 className="mt-1 truncate text-sm font-medium tracking-tight text-(--st-text) transition group-hover:text-[#FF5500]">
            {name}
          </h3>

          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <span className="text-xs font-semibold text-(--st-text) sm:text-sm">
              {formatIDR(price)}
            </span>
            {hasDiscount ? (
              <span className="text-[11px] text-(--st-text-muted) line-through">
                {formatIDR(String(numOrig))}
              </span>
            ) : null}
            {color ? (
              <span className="hidden truncate text-[11px] text-(--st-text-muted) sm:inline">
                · {color}
              </span>
            ) : null}
          </div>
        </div>

        <span
          aria-hidden="true"
          className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text) transition group-hover:border-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-white"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </div>
  );
}
