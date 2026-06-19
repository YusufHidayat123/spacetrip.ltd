export const dynamic = "force-dynamic";

import Link from "next/link";

import { PageShell } from "@/components/seller/page-shell";
import { Button } from "@/components/ui/button";

import { SellerAuthButtons } from "./_components/seller-auth-buttons";

export default async function SellerLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/seller") ? sp.next : "/seller";
  const reason = typeof sp.reason === "string" ? sp.reason : null;

  return (
    <PageShell>
      <div className="mx-auto mt-20 w-full max-w-130 rounded-2xl border border-(--st-border) bg-white p-6 shadow-[0_16px_48px_rgba(17,24,39,0.12)]">
        <div className="text-lg font-semibold tracking-tight text-(--st-text)">Login Admin</div>
        <div className="mt-1 text-sm text-(--st-text-muted)">
          Masuk untuk mengakses panel admin.
        </div>

        {reason === "forbidden" ? (
          <div className="mt-4 rounded-xl border border-[#FEE2E2] bg-[#FEF2F2] p-4 text-sm text-[#B91C1C]">
            Akun kamu tidak punya akses admin.
          </div>
        ) : null}

        <div className="mt-5">
          <SellerAuthButtons next={next} />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button asChild variant="outline">
            <Link href="/">Kembali ke storefront</Link>
          </Button>
          <div className="text-xs text-(--st-text-muted)">spacetrip admin</div>
        </div>
      </div>
    </PageShell>
  );
}
