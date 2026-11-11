export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getPublicProductImageUrl } from "@/lib/catalog/public";
import { SellerAuthButtons } from "./_components/seller-auth-buttons";

export default async function SellerLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next =
    typeof sp.next === "string" && sp.next.startsWith("/seller") ? sp.next : "/seller";
  const reason = typeof sp.reason === "string" ? sp.reason : null;
  const editorialImg = getPublicProductImageUrl("editorial/styles/style-workwear.jpg");

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-(--st-bg) px-4 py-12 sm:px-6">
      <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-3xl border border-(--st-border) bg-white shadow-xs md:grid-cols-12">
        {/* Left Charcoal Studio Panel */}
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
                [Internal Access Only]
              </span>
            </div>

            <div className="mt-4 font-display text-2xl font-bold tracking-tighter text-white">
              spacetrip<span className="text-[#FF5500]">.</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-medium leading-[1.1] tracking-tight text-white/95">
              Operations &amp; Admin Portal
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-white/65">
              Kelola inventaris drop, verifikasi pembayaran QRIS manual, dan perbarui status
              pengiriman SpaceTrip Indonesia.
            </p>

            <div className="mt-6 hidden overflow-hidden rounded-2xl md:block">
              <div className="clip-chamfer-diagonal aspect-[16/10] w-full overflow-hidden bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editorialImg}
                  alt="SpaceTrip Operations Studio"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-mono-label text-[10px] uppercase tracking-[0.14em] text-white/70 transition hover:text-[#FF5500]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Storefront
            </Link>
          </div>
        </div>

        {/* Right Auth Panel */}
        <div className="p-8 md:col-span-7 md:p-10">
          <div className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
            [Staff Sign In]
          </div>
          <h2 className="mt-1.5 font-display text-2xl font-medium tracking-tight text-[#0D0D0D]">
            Masuk Panel Seller / Admin
          </h2>

          {reason === "forbidden" ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              Akun kamu tidak memiliki hak akses Admin atau Karyawan.
            </div>
          ) : null}

          <div className="mt-6">
            <SellerAuthButtons next={next} />
          </div>
        </div>
      </div>
    </div>
  );
}
