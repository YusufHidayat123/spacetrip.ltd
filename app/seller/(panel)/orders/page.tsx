export const dynamic = "force-dynamic";

import Link from "next/link";

import { ArrowRight, Search } from "lucide-react";

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
  if (status === "processing") return <Badge>diproses</Badge>;
  return <Badge>baru</Badge>;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const q = typeof sp.q === "string" ? sp.q : "";
  const payment_status = (typeof sp.payment_status === "string"
    ? sp.payment_status
    : "all") as PaymentStatus | "all";
  const status = (typeof sp.status === "string" ? sp.status : "all") as
    | OrderStatus
    | "all";

  const page = typeof sp.page === "string" ? Number(sp.page) : 1;
  const pageSize = typeof sp.pageSize === "string" ? Number(sp.pageSize) : 20;

  const result = await adminListOrders({ q, payment_status, status, page, pageSize });
  const orders = result.data;
  const total = result.count;

  return (
    <PageShell>
      <PageHeader
        title="Pesanan"
        breadcrumb={
          <Breadcrumb
            items={[{ label: "admin", href: "/seller" }, { label: "pesanan" }]}
          />
        }
        right={
          <Button asChild variant="outline">
            <Link href="/products">Buka storefront</Link>
          </Button>
        }
      />

      <section className="mt-6 rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-90">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input name="q" defaultValue={q} placeholder="Cari pesanan" className="pl-9" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              name="payment_status"
              defaultValue={payment_status}
              className="h-10 rounded-md border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
            >
              <option value="all">Semua pembayaran</option>
              <option value="unpaid">Belum bayar</option>
              <option value="submitted">Bukti masuk</option>
              <option value="verified">Terverifikasi</option>
              <option value="rejected">Ditolak</option>
              <option value="expired">Kedaluwarsa</option>
            </select>

            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-md border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
            >
              <option value="all">Semua pesanan</option>
              <option value="new">Baru</option>
              <option value="processing">Diproses</option>
              <option value="shipped">Dikirim</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>

            <Button type="submit" className="h-10">
              Filter
            </Button>
          </div>
        </form>

        <div className="mt-4">
          <div className="grid gap-2 rounded-lg border border-(--st-border) bg-[#F7F8FA] p-3 text-xs text-(--st-text-muted) md:grid-cols-3">
            <div>
              Total data: <span className="font-medium text-(--st-text)">{total}</span>
            </div>
            <div>
              Per halaman: <span className="font-medium text-(--st-text)">{result.pageSize}</span>
            </div>
            <div>
              Tips: gunakan filter untuk mempersempit hasil.
            </div>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-(--st-border)">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pesanan</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="w-40">Total</TableHead>
                <TableHead className="w-40">Pembayaran</TableHead>
                <TableHead className="w-35">Status</TableHead>
                <TableHead className="w-45">Dibuat</TableHead>
                <TableHead className="w-30">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-(--st-text-muted)">
                    Belum ada pesanan.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="font-medium">{o.order_number}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="mt-0.5 text-xs text-(--st-text-muted)">
                        {o.customer_email ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell>{formatIDR(o.total_amount)}</TableCell>
                    <TableCell>
                      <PaymentBadge status={o.payment_status} />
                    </TableCell>
                    <TableCell>
                      <OrderBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-(--st-text-muted)">
                      {formatDateTime(o.created_at)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/seller/orders/${o.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-(--st-text) underline-offset-4 hover:underline"
                      >
                        Kelola
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination
          className="mt-4"
          page={result.page}
          pageSize={result.pageSize}
          total={total}
          href={(p) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (payment_status && payment_status !== "all") params.set("payment_status", payment_status);
            if (status && status !== "all") params.set("status", status);
            params.set("page", String(p));
            params.set("pageSize", String(result.pageSize));
            return `/seller/orders?${params.toString()}`;
          }}
        />
      </section>
    </PageShell>
  );
}
