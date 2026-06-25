"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutGrid,
  LogOut,
  Search,
  Settings,
  Shapes,
  ShoppingBag,
  ChevronDown,
  Rocket,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AppRole = "customer" | "seller" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

type SidebarCounts = {
  totalOrders: number;
  newOrders: number;
  paymentToReview: number;
};

function getNavItems(counts: SidebarCounts, role: AppRole): NavItem[] {
  const items: NavItem[] = [
    { label: "Dashboard", href: "/seller", icon: LayoutGrid },
    {
      label: "Pesanan",
      href: "/seller/orders",
      icon: ClipboardList,
      // Show new orders as a badge (most actionable)
      badge: counts.newOrders > 0 ? String(counts.newOrders) : undefined,
    },
    // {
    //   label: "Transaksi",
    //   href: "/seller/transactions",
    //   icon: BadgeDollarSign,
    //   // Since payments are manual, this is the closest signal we have.
    //   badge:
    //     counts.paymentToReview > 0
    //       ? String(counts.paymentToReview)
    //       : undefined,
    // },
    { label: "Katalog", href: "/seller/products", icon: ShoppingBag },
    { label: "Kategori", href: "/seller/categories", icon: Shapes },
  ];

  if (role === "admin") {
    items.push(
      { label: "Pengaturan", href: "/seller/settings", icon: Settings },
      { label: "Staff", href: "/seller/staff", icon: UsersRound }
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
  const [email, setEmail] = React.useState<string>("admin");

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

  const initial = (email?.[0] ?? "A").toUpperCase();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-68 border-r border-(--st-border) bg-white">
      <div className="flex h-full flex-col">
        <div className="px-4 pt-4">
          <Link href="/seller" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--st-accent) text-black shadow-[0_1px_0_rgba(17,24,39,0.04)]">
              <Rocket className="h-4 w-4" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-(--st-text)">
                Spacetrip
              </div>
              <div className="text-xs text-(--st-text-muted)">
                {role === "admin" ? "Super Admin" : "Karyawan"}
              </div>
            </div>
          </Link>

          <div className="mt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
              <Input
                aria-label="Cari"
                placeholder="Cari"
                className="h-9 pl-9"
              />
            </div>
          </div>
        </div>

        <nav className="mt-4 flex-1 px-2">
          <div className="space-y-1">
            {getNavItems(counts, role).map((item) => {
              const active =
                item.href === "/seller"
                  ? pathname === item.href
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                    active
                      ? "border border-(--st-accent-border) bg-(--st-accent-soft) text-(--st-text)"
                      : "text-(--st-text-muted) hover:bg-[#F7F8FA] hover:text-(--st-text)"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-r-full",
                      active ? "bg-(--st-accent)" : "bg-transparent"
                    )}
                  />
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      active
                        ? "text-(--st-text)"
                        : "text-(--st-text-muted)"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                        active
                          ? "border-(--st-accent-border) bg-white text-(--st-text)"
                          : "border-(--st-border) bg-white text-(--st-text-muted)"
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 px-2">
            <Separator />
          </div>
        </nav>

        <div className="px-4 pb-4">
          <Separator />
          <div className="mt-4 flex items-center gap-3 rounded-md border border-(--st-border) bg-white px-3 py-2 shadow-[0_1px_0_rgba(17,24,39,0.03)]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-(--st-accent-border) bg-(--st-accent-soft) text-sm font-semibold text-(--st-text)">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-(--st-text)">
                {role === "admin" ? "Super Admin" : "Karyawan"}
              </div>
              <div className="truncate text-xs text-(--st-text-muted)">
                {email}
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--st-text-muted) transition-colors hover:bg-[#F7F8FA] hover:text-(--st-text)"
              aria-label="Menu akun"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--st-text-muted) transition-colors hover:bg-[#F7F8FA] hover:text-(--st-text)"
              aria-label="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
