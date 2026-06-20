export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { Breadcrumb } from "@/components/seller/breadcrumb";
import { PageHeader } from "@/components/seller/page-header";
import { PageShell } from "@/components/seller/page-shell";
import { SubmitButton } from "@/components/form/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminGetStoreSettings, adminUpsertStoreSettings } from "@/lib/settings/admin";
import { QrisUploadField } from "./_components/qris-upload-field";

export default async function SettingsPage() {
  const settings = await adminGetStoreSettings();

  async function saveAction(formData: FormData) {
    "use server";

    const store_name = String(formData.get("store_name") ?? "").trim() || "Spacetrip";
    const payment_instructions_raw = String(formData.get("payment_instructions") ?? "").trim();
    const payment_instructions = payment_instructions_raw.length ? payment_instructions_raw : null;

    const currentSettingsIdRaw = String(formData.get("settings_id") ?? "").trim();
    const settingsId = currentSettingsIdRaw.length ? currentSettingsIdRaw : null;

    const currentUrlRaw = String(formData.get("qris_current_url") ?? "").trim();
    const currentUrl = currentUrlRaw.length ? currentUrlRaw : null;

    const clearQris = String(formData.get("qris_clear") ?? "") === "on";

    const file = formData.get("qris") as File | null;

    let qris_image_url: string | null = currentUrl;

    if (clearQris) {
      qris_image_url = null;
    } else if (file && file.size > 0) {
      const maxBytes = 8 * 1024 * 1024;
      if (file.size > maxBytes) throw new Error("Gambar QRIS terlalu besar (maks ~8MB)");

      const bucket = process.env.SUPABASE_STORE_ASSETS_BUCKET || "store-assets";
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const safeExt = ["png", "jpg", "jpeg", "webp"].includes(ext) ? ext : "png";
      const fileName = `qris-${crypto.randomUUID()}.${safeExt}`;
      const storagePath = `qris/${fileName}`;

      const supabase = createSupabaseAdminClient();
      const fileBytes = new Uint8Array(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage.from(bucket).upload(storagePath, fileBytes, {
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
        title="Pengaturan"
        breadcrumb={
          <Breadcrumb
            items={[
              { label: "admin", href: "/seller" },
              { label: "pengaturan" },
            ]}
          />
        }
      />

      <div className="mt-6 grid gap-6">
        <section className="rounded-xl border border-(--st-border) bg-white p-6 shadow-[0_4px_16px_rgba(17,24,39,0.04)]">
          <div className="text-sm font-semibold text-(--st-text)">Pengaturan toko</div>
          <div className="mt-1 text-xs text-(--st-text-muted)">
            Untuk checkout manual: QRIS + instruksi pembayaran.
          </div>

          <form action={saveAction} encType="multipart/form-data" className="mt-5 grid gap-5">
            <input type="hidden" name="settings_id" value={settings.id ?? ""} />
            <input type="hidden" name="qris_current_url" value={settings.qris_image_url ?? ""} />

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Nama toko</label>
              <Input name="store_name" defaultValue={settings.store_name ?? "Spacetrip"} />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium text-(--st-text)">Instruksi pembayaran</label>
              <Textarea
                name="payment_instructions"
                defaultValue={settings.payment_instructions ?? ""}
                placeholder="Contoh: Scan QRIS, bayar sesuai total, lalu upload bukti bayar."
              />
              <div className="text-[11px] text-(--st-text-muted)">
                Teks ini akan tampil di halaman pembayaran customer.
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-(--st-text)">Gambar QRIS</label>
                <label className="inline-flex items-center gap-2 text-xs text-(--st-text-muted)">
                  <input type="checkbox" name="qris_clear" />
                  Hapus QRIS
                </label>
              </div>
              <QrisUploadField name="qris" currentUrl={settings.qris_image_url} />
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button asChild variant="outline">
                <a href="/seller">Kembali</a>
              </Button>
              <SubmitButton pendingText="Menyimpan...">Simpan</SubmitButton>
            </div>
          </form>
        </section>
      </div>
    </PageShell>
  );
}
