"use client";

import * as React from "react";
import { Lock, Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

export function CustomerAuthButtons({ next }: { next: string }) {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);

  async function signInWithGoogle() {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
        next
      )}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login Google gagal");
      setPending(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        window.location.href = next;
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          window.location.href = next;
        } else {
          setMessage("Pendaftaran berhasil! Silakan masuk dengan akun kamu.");
          setMode("login");
          setPending(false);
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-5">
      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-full border border-[#0D0D0D] bg-white px-4 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0D0D0D] transition hover:bg-(--st-bg) disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27c3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10c5.35 0 9.25-3.67 9.25-9.09c0-1.15-.15-1.81-.15-1.81Z"
          />
        </svg>
        Lanjut dengan Google
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-(--st-border)" />
        <span className="absolute bg-white px-3 font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
          atau dengan email
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 rounded-full border border-(--st-border) bg-(--st-bg) p-1">
        <button
          type="button"
          className={cn(
            "rounded-full py-2 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] transition",
            mode === "login"
              ? "bg-[#0D0D0D] text-white"
              : "text-(--st-text-muted) hover:text-(--st-text)"
          )}
          onClick={() => {
            setMode("login");
            setError(null);
            setMessage(null);
          }}
        >
          Masuk
        </button>
        <button
          type="button"
          className={cn(
            "rounded-full py-2 font-mono-label text-[11px] font-semibold uppercase tracking-[0.1em] transition",
            mode === "register"
              ? "bg-[#0D0D0D] text-white"
              : "text-(--st-text-muted) hover:text-(--st-text)"
          )}
          onClick={() => {
            setMode("register");
            setError(null);
            setMessage(null);
          }}
        >
          Daftar Baru
        </button>
      </div>

      {/* Email + Password Form */}
      <form onSubmit={handleEmailAuth} className="grid gap-3.5">
        <div>
          <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
            Email
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              required
              className="h-11 rounded-xl border-(--st-border) bg-(--st-bg) pl-10 focus:border-[#0D0D0D]"
            />
          </div>
        </div>

        <div>
          <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
            Password
          </label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              required
              className="h-11 rounded-xl border-(--st-border) bg-(--st-bg) pl-10 focus:border-[#0D0D0D]"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800">
            {message}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-full bg-[#0D0D0D] font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500] disabled:opacity-60"
        >
          {pending
            ? "Memproses..."
            : mode === "login"
              ? "Masuk dengan Email"
              : "Daftar Akun Baru"}
        </button>
      </form>

      <p className="text-[11px] leading-relaxed text-(--st-text-muted)">
        Dengan masuk, kamu setuju proses checkout &amp; verifikasi pembayaran QRIS dilakukan oleh tim
        operasional SpaceTrip.
      </p>
    </div>
  );
}
