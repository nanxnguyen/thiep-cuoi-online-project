import type { NextConfig } from "next";
import { securityHeaders } from "./lib/server/security";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  // Lets a production build for perf measurement land beside a running `next dev` (NEXT_DIST_DIR=.next-perf next build).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Workers Free (10ms CPU): tắt inlineCss — CSS phục vụ dưới dạng file static cache
  // thay vì inline vào HTML mỗi request (đỡ CPU/memory SSR).
  // cpus: 4 caps the static-generation worker pool (default = all 10 cores, ~9 workers x ~1 GB) so a build next to
  // Docker + VS Code does not exhaust swap and get SIGKILLed (exit 137).
  experimental: { inlineCss: false, cpus: 4 },
  // A stray yarn.lock in the home directory otherwise makes Next infer the wrong workspace root.
  turbopack: { root: process.cwd() },
  // Workers Free: no request-time image work. lib/image-loader.ts serves WebP widths pre-built by
  // scripts/build-photo-variants.mjs (run by `prebuild:next`).
  images: { loaderFile: "./lib/image-loader.ts" },
  async headers() {
    return [{ source: "/(.*)", headers: Object.entries(securityHeaders()).map(([key, value]) => ({ key, value })) }];
  },
  // /templates/[id] is prerendered; the two query strings that need per-request rendering go to a dynamic twin.
  async rewrites() {
    return {
      beforeFiles: ["preview", "gate"].map((key) => ({
        source: "/templates/:id",
        // value ".+" is required: OpenNext's query matcher tests `new RegExp(value ?? "")` even when the key is absent,
        // so a value-less `has` matched every request and served the noindex twin for all 50 template pages.
        has: [{ type: "query" as const, key, value: ".+" }],
        destination: "/templates/:id/live",
      })),
      afterFiles: [],
      fallback: [],
    };
  },
  // Trang /tinh-nang/* đã bỏ: giữ link cũ không gãy (SEO/bookmark).
  async redirects() {
    return [
      { source: "/tinh-nang/:slug*", destination: "/", permanent: true },
      { source: "/cong-cu/so-do-cho-ngoi", destination: "/cong-cu-dam-cuoi", permanent: true },
      // Plain-HTTP visits reached Workers and got a full 200 (duplicate content). Cloudflare's cf-visitor header
      // carries the visitor's scheme; only Cloudflare sets it, so local `next dev` over http never loops.
      {
        source: "/:path*",
        has: [
          { type: "header" as const, key: "cf-visitor", value: '.*"scheme":"http".*' },
          { type: "host" as const, value: "(?<host>.+)" },
        ],
        destination: "https://:host/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
