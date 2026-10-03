import { posts } from "./blog/index.ts";
import { templates } from "./templates.ts";

const staticRoutes = [
  "/", "/account", "/bang-gia", "/blog", "/cong-cu-dam-cuoi", "/demo", "/dieu-khoan",
  "/qr-tien-mung", "/quyen-rieng-tu", "/studio", "/tao-thiep-cuoi",
  "/templates", "/thiep-cuoi-online-mien-phi", "/tin-nhan-moi-cuoi",
  "/tro-giup", "/ung-ho", "/thiet-ke-thiep-rieng", "/cong-cu/tao-qr", "/cong-cu/nen-anh", "/cong-cu/nen-video",
  "/cong-cu/save-the-date", "/cong-cu/tin-nhan-moi", "/cong-cu/danh-sach-khach",
] as const;

export const PUBLIC_ROUTES: readonly string[] = [
  ...staticRoutes,
  ...templates.map((template) => `/templates/${template.id}`),
  ...posts.map((post) => `/blog/${post.slug}`),
] as const;
