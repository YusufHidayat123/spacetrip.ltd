export const dynamic = "force-dynamic";

import Image from "next/image";
import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/form/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminGetOrder, adminSignPaymentProofUrl, adminUpdateOrder } from "@/lib/orders/admin";
import { formatDateTime, formatIDR } from "@/lib/orders/format";
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

    // If verified, move fulfillment to processing (if still new)
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
        title="Manage Order"
        badge={
          <div className="flex items-center gap-2">
            <PaymentBadge status={order.payment_status} />
            <OrderBadge status={order.status} />
          </div>
        }
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "seller", href: "/seller" },
              { label: "order", href: "/seller/orders" },
              { label: order.order_number },
            ]}
          />
        }
      />

      <div className="mt-6 grid gap-6">
        {/* Proofs first (so admin can review quickly) */}
        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-(--st-text)">
                Payment proof
              </div>
              <div className="mt-1 text-xs text-(--st-text-muted)">
                Manual review for QRIS payments.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <form action={verifyPaymentAction}>
                <SubmitButton
                  pendingText="Verifying..."
                  disabled={signedProofs.length === 0}
                >
                  Verify payment
                </SubmitButton>
              </form>

              <form action={rejectPaymentAction} className="flex items-center gap-2">
                <Input
                  name="reject_note"
                  placeholder="Reject reason (optional)"
                  className="h-10 w-60"
                />
                <SubmitButton
                  pendingText="Rejecting..."
                  variant="outline"
                  disabled={signedProofs.length === 0}
                >
                  Reject
                </SubmitButton>
              </form>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {signedProofs.length === 0 ? (
              <div className="text-sm text-(--st-text-muted)">
                No proof submitted yet.
              </div>
            ) : (
              signedProofs.map((p) => (
                <div
                  key={p.id}
                  className="w-[220px] overflow-hidden rounded-xl border border-(--st-border) bg-white"
                >
                  <div className="relative aspect-[4/3] bg-[#F7F8FA]">
                    <Image
                      src={p.signed_url}
                      alt={p.original_name ?? "payment proof"}
                      fill
                      sizes="220px"
                      className="object-contain"
                    />
                  </div>
                  <div className="p-3">
                    <div className="truncate text-xs font-medium text-(--st-text)">
                      {p.original_name ?? "proof"}
                    </div>
                    <div className="mt-1 text-[11px] text-(--st-text-muted)">
                      {formatDateTime(p.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 rounded-lg border border-(--st-border) bg-[#F7F8FA] p-4 text-sm">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div>
                <div className="text-xs font-medium text-(--st-text-muted)">
                  Order total
                </div>
                <div className="mt-1 font-semibold text-(--st-text)">
                  {formatIDR(order.total_amount)}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-(--st-text-muted)">
                  Payment status
                </div>
                <div className="mt-1">
                  <PaymentBadge status={order.payment_status} />
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-(--st-text-muted)">
                  Pay by
                </div>
                <div className="mt-1 text-sm text-(--st-text)">
                  {order.pay_by ? formatDateTime(order.pay_by) : "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Order details */}
        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-(--st-text)">
                Order details
              </div>
              <div className="mt-1 text-xs text-(--st-text-muted)">
                Update fulfillment and payment status in one place.
              </div>
            </div>
            <div className="text-right text-xs text-(--st-text-muted)">
              Created: {formatDateTime(order.created_at)}
            </div>
          </div>

          <form action={updateOrderAction} className="mt-5 grid gap-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-(--st-border) p-4">
                <div className="text-xs font-medium text-(--st-text-muted)">
                  Customer
                </div>
                <div className="mt-2 text-sm font-semibold text-(--st-text)">
                  {order.customer_name}
                </div>
                <div className="mt-1 text-sm text-(--st-text-muted)">
                  {order.customer_email ?? "—"}
                </div>
                <div className="mt-1 text-sm text-(--st-text-muted)">
                  {order.customer_phone ?? "—"}
                </div>
              </div>

              <div className="rounded-lg border border-(--st-border) p-4">
                <div className="text-xs font-medium text-(--st-text-muted)">
                  Shipping
                </div>
                <div className="mt-2 text-sm text-(--st-text)">
                  {order.shipping_address?.line1 ?? "—"}
                </div>
                <div className="mt-1 text-sm text-(--st-text-muted)">
                  {(order.shipping_address?.city ?? "") +
                    (order.shipping_address?.province
                      ? `, ${order.shipping_address.province}`
                      : "")}
                </div>
                <div className="mt-1 text-sm text-(--st-text-muted)">
                  {order.shipping_address?.postal_code ?? ""}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-(--st-text)">
                  Payment status
                </label>
                <select
                  name="payment_status"
                  defaultValue={order.payment_status}
                  className="h-10 rounded-md border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
                >
                  <option value="unpaid">unpaid</option>
                  <option value="submitted">submitted</option>
                  <option value="verified">verified</option>
                  <option value="rejected">rejected</option>
                  <option value="expired">expired</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-(--st-text)">
                  Order status
                </label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="h-10 rounded-md border border-(--st-border) bg-white px-3 text-sm text-(--st-text) focus:outline-none focus:ring-2 focus:ring-(--st-accent) focus:ring-offset-2 focus:ring-offset-white"
                >
                  <option value="new">new</option>
                  <option value="processing">processing</option>
                  <option value="shipped">shipped</option>
                  <option value="completed">completed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>

              <div className="md:col-span-2 grid gap-2">
                <label className="text-sm font-medium text-(--st-text)">
                  Admin note
                </label>
                <Textarea
                  name="admin_note"
                  defaultValue={order.admin_note ?? ""}
                  placeholder="Internal notes (optional)"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-(--st-border)">
              <table className="w-full text-sm">
                <thead className="border-b border-(--st-border)">
                  <tr className="text-xs font-medium text-(--st-text-muted)">
                    <th className="px-4 py-3 text-left">Product</th>
                    <th className="px-4 py-3 text-left">Variant</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr
                      key={it.id}
                      className="border-b border-(--st-border) last:border-0"
                    >
                      <td className="px-4 py-3 font-medium">{it.product_name}</td>
                      <td className="px-4 py-3 text-(--st-text-muted)">
                        {it.variant_label}
                      </td>
                      <td className="px-4 py-3 text-right">{it.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        {formatIDR(it.price_at_purchase)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end">
              <SubmitButton pendingText="Saving...">Save changes</SubmitButton>
            </div>
          </form>
        </section>
      </div>
    </PageShell>
  );
}
