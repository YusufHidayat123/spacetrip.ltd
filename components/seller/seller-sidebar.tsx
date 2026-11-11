"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  ExternalLink,
  LayoutGrid,
  LogOut,
  Menu,
  QrCode,
  Search,
  Settings,
  Shapes,
  ShoppingBag,
  UsersRound,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AppRole = "customer" | "seller" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  accent?: boolean;
};

type SidebarCounts = {
  totalOrders: number;
  newOrders: number;
  paymentToReview: number;
};

function getNavItems(counts: SidebarCounts, role: AppRole): NavItem[] {
  const items: NavItem[] = [
    { label: "Overview", href: "/seller", icon: LayoutGrid },
    {
      label: "Pesanan",
      href: "/seller/orders",
      icon: ClipboardList,
      badge: counts.newOrders > 0 ? String(counts.newOrders) : undefined,
    },
    {
      label: "Verifikasi QRIS",
      href: "/seller/transactions",
      icon: QrCode,
      badge: counts.paymentToReview > 0 ? String(counts.paymentToReview) : undefined,
      accent: counts.paymentToReview > 0,
    },
    { label: "Katalog Produk", href: "/seller/products", icon: ShoppingBag },
    { label: "Kategori", href: "/seller/categories", icon: Shapes },
  ];

  if (role === "admin") {
    items.push(
      { label: "Pengaturan & QRIS", href: "/seller/settings", icon: Settings },
      { label: "Kelola Tim", href: "/seller/staff", icon: UsersRound }
    );
  }

  return items;
}

export function SellerSidebar({
  counts,
  role,
}: {
  counts: SidebarCounts;
  role: AppRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = React.useState<string>("staff@spacetrip.id");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchQ, setSearchQ] = React.useState("");

  React.useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    (async () => {
      const { data } = await supabase.auth.getUser();
      const e = data.user?.email;
      if (e) setEmail(e);
    })();
  }, []);

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/seller/login";
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQ.trim();
    router.push(q ? `/seller/products?q=${encodeURIComponent(q)}` : "/seller/products");
    setMobileOpen(false);
  }

  const initial = (email?.[0] ?? "S").toUpperCase();
  const navItems = getNavItems(counts, role);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0D0D0D] text-white">
      {/* Brand Block */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center justify-between">
          <Link href="/seller" className="block">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tighter text-white">
                spacetrip<span className="text-[#FF5500]">.</span>
              </span>
              <span
                aria-hidden="true"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
              >
                &#10035;
              </span>
            </div>
            <div className="mt-1 font-mono-label text-[10px] uppercase tracking-[0.14em] text-white/50">
              [{role === "admin" ? "Super Admin Studio" : "Seller Studio"}]
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="mt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/45" />
            <input
              aria-label="Cari produk"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Cari produk di katalog..."
              className="h-9 w-full rounded-full border border-white/15 bg-white/8 pl-9 pr-3 text-xs text-white placeholder:text-white/45 focus:border-[#FF5500] focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="px-3 pb-2 font-mono-label text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
          [Workspace]
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/seller" ? pathname === item.href : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-white text-[#0D0D0D]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    active ? "text-[#FF5500]" : "text-white/60"
                  )}
                />
                <span className="flex-1 tracking-wide">{item.label}</span>
                {item.badge ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 font-mono-label text-[10px] font-semibold",
                      active
                        ? "bg-[#0D0D0D] text-white"
                        : item.accent
                          ? "bg-[#FF5500] text-white"
                          : "bg-white/15 text-white"
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <Link
            href="/"
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <span>Lihat Storefront Publik</span>
            <ExternalLink className="h-3.5 w-3.5 text-[#FF5500]" />
          </Link>
        </div>
      </nav>

      {/* Account Footer */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/6 px-3.5 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF5500] text-xs font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold text-white">
              {role === "admin" ? "Super Admin" : "Karyawan"}
            </div>
            <div className="truncate font-mono-label text-[10px] text-white/50">{email}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/15 hover:text-white"
            aria-label="Keluar"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-68 border-r border-white/10 lg:block">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Sticky Bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/10 bg-[#0D0D0D] px-4 text-white lg:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Buka menu navigasi admin"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white"
          >
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/seller" className="font-display text-base font-bold tracking-tighter">
            spacetrip<span className="text-[#FF5500]">.</span>{" "}
            <span className="font-mono-label text-[10px] font-medium uppercase tracking-[0.12em] text-white/60">
              ops
            </span>
          </Link>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 font-mono-label text-[10px] uppercase tracking-[0.1em] text-white/80 hover:border-[#FF5500] hover:text-[#FF5500]"
        >
          <span>Storefront</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute bottom-0 left-0 top-0 w-72 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
