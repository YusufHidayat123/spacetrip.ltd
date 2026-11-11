"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/catalog/types";

const STYLE_OPTIONS = [
  { value: "", label: "Semua Style" },
  { value: "y2k-streetwear", label: "Y2K Streetwear" },
  { value: "minimal-daily", label: "Minimal Daily" },
  { value: "vintage-workwear", label: "Vintage Workwear" },
  { value: "japanese-street", label: "Japanese Street Style" },
  { value: "skate-culture", label: "Skate Culture" },
  { value: "casual-essentials", label: "Casual Essentials" },
];

const CONDITION_OPTIONS = ["Like New", "Excellent", "Very Good", "Good"];
const SIZE_OPTIONS = ["S", "M", "L", "XL", "OS", "28", "30", "32"];

export type ActiveCatalogFilterValues = {
  q: string;
  category: string;
  gender: string;
  style: string;
  condition: string;
  size: string;
  maxPrice?: number;
  sort: string;
};

export function CatalogFilters({
  categories,
  values,
}: {
  categories: Category[];
  values: ActiveCatalogFilterValues;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [draftQuery, setDraftQuery] = React.useState<{ base: string; value: string }>({
    base: values.q,
    value: values.q,
  });
  const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayedSearch = draftQuery.base === values.q ? draftQuery.value : values.q;

  React.useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const buildUrl = React.useCallback(
    (patch: Partial<ActiveCatalogFilterValues>) => {
      const merged: ActiveCatalogFilterValues = { ...values, ...patch };
      const p = new URLSearchParams();
      if (merged.q.trim()) p.set("q", merged.q.trim());
      if (merged.category) p.set("category", merged.category);
      if (merged.gender) p.set("gender", merged.gender);
      if (merged.style) p.set("style", merged.style);
      if (merged.condition) p.set("condition", merged.condition);
      if (merged.size) p.set("size", merged.size);
      if (merged.maxPrice) p.set("maxPrice", String(merged.maxPrice));
      if (merged.sort && merged.sort !== "newest") p.set("sort", merged.sort);
      const qs = p.toString();
      return qs ? `/products?${qs}` : "/products";
    },
    [values]
  );

  const navigateWith = React.useCallback(
    (patch: Partial<ActiveCatalogFilterValues>) => {
      const target = buildUrl(patch);
      startTransition(() => {
        router.push(target, { scroll: false });
      });
    },
    [buildUrl, router]
  );

  function handleSearchInput(nextValue: string) {
    setDraftQuery({ base: values.q, value: nextValue });
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      navigateWith({ q: nextValue });
    }, 320);
  }

  const activeChips: { key: keyof ActiveCatalogFilterValues; label: string }[] = [];
  if (values.q) activeChips.push({ key: "q", label: `Cari: "${values.q}"` });
  if (values.category) {
    const catName =
      categories.find((c) => c.slug === values.category)?.name ?? values.category;
    activeChips.push({ key: "category", label: catName });
  }
  if (values.style) {
    const stName =
      STYLE_OPTIONS.find((s) => s.value === values.style)?.label ?? values.style;
    activeChips.push({ key: "style", label: stName });
  }
  if (values.condition) activeChips.push({ key: "condition", label: `Kondisi: ${values.condition}` });
  if (values.size) activeChips.push({ key: "size", label: `Size: ${values.size}` });
  if (values.maxPrice) {
    activeChips.push({ key: "maxPrice", label: `<= Rp${values.maxPrice.toLocaleString("id-ID")}` });
  }

  return (
    <div className="mt-5 space-y-3">
      {/* Main Toolbar Shell */}
      <section className="rounded-2xl border border-(--st-border) bg-white p-3.5 sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <input
              type="text"
              value={displayedSearch}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="Cari instan: jaket, cargo, kaos, warna..."
              className="h-10 w-full rounded-full border border-(--st-border) bg-(--st-bg) pl-10 pr-8 text-xs text-(--st-text) placeholder:text-(--st-text-muted) focus:border-[#0D0D0D] focus:bg-white focus:outline-none"
            />
            {displayedSearch ? (
              <button
                type="button"
                onClick={() => {
                  if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                  setDraftQuery({ base: values.q, value: "" });
                  navigateWith({ q: "" });
                }}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--st-text-muted) hover:text-(--st-text)"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {/* Under 100K Quick Toggle Pill */}
            <button
              type="button"
              onClick={() =>
                navigateWith({ maxPrice: values.maxPrice === 100000 ? undefined : 100000 })
              }
              className={cn(
                "h-10 shrink-0 rounded-full border px-4 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] transition",
                values.maxPrice === 100000
                  ? "border-[#FF5500] bg-[#FF5500] text-white"
                  : "border-(--st-border) bg-(--st-bg) text-(--st-text) hover:border-[#0D0D0D]"
              )}
            >
              Under 100K
            </button>

            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] px-4 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-white md:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter{activeChips.length > 0 ? ` (${activeChips.length})` : ""}</span>
            </button>

            {isPending ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#FF5500]" />
            ) : null}
          </div>
        </div>

        {/* Filter Controls Grid (Always open on md+, collapsible on mobile) */}
        <div
          className={cn(
            "mt-3 grid gap-2.5 border-t border-(--st-border) pt-3 md:grid-cols-5",
            mobileFiltersOpen ? "grid grid-cols-2" : "hidden md:grid"
          )}
        >
          <select
            aria-label="Filter Kategori"
            value={values.category}
            onChange={(e) => navigateWith({ category: e.target.value })}
            className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-xs text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter Style"
            value={values.style}
            onChange={(e) => navigateWith({ style: e.target.value })}
            className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-xs text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
          >
            {STYLE_OPTIONS.map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter Kondisi"
            value={values.condition}
            onChange={(e) => navigateWith({ condition: e.target.value })}
            className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-xs text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
          >
            <option value="">Semua Kondisi</option>
            {CONDITION_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter Ukuran"
            value={values.size}
            onChange={(e) => navigateWith({ size: e.target.value })}
            className="h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-xs text-(--st-text) focus:border-[#0D0D0D] focus:outline-none"
          >
            <option value="">Semua Ukuran</option>
            {SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                Size {s}
              </option>
            ))}
          </select>

          <select
            aria-label="Urutkan Produk"
            value={values.sort}
            onChange={(e) => navigateWith({ sort: e.target.value })}
            className="col-span-2 h-10 rounded-xl border border-(--st-border) bg-(--st-bg) px-3 text-xs font-medium text-(--st-text) focus:border-[#0D0D0D] focus:outline-none md:col-span-1"
          >
            <option value="newest">Urut: Terbaru</option>
            <option value="featured">Urut: Pilihan Editor</option>
            <option value="price_asc">Urut: Termurah</option>
            <option value="price_desc">Urut: Termahal</option>
          </select>
        </div>
      </section>

      {/* Removable Active Filter Chips */}
      {activeChips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
            [Active Filters]
          </span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => navigateWith({ [chip.key]: chip.key === "maxPrice" ? undefined : "" })}
              className="inline-flex items-center gap-1.5 rounded-full border border-(--st-border) bg-white px-3 py-1 font-mono-label text-[10px] uppercase tracking-[0.06em] text-(--st-text) transition hover:border-[#FF5500] hover:text-[#FF5500]"
            >
              <span>{chip.label}</span>
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              setDraftQuery({ base: "", value: "" });
              startTransition(() => {
                router.push("/products", { scroll: false });
              });
            }}
            className="ml-1 font-mono-label text-[10px] font-semibold uppercase tracking-[0.1em] text-[#FF5500] underline underline-offset-4 hover:text-[#0D0D0D]"
          >
            Reset Semua
          </button>
        </div>
      ) : null}
    </div>
  );
}
