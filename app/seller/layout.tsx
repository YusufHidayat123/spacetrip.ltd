import type { Metadata } from "next";

import { SellerSidebar } from "@/components/seller/seller-sidebar";
import { adminGetSidebarCounts } from "@/lib/dashboard/sidebar";

// Sidebar badges should always reflect real DB state (new orders, payments to review).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Spacetrip Admin",
};

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
