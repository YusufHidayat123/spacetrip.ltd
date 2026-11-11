"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Heart, Minus, Plus, ShoppingBag, Zap } from "lucide-react";

import { BottomSheet } from "@/components/storefront/bottom-sheet";
import { SubmitButton } from "@/components/form/submit-button";
import { useCart } from "@/lib/cart/cart-context";
import { formatIDR } from "@/lib/orders/format";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  size_label: string;
  stock: number;
};

export function ProductCheckoutSheet({
  productId,
  slug,
  productName,
  price,
  categoryName,
  imageUrl,
  loggedIn,
  profileComplete,
  variants,
  defaultVariantId,
  action,
}: {
  productId: string;
  slug: string;
  productName: string;
  price: number;
  categoryName?: string | null;
  imageUrl: string;
  loggedIn: boolean;
  profileComplete: boolean;
  variants: Variant[];
  defaultVariantId: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const { addItem, isWishlisted, toggleWishlist } = useCart();
  const [selectedVariantId, setSelectedVariantId] = React.useState(defaultVariantId);
  const [quantity, setQuantity] = React.useState(1);
  const [open, setOpen] = React.useState(false);

  const hasAnyStock = variants.some((v) => v.stock > 0);
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ??
    variants.find((v) => v.stock > 0) ??
    variants[0] ??
    null;

  const maxStock = selectedVariant?.stock ?? 0;
  const safeQuantity = maxStock > 0 ? Math.min(Math.max(1, quantity), maxStock) : 1;
  const wishlisted = isWishlisted(productId);

  const loginHref = `/login?next=${encodeURIComponent(`/products/${slug}`)}`;
  const setupHref = `/profile/setup?next=${encodeURIComponent(`/products/${slug}`)}`;

  function handleAddToBag() {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    addItem({
      productId,
      variantId: selectedVariant.id,
      slug,
      name: productName,
      sizeLabel: selectedVariant.size_label,
      price,
      maxStock: selectedVariant.stock,
      imageUrl,
      categoryName,
      quantity: safeQuantity,
    });
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Interactive Size Picker */}
      <div>
        <div className="flex items-center justify-between">
          <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text)">
            [Pilih Ukuran]
          </span>
          {selectedVariant ? (
            <span className="font-mono-label text-[11px] text-(--st-text-muted)">
              {selectedVariant.stock > 0
                ? `${selectedVariant.stock} pcs tersedia`
                : "Stok habis"}
            </span>
          ) : null}
        </div>

        {variants.length === 0 ? (
          <div className="mt-2.5 rounded-2xl border border-(--st-border) bg-(--st-bg) px-4 py-3 text-xs text-(--st-text-muted)">
            Varian ukuran belum tersedia.
          </div>
        ) : (
          <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {variants.map((v) => {
              const isSelected = v.id === selectedVariant?.id;
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
                    "relative flex h-11 flex-col items-center justify-center rounded-xl border px-2 font-mono-label text-xs uppercase tracking-[0.06em] transition",
                    disabled
                      ? "cursor-not-allowed border-(--st-border) bg-(--st-bg) text-(--st-text-muted)/45 line-through"
                      : isSelected
                        ? "border-[#0D0D0D] bg-[#0D0D0D] font-semibold text-white"
                        : "border-(--st-border) bg-white text-(--st-text) hover:border-[#FF5500]"
                  )}
                >
                  <span>{v.size_label}</span>
                  {!disabled && v.stock <= 2 ? (
                    <span
                      className={cn(
                        "text-[9px] leading-none",
                        isSelected ? "text-[#FF5500]" : "text-[#FF5500]"
                      )}
                    >
                      {v.stock} left
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quantity Stepper */}
      {hasAnyStock && selectedVariant && selectedVariant.stock > 0 ? (
        <div className="flex items-center justify-between border-y border-(--st-border) py-4">
          <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text)">
            [Jumlah]
          </span>
          <div className="inline-flex items-center rounded-full border border-(--st-border) bg-(--st-bg) p-0.5">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, safeQuantity - 1))}
              disabled={safeQuantity <= 1}
              aria-label="Kurangi jumlah"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-(--st-text) transition hover:text-[#FF5500] disabled:opacity-40"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-10 text-center font-mono-label text-xs font-semibold text-(--st-text)">
              {safeQuantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(maxStock, safeQuantity + 1))}
              disabled={safeQuantity >= maxStock}
              aria-label="Tambah jumlah"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-(--st-text) transition hover:text-[#FF5500] disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {/* Primary Action Row: ADD TO BAG + WISHLIST */}
      <div className="space-y-2.5">
        <div className="flex gap-2.5">
          <button
            type="button"
            disabled={!hasAnyStock || !selectedVariant || selectedVariant.stock <= 0}
            onClick={handleAddToBag}
            className={cn(
              "flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#0D0D0D] px-6 font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]",
              "disabled:cursor-not-allowed disabled:bg-(--st-surface-alt) disabled:text-(--st-text-muted)"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            {hasAnyStock ? "Add to Bag" : "Stok Habis"}
          </button>

          <button
            type="button"
            onClick={() => void toggleWishlist(productId)}
            aria-label={wishlisted ? "Hapus dari wishlist" : "Simpan ke wishlist"}
            className={cn(
              "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition",
              wishlisted
                ? "border-[#FF5500] bg-[#FF5500] text-white"
                : "border-(--st-border) bg-white text-(--st-text) hover:border-[#FF5500] hover:text-[#FF5500]"
            )}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
          </button>
        </div>

        {/* Direct Checkout Secondary Button */}
        {hasAnyStock ? (
          loggedIn ? (
            profileComplete ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#0D0D0D] bg-white px-6 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0D0D0D] transition hover:bg-[#0D0D0D] hover:text-white"
              >
                <Zap className="h-3.5 w-3.5 text-[#FF5500]" />
                <span>Pesan Langsung Sekarang</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                href={setupHref}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#0D0D0D] bg-white px-6 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0D0D0D] transition hover:bg-[#0D0D0D] hover:text-white"
              >
                Lengkapi Alamat Untuk Pesan Langsung
              </Link>
            )
          ) : (
            <Link
              href={loginHref}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-(--st-border) bg-(--st-bg) px-6 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]"
            >
              Masuk untuk Checkout Lebih Cepat
            </Link>
          )
        ) : null}
      </div>

      {/* Direct Checkout Confirmation BottomSheet / Modal */}
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Konfirmasi Pesanan Langsung"
      >
        <div className="border-b border-(--st-border) pb-3">
          <div className="font-mono-label text-[10px] uppercase tracking-[0.14em] text-[#FF5500]">
            [Direct QRIS Checkout]
          </div>
          <div className="mt-1 font-display text-lg font-medium tracking-tight text-(--st-text)">
            {productName}
          </div>
        </div>

        <form action={action} className="mt-4 grid gap-4">
          <input type="hidden" name="variant_id" value={selectedVariant?.id ?? ""} />
          <input type="hidden" name="quantity" value={String(safeQuantity)} />

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-(--st-border) bg-(--st-bg) p-4 text-xs">
            <div>
              <div className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                Ukuran Dipilih
              </div>
              <div className="mt-1 font-semibold text-(--st-text)">
                {selectedVariant?.size_label ?? "—"}
              </div>
            </div>
            <div>
              <div className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                Jumlah &amp; Total
              </div>
              <div className="mt-1 font-semibold text-(--st-text)">
                {safeQuantity} pcs · {formatIDR(String(price * safeQuantity))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-(--st-border) bg-white p-3.5 text-xs leading-relaxed text-(--st-text-muted)">
            Alamat pengiriman diambil otomatis dari profil akun kamu. Setelah konfirmasi,
            lanjutkan pembayaran QRIS di halaman order.
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-11 rounded-full border border-(--st-border) bg-white font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-(--st-text) transition hover:border-[#0D0D0D]"
            >
              Batal
            </button>
            <SubmitButton
              pendingText="Membuat pesanan..."
              className="h-11 rounded-full bg-[#0D0D0D] font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
            >
              Buat Pesanan
            </SubmitButton>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
}
