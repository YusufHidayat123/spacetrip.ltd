export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatIDR } from "@/lib/orders/format";
import { Pagination } from "@/components/ui/pagination";
import { adminListOrders } from "@/lib/orders/admin";
import type { OrderStatus, PaymentStatus } from "@/lib/orders/types";

function PaymentBadge({ status }: { status: PaymentStatus }) {
  if (status === "verified") return <Badge variant="green">terverifikasi</Badge>;
  if (status === "submitted") return <Badge variant="amber">menunggu review</Badge>;
  if (status === "rejected") return <Badge variant="red">ditolak</Badge>;
  if (status === "expired") return <Badge variant="red">kedaluwarsa</Badge>;
  return <Badge variant="neutral">belum bayar</Badge>;
}

function OrderBadge({ status }: { status: OrderStatus }) {
  if (status === "shipped") return <Badge variant="purple">dikirim</Badge>;
  if (status === "completed") return <Badge variant="green">selesai</Badge>;
  if (status === "cancelled") return <Badge variant="red">dibatalkan</Badge>;
  if (status === "processing") return <Badge variant="dark">diproses</Badge>;
  return <Badge>baru</Badge>;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const payment_status = (
    typeof sp.payment_status === "string" ? sp.payment_status : "all"
  ) as PaymentStatus | "all";
  const status = (typeof sp.status === "string" ? sp.status : "all") as OrderStatus | "all";

  const page = typeof sp.page === "string" ? Number(sp.page) : 1;
  const pageSize = typeof sp.pageSize === "string" ? Number(sp.pageSize) : 20;

  const result = await adminListOrders({
    q,
    payment_status,
    status,
    page,
    pageSize,
  });
  const orders = result.data;
  const total = result.count;

  return (
    <PageShell>
      <PageHeader
        title="Pesanan & Pengiriman"
        description={`Total ${total} pesanan masuk. Review bukti bayar QRIS dan perbarui resi pengiriman.`}
        breadcrumb={<Breadcrumb items={[{ label: "admin", href: "/seller" }, { label: "pesanan" }]} />}
        right={
          <Link
            href="/products"
            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-(--st-border) bg-white px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]"
          >
            <span>Buka Storefront</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <section className="mt-6 rounded-2xl border border-(--st-border) bg-white p-4">
        <form className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input
              name="q"
              defaultValue={q}
              placeholder="Cari nomor order / nama customer..."
              className="h-10 rounded-full border-(--st-border) bg-(--st-bg) pl-10 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              name="payment_status"
              defaultValue={payment_status}
              className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-xs text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
            >
              <option value="all">Semua Pembayaran</option>
              <option value="unpaid">Belum bayar</option>
              <option value="submitted">Bukti masuk</option>
              <option value="verified">Terverifikasi</option>
              <option value="rejected">Ditolak</option>
              <option value="expired">Kedaluwarsa</option>
            </select>

            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-xs text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="new">Baru</option>
              <option value="processing">Diproses</option>
              <option value="shipped">Dikirim</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            <button
              type="submit"
              className="h-10 rounded-full bg-[#0D0D0D] px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#FF5500]"
            >
              Filter
            </button>
          </div>
        </form>
      </section>

      <section className="mt-4 overflow-hidden rounded-3xl border border-(--st-border) bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Order</TableHead>
              <TableHead>Pelanggan</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-xs text-(--st-text-muted)">
                  Belum ada pesanan sesuai filter.
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
                  <TableCell>
                    <PaymentBadge status={o.payment_status} />
                  </TableCell>
                  <TableCell>
                    <OrderBadge status={o.status} />
                  </TableCell>
                  <TableCell className="text-xs text-(--st-text-muted)">
                    {formatDateTime(o.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/seller/orders/${o.id}`}
                      className="inline-flex items-center gap-1 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0D0D0D] transition hover:text-[#FF5500]"
                    >
                      <span>Kelola</span>
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
          if (payment_status && payment_status !== "all") {
            params.set("payment_status", payment_status);
          }
          if (status && status !== "all") params.set("status", status);
          params.set("page", String(p));
          params.set("pageSize", String(result.pageSize));
          return `/seller/orders?${params.toString()}`;
        }}
      />
    </PageShell>
  );
}
