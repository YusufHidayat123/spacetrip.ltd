"use client";

import * as React from "react";

import { Plus, Trash2, Upload } from "lucide-react";

import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { slugify } from "@/lib/catalog/slug";

export type CategoryOption = { id: string; name: string };

type VariantRow = {
  id?: string;
  size_label: string;
  stock: number | "";
  is_active: boolean;
};

type ExistingImage = {
  id: string;
  url: string;
  storage_path: string;
  sort_order: number;
};

type ImagePreview = {
  url: string;
  name: string;
  size: number;
};

export function ProductEditForm({
  categories,
  action,
  defaultValues,
}: {
  categories: CategoryOption[];
  action: (formData: FormData) => Promise<void>;
  defaultValues: {
    product: {
      name: string;
      slug: string;
      category_id: string;
      price: string;
      status: "draft" | "active";
      description: string | null;
    };
    variants: { id: string; size_label: string; stock: number; is_active: boolean }[];
    images: ExistingImage[];
  };
}) {
  const [name, setName] = React.useState(defaultValues.product.name);
  const [slug, setSlug] = React.useState(defaultValues.product.slug);
  const [slugTouched, setSlugTouched] = React.useState(false);

  const [categoryId, setCategoryId] = React.useState<string>(
    defaultValues.product.category_id
  );
  const [status, setStatus] = React.useState<"draft" | "active">(
    defaultValues.product.status
  );

  const [variants, setVariants] = React.useState<VariantRow[]>(
    defaultValues.variants.map((v) => ({
      id: v.id,
      size_label: v.size_label,
      stock: v.stock,
      is_active: v.is_active,
    }))
  );

  const [removedVariantIds, setRemovedVariantIds] = React.useState<string[]>([]);
  const [removedImageIds, setRemovedImageIds] = React.useState<string[]>([]);

  const [imagePreviews, setImagePreviews] = React.useState<ImagePreview[]>([]);
  const [imageWarning, setImageWarning] = React.useState<string | null>(null);
  const [imageSizeError, setImageSizeError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  React.useEffect(() => {
    return () => {
      for (const p of imagePreviews) URL.revokeObjectURL(p.url);
    };
  }, [imagePreviews]);

  function updateVariant(idx: number, patch: Partial<VariantRow>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, ...patch } : v))
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, { size_label: "", stock: "", is_active: true }]);
  }

  function removeVariant(idx: number) {
    setVariants((prev) => {
      const removed = prev[idx];
      if (removed?.id) {
        setRemovedVariantIds((ids) => [...ids, removed.id as string]);
      }
      return prev.filter((_, i) => i !== idx);
    });
  }

  function removeImage(imageId: string) {
    if (removedImageIds.includes(imageId)) return;
    setRemovedImageIds((ids) => [...ids, imageId]);
  }

  const MAX_ACTION_BODY_MB = 20;
  const SAFE_CLIENT_MB = 18;

  function onImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);

    if (files.length > 5) {
      setImageWarning(
        "You selected more than 5 images. Only the first 5 will be uploaded."
      );
    } else {
      setImageWarning(null);
    }

    const firstFive = files.slice(0, 5);

    const totalBytes = firstFive.reduce((sum, f) => sum + f.size, 0);
    const totalMb = totalBytes / (1024 * 1024);

    if (totalMb > SAFE_CLIENT_MB) {
      setImageSizeError(
        `Selected images are ~${totalMb.toFixed(1)} MB. This may exceed the Server Action upload limit (${MAX_ACTION_BODY_MB} MB). Please choose smaller files.`
      );
    } else {
      setImageSizeError(null);
    }

    setImagePreviews((prev) => {
      for (const p of prev) URL.revokeObjectURL(p.url);
      return firstFive.map((f) => ({
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size,
      }));
    });
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  const existingImagesVisible = defaultValues.images
    .filter((img) => !removedImageIds.includes(img.id))
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <form action={action} className="grid gap-6">
      {/* Hidden fields driven by client state */}
      <input type="hidden" name="category_id" value={categoryId} />
      <input type="hidden" name="status" value={status} />
      {removedVariantIds.map((id) => (
        <input key={id} type="hidden" name="removed_variant_id" value={id} />
      ))}
      {removedImageIds.map((id) => (
        <input key={id} type="hidden" name="removed_image_id" value={id} />
      ))}

      {/* Images at top */}
      <section className="rounded-xl border border-[color:var(--st-border)] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-[color:var(--st-text)]">
              Product images
            </div>
            <div className="mt-1 text-xs text-[color:var(--st-text-muted)]">
              Existing images are shown first. You can remove them and upload new ones.
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {existingImagesVisible.length === 0 ? (
            <div className="text-xs text-[color:var(--st-text-muted)]">
              No images uploaded yet.
            </div>
          ) : (
            existingImagesVisible.map((img) => (
              <div
                key={img.id}
                className="w-[140px] overflow-hidden rounded-lg border border-[color:var(--st-border)] bg-white"
              >
                <div className="aspect-square bg-[#F7F8FA]">
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <div className="truncate text-[11px] text-[color:var(--st-text-muted)]">
                    {img.sort_order === 0 ? "Primary" : `#${img.sort_order + 1}`}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => removeImage(img.id)}
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5">
          <div className="text-sm font-semibold text-[color:var(--st-text)]">
            Upload new images
          </div>
          <div className="mt-1 text-xs text-[color:var(--st-text-muted)]">
            Upload up to 5 images per update.
          </div>
          {imageWarning ? (
            <div className="mt-2 text-xs text-[#B45309]">{imageWarning}</div>
          ) : null}
          {imageSizeError ? (
            <div className="mt-2 text-xs text-[#B91C1C]">{imageSizeError}</div>
          ) : null}

          <div className="mt-3">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-[color:var(--st-border)] bg-[#F7F8FA] px-4 py-6 text-sm font-medium text-[color:var(--st-text)] hover:bg-[#F7F8FA]/70">
              <Upload className="h-4 w-4" />
              Choose files
              <input
                name="images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={onImagesChange}
              />
            </label>
          </div>

          {imagePreviews.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {imagePreviews.map((p) => (
                <div
                  key={p.url}
                  className="overflow-hidden rounded-md border border-[color:var(--st-border)] bg-white"
                >
                  <div className="aspect-square w-full bg-[#F7F8FA]">
                    <img
                      src={p.url}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-2">
                    <div className="truncate text-xs font-medium text-[color:var(--st-text)]">
                      {p.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[color:var(--st-text-muted)]">
                      {formatBytes(p.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Product fields */}
      <section className="rounded-xl border border-[color:var(--st-border)] bg-white p-6">
        <div className="text-sm font-semibold text-[color:var(--st-text)]">
          Product info
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-[color:var(--st-text)]">
              Product name
            </label>
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[color:var(--st-text)]">
              Slug
            </label>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[color:var(--st-text)]">
              Category
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[color:var(--st-text)]">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "draft" | "active")}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="draft" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-[color:var(--st-text)]">
              Price (IDR)
            </label>
            <Input
              name="price"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              defaultValue={Number(defaultValues.product.price)}
              required
            />
          </div>

          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-medium text-[color:var(--st-text)]">
              Description
            </label>
            <Textarea
              name="description"
              defaultValue={defaultValues.product.description ?? ""}
              placeholder="Material, fit, and care instructions..."
            />
          </div>
        </div>
      </section>

      {/* Variants */}
      <section className="rounded-xl border border-[color:var(--st-border)] bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[color:var(--st-text)]">
              Sizes & stock
            </div>
            <div className="mt-1 text-xs text-[color:var(--st-text-muted)]">
              Stock is per size.
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="h-4 w-4" />
            Add size
          </Button>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="grid grid-cols-[1fr_140px_120px_44px] gap-2 text-xs font-medium text-[color:var(--st-text-muted)]">
            <div className="px-1">Size</div>
            <div className="px-1">Stock</div>
            <div className="px-1">Active</div>
            <div />
          </div>

          {variants.map((v, idx) => (
            <div key={v.id ?? `new-${idx}`} className="grid grid-cols-[1fr_140px_120px_44px] gap-2">
              <input type="hidden" name="variant_id" value={v.id ?? ""} />
              <Input
                name="variant_size_label"
                value={v.size_label}
                onChange={(e) => updateVariant(idx, { size_label: e.target.value })}
                placeholder="M"
                required
              />
              <Input
                name="variant_stock"
                type="number"
                inputMode="numeric"
                min={0}
                value={v.stock}
                onChange={(e) =>
                  updateVariant(idx, {
                    stock: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
                placeholder="0"
                required
              />
              <div className="flex items-center gap-2 rounded-md border border-[color:var(--st-border)] bg-white px-3">
                <input
                  type="checkbox"
                  checked={v.is_active}
                  onChange={(e) => updateVariant(idx, { is_active: e.target.checked })}
                />
                <span className="text-sm text-[color:var(--st-text)]">Active</span>
                <input
                  type="hidden"
                  name="variant_is_active"
                  value={v.is_active ? "1" : "0"}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(idx)}
                aria-label="Remove size"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <SubmitButton pendingText="Saving..." disabled={Boolean(imageSizeError)}>
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}
