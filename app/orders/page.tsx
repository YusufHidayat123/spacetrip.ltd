export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, Package } from "lucide-react";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime, formatIDR } from "@/lib/orders/format";

function PaymentBadge({ status }: { status: string }) {
  if (status === "verified") return <Badge variant="green">TERVERIFIKASI</Badge>;
  if (status === "submitted") return <Badge variant="amber">MENUNGGU CEK</Badge>;
  if (status === "rejected") return <Badge variant="red">DITOLAK</Badge>;
  if (status === "expired") return <Badge variant="red">KEDALUWARSA</Badge>;
  return <Badge variant="neutral">BELUM BAYAR</Badge>;
}

function OrderBadge({ status }: { status: string }) {
  if (status === "processing") return <Badge variant="dark">DIPROSES</Badge>;
  if (status === "shipped") return <Badge variant="purple">DIKIRIM</Badge>;
  if (status === "completed") return <Badge variant="green">SELESAI</Badge>;
  if (status === "cancelled") return <Badge variant="red">DIBATALKAN</Badge>;
  return <Badge>BARU</Badge>;
}

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/orders");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id,order_number,created_at,status,payment_status,total_amount")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const list = orders ?? [];

  return (
    <MobileShell>
      <StoreHeader title="Pesanan" backHref="/" />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:py-12">
        <div className="flex flex-col justify-between gap-4 border-b border-(--st-border) pb-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
              >
                &#10035;
              </span>
              <span className="font-mono-label text-[11px] font-medium uppercase tracking-[0.14em] text-(--st-text-muted)">
                [Order Tracking]
              </span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-medium lowercase tracking-[-0.04em] text-[#0D0D0D] sm:text-5xl">
              pesanan — saya
            </h1>
          </div>
          <Link
            href="/products"
            className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-(--st-border) bg-white px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500] md:self-auto"
          >
            <span>Lanjut Belanja</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8">
          {list.length === 0 ? (
            <div className="rounded-3xl border border-(--st-border) bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-(--st-accent-border) bg-(--st-accent-soft)">
                <Package className="h-5 w-5 text-[#FF5500]" />
              </div>
              <h2 className="mt-5 font-display text-xl font-medium tracking-tight text-[#0D0D0D]">
                Belum Ada Pesanan
              </h2>
              <p className="mx-auto mt-2 max-w-md text-xs text-(--st-text-muted) sm:text-sm">
                Jelajahi drop terbaru dan selesaikan pesanan pertamamu dengan pembayaran QRIS.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
              >
                <span>Jelajahi Koleksi</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {list.map(
                (o: {
                  id: string;
                  order_number: string;
                  created_at: string;
                  status: string;
                  payment_status: string;
                  total_amount: string;
                }) => (
                  <Link
                    key={o.id}
                    href={`/orders/${o.id}`}
                    className="group flex flex-col justify-between rounded-3xl border border-(--st-border) bg-white p-6 transition hover:border-[#0D0D0D] hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-(--st-border) pb-4">
                      <div>
                        <div className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
                          [Order Number]
                        </div>
                        <div className="mt-1 font-display text-lg font-semibold tracking-tight text-[#0D0D0D]">
                          {o.order_number}
                        </div>
                        <div className="mt-1 text-xs text-(--st-text-muted)">
                          {formatDateTime(o.created_at)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
                          Total Tagihan
                        </div>
                        <div className="mt-1 font-display text-lg font-semibold tracking-tight text-[#0D0D0D]">
                          {formatIDR(o.total_amount)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <PaymentBadge status={o.payment_status} />
                        <OrderBadge status={o.status} />
                      </div>
                      <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-(--st-border) bg-(--st-bg) px-3.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] transition group-hover:border-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-white">
                        <span>Detail &amp; Bayar</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </main>
    </MobileShell>
  );
}
