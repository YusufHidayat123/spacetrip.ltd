"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { useCart } from "@/lib/cart/cart-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { formatIDR } from "@/lib/orders/format";

export function CartDrawer() {
  const {
    items,
    cartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
  } = useCart();

  const router = useRouter();
  const [checkingOut, setCheckingOut] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!cartOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cartOpen, closeCart]);

  async function handleCheckout() {
    if (items.length === 0) return;
    setCheckingOut(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        closeCart();
        router.push("/login?next=/products");
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("full_name,shipping_address")
        .eq("id", user.id)
        .maybeSingle();

      if (profErr) throw profErr;

      const addr = (profile?.shipping_address ?? null) as Record<string, unknown> | null;
      const hasName = Boolean(profile?.full_name && String(profile.full_name).trim().length > 0);
      const hasAddr =
        addr &&
        typeof addr.line1 === "string" &&
        addr.line1.trim().length > 0 &&
        typeof addr.city === "string" &&
        addr.city.trim().length > 0 &&
        typeof addr.province === "string" &&
        addr.province.trim().length > 0 &&
        typeof addr.postal_code === "string" &&
        addr.postal_code.trim().length > 0;

      if (!hasName || !hasAddr) {
        closeCart();
        router.push("/profile/setup?next=/products");
        return;
      }

      const payloadItems = items.map((it) => ({
        variant_id: it.variantId,
        quantity: it.quantity,
      }));

      const { data, error: rpcError } = await supabase.rpc("create_order_with_stock_auth", {
        _shipping_address: null,
        _items: payloadItems,
      });

      if (rpcError) throw rpcError;

      const row = (data as unknown as { order_id: string; order_number: string }[] | null)?.[0];
      if (!row?.order_id) {
        throw new Error("Gagal membuat pesanan. Coba lagi.");
      }

      clearCart();
      closeCart();
      router.push(`/orders/${row.order_id}`);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Checkout gagal. Cek kembali stok produk.");
    } finally {
      setCheckingOut(false);
    }
  }

  return (
    <AnimatePresence>
      {cartOpen ? (
        <div
          className="fixed inset-0 z-[80] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping Bag"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-[440px] flex-col border-l border-(--st-border) bg-white shadow-2xl sm:rounded-l-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-(--st-border) px-6 py-5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-(--st-bg) text-(--st-text)">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                <div>
                  <span className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-[#FF5500]">
                    [Bag]
                  </span>
                  <div className="font-display text-base font-bold tracking-tight text-(--st-text)">
                    Keranjang ({totalItems})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--st-border) bg-(--st-bg) text-(--st-text) transition hover:border-[#0D0D0D]"
                aria-label="Tutup keranjang"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-(--st-border) bg-(--st-bg)">
                    <ShoppingBag className="h-6 w-6 text-(--st-text-muted)" />
                  </div>
                  <p className="mt-4 font-display text-lg font-bold tracking-tight text-(--st-text)">
                    Tas belanja masih kosong
                  </p>
                  <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-(--st-text-muted)">
                    Temukan item kurasi streetwear &amp; vintage pilihan sebelum kehabisan stok.
                  </p>
                  <Link
                    href="/products"
                    onClick={closeCart}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#FF5500]"
                  >
                    <span>Jelajahi Koleksi</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-(--st-border)">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 py-4 first:pt-0">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="clip-chamfer-diagonal-sm relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-(--st-surface-alt)"
                      >
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-(--st-text-muted)">
                            No image
                          </div>
                        )}
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item.slug}`}
                              onClick={closeCart}
                              className="line-clamp-2 text-xs font-semibold leading-snug text-(--st-text) hover:text-[#FF5500]"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => removeItem(item.variantId)}
                              className="rounded-full p-1 text-(--st-text-muted) transition hover:bg-red-50 hover:text-red-600"
                              aria-label="Hapus item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="mt-1 font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                            Size: {item.sizeLabel} · Stok: {item.maxStock}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-(--st-border) bg-(--st-bg) p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-(--st-text) transition hover:bg-white"
                              aria-label="Kurangi"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center font-mono-label text-xs font-semibold text-(--st-text)">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                              disabled={item.quantity >= item.maxStock}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-(--st-text) transition hover:bg-white disabled:opacity-40"
                              aria-label="Tambah"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="text-xs font-semibold text-(--st-text)">
                            {formatIDR(String(item.price * item.quantity))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 ? (
              <div className="border-t border-(--st-border) bg-(--st-bg) px-6 py-5 sm:rounded-bl-3xl">
                {error ? (
                  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-xs text-(--st-text-muted)">
                  <span>Subtotal ({totalItems} item)</span>
                  <span className="font-display text-lg font-bold tracking-tight text-(--st-text)">
                    {formatIDR(String(subtotal))}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-(--st-text-muted)">
                  Pembayaran QRIS manual dilakukan setelah konfirmasi pesanan.
                </p>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0D0D0D] text-xs font-semibold text-white transition hover:bg-[#FF5500] disabled:opacity-60"
                >
                  <span>{checkingOut ? "Memproses Pesanan..." : "Checkout Sekarang"}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
