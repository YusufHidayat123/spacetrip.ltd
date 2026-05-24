export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { Button } from "@/components/ui/button";
import { isCustomerLoggedIn, clearCustomerLoggedIn } from "@/lib/supabase/auth";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";

  const loggedIn = await isCustomerLoggedIn();

  async function logoutAction() {
    "use server";
    await clearCustomerLoggedIn();
    redirect("/");
  }

  return (
    <MobileShell>
      <StoreHeader title="Profil" />

      <main className="px-5 pb-6">
        {!loggedIn ? (
          <section className="mt-4 rounded-[24px] border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
            <div className="text-lg font-semibold tracking-tight text-(--st-text)">
              Masuk untuk lanjut
            </div>
            <div className="mt-1 text-sm text-(--st-text-muted)">
              Kamu bisa lihat-lihat produk tanpa akun, tapi untuk pesan dan melihat riwayat pesanan kamu perlu masuk.
            </div>

            <div className="mt-5 grid gap-2">
              <Button asChild className="h-11 rounded-full">
                <Link href={`/login?next=${encodeURIComponent(next)}`}>Masuk / Daftar</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full bg-white">
                <Link href="/products">Lihat koleksi</Link>
              </Button>
            </div>

            <div className="mt-4 text-[11px] text-(--st-text-muted)">
              Login dengan Google akan ditambahkan. Untuk sementara, ini masih gate login sederhana.
            </div>
          </section>
        ) : (
          <section className="mt-4 rounded-[24px] border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
            <div className="text-lg font-semibold tracking-tight text-(--st-text)">
              Akun kamu
            </div>
            <div className="mt-1 text-sm text-(--st-text-muted)">
              Pengaturan profil & alamat akan ditambahkan berikutnya.
            </div>

            <div className="mt-5 grid gap-2">
              <Button asChild className="h-11 rounded-full">
                <Link href="/orders">Lihat pesanan saya</Link>
              </Button>
              <form action={logoutAction}>
                <Button type="submit" variant="outline" className="h-11 w-full rounded-full bg-white">
                  Keluar
                </Button>
              </form>
            </div>
          </section>
        )}
      </main>
    </MobileShell>
  );
}
