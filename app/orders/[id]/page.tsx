export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Clock, QrCode, Receipt } from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStoreSettingsForCheckout } from "@/lib/settings/public";
import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatIDR } from "@/lib/orders/format";
import { PaymentProofForm } from "./_components/payment-proof-form";

function isSupabaseNoRowsError(e: unknown): e is { code: string } {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: unknown }).code === "PGRST116"
  );
}

function PaymentBadge({ status }: { status: string }) {
  if (status === "verified") return <Badge variant="green">TERVERIFIKASI</Badge>;
  if (status === "submitted") return <Badge variant="amber">MENUNGGU CEK</Badge>;
  if (status === "rejected") return <Badge variant="red">DITOLAK</Badge>;
  if (status === "expired") return <Badge variant="red">KEDALUWARSA</Badge>;
  return <Badge variant="neutral">BELUM BAYAR</Badge>;
}

function OrderBadge({ status }: { status: string }) {
  if (status === "processing") return <Badge variant="dark">DIPROSES</Badge>;
  if (status === "shipped") return <Badge variant="purple">DIKIRIM</Badge>;
  if (status === "completed") return <Badge variant="green">SELESAI</Badge>;
  if (status === "cancelled") return <Badge variant="red">DIBATALKAN</Badge>;
  return <Badge>BARU</Badge>;
}

