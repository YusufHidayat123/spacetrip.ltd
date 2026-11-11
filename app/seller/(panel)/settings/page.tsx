export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { Badge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/form/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/roles";
import {
  adminGetStoreSettings,
  adminUpsertStoreSettings,
} from "@/lib/settings/admin";
import { QrisUploadField } from "./_components/qris-upload-field";

export default async function SettingsPage() {
  await requireSuperAdmin();

  const settings = await adminGetStoreSettings();

  async function saveAction(formData: FormData) {
    "use server";

    await requireSuperAdmin();

    const store_name =
      String(formData.get("store_name") ?? "").trim() || "Spacetrip";
    const payment_instructions_raw = String(
      formData.get("payment_instructions") ?? ""
    ).trim();
    const payment_instructions = payment_instructions_raw.length
      ? payment_instructions_raw
      : null;

    const currentSettingsIdRaw = String(
      formData.get("settings_id") ?? ""
    ).trim();
    const settingsId = currentSettingsIdRaw.length
      ? currentSettingsIdRaw
      : null;

    const currentUrlRaw = String(formData.get("qris_current_url") ?? "").trim();
    const currentUrl = currentUrlRaw.length ? currentUrlRaw : null;
    const clearQris = String(formData.get("qris_clear") ?? "") === "on";
    const file = formData.get("qris") as File | null;

    let qris_image_url: string | null = currentUrl;

    if (clearQris) {
      qris_image_url = null;
    } else if (file && file.size > 0) {
      const maxBytes = 8 * 1024 * 1024;
      if (file.size > maxBytes) {
        throw new Error("Gambar QRIS terlalu besar (maks ~8MB)");
      }

      const bucket = process.env.SUPABASE_STORE_ASSETS_BUCKET || "store-assets";
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";
      const fileName = `qris-${crypto.randomUUID()}.${safeExt}`;
      const storagePath = `qris/${fileName}`;

      const supabase = createSupabaseAdminClient();
      const fileBytes = new Uint8Array(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, fileBytes, {
          contentType: file.type || `image/${safeExt}`,
          upsert: false,
          cacheControl: "3600",
        });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(storagePath);
      qris_image_url = publicUrl;
    }

    await adminUpsertStoreSettings({
      id: settingsId && settingsId !== "default" ? settingsId : null,
      store_name,
      payment_instructions,
      qris_image_url,
    });

    redirect("/seller/settings");
  }

  return (
    <PageShell>
      <PageHeader
        title="Pengaturan Toko & QRIS"
        description="Konfigurasi nama brand, gambar QRIS statis, dan instruksi transfer manual untuk customer."
        badge={<Badge variant="orangeSoft">Super Admin Only</Badge>}
        breadcrumb={
          <Breadcrumb
            items={[{ label: "admin", href: "/seller" }, { label: "pengaturan" }]}
          />
        }
      />

      <section className="mt-6 max-w-3xl rounded-3xl border border-(--st-border) bg-white p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-2 border-b border-(--st-border) pb-4">
          <span className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.14em] text-(--st-text-muted)">
            [Store & Payment Dossier]
          </span>
          <span className="text-sm text-[#FF5500]" aria-hidden>
            &#10035;
          </span>
        </div>

        <form
          action={saveAction}
          encType="multipart/form-data"
          className="grid gap-5"
        >
          <input type="hidden" name="settings_id" value={settings.id ?? ""} />
          <input
            type="hidden"
            name="qris_current_url"
            value={settings.qris_image_url ?? ""}
          />

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Nama Toko
            </label>
            <Input
              name="store_name"
              defaultValue={settings.store_name ?? "Spacetrip"}
              className="h-10 rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-1.5">
            <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
              Instruksi Pembayaran Customer
            </label>
            <Textarea
              name="payment_instructions"
              defaultValue={settings.payment_instructions ?? ""}
              placeholder="Contoh: Scan kode QRIS SpaceTrip, transfer sesuai nominal order, lalu unggah bukti transfer."
              className="rounded-xl border-(--st-border) bg-(--st-bg)"
            />
          </div>

          <div className="grid gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="font-mono-label text-[10px] font-semibold uppercase tracking-[0.12em] text-(--st-text)">
                Gambar QRIS Pembayaran
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-(--st-text-muted)">
                <input
                  type="checkbox"
                  name="qris_clear"
                  className="h-4 w-4 accent-[#FF5500]"
                />
                Hapus QRIS
              </label>
            </div>
            <QrisUploadField name="qris" currentUrl={settings.qris_image_url} />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-(--st-border) pt-5">
            <Link
              href="/seller"
              className="inline-flex h-11 items-center rounded-full border border-(--st-border) bg-white px-5 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-[#0D0D0D] transition hover:border-[#0D0D0D] hover:bg-(--st-bg)"
            >
              Kembali
            </Link>
            <SubmitButton
              pendingText="Menyimpan..."
              className="h-11 rounded-full bg-[#0D0D0D] px-6 font-mono-label text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#FF5500]"
            >
              Simpan Pengaturan
            </SubmitButton>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
