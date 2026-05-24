export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { ProductImageCarousel } from "@/components/storefront/product-image-carousel";
import { ProductCheckoutSheet } from "@/components/storefront/product-checkout-sheet";
import { formatIDR } from "@/lib/orders/format";

import {
  getPublicProductImageUrl,
  publicGetActiveProductBySlug,
} from "@/lib/catalog/public";

function isSupabaseNoRowsError(e: unknown): e is { code: string } {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: unknown }).code === "PGRST116";
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

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loggedIn = Boolean(user);

  let profileComplete = false;
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name,shipping_address")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const fullNameOk = Boolean(profile?.full_name && String(profile.full_name).trim().length > 0);
    const addressOk = hasCompleteShippingAddress(profile?.shipping_address);
    profileComplete = fullNameOk && addressOk;
  }

  async function checkoutAction(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Do not allow ordering before login.
    if (!user) {
      redirect(`/login?next=${encodeURIComponent(`/products/${slug}`)}`);
    }

    // Enforce profile completion before checkout (name + shipping address).
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name,shipping_address")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    const fullNameOk = Boolean(profile?.full_name && String(profile.full_name).trim().length > 0);
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
            profileComplete={profileComplete}
            variants={variants}
            defaultVariantId={defaultVariantId}
            action={checkoutAction}
          />
        </section>
      </main>
    </MobileShell>
  );
}
