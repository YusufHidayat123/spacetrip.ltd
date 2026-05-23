import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Order, OrderItem, OrderPaymentProof, OrderStatus, PaymentStatus } from "./types";

export async function adminListOrders(params?: {
  q?: string;
  payment_status?: PaymentStatus | "all";
  status?: OrderStatus | "all";
  page?: number;
  pageSize?: number;
}) {
  const supabase = createSupabaseAdminClient();

  const pageSize = Math.min(Math.max(params?.pageSize ?? 20, 1), 100);
  const page = Math.max(params?.page ?? 1, 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Keep query simple; do filtering in SQL.
  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params?.payment_status && params.payment_status !== "all") {
    query = query.eq("payment_status", params.payment_status);
  }

  if (params?.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }

  if (params?.q && params.q.trim().length > 0) {
    const q = params.q.trim();
    // ILIKE across a couple of columns
    query = query.or(
      `order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%`
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as Order[],
    count: count ?? 0,
    page,
    pageSize,
  };
}

export async function adminGetOrder(orderId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (itemsError) throw itemsError;

  const { data: proofs, error: proofsError } = await supabase
    .from("order_payment_proofs")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });
  if (proofsError) throw proofsError;

  return {
    order: order as Order,
    items: (items ?? []) as OrderItem[],
    proofs: (proofs ?? []) as OrderPaymentProof[],
  };
}

export async function adminUpdateOrder(
  orderId: string,
  patch: Partial<Pick<Order, "status" | "payment_status" | "admin_note">>
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update(patch)
    .eq("id", orderId)
    .select("*")
    .single();
  if (error) throw error;
  return data as Order;
}

export async function adminSignPaymentProofUrl(storagePath: string) {
  const supabase = createSupabaseAdminClient();
  const bucket = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET || "payment-proofs";

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60 * 15);

  if (error) throw error;
  return data.signedUrl;
}
