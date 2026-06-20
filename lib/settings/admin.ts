import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type StoreSettings = {
  id: string;
  store_name: string;
  payment_instructions: string | null;
  qris_image_url: string | null;
  updated_at: string;
};

export async function adminGetStoreSettings() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("id,store_name,payment_instructions,qris_image_url,updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  // Default fallback (in case table is empty)
  return (
    (data as StoreSettings | null) ?? {
      id: "default",
      store_name: "Spacetrip",
      payment_instructions: "Pay via QRIS, then upload your payment proof.",
      qris_image_url: null,
      updated_at: new Date(0).toISOString(),
    }
  );
}

export async function adminUpsertStoreSettings(input: {
  id?: string | null;
  store_name: string;
  payment_instructions: string | null;
  qris_image_url: string | null;
}) {
  const supabase = createSupabaseAdminClient();

  const payload = {
    store_name: input.store_name,
    payment_instructions: input.payment_instructions,
    qris_image_url: input.qris_image_url,
  };

  const query = input.id
    ? supabase
        .from("store_settings")
        .update(payload)
        .eq("id", input.id)
    : supabase.from("store_settings").insert(payload);

  const { data, error } = await query
    .select("id,store_name,payment_instructions,qris_image_url,updated_at")
    .single();

  if (error) throw error;
  return data as StoreSettings;
}
