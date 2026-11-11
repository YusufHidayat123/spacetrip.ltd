export type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductStatus = "draft" | "active";
export type ProductGender = "men" | "women" | "unisex" | "accessories";

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string; // numeric comes back as string in supabase-js
  status: ProductStatus;
  gender: ProductGender | null;
  condition: string | null;
  color: string | null;
  material: string | null;
  original_price: string | null;
  style_tags: string[] | null;
  measurements: string | null;
  is_featured: boolean | null;
  badge: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size_label: string;
  stock: number;
  sku: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  alt: string | null;
  sort_order: number;
  created_at: string;
};

export type EditorialLook = {
  id: string;
  title: string;
  subtitle: string | null;
  model_name: string | null;
  location: string | null;
  image_path: string;
  product_ids: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type QuickViewProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price: string;
  original_price?: string | null;
  condition?: string | null;
  color?: string | null;
  material?: string | null;
  measurements?: string | null;
  style_tags?: string[] | null;
  badge?: string | null;
  categoryName?: string | null;
  images: Array<{ storage_path: string; alt?: string | null }>;
  variants: Array<{
    id: string;
    size_label: string;
    stock: number;
    is_active?: boolean;
  }>;
};
