"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Plus, Minus } from "lucide-react";

import { ChamferedCard } from "@/components/storefront/chamfered-card";
import { cn } from "@/lib/utils";

const ARCHIVE_CHAPTERS = [
  {
    code: "01",
    title: "Everyday Essentials",
    subtitle: "Heavyweight 240gsm tees & clean daily cuts",
    detail:
      "Pilihan kaos combed & heavyweight katun berpotongan boxy yang nyaman dipakai seharian dari Jakarta Selatan hingga Bandung.",
    href: "/products?style=minimal-daily",
  },
  {
    code: "02",
    title: "Oversized Pieces",
    subtitle: "Relaxed silhouettes with honest patina",
    detail:
      "Jaket canvas workwear, flanel brushed overshirt, dan fleece sun-faded berkarakter yang mudah dipadukan sebagai outer utama.",
    href: "/products?style=vintage-workwear",
  },
  {
    code: "03",
    title: "Y2K & Utility Cargo",
    subtitle: "Ripstop pockets & wide-leg movement",
    detail:
      "Celana cargo ripstop multi-saku, parachute trousers, dan stonewashed baggy denim untuk siluet jalanan modern.",
    href: "/products?style=y2k-streetwear",
  },
  {
    code: "04",
    title: "Seasonal Curations",
    subtitle: "Small-batch Indonesian archive drops",
    detail:
      "Setiap minggu hanya satu batch kurasi terbatas. Tidak ada restock setelah item terjual habis ke kolektor.",
    href: "/products?sort=featured",
  },
];

export function MomentoAccordion({
  primaryImageUrl,
  secondaryImageUrl,
}: {
  primaryImageUrl: string;
  secondaryImageUrl: string;
}) {
  const [openCode, setOpenCode] = React.useState<string>("01");

  const tickerText = [
    "SPACETRIP ARCHIVE",
    "INDONESIAN STREETWEAR",
    "CURATED THRIFT",
    "NO RESTOCK GUARANTEED",
    "SPACETRIP ARCHIVE",
    "INDONESIAN STREETWEAR",
  ];

  return (
    <section className="w-full overflow-hidden">
      {/* Infinite Running Marquee Ticker */}
      <div className="border-y border-(--st-border) bg-white py-3.5">
        <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
          {[...tickerText, ...tickerText].map((text, idx) => (
            <span key={idx} className="inline-flex items-center gap-3">
              <span className="text-sm font-bold text-[#FF5500]" aria-hidden="true">
                &#10035;
              </span>
              <span className="font-mono-label text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0D0D0D]">
                {text}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Split Feature & Interactive Numbered Accordion */}
      <div className="bg-(--st-bg) py-14 lg:py-20">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 sm:px-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Collage: Two Asymmetric Chamfered Cards */}
          <div className="grid grid-cols-12 items-end gap-4 lg:col-span-5">
            <div className="col-span-7">
              <ChamferedCard
                variant="diagonal"
                aspectClass="aspect-[3/4]"
                hideActionButton
                topLeftSlot={
                  <span className="rounded-full bg-[#FF5500] px-2.5 py-1 font-mono-label text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                    Curated Archive
                  </span>
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={primaryImageUrl}
                  alt="SpaceTrip Indonesian streetwear lookbook"
                  loading="lazy"
                  className="h-full w-full object-cover object-top transition duration-700 hover:scale-[1.04]"
                />
              </ChamferedCard>
            </div>

            <div className="col-span-5 space-y-3">
              <div className="rounded-2xl border border-(--st-border) bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF5500] text-xs font-bold text-white">
                    &#10035;
                  </span>
                  <span className="font-mono-label text-[10px] text-(--st-text-muted)">[2026]</span>
                </div>
                <p className="mt-2.5 text-[11px] leading-relaxed text-(--st-text-muted)">
                  Diperiksa menyeluruh dari jahitan hingga ukuran aktual sebelum rilis.
                </p>
              </div>

              <ChamferedCard variant="diagonal-sm" aspectClass="aspect-square" hideActionButton>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={secondaryImageUrl}
                  alt="SpaceTrip garment texture detail"
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition duration-700 hover:scale-[1.04]"
                />
              </ChamferedCard>
            </div>
          </div>

          {/* Right: Interactive Numbered Archive Chapters Accordion */}
          <div className="min-w-0 lg:col-span-7">
            <div className="flex items-center justify-between gap-4 border-b border-(--st-border) pb-4">
              <div>
                <div className="font-mono-label text-[11px] font-medium uppercase tracking-[0.12em] text-(--st-text-muted)">
                  [Archive Chapters]
                </div>
                <h2 className="mt-1 font-display text-2xl font-medium tracking-tight text-(--st-text) sm:text-3xl">
                  Built for the daily rotation
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden items-center gap-1.5 rounded-full bg-[#0D0D0D] px-4 py-2 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#FF5500] sm:inline-flex"
              >
                <span>ALL ARCHIVES</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-(--st-border)">
              {ARCHIVE_CHAPTERS.map((ch) => {
                const isOpen = openCode === ch.code;
                return (
                  <div key={ch.code} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenCode(isOpen ? "" : ch.code)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <div className="flex min-w-0 items-baseline gap-4">
                        <span
                          className={cn(
                            "font-mono-label text-xs font-semibold",
                            isOpen ? "text-[#FF5500]" : "text-(--st-text-muted)"
                          )}
                        >
                          /{ch.code}
                        </span>
                        <span className="truncate font-display text-lg font-medium tracking-tight text-(--st-text) sm:text-2xl">
                          {ch.title}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition",
                          isOpen
                            ? "border-[#FF5500] bg-[#FF5500] text-white"
                            : "border-(--st-border) bg-white text-(--st-text)"
                        )}
                      >
                        {isOpen ? (
                          <Minus className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 flex flex-col justify-between gap-4 pl-8 sm:flex-row sm:items-end">
                            <p className="max-w-lg text-xs leading-relaxed text-(--st-text-muted) sm:text-sm">
                              {ch.detail}
                            </p>
                            <Link
                              href={ch.href}
                              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#0D0D0D] bg-white px-4 py-1.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] text-[#0D0D0D] transition hover:bg-[#0D0D0D] hover:text-white"
                            >
                              <span>Shop {ch.title}</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 sm:hidden">
              <Link
                href="/products"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0D0D0D] px-5 py-3 font-mono-label text-[11px] font-semibold uppercase tracking-[0.08em] text-white"
              >
                <span>ALL ARCHIVES</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