export default async function OrderDetailMvpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
  }

  const [settings, orderRes, itemsRes, proofsRes] = await Promise.all([
    getStoreSettingsForCheckout(),
    supabase.from("orders").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("order_payment_proofs")
      .select("id,original_name,created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const { data: order, error: orderError } = orderRes;
  if (orderError) {
    if (isSupabaseNoRowsError(orderError)) notFound();
    throw orderError;
  }

  const { data: items, error: itemsError } = itemsRes;
  if (itemsError) throw itemsError;

  const { data: proofs, error: proofsError } = proofsRes;
  if (proofsError) throw proofsError;

  async function uploadProofAction(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/login?next=${encodeURIComponent(`/orders/${id}`)}`);
    }

    const { error: ownErr } = await supabase
      .from("orders")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (ownErr) throw new Error("Order tidak ditemukan");

    const file = formData.get("proof") as File | null;
    if (!file || file.size === 0) throw new Error("Pilih gambar bukti bayar dulu.");

    const maxBytes = 18 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error("File terlalu besar. Upload gambar yang lebih kecil.");
    }

    const admin = createSupabaseAdminClient();
    const bucket = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET || "payment-proofs";

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const fileName = `${crypto.randomUUID()}.${safeExt}`;
    const storagePath = `${id}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage
      .from(bucket)
      .upload(storagePath, arrayBuffer, {
        contentType: file.type || `image/${safeExt}`,
        upsert: false,
        cacheControl: "3600",
      });

    if (uploadError) throw uploadError;

    const { error: rpcError } = await supabase.rpc("submit_payment_proof_auth", {
      _order_id: id,
      _storage_path: storagePath,
      _original_name: file.name,
      _mime_type: file.type,
      _size_bytes: file.size,
    });

    if (rpcError) throw rpcError;

    redirect(`/orders/${id}`);
  }

  return (
    <MobileShell>
      <StoreHeader title="Invoice" backHref="/orders" />

      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:py-12">
        {/* Header Bar */}
        <div className="flex flex-col justify-between gap-4 border-b border-(--st-border) pb-6 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
              >
                &#10035;
              </span>
              <span className="font-mono-label text-[11px] font-medium uppercase tracking-[0.14em] text-(--st-text-muted)">
                [Order Invoice]
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-[#0D0D0D] sm:text-4xl">
              {order.order_number}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-(--st-text-muted)">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#FF5500]" />
                Dibuat: {formatDateTime(order.created_at)}
              </span>
              {order.pay_by ? <span>· Batas bayar: {formatDateTime(order.pay_by)}</span> : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PaymentBadge status={order.payment_status} />
            <OrderBadge status={order.status} />
          </div>
        </div>

        {/* Two-Column Detail + QRIS Payment */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left: Summary & Items */}
          <section className="space-y-6 lg:col-span-7">
            <div className="rounded-3xl border border-(--st-border) bg-white p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-(--st-border) pb-4">
                <div className="flex items-center gap-2.5">
                  <Receipt className="h-4 w-4 text-[#FF5500]" />
                  <h2 className="font-display text-base font-medium tracking-tight text-[#0D0D0D]">
                    Ringkasan Item
                  </h2>
                </div>
                <span className="font-display text-xl font-semibold tracking-tight text-[#0D0D0D]">
                  {formatIDR(order.total_amount)}
                </span>
              </div>

              <div className="mt-4 divide-y divide-(--st-border)">
                {(items ?? []).map(
                  (it: {
                    id: string;
                    product_name: string;
                    variant_label: string;
                    quantity: number;
                    price_at_purchase?: string;
                  }) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-4 py-3.5"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-[#0D0D0D]">
                          {it.product_name}
                        </div>
                        <div className="mt-0.5 font-mono-label text-[11px] uppercase text-(--st-text-muted)">
                          Size: {it.variant_label}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono-label text-xs font-semibold text-[#0D0D0D]">
                          x{it.quantity}
                        </div>
                        {it.price_at_purchase ? (
                          <div className="text-xs text-(--st-text-muted)">
                            {formatIDR(it.price_at_purchase)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {(proofs ?? []).length > 0 ? (
              <div className="rounded-3xl border border-(--st-border) bg-white p-6 sm:p-8">
                <div className="flex items-center gap-2.5 border-b border-(--st-border) pb-4">
                  <CheckCircle2 className="h-4 w-4 text-[#FF5500]" />
                  <h2 className="font-display text-base font-medium tracking-tight text-[#0D0D0D]">
                    Riwayat Bukti Transfer Terkirim
                  </h2>
                </div>
                <div className="mt-4 divide-y divide-(--st-border)">
                  {(proofs ?? []).map(
                    (p: {
                      id: string;
                      original_name: string | null;
                      created_at: string;
                    }) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 py-3 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium text-[#0D0D0D]">
                            {p.original_name ?? "bukti-bayar"}
                          </div>
                          <div className="mt-0.5 text-(--st-text-muted)">
                            {formatDateTime(p.created_at)}
                          </div>
                        </div>
                        <span className="rounded-full bg-(--st-accent-soft) px-3 py-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.1em] text-[#CC4400]">
                          Terkirim
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : null}
          </section>

          {/* Right: QRIS & Proof Upload */}
          <section className="lg:col-span-5">
            <div className="rounded-3xl border border-(--st-border) bg-white p-6 sm:p-8">
              <div className="flex items-center gap-2.5 border-b border-(--st-border) pb-4">
                <QrCode className="h-4 w-4 text-[#FF5500]" />
                <h2 className="font-display text-base font-medium tracking-tight text-[#0D0D0D]">
                  Pembayaran QRIS
                </h2>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-(--st-text-muted)">
                Scan kode QRIS di bawah, transfer tepat sebesar{" "}
                <strong className="text-[#0D0D0D]">{formatIDR(order.total_amount)}</strong>, lalu
                unggah bukti screenshot pembayaranmu.
              </p>

              {settings.qris_image_url ? (
                <div className="mt-5 rounded-2xl border border-(--st-border) bg-(--st-bg) p-4">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.qris_image_url}
                      alt={`QRIS ${settings.store_name}`}
                      className="h-full w-full object-contain p-3"
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-(--st-border) bg-(--st-bg) p-5 text-xs text-(--st-text-muted)">
                  QRIS toko belum dikonfigurasi oleh admin. Silakan hubungi tim SpaceTrip untuk
                  konfirmasi rekening tujuan.
                </div>
              )}

              {settings.payment_instructions ? (
                <div className="mt-4 rounded-2xl border border-(--st-border) bg-(--st-bg) p-4 text-xs">
                  <div className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0D0D0D]">
                    [Instruksi Pembayaran]
                  </div>
                  <div className="mt-1.5 whitespace-pre-wrap leading-relaxed text-(--st-text-muted)">
                    {settings.payment_instructions}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 border-t border-(--st-border) pt-5">
                <PaymentProofForm action={uploadProofAction} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </MobileShell>
  );
}
