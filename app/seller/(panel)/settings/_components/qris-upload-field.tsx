"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

type Preview = { url: string; name: string; size: number };

export function QrisUploadField({
  name,
  currentUrl,
}: {
  name: string;
  currentUrl: string | null;
}) {
  const [preview, setPreview] = React.useState<Preview | null>(null);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }

    if (preview) URL.revokeObjectURL(preview.url);

    setPreview({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    });
  }

  const displayUrl = preview?.url ?? currentUrl;

  return (
    <div className="grid gap-3">
      <Input
        name={name}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="h-11 rounded-xl border-(--st-border) bg-(--st-bg) pt-2 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-[#0D0D0D] file:px-3.5 file:py-1 file:font-mono-label file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.08em] file:text-white hover:file:bg-[#FF5500]"
      />

      {displayUrl ? (
        <div className="max-w-xs rounded-2xl border border-(--st-border) bg-white p-3.5">
          <div className="relative aspect-square overflow-hidden rounded-xl bg-(--st-bg)">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt={preview?.name ?? "QRIS"}
              className="h-full w-full object-contain"
            />
          </div>
          {preview ? (
            <div className="mt-2 truncate font-mono-label text-[10px] uppercase tracking-[0.08em] text-[#FF5500]">
              Pratinjau: {preview.name}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-(--st-border) bg-(--st-bg) p-5 text-xs text-(--st-text-muted)">
          Belum ada gambar QRIS diunggah.
        </div>
      )}
    </div>
  );
}
