"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function CustomerAuthButtons({ next }: { next: string }) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function signInWithGoogle() {
    setPending(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) throw error;

      // Usually browser will navigate away; keep as fallback.
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login gagal");
      setPending(false);
    }
  }



  return (
    <div className="grid gap-3">
      <Button
        type="button"
        className="h-11 w-full rounded-full"
        onClick={signInWithGoogle}
        disabled={pending}
      >
        Lanjut dengan Google
      </Button>

      {error ? <div className="text-xs text-[#B91C1C]">{error}</div> : null}

      <div className="text-[11px] text-(--st-text-muted)">
        Dengan masuk, kamu setuju proses checkout & verifikasi pembayaran dilakukan manual.
      </div>
    </div>
  );
}
