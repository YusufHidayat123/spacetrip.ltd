"use client";

import Link from "next/link";

import { X, Home, Search, ReceiptText, User } from "lucide-react";

import { cn } from "@/lib/utils";

type DrawerItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const items: DrawerItem[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/products", label: "Koleksi", icon: Search },
  { href: "/orders", label: "Orders", icon: ReceiptText },
  { href: "/profile", label: "Profil", icon: User },
];

export function StoreDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] transition",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={open ? undefined : true}
    >
      {/* overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-black/30 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />

      {/* panel */}
      <aside
        className={cn(
          "absolute right-0 top-0 h-full w-[320px] max-w-[85vw] bg-white shadow-[0_24px_64px_rgba(17,24,39,0.25)] transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="flex items-center justify-between border-b border-(--st-border) px-5 py-4">
          <div className="text-sm font-semibold tracking-tight text-(--st-text)">
            spacetrip
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text)"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <Link
                key={it.href}
                href={it.href}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-(--st-text) hover:bg-[#F7F8FA]"
                onClick={onClose}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-(--st-border) bg-white">
                  <Icon className="h-5 w-5 text-(--st-text-muted)" />
                </span>
                <span className="flex-1">{it.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-(--st-border) p-5 text-xs text-(--st-text-muted)">
          Checkout QRIS manual · Upload bukti bayar setelah order
        </div>
      </aside>
    </div>
  );
}
