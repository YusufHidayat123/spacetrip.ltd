"use client";

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
      setError(`File ~${mb.toFixed(1)} MB. Pilih gambar yang lebih kecil (maks ~${MAX_MB} MB).`);
    } else {
      setError(null);
    }

    setPreview({
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    });
  }

  return (
    <form action={action} encType="multipart/form-data" className="grid gap-3.5">
      <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0D0D0D]">
        [Upload Bukti Transfer QRIS]
      </label>

      <div className="grid gap-2">
        <Input
          name="proof"
          type="file"
          accept="image/*"
          required
          onChange={onChange}
          className="h-11 rounded-xl border-(--st-border) bg-(--st-bg) pt-2 text-xs file:mr-3 file:rounded-full file:border-0 file:bg-[#0D0D0D] file:px-3 file:py-1 file:font-mono-label file:text-[10px] file:uppercase file:text-white"
        />
        {error ? (
          <div className="text-xs text-red-700">{error}</div>
        ) : preview ? (
          <div className="text-xs text-(--st-text-muted)">
            Terpilih: <span className="font-medium text-[#0D0D0D]">{preview.name}</span> (
            {formatBytes(preview.size)})
          </div>
        ) : (
          <div className="text-xs text-(--st-text-muted)">
            Unggah tangkapan layar bukti berhasil dari mobile banking / e-wallet.
          </div>
        )}
      </div>

      {preview ? (
        <div className="rounded-2xl border border-(--st-border) bg-(--st-bg) p-2">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.url} alt={preview.name} className="h-full w-full object-contain" />
          </div>
        </div>
      ) : null}

      <SubmitButton
        pendingText="Mengunggah..."
        disabled={Boolean(error)}
        className="h-12 w-full rounded-full bg-[#0D0D0D] font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
      >
        <Upload className="h-4 w-4" />
        Kirim Bukti Pembayaran
      </SubmitButton>

      <p className="text-[11px] leading-relaxed text-(--st-text-muted)">
        Verifikasi dilakukan manual oleh admin. Pesanan akan langsung diproses setelah dana
        terkonfirmasi.
      </p>
    </form>
  );
}
