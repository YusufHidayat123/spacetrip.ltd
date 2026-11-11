export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { adminListOrders } from "@/lib/orders/admin";
import { formatDateTime, formatIDR } from "@/lib/orders/format";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";

  const page = typeof sp.page === "string" ? Number(sp.page) : 1;
  const pageSize = typeof sp.pageSize === "string" ? Number(sp.pageSize) : 20;

  // Convenience queue for manual payment reviews.
  const result = await adminListOrders({ payment_status: "submitted", q, page, pageSize });
  const orders = result.data;
  const total = result.count;

  return (
    <PageShell>
      <PageHeader
        title="Transaksi QRIS"
        description="Antrean bukti pembayaran yang menunggu review verifikasi manual."
        badge={<Badge variant={total > 0 ? "amber" : "neutral"}>{total} perlu review</Badge>}
        breadcrumb={
          <Breadcrumb items={[{ label: "admin", href: "/seller" }, { label: "transaksi" }]} />
        }
        right={
          <Link
            href="/seller/orders?payment_status=submitted"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-(--st-border) bg-white px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]"
          >
            <span>Buka View Pesanan</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <section className="mt-6 rounded-2xl border border-(--st-border) bg-white p-4">
        <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Cari nomor order / nama customer..."
              className="h-10 rounded-full border-(--st-border) bg-(--st-bg) pl-10 text-xs"
            />
          </div>
          <Button
            type="submit"
            className="h-10 rounded-full bg-[#0D0D0D] px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-white hover:bg-[#FF5500]"
          >
            Cari
          </Button>
        </form>
      </section>

      <section className="mt-4 overflow-hidden rounded-3xl border border-(--st-border) bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Order</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead className="w-40">Total</TableHead>
              <TableHead className="w-45">Dibuat</TableHead>
              <TableHead className="w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-xs text-(--st-text-muted)">
                  Belum ada bukti pembayaran yang perlu direview.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono-label text-xs font-semibold">
                    {o.order_number}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-(--st-text)">{o.customer_name}</div>
                    <div className="mt-0.5 text-xs text-(--st-text-muted)">
                      {o.customer_email ?? "—"}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatIDR(o.total_amount)}</TableCell>
                  <TableCell className="text-xs text-(--st-text-muted)">
                    {formatDateTime(o.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/seller/orders/${o.id}`}
                      className="inline-flex items-center gap-1 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0D0D0D] transition hover:text-[#FF5500]"
                    >
                      <span>Review</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <Pagination
        className="mt-4"
        page={result.page}
        pageSize={result.pageSize}
        total={total}
        href={(p) => {
          const params = new URLSearchParams();
          if (q) params.set("q", q);
          params.set("page", String(p));
          params.set("pageSize", String(result.pageSize));
          return `/seller/transactions?${params.toString()}`;
        }}
      />

      <p className="mt-3 text-xs text-(--st-text-muted)">
        Antrean review cepat untuk pembayaran status submitted. Workflow lengkap tersedia di Pesanan
        &amp; Pengiriman.
      </p>
    </PageShell>
  );
}
