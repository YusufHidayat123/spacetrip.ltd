export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Ruler, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { ProductImageCarousel } from "@/components/storefront/product-image-carousel";
import { ProductCheckoutSheet } from "@/components/storefront/product-checkout-sheet";
import { ProductCard } from "@/components/storefront/product-card";
import { formatIDR } from "@/lib/orders/format";
import {
  getPublicProductImageUrl,
  publicGetActiveProductBySlug,
  publicListCategoriesWithCounts,
  publicListRelatedProducts,
} from "@/lib/catalog/public";

function isSupabaseNoRowsError(e: unknown): e is { code: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: unknown }).code === "PGRST116"
  );
}

type ShippingAddress = {
  line1: string;
  city: string;
  province: string;
  postal_code: string;
};

function hasCompleteShippingAddress(a: unknown): a is ShippingAddress {
  if (typeof a !== "object" || a === null) return false;
  const o = a as Record<string, unknown>;
  const keys = ["line1", "city", "province", "postal_code"] as const;
  return keys.every((k) => typeof o[k] === "string" && String(o[k]).trim().length > 0);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let product: Awaited<ReturnType<typeof publicGetActiveProductBySlug>>;
  try {
    product = await publicGetActiveProductBySlug(slug);
  } catch (e: unknown) {
    if (isSupabaseNoRowsError(e)) notFound();
    throw e;
  }

  const images = (product.images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  const carouselImages = images.map((img) => ({
    id: img.id,
    url: getPublicProductImageUrl(img.storage_path),
    alt: img.alt ?? product.name,
  }));

  const variants = (product.variants ?? []).slice();
  const totalStock = variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  const isSoldOut = variants.length > 0 && totalStock <= 0;
  const defaultVariantId = variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? "";

  const numPrice = Number(product.price);
  const numOrig = product.original_price ? Number(product.original_price) : null;
  const hasDiscount =
    numOrig !== null &&
    Number.isFinite(numOrig) &&
    Number.isFinite(numPrice) &&
    numOrig > numPrice;
  const discountPct = hasDiscount ? Math.round(((numOrig - numPrice) / numOrig) * 100) : 0;

  const supabase = await createSupabaseServerClient();
  const [
    {
      data: { user },
    },
    relatedProducts,
    categoriesWithCounts,
  ] = await Promise.all([
    supabase.auth.getUser(),
    publicListRelatedProducts(product.id, product.category_id, 4),
    publicListCategoriesWithCounts(),
  ]);

  const headerCategories = categoriesWithCounts.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    productCount: c.productCount,
  }));

  const loggedIn = Boolean(user);

  let profileComplete = false;
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name,shipping_address")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const fullNameOk = Boolean(
      profile?.full_name && String(profile.full_name).trim().length > 0
    );
    const addressOk = hasCompleteShippingAddress(profile?.shipping_address);
    profileComplete = fullNameOk && addressOk;
  }

  async function checkoutAction(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/login?next=${encodeURIComponent(`/products/${slug}`)}`);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name,shipping_address")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    const fullNameOk = Boolean(
      profile?.full_name && String(profile.full_name).trim().length > 0
    );
    const addressOk = hasCompleteShippingAddress(profile?.shipping_address);

    if (!fullNameOk || !addressOk) {
      redirect(`/profile/setup?next=${encodeURIComponent(`/products/${slug}`)}`);
    }

    const variant_id = String(formData.get("variant_id") ?? "");
    const quantity = Number(String(formData.get("quantity") ?? "1"));

    if (!variant_id) throw new Error("Pilih ukuran dulu.");
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error("Jumlah minimal 1.");
    }

    const { data, error } = await supabase.rpc("create_order_with_stock_auth", {
      _shipping_address: null,
      _items: [{ variant_id, quantity }],
    });

    if (error) throw error;

    const row = (data as unknown as { order_id: string; order_number: string }[] | null)?.[0];
    if (!row?.order_id) throw new Error("Gagal membuat order");

    redirect(`/orders/${row.order_id}`);
  }

  const tags = Array.isArray(product.style_tags) ? product.style_tags : [];

  return (
    <MobileShell>
      <StoreHeader
        title={product.category?.name ?? "Detail"}
        backHref="/products"
        categories={headerCategories}
      />

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 lg:py-10">
        {/* Editorial Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 font-mono-label text-[10px] uppercase tracking-[0.14em] text-(--st-text-muted)"
        >
          <Link href="/" className="hover:text-[#FF5500]">
            SPACETRIP
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#FF5500]">
            ARCHIVE
          </Link>
          {product.category ? (
            <>
              <span>/</span>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="hover:text-[#FF5500]"
              >
                {product.category.name}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span className="truncate text-[#0D0D0D]">{product.name}</span>
        </nav>

        {/* Two-Column Editorial Split */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left: Chamfered Gallery */}
          <div className="lg:col-span-7">
            <ProductImageCarousel
              images={carouselImages}
              badge={product.badge}
              isSoldOut={isSoldOut}
            />
          </div>

          {/* Right: Momento Rounded Dossier */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl border border-(--st-border) bg-white p-6 shadow-xs sm:p-9">
              {/* Top micro-meta */}
              <div className="flex flex-wrap items-center gap-2 font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em]">
                <span className="text-(--st-text-muted)">
                  [{product.category?.name ?? "Curated Drop"}
                  {product.gender ? ` · ${product.gender}` : ""}]
                </span>
                {product.condition ? (
                  <span className="rounded-full border border-(--st-accent-border) bg-(--st-accent-soft) px-2.5 py-0.5 text-[#CC4400]">
                    {product.condition}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-3 font-display text-2xl font-medium leading-[1.08] tracking-tight text-[#0D0D0D] sm:text-3xl">
                {product.name}
              </h1>

              {/* Price Block */}
              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="font-display text-2xl font-semibold tracking-tight text-[#0D0D0D]">
                  {formatIDR(product.price)}
                </span>
                {hasDiscount ? (
                  <>
                    <span className="text-sm text-(--st-text-muted) line-through">
                      {formatIDR(String(numOrig))}
                    </span>
                    <span className="rounded-full bg-[#FF5500] px-2.5 py-0.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                      HEMAT {discountPct}%
                    </span>
                  </>
                ) : null}
              </div>

              {/* Description */}
              {product.description ? (
                <p className="mt-5 text-sm leading-relaxed text-(--st-text-muted)">
                  {product.description}
                </p>
              ) : null}

              {/* Purchase Controls */}
              <ProductCheckoutSheet
                productId={product.id}
                slug={slug}
                productName={product.name}
                price={numPrice}
                categoryName={product.category?.name ?? null}
                imageUrl={carouselImages[0]?.url ?? ""}
                loggedIn={loggedIn}
                profileComplete={profileComplete}
                variants={variants}
                defaultVariantId={defaultVariantId}
                action={checkoutAction}
              />

              {/* Garment Spec Dossier */}
              <div className="mt-8 border-t border-(--st-border) pt-6">
                <div className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
                  [Garment Dossier]
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                  <div>
                    <dt className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                      Kondisi
                    </dt>
                    <dd className="mt-0.5 font-medium text-(--st-text)">
                      {product.condition ?? "Excellent (Curated)"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                      Warna
                    </dt>
                    <dd className="mt-0.5 font-medium text-(--st-text)">
                      {product.color ?? "Sesuai foto studio"}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                      Material
                    </dt>
                    <dd className="mt-0.5 font-medium text-(--st-text)">
                      {product.material ?? "Material streetwear kurasi"}
                    </dd>
                  </div>
                  {product.measurements ? (
                    <div className="col-span-2 rounded-2xl border border-(--st-border) bg-(--st-bg) p-3.5">
                      <dt className="flex items-center gap-1.5 font-mono-label text-[10px] font-semibold uppercase text-(--st-text)">
                        <Ruler className="h-3.5 w-3.5 text-[#FF5500]" />
                        Detail Pengukuran
                      </dt>
                      <dd className="mt-1 font-mono-label text-xs text-(--st-text-muted)">
                        {product.measurements}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                {tags.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/products?style=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-(--st-border) bg-(--st-bg) px-3 py-1 font-mono-label text-[10px] uppercase tracking-[0.1em] text-(--st-text-muted) transition hover:border-[#FF5500] hover:text-[#FF5500]"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Authenticity & Curated Promise */}
              <div className="mt-6 grid gap-2.5 border-t border-(--st-border) pt-5 text-xs text-(--st-text-muted)">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#FF5500]" />
                  <span>
                    <strong className="font-medium text-(--st-text)">Limited Drop Policy:</strong>{" "}
                    Item thrift &amp; capsule drop tersedia dalam jumlah sangat terbatas.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0D0D0D]" />
                  <span>Lolos kurasi kebersihan, jahitan, dan inspeksi visual SpaceTrip.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#0D0D0D]" />
                  <span>Dikemas rapi &amp; dikirim ke seluruh Indonesia.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 ? (
          <section className="mt-16 border-t border-(--st-border) pt-12">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="font-mono-label text-[11px] font-medium uppercase tracking-[0.12em] text-(--st-text-muted)">
                  [More From Archive]
                </div>
                <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-(--st-text) sm:text-3xl">
                  Pilihan serupa
                </h2>
              </div>
              <Link
                href={product.category ? `/products?category=${product.category.slug}` : "/products"}
                className="inline-flex items-center gap-1.5 self-start rounded-full border border-(--st-border) bg-white px-4 py-1.5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-(--st-text) transition hover:border-[#0D0D0D] sm:self-auto"
              >
                <span>VIEW ALL</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {relatedProducts.map((item, idx) => {
                const imgs = (item.product_images ?? [])
                  .slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                const hero = imgs[0] ?? null;
                return (
                  <ProductCard
                    key={item.id}
                    id={item.id}
                    slug={item.slug}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    originalPrice={item.original_price}
                    categoryName={item.categories?.name ?? null}
                    condition={item.condition}
                    color={item.color}
                    material={item.material}
                    measurements={item.measurements}
                    styleTags={item.style_tags}
                    badge={item.badge}
                    variants={item.product_variants}
                    showAsterisk={idx === 0}
                    image={
                      hero ? { storage_path: hero.storage_path, alt: hero.alt ?? null } : null
                    }
                  />
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
    </MobileShell>
  );
}
