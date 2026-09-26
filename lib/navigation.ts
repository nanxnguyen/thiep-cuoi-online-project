export type NavigationLink = { href: string; label: string };

export const NAV_LINKS: readonly NavigationLink[] = [
  { href: "/templates", label: "Mẫu thiệp" },
  { href: "/tinh-nang", label: "Tính năng" },
  { href: "/cong-cu-dam-cuoi", label: "Công cụ" },
  { href: "/ung-ho", label: "Ủng hộ" },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const FOOTER_COLUMNS: readonly { title: string; links: readonly NavigationLink[] }[] = [
  {
    title: "Sản phẩm",
    links: [
      { href: "/templates", label: "Mẫu thiệp" },
      { href: "/tinh-nang", label: "Tính năng" },
      { href: "/bang-gia", label: "Bảng giá" },
      { href: "/studio", label: "Tạo thiệp" },
      { href: "/account", label: "Tài khoản" },
    ],
  },
  {
    title: "Công cụ",
    links: [
      { href: "/cong-cu-dam-cuoi", label: "Tất cả công cụ" },
      { href: "/cong-cu/danh-sach-khach", label: "Danh sách khách" },
      { href: "/cong-cu/so-do-cho-ngoi", label: "Sơ đồ chỗ ngồi" },
      { href: "/cong-cu/save-the-date", label: "Save the date" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { href: "/tro-giup", label: "Trợ giúp" },
      { href: "/ung-ho", label: "Ủng hộ" },
    ],
  },
  {
    title: "Pháp lý",
    links: [
      { href: "/dieu-khoan", label: "Điều khoản" },
      { href: "/quyen-rieng-tu", label: "Quyền riêng tư" },
    ],
  },
] as const;

export const FOOTER_LINKS = FOOTER_COLUMNS.flatMap((column) => column.links);
