import "server-only";

import { createSupabasePublicClient } from "@/lib/supabase/public";
import type {
  Category,
  EditorialLook,
  Product,
  ProductGender,
  ProductImage,
  ProductVariant,
} from "./types";

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

export type EditorialLookWithProducts = EditorialLook & {
  products: PublicProductListItem[];
};

export type CategoryWithCount = Category & {
  productCount: number;
  previewImagePath: string | null;
  previewTitle: string | null;
  previewSlug: string | null;
  previewPrice: string | null;
};

const PRODUCT_SELECT =
  "id,category_id,name,slug,description,price,status,gender,condition,color,material,original_price,style_tags,measurements,is_featured,badge,created_at,updated_at,categories(id,name,slug),product_images(id,product_id,storage_path,alt,sort_order,created_at),product_variants(id,product_id,size_label,stock,sku,is_active,created_at,updated_at)";

export function getPublicProductImageUrl(storagePath: string) {
  if (!storagePath) return "";
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) {
    return storagePath;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const bucket = process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");

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

export async function publicListCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const supabase = createSupabasePublicClient();
  const [{ data: categoriesData, error: catErr }, { data: productsData, error: prodErr }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id,name,slug,is_active,created_at,updated_at")
        .eq("is_active", true)
        .order("name", { ascending: true }),
      supabase
        .from("products")
        .select("id,category_id,name,slug,price,is_featured,created_at,product_images(storage_path,sort_order)")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

  if (catErr) throw catErr;
  if (prodErr) throw prodErr;

  type LiteProduct = {
    id: string;
    category_id: string;
    name: string;
    slug: string;
    price: string;
    is_featured: boolean | null;
    product_images: { storage_path: string; sort_order: number }[] | null;
  };

  const countMap = new Map<string, number>();
  const previewMap = new Map<
    string,
    { imagePath: string | null; title: string; slug: string; price: string }
  >();

  for (const prod of (productsData ?? []) as unknown as LiteProduct[]) {
    countMap.set(prod.category_id, (countMap.get(prod.category_id) ?? 0) + 1);
    const existing = previewMap.get(prod.category_id);
    const sortedImgs = (prod.product_images ?? [])
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const firstPath = sortedImgs[0]?.storage_path ?? null;

    if (!existing || (!existing.imagePath && firstPath)) {
      previewMap.set(prod.category_id, {
        imagePath: firstPath,
        title: prod.name,
        slug: prod.slug,
        price: prod.price,
      });
    }
  }

  return ((categoriesData ?? []) as Category[]).map((cat) => {
    const preview = previewMap.get(cat.id) ?? null;
    return {
      ...cat,
      productCount: countMap.get(cat.id) ?? 0,
      previewImagePath: preview?.imagePath ?? null,
      previewTitle: preview?.title ?? null,
      previewSlug: preview?.slug ?? null,
      previewPrice: preview?.price ?? null,
    };
  });
}

export async function publicListActiveProducts(params?: {
  q?: string;
  categorySlug?: string;
  gender?: ProductGender | string;
  style?: string;
  condition?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  featuredOnly?: boolean;
  sort?: "newest" | "price_asc" | "price_desc" | "featured";
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
      return [] as PublicProductListItem[];
    }
    categoryId = (cat as { id: string }).id;
  }

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active");

  if (categoryId) query = query.eq("category_id", categoryId);
  if (params?.gender && ["men", "women", "unisex", "accessories"].includes(params.gender)) {
    query = query.eq("gender", params.gender);
  }
  if (params?.style && params.style.trim().length > 0) {
    query = query.contains("style_tags", [params.style.trim()]);
  }
  if (params?.condition && params.condition.trim().length > 0) {
    query = query.eq("condition", params.condition.trim());
  }
  if (typeof params?.minPrice === "number" && Number.isFinite(params.minPrice)) {
    query = query.gte("price", params.minPrice);
  }
  if (typeof params?.maxPrice === "number" && Number.isFinite(params.maxPrice)) {
    query = query.lte("price", params.maxPrice);
  }
  if (params?.featuredOnly) {
    query = query.eq("is_featured", true);
  }
  if (params?.q && params.q.trim().length > 0) {
    const term = params.q.trim().replace(/[,%()]/g, " ");
    if (term.length > 0) {
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%,color.ilike.%${term}%`);
    }
  }

  // Sorting
  if (params?.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (params?.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else if (params?.sort === "featured") {
    query = query
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const limitVal =
    typeof params?.limit === "number" && Number.isFinite(params.limit)
      ? Math.max(1, Math.min(params.limit, 100))
      : undefined;

  if (limitVal && !params?.size) {
    query = query.limit(limitVal);
  }

  const { data, error } = await query;
  if (error) throw error;

  let items = (data ?? []) as unknown as PublicProductListItem[];

  if (params?.size && params.size.trim().length > 0) {
    const targetSize = params.size.trim().toLowerCase();
    items = items.filter((item) =>
      (item.product_variants ?? []).some(
        (v) => v.is_active && v.stock > 0 && v.size_label.toLowerCase() === targetSize
      )
    );
  }

  if (limitVal) {
    items = items.slice(0, limitVal);
  }

  return items;
}

export async function publicGetActiveProductBySlug(slug: string) {
  const supabase = createSupabasePublicClient();

  const { data: product, error: productErr } = await supabase
    .from("products")
    .select(
      "id,category_id,name,slug,description,price,status,gender,condition,color,material,original_price,style_tags,measurements,is_featured,badge,created_at,updated_at,categories(id,name,slug)"
    )
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
    categories: Pick<Category, "id" | "name" | "slug"> | null;
  };

  return {
    ...p,
    category: p.categories ?? null,
    images: (images ?? []) as ProductImage[],
    variants: (variants ?? []) as ProductVariant[],
  } satisfies PublicProductDetail;
}

export async function publicListRelatedProducts(
  productId: string,
  categoryId: string,
  limit = 4
) {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("category_id", categoryId)
    .neq("id", productId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as PublicProductListItem[];
}

export async function publicListEditorialLooks(): Promise<EditorialLookWithProducts[]> {
  const supabase = createSupabasePublicClient();
  const { data: looks, error } = await supabase
    .from("editorial_looks")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !looks || looks.length === 0) {
    return [];
  }

  const allProductIds = Array.from(
    new Set(looks.flatMap((l) => (Array.isArray(l.product_ids) ? l.product_ids : [])))
  );

  const productMap = new Map<string, PublicProductListItem>();
  if (allProductIds.length > 0) {
    const { data: products } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .in("id", allProductIds)
      .eq("status", "active");

    if (products) {
      for (const p of products as unknown as PublicProductListItem[]) {
        productMap.set(p.id, p);
      }
    }
  }

  return (looks as EditorialLook[]).map((look) => ({
    ...look,
    products: (look.product_ids ?? [])
      .map((id) => productMap.get(id))
      .filter((x): x is PublicProductListItem => Boolean(x)),
  }));
}
