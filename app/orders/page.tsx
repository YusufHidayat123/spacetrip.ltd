export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { Button } from "@/components/ui/button";
import { isCustomerLoggedIn } from "@/lib/supabase/auth";

export default async function OrdersPage() {
  const loggedIn = await isCustomerLoggedIn();
  if (!loggedIn) {
    redirect("/profile?next=/orders");
  }

  return (
    <MobileShell>
      <StoreHeader title="Orders" backHref="/" />

      <main className="px-5 pb-6">
        <section className="mt-4 rounded-[24px] border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
          <div className="text-lg font-semibold tracking-tight text-(--st-text)">
            Your orders
          </div>
          <div className="mt-1 text-sm text-(--st-text-muted)">
            Order history will appear here once customer accounts are fully connected to orders.
          </div>

          <div className="mt-5 grid gap-2">
            <Button asChild className="h-11 rounded-full">
              <Link href="/products">Browse products</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full bg-white">
              <Link href="/profile">Profile</Link>
            </Button>
          </div>
        </section>
      </main>
    </MobileShell>
  );
}
