"use client";

import * as React from "react";
import Image from "next/image";

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
      <Input name={name} type="file" accept="image/*" onChange={onChange} />

      {displayUrl ? (
        <div className="overflow-hidden rounded-xl border border-(--st-border) bg-white">
          <div className="relative aspect-square bg-[#F7F8FA]">
            <Image
              src={displayUrl}
              alt={preview?.name ?? "QRIS"}
              fill
              sizes="240px"
              className="object-contain"
              unoptimized={Boolean(preview)}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-(--st-border) bg-[#F7F8FA] p-4 text-sm text-(--st-text-muted)">
          Belum ada gambar QRIS.
        </div>
      )}

      <div className="text-[11px] text-(--st-text-muted)">
        Upload QRIS terbaru. Tips: gunakan gambar persegi agar tampil rapi.
      </div>
    </div>
  );
}
