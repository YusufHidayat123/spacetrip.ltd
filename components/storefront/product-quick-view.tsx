"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Heart, Minus, Plus, Ruler, ShoppingBag, X } from "lucide-react";

import { useCart } from "@/lib/cart/cart-context";
import type { QuickViewProduct } from "@/lib/catalog/types";
import { formatIDR } from "@/lib/orders/format";
import { cn } from "@/lib/utils";

function resolveImageUrl(storagePath: string) {
  if (!storagePath) return "";
  if (storagePath.startsWith("http")) return storagePath;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";
  return `${url}/storage/v1/object/public/${bucket}/${storagePath}`;
}

function QuickViewContent({
  product,
  onClose,
}: {
  product: QuickViewProduct;
  onClose: () => void;
}) {
  const { addItem, isWishlisted, toggleWishlist } = useCart();

  const variants = (product.variants ?? []).filter((v) => v.is_active !== false);
  const firstAvailable = variants.find((v) => v.stock > 0) ?? variants[0] ?? null;

  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(
    firstAvailable?.id ?? ""
  );
  const [quantity, setQuantity] = React.useState<number>(1);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? firstAvailable;

  const totalStock = variants.reduce((s, v) => s + (v.stock ?? 0), 0);
  const isSoldOut = variants.length > 0 && totalStock <= 0;
  const maxStock = selectedVariant?.stock ?? 0;
  const safeQty = maxStock > 0 ? Math.min(Math.max(1, quantity), maxStock) : 1;

  const mainImage = product.images[0] ?? null;
  const mainImageUrl = mainImage ? resolveImageUrl(mainImage.storage_path) : "";

  const numPrice = Number(product.price ?? 0);
  const numOrig = product.original_price ? Number(product.original_price) : null;
  const hasDiscount =
    numOrig !== null && Number.isFinite(numOrig) && Number.isFinite(numPrice) && numOrig > numPrice;

  const wishlisted = isWishlisted(product.id);

  function handleAddToBag() {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      slug: product.slug,
      name: product.name,
      sizeLabel: selectedVariant.size_label,
      price: numPrice,
      maxStock: selectedVariant.stock,
      imageUrl: mainImageUrl,
      categoryName: product.categoryName,
      quantity: safeQty,
    });
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.98 }}
      transition={{ type: "spring", damping: 30, stiffness: 320 }}
      className="relative z-10 flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-(--st-border) bg-white shadow-2xl sm:grid sm:grid-cols-12 sm:rounded-3xl"
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup Quick View"
        className="absolute right-4 top-4 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--st-border) bg-white/95 text-(--st-text) transition hover:border-[#0D0D0D]"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Left: Studio Product Image in Chamfer Frame */}
      <div className="relative flex flex-col bg-(--st-bg) p-4 sm:col-span-5">
        <div className="clip-chamfer-diagonal relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-(--st-surface-alt) sm:aspect-[3/4] sm:h-full">
          {mainImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mainImageUrl}
              alt={mainImage?.alt ?? product.name}
              className={cn("h-full w-full object-cover", isSoldOut && "opacity-60 grayscale")}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-(--st-text-muted)">
              No image
            </div>
          )}

          {product.badge || isSoldOut ? (
            <span className="absolute left-3 top-3 rounded-full bg-[#FF5500] px-2.5 py-1 font-mono-label text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
              {isSoldOut ? "SOLD OUT" : product.badge}
            </span>
          ) : null}
        </div>
      </div>

      {/* Right: Interactive Controls & Specs */}
      <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:col-span-7 sm:p-7">
        <div className="pr-8">
          <div className="flex flex-wrap items-center gap-2 font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text-muted)">
            <span>[{product.categoryName ?? "Curated Drop"}]</span>
            {product.condition ? (
              <span className="rounded-full bg-[#FF5500]/12 px-2 py-0.5 text-[#FF5500]">
                {product.condition}
              </span>
            ) : null}
          </div>

          <h2 className="mt-2 font-display text-xl font-bold leading-tight tracking-tight text-(--st-text) sm:text-2xl">
            {product.name}
          </h2>

          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="font-display text-xl font-bold text-(--st-text)">
              {formatIDR(product.price)}
            </span>
            {hasDiscount ? (
              <span className="text-xs text-(--st-text-muted) line-through">
                {formatIDR(String(numOrig))}
              </span>
            ) : null}
          </div>
        </div>

        {product.description ? (
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-(--st-text-muted)">
            {product.description}
          </p>
        ) : null}

        {/* Quick Spec Chips */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-(--st-border) bg-(--st-bg) p-3.5 text-[11px]">
          {product.color ? (
            <div>
              <span className="font-mono-label text-[9px] uppercase tracking-[0.1em] text-(--st-text-muted)">
                Warna
              </span>
              <div className="font-medium text-(--st-text)">{product.color}</div>
            </div>
          ) : null}
          {product.material ? (
            <div>
              <span className="font-mono-label text-[9px] uppercase tracking-[0.1em] text-(--st-text-muted)">
                Material
              </span>
              <div className="truncate font-medium text-(--st-text)">{product.material}</div>
            </div>
          ) : null}
          {product.measurements ? (
            <div className="col-span-2 flex items-center gap-1.5 pt-1 text-(--st-text-muted)">
              <Ruler className="h-3.5 w-3.5 shrink-0 text-[#FF5500]" />
              <span className="font-medium text-(--st-text)">{product.measurements}</span>
            </div>
          ) : null}
        </div>

        {/* Size Picker */}
        <div className="mt-4">
          <div className="flex items-center justify-between font-mono-label text-[10px] uppercase tracking-[0.12em]">
            <span className="font-semibold text-(--st-text)">Pilih Ukuran</span>
            {selectedVariant ? (
              <span className="text-(--st-text-muted)">
                {selectedVariant.stock > 0 ? `Stok: ${selectedVariant.stock} pcs` : "Habis"}
              </span>
            ) : null}
          </div>

          <div className="mt-2 grid grid-cols-4 gap-2">
            {variants.map((v) => {
              const selected = v.id === selectedVariant?.id;
              const disabled = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setQuantity(1);
                  }}
                  className={cn(
                    "h-10 rounded-xl border font-mono-label text-xs uppercase transition",
                    disabled
                      ? "cursor-not-allowed border-(--st-border) bg-(--st-bg) text-(--st-text-muted)/45 line-through"
                      : selected
                        ? "border-[#0D0D0D] bg-[#0D0D0D] font-semibold text-white"
                        : "border-(--st-border) bg-white text-(--st-text) hover:border-[#FF5500]"
                  )}
                >
                  {v.size_label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Qty & Actions */}
        <div className="mt-5 space-y-3">
          {selectedVariant && selectedVariant.stock > 0 ? (
            <div className="flex items-center justify-between">
              <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                Jumlah
              </span>
              <div className="inline-flex items-center rounded-full border border-(--st-border) bg-(--st-bg) p-0.5">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, safeQty - 1))}
                  disabled={safeQty <= 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white disabled:opacity-40"
                  aria-label="Kurangi"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center font-mono-label text-xs font-semibold">
                  {safeQty}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxStock, safeQty + 1))}
                  disabled={safeQty >= maxStock}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white disabled:opacity-40"
                  aria-label="Tambah"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!selectedVariant || selectedVariant.stock <= 0}
              onClick={handleAddToBag}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#0D0D0D] px-5 text-xs font-semibold text-white transition hover:bg-[#FF5500] disabled:cursor-not-allowed disabled:bg-(--st-surface-alt) disabled:text-(--st-text-muted)"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>{isSoldOut ? "Stok Habis" : "Tambah ke Keranjang"}</span>
            </button>

            <button
              type="button"
              onClick={() => void toggleWishlist(product.id)}
              aria-label={wishlisted ? "Hapus wishlist" : "Simpan wishlist"}
              className={cn(
                "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition",
                wishlisted
                  ? "border-[#FF5500] bg-[#FF5500] text-white"
                  : "border-(--st-border) bg-white text-(--st-text) hover:border-[#FF5500]"
              )}
            >
              <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
            </button>
          </div>

          <Link
            href={`/products/${product.slug}`}
            onClick={onClose}
            className="inline-flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-(--st-text) transition hover:text-[#FF5500]"
          >
            <span>Lihat Dossier &amp; Pengukuran Lengkap</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function ProductQuickViewModal() {
  const { quickViewProduct, closeQuickView } = useCart();

  React.useEffect(() => {
    if (!quickViewProduct) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQuickView();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quickViewProduct, closeQuickView]);

  return (
    <AnimatePresence>
      {quickViewProduct ? (
        <div
          className="fixed inset-0 z-[85] flex items-end justify-center overflow-hidden sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Quick View ${quickViewProduct.name}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeQuickView}
            className="absolute inset-0 bg-black/55 backdrop-blur-xs"
          />

          <QuickViewContent
            key={quickViewProduct.id}
            product={quickViewProduct}
            onClose={closeQuickView}
          />
        </div>
      ) : null}
    </AnimatePresence>
  );
}
