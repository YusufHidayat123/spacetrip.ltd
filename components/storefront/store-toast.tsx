"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";

import { useCart } from "@/lib/cart/cart-context";

export function StoreToast() {
  const { toast, dismissToast } = useCart();

  return (
    <div className="pointer-events-none fixed bottom-20 left-4 right-4 z-[90] flex justify-center md:bottom-6 md:left-auto md:right-6 md:justify-end">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/15 bg-[#0D0D0D] px-4 py-2.5 text-white shadow-xl"
            role="status"
            aria-live="polite"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF5500] text-white">
              <Check className="h-3 w-3 stroke-[2.5]" />
            </span>
            <span className="text-xs font-medium">{toast.message}</span>
            {toast.actionLabel && toast.actionHref ? (
              <Link
                href={toast.actionHref}
                onClick={dismissToast}
                className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono-label text-[10px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#FF5500]"
              >
                {toast.actionLabel}
              </Link>
            ) : null}
            <button
              type="button"
              onClick={dismissToast}
              aria-label="Tutup notifikasi"
              className="ml-0.5 text-white/60 transition hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
