import type { Metadata } from "next";

import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { adminGetSidebarCounts } from "@/lib/dashboard/sidebar";
import { requireSellerPanelRole } from "@/lib/auth/roles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "SpaceTrip Operations | Admin",
};

export default async function SellerPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = await requireSellerPanelRole();
  const counts = await adminGetSidebarCounts();

  return (
    <div className="min-h-screen overflow-x-clip bg-(--st-bg)">
      <SellerSidebar counts={counts} role={role} />
      <div className="min-w-0 lg:pl-68">
        <main className="min-h-screen min-w-0">{children}</main>
      </div>
    </div>
  );
}
