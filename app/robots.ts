import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Invitations (/invite/), the Studio, account pages and APIs are private by design: never indexed.
// Everything else public (templates, tools, help, pricing) is crawlable.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/invite/", "/account", "/api/", "/docs"] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
