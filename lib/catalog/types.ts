export type Category = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductStatus = "draft" | "active";

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string; // numeric comes back as string in supabase-js
  status: ProductStatus;
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
