export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";

import { isCustomerLoggedIn } from "@/lib/supabase/auth";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { ProductImageCarousel } from "@/components/storefront/product-image-carousel";
import { ProductCheckoutSheet } from "@/components/storefront/product-checkout-sheet";
import { formatIDR } from "@/lib/orders/format";
import { createOrderMvp } from "@/lib/orders/public";
import {
  getPublicProductImageUrl,
  publicGetActiveProductBySlug,
} from "@/lib/catalog/public";

function isSupabaseNoRowsError(e: unknown): e is { code: string } {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: unknown }).code === "PGRST116";
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
    // Supabase "single()" returns PGRST116 when no rows.
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
  const defaultVariantId = variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? "";

  const loggedIn = await isCustomerLoggedIn();

  async function checkoutAction(formData: FormData) {
    "use server";

    // Do not allow ordering before login.
    if (!(await isCustomerLoggedIn())) {
      redirect(`/profile?next=/products/${slug}&intent=checkout`);
    }

    const variant_id = String(formData.get("variant_id") ?? "");
    const quantity = Number(String(formData.get("quantity") ?? "1"));

    const customer_name = String(formData.get("customer_name") ?? "");
    const customer_email = String(formData.get("customer_email") ?? "");
    const customer_phone = String(formData.get("customer_phone") ?? "");

    const line1 = String(formData.get("line1") ?? "");
    const city = String(formData.get("city") ?? "");
    const province = String(formData.get("province") ?? "");
    const postal_code = String(formData.get("postal_code") ?? "");

    if (!variant_id) throw new Error("Please select a size.");
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }
    if (!customer_name) throw new Error("Customer name is required");
    if (!line1 || !city || !province || !postal_code) {
      throw new Error("Complete shipping address");
    }

    const { orderId } = await createOrderMvp({
      customer_name,
      customer_email: customer_email || null,
      customer_phone: customer_phone || null,
      shipping_address: { line1, city, province, postal_code },
      items: [{ variant_id, quantity }],
    });

    redirect(`/orders/${orderId}`);
  }

  return (
    <MobileShell>
      <StoreHeader title={product.category?.name ?? "Produk"} backHref="/products" />

      <main className="pb-6">
        <ProductImageCarousel images={carouselImages} />

        <section className="-mt-6 rounded-t-[28px] border-t border-(--st-border) bg-white px-5 pt-5">
          <div className="text-xs font-medium text-(--st-text-muted)">
            {product.category?.name ?? "Uncategorized"}
          </div>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-(--st-text)">
              {product.name}
            </h1>
            <div className="shrink-0 text-base font-semibold text-(--st-text)">
              {formatIDR(product.price)}
            </div>
          </div>

          {product.description ? (
            <p className="mt-3 text-sm leading-6 text-(--st-text-muted)">
              {product.description}
            </p>
          ) : null}

          <div className="mt-4 rounded-2xl border border-(--st-border) bg-[#F7F8FA] p-4 text-sm">
            <div className="font-medium text-(--st-text)">Catatan thrift</div>
            <div className="mt-1 text-(--st-text-muted)">
              Setiap item unik dan stok terbatas. Pastikan ukuran & detailnya cocok sebelum pesan.
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-(--st-border) bg-[#F7F8FA] p-4 text-sm">
            {loggedIn ? (
              <div className="text-(--st-text-muted)">
                Kamu sudah masuk. Kamu bisa lanjut pilih ukuran & jumlah.
              </div>
            ) : (
              <div>
                <div className="font-medium text-(--st-text)">Harus masuk dulu</div>
                <div className="mt-1 text-(--st-text-muted)">
                  Masuk untuk bisa melakukan pemesanan dan lihat status order.
                </div>
              </div>
            )}
          </div>

          <ProductCheckoutSheet
            slug={slug}
            productName={product.name}
            loggedIn={loggedIn}
            variants={variants}
            defaultVariantId={defaultVariantId}
            action={checkoutAction}
          />
        </section>
      </main>
    </MobileShell>
  );
}
