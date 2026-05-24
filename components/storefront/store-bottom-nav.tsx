"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Home, Search, ReceiptText, User } from "lucide-react";

type Item = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const items: Item[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/products", label: "Koleksi", icon: Search },
  { href: "/orders", label: "Orders", icon: ReceiptText },
  { href: "/profile", label: "Profil", icon: User },
];

export function StoreBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-[max(0px,env(safe-area-inset-bottom))] left-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 border-t border-(--st-border) bg-white/90 backdrop-blur sm:rounded-b-[32px]">
      <div className="grid grid-cols-4">
        {items.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname?.startsWith(it.href);
          const Icon = it.icon;

          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 text-xs",
                active ? "text-(--st-text)" : "text-(--st-text-muted)"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5", active ? "text-(--st-text)" : "text-(--st-text-muted)")} />
              <span className="sr-only sm:not-sr-only">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
