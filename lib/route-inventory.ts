import { templates } from "./templates.ts";

const staticRoutes = [
  "/", "/account", "/bang-gia", "/cong-cu-dam-cuoi", "/demo", "/dieu-khoan",
  "/qr-tien-mung", "/quyen-rieng-tu", "/studio", "/tao-thiep-cuoi",
  "/templates", "/thiep-cuoi-online-mien-phi", "/tin-nhan-moi-cuoi",
  "/tro-giup", "/ung-ho", "/cong-cu/tao-qr", "/cong-cu/nen-anh", "/cong-cu/nen-video",
  "/cong-cu/save-the-date", "/cong-cu/so-do-cho-ngoi", "/cong-cu/tin-nhan-moi", "/cong-cu/danh-sach-khach",
] as const;

export const PUBLIC_ROUTES: readonly string[] = [
  ...staticRoutes,
  ...templates.map((template) => `/templates/${template.id}`),
] as const;
