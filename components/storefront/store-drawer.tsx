"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Heart, ReceiptText, Search, User, X } from "lucide-react";

export type DrawerCategorySummary = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

const defaultShopLinks = [
  { href: "/products", label: "all archive", sub: "Semua kurasi aktif" },
  { href: "/products?gender=men", label: "men", sub: "Workwear, Boxy Tees, Denim" },
  { href: "/products?gender=women", label: "women", sub: "Baby Tees, Knitwear, Cargo" },
  { href: "/products?gender=unisex", label: "unisex", sub: "Hoodies, Outerwear, Essentials" },
  { href: "/products?gender=accessories", label: "accessories", sub: "Caps, Slings & Utility" },
  { href: "/products?maxPrice=100000", label: "under 100k", sub: "Pilihan hemat berkualitas" },
];

const accountLinks = [
  { href: "/products", label: "Jelajahi Archive", icon: Search },
  { href: "/wishlist", label: "Saved Wishlist", icon: Heart },
  { href: "/orders", label: "Pesanan Saya", icon: ReceiptText },
  { href: "/profile", label: "Akun & Pengiriman", icon: User },
];

export function StoreDrawer({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories?: DrawerCategorySummary[];
}) {
  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[70] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs"
            onClick={onClose}
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="absolute bottom-0 left-0 top-0 flex w-[340px] max-w-[90vw] flex-col bg-(--st-bg) shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-(--st-border) px-6 py-5">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-tighter text-(--st-text)">
                  spacetrip.
                </span>
                <span className="font-mono-label text-[10px] font-medium text-[#FF5500]">
                  &#10035;
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text) transition hover:border-[#0D0D0D]"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="flex items-center justify-between font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
                <span>[Departments]</span>
                <span>2026 Drop</span>
              </div>

              <nav className="mt-3 divide-y divide-(--st-border)">
                {defaultShopLinks.map((it) => (
                  <Link
                    key={it.href}
                    href={it.href}
                    onClick={onClose}
                    className="group flex items-center justify-between py-3.5 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-display text-2xl font-medium tracking-tight text-(--st-text) group-hover:text-[#FF5500]">
                        <span>{it.label}</span>
                      </div>
                      {it.sub ? (
                        <div className="mt-0.5 text-xs text-(--st-text-muted)">{it.sub}</div>
                      ) : null}
                    </div>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text) transition group-hover:border-[#FF5500] group-hover:bg-[#FF5500] group-hover:text-white">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </nav>

              {/* Dynamic Categories from Supabase */}
              {categories && categories.length > 0 ? (
                <div className="mt-7">
                  <div className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
                    [By Category]
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${encodeURIComponent(cat.slug)}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-1.5 rounded-full border border-(--st-border) bg-white px-3 py-1.5 text-xs font-medium text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]"
                      >
                        <span>{cat.name}</span>
                        <span className="font-mono-label text-[10px] text-(--st-text-muted)">
                          ({cat.productCount})
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-8 font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
                [Client Care]
              </div>
              <nav className="mt-3 grid gap-1.5">
                {accountLinks.map((it) => {
                  const Icon = it.icon;
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-(--st-text) transition hover:bg-white"
                    >
                      <Icon className="h-4 w-4 text-[#FF5500]" />
                      <span>{it.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-(--st-border) bg-white px-6 py-4 text-[11px] text-(--st-text-muted)">
              <div className="font-medium text-(--st-text)">info@spacetrip.id</div>
              <div className="mt-0.5">+62 812-8490-2026 · Jakarta &amp; Bandung Archive</div>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
