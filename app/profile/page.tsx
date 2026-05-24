export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { Button } from "@/components/ui/button";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ShippingAddress = {
  line1: string;
  city: string;
  province: string;
  postal_code: string;
};

function isCompleteAddress(a: Partial<ShippingAddress> | null | undefined): a is ShippingAddress {
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
        <StoreHeader title="Profil" />

        <main className="px-5 pb-6">
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
              Login memakai Supabase Auth.
            </div>
          </section>
        </main>
      </MobileShell>
    );
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name,phone,shipping_address")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;

  const addr = (profile?.shipping_address ?? null) as Partial<ShippingAddress> | null;
  const fullNameOk = Boolean(profile?.full_name && String(profile.full_name).trim().length > 0);
  const addrOk = isCompleteAddress(addr);
  const profileComplete = fullNameOk && addrOk;

  return (
    <MobileShell>
      <StoreHeader title="Profil" />

      <main className="px-5 pb-6">
        <section className="mt-4 rounded-[24px] border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
          <div className="text-lg font-semibold tracking-tight text-(--st-text)">
            Akun kamu
          </div>
          <div className="mt-1 text-sm text-(--st-text-muted)">
            {user.email ?? "—"}
          </div>

          <div className="mt-4 rounded-2xl border border-(--st-border) bg-[#F7F8FA] p-4 text-sm">
            <div className="font-medium text-(--st-text)">Data pengiriman</div>
            {profileComplete ? (
              <div className="mt-1 text-(--st-text-muted)">
                {profile?.full_name}
                {addr?.line1 ? <div className="mt-1">{addr.line1}</div> : null}
                {addr?.city || addr?.province ? (
                  <div className="mt-1">
                    {(addr?.city ?? "") + (addr?.province ? `, ${addr.province}` : "")}
                  </div>
                ) : null}
                {addr?.postal_code ? <div className="mt-1">{addr.postal_code}</div> : null}
              </div>
            ) : (
              <div className="mt-1 text-(--st-text-muted)">
                Belum lengkap. Lengkapi dulu supaya checkout jadi cepat.
              </div>
            )}

            <div className="mt-4">
              <Button asChild className="h-10 rounded-full">
                <Link href={`/profile/setup?next=${encodeURIComponent(next)}`}>
                  {profileComplete ? "Ubah data" : "Lengkapi profil"}
                </Link>
              </Button>
            </div>
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
      </main>
    </MobileShell>
  );
}
