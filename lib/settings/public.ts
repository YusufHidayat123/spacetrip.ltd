import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StoreSettingsPublic = {
  store_name: string;
  payment_instructions: string | null;
  qris_image_url: string | null;
  updated_at: string;
};

export async function getStoreSettingsForCheckout(): Promise<StoreSettingsPublic> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("store_settings")
    .select("store_name,payment_instructions,qris_image_url,updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return (
    (data as StoreSettingsPublic | null) ?? {
      store_name: "Spacetrip",
      payment_instructions:
        "Scan QRIS di bawah, bayar sesuai nominal total, lalu upload bukti bayar.",
      qris_image_url: null,
      updated_at: new Date(0).toISOString(),
    }
  );
}
