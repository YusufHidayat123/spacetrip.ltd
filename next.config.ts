import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

let supabaseHost: string | null = null;
let supabaseProtocol: "http" | "https" = "https";
try {
  if (supabaseUrl) {
    const parsed = new URL(supabaseUrl);
    supabaseHost = parsed.hostname;
    supabaseProtocol = parsed.protocol === "http:" ? "http" : "https";
  }
} catch {
  supabaseHost = null;
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
      ...(supabaseHost ? [{ protocol: supabaseProtocol, hostname: supabaseHost }] : []),
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
