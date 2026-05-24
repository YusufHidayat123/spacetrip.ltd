export const dynamic = "force-dynamic";

import Link from "next/link";

import { Search } from "lucide-react";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { publicListActiveCategories, publicListActiveProducts } from "@/lib/catalog/public";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const category = typeof sp.category === "string" ? sp.category : "";

  const [categories, products] = await Promise.all([
    publicListActiveCategories(),
    publicListActiveProducts({ q, categorySlug: category || undefined }),
  ]);

  return (
    <MobileShell>
      <StoreHeader title="Koleksi" backHref="/" />

      <main className="px-5 pb-6">
        <div className="mt-4">
          <div className="text-sm font-semibold text-(--st-text)">Koleksi thrift</div>
          <div className="mt-0.5 text-xs text-(--st-text-muted)">
            Cari item favoritmu atau filter per kategori.
          </div>
        </div>

        <section className="mt-4 rounded-[20px] border border-(--st-border) bg-white p-4">
          <form className="grid gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
              <Input name="q" defaultValue={q} placeholder="Cari kaos, jeans, cargo..." className="h-10 pl-9" />
            </div>

            <div className="grid grid-cols-[1fr_96px] gap-2">
              <select
                name="category"
                defaultValue={category}
                className="h-10 rounded-full border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
              >
                <option value="">Semua kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button type="submit" className="h-10 rounded-full">
                Terapkan
              </Button>
            </div>
          </form>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-4">
          {products.length === 0 ? (
            <div className="col-span-2 rounded-2xl border border-(--st-border) bg-white p-4 text-sm text-(--st-text-muted)">
              Belum ada produk yang tersedia.
            </div>
          ) : (
            products.map((p) => {
              const imgs = (p.product_images ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
              const hero = imgs[0] ?? null;
              return (
                <ProductCard
                  key={p.id}
                  slug={p.slug}
                  name={p.name}
                  price={p.price}
                  image={hero ? { storage_path: hero.storage_path, alt: hero.alt ?? null } : null}
                />
              );
            })
          )}
        </section>

        <div className="mt-6 text-center text-[11px] text-(--st-text-muted)">
          Mau lihat status pesanan?{" "}
          <Link href="/orders" className="underline underline-offset-4">
            Buka Orders
          </Link>
        </div>
      </main>
    </MobileShell>
  );
}
