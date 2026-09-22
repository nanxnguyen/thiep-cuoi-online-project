import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // A stray yarn.lock in the home directory otherwise makes Next infer the wrong workspace root.
  turbopack: { root: process.cwd() },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
