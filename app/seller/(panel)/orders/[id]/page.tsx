export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/form/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminGetOrder,
  adminSignPaymentProofUrl,
  adminUpdateOrder,
} from "@/lib/orders/admin";
import { formatDateTime, formatIDR } from "@/lib/orders/format";
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

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { order, items, proofs } = await adminGetOrder(id);

  const signedProofs = await Promise.all(
    proofs.map(async (p) => ({
      ...p,
      signed_url: await adminSignPaymentProofUrl(p.storage_path),
    }))
  );

  async function updateOrderAction(formData: FormData) {
    "use server";

    const status = String(formData.get("status") ?? "") as OrderStatus;
    const payment_status = String(formData.get("payment_status") ?? "") as PaymentStatus;
    const admin_note = String(formData.get("admin_note") ?? "");

    await adminUpdateOrder(id, {
      status,
      payment_status,
      admin_note: admin_note.length ? admin_note : null,
    });

    redirect(`/seller/orders/${id}`);
  }

  async function verifyPaymentAction() {
    "use server";

    const nextStatus: OrderStatus = order.status === "new" ? "processing" : order.status;

    await adminUpdateOrder(id, {
      payment_status: "verified",
      status: nextStatus,
    });
    redirect(`/seller/orders/${id}`);
  }

  async function rejectPaymentAction(formData: FormData) {
    "use server";

    const note = String(formData.get("reject_note") ?? "");
    await adminUpdateOrder(id, {
      payment_status: "rejected",
      admin_note: note.length ? note : order.admin_note,
    });
    redirect(`/seller/orders/${id}`);
  }

  return (
    <PageShell>
      <PageHeader
        title={`Order ${order.order_number}`}
        badge={
          <div className="flex items-center gap-2">
            <PaymentBadge status={order.payment_status} />
            <OrderBadge status={order.status} />
          </div>
        }
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "pesanan", href: "/seller/orders" },
              { label: order.order_number },
            ]}
          />
        }
      />

      <div className="mt-6 grid gap-6">
        {/* Payment Proof Inspection */}
        <section className="rounded-3xl border border-(--st-border) bg-white p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-(--st-border) pb-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-lg font-medium tracking-tight text-[#0D0D0D]">
                Bukti Pembayaran QRIS
              </h2>
              <p className="mt-0.5 text-xs text-(--st-text-muted)">
                Periksa bukti pembayaran sebelum memindahkan pesanan ke proses packing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <form action={verifyPaymentAction}>
                <SubmitButton
                  pendingText="Memverifikasi..."
                  disabled={signedProofs.length === 0}
                  className="h-10 rounded-full bg-[#0D0D0D] px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#FF5500]"
                >
                  Verifikasi Pembayaran
                </SubmitButton>
              </form>

              <form action={rejectPaymentAction} className="flex flex-wrap items-center gap-2">
                <Input
                  name="reject_note"
                  placeholder="Alasan tolak (opsional)"
                  className="h-10 w-56 rounded-xl border-(--st-border) bg-(--st-bg) text-xs"
                />
                <SubmitButton
                  pendingText="Menolak..."
                  variant="outline"
                  disabled={signedProofs.length === 0}
                  className="h-10 rounded-full border-(--st-border)"
                >
                  Tolak
                </SubmitButton>
              </form>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            {signedProofs.length === 0 ? (
              <div className="text-xs text-(--st-text-muted)">
                Customer belum mengunggah bukti pembayaran.
              </div>
            ) : (
              signedProofs.map((p) => (
                <div
                  key={p.id}
                  className="w-60 overflow-hidden rounded-2xl border border-(--st-border) bg-white"
                >
                  <div className="relative aspect-[4/3] bg-(--st-bg)">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.signed_url}
                      alt={p.original_name ?? "bukti pembayaran"}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="border-t border-(--st-border) p-3">
                    <div className="truncate text-xs font-medium text-(--st-text)">
                      {p.original_name ?? "bukti pembayaran"}
                    </div>
                    <div className="mt-1 text-[11px] text-(--st-text-muted)">
                      {formatDateTime(p.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-(--st-border) bg-(--st-bg) p-4 text-xs sm:grid-cols-3">
            <div>
              <div className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                Total Tagihan
              </div>
              <div className="mt-1 font-display text-base font-semibold text-[#0D0D0D]">
                {formatIDR(order.total_amount)}
              </div>
            </div>
            <div>
              <div className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                Status Bayar
              </div>
              <div className="mt-1">
                <PaymentBadge status={order.payment_status} />
              </div>
            </div>
            <div>
              <div className="font-mono-label text-[10px] uppercase text-(--st-text-muted)">
                Batas Bayar
              </div>
              <div className="mt-1 font-medium text-(--st-text)">
                {order.pay_by ? formatDateTime(order.pay_by) : "—"}
              </div>
            </div>
          </div>
        </section>

        {/* Order & Shipping Management */}
        <section className="rounded-3xl border border-(--st-border) bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--st-border) pb-4">
            <div>
              <h2 className="font-display text-lg font-medium tracking-tight text-[#0D0D0D]">
                Detail Customer &amp; Pemenuhan
              </h2>
              <p className="mt-0.5 text-xs text-(--st-text-muted)">
                Dibuat: {formatDateTime(order.created_at)}
              </p>
            </div>
          </div>

          <form action={updateOrderAction} className="mt-5 grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-(--st-border) bg-(--st-bg) p-4">
                <div className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
                  [Pelanggan]
                </div>
                <div className="mt-2 text-sm font-semibold text-[#0D0D0D]">
                  {order.customer_name}
                </div>
                <div className="mt-1 text-xs text-(--st-text-muted)">
                  {order.customer_email ?? "—"}
                </div>
                <div className="mt-1 text-xs text-(--st-text-muted)">
                  {order.customer_phone ?? "—"}
                </div>
              </div>

              <div className="rounded-2xl border border-(--st-border) bg-(--st-bg) p-4">
                <div className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
                  [Alamat Pengiriman]
                </div>
                <div className="mt-2 text-xs font-medium text-[#0D0D0D]">
                  {order.shipping_address?.line1 ?? "—"}
                </div>
                <div className="mt-1 text-xs text-(--st-text-muted)">
                  {(order.shipping_address?.city ?? "") +
                    (order.shipping_address?.province ? `, ${order.shipping_address.province}` : "")}{" "}
                  {order.shipping_address?.postal_code ?? ""}
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                  Status Pembayaran
                </label>
                <select
                  name="payment_status"
                  defaultValue={order.payment_status}
                  className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-sm text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
                >
                  <option value="unpaid">Belum bayar</option>
                  <option value="submitted">Bukti masuk</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="rejected">Ditolak</option>
                  <option value="expired">Kedaluwarsa</option>
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                  Status Pesanan
                </label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-sm text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
                >
                  <option value="new">Baru</option>
                  <option value="processing">Diproses</option>
                  <option value="shipped">Dikirim</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>

              <div className="grid gap-1.5 md:col-span-2">
                <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                  Catatan Admin / Nomor Resi
                </label>
                <Textarea
                  name="admin_note"
                  defaultValue={order.admin_note ?? ""}
                  placeholder="Contoh: JNE Reguler JKT1234567890"
                  className="rounded-xl border-(--st-border) bg-(--st-bg)"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-(--st-border)">
              <table className="w-full text-sm">
                <thead className="border-b border-(--st-border) bg-(--st-bg)">
                  <tr className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
                    <th className="px-4 py-3 text-left">Produk</th>
                    <th className="px-4 py-3 text-left">Varian</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-(--st-border) last:border-0">
                      <td className="px-4 py-3 text-xs font-medium">{it.product_name}</td>
                      <td className="px-4 py-3 text-xs text-(--st-text-muted)">
                        {it.variant_label}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">{it.quantity}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold">
                        {formatIDR(it.price_at_purchase)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end">
              <SubmitButton
                pendingText="Menyimpan..."
                className="h-11 rounded-full bg-[#0D0D0D] px-6 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
              >
                Simpan Perubahan
              </SubmitButton>
            </div>
          </form>
        </section>
      </div>
    </PageShell>
  );
}
