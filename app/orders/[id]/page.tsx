export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { Badge } from "@/components/ui/badge";
import { PaymentProofForm } from "./_components/payment-proof-form";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStoreSettingsForCheckout } from "@/lib/settings/public";
import { formatDateTime, formatIDR } from "@/lib/orders/format";

function isSupabaseNoRowsError(e: unknown): e is { code: string } {
  return typeof e === "object" && e !== null && "code" in e && (e as { code?: unknown }).code === "PGRST116";
}

function PaymentBadge({ status }: { status: string }) {
  if (status === "verified") return <Badge variant="green">Terverifikasi</Badge>;
  if (status === "submitted") return <Badge variant="amber">Menunggu cek</Badge>;
  if (status === "rejected") return <Badge variant="red">Ditolak</Badge>;
  if (status === "expired") return <Badge variant="red">Kedaluwarsa</Badge>;
  return <Badge variant="neutral">Belum bayar</Badge>;
}

function OrderBadge({ status }: { status: string }) {
  if (status === "processing") return <Badge>Diproses</Badge>;
  if (status === "shipped") return <Badge variant="purple">Dikirim</Badge>;
  if (status === "completed") return <Badge variant="green">Selesai</Badge>;
  if (status === "cancelled") return <Badge variant="red">Dibatalkan</Badge>;
  return <Badge>Baru</Badge>;
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

  // Orders are login-only.
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

    // Ensure order belongs to user (avoid orphan uploads).
    const { error: ownErr } = await supabase
      .from("orders")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    if (ownErr) throw new Error("Order tidak ditemukan");

    const file = formData.get("proof") as File | null;
    if (!file || file.size === 0) throw new Error("Pilih gambar bukti bayar dulu.");

    // Basic server-side guard
    const maxBytes = 18 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error("File terlalu besar. Upload gambar yang lebih kecil.");
    }

    // Upload to Storage using service role (bucket is recommended private).
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

    // Insert proof + mark payment submitted using auth-aware RPC.
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
      <StoreHeader title="Pembayaran" backHref="/orders" />

      <main className="px-5 pb-6">
        <section className="mt-4 rounded-[24px] border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-medium text-(--st-text-muted)">Order</div>
              <div className="mt-1 text-base font-semibold tracking-tight text-(--st-text)">
                {order.order_number}
              </div>
              <div className="mt-1 text-xs text-(--st-text-muted)">
                Dibuat: {formatDateTime(order.created_at)}
              </div>
              {order.pay_by ? (
                <div className="mt-1 text-xs text-(--st-text-muted)">Batas bayar: {formatDateTime(order.pay_by)}</div>
              ) : null}
            </div>

            <div className="text-right">
              <div className="text-xs font-medium text-(--st-text-muted)">Total</div>
              <div className="mt-1 text-base font-semibold tracking-tight text-(--st-text)">
                {formatIDR(order.total_amount)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <PaymentBadge status={order.payment_status} />
            <OrderBadge status={order.status} />
          </div>

          <div className="mt-5">
            <div className="text-sm font-semibold text-(--st-text)">Ringkasan item</div>
            <div className="mt-3 grid gap-2">
              {(items ?? []).map((it: {
                id: string;
                product_name: string;
                variant_label: string;
                quantity: number;
              }) => (
                <div
                  key={it.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-(--st-border) bg-[#F7F8FA] px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-(--st-text)">{it.product_name}</div>
                    <div className="mt-0.5 text-xs text-(--st-text-muted)">{it.variant_label}</div>
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-(--st-text)">x{it.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[24px] border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
          <div className="text-sm font-semibold text-(--st-text)">Bayar via QRIS</div>
          <div className="mt-1 text-sm text-(--st-text-muted)">
            Scan QRIS toko, bayar sesuai total, lalu upload bukti bayar.
          </div>

          {settings.qris_image_url ? (
            <div className="mt-4 overflow-hidden rounded-2xl border border-(--st-border) bg-white">
              <div className="relative aspect-square bg-[#F7F8FA]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.qris_image_url}
                  alt={`QRIS ${settings.store_name}`}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-(--st-border) bg-[#F7F8FA] p-4 text-sm text-(--st-text-muted)">
              QRIS belum tersedia. Silakan hubungi admin toko.
            </div>
          )}

          {settings.payment_instructions ? (
            <div className="mt-4 rounded-2xl border border-(--st-border) bg-[#F7F8FA] p-4 text-sm text-(--st-text)">
              <div className="font-medium">Instruksi</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-(--st-text-muted)">
                {settings.payment_instructions}
              </div>
            </div>
          ) : null}

          <div className="mt-5">
            <PaymentProofForm action={uploadProofAction} />
          </div>

          {(proofs ?? []).length > 0 ? (
            <div className="mt-5">
              <div className="text-sm font-semibold text-(--st-text)">Riwayat bukti bayar</div>
              <div className="mt-3 grid gap-2">
                {(proofs ?? []).map((p: { id: string; original_name: string | null; created_at: string }) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-(--st-border) bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium text-(--st-text)">
                        {p.original_name ?? "bukti-bayar"}
                      </div>
                      <div className="mt-1 text-[11px] text-(--st-text-muted)">
                        {formatDateTime(p.created_at)}
                      </div>
                    </div>
                    <div className="shrink-0 text-[11px] text-(--st-text-muted)">Terkirim</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-4 text-[11px] text-(--st-text-muted)">
            Verifikasi dilakukan manual. Setelah pembayaran diverifikasi, order akan diproses.
          </div>
        </section>
      </main>
    </MobileShell>
  );
}
