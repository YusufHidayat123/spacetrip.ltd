import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

let supabaseHost: string | null = null;
try {
  if (supabaseUrl) supabaseHost = new URL(supabaseUrl).hostname;
} catch {
  supabaseHost = null;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Default Supabase project domains
      { protocol: "https", hostname: "**.supabase.co" },
      // Also allow the exact host from env (in case of custom domains)
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost }] : []),
    ],
  },
  experimental: {
    // Needed for product image uploads via Server Actions (multipart FormData)
    // Increase carefully; for production consider direct-to-storage uploads.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
