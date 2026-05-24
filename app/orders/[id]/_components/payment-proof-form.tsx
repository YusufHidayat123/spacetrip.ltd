"use client";

import Image from "next/image";
import * as React from "react";

import { Upload } from "lucide-react";

import { SubmitButton } from "@/components/form/submit-button";
import { Input } from "@/components/ui/input";

type Preview = { url: string; name: string; size: number };

export function PaymentProofForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const [preview, setPreview] = React.useState<Preview | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  const MAX_MB = 18;

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      setError(null);
      return;
    }

    if (preview) URL.revokeObjectURL(preview.url);

    const mb = file.size / (1024 * 1024);
    if (mb > MAX_MB) {
      setError(
        `File ~${mb.toFixed(1)} MB. Pilih gambar yang lebih kecil (maks ~${MAX_MB} MB).`
      );
    } else {
      setError(null);
    }

    setPreview({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    });
  }

  let helper: React.ReactNode = (
    <div className="text-xs text-(--st-text-muted)">
      Upload screenshot dari aplikasi e-wallet / mobile banking kamu.
    </div>
  );

  if (error) {
    helper = <div className="text-xs text-[#B91C1C]">{error}</div>;
  } else if (preview) {
    helper = (
      <div className="text-xs text-(--st-text-muted)">
        Terpilih: <span className="font-medium text-(--st-text)">{preview.name}</span>{" "}
        ({formatBytes(preview.size)})
      </div>
    );
  }

  return (
    <form action={action} encType="multipart/form-data" className="grid gap-3">
      <label className="text-sm font-medium text-(--st-text)">
        Upload bukti bayar
      </label>

      <div className="grid gap-3">
        <div className="grid gap-2">
          <Input name="proof" type="file" accept="image/*" required onChange={onChange} />
          {helper}
        </div>

          <SubmitButton
            pendingText="Mengunggah..."
            disabled={Boolean(error)}
            className="h-11 w-full rounded-full"
          >
            <Upload className="h-4 w-4" />
            Kirim bukti
          </SubmitButton>
      </div>

      {preview ? (
        <div className="mt-1 overflow-hidden rounded-lg border border-(--st-border) bg-white">
          <div className="relative aspect-video bg-[#F7F8FA]">
            <Image
              src={preview.url}
              alt={preview.name}
              fill
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      ) : null}

      <p className="text-xs text-(--st-text-muted)">
        Verifikasi dilakukan manual. Order kamu akan diproses setelah pembayaran diverifikasi.
      </p>
    </form>
  );
}
