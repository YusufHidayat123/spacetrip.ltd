export const dynamic = "force-dynamic";

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

import { MiniLineChart } from "@/components/seller/charts/mini-line-chart";
import { adminGetDashboardOverview } from "@/lib/dashboard/admin";
import { formatDateTime, formatIDR } from "@/lib/orders/format";
import { getPublicProductImageUrl } from "@/lib/catalog/public";

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  right?: React.ReactNode;
};

function StatCard({ label, value, hint, right }: StatCardProps) {
  return (
    <div className="rounded-xl border border-(--st-border) bg-white p-5 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-(--st-text-muted)">
            {label}
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-(--st-text)">
            {value}
          </div>
          {hint ? (
            <div className="mt-1 text-xs text-(--st-text-muted)">
              {hint}
            </div>
          ) : null}
        </div>
        {right ? <div className="w-[120px]">{right}</div> : null}
      </div>
    </div>
  );
}

export default async function SellerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const view = typeof sp.view === "string" ? sp.view : "month";
  const salesMode = (typeof sp.salesMode === "string" ? sp.salesMode : "verified") as
    | "verified"
    | "all"
    | "completed";

  const data = await adminGetDashboardOverview({ salesMode });

  const series = view === "day" ? data.salesByDay30d : data.salesByMonth12m;
  const salesSeries = series.map((m) => m.sales);
  const salesSum = salesSeries.reduce((s, x) => s + x, 0);

  function monthLabel(iso: string) {
    // iso: YYYY-MM
    const mm = Number(iso.split("-")[1] ?? "0");
    const names = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return names[mm - 1] ?? iso;
  }

  function dayLabel(iso: string) {
    // iso: YYYY-MM-DD -> show DD/MM
    const parts = iso.split("-");
    const mm = parts[1] ?? "";
    const dd = parts[2] ?? "";
    return dd && mm ? `${dd}/${mm}` : iso;
  }

  const salesModeLabel =
    salesMode === "verified"
      ? "Verified payments"
      : salesMode === "completed"
        ? "Completed orders"
        : "All orders";

  function buildHref(next: { view?: string; salesMode?: string }) {
    const params = new URLSearchParams();
    params.set("view", next.view ?? view);
    params.set("salesMode", next.salesMode ?? salesMode);
    return `/seller?${params.toString()}`;
  }

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        badge={<Badge>Overview</Badge>}
        breadcrumb={
          <Breadcrumb
            items={[{ label: "seller", href: "/seller" }, { label: "dashboard" }]}
          />
        }
        right={
          <Button asChild variant="outline">
            <Link href="/seller/orders">
              View Orders
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Orders (total)"
          value={String(data.counts.totalOrders)}
          hint={`${data.counts.newOrders} new`}
        />
        <StatCard
          label="Payment to review"
          value={String(data.counts.needReview)}
          hint="Submitted proofs"
        />
        <StatCard
          label={view === "day" ? "Sales (30d)" : "Sales (12m)"}
          value={String(salesSum)}
          hint={salesModeLabel}
          right={<MiniLineChart values={salesSeries} />}
        />
        <StatCard
          label="Active products"
          value={String(data.counts.activeProducts)}
          hint={`${data.topProductsByStock.length} shown`}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)] lg:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-sm font-semibold text-(--st-text)">
                Sales chart
              </div>
              <div className="mt-1 text-xs text-(--st-text-muted)">
                View: <span className="font-medium text-(--st-text)">{view === "day" ? "Daily (30d)" : "Monthly (12m)"}</span> · Mode: <span className="font-medium text-(--st-text)">{salesModeLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex overflow-hidden rounded-md border border-(--st-border)">
                <Link
                  href={buildHref({ view: "month" })}
                  className={
                    "px-3 py-1.5 text-xs font-medium " +
                    (view === "month"
                      ? "bg-(--st-accent-soft) text-(--st-text)"
                      : "bg-white text-(--st-text-muted) hover:bg-[#F7F8FA]")
                  }
                >
                  Monthly
                </Link>
                <Link
                  href={buildHref({ view: "day" })}
                  className={
                    "px-3 py-1.5 text-xs font-medium " +
                    (view === "day"
                      ? "bg-(--st-accent-soft) text-(--st-text)"
                      : "bg-white text-(--st-text-muted) hover:bg-[#F7F8FA]")
                  }
                >
                  Daily
                </Link>
              </div>

              <div className="inline-flex overflow-hidden rounded-md border border-(--st-border)">
                <Link
                  href={buildHref({ salesMode: "verified" })}
                  className={
                    "px-3 py-1.5 text-xs font-medium " +
                    (salesMode === "verified"
                      ? "bg-(--st-accent-soft) text-(--st-text)"
                      : "bg-white text-(--st-text-muted) hover:bg-[#F7F8FA]")
                  }
                >
                  Verified
                </Link>
                <Link
                  href={buildHref({ salesMode: "completed" })}
                  className={
                    "px-3 py-1.5 text-xs font-medium " +
                    (salesMode === "completed"
                      ? "bg-(--st-accent-soft) text-(--st-text)"
                      : "bg-white text-(--st-text-muted) hover:bg-[#F7F8FA]")
                  }
                >
                  Completed
                </Link>
                <Link
                  href={buildHref({ salesMode: "all" })}
                  className={
                    "px-3 py-1.5 text-xs font-medium " +
                    (salesMode === "all"
                      ? "bg-(--st-accent-soft) text-(--st-text)"
                      : "bg-white text-(--st-text-muted) hover:bg-[#F7F8FA]")
                  }
                >
                  All
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-(--st-border) bg-[#F7F8FA] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-xs font-medium text-(--st-text-muted)">
                {view === "day" ? "Sales per day" : "Sales per month"}
              </div>
              <div className="text-xs text-(--st-text-muted)">
                Total: <span className="font-medium text-(--st-text)">{salesSum}</span>
              </div>
            </div>

            {/* When there are many buckets (e.g. 30 days), allow horizontal scroll instead of overflowing */}
            <div className="mt-4 overflow-x-auto">
              <div className="flex items-end gap-2 pr-1">
                {(view === "day" ? data.salesByDay30d : data.salesByMonth12m).map((m) => {
                  const max = Math.max(...salesSeries, 1);
                  const h = Math.round((m.sales / max) * 72);
                  const label = "day" in m ? dayLabel(m.day) : monthLabel(m.month);
                  const fullKey = "day" in m ? m.day : m.month;
                  const colClass = view === "day" ? "w-10" : "w-12";

                  return (
                    <div key={fullKey} className={`shrink-0 ${colClass}`}
                      title={`${fullKey}: ${m.sales} sales`}
                    >
                      <div
                        className="w-full rounded-sm bg-(--st-text)/80"
                        style={{ height: `${Math.max(6, h)}px` }}
                      />
                      <div className="mt-2 text-center text-[10px] text-(--st-text-muted) whitespace-nowrap">
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-(--st-text)">
                Catalog (top stock)
              </div>
              <div className="mt-1 text-xs text-(--st-text-muted)">
                Top 5 products by total stock (active variants)
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="h-9">
              <Link href="/seller/products">Catalog</Link>
            </Button>
          </div>

          <div className="mt-4 grid gap-2">
            {data.topProductsByStock.length === 0 ? (
              <div className="text-sm text-(--st-text-muted)">No products found.</div>
            ) : (
              data.topProductsByStock.map((p) => {
                const imgUrl = p.image ? getPublicProductImageUrl(p.image.storage_path) : null;
                return (
                  <Link
                    key={p.id}
                    href={`/seller/products/${p.id}`}
                    className="flex items-center gap-3 rounded-lg border border-(--st-border) px-3 py-2 hover:bg-[#F7F8FA]"
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border border-(--st-border) bg-[#F7F8FA]">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={p.image?.alt ?? p.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-(--st-text)">
                        {p.name}
                      </div>
                      <div className="mt-0.5 text-xs text-(--st-text-muted)">
                        Stock: {p.totalStock}
                      </div>
                    </div>

                    <div className="text-xs font-medium text-(--st-text)">
                      View
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-(--st-border) bg-white shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
        <div className="flex items-center justify-between gap-4 border-b border-(--st-border) px-6 py-4">
          <div>
            <div className="text-sm font-semibold text-(--st-text)">
              Recent orders
            </div>
            <div className="mt-1 text-xs text-(--st-text-muted)">
              Last 6 orders created
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="h-9">
            <Link href="/seller/orders">View all</Link>
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="w-[160px]">Total</TableHead>
              <TableHead className="w-[180px]">Created</TableHead>
              <TableHead className="w-[120px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-(--st-text-muted)">
                  No orders yet.
                </TableCell>
              </TableRow>
            ) : (
              data.recentOrders.map((o: {
                id: string;
                order_number: string;
                created_at: string;
                total_amount: string;
                customer_name: string;
              }) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.order_number}</TableCell>
                  <TableCell className="text-(--st-text-muted)">
                    {o.customer_name}
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
                      Manage
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </PageShell>
  );
}
