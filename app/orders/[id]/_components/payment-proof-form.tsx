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
      setError(
        `File is ~${mb.toFixed(1)} MB. Please select a smaller image (max ~${MAX_MB} MB).`
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

  return (
    <form action={action} className="grid gap-3">
      <label className="text-sm font-medium text-[color:var(--st-text)]">
        Upload payment proof
      </label>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="grid gap-2">
          <Input name="proof" type="file" accept="image/*" required onChange={onChange} />
          {error ? (
            <div className="text-xs text-[#B91C1C]">{error}</div>
          ) : preview ? (
            <div className="text-xs text-[color:var(--st-text-muted)]">
              Selected: <span className="font-medium text-[color:var(--st-text)]">{preview.name}</span> ({formatBytes(preview.size)})
            </div>
          ) : (
            <div className="text-xs text-[color:var(--st-text-muted)]">
              Please upload a screenshot from your banking/e-wallet app.
            </div>
          )}
        </div>

        <SubmitButton
          pendingText="Uploading..."
          disabled={Boolean(error)}
          className="h-10"
        >
          <Upload className="h-4 w-4" />
          Submit proof
        </SubmitButton>
      </div>

      {preview ? (
        <div className="mt-1 overflow-hidden rounded-lg border border-[color:var(--st-border)] bg-white">
          <div className="aspect-video bg-[#F7F8FA]">
            <img src={preview.url} alt={preview.name} className="h-full w-full object-contain" />
          </div>
        </div>
      ) : null}

      <p className="text-xs text-[color:var(--st-text-muted)]">
        Verification is manual. Your order will be processed after payment is verified.
      </p>
    </form>
  );
}
