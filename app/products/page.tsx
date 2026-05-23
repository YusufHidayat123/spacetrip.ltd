export const dynamic = "force-dynamic";

import Link from "next/link";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatIDR } from "@/lib/orders/format";
import {
  getPublicProductImageUrl,
  publicListActiveCategories,
  publicListActiveProducts,
} from "@/lib/catalog/public";

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
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          spacetrip
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="h-9">
            <Link href="/seller">Admin</Link>
          </Button>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-(--st-text)">
          Products
        </h1>
        <p className="text-sm text-(--st-text-muted)">
          Browse our latest drops. Pay via manual QRIS and upload proof after
          checkout.
        </p>
      </div>

      <section className="mt-6 rounded-xl border border-(--st-border) bg-white p-4 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-[420px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search products"
              className="h-10 pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              name="category"
              defaultValue={category}
              className="h-10 rounded-md border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <Button type="submit" className="h-10">
              Apply
            </Button>
          </div>
        </form>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.length === 0 ? (
          <div className="rounded-xl border border-(--st-border) bg-white p-6 text-sm text-(--st-text-muted) shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
            No active products found.
          </div>
        ) : (
          products.map((p) => {
            const images = (p.product_images ?? []).slice().sort((a, b) => {
              return (a.sort_order ?? 0) - (b.sort_order ?? 0);
            });
            const img = images[0];
            const imgUrl = img ? getPublicProductImageUrl(img.storage_path) : null;

            const totalStock = (p.product_variants ?? []).reduce(
              (sum, v) => sum + (v.is_active ? Number(v.stock) : 0),
              0
            );

            return (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group overflow-hidden rounded-xl border border-(--st-border) bg-white shadow-[0_4px_16px_rgba(17,24,39,0.04)] transition hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(17,24,39,0.08)]"
              >
                <div className="aspect-[4/3] w-full bg-[#F7F8FA]">
                  {imgUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imgUrl}
                      alt={img?.alt ?? p.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-(--st-text-muted)">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="text-sm font-semibold text-(--st-text) group-hover:underline underline-offset-4">
                    {p.name}
                  </div>
                  <div className="mt-0.5 text-xs text-(--st-text-muted)">
                    {p.categories?.name ?? "—"} • Stock {totalStock}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-(--st-text)">
                    {formatIDR(p.price)}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </section>
    </div>
  );
}
