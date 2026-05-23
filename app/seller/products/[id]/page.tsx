export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
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

    const values = {
      name: String(formData.get("name") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      category_id: String(formData.get("category_id") ?? ""),
      description: (String(formData.get("description") ?? "") || null) as
        | string
        | null,
      price: Number(String(formData.get("price") ?? "0")),
      status: String(formData.get("status") ?? "draft") as "draft" | "active",
      variants: parsedVariants,
      removed_variant_ids: removedVariantIds,
      removed_image_ids: removedImageIds,
    };

    const parsed = productUpdateSchema.safeParse(values);
    if (!parsed.success) throw new Error("Invalid product update input");

    await adminUpdateProduct(id, {
      category_id: parsed.data.category_id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      status: parsed.data.status,
    });

    // Variants: delete removed, then upsert current.
    await adminDeleteProductVariants(parsed.data.removed_variant_ids);
    await adminUpsertProductVariants(id, parsed.data.variants);

    // Images: delete removed records (MVP: we keep storage object; cleanup can be added later)
    await adminDeleteProductImages(parsed.data.removed_image_ids);

    // Upload new images (optional)
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
        title="Manage Product"
        badge={<Badge>{product.status}</Badge>}
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "seller", href: "/seller" },
              { label: "catalog", href: "/seller/products" },
              { label: product.name },
            ]}
          />
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
              status: product.status,
              description: product.description,
            },
            variants,
            images: imageItems,
          }}
        />
      </div>
    </PageShell>
  );
}
