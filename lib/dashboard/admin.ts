import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d: Date) {
  const x = startOfDay(d);
  x.setDate(1);
  return x;
}

function isoMonth(d: Date) {
  // YYYY-MM (local)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function isoDay(d: Date) {
  // YYYY-MM-DD (local)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export type SalesMode = "verified" | "all" | "completed";

export async function adminGetSidebarCounts() {
  const supabase = createSupabaseAdminClient();

  const [newOrdersRes, needReviewRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "submitted"),
  ]);

  if (newOrdersRes.error) throw newOrdersRes.error;
  if (needReviewRes.error) throw needReviewRes.error;

  return {
    newOrders: newOrdersRes.count ?? 0,
    paymentToReview: needReviewRes.count ?? 0,
  };
}

export async function adminGetDashboardOverview(params?: { salesMode?: SalesMode }) {
  const supabase = createSupabaseAdminClient();

  // Counts
  const [totalOrdersRes, newOrdersRes, needReviewRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "submitted"),
  ]);

  if (totalOrdersRes.error) throw totalOrdersRes.error;
  if (newOrdersRes.error) throw newOrdersRes.error;
  if (needReviewRes.error) throw needReviewRes.error;

  const [activeProductsRes] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  if (activeProductsRes.error) throw activeProductsRes.error;

  const totalOrders = totalOrdersRes.count ?? 0;
  const newOrders = newOrdersRes.count ?? 0;
  const needReview = needReviewRes.count ?? 0;
  const activeProducts = activeProductsRes.count ?? 0;

  // Revenue + orders by day (last 14 days)
  const now = new Date();

  const salesMode: SalesMode = params?.salesMode ?? "verified";

  // Monthly sales - last 12 months
  const start12m = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 11, 1));

  // Daily sales - last 30 days
  const start30d = startOfDay(new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000));

  let monthQuery = supabase
    .from("orders")
    .select("id,created_at,payment_status,status")
    .gte("created_at", start12m.toISOString())
    .order("created_at", { ascending: true });

  let dayQuery = supabase
    .from("orders")
    .select("id,created_at,payment_status,status")
    .gte("created_at", start30d.toISOString())
    .order("created_at", { ascending: true });

  if (salesMode === "verified") {
    monthQuery = monthQuery.eq("payment_status", "verified");
    dayQuery = dayQuery.eq("payment_status", "verified");
  } else if (salesMode === "completed") {
    monthQuery = monthQuery.eq("status", "completed");
    dayQuery = dayQuery.eq("status", "completed");
  }

  const [{ data: salesMonthRows, error: salesMonthErr }, { data: salesDayRows, error: salesDayErr }, { data: recentOrders, error: recentErr }, { data: variantRows, error: variantsErr }] =
    await Promise.all([
      monthQuery,
      dayQuery,
      supabase
        .from("orders")
        .select("id,order_number,created_at,total_amount,payment_status,status,customer_name")
        .order("created_at", { ascending: false })
        .limit(6),
      // Build product stock leaderboard from variants (active products only)
      supabase
        .from("product_variants")
        .select(
          "id,stock,is_active,products!inner(id,name,slug,status,product_images(id,storage_path,alt,sort_order))"
        )
        .eq("is_active", true)
        .eq("products.status", "active"),
    ]);

  if (salesMonthErr) throw salesMonthErr;
  if (salesDayErr) throw salesDayErr;
  if (recentErr) throw recentErr;
  if (variantsErr) throw variantsErr;

  const months: { month: string; sales: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(start12m.getFullYear(), start12m.getMonth() + i, 1);
    months.push({ month: isoMonth(d), sales: 0 });
  }
  const monthIndex = new Map(months.map((m, idx) => [m.month, idx] as const));

  for (const r of salesMonthRows ?? []) {
    const key = isoMonth(new Date((r as { created_at: string }).created_at));
    const idx = monthIndex.get(key);
    if (idx === undefined) continue;
    months[idx].sales += 1;
  }

  const days: { day: string; sales: number }[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(start30d.getTime() + i * 24 * 60 * 60 * 1000);
    days.push({ day: isoDay(d), sales: 0 });
  }
  const dayIndex = new Map(days.map((x, idx) => [x.day, idx] as const));

  for (const r of salesDayRows ?? []) {
    const key = isoDay(new Date((r as { created_at: string }).created_at));
    const idx = dayIndex.get(key);
    if (idx === undefined) continue;
    days[idx].sales += 1;
  }

  type VariantWithProduct = {
    id: string;
    stock: number;
    is_active: boolean;
    products: {
      id: string;
      name: string;
      slug: string;
      status: string;
      product_images: { id: string; storage_path: string; alt: string | null; sort_order: number }[];
    };
  };

  const byProduct = new Map<
    string,
    {
      id: string;
      name: string;
      slug: string;
      totalStock: number;
      image: { storage_path: string; alt: string | null } | null;
    }
  >();

  for (const row of (variantRows as unknown as VariantWithProduct[]) ?? []) {
    const p = row.products;
    const existing = byProduct.get(p.id);
    const primary = (p.product_images ?? []).slice().sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0] ?? null;

    if (!existing) {
      byProduct.set(p.id, {
        id: p.id,
        name: p.name,
        slug: p.slug,
        totalStock: Number(row.stock) || 0,
        image: primary ? { storage_path: primary.storage_path, alt: primary.alt } : null,
      });
    } else {
      existing.totalStock += Number(row.stock) || 0;
      if (!existing.image && primary) {
        existing.image = { storage_path: primary.storage_path, alt: primary.alt };
      }
    }
  }

  const topProductsByStock = Array.from(byProduct.values())
    .sort((a, b) => b.totalStock - a.totalStock)
    .slice(0, 5);

  return {
    counts: {
      totalOrders,
      newOrders,
      needReview,
      activeProducts,
    },
    salesMode,
    salesByMonth12m: months,
    salesByDay30d: days,
    topProductsByStock,
    recentOrders: recentOrders ?? [],
  };
}
