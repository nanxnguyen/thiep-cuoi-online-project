import type { NextConfig } from "next";
import { securityHeaders } from "./lib/server/security";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  // A stray yarn.lock in the home directory otherwise makes Next infer the wrong workspace root.
  turbopack: { root: process.cwd() },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: Object.entries(securityHeaders()).map(([key, value]) => ({ key, value })) }];
  },
  // Trang /tinh-nang/* đã bỏ: giữ link cũ không gãy (SEO/bookmark).
  async redirects() {
    return [{ source: "/tinh-nang/:slug*", destination: "/", permanent: true }];
  },
};

export default nextConfig;
