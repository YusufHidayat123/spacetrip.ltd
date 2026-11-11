export const dynamic = "force-dynamic";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Package, Wallet } from "lucide-react";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MiniLineChart } from "@/components/seller/charts/mini-line-chart";
import { adminGetDashboardOverview } from "@/lib/dashboard/admin";
import { formatDateTime, formatIDR } from "@/lib/orders/format";
import { getPublicProductImageUrl } from "@/lib/catalog/public";

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  right,
  highlight,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ElementType;
  right?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 transition ${
        highlight
          ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
          : "border-(--st-border) bg-white text-(--st-text)"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div
            className={`flex items-center gap-1.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] ${
              highlight ? "text-white/60" : "text-(--st-text-muted)"
            }`}
          >
            {Icon ? (
              <Icon
                className={`h-3.5 w-3.5 ${highlight ? "text-[#FF5500]" : "text-[#FF5500]"}`}
              />
            ) : null}
            <span>[{label}]</span>
          </div>
          <div className="mt-2.5 font-display text-2xl font-medium tracking-tight sm:text-3xl">
            {value}
          </div>
          {hint ? (
            <div
              className={`mt-1.5 text-xs ${
                highlight ? "text-white/70" : "text-(--st-text-muted)"
              }`}
            >
              {hint}
            </div>
          ) : null}
        </div>
        {right ? <div className="w-24 shrink-0">{right}</div> : null}
      </div>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  if (status === "verified") return <Badge variant="green">terverifikasi</Badge>;
  if (status === "submitted") return <Badge variant="amber">perlu review</Badge>;
  if (status === "rejected") return <Badge variant="red">ditolak</Badge>;
  if (status === "expired") return <Badge variant="red">kedaluwarsa</Badge>;
  return <Badge variant="neutral">belum bayar</Badge>;
}

