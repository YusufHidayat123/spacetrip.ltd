import "server-only";

import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Category, Product, ProductImage, ProductVariant } from "./types";

export type PublicProductListItem = Product & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

export type PublicProductDetail = Product & {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export function getPublicProductImageUrl(storagePath: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");

  // Bucket is expected to be public (see SUPABASE_SETUP.md)
  return `${url}/storage/v1/object/public/${bucket}/${storagePath}`;
}

export async function publicListActiveCategories() {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,is_active,created_at,updated_at")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function publicListActiveProducts(params?: {
  q?: string;
  categorySlug?: string;
  limit?: number;
}) {
  const supabase = createSupabasePublicClient();

  let categoryId: string | null = null;
  if (params?.categorySlug) {
    const { data: cat, error: catErr } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categorySlug)
      .single();
    if (catErr) {
      // If category doesn't exist, return empty list (no need to 500)
      return [] as PublicProductListItem[];
    }
    categoryId = (cat as { id: string }).id;
  }

  let query = supabase
    .from("products")
    .select(
      "id,category_id,name,slug,description,price,status,created_at,updated_at,categories(id,name,slug),product_images(id,product_id,storage_path,alt,sort_order,created_at),product_variants(id,product_id,size_label,stock,sku,is_active,created_at,updated_at)"
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (categoryId) query = query.eq("category_id", categoryId);

  if (params?.q && params.q.trim().length > 0) {
    query = query.ilike("name", `%${params.q.trim()}%`);
  }

  if (typeof params?.limit === "number" && Number.isFinite(params.limit)) {
    query = query.limit(Math.max(1, Math.min(params.limit, 60)));
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []) as unknown as PublicProductListItem[];
}

export async function publicGetActiveProductBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  const { data: product, error: productErr } = await supabase
    .from("products")
    .select("id,category_id,name,slug,description,price,status,created_at,updated_at,categories(id,name,slug)")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (productErr) throw productErr;

  const productId = (product as { id: string }).id;

  const [{ data: images, error: imagesErr }, { data: variants, error: variantsErr }] =
    await Promise.all([
      supabase
        .from("product_images")
        .select("id,product_id,storage_path,alt,sort_order,created_at")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("product_variants")
        .select("id,product_id,size_label,stock,sku,is_active,created_at,updated_at")
        .eq("product_id", productId)
        .eq("is_active", true)
        .order("size_label", { ascending: true }),
    ]);

  if (imagesErr) throw imagesErr;
  if (variantsErr) throw variantsErr;

  const p = product as unknown as Product & {
    categories?: Pick<Category, "id" | "name" | "slug"> | null;
  };

  return {
    ...(p as Product),
    category: p.categories ?? null,
    images: (images ?? []) as ProductImage[],
    variants: (variants ?? []) as ProductVariant[],
  } as PublicProductDetail;
}
