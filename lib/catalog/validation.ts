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

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  category_id: z.string().uuid(),
  description: z.string().max(4000).optional().nullable(),
  price: z.number().min(0),
  status: z.enum(["draft", "active"]).default("draft"),
  variants: z.array(productVariantInputSchema).min(1),
});

export const productUpdateSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  category_id: z.string().uuid(),
  description: z.string().max(4000).optional().nullable(),
  price: z.number().min(0),
  status: z.enum(["draft", "active"]),
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
