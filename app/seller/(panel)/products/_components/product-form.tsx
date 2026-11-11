"use client";

import * as React from "react";
import { Plus, Trash2, Upload } from "lucide-react";

import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/catalog/slug";

export type CategoryOption = { id: string; name: string };

type VariantRow = { size_label: string; stock: number | "" };
type ImagePreview = { url: string; name: string; size: number };

export function ProductForm({
  categories,
  action,
}: {
  categories: CategoryOption[];
  action: (formData: FormData) => Promise<void>;
}) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);

  const [variants, setVariants] = React.useState<VariantRow[]>([
    { size_label: "M", stock: 1 },
    { size_label: "L", stock: 1 },
    { size_label: "XL", stock: 1 },
  ]);

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
        `Total gambar ~${totalMb.toFixed(1)} MB. Maks batas upload ${MAX_ACTION_BODY_MB} MB.`
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

  function updateVariant(idx: number, patch: Partial<VariantRow>) {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  }

  function addVariant() {
    setVariants((prev) => [...prev, { size_label: "", stock: 1 }]);
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  const selectCls =
    "h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-sm text-(--st-text) focus:border-[#0D0D0D] focus:outline-none";

  return (
    <form action={action} className="grid gap-8">
      {/* Core Identity */}
      <div>
        <div className="border-b border-(--st-border) pb-3 font-display text-base font-medium tracking-tight text-[#0D0D0D]">
          [01] Informasi Utama Produk
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
              placeholder="Contoh: Orbit Washed Boxy Tee 240gsm"
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
              placeholder="orbit-washed-boxy-tee"
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
              defaultValue={categories[0]?.id ?? ""}
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
            <select name="gender" defaultValue="unisex" className={selectCls}>
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
              placeholder="165000"
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
              placeholder="240000"
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Status Publikasi
            </label>
            <select name="status" defaultValue="active" className={selectCls}>
              <option value="active">Aktif (Tayang di Storefront)</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Badge / Label (Opsional)
            </label>
            <Input
              name="badge"
              placeholder="NEW / LIMITED / RARE ARCHIVE"
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5 md:col-span-2">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Deskripsi Editorial
            </label>
            <Textarea
              name="description"
              placeholder="Detail fit, karakter bahan, sejarah thrift, atau catatan kurasi..."
              className="rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>
        </div>
      </div>

      {/* Curated Streetwear Attributes */}
      <div>
        <div className="border-b border-(--st-border) pb-3 font-display text-base font-medium tracking-tight text-[#0D0D0D]">
          [02] Detail Kurasi &amp; Spesifikasi
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Kondisi Item
            </label>
            <select name="condition" defaultValue="Like New" className={selectCls}>
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
              placeholder="Washed Charcoal / Olive Drab"
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Material / Kain
            </label>
            <Input
              name="material"
              placeholder="100% Heavyweight Cotton 240gsm"
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Detail Pengukuran
            </label>
            <Input
              name="measurements"
              placeholder="Chest 116cm · Length 71cm"
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5 md:col-span-2">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Style Tags (Pisahkan dengan koma)
            </label>
            <Input
              name="style_tags"
              placeholder="y2k-streetwear, minimal-daily, vintage-workwear, japanese-street"
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <label className="flex items-center gap-2.5 text-xs font-medium text-(--st-text) md:col-span-2">
            <input
              type="checkbox"
              name="is_featured"
              className="h-4 w-4 accent-[#FF5500]"
            />
            Jadikan Editor&apos;s Pick (tampil menonjol di homepage &amp; featured)
          </label>
        </div>
      </div>

      {/* Size & Stock Variants */}
      <div className="rounded-2xl border border-(--st-border) bg-(--st-bg) p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-base font-medium tracking-tight text-[#0D0D0D]">
              Ukuran &amp; Stok
            </div>
            <div className="mt-0.5 text-xs text-(--st-text-muted)">
              Setiap ukuran memiliki stok terpisah yang otomatis berkurang saat checkout.
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            className="rounded-full border-[#0D0D0D] bg-white hover:bg-[#0D0D0D] hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Tambah Ukuran
          </Button>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="grid grid-cols-[1fr_110px_42px] gap-2 font-mono-label text-[10px] font-semibold uppercase text-(--st-text-muted)">
            <div className="px-1">Ukuran</div>
            <div className="px-1">Stok</div>
            <div />
          </div>

          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_110px_42px] gap-2">
              <Input
                name="variant_size_label"
                value={v.size_label}
                onChange={(e) => updateVariant(idx, { size_label: e.target.value })}
                placeholder="M / L / 32 / One Size"
                required
                className="h-10 rounded-xl border-(--st-border) bg-white"
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
                placeholder="1"
                required
                className="h-10 rounded-xl border-(--st-border) bg-white"
              />
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
      </div>

      {/* Product Imagery */}
      <div className="rounded-2xl border border-(--st-border) bg-white p-5">
        <div className="font-display text-base font-medium tracking-tight text-[#0D0D0D]">
          Foto Produk
        </div>
        <div className="mt-0.5 text-xs text-(--st-text-muted)">
          Upload hingga 5 gambar JPG/PNG/WebP beresolusi tinggi.
        </div>

        {imageWarning ? <div className="mt-2 text-xs text-amber-700">{imageWarning}</div> : null}
        {imageSizeError ? <div className="mt-2 text-xs text-red-700">{imageSizeError}</div> : null}

        <div className="mt-4">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0D0D0D]/30 bg-(--st-bg) px-4 py-7 font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]">
            <Upload className="h-4 w-4" />
            Pilih File Foto
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
                className="overflow-hidden rounded-2xl border border-(--st-border) bg-white"
              >
                <div className="relative aspect-[3/4] w-full bg-(--st-surface-alt)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-2.5">
                  <div className="truncate text-xs font-medium text-(--st-text)">{p.name}</div>
                  <div className="mt-0.5 text-[11px] text-(--st-text-muted)">
                    {formatBytes(p.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-(--st-border) pt-5">
        <SubmitButton
          pendingText="Menyimpan produk..."
          disabled={categories.length === 0 || Boolean(imageSizeError)}
          className="h-12 rounded-full bg-[#0D0D0D] px-8 font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
        >
          Terbitkan Produk
        </SubmitButton>
      </div>
    </form>
  );
}
