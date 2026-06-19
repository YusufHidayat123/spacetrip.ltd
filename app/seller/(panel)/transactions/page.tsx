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

  // This page is a convenience queue for manual payment reviews.
  const result = await adminListOrders({ payment_status: "submitted", q, page, pageSize });
  const orders = result.data;
  const total = result.count;

  return (
    <PageShell>
      <PageHeader
        title="Transaksi"
        badge={
          <Badge variant={total > 0 ? "amber" : "neutral"}>
            {total} perlu review
          </Badge>
        }
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "transaksi" },
            ]}
          />
        }
        right={
          <Button asChild variant="outline">
            <Link href="/seller/orders?payment_status=submitted">
              Buka view Pesanan
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <section className="mt-6 rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-90">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input name="q" defaultValue={q} placeholder="Cari" className="pl-9" />
          </div>
          <Button type="submit" className="h-10">
            Cari
          </Button>
        </form>

        <div className="mt-5 overflow-hidden rounded-lg border border-(--st-border)">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pesanan</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead className="w-40">Total</TableHead>
                <TableHead className="w-45">Dibuat</TableHead>
                <TableHead className="w-35">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-sm text-(--st-text-muted)"
                  >
                    Belum ada bukti pembayaran yang perlu direview.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.order_number}</TableCell>
                    <TableCell>
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="mt-0.5 text-xs text-(--st-text-muted)">
                        {o.customer_email ?? "—"}
                      </div>
                    </TableCell>
                    <TableCell>{formatIDR(o.total_amount)}</TableCell>
                    <TableCell className="text-(--st-text-muted)">
                      {formatDateTime(o.created_at)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/seller/orders/${o.id}`}
                        className="text-sm font-medium text-(--st-text) underline-offset-4 hover:underline"
                      >
                        Review
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
            params.set("page", String(p));
            params.set("pageSize", String(result.pageSize));
            return `/seller/transactions?${params.toString()}`;
          }}
        />

        <p className="mt-3 text-xs text-(--st-text-muted)">
          Halaman ini opsional. Workflow utama tetap ada di detail Pesanan.
        </p>
      </section>
    </PageShell>
  );
}
