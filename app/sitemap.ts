import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { return [{ url: "https://moc-wedding.chatgpt.site", priority: 1, changeFrequency: "weekly" }, { url: "https://moc-wedding.chatgpt.site/templates", priority: .8, changeFrequency: "weekly" }]; }
