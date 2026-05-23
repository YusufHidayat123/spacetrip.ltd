import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Needed for product image uploads via Server Actions (multipart FormData)
    // Increase carefully; for production consider direct-to-storage uploads.
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
