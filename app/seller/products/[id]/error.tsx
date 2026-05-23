"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export default function ProductDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-[720px] px-6 py-10">
      <div className="rounded-xl border border-[color:var(--st-border)] bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <div className="text-sm font-semibold text-[color:var(--st-text)]">
          Could not load or update product
        </div>
        <p className="mt-2 text-sm text-[color:var(--st-text-muted)]">
          {error.message.includes("Body exceeded")
            ? "Upload size is too large for the current limit. Please select smaller images and try again."
            : error.message}
        </p>
        <div className="mt-5 flex items-center gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/seller/products";
            }}
          >
            Back to Catalog
          </Button>
        </div>
      </div>
    </div>
  );
}
