export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Heart,
  LogOut,
  MapPin,
  Package,
  Shield,
  User as UserIcon,
} from "lucide-react";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ShippingAddress = {
  line1: string;
  city: string;
  province: string;
  postal_code: string;
};

function isCompleteAddress(
  a: Partial<ShippingAddress> | null | undefined
): a is ShippingAddress {
  if (!a) return false;
  return Boolean(a.line1 && a.city && a.province && a.postal_code);
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function logoutAction() {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  if (!user) {
    return (
      <MobileShell>
        <StoreHeader title="Akun" backHref="/" />

        <main className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8">
          <div className="mx-auto max-w-lg rounded-3xl border border-(--st-border) bg-white p-8 sm:p-10">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
              >
                &#10035;
              </span>
              <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.16em] text-(--st-text-muted)">
                [Member Account]
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-medium lowercase tracking-tight text-[#0D0D0D]">
              masuk untuk melanjutkan
            </h1>
            <p className="mt-3 text-xs leading-relaxed text-(--st-text-muted) sm:text-sm">
              Kamu bebas menelusuri seluruh archive tanpa akun. Untuk menyimpan alamat pengiriman,
              melakukan checkout, dan memantau status pembayaran QRIS, silakan masuk terlebih
              dahulu.
            </p>

            <div className="mt-7 grid gap-3">
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0D0D0D] font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
              >
                <span>Masuk / Daftar Akun</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/products"
                className="flex h-11 w-full items-center justify-center rounded-full border border-(--st-border) bg-(--st-bg) font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-(--st-text) transition hover:border-[#0D0D0D]"
              >
                Jelajahi Koleksi
              </Link>
            </div>
          </div>
        </main>
      </MobileShell>
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role,full_name,phone,shipping_address")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;

  const isAdminOrSeller = profile?.role === "admin" || profile?.role === "seller";
  const addr = (profile?.shipping_address ?? null) as Partial<ShippingAddress> | null;
  const fullNameOk = Boolean(
    profile?.full_name && String(profile.full_name).trim().length > 0
  );
  const addrOk = isCompleteAddress(addr);
  const profileComplete = fullNameOk && addrOk;

  return (
    <MobileShell>
      <StoreHeader title="Akun Saya" backHref="/" />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:py-12">
        <div className="border-b border-(--st-border) pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
                >
                  &#10035;
                </span>
                <span className="font-mono-label text-[11px] font-medium uppercase tracking-[0.14em] text-(--st-text-muted)">
                  [SpaceTrip Member]
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-[#0D0D0D] sm:text-4xl">
                {profile?.full_name || "Profil Akun"}
              </h1>
              <p className="mt-1 font-mono-label text-xs text-(--st-text-muted)">
                {user.email ?? "—"}
              </p>
            </div>

            {isAdminOrSeller ? (
              <Link
                href="/seller"
                className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-5 py-3 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
              >
                <Shield className="h-4 w-4 text-[#FF5500] group-hover:text-white" />
                <span>
                  {profile?.role === "admin"
                    ? "Buka Admin Panel (Super Admin)"
                    : "Buka Panel Seller"}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Left: Shipping Profile */}
          <section className="rounded-3xl border border-(--st-border) bg-white p-6 sm:p-8 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-(--st-border) pb-4">
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-[#FF5500]" />
                <h2 className="font-display text-base font-medium tracking-tight text-[#0D0D0D]">
                  Data &amp; Alamat Pengiriman
                </h2>
              </div>
              <span
                className={`rounded-full px-3 py-0.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.1em] ${
                  profileComplete
                    ? "bg-[#FF5500] text-white"
                    : "bg-(--st-bg) text-(--st-text-muted)"
                }`}
              >
                {profileComplete ? "Lengkap" : "Perlu Dilengkapi"}
              </span>
            </div>

            {profileComplete ? (
              <div className="mt-5 rounded-2xl border border-(--st-border) bg-(--st-bg) p-4 text-sm text-(--st-text)">
                <div className="font-semibold">{profile?.full_name}</div>
                {profile?.phone ? (
                  <div className="mt-0.5 font-mono-label text-xs text-(--st-text-muted)">
                    {profile.phone}
                  </div>
                ) : null}
                <div className="mt-2 text-xs leading-relaxed text-(--st-text-muted)">
                  <div>{addr?.line1}</div>
                  <div>
                    {(addr?.city ?? "") + (addr?.province ? `, ${addr.province}` : "")}{" "}
                    {addr?.postal_code ?? ""}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-xs leading-relaxed text-(--st-text-muted) sm:text-sm">
                Lengkapi nama lengkap dan alamat pengiriman satu kali saja supaya checkout keranjang
                maupun beli langsung berjalan otomatis.
              </p>
            )}

            <div className="mt-6">
              <Link
                href={`/profile/setup?next=${encodeURIComponent(next)}`}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#0D0D0D] px-6 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
              >
                {profileComplete ? "Ubah Data Pengiriman" : "Lengkapi Alamat Sekarang"}
              </Link>
            </div>
          </section>

          {/* Right: Quick Navigation & Logout */}
          <section className="flex flex-col justify-between rounded-3xl border border-(--st-border) bg-white p-6 sm:p-8 lg:col-span-5">
            <div>
              <div className="flex items-center gap-2.5 border-b border-(--st-border) pb-4">
                <UserIcon className="h-4 w-4 text-[#FF5500]" />
                <h2 className="font-display text-base font-medium tracking-tight text-[#0D0D0D]">
                  Navigasi Akun
                </h2>
              </div>

              <div className="mt-4 divide-y divide-(--st-border)">
                <Link
                  href="/orders"
                  className="group flex items-center justify-between py-3.5 text-xs font-medium text-(--st-text) transition hover:text-[#FF5500] sm:text-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <Package className="h-4 w-4 text-(--st-text-muted) group-hover:text-[#FF5500]" />
                    Riwayat &amp; Status Pesanan
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-(--st-text-muted) group-hover:text-[#FF5500]" />
                </Link>

                <Link
                  href="/wishlist"
                  className="group flex items-center justify-between py-3.5 text-xs font-medium text-(--st-text) transition hover:text-[#FF5500] sm:text-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <Heart className="h-4 w-4 text-(--st-text-muted) group-hover:text-[#FF5500]" />
                    Saved Wishlist
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-(--st-text-muted) group-hover:text-[#FF5500]" />
                </Link>

                {isAdminOrSeller ? (
                  <Link
                    href="/seller"
                    className="group flex items-center justify-between py-3.5 text-xs font-semibold text-(--st-text) transition hover:text-[#FF5500] sm:text-sm"
                  >
                    <span className="flex items-center gap-2.5">
                      <Shield className="h-4 w-4 text-[#FF5500]" />
                      Dashboard Operasional ({profile?.role?.toUpperCase()})
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-(--st-text-muted) group-hover:text-[#FF5500]" />
                  </Link>
                ) : null}
              </div>
            </div>

            <form action={logoutAction} className="mt-6 border-t border-(--st-border) pt-5">
              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-(--st-border) bg-(--st-bg) font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-(--st-text) transition hover:border-red-700 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-3.5 w-3.5" />
                Keluar dari Akun
              </button>
            </form>
          </section>
        </div>
      </main>
    </MobileShell>
  );
}
