import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function EditorialFooter() {
  return (
    <footer className="mt-16 rounded-t-[28px] bg-[#0D0D0D] text-white sm:rounded-t-[40px]">
      <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-display text-3xl font-bold tracking-tighter text-white"
            >
              <span>
                spacetrip<span className="text-[#FF5500]">.</span>
              </span>
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5500] text-xs font-bold text-white"
              >
                &#10035;
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-white/65 sm:text-sm">
              Destinasi kurasi thrift dan streetwear lokal Indonesia. Menghadirkan siluet urban
              yang autentik, kondisi transparan, dan rilisan terbatas dari Jakarta, Bandung,
              hingga Yogyakarta.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono-label text-[10px] uppercase tracking-[0.14em] text-white/50">
              <span>[JKT · BDG · YK · SBY]</span>
              <span>·</span>
              <a
                href="mailto:info@spacetrip.id"
                className="text-white/80 transition hover:text-[#FF5500]"
              >
                info@spacetrip.id
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="md:col-span-2">
            <div className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              [Shop Archive]
            </div>
            <ul className="mt-4 space-y-2.5 text-xs text-white/80">
              <li>
                <Link href="/products?gender=men" className="transition hover:text-[#FF5500]">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/products?gender=women" className="transition hover:text-[#FF5500]">
                  Women
                </Link>
              </li>
              <li>
                <Link href="/products?gender=unisex" className="transition hover:text-[#FF5500]">
                  Unisex
                </Link>
              </li>
              <li>
                <Link
                  href="/products?gender=accessories"
                  className="transition hover:text-[#FF5500]"
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link href="/products?maxPrice=100000" className="transition hover:text-[#FF5500]">
                  Under IDR 100K
                </Link>
              </li>
            </ul>
          </div>

          {/* Styles */}
          <div className="md:col-span-2">
            <div className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              [Curation]
            </div>
            <ul className="mt-4 space-y-2.5 text-xs text-white/80">
              <li>
                <Link href="/products?sort=featured" className="transition hover:text-[#FF5500]">
                  Editor&apos;s Picks
                </Link>
              </li>
              <li>
                <Link
                  href="/products?style=y2k-streetwear"
                  className="transition hover:text-[#FF5500]"
                >
                  Y2K Streetwear
                </Link>
              </li>
              <li>
                <Link
                  href="/products?style=vintage-workwear"
                  className="transition hover:text-[#FF5500]"
                >
                  Vintage Workwear
                </Link>
              </li>
              <li>
                <Link
                  href="/products?style=japanese-street"
                  className="transition hover:text-[#FF5500]"
                >
                  Japanese Street
                </Link>
              </li>
              <li>
                <Link
                  href="/products?style=minimal-daily"
                  className="transition hover:text-[#FF5500]"
                >
                  Minimal Daily
                </Link>
              </li>
            </ul>
          </div>

          {/* Account & Orders */}
          <div className="md:col-span-3">
            <div className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              [Client Care]
            </div>
            <ul className="mt-4 space-y-2.5 text-xs text-white/80">
              <li>
                <Link href="/orders" className="transition hover:text-[#FF5500]">
                  Riwayat &amp; Status Pesanan
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="transition hover:text-[#FF5500]">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/profile" className="transition hover:text-[#FF5500]">
                  Akun &amp; Alamat Pengiriman
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-[#FF5500]">
                  Masuk / Daftar Akun
                </Link>
              </li>
            </ul>

            <Link
              href="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#0D0D0D] transition hover:bg-[#FF5500] hover:text-white"
            >
              <span>Shop All Drops</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/12 pt-8 text-[11px] text-white/45 sm:flex-row sm:items-center">
          <div>
            &copy; {new Date().getFullYear()} spacetrip.ltd — Indonesian Curated Thrift &amp;
            Streetwear.
          </div>
          <div className="font-mono-label uppercase tracking-[0.14em]">
            [LIMITED PIECES · NO RESTOCK GUARANTEED]
          </div>
        </div>
      </div>
    </footer>
  );
}
