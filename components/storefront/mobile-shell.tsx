import type React from "react";

import { EditorialFooter } from "@/components/storefront/editorial-footer";
import { StoreBottomNav } from "@/components/storefront/store-bottom-nav";

export function MobileShell({
  children,
  hideBottomNav,
  hideFooter,
}: {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-(--st-bg)">
      <div
        className={
          hideBottomNav
            ? "flex-1"
            : "flex-1 pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0"
        }
      >
        {children}
      </div>
      {hideFooter ? null : <EditorialFooter />}
      {hideBottomNav ? null : <StoreBottomNav />}
    </div>
  );
}
