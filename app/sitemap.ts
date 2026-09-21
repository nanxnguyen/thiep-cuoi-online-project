import type { MetadataRoute } from "next";
import { SITE_URL as base } from "@/lib/site";
import { posts } from "@/lib/marketing/blog";
import { features } from "@/lib/marketing/features";
import { templates } from "@/lib/templates";

const pages = ["", "/templates", "/tinh-nang", "/bang-gia", "/tro-giup", "/blog", "/thiep-cuoi-online-mien-phi", "/tao-thiep-cuoi", "/qr-tien-mung", "/tin-nhan-moi-cuoi", "/cong-cu-dam-cuoi"];
const legal = ["/dieu-khoan", "/quyen-rieng-tu"];

// Marketing pages, one page per feature, blog post and template preview (all static, public and worth indexing), and the legal pages.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...pages.map((path, index) => ({ url: `${base}${path}`, priority: index === 0 ? 1 : 0.8, changeFrequency: "weekly" as const })),
    ...features.map((f) => ({ url: `${base}/tinh-nang/${f.slug}`, priority: 0.7, changeFrequency: "monthly" as const })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: p.date, priority: 0.6, changeFrequency: "monthly" as const })),
    ...templates.map((t) => ({ url: `${base}/templates/${t.id}`, priority: 0.7, changeFrequency: "monthly" as const })),
    ...legal.map((path) => ({ url: `${base}${path}`, priority: 0.3, changeFrequency: "yearly" as const })),
  ];
}
