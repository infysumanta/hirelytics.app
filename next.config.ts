import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hirelytics.t3.storage.dev",
      },
    ],
  },
};

// Use next-intl plugin without additional configuration
// The middleware will handle the locale detection
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
