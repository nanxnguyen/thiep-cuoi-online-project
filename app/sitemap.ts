import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap { const base = "https://moc-wedding.chatgpt.site"; return ["", "/templates", "/thiep-cuoi-online-mien-phi", "/tao-thiep-cuoi", "/qr-tien-mung", "/tin-nhan-moi-cuoi", "/cong-cu-dam-cuoi"].map((path, index) => ({ url: `${base}${path}`, priority: index === 0 ? 1 : .8, changeFrequency: "weekly" })); }
