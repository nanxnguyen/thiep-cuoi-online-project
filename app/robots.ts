import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent: "*", allow: ["/", "/templates"] , disallow: ["/studio", "/invite/"] }, sitemap: "https://moc-wedding.chatgpt.site/sitemap.xml" }; }
