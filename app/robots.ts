import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Invitations (/invite/) and the Studio are private by design: never indexed.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: ["/", "/templates"], disallow: ["/studio", "/invite/"] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
