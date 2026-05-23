import Link from "next/link";

import { Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-(--st-bg)">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--st-accent) text-black shadow-[0_1px_0_rgba(17,24,39,0.04)]">
              <Rocket className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-(--st-text)">
              spacetrip
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="h-9">
              <Link href="/orders">Track order</Link>
            </Button>
            <Button asChild className="h-9">
              <Link href="/products">Shop</Link>
            </Button>
          </div>
        </header>

        <main className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-center">
          <section>
            <div className="inline-flex items-center rounded-full border border-(--st-border) bg-white px-3 py-1 text-xs font-medium text-(--st-text-muted)">
              Manual QRIS payment • Upload proof after checkout
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-(--st-text)">
              Spacetrip clothing drops
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-(--st-text-muted)">
              Browse products, place your order, then pay via QRIS and upload your payment proof.
              We’ll confirm your payment and process the shipment.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild className="h-10">
                <Link href="/products">Browse products</Link>
              </Button>
              <Button asChild variant="outline" className="h-10">
                <Link href="/orders">Track existing order</Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-3 rounded-xl border border-(--st-border) bg-white p-5 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
              <div className="text-sm font-semibold text-(--st-text)">How it works</div>
              <ol className="list-decimal space-y-1 pl-4 text-sm text-(--st-text-muted)">
                <li>Select a product and size.</li>
                <li>Fill shipping details and place the order.</li>
                <li>Pay via QRIS.</li>
                <li>Upload your payment proof from the order page.</li>
              </ol>
            </div>

            <div className="mt-6 text-xs text-(--st-text-muted)">
              Admin? <Link href="/seller" className="underline underline-offset-4">Open console</Link>
            </div>
          </section>

          <section className="rounded-2xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
            <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-(--st-border) bg-[#F7F8FA]">
              <div className="flex h-full w-full items-center justify-center text-sm text-(--st-text-muted)">
                Hero image placeholder
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="text-sm font-semibold text-(--st-text)">Fast MVP storefront</div>
              <div className="text-sm text-(--st-text-muted)">
                This is the minimal customer-facing flow for the PRD MVP.
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
