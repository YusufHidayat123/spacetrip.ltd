"use client";

import * as React from "react";
import { Lock, Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function SellerAuthButtons({ next }: { next: string }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function signInWithGoogle() {
    setPending(true);
    setError(null);

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
      setError(e instanceof Error ? e.message : "Login gagal");
      setPending(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        const role = profile?.role ?? "customer";
        if (role !== "seller" && role !== "admin") {
          setError("Akun ini terdaftar sebagai customer dan tidak memiliki akses operasional.");
          setPending(false);
          return;
        }
      }

      window.location.href = next;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login admin gagal");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-5">
      <form onSubmit={handleEmailLogin} className="grid gap-3.5">
        <div>
          <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
            Email Staff / Admin
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--st-text-muted)" />
            <Input
              type="email"
              placeholder="admin@spacetrip.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
              required
              className="h-11 rounded-xl border-(--st-border) bg-(--st-bg) pl-10"
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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
              required
              className="h-11 rounded-xl border-(--st-border) bg-(--st-bg) pl-10"
            />
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="h-12 w-full rounded-full bg-[#0D0D0D] font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500] disabled:opacity-60"
        >
          {pending ? "Memeriksa Kredensial..." : "Masuk sebagai Admin / Staff"}
        </button>
      </form>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-(--st-border)" />
        <span className="absolute bg-white px-3 font-mono-label text-[10px] uppercase tracking-[0.12em] text-(--st-text-muted)">
          atau
        </span>
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={pending}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#0D0D0D] bg-white font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0D0D0D] transition hover:bg-(--st-bg)"
      >
        Masuk dengan Google
      </button>

      <div className="text-[11px] text-(--st-text-muted)">
        Akses hanya untuk akun dengan role <strong className="text-(--st-text)">Karyawan</strong>{" "}
        atau <strong className="text-(--st-text)">Super Admin</strong>.
      </div>
    </div>
  );
}
