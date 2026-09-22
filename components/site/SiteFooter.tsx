import Link from "next/link";

const columns = [
  {
    title: "Khám phá",
    links: [
      { href: "/templates", label: "Mẫu thiệp" },
      { href: "/tinh-nang", label: "Tính năng" },
      { href: "/bang-gia", label: "Bảng giá" },
      { href: "/studio", label: "Tạo thiệp" },
    ],
  },
  {
    title: "Hướng dẫn",
    links: [
      { href: "/tao-thiep-cuoi", label: "Cách tạo thiệp cưới" },
      { href: "/thiep-cuoi-online-mien-phi", label: "Thiệp cưới online miễn phí" },
      { href: "/tro-giup", label: "Trợ giúp" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Công cụ",
    links: [
      { href: "/qr-tien-mung", label: "QR tiền mừng" },
      { href: "/tin-nhan-moi-cuoi", label: "Tin nhắn mời cưới" },
      { href: "/cong-cu-dam-cuoi", label: "Tất cả công cụ" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              M
            </span>
            MỘC
          </Link>
          <p>Thiệp cưới online nhẹ nhàng và hiện đại. Gửi qua Zalo, khách xác nhận và mừng cưới ngay trên thiệp.</p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="footer__title">{c.title}</p>
            <ul>
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="footer__legal">
        <span>© 2026 MỘC Wedding. Làm với tình yêu cho những khởi đầu đáng nhớ.</span>
        <nav aria-label="Pháp lý">
          <Link href="/dieu-khoan">Điều khoản</Link>
          <Link href="/quyen-rieng-tu">Quyền riêng tư</Link>
        </nav>
      </div>
    </footer>
  );
}
