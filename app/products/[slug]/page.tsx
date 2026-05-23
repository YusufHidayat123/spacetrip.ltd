export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const hero = images[0];
  const heroUrl = hero ? getPublicProductImageUrl(hero.storage_path) : null;

  const variants = (product.variants ?? []).slice();
  const defaultVariantId = variants.find((v) => v.stock > 0)?.id ?? variants[0]?.id ?? "";

  async function checkoutAction(formData: FormData) {
    "use server";

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
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          spacetrip
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="h-9">
            <Link href="/products">All products</Link>
          </Button>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-(--st-border) bg-white shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="relative aspect-square bg-[#F7F8FA]">
            {heroUrl ? (
              <Image
                src={heroUrl}
                alt={hero?.alt ?? product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-(--st-text-muted)">
                No image
              </div>
            )}
          </div>

          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 border-t border-(--st-border) p-3">
              {images.slice(0, 4).map((img) => {
                const url = getPublicProductImageUrl(img.storage_path);
                return (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-md border border-(--st-border) bg-[#F7F8FA]"
                  >
                    <Image
                      src={url}
                      alt={img.alt ?? product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>

        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="text-xs font-medium text-(--st-text-muted)">
            {product.category?.name ?? "Uncategorized"}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--st-text)">
            {product.name}
          </h1>
          <div className="mt-3 text-lg font-semibold text-(--st-text)">
            {formatIDR(product.price)}
          </div>

          {product.description ? (
            <p className="mt-4 text-sm leading-7 text-(--st-text-muted)">
              {product.description}
            </p>
          ) : null}

          <div className="mt-6 rounded-lg border border-(--st-border) bg-[#F7F8FA] p-4 text-sm">
            <div className="font-medium text-(--st-text)">
              Checkout (Manual QRIS)
            </div>
            <div className="mt-1 text-(--st-text-muted)">
              After placing your order, you’ll be redirected to upload payment proof.
            </div>
          </div>

          <form action={checkoutAction} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">
                Size
              </label>
              <select
                name="variant_id"
                defaultValue={defaultVariantId}
                required
                className="h-10 w-full rounded-md border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
              >
                {variants.length === 0 ? (
                  <option value="" disabled>
                    No variants available
                  </option>
                ) : (
                  variants.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                      {v.size_label} {v.stock <= 0 ? "(out of stock)" : `(stock: ${v.stock})`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">
                Quantity
              </label>
              <Input name="quantity" type="number" min={1} defaultValue={1} />
            </div>

            <div className="grid gap-4 rounded-lg border border-(--st-border) p-4">
              <div className="text-sm font-semibold text-(--st-text)">
                Customer
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-(--st-text)">
                    Name
                  </label>
                  <Input name="customer_name" placeholder="John Doe" required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-(--st-text)">
                    Email (optional)
                  </label>
                  <Input name="customer_email" type="email" placeholder="john@email.com" />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-medium text-(--st-text)">
                    Phone (optional)
                  </label>
                  <Input name="customer_phone" placeholder="08xxxxxxxxxx" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-lg border border-(--st-border) p-4">
              <div className="text-sm font-semibold text-(--st-text)">
                Shipping address
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-sm font-medium text-(--st-text)">
                    Address line
                  </label>
                  <Input name="line1" placeholder="Jl. Example No. 123" required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-(--st-text)">
                    City
                  </label>
                  <Input name="city" placeholder="Jakarta" required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-(--st-text)">
                    Province
                  </label>
                  <Input name="province" placeholder="DKI Jakarta" required />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-(--st-text)">
                    Postal code
                  </label>
                  <Input name="postal_code" placeholder="12345" required />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button asChild variant="outline">
                <Link href="/products">Continue shopping</Link>
              </Button>
              <SubmitButton pendingText="Creating order...">Place order</SubmitButton>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
