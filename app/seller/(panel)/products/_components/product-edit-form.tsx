"use client";

import * as React from "react";
import { Plus, Trash2, Upload } from "lucide-react";

import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/catalog/slug";
import type { ProductGender } from "@/lib/catalog/types";

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

type ImagePreview = { url: string; name: string; size: number };

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
      original_price: string | null;
      status: "draft" | "active";
      description: string | null;
      gender: ProductGender;
      condition: string;
      color: string | null;
      material: string | null;
      measurements: string | null;
      badge: string | null;
      style_tags: string[];
      is_featured: boolean;
    };
    variants: {
      id: string;
      size_label: string;
      stock: number;
      is_active: boolean;
    }[];
    images: ExistingImage[];
  };
}) {
  const [name, setName] = React.useState(defaultValues.product.name);
  const [slug, setSlug] = React.useState(defaultValues.product.slug);
  const [slugTouched, setSlugTouched] = React.useState(false);

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

  function onNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  React.useEffect(() => {
    return () => {
      for (const p of imagePreviews) URL.revokeObjectURL(p.url);
    };
  }, [imagePreviews]);

  function updateVariant(idx: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { size_label: "", stock: 1, is_active: true }]);
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
      setImageWarning("Kamu memilih lebih dari 5 gambar. Hanya 5 gambar pertama yang akan di-upload.");
    } else {
      setImageWarning(null);
    }

    const firstFive = files.slice(0, 5);
    const totalBytes = firstFive.reduce((sum, f) => sum + f.size, 0);
    const totalMb = totalBytes / (1024 * 1024);

    if (totalMb > SAFE_CLIENT_MB) {
      setImageSizeError(
        `Total gambar ~${totalMb.toFixed(1)} MB. Maks batas ${MAX_ACTION_BODY_MB} MB.`
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
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  const existingImagesVisible = defaultValues.images
    .filter((img) => !removedImageIds.includes(img.id))
    .sort((a, b) => a.sort_order - b.sort_order);

  const selectCls =
    "h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-sm text-(--st-text) focus:border-[#0D0D0D] focus:outline-none";

  return (
    <form action={action} className="grid gap-6">
      {removedVariantIds.map((id) => (
        <input key={id} type="hidden" name="removed_variant_id" value={id} />
      ))}
      {removedImageIds.map((id) => (
        <input key={id} type="hidden" name="removed_image_id" value={id} />
      ))}

      {/* Gallery */}
      <section className="rounded-3xl border border-(--st-border) bg-white p-6">
        <div className="border-b border-(--st-border) pb-3">
          <h2 className="font-display text-lg font-medium tracking-tight text-[#0D0D0D]">
            Galeri Produk
          </h2>
          <p className="mt-0.5 text-xs text-(--st-text-muted)">
            Kelola foto studio &amp; tambahan foto baru.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {existingImagesVisible.length === 0 ? (
            <div className="text-xs text-(--st-text-muted)">Belum ada gambar tersimpan.</div>
          ) : (
            existingImagesVisible.map((img) => (
              <div
                key={img.id}
                className="w-36 overflow-hidden rounded-2xl border border-(--st-border) bg-white"
              >
                <div className="relative aspect-[3/4] bg-(--st-surface-alt)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt="Gambar produk"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 p-2">
                  <div className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                    {img.sort_order === 0 ? "Utama" : `#${img.sort_order + 1}`}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 rounded-full hover:text-red-700"
                    onClick={() => removeImage(img.id)}
                    aria-label="Hapus gambar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5">
          {imageWarning ? <div className="mb-2 text-xs text-amber-700">{imageWarning}</div> : null}
          {imageSizeError ? (
            <div className="mb-2 text-xs text-red-700">{imageSizeError}</div>
          ) : null}

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0D0D0D]/30 bg-(--st-bg) px-4 py-5 font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]">
            <Upload className="h-4 w-4" />
            Upload Foto Tambahan
            <input
              name="images"
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={onImagesChange}
            />
          </label>

          {imagePreviews.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {imagePreviews.map((p) => (
                <div
                  key={p.url}
                  className="overflow-hidden rounded-2xl border border-(--st-border) bg-white"
                >
                  <div className="relative aspect-[3/4] w-full bg-(--st-surface-alt)">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-2.5">
                    <div className="truncate text-xs font-medium text-(--st-text)">{p.name}</div>
                    <div className="text-[11px] text-(--st-text-muted)">
                      {formatBytes(p.size)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Core Metadata */}
      <section className="rounded-3xl border border-(--st-border) bg-white p-6">
        <div className="border-b border-(--st-border) pb-3 font-display text-lg font-medium tracking-tight text-[#0D0D0D]">
          Informasi &amp; Harga Produk
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Nama Produk
            </label>
            <Input
              name="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              required
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Slug URL
            </label>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Kategori
            </label>
            <select
              name="category_id"
              defaultValue={defaultValues.product.category_id}
              required
              className={selectCls}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Departemen (Gender)
            </label>
            <select
              name="gender"
              defaultValue={defaultValues.product.gender}
              className={selectCls}
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Harga Jual (IDR)
            </label>
            <Input
              name="price"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              defaultValue={Number(defaultValues.product.price)}
              required
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Harga Coret / Retail (Opsional)
            </label>
            <Input
              name="original_price"
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              defaultValue={
                defaultValues.product.original_price
                  ? Number(defaultValues.product.original_price)
                  : ""
              }
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Status Publikasi
            </label>
            <select
              name="status"
              defaultValue={defaultValues.product.status}
              className={selectCls}
            >
              <option value="active">Aktif</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Badge (Opsional)
            </label>
            <Input
              name="badge"
              defaultValue={defaultValues.product.badge ?? ""}
              placeholder="NEW / LIMITED / CURATED"
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Kondisi Item
            </label>
            <select
              name="condition"
              defaultValue={defaultValues.product.condition}
              className={selectCls}
            >
              <option value="Like New">Like New</option>
              <option value="Excellent">Excellent</option>
              <option value="Very Good">Very Good</option>
              <option value="Good">Good</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Warna Utama
            </label>
            <Input
              name="color"
              defaultValue={defaultValues.product.color ?? ""}
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Material / Bahan
            </label>
            <Input
              name="material"
              defaultValue={defaultValues.product.material ?? ""}
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Pengukuran Detail
            </label>
            <Input
              name="measurements"
              defaultValue={defaultValues.product.measurements ?? ""}
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5 md:col-span-2">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Style Tags (pisahkan koma)
            </label>
            <Input
              name="style_tags"
              defaultValue={defaultValues.product.style_tags.join(", ")}
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5 md:col-span-2">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Deskripsi Produk
            </label>
            <Textarea
              name="description"
              defaultValue={defaultValues.product.description ?? ""}
              className="rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs font-medium text-(--st-text) md:col-span-2">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={defaultValues.product.is_featured}
              className="h-4 w-4 accent-[#FF5500]"
            />
            Jadikan Editor&apos;s Pick (tampil di koleksi unggulan)
          </label>
        </div>
      </section>

      {/* Variants */}
      <section className="rounded-3xl border border-(--st-border) bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--st-border) pb-3">
          <div>
            <div className="font-display text-lg font-medium tracking-tight text-[#0D0D0D]">
              Ukuran &amp; Stok
            </div>
            <div className="text-xs text-(--st-text-muted)">Stok dikelola per varian ukuran.</div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            className="rounded-full border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Tambah Ukuran
          </Button>
        </div>

        <div className="mt-4 grid gap-2 overflow-x-auto">
          <div className="grid min-w-[440px] grid-cols-[1fr_110px_96px_42px] gap-2 font-mono-label text-[10px] font-semibold uppercase text-(--st-text-muted)">
            <div className="px-1">Ukuran</div>
            <div className="px-1">Stok</div>
            <div className="px-1">Aktif</div>
            <div />
          </div>

          {variants.map((v, idx) => (
            <div
              key={v.id ?? `new-${idx}`}
              className="grid min-w-[440px] grid-cols-[1fr_110px_96px_42px] gap-2"
            >
              <input type="hidden" name="variant_id" value={v.id ?? ""} />
              <Input
                name="variant_size_label"
                value={v.size_label}
                onChange={(e) => updateVariant(idx, { size_label: e.target.value })}
                placeholder="M"
                required
                className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
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
                className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
              />
              <div className="flex items-center gap-2 rounded-xl border border-(--st-border) bg-(--st-bg) px-3">
                <input
                  type="checkbox"
                  checked={v.is_active}
                  onChange={(e) => updateVariant(idx, { is_active: e.target.checked })}
                  className="accent-[#FF5500]"
                />
                <span className="text-xs text-(--st-text)">Aktif</span>
                <input type="hidden" name="variant_is_active" value={v.is_active ? "1" : "0"} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(idx)}
                aria-label="Hapus ukuran"
                className="rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <SubmitButton
          pendingText="Menyimpan..."
          disabled={Boolean(imageSizeError)}
          className="h-12 rounded-full bg-[#0D0D0D] px-8 font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
        >
          Simpan Perubahan
        </SubmitButton>
      </div>
    </form>
  );
}
