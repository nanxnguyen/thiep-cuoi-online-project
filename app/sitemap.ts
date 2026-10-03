import type { MetadataRoute } from "next";
import { SITE_URL as base } from "@/lib/site";
import { posts } from "@/lib/blog";
import { SEO_PAGES } from "@/lib/seo";
import { templates } from "@/lib/templates";

// Dates are fixed (bump `lastModified` in lib/seo.ts when a page's content changes): `new Date()` would tell
// crawlers every page changed on every request, which makes them ignore the field.
const TEMPLATE_LASTMOD = "2026-10-01";

// Marketing pages, tools, legal pages and template previews. Private routes (/studio, /account, /invite) stay out.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...Object.entries(SEO_PAGES).map(([path, p]) => ({
      url: `${base}${path === "/" ? "" : path}`,
      lastModified: new Date(p.lastModified),
      priority: p.priority,
      changeFrequency: p.changeFrequency,
    })),
    ...templates.map((t) => ({ url: `${base}/templates/${t.id}`, lastModified: new Date(TEMPLATE_LASTMOD), priority: 0.7, changeFrequency: "monthly" as const })),
    ...posts.map((p) => ({ url: `${base}/blog/${p.slug}`, lastModified: new Date(p.updated), priority: 0.7, changeFrequency: "monthly" as const })),
  ];
}
