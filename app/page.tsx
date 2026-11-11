export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { MomentoHero } from "@/components/storefront/momento-hero";
import { MomentoCategoryIndex } from "@/components/storefront/momento-category-index";
import { MomentoAccordion } from "@/components/storefront/momento-accordion";
import { ChamferedCard } from "@/components/storefront/chamfered-card";
import { BestSellersInteractive } from "@/components/storefront/home-collections";
import { MotionReveal } from "@/components/storefront/motion-reveal";
import { ProductCard } from "@/components/storefront/product-card";
import { EditorialLookbook } from "@/components/storefront/editorial-lookbook";
import {
  getPublicProductImageUrl,
  publicListActiveProducts,
  publicListCategoriesWithCounts,
  publicListEditorialLooks,
  type PublicProductListItem,
} from "@/lib/catalog/public";
import { formatIDR } from "@/lib/orders/format";

function renderProductCards(items: PublicProductListItem[]) {
  return items.map((p, idx) => {
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
  });
}

function getHighlightImage(item: PublicProductListItem | undefined, fallbackPath: string) {
  if (!item) return getPublicProductImageUrl(fallbackPath);
  const imgs = (item.product_images ?? [])
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return imgs[0]?.storage_path
    ? getPublicProductImageUrl(imgs[0].storage_path)
    : getPublicProductImageUrl(fallbackPath);
}

