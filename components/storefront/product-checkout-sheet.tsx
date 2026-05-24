"use client";

import * as React from "react";

import Link from "next/link";

import { BottomSheet } from "@/components/storefront/bottom-sheet";
import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  size_label: string;
  stock: number;
};

export function ProductCheckoutSheet({
  slug,
  productName,
  loggedIn,
  profileComplete,
  variants,
  defaultVariantId,
  action,
}: {
  slug: string;
  productName: string;
  loggedIn: boolean;
  profileComplete: boolean;
  variants: Variant[];
  defaultVariantId: string;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);

  const hasAnyStock = variants.some((v) => v.stock > 0);

  const loginHref = `/profile?next=/products/${encodeURIComponent(slug)}&intent=checkout`;
  const setupHref = `/profile/setup?next=/products/${encodeURIComponent(slug)}&intent=checkout`;

  const sizeHelp = !hasAnyStock
    ? "Stok sedang habis. Kamu tetap bisa lihat produk lain dulu."
    : "Pilih ukuran yang tersedia, lalu tentukan jumlah.";

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2 pb-2">
        <Button asChild variant="outline" className="h-11 rounded-full bg-white">
          <Link href="/products">Kembali</Link>
        </Button>

        {loggedIn ? (
          profileComplete ? (
            <Button
              type="button"
              className="h-11 rounded-full"
              onClick={() => setOpen(true)}
              disabled={!hasAnyStock}
            >
              Pesan
            </Button>
          ) : (
            <Button asChild className="h-11 rounded-full">
              <Link href={setupHref}>Lengkapi profil</Link>
            </Button>
          )
        ) : (
          <Button asChild className="h-11 rounded-full">
            <Link href={loginHref}>Masuk untuk pesan</Link>
          </Button>
        )}
      </div>

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Pesan"
        className="border-b-0"
      >
        <div className="text-sm font-semibold tracking-tight text-(--st-text)">
          {productName}
        </div>
        <div className="mt-1 text-xs text-(--st-text-muted)">{sizeHelp}</div>

        <form action={action} className="mt-5 grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-(--st-text)">Ukuran</label>
            <select
              name="variant_id"
              defaultValue={defaultVariantId}
              required
              className={cn(
                "h-11 w-full rounded-full border border-(--st-border) bg-white px-3 text-sm text-(--st-text)",
                "focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
              )}
            >
              {variants.length === 0 ? (
                <option value="" disabled>
                  Ukuran belum tersedia
                </option>
              ) : (
                variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                    {v.size_label} {v.stock <= 0 ? "(habis)" : `(stok: ${v.stock})`}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-(--st-text)">Jumlah</label>
            <Input name="quantity" type="number" min={1} defaultValue={1} />
          </div>

          <div className="rounded-2xl border border-(--st-border) bg-[#F7F8FA] p-4 text-xs text-(--st-text-muted)">
            Alamat pengiriman akan otomatis diambil dari profil kamu.
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full bg-white"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <SubmitButton pendingText="Membuat pesanan..." className="h-11 rounded-full">
              Konfirmasi
            </SubmitButton>
          </div>

          <div className="text-center text-[11px] text-(--st-text-muted)">
            Setelah konfirmasi, kamu akan diarahkan ke halaman pembayaran.
          </div>
        </form>
      </BottomSheet>
    </>
  );
}
