import type React from "react";

import { StoreBottomNav } from "@/components/storefront/store-bottom-nav";

export function MobileShell({
  children,
  hideBottomNav,
}: {
  children: React.ReactNode;
  hideBottomNav?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-[#EAE8E3] px-0 py-0 sm:px-6 sm:py-8">
      <div className="relative mx-auto min-h-dvh w-full max-w-[420px] overflow-hidden bg-(--st-bg) sm:min-h-[calc(100dvh-64px)] sm:rounded-[32px] sm:border sm:border-(--st-border) sm:bg-white sm:shadow-[0_16px_48px_rgba(17,24,39,0.12)]">
        <div className={hideBottomNav ? "" : "pb-[calc(76px+env(safe-area-inset-bottom))]"}>{children}</div>
        {hideBottomNav ? null : <StoreBottomNav />}
      </div>
    </div>
  );
}
