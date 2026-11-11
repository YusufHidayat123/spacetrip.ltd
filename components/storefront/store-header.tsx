"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronLeft,
  Heart,
  Loader2,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart/cart-context";
import { formatIDR } from "@/lib/orders/format";
import { StoreDrawer, type DrawerCategorySummary } from "@/components/storefront/store-drawer";

const TRENDING_QUERIES = ["Workwear", "Cargo", "Hoodie", "Flannel", "Denim", "Cap"];

type SearchResultItem = {
  id: string;
  slug: string;
  name: string;
  price: string;
  original_price: string | null;
  condition: string | null;
  color: string | null;
  badge: string | null;
  categoryName: string | null;
  imageUrl: string;
};

function QuickCategoryLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeGender = pathname === "/products" ? searchParams.get("gender") : null;

  const links = [
    { href: "/products", label: "Archive", key: "all" },
    { href: "/products?gender=men", label: "Men", key: "men" },
    { href: "/products?gender=women", label: "Women", key: "women" },
    { href: "/products?gender=unisex", label: "Unisex", key: "unisex" },
  ];

  return (
    <div className="hidden items-center gap-1 xl:flex">
      {links.map((item) => {
        const active =
          item.key === "all"
            ? pathname === "/products" && !activeGender
            : activeGender === item.key;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              active
                ? "bg-[#0D0D0D] text-white"
                : "text-(--st-text-muted) hover:bg-white hover:text-[#0D0D0D]"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

function QuickCategoryLinksFallback() {
  return (
    <div className="hidden items-center gap-1 xl:flex">
      <Link
        href="/products"
        className="rounded-full px-3 py-1 text-xs font-medium text-(--st-text-muted) hover:bg-white hover:text-[#0D0D0D]"
      >
        Archive
      </Link>
    </div>
  );
}

export function StoreHeader({
  title,
  backHref,
  categories,
  className,
}: {
  title?: string;
  backHref?: string;
  categories?: DrawerCategorySummary[];
  rightHref?: string;
  rightLabel?: string;
  showMenu?: boolean;
  className?: string;
}) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searching, setSearching] = React.useState(false);
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, wishlistIds, openCart } = useCart();

  React.useEffect(() => {
    if (!searchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  React.useEffect(() => {
    if (!searchOpen) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=6`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const json = (await res.json()) as { items?: SearchResultItem[] };
        setResults(json.items ?? []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-(--st-border)/70 bg-(--st-bg)/92 backdrop-blur-md",
          className
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-18 sm:px-8">
          {/* LEFT: Mobile Hamburger + Back OR Desktop Contact Metadata + Quick Links */}
          <div className="flex min-w-0 items-center gap-3 lg:flex-1">
            <div className="flex items-center gap-1.5 lg:hidden">
              {backHref ? (
                <Link
                  href={backHref}
                  aria-label="Kembali"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text) transition hover:border-[#0D0D0D]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Buka menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text) transition hover:border-[#0D0D0D]"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            <div className="hidden items-center gap-5 lg:flex">
              <div className="leading-tight">
                <a
                  href="mailto:info@spacetrip.id"
                  className="block font-mono-label text-[11px] font-medium text-(--st-text) transition hover:text-[#FF5500]"
                >
                  info@spacetrip.id
                </a>
                <span className="block font-mono-label text-[10px] text-(--st-text-muted)">
                  +62 812-8490-2026
                </span>
              </div>

              <span className="h-5 w-px bg-(--st-border) hidden xl:inline-block" />

              <React.Suspense fallback={<QuickCategoryLinksFallback />}>
                <QuickCategoryLinks />
              </React.Suspense>
            </div>
          </div>

          {/* CENTER: Wordmark spacetrip. */}
          <div className="flex shrink-0 items-center justify-center">
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-tighter text-(--st-text) transition hover:opacity-80 sm:text-[1.65rem]"
            >
              spacetrip<span className="text-[#FF5500]">.</span>
            </Link>
            {title && pathname !== "/" ? (
              <span className="ml-3 hidden border-l border-(--st-border) pl-3 font-mono-label text-[10px] font-medium uppercase tracking-[0.14em] text-(--st-text-muted) md:inline">
                [{title}]
              </span>
            ) : null}
          </div>

          {/* RIGHT: Circular Icon Pills + Cart Badge + Account Pill */}
          <div className="flex items-center justify-end gap-2 lg:flex-1">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full border transition",
                searchOpen
                  ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                  : "border-(--st-border) bg-white text-(--st-text) hover:border-[#FF5500] hover:text-[#FF5500]"
              )}
              aria-label="Cari produk"
              aria-expanded={searchOpen}
            >
              <Search className="h-4 w-4" />
            </button>

            <Link
              href="/wishlist"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlistIds.length > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5500] px-1 font-mono-label text-[9px] font-bold text-white">
                  {wishlistIds.length}
                </span>
              ) : null}
            </Link>

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-(--st-border) bg-white px-2.5 text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500] sm:px-3.5"
              aria-label="Keranjang"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden font-mono-label text-[11px] font-semibold sm:inline">
                Bag ({totalItems})
              </span>
              {totalItems > 0 ? (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF5500] px-1 font-mono-label text-[9px] font-bold text-white sm:hidden">
                  {totalItems}
                </span>
              ) : null}
            </button>

            <Link
              href="/profile"
              className="hidden h-9 items-center gap-1.5 rounded-full border border-[#0D0D0D]/15 bg-[#0D0D0D] px-3.5 text-xs font-medium text-white transition hover:bg-[#FF5500] sm:inline-flex"
              aria-label="Akun"
            >
              <User className="h-3.5 w-3.5" />
              <span>Account</span>
            </Link>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Menu Kategori"
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-(--st-border) bg-white text-(--st-text) transition hover:border-[#0D0D0D] lg:inline-flex xl:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Expandable Instant Live Search Overlay */}
        <AnimatePresence>
          {searchOpen ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-(--st-border) bg-white shadow-xl"
            >
              <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-8">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                  <Search className="h-4 w-4 shrink-0 text-(--st-text-muted)" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari jaket workwear, washed tee, cargo, celana denim, topi..."
                    className="h-10 w-full bg-transparent text-sm text-(--st-text) placeholder:text-(--st-text-muted) focus:outline-none"
                  />
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#FF5500]" />
                  ) : null}
                  <button
                    type="submit"
                    className="rounded-full bg-[#0D0D0D] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#FF5500]"
                  >
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--st-border) text-(--st-text-muted) hover:text-(--st-text)"
                    aria-label="Tutup pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>

                {/* Quick Chips */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-(--st-border)/70 pt-3">
                  <span className="mr-1 font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
                    [Trending]
                  </span>
                  {TRENDING_QUERIES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearchQuery(term)}
                      className="rounded-full border border-(--st-border) bg-(--st-bg) px-3 py-1 text-xs font-medium text-(--st-text) transition hover:border-[#0D0D0D] hover:bg-white"
                    >
                      {term}
                    </button>
                  ))}
                  <Link
                    href="/products?maxPrice=100000"
                    onClick={() => setSearchOpen(false)}
                    className="rounded-full bg-[#FF5500] px-3 py-1 text-xs font-semibold text-white transition hover:bg-[#0D0D0D]"
                  >
                    Under 100K
                  </Link>
                </div>

                {/* Live Results */}
                {results.length > 0 ? (
                  <div className="mt-4">
                    <div className="mb-3 flex items-center justify-between font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
                      <span>
                        {searchQuery.trim()
                          ? `[Results for "${searchQuery.trim()}"]`
                          : "[Fresh From Archive]"}
                      </span>
                      <Link
                        href={
                          searchQuery.trim()
                            ? `/products?q=${encodeURIComponent(searchQuery.trim())}`
                            : "/products"
                        }
                        onClick={() => setSearchOpen(false)}
                        className="inline-flex items-center gap-1 font-semibold text-(--st-text) hover:text-[#FF5500]"
                      >
                        View All
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      {results.map((item) => (
                        <Link
                          key={item.id}
                          href={`/products/${item.slug}`}
                          onClick={() => setSearchOpen(false)}
                          className="group flex flex-col rounded-2xl border border-(--st-border)/80 bg-(--st-bg) p-2 transition hover:border-[#0D0D0D]"
                        >
                          <div className="clip-chamfer-diagonal-sm aspect-[4/5] w-full overflow-hidden rounded-xl bg-(--st-surface-alt)">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : null}
                          </div>
                          <div className="mt-2 truncate text-xs font-medium text-(--st-text)">
                            {item.name}
                          </div>
                          <div className="mt-0.5 font-mono-label text-[11px] font-semibold text-(--st-text)">
                            {formatIDR(item.price)}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : searchQuery.trim() && !searching ? (
                  <div className="mt-4 rounded-2xl border border-(--st-border) bg-(--st-bg) px-4 py-4 text-xs text-(--st-text-muted)">
                    Tidak ada hasil untuk &ldquo;{searchQuery}&rdquo;. Coba kata kunci lain seperti
                    &ldquo;Denim&rdquo;, &ldquo;Cargo&rdquo;, atau &ldquo;Tee&rdquo;.
                  </div>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <StoreDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} categories={categories} />
    </>
  );
}
