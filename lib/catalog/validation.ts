import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(80),
  is_active: z.boolean().default(true),
});

export const productVariantInputSchema = z.object({
  size_label: z.string().min(1).max(20),
  stock: z.number().int().min(0),
});

export const genderEnum = z.enum(["men", "women", "unisex", "accessories"]);

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  category_id: z.string().uuid(),
  description: z.string().max(4000).optional().nullable(),
  price: z.number().min(0),
  status: z.enum(["draft", "active"]).default("draft"),
  gender: genderEnum.default("unisex"),
  condition: z.string().max(60).optional().nullable(),
  color: z.string().max(80).optional().nullable(),
  material: z.string().max(160).optional().nullable(),
  original_price: z.number().min(0).optional().nullable(),
  style_tags: z.array(z.string()).default([]),
  measurements: z.string().max(300).optional().nullable(),
  badge: z.string().max(40).optional().nullable(),
  is_featured: z.boolean().default(false),
  variants: z.array(productVariantInputSchema).min(1),
});

export const productUpdateSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  category_id: z.string().uuid(),
  description: z.string().max(4000).optional().nullable(),
  price: z.number().min(0),
  status: z.enum(["draft", "active"]),
  gender: genderEnum.default("unisex"),
  condition: z.string().max(60).optional().nullable(),
  color: z.string().max(80).optional().nullable(),
  material: z.string().max(160).optional().nullable(),
  original_price: z.number().min(0).optional().nullable(),
  style_tags: z.array(z.string()).default([]),
  measurements: z.string().max(300).optional().nullable(),
  badge: z.string().max(40).optional().nullable(),
  is_featured: z.boolean().default(false),
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        size_label: z.string().min(1).max(20),
        stock: z.number().int().min(0),
        is_active: z.boolean().default(true),
      })
    )
    .min(1),
  removed_variant_ids: z.array(z.string().uuid()).default([]),
  removed_image_ids: z.array(z.string().uuid()).default([]),
});
