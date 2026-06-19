export const dynamic = "force-dynamic";

import Link from "next/link";

import { ChevronRight } from "lucide-react";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { publicListActiveProducts } from "@/lib/catalog/public";

export default async function Home() {
  const products = await publicListActiveProducts({ limit: 6 });

  return (
    <MobileShell>
      <StoreHeader rightHref="/products" rightLabel="Koleksi" />

      <main className="px-5 pb-6">
        <section className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_16px_40px_rgba(17,24,39,0.10)]">
          <div className="relative aspect-4/3 w-full bg-[#F7F8FA]">
            <div className="absolute inset-0 bg-linear-to-tr from-black/0 via-black/0 to-black/5" />

            <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
              <div className="rounded-full border border-(--st-border) bg-white/90 px-3 py-1 text-[11px] font-medium text-(--st-text-muted)">
                Kurasi thrift
              </div>
              <div className="rounded-full border border-(--st-border) bg-white/90 px-3 py-1 text-[11px] font-medium text-(--st-text-muted)">
                Stok terbatas
              </div>
            </div>

            <div className="absolute bottom-5 left-5 right-5">
              <div className="text-2xl font-semibold tracking-tight text-(--st-text)">
                Temuan dari Orbit.
              </div>
              <div className="mt-1 text-sm text-(--st-text-muted)">
                Kurasi thrift stok terbatas. Kalau cocok, jangan kelamaan.
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button asChild className="h-10 rounded-full">
                  <Link href="/products">
                    Lihat koleksi
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-10 rounded-full bg-white">
                  <Link href="/profile?next=/products&intent=checkout">Masuk untuk pesan</Link>
                </Button>
              </div>

              <div className="mt-3 text-[11px] text-(--st-text-muted)">
                Untuk memesan, kamu perlu masuk dan melengkapi data profil.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-3 rounded-3xl border border-(--st-border) bg-white p-4">
          <div className="text-sm font-semibold text-(--st-text)">Fokus Spacetrip</div>
          <div className="grid gap-2 text-sm text-(--st-text-muted)">
            <div className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--st-accent-soft) text-[11px] font-semibold text-(--st-text)">1</span>
              <span>Kurasi item thrift yang wearable untuk dipakai harian.</span>
            </div>
            <div className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--st-accent-soft) text-[11px] font-semibold text-(--st-text)">2</span>
              <span>Info ukuran & kondisi jelas (stok cepat berubah).</span>
            </div>
            <div className="flex gap-2">
              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-(--st-accent-soft) text-[11px] font-semibold text-(--st-text)">3</span>
              <span>Kaos, jeans, cargo, topi, dan item thrift lainnya — update rutin.</span>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-(--st-text)">Produk terbaru</div>
              <div className="mt-0.5 text-xs text-(--st-text-muted)">Update terbaru dari koleksi thrift</div>
            </div>
            <Link href="/products" className="text-xs font-medium text-(--st-text) underline underline-offset-4">
              Lihat semua
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {products.length === 0 ? (
              <div className="col-span-2 rounded-2xl border border-(--st-border) bg-white p-4 text-sm text-(--st-text-muted)">
                Belum ada produk.
              </div>
            ) : (
              products.map((p) => {
                const imgs = (p.product_images ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
                const hero = imgs[0] ?? null;
                return (
                  <ProductCard
                    key={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={p.price}
                    image={hero ? { storage_path: hero.storage_path, alt: hero.alt ?? null } : null}
                  />
                );
              })
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-(--st-border) bg-white p-4">
          <div className="text-sm font-semibold text-(--st-text)">Cara belanja</div>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-(--st-text-muted)">
            <li>Browse koleksi thrift terbaru.</li>
            <li>Masuk untuk bisa pesan.</li>
            <li>Pilih ukuran & jumlah, lalu lanjutkan pemesanan.</li>
            <li>Pantau status pesanan dari menu Orders.</li>
          </ol>
        </section>

        <div className="mt-6 text-center text-[11px] text-(--st-text-muted)">
          Mau lihat status pesanan?{" "}
          <Link href="/orders" className="underline underline-offset-4">
            Buka Orders
          </Link>
        </div>
      </main>
    </MobileShell>
  );
}
