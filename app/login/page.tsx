export const dynamic = "force-dynamic";

import Link from "next/link";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { Button } from "@/components/ui/button";

import { CustomerAuthButtons } from "./_components/customer-auth-buttons";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/products";

  return (
    <MobileShell hideBottomNav>
      <StoreHeader title="Masuk" backHref={`/profile?next=${encodeURIComponent(next)}`} />

      <main className="px-5 pb-8">
        <section className="mt-4 rounded-3xl border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
          <div className="text-lg font-semibold tracking-tight text-(--st-text)">Masuk / Daftar</div>
          <div className="mt-1 text-sm text-(--st-text-muted)">
            Masuk untuk pesan dan melihat status order kamu.
          </div>

          <div className="mt-5">
            <CustomerAuthButtons next={next} />
          </div>

          <div className="mt-4">
            <Button asChild variant="outline" className="h-11 w-full rounded-full bg-white">
              <Link href={next}>Lanjut lihat-lihat</Link>
            </Button>
          </div>
        </section>

        <div className="mt-4 text-center text-[11px] text-(--st-text-muted)">
          Login menggunakan Supabase Auth (Google).
        </div>
      </main>
    </MobileShell>
  );
}
