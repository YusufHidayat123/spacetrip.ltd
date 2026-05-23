export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Button } from "@/components/ui/button";
import { PaymentProofForm } from "./_components/payment-proof-form";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { uploadPaymentProofMvp } from "@/lib/orders/public";
import { formatDateTime, formatIDR } from "@/lib/orders/format";

export default async function OrderDetailMvpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createSupabaseAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });
  if (itemsError) throw itemsError;

  async function uploadProofAction(formData: FormData) {
    "use server";

    const file = formData.get("proof") as File | null;
    if (!file || file.size === 0) throw new Error("Please select an image.");

    // Basic server-side guard (still MVP)
    const maxBytes = 18 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error("File is too large. Please upload a smaller image.");
    }

    await uploadPaymentProofMvp({ orderId: id, file });
    redirect(`/orders/${id}`);
  }

  return (
    <PageShell>
      <PageHeader
        title="Order"
        breadcrumb={
          <Breadcrumb
            items={[{ label: "home", href: "/" }, { label: "orders" }, { label: order.order_number }]}
          />
        }
        right={
          <Button asChild variant="outline">
            <Link href={`/seller/orders/${id}`}>Open in Admin</Link>
          </Button>
        }
      />

      <div className="mt-6 grid gap-6">
        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-(--st-text-muted)">
                Order number
              </div>
              <div className="mt-1 text-lg font-semibold text-(--st-text)">
                {order.order_number}
              </div>
              <div className="mt-1 text-sm text-(--st-text-muted)">
                Created: {formatDateTime(order.created_at)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-(--st-text-muted)">
                Total
              </div>
              <div className="mt-1 text-lg font-semibold text-(--st-text)">
                {formatIDR(order.total_amount)}
              </div>
              <div className="mt-1 text-sm text-(--st-text-muted)">
                Payment status: {order.payment_status}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-(--st-text)">
              Items
            </div>
            <div className="mt-3 overflow-hidden rounded-lg border border-(--st-border)">
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
                  {(items ?? []).map((it: {
                    id: string;
                    product_name: string;
                    variant_label: string;
                    quantity: number;
                    price_at_purchase: string;
                  }) => (
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
          </div>
        </section>

        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="text-sm font-semibold text-(--st-text)">
            Payment (Manual QRIS)
          </div>
          <div className="mt-1 text-sm text-(--st-text-muted)">
            Pay using the store QRIS, then upload your payment proof screenshot.
          </div>

          <div className="mt-4 rounded-lg border border-(--st-border) bg-[#F7F8FA] p-4 text-sm text-(--st-text)">
            <div className="font-medium">Instructions</div>
            <ol className="mt-2 list-decimal space-y-1 pl-4 text-(--st-text-muted)">
              <li>Open your e-wallet/banking app.</li>
              <li>Scan the store QRIS.</li>
              <li>Pay exactly: {formatIDR(order.total_amount)}.</li>
              <li>Take a screenshot, then upload it below.</li>
            </ol>
          </div>

          <div className="mt-5">
            <PaymentProofForm action={uploadProofAction} />
          </div>
        </section>
      </div>

      <p className="mt-4 text-xs text-(--st-text-muted)">
        MVP test page only.
      </p>
    </PageShell>
  );
}
