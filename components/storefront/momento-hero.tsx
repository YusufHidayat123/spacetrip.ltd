"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import { motion } from "framer-motion";

export function MomentoHero({
  heroCutoutUrl,
  avatarUrls,
  activeCount,
}: {
  heroCutoutUrl: string;
  avatarUrls: string[];
  activeCount: number;
}) {
  return (
    <section className="relative overflow-hidden bg-(--st-bg)">
      <div className="relative mx-auto flex min-h-[600px] max-w-[1440px] flex-col justify-between px-4 pb-8 pt-6 sm:min-h-[680px] sm:px-8 sm:pb-12 sm:pt-8 lg:min-h-[max(680px,calc(100vh-76px))] lg:max-h-[860px] lg:pb-12">
        {/* Top Row: Micro Metadata + Scroll Down Cue */}
        <div className="relative z-30 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-(--st-border) bg-white/80 px-3 py-1 font-mono-label text-[10px] font-medium uppercase tracking-[0.12em] text-(--st-text) backdrop-blur-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF5500]" />
            <span>[Curated Archive · {activeCount} Active Drops]</span>
          </div>

          <a
            href="#showcase"
            className="inline-flex items-center gap-1.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.16em] text-(--st-text-muted) transition hover:text-[#FF5500]"
          >
            <span>SCROLL DOWN</span>
            <ArrowDown className="h-3 w-3" />
          </a>
        </div>

        {/* Center Layered Composition: Background Giant Type (z-10) + Foreground Cutout Model (z-20) */}
        <div className="relative my-auto flex min-h-[420px] flex-col justify-center py-4 sm:min-h-[480px] lg:min-h-[540px]">
          {/* Z-10: Massive Background Headline */}
          <div className="relative z-10 select-none">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h1 className="font-display text-[clamp(2.65rem,11.8vw,8.25rem)] font-medium leading-[0.86] tracking-[-0.045em] text-[#0D0D0D]">
                where
              </h1>
              <span className="ml-auto font-display text-[clamp(2.65rem,11.8vw,8.25rem)] font-medium leading-[0.86] tracking-[-0.045em] text-[#0D0D0D]">
                &mdash; a style
              </span>
            </div>

            <div className="mt-1 flex justify-end sm:mt-2">
              <span className="font-display text-[clamp(2.85rem,12.2vw,8.5rem)] font-medium leading-[0.86] tracking-[-0.045em] text-[#0D0D0D]">
                moment
              </span>
            </div>
          </div>

          {/* Z-20: Foreground Cutout Model Overlapping In Front Of Typography */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-0 bottom-[-2rem] z-20 flex justify-center sm:bottom-[-3rem]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroCutoutUrl}
              alt="Indonesian streetwear model in sand-beige technical anorak jacket and washed cap"
              className="h-[340px] w-auto max-w-[90vw] select-none object-contain object-bottom drop-shadow-[0_18px_28px_rgba(13,13,13,0.14)] sm:h-[440px] lg:h-[clamp(440px,68vh,620px)]"
            />
          </motion.div>

          {/* Z-30: Center-Right Floating White Action Card on Model */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="absolute bottom-6 right-4 z-30 sm:bottom-12 sm:right-[14%] lg:bottom-16 lg:right-[22%]"
          >
            <Link
              href="/products"
              className="group flex flex-col items-center justify-center rounded-2xl border border-(--st-border) bg-white px-4 py-3 text-[#0D0D0D] shadow-[0_14px_34px_rgba(13,13,13,0.14)] transition duration-200 hover:-translate-y-0.5 hover:border-[#FF5500] hover:bg-[#FF5500] hover:text-white sm:px-5 sm:py-4"
            >
              <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:h-6 sm:w-6" />
              <span className="mt-1 font-mono-label text-[9px] font-semibold uppercase tracking-[0.12em]">
                Explore
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Z-30: Bottom Micro HUD Row (Left Avatars & Copy + Right Community Metrics) */}
        <div className="relative z-30 mt-4 grid items-end gap-6 sm:grid-cols-12">
          {/* Left Floating Cluster: Avatars + Asterisk + Editorial Intro */}
          <div className="sm:col-span-6 lg:col-span-5">
            <div className="flex items-center gap-3">
              {/* Overlapping mini avatars + orange + badge */}
              <div className="flex items-center -space-x-2">
                {avatarUrls.slice(0, 3).map((src, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 overflow-hidden rounded-full border-2 border-(--st-bg) bg-(--st-surface-alt)"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt="SpaceTrip community collector"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                ))}
                <Link
                  href="/products"
                  aria-label="Explore drops"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-(--st-bg) bg-[#FF5500] text-white transition hover:bg-[#0D0D0D]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Eight-spoke orange asterisk signature badge */}
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#FF5500]/12 text-sm font-bold text-[#FF5500]"
              >
                &#10035;
              </span>
              <span className="font-mono-label text-[10px] font-medium uppercase tracking-[0.12em] text-(--st-text-muted)">
                01 / 26 DROP
              </span>
            </div>

            <p className="mt-3 max-w-xs rounded-2xl bg-(--st-bg)/85 text-xs leading-relaxed text-(--st-text-muted) backdrop-blur-xs sm:max-w-sm sm:bg-transparent sm:text-sm">
              From everyday essentials to statement thrift pieces, our curated collection is
              designed to elevate your daily rotation.
            </p>
          </div>

          {/* Right Cluster: 320K Metric & Sub-Caption */}
          <div className="flex items-end justify-between gap-4 sm:col-span-6 sm:justify-end sm:gap-10 lg:col-span-7">
            <div className="rounded-2xl border border-(--st-border) bg-white/85 px-4 py-3 backdrop-blur-xs sm:border-0 sm:bg-transparent sm:p-0">
              <div className="font-display text-2xl font-semibold tracking-tight text-(--st-text) sm:text-3xl">
                320K
              </div>
              <div className="font-mono-label text-[10px] font-medium uppercase tracking-[0.12em] text-(--st-text-muted)">
                CURATED VIEWS
              </div>
            </div>

            <p className="max-w-[165px] text-right text-[11px] leading-snug text-(--st-text-muted) sm:max-w-[190px] sm:text-xs">
              Step into effortless elegance with{" "}
              <span className="font-medium text-(--st-text)">SpaceTrip</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
