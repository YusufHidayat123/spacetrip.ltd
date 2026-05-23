import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Category, Product, ProductImage, ProductVariant } from "./types";

export async function adminListCategories() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function adminCreateCategory(input: {
  name: string;
  slug: string;
  is_active: boolean;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as Category;
}

export async function adminGetCategory(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Category;
}

export async function adminUpdateCategory(
  id: string,
  input: { name: string; slug: string; is_active: boolean }
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Category;
}

export async function adminListProducts(params?: {
  q?: string;
  status?: "draft" | "active" | "all";
  page?: number;
  pageSize?: number;
}) {
  const supabase = createSupabaseAdminClient();

  const pageSize = Math.min(Math.max(params?.pageSize ?? 20, 1), 100);
  const page = Math.max(params?.page ?? 1, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(
      "id,category_id,name,slug,price,status,created_at,updated_at,categories(id,name,slug),product_images(id,storage_path,sort_order),product_variants(id,size_label,stock,is_active)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params?.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params?.q && params.q.trim().length > 0) {
    query = query.ilike("name", `%${params.q.trim()}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data ?? [],
    count: count ?? 0,
    page,
    pageSize,
  };
}

export async function adminCreateProduct(input: {
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  status: "draft" | "active";
  variants: { size_label: string; stock: number }[];
  images?: { storage_path: string; sort_order: number; alt?: string | null }[];
}) {
  const supabase = createSupabaseAdminClient();

  const { variants, images, ...product } = input;

  const { data: created, error: productError } = await supabase
    .from("products")
    .insert({
      ...product,
      // Supabase accepts number for numeric; it will store numeric(12,2)
    })
    .select("*")
    .single();

  if (productError) throw productError;

  const productId = (created as Product).id;

  const { error: variantError } = await supabase.from("product_variants").insert(
    variants.map((v) => ({
      product_id: productId,
      size_label: v.size_label,
      stock: v.stock,
    }))
  );
  if (variantError) throw variantError;

  if (images && images.length > 0) {
    const { error: imageError } = await supabase.from("product_images").insert(
      images.map((img) => ({
        product_id: productId,
        storage_path: img.storage_path,
        sort_order: img.sort_order,
        alt: img.alt ?? null,
      }))
    );
    if (imageError) throw imageError;
  }

  return created as Product;
}

export async function adminInsertProductImages(
  productId: string,
  images: { storage_path: string; sort_order: number; alt?: string | null }[]
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("product_images").insert(
    images.map((img) => ({
      product_id: productId,
      storage_path: img.storage_path,
      sort_order: img.sort_order,
      alt: img.alt ?? null,
    }))
  );
  if (error) throw error;
}

export async function adminUpdateProduct(
  productId: string,
  input: {
    category_id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    status: "draft" | "active";
  }
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", productId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Product;
}

export async function adminUpsertProductVariants(
  productId: string,
  variants: {
    id?: string;
    size_label: string;
    stock: number;
    is_active: boolean;
  }[]
) {
  const supabase = createSupabaseAdminClient();

  const updates = variants.filter((v) => v.id);
  const inserts = variants.filter((v) => !v.id);

  if (updates.length > 0) {
    const { error } = await supabase
      .from("product_variants")
      .upsert(
        updates.map((v) => ({
          id: v.id,
          product_id: productId,
          size_label: v.size_label,
          stock: v.stock,
          is_active: v.is_active,
        }))
      );
    if (error) throw error;
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from("product_variants").insert(
      inserts.map((v) => ({
        product_id: productId,
        size_label: v.size_label,
        stock: v.stock,
        is_active: v.is_active,
      }))
    );
    if (error) throw error;
  }
}

export async function adminDeleteProductVariants(variantIds: string[]) {
  if (variantIds.length === 0) return;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .in("id", variantIds);
  if (error) throw error;
}

export async function adminDeleteProductImages(imageIds: string[]) {
  if (imageIds.length === 0) return;
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("product_images")
    .delete()
    .in("id", imageIds);
  if (error) throw error;
}

export async function adminGetProduct(productId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();
  if (productError) throw productError;

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("size_label", { ascending: true });
  if (variantsError) throw variantsError;

  const { data: images, error: imagesError } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (imagesError) throw imagesError;

  return {
    product: product as Product,
    variants: (variants ?? []) as ProductVariant[],
    images: (images ?? []) as ProductImage[],
  };
}
