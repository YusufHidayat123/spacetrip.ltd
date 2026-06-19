"use client";

import Image from "next/image";
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

type VariantRow = { size_label: string; stock: number | "" };

type ImagePreview = {
  url: string;
  name: string;
  size: number;
};

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

  const [categoryId, setCategoryId] = React.useState<string>(
    categories[0]?.id ?? ""
  );
  const [status, setStatus] = React.useState<"draft" | "active">("draft");

  const [variants, setVariants] = React.useState<VariantRow[]>([
    { size_label: "S", stock: 0 },
    { size_label: "M", stock: 0 },
    { size_label: "L", stock: 0 },
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
      // cleanup object URLs
      for (const p of imagePreviews) URL.revokeObjectURL(p.url);
    };
  }, [imagePreviews]);

  const MAX_ACTION_BODY_MB = 20;
  const SAFE_CLIENT_MB = 18;

  function onImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);

    // Only the first 5 will be uploaded; warn early to avoid accidental huge submits.
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
        `Total gambar ~${totalMb.toFixed(1)} MB. Ini bisa melewati batas upload Server Action (${MAX_ACTION_BODY_MB} MB). Pilih file yang lebih kecil.`
      );
    } else {
      setImageSizeError(null);
    }

    // revoke old URLs
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

  function updateVariant(idx: number, patch: Partial<VariantRow>) {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, ...patch } : v))
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, { size_label: "", stock: "" }]);
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <form action={action} className="grid gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-(--st-text)">
            Nama produk
          </label>
          <Input
            name="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Spacetrip Basic Tee 180gsm"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-(--st-text)">
            Slug
          </label>
          <Input
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            placeholder="spacetrip-basic-tee-180gsm"
            required
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-(--st-text)">
            Kategori
          </label>
          <input type="hidden" name="category_id" value={categoryId} />
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categories.length === 0 ? (
            <p className="text-xs text-(--st-text-muted)">
              Buat kategori dulu.
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-(--st-text)">
            Status
          </label>
          <input type="hidden" name="status" value={status} />
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as "draft" | "active")}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="draft" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-(--st-text)">
            Harga (IDR)
          </label>
          <Input
            name="price"
            type="number"
            inputMode="numeric"
            min={0}
            step={1000}
            placeholder="149000"
            required
          />
          <p className="text-xs text-(--st-text-muted)">
            Simpan sebagai angka biasa, tanpa titik/koma pemisah.
          </p>
        </div>

        <div className="grid gap-2 md:col-span-2">
          <label className="text-sm font-medium text-(--st-text)">
            Deskripsi
          </label>
          <Textarea
            name="description"
            placeholder="Bahan, fit, kondisi, dan catatan perawatan..."
          />
        </div>
      </div>

      <div className="rounded-lg border border-(--st-border) p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-(--st-text)">
              Ukuran & stok
            </div>
            <div className="mt-1 text-xs text-(--st-text-muted)">
              Label ukuran bebas (S/M/L, 42, One Size). Stok dihitung per ukuran.
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="h-4 w-4" />
            Tambah ukuran
          </Button>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="grid grid-cols-[1fr_140px_44px] gap-2 text-xs font-medium text-(--st-text-muted)">
            <div className="px-1">Ukuran</div>
            <div className="px-1">Stok</div>
            <div />
          </div>

          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_140px_44px] gap-2">
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
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(idx)}
                aria-label="Hapus ukuran"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-(--st-border) p-4">
        <div className="text-sm font-semibold text-(--st-text)">
          Gambar
        </div>
        <div className="mt-1 text-xs text-(--st-text-muted)">
          Upload maksimal 5 gambar. Rekomendasi: WebP/JPG dengan framing mendekati persegi.
        </div>
        {imageWarning ? (
          <div className="mt-2 text-xs text-[#B45309]">{imageWarning}</div>
        ) : null}
        {imageSizeError ? (
          <div className="mt-2 text-xs text-[#B91C1C]">{imageSizeError}</div>
        ) : null}

        <div className="mt-4">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-(--st-border) bg-[#F7F8FA] px-4 py-6 text-sm font-medium text-(--st-text) hover:bg-[#F7F8FA]/70">
            <Upload className="h-4 w-4" />
            Pilih file
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
                className="overflow-hidden rounded-md border border-(--st-border) bg-white"
              >
                <div className="relative aspect-square w-full bg-[#F7F8FA]">
                  <Image
                    src={p.url}
                    alt={p.name}
                    fill
                    sizes="160px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-2">
                  <div className="truncate text-xs font-medium text-(--st-text)">
                    {p.name}
                  </div>
                  <div className="mt-0.5 text-[11px] text-(--st-text-muted)">
                    {formatBytes(p.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-xs text-(--st-text-muted)">
            Belum ada gambar dipilih.
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <SubmitButton
          pendingText="Membuat..."
          disabled={categories.length === 0 || Boolean(imageSizeError)}
        >
          Buat produk
        </SubmitButton>
      </div>
    </form>
  );
}
