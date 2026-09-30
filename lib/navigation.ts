export type NavigationLink = { href: string; label: string };

export const NAV_LINKS: readonly NavigationLink[] = [
  { href: "/templates", label: "Mẫu thiệp" },
  { href: "/cong-cu-dam-cuoi", label: "Công cụ" },
  { href: "/ung-ho", label: "Ủng hộ" },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  // the tool pages live under /cong-cu/*, the hub at /cong-cu-dam-cuoi (design: every CC page marks "Công cụ")
  if (href === "/cong-cu-dam-cuoi" && pathname.startsWith("/cong-cu/")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const FOOTER_COLUMNS: readonly { title: string; links: readonly NavigationLink[] }[] = [
  {
    title: "Sản phẩm",
    links: [
      { href: "/templates", label: "Mẫu thiệp" },
      { href: "/bang-gia", label: "Bảng giá" },
      { href: "/studio", label: "Tạo thiệp" },
      { href: "/account", label: "Thiệp của tôi" },
    ],
  },
  {
    title: "Công cụ",
    links: [
      { href: "/cong-cu-dam-cuoi", label: "Tất cả công cụ" },
      { href: "/cong-cu/danh-sach-khach", label: "Danh sách khách" },
      { href: "/cong-cu/save-the-date", label: "Save the date" },
      { href: "/cong-cu/tao-qr", label: "Tạo mã QR" },
      { href: "/cong-cu/nen-anh", label: "Nén ảnh" },
      { href: "/cong-cu/nen-video", label: "Nén video" },
      { href: "/cong-cu/tin-nhan-moi", label: "Tin nhắn mời" },
    ],
  },
  {
    title: "Khám phá",
    links: [
      { href: "/thiep-cuoi-online-mien-phi", label: "Thiệp cưới online miễn phí" },
      { href: "/tao-thiep-cuoi", label: "Tạo thiệp cưới" },
      { href: "/qr-tien-mung", label: "QR tiền mừng cưới" },
      { href: "/tin-nhan-moi-cuoi", label: "Tin nhắn mời cưới" },
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