function OrderBadge({ status }: { status: string }) {
  if (status === "shipped") return <Badge variant="purple">dikirim</Badge>;
  if (status === "completed") return <Badge variant="green">selesai</Badge>;
  if (status === "cancelled") return <Badge variant="red">dibatalkan</Badge>;
  if (status === "processing") return <Badge variant="dark">diproses</Badge>;
  return <Badge>baru</Badge>;
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
    const mm = Number(iso.split("-")[1] ?? "0");
    const names = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];
    return names[mm - 1] ?? iso;
  }

  function dayLabel(iso: string) {
    const parts = iso.split("-");
    const mm = parts[1] ?? "";
    const dd = parts[2] ?? "";
    return dd && mm ? `${dd}/${mm}` : iso;
  }

  const salesModeLabel =
    salesMode === "verified"
      ? "Pembayaran terverifikasi"
      : salesMode === "completed"
        ? "Pesanan selesai"
        : "Semua pesanan";

  function buildHref(next: { view?: string; salesMode?: string }) {
    const params = new URLSearchParams();
    params.set("view", next.view ?? view);
    params.set("salesMode", next.salesMode ?? salesMode);
    return `/seller?${params.toString()}`;
  }

  return (
    <PageShell>
      <PageHeader
        title="Operations Overview"
        description="Ringkasan performa penjualan, antrian verifikasi QRIS, dan status inventaris SpaceTrip."
        breadcrumb={<Breadcrumb items={[{ label: "admin", href: "/seller" }, { label: "overview" }]} />}
        right={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/seller/products/new"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-(--st-border) bg-white px-4 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-(--st-text) transition hover:border-[#0D0D0D]"
            >
              + Tambah Produk
            </Link>
            <Link
              href="/seller/orders"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0D0D0D] px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#FF5500]"
            >
              <span>Kelola Pesanan</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        }
      />

      {/* Primary KPI Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          highlight
          icon={Wallet}
          label="Pendapatan Terverifikasi"
          value={formatIDR(String(data.counts.verifiedRevenue))}
          hint={`${salesSum} order (${view === "day" ? "30 hari" : "12 bulan"})`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Verifikasi QRIS"
          value={String(data.counts.needReview)}
          hint={
            data.counts.needReview > 0
              ? "Bukti pembayaran menunggu review"
              : "Semua bukti telah ditinjau"
          }
          right={<MiniLineChart values={salesSeries} />}
        />
        <StatCard
          icon={Package}
          label="Total Pesanan"
          value={String(data.counts.totalOrders)}
          hint={`${data.counts.newOrders} pesanan baru masuk`}
        />
        <StatCard
          icon={AlertTriangle}
          label="Katalog & Stok"
          value={String(data.counts.activeProducts)}
          hint={`${data.counts.lowStockCount} item stok menipis (<= 2)`}
        />
      </div>

      {/* Main Content Split */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* Sales Volume Bar Chart */}
        <section className="min-w-0 rounded-3xl border border-(--st-border) bg-white p-6 lg:col-span-8">
          <div className="flex flex-col justify-between gap-4 border-b border-(--st-border) pb-4 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-lg font-medium tracking-tight text-[#0D0D0D]">
                Grafik Penjualan
              </h2>
              <div className="mt-1 text-xs text-(--st-text-muted)">
                Periode:{" "}
                <strong className="text-[#0D0D0D]">
                  {view === "day" ? "Harian (30 Hari)" : "Bulanan (12 Bulan)"}
                </strong>{" "}
                &middot; Filter: <strong className="text-[#0D0D0D]">{salesModeLabel}</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-(--st-border) bg-(--st-bg) p-0.5">
                <Link
                  href={buildHref({ view: "month" })}
                  className={`rounded-full px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                    view === "month"
                      ? "bg-[#0D0D0D] text-white"
                      : "text-(--st-text-muted) hover:text-[#0D0D0D]"
                  }`}
                >
                  Bulanan
                </Link>
                <Link
                  href={buildHref({ view: "day" })}
                  className={`rounded-full px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                    view === "day"
                      ? "bg-[#0D0D0D] text-white"
                      : "text-(--st-text-muted) hover:text-[#0D0D0D]"
                  }`}
                >
                  Harian
                </Link>
              </div>

              <div className="inline-flex rounded-full border border-(--st-border) bg-(--st-bg) p-0.5">
                <Link
                  href={buildHref({ salesMode: "verified" })}
                  className={`rounded-full px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                    salesMode === "verified"
                      ? "bg-[#FF5500] text-white"
                      : "text-(--st-text-muted) hover:text-[#0D0D0D]"
                  }`}
                >
                  Verified
                </Link>
                <Link
                  href={buildHref({ salesMode: "completed" })}
                  className={`rounded-full px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                    salesMode === "completed"
                      ? "bg-[#FF5500] text-white"
                      : "text-(--st-text-muted) hover:text-[#0D0D0D]"
                  }`}
                >
                  Selesai
                </Link>
                <Link
                  href={buildHref({ salesMode: "all" })}
                  className={`rounded-full px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                    salesMode === "all"
                      ? "bg-[#FF5500] text-white"
                      : "text-(--st-text-muted) hover:text-[#0D0D0D]"
                  }`}
                >
                  Semua
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-(--st-border) bg-(--st-bg) p-5">
            <div className="flex items-center justify-between text-xs text-(--st-text-muted)">
              <span className="font-mono-label text-[10px] uppercase tracking-[0.12em]">
                {view === "day" ? "[Order Per Hari]" : "[Order Per Bulan]"}
              </span>
              <span>
                Total: <strong className="text-[#0D0D0D]">{salesSum}</strong>
              </span>
            </div>

            <div className="no-scrollbar mt-6 overflow-x-auto">
              <div className="flex items-end gap-2 pb-1">
                {series.map((m) => {
                  const max = Math.max(...salesSeries, 1);
                  const h = Math.round((m.sales / max) * 110);
                  const label = "day" in m ? dayLabel(m.day) : monthLabel(m.month);
                  const fullKey = "day" in m ? m.day : m.month;
                  const colClass = view === "day" ? "w-9" : "w-11";

                  return (
                    <div
                      key={fullKey}
                      className={`shrink-0 ${colClass}`}
                      title={`${fullKey}: ${m.sales} penjualan`}
                    >
                      <div className="mb-1 text-center font-mono-label text-[9px] text-(--st-text-muted)">
                        {m.sales > 0 ? m.sales : ""}
                      </div>
                      <div
                        className={`w-full rounded-t-lg transition-all ${
                          m.sales > 0 ? "bg-[#0D0D0D] hover:bg-[#FF5500]" : "bg-[#DFDFDA]"
                        }`}
                        style={{ height: `${Math.max(4, h)}px` }}
                      />
                      <div className="mt-2 whitespace-nowrap text-center font-mono-label text-[10px] text-(--st-text-muted)">
                        {label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Right: Inventory Spotlight & Alerts */}
        <section className="min-w-0 space-y-6 lg:col-span-4">
          <div className="rounded-3xl border border-(--st-border) bg-white p-6">
            <div className="flex items-center justify-between border-b border-(--st-border) pb-3">
              <div>
                <h2 className="font-display text-base font-medium tracking-tight text-[#0D0D0D]">
                  Stok Terbanyak
                </h2>
                <p className="text-[11px] text-(--st-text-muted)">Top 5 item aktif di gudang</p>
              </div>
              <Link
                href="/seller/products"
                className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FF5500] hover:underline"
              >
                Semua
              </Link>
            </div>

            <div className="mt-4 divide-y divide-(--st-border)">
              {data.topProductsByStock.length === 0 ? (
                <div className="py-4 text-xs text-(--st-text-muted)">Belum ada data produk.</div>
              ) : (
                data.topProductsByStock.map((p) => {
                  const imgUrl = p.image ? getPublicProductImageUrl(p.image.storage_path) : null;
                  return (
                    <Link
                      key={p.id}
                      href={`/seller/products/${p.id}`}
                      className="group flex items-center gap-3 rounded-xl px-1.5 py-2.5 transition hover:bg-(--st-bg)"
                    >
                      <div className="clip-chamfer-diagonal-sm relative h-11 w-9 shrink-0 overflow-hidden rounded-lg bg-(--st-surface-alt)">
                        {imgUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imgUrl}
                            alt={p.image?.alt ?? p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium text-[#0D0D0D] group-hover:text-[#FF5500]">
                          {p.name}
                        </div>
                        <div className="font-mono-label text-[10px] text-(--st-text-muted)">
                          Stok: {p.totalStock} pcs
                        </div>
                      </div>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-(--st-text-muted) group-hover:text-[#FF5500]" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {data.lowStockProducts.length > 0 ? (
            <div className="rounded-3xl border border-(--st-border) bg-white p-6">
              <div className="border-b border-(--st-border) pb-3">
                <h2 className="font-display text-base font-medium tracking-tight text-[#0D0D0D]">
                  Alert Stok Menipis
                </h2>
                <p className="text-[11px] text-(--st-text-muted)">
                  Item dengan total stok &le; 2 pcs
                </p>
              </div>
              <div className="mt-3 divide-y divide-(--st-border)">
                {data.lowStockProducts.map((p) => (
                  <Link
                    key={p.id}
                    href={`/seller/products/${p.id}`}
                    className="flex items-center justify-between gap-2 py-2.5 text-xs hover:text-[#FF5500]"
                  >
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="shrink-0 rounded-full bg-(--st-accent-soft) px-2.5 py-0.5 font-mono-label text-[10px] font-semibold text-[#CC4400]">
                      {p.totalStock} pcs
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>

      {/* Recent Orders Table */}
      <section className="mt-6 overflow-hidden rounded-3xl border border-(--st-border) bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--st-border) px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-medium tracking-tight text-[#0D0D0D]">
              Pesanan Terbaru
            </h2>
            <p className="text-xs text-(--st-text-muted)">6 transaksi terakhir dari customer</p>
          </div>
          <Link
            href="/seller/orders"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-(--st-border) bg-white px-4 font-mono-label text-[10px] font-semibold uppercase tracking-[0.1em] text-[#0D0D0D] transition hover:border-[#FF5500] hover:text-[#FF5500]"
          >
            <span>Semua Pesanan</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No. Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Pembayaran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead className="w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-xs text-(--st-text-muted)">
                  Belum ada pesanan masuk.
                </TableCell>
              </TableRow>
            ) : (
              data.recentOrders.map(
                (o: {
                  id: string;
                  order_number: string;
                  created_at: string;
                  total_amount: string;
                  payment_status: string;
                  status: string;
                  customer_name: string;
                }) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono-label text-xs font-semibold">
                      {o.order_number}
                    </TableCell>
                    <TableCell className="text-xs text-(--st-text)">{o.customer_name}</TableCell>
                    <TableCell>
                      <PaymentBadge status={o.payment_status} />
                    </TableCell>
                    <TableCell>
                      <OrderBadge status={o.status} />
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
                        Kelola
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      </section>
    </PageShell>
  );
}
