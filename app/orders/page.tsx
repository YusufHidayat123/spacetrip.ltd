export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateTime, formatIDR } from "@/lib/orders/format";

function PaymentBadge({ status }: { status: string }) {
  if (status === "verified") return <Badge variant="green">Terverifikasi</Badge>;
  if (status === "submitted") return <Badge variant="amber">Menunggu cek</Badge>;
  if (status === "rejected") return <Badge variant="red">Ditolak</Badge>;
  if (status === "expired") return <Badge variant="red">Kedaluwarsa</Badge>;
  return <Badge variant="neutral">Belum bayar</Badge>;
}

function OrderBadge({ status }: { status: string }) {
  if (status === "processing") return <Badge>Diproses</Badge>;
  if (status === "shipped") return <Badge variant="purple">Dikirim</Badge>;
  if (status === "completed") return <Badge variant="green">Selesai</Badge>;
  if (status === "cancelled") return <Badge variant="red">Dibatalkan</Badge>;
  return <Badge>Baru</Badge>;
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

  return (
    <MobileShell>
      <StoreHeader title="Orders" backHref="/" />

      <main className="px-5 pb-6">
        <section className="mt-4 rounded-[24px] border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
          <div className="text-lg font-semibold tracking-tight text-(--st-text)">
            Pesanan saya
          </div>
          <div className="mt-1 text-sm text-(--st-text-muted)">
            Riwayat dan status pesanan kamu.
          </div>

          {(orders ?? []).length === 0 ? (
            <div className="mt-5 rounded-2xl border border-(--st-border) bg-[#F7F8FA] p-4 text-sm text-(--st-text-muted)">
              Belum ada pesanan. Kalau ada yang cocok, langsung gas sebelum keduluan.
            </div>
          ) : (
            <div className="mt-5 grid gap-3">
              {(orders ?? []).map((o: {
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
                  className="block rounded-2xl border border-(--st-border) bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-(--st-text)">{o.order_number}</div>
                      <div className="mt-1 text-xs text-(--st-text-muted)">
                        {formatDateTime(o.created_at)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-(--st-text-muted)">Total</div>
                      <div className="mt-1 text-sm font-semibold text-(--st-text)">
                        {formatIDR(o.total_amount)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <PaymentBadge status={o.payment_status} />
                    <OrderBadge status={o.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-2">
            <Button asChild className="h-11 rounded-full">
              <Link href="/products">Lihat koleksi</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-full bg-white">
              <Link href="/profile">Profil</Link>
            </Button>
          </div>
        </section>
      </main>
    </MobileShell>
  );
}
