"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/form/submit-button";
import { slugify } from "@/lib/catalog/slug";
import { cn } from "@/lib/utils";

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
  const [isActive, setIsActive] = React.useState(
    defaultValues?.is_active ?? true
  );
  const [slugTouched, setSlugTouched] = React.useState(false);

  function onNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  // If the user never touches the checkbox, browsers only submit it when checked.
  // We rely on that behavior; server action treats missing = false.

  return (
    <form className="grid gap-4" action={action}>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-(--st-text)">
          Name
        </label>
        <Input
          name="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="T-Shirts"
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
          placeholder="t-shirts"
          required
        />
        <p className="text-xs text-(--st-text-muted)">
          Used for URLs. Letters, numbers, and hyphens only.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border border-(--st-border)",
            "accent-(--st-primary)"
          )}
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
        />
        <label
          htmlFor="is_active"
          className="text-sm text-(--st-text)"
        >
          Active
        </label>
      </div>

      <div className="flex items-center justify-end gap-2">
        <SubmitButton pendingText="Saving...">{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
