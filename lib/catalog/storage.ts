import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function uploadProductImage({
  productId,
  file,
}: {
  productId: string;
  file: File;
}) {
  const bucket =
    process.env.SUPABASE_PRODUCT_IMAGES_BUCKET || "product-images";

  const supabase = createSupabaseAdminClient();

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";

  const fileName = `${crypto.randomUUID()}.${safeExt}`;
  const storagePath = `${productId}/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const contentType = file.type || `image/${safeExt}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, arrayBuffer, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) throw error;

  return {
    bucket,
    storagePath,
  };
}
