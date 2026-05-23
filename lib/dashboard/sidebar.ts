import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function adminGetSidebarCounts() {
  // Ensure sidebar badges always use real-time DB counts.
  noStore();

  const supabase = createSupabaseAdminClient();

  const [newOrdersRes, submittedPaymentsRes, totalOrdersRes] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("payment_status", "submitted"),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);

  if (newOrdersRes.error) throw newOrdersRes.error;
  if (submittedPaymentsRes.error) throw submittedPaymentsRes.error;
  if (totalOrdersRes.error) throw totalOrdersRes.error;

  return {
    totalOrders: totalOrdersRes.count ?? 0,
    newOrders: newOrdersRes.count ?? 0,
    paymentToReview: submittedPaymentsRes.count ?? 0,
  };
}
