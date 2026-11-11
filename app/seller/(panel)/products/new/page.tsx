export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import {
  adminCreateProduct,
  adminInsertProductImages,
  adminListCategories,
} from "@/lib/catalog/admin";
import { productSchema } from "@/lib/catalog/validation";
import { uploadProductImage } from "@/lib/catalog/storage";
import { ProductForm } from "../_components/product-form";

export default async function NewProductPage() {
  const categories = await adminListCategories();

  async function createProductAction(formData: FormData) {
    "use server";

    const variantSizeLabels = formData.getAll("variant_size_label").map(String);
    const variantStocks = formData.getAll("variant_stock").map(String);

    const variants = variantSizeLabels
      .map((size_label, idx) => {
        const stockStr = variantStocks[idx] ?? "0";
        return {
          size_label: size_label.trim(),
          stock: Number(stockStr),
        };
      })
      .filter((v) => v.size_label.length > 0);

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
      variants,
    };

    const parsed = productSchema.safeParse(values);
    if (!parsed.success) throw new Error("Input produk tidak valid");

    const created = await adminCreateProduct({
      ...parsed.data,
      description: parsed.data.description ?? null,
      images: [],
    });

    const files = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, 5);

    if (files.length > 0) {
      const uploaded: { storage_path: string; sort_order: number }[] = [];
      for (let i = 0; i < files.length; i++) {
        const { storagePath } = await uploadProductImage({
          productId: created.id,
          file: files[i],
        });
        uploaded.push({ storage_path: storagePath, sort_order: i });
      }

      await adminInsertProductImages(created.id, uploaded);
    }

    redirect("/seller/products");
  }

  return (
    <PageShell>
      <PageHeader
        title="Tambah Produk"
        description="Buat listing baru beserta detail material, pengukuran, harga diskon, varian ukuran, dan foto studio."
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "katalog", href: "/seller/products" },
              { label: "baru" },
            ]}
          />
        }
      />

      <section className="mt-6 rounded-3xl border border-(--st-border) bg-white p-6 sm:p-8">
        <ProductForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          action={createProductAction}
        />
      </section>
    </PageShell>
  );
}
