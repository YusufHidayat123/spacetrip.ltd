export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { MobileShell } from "@/components/storefront/mobile-shell";
import { StoreHeader } from "@/components/storefront/store-header";
import { SubmitButton } from "@/components/form/submit-button";
import { Input } from "@/components/ui/input";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ShippingAddress = {
  line1: string;
  city: string;
  province: string;
  postal_code: string;
};

function isCompleteAddress(
  a: Partial<ShippingAddress> | null | undefined
): a is ShippingAddress {
  if (!a) return false;
  return Boolean(a.line1 && a.city && a.province && a.postal_code);
}

export default async function ProfileSetupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/profile/setup?next=${next}`)}`);
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,full_name,phone,shipping_address")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;

  const currentAddress = (profile?.shipping_address ?? null) as Partial<ShippingAddress> | null;

  const alreadyComplete =
    Boolean(profile?.full_name && String(profile.full_name).trim().length > 0) &&
    isCompleteAddress(currentAddress);

  async function saveAction(formData: FormData) {
    "use server";

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/login?next=${encodeURIComponent(`/profile/setup?next=${next}`)}`);
    }

    const full_name = String(formData.get("full_name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const line1 = String(formData.get("line1") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    const province = String(formData.get("province") ?? "").trim();
    const postal_code = String(formData.get("postal_code") ?? "").trim();

    if (!full_name) throw new Error("Nama lengkap wajib diisi");
    if (!line1 || !city || !province || !postal_code) {
      throw new Error("Alamat pengiriman belum lengkap");
    }

    const shipping_address: ShippingAddress = {
      line1,
      city,
      province,
      postal_code,
    };

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name,
        phone: phone.length ? phone : null,
        shipping_address,
      })
      .eq("id", user.id);

    if (error) throw error;

    redirect(next);
  }

  return (
    <MobileShell hideBottomNav>
      <StoreHeader
        title="Data Pengiriman"
        backHref={`/profile?next=${encodeURIComponent(next)}`}
      />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-8">
        <section className="rounded-3xl border border-(--st-border) bg-white p-6 sm:p-10">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5500] text-[10px] font-bold text-white"
            >
              &#10035;
            </span>
            <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.16em] text-(--st-text-muted)">
              [Shipping Dossier]
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-medium lowercase tracking-tight text-[#0D0D0D]">
            data &amp; alamat pengiriman
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-(--st-text-muted) sm:text-sm">
            Simpan informasi penerima satu kali untuk mempercepat setiap transaksi checkout di
            SpaceTrip.
          </p>

          {alreadyComplete ? (
            <div className="mt-5 rounded-2xl border border-(--st-accent-border) bg-(--st-accent-soft) px-4 py-3 text-xs text-[#CC4400]">
              Data pengiriman kamu sudah tersimpan dan siap digunakan.
            </div>
          ) : null}

          <form action={saveAction} className="mt-6 grid gap-4">
            <div className="grid gap-1.5">
              <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                Nama Lengkap Penerima
              </label>
              <Input
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                placeholder="Contoh: Bima Pratama"
                required
                className="h-11 rounded-xl border-(--st-border) bg-(--st-bg)"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                No. WhatsApp / HP (Opsional)
              </label>
              <Input
                name="phone"
                defaultValue={profile?.phone ?? ""}
                placeholder="08xxxxxxxxxx"
                className="h-11 rounded-xl border-(--st-border) bg-(--st-bg)"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                Alamat Lengkap (Jalan, No. Rumah, Patokan)
              </label>
              <Input
                name="line1"
                defaultValue={currentAddress?.line1 ?? ""}
                placeholder="Jl. Kemang Raya No. 45, RT 02/RW 04"
                required
                className="h-11 rounded-xl border-(--st-border) bg-(--st-bg)"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                  Kota / Kabupaten
                </label>
                <Input
                  name="city"
                  defaultValue={currentAddress?.city ?? ""}
                  placeholder="Jakarta Selatan"
                  required
                  className="h-11 rounded-xl border-(--st-border) bg-(--st-bg)"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                  Provinsi
                </label>
                <Input
                  name="province"
                  defaultValue={currentAddress?.province ?? ""}
                  placeholder="DKI Jakarta"
                  required
                  className="h-11 rounded-xl border-(--st-border) bg-(--st-bg)"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                Kode Pos
              </label>
              <Input
                name="postal_code"
                defaultValue={currentAddress?.postal_code ?? ""}
                placeholder="12730"
                required
                className="h-11 rounded-xl border-(--st-border) bg-(--st-bg)"
              />
            </div>

            <div className="mt-2">
              <SubmitButton
                pendingText="Menyimpan..."
                className="h-12 w-full rounded-full bg-[#0D0D0D] font-mono-label text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
              >
                Simpan &amp; Lanjutkan
              </SubmitButton>
            </div>
          </form>
        </section>
      </main>
    </MobileShell>
  );
}
