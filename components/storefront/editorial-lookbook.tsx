"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MapPin, ShoppingBag, X } from "lucide-react";

import type { EditorialLookWithProducts, PublicProductListItem } from "@/lib/catalog/public";
import { useCart } from "@/lib/cart/cart-context";
import { formatIDR } from "@/lib/orders/format";
import { ChamferedCard } from "@/components/storefront/chamfered-card";

function getImgUrl(storagePath: string) {
  if (!storagePath) return "";
  if (storagePath.startsWith("http")) return storagePath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";
  return `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export function EditorialLookbook({ looks }: { looks: EditorialLookWithProducts[] }) {
  const [activeLook, setActiveLook] = React.useState<EditorialLookWithProducts | null>(null);
  const { addItem } = useCart();

  React.useEffect(() => {
    if (!activeLook) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveLook(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeLook]);

  if (looks.length === 0) return null;

  function handleAddLookItem(product: PublicProductListItem) {
    const firstVar = (product.product_variants ?? []).find((v) => v.is_active && v.stock > 0);
    if (!firstVar) return;
    const imgs = (product.product_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
    const imgPath = imgs[0]?.storage_path ?? "";
    addItem({
      productId: product.id,
      variantId: firstVar.id,
      slug: product.slug,
      name: product.name,
      sizeLabel: firstVar.size_label,
      price: Number(product.price),
      maxStock: firstVar.stock,
      imageUrl: getImgUrl(imgPath),
      categoryName: product.categories?.name ?? null,
      quantity: 1,
    });
  }

  return (
    <>
      <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 lg:py-20">
        <div className="flex flex-col justify-between gap-4 border-b border-(--st-border) pb-5 sm:flex-row sm:items-end">
          <div>
            <div className="font-mono-label text-[11px] font-medium uppercase tracking-[0.14em] text-(--st-text-muted)">
              [Editorial Lookbook 01&ndash;04]
            </div>
            <h2 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-(--st-text) sm:text-4xl">
              Worn by &mdash; local voices
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 self-start rounded-full border border-(--st-border) bg-white px-4 py-2 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-(--st-text) transition hover:border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white sm:self-auto"
          >
            <span>Explore All Pieces</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
          {looks.map((look, idx) => (
            <div
              key={look.id}
              className="group flex w-[76vw] max-w-[300px] shrink-0 snap-start flex-col sm:w-auto sm:max-w-none"
            >
              <ChamferedCard
                variant="notch-br"
                aspectClass="aspect-[3/4]"
                showAsterisk={idx === 0}
                onActionClick={() => setActiveLook(look)}
                actionLabel={`Shop ${look.title}`}
                actionVariant="light"
                topLeftSlot={
                  look.location ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 font-mono-label text-[9px] font-medium text-[#0D0D0D] backdrop-blur-xs">
                      <MapPin className="h-2.5 w-2.5 text-[#FF5500]" />
                      {look.location}
                    </span>
                  ) : null
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImgUrl(look.image_path)}
                  alt={look.title}
                  loading="lazy"
                  className="h-full w-full cursor-pointer object-cover object-top transition duration-700 group-hover:scale-[1.04]"
                  onClick={() => setActiveLook(look)}
                />
              </ChamferedCard>

              <button
                type="button"
                onClick={() => setActiveLook(look)}
                className="mt-3 text-left"
              >
                <div className="font-mono-label text-[10px] uppercase tracking-[0.1em] text-[#FF5500]">
                  [0{idx + 1} / {String(looks.length).padStart(2, "0")}]
                </div>
                <div className="mt-0.5 font-display text-sm font-semibold tracking-tight text-(--st-text) transition group-hover:text-[#FF5500]">
                  {look.title}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-(--st-text-muted)">
                  {look.subtitle}
                </p>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Shop The Look Drawer / Modal */}
      <AnimatePresence>
        {activeLook ? (
          <div
            className="fixed inset-0 z-[80] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Shop The Look"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveLook(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute bottom-0 right-0 top-0 flex w-full max-w-[460px] flex-col bg-white shadow-2xl sm:rounded-l-3xl"
            >
              <div className="flex items-center justify-between border-b border-(--st-border) px-6 py-4">
                <div>
                  <div className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-[#FF5500]">
                    [Shop The Look]
                  </div>
                  <div className="mt-0.5 font-display text-sm font-bold tracking-tight text-(--st-text)">
                    {activeLook.title}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLook(null)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--st-border) bg-(--st-bg) text-(--st-text) hover:border-[#0D0D0D]"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="clip-chamfer-diagonal aspect-[4/3] w-full overflow-hidden rounded-2xl bg-(--st-surface-alt)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImgUrl(activeLook.image_path)}
                    alt={activeLook.title}
                    className="h-full w-full object-cover object-top"
                  />
                </div>

                {activeLook.model_name ? (
                  <div className="mt-3 font-mono-label text-[11px] uppercase tracking-[0.1em] text-(--st-text-muted)">
                    Model: {activeLook.model_name} &middot; {activeLook.location}
                  </div>
                ) : null}

                <div className="mt-6 font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
                  [Featured Pieces in This Look]
                </div>

                <div className="mt-3 divide-y divide-(--st-border)">
                  {activeLook.products.map((prod) => {
                    const imgs = (prod.product_images ?? [])
                      .slice()
                      .sort((a, b) => a.sort_order - b.sort_order);
                    const imgPath = imgs[0]?.storage_path ?? "";
                    const firstVar = (prod.product_variants ?? []).find(
                      (v) => v.is_active && v.stock > 0
                    );

                    return (
                      <div key={prod.id} className="flex gap-4 py-4">
                        <Link
                          href={`/products/${prod.slug}`}
                          onClick={() => setActiveLook(null)}
                          className="clip-chamfer-diagonal-sm h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-(--st-surface-alt)"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getImgUrl(imgPath)}
                            alt={prod.name}
                            className="h-full w-full object-cover"
                          />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div>
                            <div className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                              {prod.categories?.name ?? "Streetwear"} &middot;{" "}
                              {prod.condition ?? "Excellent"}
                            </div>
                            <Link
                              href={`/products/${prod.slug}`}
                              onClick={() => setActiveLook(null)}
                              className="mt-0.5 block truncate text-sm font-semibold text-(--st-text) hover:text-[#FF5500]"
                            >
                              {prod.name}
                            </Link>
                            <div className="mt-1 text-xs font-semibold text-(--st-text)">
                              {formatIDR(prod.price)}
                            </div>
                          </div>

                          <div className="mt-2 flex items-center gap-2">
                            {firstVar ? (
                              <button
                                type="button"
                                onClick={() => {
                                  handleAddLookItem(prod);
                                  setActiveLook(null);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#0D0D0D] px-3.5 py-1.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#FF5500]"
                              >
                                <ShoppingBag className="h-3 w-3" />
                                Add ({firstVar.size_label})
                              </button>
                            ) : (
                              <span className="font-mono-label text-[10px] uppercase text-red-700">
                                Sold Out
                              </span>
                            )}
                            <Link
                              href={`/products/${prod.slug}`}
                              onClick={() => setActiveLook(null)}
                              className="rounded-full border border-(--st-border) px-3.5 py-1.5 font-mono-label text-[10px] uppercase tracking-[0.08em] text-(--st-text) transition hover:border-[#0D0D0D]"
                            >
                              Detail
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
