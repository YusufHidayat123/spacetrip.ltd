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
import { adminListOrders } from "@/lib/orders/admin";
import type { OrderStatus, PaymentStatus } from "@/lib/orders/types";

function PaymentBadge({ status }: { status: PaymentStatus }) {
  if (status === "verified") return <Badge variant="green">verified</Badge>;
  if (status === "submitted") return <Badge variant="amber">submitted</Badge>;
  if (status === "rejected") return <Badge variant="red">rejected</Badge>;
  if (status === "expired") return <Badge variant="red">expired</Badge>;
  return <Badge variant="neutral">unpaid</Badge>;
}

function OrderBadge({ status }: { status: OrderStatus }) {
  if (status === "shipped") return <Badge variant="purple">shipped</Badge>;
  if (status === "completed") return <Badge variant="green">completed</Badge>;
  if (status === "cancelled") return <Badge variant="red">cancelled</Badge>;
  if (status === "processing") return <Badge>processing</Badge>;
  return <Badge>new</Badge>;
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

  const orders = await adminListOrders({ q, payment_status, status });

  return (
    <PageShell>
      <PageHeader
        title="Order"
        breadcrumb={
          <Breadcrumb
            items={[{ label: "seller", href: "/seller" }, { label: "order" }]}
          />
        }
        right={
          <Button asChild variant="outline">
            <Link href="/orders/new">Create test order</Link>
          </Button>
        }
      />

      <section className="mt-6 rounded-xl border border-[color:var(--st-border)] bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--st-text-muted)]" />
            <Input name="q" defaultValue={q} placeholder="Search orders" className="pl-9" />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              name="payment_status"
              defaultValue={payment_status}
              className="h-10 rounded-md border border-[color:var(--st-border)] bg-white px-3 text-sm text-[color:var(--st-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--st-accent)] focus:ring-offset-2 focus:ring-offset-white"
            >
              <option value="all">All payments</option>
              <option value="unpaid">Unpaid</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>

            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-md border border-[color:var(--st-border)] bg-white px-3 text-sm text-[color:var(--st-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--st-accent)] focus:ring-offset-2 focus:ring-offset-white"
            >
              <option value="all">All orders</option>
              <option value="new">New</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <Button type="submit" className="h-10">
              Filter
            </Button>
          </div>
        </form>

        <div className="mt-5 overflow-hidden rounded-lg border border-[color:var(--st-border)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="w-[160px]">Total</TableHead>
                <TableHead className="w-[160px]">Payment</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="w-[180px]">Created</TableHead>
                <TableHead className="w-[120px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-[color:var(--st-text-muted)]">
                    No orders.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="font-medium">{o.order_number}</div>
                      <div className="mt-0.5 text-xs text-[color:var(--st-text-muted)]">
                        {o.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="mt-0.5 text-xs text-[color:var(--st-text-muted)]">
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
                    <TableCell className="text-[color:var(--st-text-muted)]">
                      {formatDateTime(o.created_at)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/seller/orders/${o.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--st-text)] underline-offset-4 hover:underline"
                      >
                        Manage
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="mt-3 text-xs text-[color:var(--st-text-muted)]">
          Tip: filter payment = <span className="font-medium text-[color:var(--st-text)]">submitted</span> to review new payment proofs.
        </p>
      </section>
    </PageShell>
  );
}
