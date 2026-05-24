import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { adminGetSidebarCounts } from "@/lib/dashboard/sidebar";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Sidebar badges should always reflect real DB state (new orders, payments to review).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Spacetrip Admin",
};

export default async function SellerPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: middleware should already protect `/seller/*`,
  // but keep a server-side guard so service-role queries aren't reachable publicly.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/seller/login?next=${encodeURIComponent("/seller")}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = String(profile?.role ?? "customer");
  if (role !== "seller" && role !== "admin") {
    redirect("/seller/login?reason=forbidden");
  }

  const counts = await adminGetSidebarCounts();

  return (
    <div className="min-h-screen bg-(--st-bg)">
      <SellerSidebar counts={counts} />
      <div className="pl-[272px]">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
