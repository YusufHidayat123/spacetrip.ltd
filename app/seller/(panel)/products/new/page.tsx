export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { adminCreateProduct, adminInsertProductImages, adminListCategories } from "@/lib/catalog/admin";
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

    const values = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      category_id: String(formData.get("category_id") ?? ""),
      description: (String(formData.get("description") ?? "") || null) as
        | string
        | null,
      price: Number(String(formData.get("price") ?? "0")),
      status: (String(formData.get("status") ?? "draft") as
        | "draft"
        | "active"),
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
        title="Produk Baru"
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

      <section className="mt-6 rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <ProductForm
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          action={createProductAction}
        />
      </section>
    </PageShell>
  );
}
