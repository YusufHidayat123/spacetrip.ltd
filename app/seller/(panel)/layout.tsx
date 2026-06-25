import type { Metadata } from "next";

import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { adminGetSidebarCounts } from "@/lib/dashboard/sidebar";
import { requireSellerPanelRole } from "@/lib/auth/roles";

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
  const { role } = await requireSellerPanelRole();
  const counts = await adminGetSidebarCounts();

  return (
    <div className="min-h-screen bg-(--st-bg)">
      <SellerSidebar counts={counts} role={role} />
      <div className="pl-68">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
