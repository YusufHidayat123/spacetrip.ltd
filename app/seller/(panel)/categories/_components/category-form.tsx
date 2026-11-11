"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/form/submit-button";
import { slugify } from "@/lib/catalog/slug";

export function CategoryForm({
  defaultValues,
  submitLabel,
  action,
}: {
  defaultValues?: { name: string; slug: string; is_active: boolean };
  submitLabel: string;
  action: (formData: FormData) => Promise<void>;
}) {
  const [name, setName] = React.useState(defaultValues?.name ?? "");
  const [slug, setSlug] = React.useState(defaultValues?.slug ?? "");
  const [isActive, setIsActive] = React.useState(defaultValues?.is_active ?? true);
  const [slugTouched, setSlugTouched] = React.useState(false);

  function onNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  return (
    <form className="grid gap-5" action={action}>
      <div className="grid gap-1.5">
        <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
          Nama Kategori
        </label>
        <Input
          name="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Outerwear & Jaket"
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
          placeholder="jaket-outerwear"
          required
          className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
        />
        <p className="text-xs text-(--st-text-muted)">
          Gunakan huruf kecil, angka, dan tanda hubung.
        </p>
      </div>

      <label className="flex items-center gap-2.5 text-xs font-medium text-(--st-text)">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          className="h-4 w-4 accent-[#FF5500]"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        Aktifkan kategori di Storefront
      </label>

      <div className="flex items-center justify-end border-t border-(--st-border) pt-4">
        <SubmitButton
          pendingText="Menyimpan..."
          className="h-11 rounded-full bg-[#0D0D0D] px-6 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
        >
          {submitLabel}
        </SubmitButton>
      </div>
    </form>
  );
}
