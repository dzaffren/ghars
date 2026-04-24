import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/sw.js",
      headers: [
        { key: "Service-Worker-Allowed", value: "/" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      ],
    },
  ],
  // Allow QF CDN images if needed
  images: {
    remotePatterns: [
      { hostname: "api-docs.quran.foundation" },
    ],
  },
};

export default nextConfig;
