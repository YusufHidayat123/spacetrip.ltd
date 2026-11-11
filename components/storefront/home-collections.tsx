"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import type { PublicProductListItem } from "@/lib/catalog/public";
import { ProductCard } from "@/components/storefront/product-card";
import { cn } from "@/lib/utils";

type TabKey = "featured" | "men" | "women" | "unisex" | "accessories";

const TABS: { key: TabKey; label: string; href: string }[] = [
  { key: "featured", label: "All Drops", href: "/products?sort=featured" },
  { key: "men", label: "Men", href: "/products?gender=men" },
  { key: "women", label: "Women", href: "/products?gender=women" },
  { key: "unisex", label: "Unisex", href: "/products?gender=unisex" },
  { key: "accessories", label: "Accessories", href: "/products?gender=accessories" },
];

export function BestSellersInteractive({
  collections,
}: {
  collections: Record<TabKey, PublicProductListItem[]>;
}) {
  const [activeTab, setActiveTab] = React.useState<TabKey>("featured");
  const currentMeta = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const items = collections[activeTab] ?? collections.featured ?? [];

  return (
    <section>
      <div className="flex flex-col justify-between gap-4 border-b border-(--st-border) pb-5 sm:flex-row sm:items-end">
        <div>
          <div className="font-mono-label text-[11px] font-medium uppercase tracking-[0.12em] text-(--st-text-muted)">
            [Featured Drops]
          </div>
          <h2 className="mt-1.5 font-display text-3xl font-medium tracking-tight text-(--st-text) sm:text-4xl">
            Curated &mdash; collection <span className="text-(--st-text-muted)">©26</span>
          </h2>
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 sm:justify-end">
          {/* Interactive Department Pills */}
          <div className="no-scrollbar flex min-w-0 max-w-full items-center gap-1.5 overflow-x-auto pb-0.5">
            {TABS.map((tab) => {
              const active = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                    active
                      ? "border-[#0D0D0D] bg-[#0D0D0D] text-white"
                      : "border-(--st-border) bg-(--st-bg) text-(--st-text) hover:border-[#FF5500] hover:text-[#FF5500]"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Link
            href={currentMeta.href}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--st-border) bg-white px-4 py-1.5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-(--st-text) transition hover:border-[#0D0D0D] hover:bg-[#0D0D0D] hover:text-white"
          >
            <span>VIEW ALL</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
        >
          {items.map((p, idx) => {
            const imgs = (p.product_images ?? [])
              .slice()
              .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            const hero = imgs[0] ?? null;

            return (
              <ProductCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                name={p.name}
                description={p.description}
                price={p.price}
                originalPrice={p.original_price}
                categoryName={p.categories?.name ?? null}
                condition={p.condition}
                color={p.color}
                material={p.material}
                measurements={p.measurements}
                styleTags={p.style_tags}
                badge={p.badge}
                variants={p.product_variants}
                showAsterisk={idx === 0}
                image={hero ? { storage_path: hero.storage_path, alt: hero.alt ?? null } : null}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