export default async function Home() {
  const [
    categoriesWithCounts,
    bestSellers,
    menDrops,
    womenDrops,
    unisexDrops,
    accessoriesDrops,
    newArrivals,
    under100k,
    looks,
  ] = await Promise.all([
    publicListCategoriesWithCounts(),
    publicListActiveProducts({ featuredOnly: true, sort: "featured", limit: 4 }),
    publicListActiveProducts({ gender: "men", sort: "featured", limit: 4 }),
    publicListActiveProducts({ gender: "women", sort: "featured", limit: 4 }),
    publicListActiveProducts({ gender: "unisex", sort: "newest", limit: 4 }),
    publicListActiveProducts({ gender: "accessories", sort: "newest", limit: 4 }),
    publicListActiveProducts({ sort: "newest", limit: 4 }),
    publicListActiveProducts({ maxPrice: 100000, sort: "price_asc", limit: 4 }),
    publicListEditorialLooks(),
  ]);

  const activeTotalCount = categoriesWithCounts.reduce((s, c) => s + c.productCount, 0);

  const heroCutoutUrl = getPublicProductImageUrl("editorial/hero/hero-cutout.png");
  const testimonialPortraitUrl = getPublicProductImageUrl(
    "editorial/testimonials/testimonial-portrait.jpg"
  );
  const seasonalImg = getPublicProductImageUrl("editorial/campaigns/seasonal-banner.jpg");
  const workwearImg = getPublicProductImageUrl("editorial/styles/style-workwear.jpg");
  const japaneseImg = getPublicProductImageUrl("editorial/styles/style-japanese.jpg");
  const look03Img = getPublicProductImageUrl("editorial/lookbook/look-03.jpg");
  const look04Img = getPublicProductImageUrl("editorial/lookbook/look-04.jpg");
  const capThumbImg = getPublicProductImageUrl("editorial/categories/cat-accessories.jpg");

  const avatarUrls = [look04Img, look03Img, testimonialPortraitUrl];

  const highlightLeft = bestSellers[0];
  const highlightRight = bestSellers[1] ?? newArrivals[0];
  const highlightLeftImg = getHighlightImage(highlightLeft, "editorial/styles/style-japanese.jpg");
  const highlightRightImg = getHighlightImage(highlightRight, "editorial/lookbook/look-04.jpg");

  const cultureStrip = [
    { symbol: "✶", label: "Jakarta Archive", href: "/products?style=y2k-streetwear" },
    { symbol: "◎", label: "Bandung Workwear", href: "/products?style=vintage-workwear" },
    { symbol: "▣", label: "Y2K Utility", href: "/products?category=celana-cargo" },
    { symbol: "⚡", label: "Vintage Tees", href: "/products?category=kaos-tees" },
    { symbol: "✪", label: "Curated Denim", href: "/products?category=jeans-denim" },
    { symbol: "⌘", label: "Under IDR 100K", href: "/products?maxPrice=100000" },
  ];

  const headerCategories = categoriesWithCounts.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c.productCount,
  }));

  return (
    <MobileShell>
      {/* 1. MINIMALIST EDITORIAL HEADER */}
      <StoreHeader categories={headerCategories} />

      {/* 2. LAYERED CUTOUT HERO SECTION (#F3F3F1) */}
      <MomentoHero
        heroCutoutUrl={heroCutoutUrl}
        avatarUrls={avatarUrls}
        activeCount={activeTotalCount}
      />

      {/* 3. PARTNER & STREETWEAR CULTURE STRIP (#FFFFFF) */}
      <section className="border-y border-(--st-border) bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-8 sm:py-5">
          {cultureStrip.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-2 font-display text-xs font-medium tracking-tight text-(--st-text-muted) transition hover:text-[#FF5500] sm:text-sm"
            >
              <span className="text-[#FF5500]" aria-hidden="true">
                {item.symbol}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. ASYMMETRIC FEATURE SHOWCASE ("It's - about moments ©26") */}
      <MotionReveal>
        <section id="showcase" className="bg-white py-14 lg:py-22">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-8">
              {/* Left Column: Massive Display Title + CTA + Lower Staggered Card */}
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h2 className="font-display text-[clamp(2.5rem,6vw,5.25rem)] font-medium leading-[0.92] tracking-[-0.04em] text-[#0D0D0D]">
                    It&apos;s &ndash; about
                    <br />
                    moments{" "}
                    <span className="font-normal text-(--st-text-muted)">©26</span>
                  </h2>

                  <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--st-border) font-mono-label text-[10px] text-(--st-text-muted)">
                    &#8599;
                  </span>
                </div>

                {/* Editorial Action Bar */}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 rounded-full border border-[#0D0D0D] bg-white px-5 py-2.5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] transition hover:bg-[#0D0D0D] hover:text-white"
                  >
                    <span>LEARN MORE</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <span
                    aria-hidden="true"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5500]/12 text-xs font-bold text-[#FF5500]"
                  >
                    &#10035;
                  </span>
                  <span className="font-mono-label text-[11px] font-medium text-(--st-text-muted)">
                    [Local Archive Curation]
                  </span>
                </div>

                {/* First Staggered Chamfered Highlight Card (Connected to Real Supabase Featured Item) */}
                <div className="mt-10 grid items-end gap-6 sm:grid-cols-12">
                  <div className="flex flex-col justify-between gap-4 sm:col-span-4">
                    <div className="font-mono-label text-xs font-semibold text-[#0D0D0D]">
                      (100% Curated)
                    </div>
                    <p className="text-xs leading-relaxed text-(--st-text-muted)">
                      Satu batch setiap rilisan. Setiap jahitan, patina, dan potongan
                      diverifikasi untuk gaya urban harian.
                    </p>
                  </div>

                  <div className="sm:col-span-8">
                    <ChamferedCard
                      variant="notch-tr"
                      aspectClass="aspect-[4/3]"
                      href={highlightLeft ? `/products/${highlightLeft.slug}` : "/products"}
                      actionLabel={highlightLeft?.name ?? "Explore drop"}
                      actionVariant="light"
                      topLeftSlot={
                        <span className="rounded-full bg-[#0D0D0D]/85 px-2.5 py-1 font-mono-label text-[9px] font-semibold uppercase tracking-[0.1em] text-white backdrop-blur-xs">
                          01 / Feature Drop
                        </span>
                      }
                    >
                      <Link
                        href={highlightLeft ? `/products/${highlightLeft.slug}` : "/products"}
                        className="block h-full w-full"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={highlightLeftImg}
                          alt={highlightLeft?.name ?? "SpaceTrip Featured Streetwear"}
                          loading="lazy"
                          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                        />
                      </Link>
                    </ChamferedCard>

                    {highlightLeft ? (
                      <Link
                        href={`/products/${highlightLeft.slug}`}
                        className="mt-3 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="truncate font-medium text-(--st-text) hover:text-[#FF5500]">
                          {highlightLeft.name}
                        </span>
                        <span className="shrink-0 font-mono-label font-semibold text-(--st-text-muted)">
                          {formatIDR(highlightLeft.price)}
                        </span>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Right Column: Secondary Elevated Chamfered Card */}
              <div className="lg:col-span-5 lg:pl-6">
                <ChamferedCard
                  variant="diagonal"
                  aspectClass="aspect-[4/4.3]"
                  showAsterisk
                  hideActionButton
                  topRightSlot={
                    <span className="rounded-full bg-white/95 px-2.5 py-1 font-mono-label text-[9px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D]">
                      [Just Landed]
                    </span>
                  }
                >
                  <Link
                    href={highlightRight ? `/products/${highlightRight.slug}` : "/products"}
                    className="block h-full w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={highlightRightImg}
                      alt={highlightRight?.name ?? "SpaceTrip Curated Garment"}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
                    />
                  </Link>
                </ChamferedCard>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-(--st-text)">
                      {highlightRight?.name ?? "Bandung Workwear Essentials"}
                    </div>
                    <div className="font-mono-label text-[11px] text-(--st-text-muted)">
                      {highlightRight ? formatIDR(highlightRight.price) : "Limited Release"}
                    </div>
                  </div>
                  <Link
                    href={highlightRight ? `/products/${highlightRight.slug}` : "/products"}
                    className="inline-flex shrink-0 items-center gap-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.1em] text-[#FF5500] hover:underline"
                  >
                    <span>Detail</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>

      {/* 5. INTERACTIVE CATEGORY INDEX & CLIPPED LOOK PREVIEW (REAL DB COUNTS) */}
      <div className="bg-white border-t border-(--st-border)/60">
        <MomentoCategoryIndex
          categories={categoriesWithCounts}
          fallbackImageUrl={look03Img}
        />
      </div>

      {/* 6. SOCIAL PROOF & TESTIMONIALS SECTION (#F3F3F1) */}
      <MotionReveal>
        <section className="border-y border-(--st-border) bg-(--st-bg) py-16 lg:py-22">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              {/* Left: Top Orange Asterisk + Bracketed Tag + Chamfered Beanie Portrait */}
              <div className="lg:col-span-4">
                <div className="mb-5 flex items-center justify-between">
                  <span className="font-mono-label text-[11px] font-medium uppercase tracking-[0.12em] text-(--st-text-muted)">
                    [Testimonials]
                  </span>
                  <span
                    aria-hidden="true"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FF5500] text-sm font-bold text-white"
                  >
                    &#10035;
                  </span>
                </div>

                <ChamferedCard
                  variant="diagonal"
                  aspectClass="aspect-[4/4.2]"
                  hideActionButton
                  topRightSlot={
                    <span className="rounded-full bg-[#FF5500] px-3 py-1 font-mono-label text-[9px] font-semibold uppercase tracking-[0.1em] text-white shadow-xs">
                      TOP PICK
                    </span>
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={testimonialPortraitUrl}
                    alt="SpaceTrip community collector wearing knit beanie and olive overshirt"
                    loading="lazy"
                    className="h-full w-full object-cover object-top"
                  />
                </ChamferedCard>
              </div>

              {/* Center: Quote Typography */}
              <div className="lg:col-span-5 lg:px-4">
                <blockquote className="font-display text-2xl font-medium leading-[1.18] tracking-tight text-[#0D0D0D] sm:text-3xl lg:text-[2.15rem]">
                  &ldquo;Finally, a brand that understands modern urban silhouettes! The
                  curated quality &amp; sizing transparency make every SpaceTrip drop hit
                  right.&rdquo;
                </blockquote>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-(--st-border) pt-4">
                  <div className="font-mono-label text-[11px] text-(--st-text-muted)">
                    <span className="font-semibold text-(--st-text)">Raka Pramudya</span>{" "}
                    &middot; Jakarta Selatan &amp; Bandung Archive
                  </div>
                  <span className="font-display text-3xl font-bold leading-none text-[#0D0D0D]">
                    &rdquo;
                  </span>
                </div>
              </div>

              {/* Right: Clean Large Metrics */}
              <div className="grid grid-cols-2 gap-6 border-t border-(--st-border) pt-6 lg:col-span-3 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                <div>
                  <div className="font-display text-4xl font-semibold tracking-tight text-[#0D0D0D] sm:text-5xl">
                    400+
                  </div>
                  <div className="mt-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
                    CURATED ARCHIVE DROPS
                  </div>
                </div>
                <div>
                  <div className="font-display text-4xl font-semibold tracking-tight text-[#0D0D0D] sm:text-5xl">
                    100%
                  </div>
                  <div className="mt-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
                    QUALITY &amp; FIT INSPECTED
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>

      {/* 7. EDITORIAL MANIFESTO BANNER WITH INLINE IMAGES (#F3F3F1 -> #FFFFFF CARD) */}
      <MotionReveal>
        <section className="bg-(--st-bg) py-14 lg:py-20">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-8">
            <div className="rounded-[28px] border border-(--st-border) bg-white px-5 py-12 text-center sm:px-10 sm:py-16">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
                  [Reviews · 4.9/5]
                </span>
                <div className="flex items-center gap-0.5 text-[#FF5500]" aria-label="5 of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>

              <h2 className="mx-auto mt-6 max-w-4xl font-display text-2xl font-medium leading-[1.22] tracking-tight text-[#0D0D0D] sm:text-4xl lg:text-[2.85rem]">
                At SpaceTrip, we believe{" "}
                <span className="mx-1 inline-flex translate-y-1.5 items-center -space-x-2 align-baseline">
                  {avatarUrls.slice(0, 2).map((src, i) => (
                    <span
                      key={i}
                      className="inline-block h-7 w-7 overflow-hidden rounded-full border-2 border-white sm:h-9 sm:w-9"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover object-top" />
                    </span>
                  ))}
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#FF5500] text-xs font-bold text-white sm:h-9 sm:w-9">
                    &#10035;
                  </span>
                </span>{" "}
                fashion is more than just{" "}
                <span className="mx-1 inline-block h-7 w-14 translate-y-1.5 overflow-hidden rounded-full border border-(--st-border) align-baseline sm:h-9 sm:w-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={capThumbImg}
                    alt="Curated cap detail"
                    className="h-full w-full object-cover"
                  />
                </span>{" "}
                <span className="font-mono-label text-base font-normal text-(--st-text-muted) sm:text-2xl">
                  {"//"}
                </span>{" "}
                clothing&mdash;it&apos;s an expression of who you are in every moment.
              </h2>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#FF5500]"
                >
                  <span>LEARN MORE</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/products?sort=featured"
                  className="font-mono-label text-[11px] font-medium uppercase tracking-[0.12em] text-(--st-text-muted) underline underline-offset-4 transition hover:text-[#FF5500]"
                >
                  [Shop The Curation]
                </Link>
              </div>
            </div>
          </div>
        </section>
      </MotionReveal>

      {/* 8. 4-COLUMN CLIPPED PRODUCT CATALOG (REAL SUPABASE DATA) */}
      <div className="bg-white py-14 lg:py-20">
        <div className="mx-auto max-w-[1440px] space-y-16 px-4 sm:px-8">
          {/* Interactive Best Sellers Grid */}
          <MotionReveal>
            <BestSellersInteractive
              collections={{
                featured: bestSellers,
                men: menDrops,
                women: womenDrops,
                unisex: unisexDrops,
                accessories: accessoriesDrops,
              }}
            />
          </MotionReveal>

          {/* Just Landed Row */}
          <MotionReveal>
            <section>
              <div className="flex flex-col justify-between gap-3 border-b border-(--st-border) pb-4 sm:flex-row sm:items-end">
                <div>
                  <div className="font-mono-label text-[11px] font-medium uppercase tracking-[0.12em] text-(--st-text-muted)">
                    [Just Landed]
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-(--st-text) sm:text-3xl">
                    New arrivals
                  </h2>
                </div>
                <Link
                  href="/products?sort=newest"
                  className="inline-flex items-center gap-1.5 self-start rounded-full border border-(--st-border) bg-white px-4 py-1.5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-(--st-text) transition hover:border-[#0D0D0D] sm:self-auto"
                >
                  <span>VIEW ALL</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {renderProductCards(newArrivals)}
              </div>
            </section>
          </MotionReveal>

          {/* Accessible Under IDR 100K Curations */}
          <MotionReveal>
            <section>
              <div className="flex flex-col justify-between gap-3 border-b border-(--st-border) pb-4 sm:flex-row sm:items-end">
                <div>
                  <div className="font-mono-label text-[11px] font-medium uppercase tracking-[0.12em] text-[#FF5500]">
                    [Accessible Curations]
                  </div>
                  <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-(--st-text) sm:text-3xl">
                    Under IDR 100K
                  </h2>
                </div>
                <Link
                  href="/products?maxPrice=100000"
                  className="inline-flex items-center gap-1.5 self-start rounded-full border border-(--st-border) bg-white px-4 py-1.5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-(--st-text) transition hover:border-[#0D0D0D] sm:self-auto"
                >
                  <span>VIEW ALL</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
                {renderProductCards(under100k)}
              </div>
            </section>
          </MotionReveal>
        </div>
      </div>

      {/* 9. RUNNING ARCHIVE TICKER + INTERACTIVE NUMBERED ACCORDION */}
      <MomentoAccordion primaryImageUrl={workwearImg} secondaryImageUrl={japaneseImg} />

      {/* 10. EDITORIAL LOOKBOOK ("Worn By Local Voices" Connected To Supabase Looks) */}
      <div className="bg-white border-t border-(--st-border)">
        <MotionReveal>
          <EditorialLookbook looks={looks} />
        </MotionReveal>
      </div>

      {/* Unused seasonalImg retained cleanly if needed by campaign strip */}
      <div className="sr-only" data-campaign-asset={seasonalImg} />
    </MobileShell>
  );
}
