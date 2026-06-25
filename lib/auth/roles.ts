import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "customer" | "seller" | "admin";
export type StaffRole = Extract<AppRole, "seller" | "admin">;

export const ROLE_LABELS: Record<AppRole, string> = {
  customer: "Customer",
  seller: "Karyawan",
  admin: "Super Admin",
};

export function normalizeRole(role: unknown): AppRole {
  return role === "admin" || role === "seller" || role === "customer"
    ? role
    : "customer";
}

export function canAccessSellerPanel(role: AppRole) {
  return role === "admin" || role === "seller";
}

export function isSuperAdmin(role: AppRole) {
  return role === "admin";
}

export async function getCurrentUserRole(): Promise<{
  userId: string;
  role: AppRole;
} | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    role: normalizeRole(profile?.role),
  };
}

export async function requireSellerPanelRole() {
  const session = await getCurrentUserRole();

  if (!session) {
    redirect(`/seller/login?next=${encodeURIComponent("/seller")}`);
  }

  if (!canAccessSellerPanel(session.role)) {
    redirect("/seller/login?reason=forbidden");
  }

  return session;
}

export async function requireSuperAdmin() {
  const session = await getCurrentUserRole();

  if (!session) {
    redirect(`/seller/login?next=${encodeURIComponent("/seller")}`);
  }

  if (!isSuperAdmin(session.role)) {
    redirect("/seller?reason=super-admin-required");
  }

  return session;
}
