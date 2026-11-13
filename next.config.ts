import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 75 = standard, 85 = ekstra skarp (bruges til det store forsidebillede)
    qualities: [75, 85],
  },
};

export default nextConfig;
