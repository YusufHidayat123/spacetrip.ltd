import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function createOrderMvp(input: {
  customer_name: string;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address: {
    line1: string;
    city: string;
    province: string;
    postal_code: string;
  };
  items: { variant_id: string; quantity: number }[];
}) {
  const supabase = createSupabaseAdminClient();

  // Atomic stock decrement + order creation is handled in SQL (RPC).
  // IMPORTANT: apply `supabase/orders.sql` to your Supabase DB to create the function.
  const { data, error } = await supabase.rpc("create_order_with_stock", {
    _customer_name: input.customer_name,
    _customer_email: input.customer_email ?? null,
    _customer_phone: input.customer_phone ?? null,
    _shipping_address: input.shipping_address,
    _items: input.items,
  });

  if (error) throw error;

  const row = (data as unknown as { order_id: string; order_number: string }[] | null)?.[0];
  if (!row?.order_id || !row.order_number) {
    throw new Error("Failed to create order");
  }

  return { orderId: row.order_id, orderNumber: row.order_number };
}

function normalizePhone(s: string) {
  // Keep digits only for a rough match.
  return s.replace(/\D/g, "");
}

export async function findOrderForTracking(input: {
  order_number: string;
  customer_email?: string | null;
  customer_phone?: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, customer_email, customer_phone")
    .eq("order_number", input.order_number)
    .single();

  if (error) throw new Error("Order not found");

  const email = (input.customer_email ?? "").trim().toLowerCase();
  const phone = normalizePhone((input.customer_phone ?? "").trim());

  const storedEmail = String((order as { customer_email: string | null }).customer_email ?? "")
    .trim()
    .toLowerCase();
  const storedPhone = normalizePhone(String((order as { customer_phone: string | null }).customer_phone ?? ""));

  const emailMatches = email.length > 0 && storedEmail.length > 0 && email === storedEmail;
  const phoneMatches = phone.length > 0 && storedPhone.length > 0 && phone === storedPhone;

  if (!emailMatches && !phoneMatches) {
    throw new Error("Order not found");
  }

  return (order as { id: string }).id;
}

export async function uploadPaymentProofMvp({
  orderId,
  file,
}: {
  orderId: string;
  file: File;
}) {
  const supabase = createSupabaseAdminClient();
  const bucket = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET || "payment-proofs";

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const fileName = `${crypto.randomUUID()}.${safeExt}`;
  const storagePath = `${orderId}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type || `image/${safeExt}`,
      upsert: false,
      cacheControl: "3600",
    });

  if (uploadError) throw uploadError;

  const { error: proofError } = await supabase.from("order_payment_proofs").insert({
    order_id: orderId,
    storage_path: storagePath,
    original_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
  });

  if (proofError) throw proofError;

  // Mark payment as submitted
  const { error: orderError } = await supabase
    .from("orders")
    .update({ payment_status: "submitted" })
    .eq("id", orderId);

  if (orderError) throw orderError;

  return { storagePath };
}
