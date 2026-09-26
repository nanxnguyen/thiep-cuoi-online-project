import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import "@/components/tools/tools.css";

export const metadata: Metadata = {
  title: "Công cụ đám cưới miễn phí",
  description: "Các công cụ miễn phí cho đám cưới: tạo mã QR, nén ảnh, nén video, soạn tin nhắn mời, danh sách khách, sơ đồ chỗ ngồi và ảnh save the date — chạy ngay trên trình duyệt, không cần đăng nhập.",
  alternates: { canonical: "/cong-cu-dam-cuoi" },
};

// design/Cong Cu.dc.html. `tone` picks the card colourway from the design (paper / alt / dark / jade / lacquer).
const TOOLS = [
  ["Tạo mã QR", "Dán link thiệp, nhận mã QR để in lên thiệp giấy hoặc bảng chào.", "/cong-cu/tao-qr", "▦", "surface"],
  ["Nén ảnh", "Giảm ảnh về tối đa 1600px, dưới 2MB, ngay trên máy của bạn.", "/cong-cu/nen-anh", "◐", "alt"],
  ["Nén video", "Thu nhỏ video phóng sự cưới trước khi đưa vào thiệp.", "/cong-cu/nen-video", "▶", "dark"],
  ["Tin nhắn mời", "Gợi ý lời mời theo hai giọng điệu: trang trọng hoặc thân mật.", "/cong-cu/tin-nhan-moi", "✎", "surface-jade"],
  ["Danh sách khách", "Thêm, sửa, nhập và xuất danh sách khách bằng CSV.", "/cong-cu/danh-sach-khach", "☰", "jade"],
  ["Sơ đồ chỗ ngồi", "Kéo thả khách vào từng bàn tiệc, chạm để chọn trên điện thoại.", "/cong-cu/so-do-cho-ngoi", "◎", "lacquer"],
  ["Save the date", "Thiết kế ảnh báo ngày cưới và tải về PNG để đăng mạng xã hội.", "/cong-cu/save-the-date", "✦", "surface-alt"],
] as const;

export default function Page() {
  return (
    <>
      <SiteHeader />
      <section className="tools-hero">
        <div className="anim-fade-up">
          <p className="eyebrow">Công cụ đám cưới</p>
          <h1>
            Bảy việc nhỏ,
            <br />
            <em>làm ngay tại đây.</em>
          </h1>
        </div>
        <div className="anim-fade-up" style={{ animationDelay: "0.3s" }}>
          {/* Design says "dữ liệu không rời khỏi máy" + "Chạy offline được"; QR images come from api.qrserver.com and video
              compression downloads its engine, so the copy states what is actually true. */}
          <p>Không cần đăng nhập. Công cụ chạy ngay trên trình duyệt của bạn; ảnh, video và danh sách khách không tải lên máy chủ của MỘC.</p>
          <div className="tools-hero__chips">
            <span>Không đăng nhập</span>
            <span>Chạy trên trình duyệt</span>
            <span>Miễn phí</span>
          </div>
        </div>
      </section>
      <main className="tools-grid">
        {TOOLS.map(([name, desc, href, glyph, tone], i) => (
          <Link className={`tool-tile tool-tile--${tone}`} href={href} key={href}>
            <i className="tool-tile__orbit" aria-hidden="true" />
            <div className="tool-tile__top">
              <span className="tool-tile__glyph" aria-hidden="true" style={{ animationDelay: `${i * 0.3}s` }}>
                {glyph}
              </span>
              <span className="tool-tile__n">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <strong>{name}</strong>
            <span>{desc}</span>
            <b>Mở công cụ →</b>
          </Link>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
