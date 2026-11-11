export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { CatalogFilters } from "@/components/storefront/catalog-filters";
import { ProductCard } from "@/components/storefront/product-card";
import { publicListActiveProducts, publicListCategoriesWithCounts } from "@/lib/catalog/public";

const GENDER_TABS = [
  { value: "", label: "All Archive" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
  { value: "accessories", label: "Accessories" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const gender = typeof sp.gender === "string" ? sp.gender : "";
  const style = typeof sp.style === "string" ? sp.style : "";
  const condition = typeof sp.condition === "string" ? sp.condition : "";
  const size = typeof sp.size === "string" ? sp.size : "";
  const maxPriceRaw = typeof sp.maxPrice === "string" ? Number(sp.maxPrice) : undefined;
  const maxPrice = maxPriceRaw && Number.isFinite(maxPriceRaw) ? maxPriceRaw : undefined;
  const sort = (typeof sp.sort === "string" ? sp.sort : "newest") as
    | "newest"
    | "price_asc"
    | "price_desc"
    | "featured";

  const [categoriesWithCounts, products] = await Promise.all([
    publicListCategoriesWithCounts(),
    publicListActiveProducts({
      q,
      categorySlug: category || undefined,
      gender: gender || undefined,
      style: style || undefined,
      condition: condition || undefined,
      size: size || undefined,
      maxPrice,
      sort,
    }),
  ]);

  const headerCategories = categoriesWithCounts.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c.productCount,
  }));

  const activeTitle = gender
    ? `${gender} — drops`
    : style
      ? style.replace(/-/g, " ")
      : maxPrice === 100000
        ? "under — idr 100k"
        : "curated — archive";

  function buildGenderUrl(nextGender: string) {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (category) p.set("category", category);
    if (nextGender) p.set("gender", nextGender);
    if (style) p.set("style", style);
    if (condition) p.set("condition", condition);
    if (size) p.set("size", size);
    if (maxPrice) p.set("maxPrice", String(maxPrice));
    if (sort && sort !== "newest") p.set("sort", sort);
    const qs = p.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <MobileShell>
      <StoreHeader title="Archive" backHref="/" categories={headerCategories} />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:py-12">
        {/* Momento Editorial Archive Heading */}
        <div className="flex flex-col justify-between gap-4 border-b border-(--st-border) pb-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
              >
                &#10035;
              </span>
              <span className="font-mono-label text-[11px] font-medium uppercase tracking-[0.14em] text-(--st-text-muted)">
                [SpaceTrip Curated Archive &middot; 2026 Drop]
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-medium lowercase tracking-[-0.04em] text-[#0D0D0D] sm:text-5xl lg:text-6xl">
              {activeTitle}{" "}
              <span className="font-normal text-(--st-text-muted)">&copy;26</span>
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-(--st-border) bg-white px-4 py-2 font-mono-label text-[11px] uppercase tracking-[0.1em] text-(--st-text-muted) md:self-auto">
            <span className="h-2 w-2 rounded-full bg-[#FF5500]" />
            <span>
              <strong className="text-[#0D0D0D]">{products.length}</strong> curated pieces
            </span>
          </div>
        </div>

        {/* Scrollable Pill Department Tabs */}
        <div className="no-scrollbar mt-5 flex items-center gap-2 overflow-x-auto pb-1">
          {GENDER_TABS.map((tab) => {
            const active = gender === tab.value;
            return (
              <Link
                key={tab.label}
                href={buildGenderUrl(tab.value)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-[#0D0D0D] text-white"
                    : "border border-(--st-border) bg-white text-(--st-text) hover:border-[#FF5500] hover:text-[#FF5500]"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* Instant Interactive Multi-Filter & Sort Toolbar */}
        <CatalogFilters
          categories={categoriesWithCounts}
          values={{ q, category, gender, style, condition, size, maxPrice, sort }}
        />

        {/* Product Grid */}
        <section className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
          {products.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-(--st-border) bg-white px-6 py-16 text-center">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#FF5500]/12 text-lg font-bold text-[#FF5500]">
                &#10035;
              </div>
              <div className="mt-4 font-display text-xl font-medium tracking-tight text-[#0D0D0D]">
                Tidak ada piece yang cocok dengan filter ini
              </div>
              <p className="mx-auto mt-2 max-w-md text-xs text-(--st-text-muted) sm:text-sm">
                Coba ubah kata kunci pencarian atau reset filter kategori untuk melihat seluruh arsip aktif.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
              >
                <span>Lihat Semua Drop</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            products.map((p, idx) => {
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
            })
          )}
        </section>
      </main>
    </MobileShell>
  );
}
