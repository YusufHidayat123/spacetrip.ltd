"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";

import { useCart } from "@/lib/cart/cart-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ProductCard } from "@/components/storefront/product-card";
import type { Category, Product, ProductImage, ProductVariant } from "@/lib/catalog/types";

type WishlistProduct = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

export function WishlistGrid() {
  const { wishlistIds } = useCart();
  const [products, setProducts] = React.useState<WishlistProduct[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;

    async function fetchSaved() {
      if (wishlistIds.length === 0) {
        if (active) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("products")
          .select(
            "id,category_id,name,slug,description,price,status,gender,condition,color,material,original_price,style_tags,measurements,is_featured,badge,created_at,updated_at,categories(id,name,slug),product_images(id,product_id,storage_path,alt,sort_order,created_at),product_variants(id,product_id,size_label,stock,sku,is_active,created_at,updated_at)"
          )
          .in("id", wishlistIds)
          .eq("status", "active");

        if (active) {
          setProducts((data ?? []) as unknown as WishlistProduct[]);
        }
      } catch {
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void fetchSaved();

    return () => {
      active = false;
    };
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="clip-chamfer-diagonal aspect-[3/4] w-full animate-pulse rounded-2xl bg-(--st-surface-alt)" />
            <div className="h-3 w-2/3 animate-pulse rounded-full bg-(--st-surface-alt)" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-(--st-surface-alt)" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-(--st-border) bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-(--st-accent-border) bg-(--st-accent-soft)">
          <Heart className="h-5 w-5 text-[#FF5500]" />
        </div>
        <h2 className="mt-5 font-display text-xl font-medium tracking-tight text-[#0D0D0D]">
          Wishlist Kamu Masih Kosong
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-(--st-text-muted) sm:text-sm">
          Klik ikon hati pada produk favorit di katalog untuk menyimpannya di sini sebelum keduluan kolektor lain.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
        >
          <span>Jelajahi Koleksi</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
      {products.map((p, idx) => {
        const imgs = (p.product_images ?? [])
          .slice()
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        const hero = imgs[0] ?? null;

        return (
          <ProductCard
            key={p.id}
            id={p.id}
            slug={p.slug}
            name={p.name}
            description={p.description}
            price={p.price}
            originalPrice={p.original_price}
            categoryName={p.categories?.name ?? null}
            condition={p.condition}
            color={p.color}
            material={p.material}
            measurements={p.measurements}
            styleTags={p.style_tags}
            badge={p.badge}
            variants={p.product_variants}
            showAsterisk={idx === 0}
            image={hero ? { storage_path: hero.storage_path, alt: hero.alt ?? null } : null}
          />
        );
      })}
    </div>
  );
}
