export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setCustomerLoggedIn } from "@/lib/supabase/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/products";

  async function loginAction(formData: FormData) {
    "use server";

    // MVP login gate: this sets a secure httpOnly cookie.
    // Replace with Supabase Auth (email/OTP) when ready.
    const email = String(formData.get("email") ?? "").trim();
    if (!email) throw new Error("Email is required");

    await setCustomerLoggedIn();
    redirect(next);
  }

  return (
    <MobileShell hideBottomNav>
      <StoreHeader title="Masuk" backHref={`/profile?next=${encodeURIComponent(next)}`} />

      <main className="px-5 pb-8">
        <section className="mt-4 rounded-[24px] border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
          <div className="text-lg font-semibold tracking-tight text-(--st-text)">Masuk dulu</div>
          <div className="mt-1 text-sm text-(--st-text-muted)">
            Kamu bisa lihat-lihat koleksi, tapi untuk pesan dan melihat pesanan kamu perlu masuk.
          </div>

          <form action={loginAction} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Email</label>
              <Input name="email" type="email" placeholder="kamu@email.com" required />
              <div className="text-[11px] text-(--st-text-muted)">
                Login Google akan ditambahkan. Untuk sementara, ini masih gate login sederhana.
              </div>
            </div>

            <SubmitButton pendingText="Memproses..." className="h-11 rounded-full">
              Lanjut
            </SubmitButton>

            <Button asChild variant="outline" className="h-11 rounded-full bg-white">
              <Link href={next}>Lanjut lihat-lihat</Link>
            </Button>
          </form>
        </section>

        <div className="mt-4 text-center text-[11px] text-(--st-text-muted)">
          Dengan lanjut, kamu setuju proses verifikasi pesanan dilakukan manual.
        </div>
      </main>
    </MobileShell>
  );
}
