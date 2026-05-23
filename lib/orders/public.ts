import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function makeOrderNumber() {
  // e.g. ST-20260522-483921
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ST-${yyyy}${mm}${dd}-${rand}`;
}

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

  // Fetch item info (price/product name) from DB
  const variantIds = input.items.map((i) => i.variant_id);

  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id,size_label,product_id,products(id,name,price)")
    .in("id", variantIds);

  if (variantsError) throw variantsError;

  const variantMap = new Map<string, any>();
  for (const v of variants ?? []) variantMap.set(v.id, v);

  let total = 0;
  const enriched = input.items.map((i) => {
    const v = variantMap.get(i.variant_id);
    if (!v) throw new Error("Invalid variant_id");

    const price = Number(v.products.price);
    total += price * i.quantity;

    return {
      variant_id: i.variant_id,
      product_id: v.product_id,
      product_name: v.products.name,
      variant_label: v.size_label,
      quantity: i.quantity,
      price_at_purchase: price,
    };
  });

  const orderNumber = makeOrderNumber();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "new",
      payment_status: "unpaid",
      total_amount: total,
      currency: "IDR",
      customer_name: input.customer_name,
      customer_email: input.customer_email ?? null,
      customer_phone: input.customer_phone ?? null,
      shipping_address: input.shipping_address,
      pay_by: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("*")
    .single();

  if (orderError) throw orderError;

  const orderId = order.id;

  const { error: itemsError } = await supabase.from("order_items").insert(
    enriched.map((it) => ({
      order_id: orderId,
      product_id: it.product_id,
      variant_id: it.variant_id,
      product_name: it.product_name,
      variant_label: it.variant_label,
      quantity: it.quantity,
      price_at_purchase: it.price_at_purchase,
    }))
  );

  if (itemsError) throw itemsError;

  return { orderId, orderNumber };
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
