export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { getPublicProductImageUrl } from "@/lib/catalog/public";
import { CustomerAuthButtons } from "./_components/customer-auth-buttons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/products";
  const lookThumb = getPublicProductImageUrl("editorial/lookbook/look-03.jpg");

  return (
    <MobileShell hideBottomNav>
      <StoreHeader title="Masuk" backHref={`/profile?next=${encodeURIComponent(next)}`} />

      <main className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:py-16">
        <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-(--st-border) bg-white shadow-xs md:grid-cols-12">
          {/* Left Editorial Dark Panel */}
          <div className="flex flex-col justify-between bg-[#0D0D0D] p-8 text-white md:col-span-5 md:p-10">
            <div>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
                >
                  &#10035;
                </span>
                <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                  [Archive Access]
                </span>
              </div>

              <h1 className="mt-4 font-display text-3xl font-medium leading-[1.02] tracking-tight text-white">
                masuk — atau daftar akun
              </h1>
              <p className="mt-4 text-xs leading-relaxed text-white/70 sm:text-sm">
                Simpan alamat pengiriman, sinkronkan wishlist di semua perangkat, dan pantau status
                verifikasi pesanan QRIS kamu secara real-time.
              </p>

              <div className="mt-7 hidden overflow-hidden rounded-2xl md:block">
                <div className="clip-chamfer-diagonal aspect-[4/3] w-full overflow-hidden bg-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lookThumb}
                    alt="SpaceTrip Streetwear Editorial"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-white/15 pt-5">
              <div className="font-mono-label text-[10px] uppercase tracking-[0.14em] text-white/55">
                [Curated Streetwear · JKT · BDG · YK]
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="p-8 md:col-span-7 md:p-10">
            <div className="font-mono-label text-[11px] font-medium uppercase tracking-[0.14em] text-(--st-text-muted)">
              [Member Authentication]
            </div>
            <h2 className="mt-1.5 font-display text-2xl font-medium tracking-tight text-[#0D0D0D]">
              Customer sign in
            </h2>

            <div className="mt-6">
              <CustomerAuthButtons next={next} />
            </div>

            <div className="mt-6 border-t border-(--st-border) pt-5">
              <Link
                href={next}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-(--st-border) bg-(--st-bg) px-4 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-(--st-text) transition hover:border-[#0D0D0D] hover:bg-white"
              >
                <span>Lanjut Jelajahi Koleksi</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </MobileShell>
  );
}
