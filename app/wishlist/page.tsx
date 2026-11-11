import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { WishlistGrid } from "@/components/storefront/wishlist-grid";

export const metadata = {
  title: "Wishlist | SPACETRIP",
};

export default function WishlistPage() {
  return (
    <MobileShell>
      <StoreHeader title="Wishlist" backHref="/products" />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:py-12">
        <div className="border-b border-(--st-border) pb-6">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
            >
              &#10035;
            </span>
            <span className="font-mono-label text-[11px] font-medium uppercase tracking-[0.14em] text-(--st-text-muted)">
              [Saved Pieces]
            </span>
          </div>
          <h1 className="mt-3 font-display text-4xl font-medium lowercase tracking-[-0.04em] text-[#0D0D0D] sm:text-5xl">
            saved — archive
          </h1>
          <p className="mt-2 text-xs text-(--st-text-muted) sm:text-sm">
            Simpan piece streetwear pilihanmu sebelum keduluan kolektor lain.
          </p>
        </div>

        <section className="mt-8">
          <WishlistGrid />
        </section>
      </main>
    </MobileShell>
  );
}
