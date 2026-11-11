"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Heart, ReceiptText, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";

type Item = {
  href: string;
  label: string;
  icon: React.ElementType;
  badgeCount?: number;
};

export function StoreBottomNav() {
  const pathname = usePathname();
  const { wishlistIds } = useCart();

  const items: Item[] = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Archive", icon: Search },
    {
      href: "/wishlist",
      label: "Saved",
      icon: Heart,
      badgeCount: wishlistIds.length,
    },
    { href: "/orders", label: "Orders", icon: ReceiptText },
    { href: "/profile", label: "Account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-(--st-border) bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname?.startsWith(it.href);
          const Icon = it.icon;

          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 py-2.5 transition-colors",
                active ? "text-[#FF5500]" : "text-(--st-text-muted)"
              )}
              aria-current={active ? "page" : undefined}
            >
              {active ? (
                <span className="absolute top-0 h-[2.5px] w-7 rounded-full bg-[#FF5500]" />
              ) : null}
              <div className="relative">
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "stroke-[2.2]" : "stroke-[1.75]"
                  )}
                />
                {it.badgeCount && it.badgeCount > 0 ? (
                  <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#FF5500] px-1 text-[8px] font-bold text-white">
                    {it.badgeCount}
                  </span>
                ) : null}
              </div>
              <span className="font-mono-label text-[10px] font-medium">
                {it.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
