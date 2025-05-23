import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["https://yxssxrtahjrrrjdwtbmg.supabase.co"],
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        ws: false,
      };
    }
    return config;
  },
};

export default nextConfig;
