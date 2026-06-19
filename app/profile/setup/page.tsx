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

function isCompleteAddress(a: Partial<ShippingAddress> | null | undefined): a is ShippingAddress {
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
    if (!user) redirect(`/login?next=${encodeURIComponent(`/profile/setup?next=${next}`)}`);

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

    const shipping_address: ShippingAddress = { line1, city, province, postal_code };

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
      <StoreHeader title="Lengkapi profil" backHref={`/profile?next=${encodeURIComponent(next)}`} />

      <main className="px-5 pb-8">
        <section className="mt-4 rounded-3xl border border-(--st-border) bg-white p-5 shadow-[0_12px_28px_rgba(17,24,39,0.10)]">
          <div className="text-lg font-semibold tracking-tight text-(--st-text)">
            Data pengiriman
          </div>
          <div className="mt-1 text-sm text-(--st-text-muted)">
            Sekali isi, nanti checkout cukup pilih ukuran & jumlah.
          </div>

          {alreadyComplete ? (
            <div className="mt-4 rounded-2xl border border-(--st-border) bg-[#F7F8FA] p-4 text-sm text-(--st-text-muted)">
              Profil kamu sudah lengkap. Kamu bisa lanjut.
            </div>
          ) : null}

          <form action={saveAction} className="mt-5 grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Nama lengkap</label>
              <Input name="full_name" defaultValue={profile?.full_name ?? ""} required />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">No. HP (opsional)</label>
              <Input name="phone" defaultValue={profile?.phone ?? ""} placeholder="08xxxx" />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Alamat lengkap</label>
              <Input name="line1" defaultValue={currentAddress?.line1 ?? ""} required />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-(--st-text)">Kota</label>
                <Input name="city" defaultValue={currentAddress?.city ?? ""} required />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-(--st-text)">Provinsi</label>
                <Input name="province" defaultValue={currentAddress?.province ?? ""} required />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Kode pos</label>
              <Input name="postal_code" defaultValue={currentAddress?.postal_code ?? ""} required />
            </div>

            <SubmitButton pendingText="Menyimpan..." className="h-11 w-full rounded-full">
              Simpan & lanjut
            </SubmitButton>

            <div className="text-center text-[11px] text-(--st-text-muted)">
              Data ini hanya untuk kebutuhan pengiriman pesanan.
            </div>
          </form>
        </section>
      </main>
    </MobileShell>
  );
}
