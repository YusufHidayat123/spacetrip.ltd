export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import {
  adminDeleteProductImages,
  adminDeleteProductVariants,
  adminGetProduct,
  adminInsertProductImages,
  adminListCategories,
  adminUpdateProduct,
  adminUpsertProductVariants,
} from "@/lib/catalog/admin";
import { uploadProductImage } from "@/lib/catalog/storage";
import { productUpdateSchema } from "@/lib/catalog/validation";
import { ProductEditForm } from "../_components/product-edit-form";

function publicStorageUrl(storagePath: string) {
  if (storagePath.startsWith("http")) return storagePath;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";
  if (!url) return "";
  return `${url}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { product, variants, images } = await adminGetProduct(id);
  const categories = await adminListCategories();

  async function updateProductAction(formData: FormData) {
    "use server";

    const variantIds = formData.getAll("variant_id").map(String);
    const variantSizeLabels = formData.getAll("variant_size_label").map(String);
    const variantStocks = formData.getAll("variant_stock").map(String);
    const variantIsActive = formData.getAll("variant_is_active").map(String);

    const parsedVariants = variantSizeLabels
      .map((size_label, idx) => {
        const stockStr = variantStocks[idx] ?? "0";
        const isActiveStr = variantIsActive[idx] ?? "1";
        const idValue = (variantIds[idx] ?? "").trim();
        return {
          id: idValue.length > 0 ? idValue : undefined,
          size_label: size_label.trim(),
          stock: Number(stockStr),
          is_active: isActiveStr === "1",
        };
      })
      .filter((v) => v.size_label.length > 0);

    const removedVariantIds = formData.getAll("removed_variant_id").map(String);
    const removedImageIds = formData.getAll("removed_image_id").map(String);

    const origPriceStr = String(formData.get("original_price") ?? "").trim();
    const originalPriceVal =
      origPriceStr.length > 0 && Number.isFinite(Number(origPriceStr))
        ? Number(origPriceStr)
        : null;

    const rawTags = String(formData.get("style_tags") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const values = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      category_id: String(formData.get("category_id") ?? ""),
      description: (String(formData.get("description") ?? "").trim() || null) as string | null,
      price: Number(String(formData.get("price") ?? "0")),
      original_price: originalPriceVal,
      status: String(formData.get("status") ?? "draft") as "draft" | "active",
      gender: String(formData.get("gender") ?? "unisex") as
        | "men"
        | "women"
        | "unisex"
        | "accessories",
      condition: String(formData.get("condition") ?? "").trim() || "Excellent",
      color: String(formData.get("color") ?? "").trim() || null,
      material: String(formData.get("material") ?? "").trim() || null,
      measurements: String(formData.get("measurements") ?? "").trim() || null,
      badge: String(formData.get("badge") ?? "").trim() || null,
      style_tags: rawTags,
      is_featured: formData.get("is_featured") === "on",
      variants: parsedVariants,
      removed_variant_ids: removedVariantIds,
      removed_image_ids: removedImageIds,
    };

    const parsed = productUpdateSchema.safeParse(values);
    if (!parsed.success) throw new Error("Input update produk tidak valid");

    await adminUpdateProduct(id, {
      category_id: parsed.data.category_id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      original_price: parsed.data.original_price ?? null,
      status: parsed.data.status,
      gender: parsed.data.gender,
      condition: parsed.data.condition ?? null,
      color: parsed.data.color ?? null,
      material: parsed.data.material ?? null,
      measurements: parsed.data.measurements ?? null,
      badge: parsed.data.badge ?? null,
      style_tags: parsed.data.style_tags,
      is_featured: parsed.data.is_featured,
    });

    await adminDeleteProductVariants(parsed.data.removed_variant_ids);
    await adminUpsertProductVariants(id, parsed.data.variants);
    await adminDeleteProductImages(parsed.data.removed_image_ids);

    const files = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, 5);

    if (files.length > 0) {
      const startOrder = images.length;
      const uploaded: { storage_path: string; sort_order: number }[] = [];

      for (let i = 0; i < files.length; i++) {
        const { storagePath } = await uploadProductImage({
          productId: id,
          file: files[i],
        });
        uploaded.push({ storage_path: storagePath, sort_order: startOrder + i });
      }

      await adminInsertProductImages(id, uploaded);
    }

    redirect(`/seller/products/${id}`);
  }

  const imageItems = images.map((img) => ({
    id: img.id,
    storage_path: img.storage_path,
    sort_order: img.sort_order,
    url: publicStorageUrl(img.storage_path),
  }));

  return (
    <PageShell>
      <PageHeader
        title={product.name}
        badge={
          <span
            className={`rounded-full px-3 py-0.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] ${
              product.status === "active"
                ? "bg-[#0D0D0D] text-white"
                : "bg-(--st-surface-alt) text-(--st-text-muted)"
            }`}
          >
            {product.status === "active" ? "Aktif" : "Draft"}
          </span>
        }
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "katalog", href: "/seller/products" },
              { label: product.name },
            ]}
          />
        }
        right={
          product.status === "active" ? (
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-(--st-border) bg-white px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]"
            >
              <span>Lihat di Storefront</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : null
        }
      />

      <div className="mt-6">
        <ProductEditForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          action={updateProductAction}
          defaultValues={{
            product: {
              name: product.name,
              slug: product.slug,
              category_id: product.category_id,
              price: product.price,
              original_price: product.original_price,
              status: product.status,
              description: product.description,
              gender: product.gender ?? "unisex",
              condition: product.condition ?? "Excellent",
              color: product.color,
              material: product.material,
              measurements: product.measurements,
              badge: product.badge,
              style_tags: product.style_tags ?? [],
              is_featured: Boolean(product.is_featured),
            },
            variants,
            images: imageItems,
          }}
        />
      </div>
    </PageShell>
  );
}
