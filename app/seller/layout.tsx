import type { Metadata } from "next";

import { SellerSidebar } from "@/components/seller/seller-sidebar";

export const metadata: Metadata = {
  title: "Spacetrip Admin",
};

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[color:var(--st-bg)]">
      <SellerSidebar />
      <div className="pl-[272px]">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
