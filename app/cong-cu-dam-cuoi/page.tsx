import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import "@/components/tools/tools.css";

export const metadata: Metadata = {
  title: "Công cụ đám cưới miễn phí",
  description: "Các công cụ miễn phí cho đám cưới: tạo mã QR, nén ảnh, nén video, soạn tin nhắn mời, danh sách khách, sơ đồ chỗ ngồi và ảnh save the date — chạy ngay trên trình duyệt, không cần đăng nhập.",
  alternates: { canonical: "/cong-cu-dam-cuoi" },
};

// design/Cong Cu.dc.html: [name, desc, href, glyph, card, ink, glyph chip] with the design's own colours.
const TOOLS = [
  ["Tạo mã QR", "Dán link thiệp, nhận mã QR để in lên thiệp giấy hoặc bảng chào.", "/cong-cu/tao-qr", "▦", "--surface", "--ink", "--danger-bg"],
  ["Nén ảnh", "Giảm ảnh về tối đa 1600px, dưới 2MB, ngay trên máy của bạn.", "/cong-cu/nen-anh", "◐", "--paper-alt", "--ink", "--surface"],
  ["Nén video", "Thu nhỏ video phóng sự cưới trước khi đưa vào thiệp.", "/cong-cu/nen-video", "▶", "--night", "--on-dark", "--cd-tile"],
  ["Tin nhắn mời", "Gợi ý lời mời theo hai giọng điệu: trang trọng hoặc thân mật.", "/cong-cu/tin-nhan-moi", "✎", "--surface", "--ink", "--ok-bg"],
  ["Danh sách khách", "Thêm, sửa, nhập và xuất danh sách khách bằng CSV.", "/cong-cu/danh-sach-khach", "☰", "--ok-bg", "--ink", "--surface"],
  ["Sơ đồ chỗ ngồi", "Kéo thả khách vào từng bàn tiệc, chạm để chọn trên điện thoại.", "/cong-cu/so-do-cho-ngoi", "◎", "--accent", "--surface", "--accent-deep"],
  ["Save the date", "Thiết kế ảnh báo ngày cưới và tải về PNG để đăng mạng xã hội.", "/cong-cu/save-the-date", "✦", "--surface", "--ink", "--paper-alt"],
] as const;

export default function Page() {
  return (
    <>
      <SiteHeader />
      <ScrollReveal all threshold={0.1} />
      <section className="tools-hero">
        <div className="tools-hero__head">
          <div className="tools-hero__kicker">
            <span aria-hidden="true" />
            CÔNG CỤ ĐÁM CƯỚI
          </div>
          <h1>
            Bảy việc nhỏ,
            <br />
            <em>làm ngay tại đây.</em>
          </h1>
        </div>
        <div className="tools-hero__side">
          {/* Design says "dữ liệu không rời khỏi máy" + "Chạy offline được"; QR images come from api.qrserver.com and video
              compression downloads its engine, so the copy states what is actually true. */}
          <p>Không cần đăng nhập. Công cụ chạy ngay trên trình duyệt của bạn; ảnh, video và danh sách khách không tải lên máy chủ của Mộc.</p>
          <div className="tools-hero__chips">
            <span>Không đăng nhập</span>
            <span>Chạy trên trình duyệt</span>
            <span>Miễn phí</span>
          </div>
        </div>
      </section>
      <main className="tools-grid">
        {TOOLS.map(([name, desc, href, glyph, bg, fg, chip], i) => (
          <Link
            className="tool-tile"
            href={href}
            key={href}
            data-reveal="1"
            data-delay={(i % 3) * 100}
            style={{ "--tile-bg": `var(${bg})`, "--tile-fg": `var(${fg})`, "--tile-chip": `var(${chip})` } as CSSProperties}
          >
            <div className="tool-tile__orbit" aria-hidden="true" />
            <div className="tool-tile__top">
              <span className="tool-tile__glyph" aria-hidden="true" style={{ animationDelay: `${i * 0.3}s` }}>
                {glyph}
              </span>
              <span className="tool-tile__n">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <span className="tool-tile__name">{name}</span>
            <span className="tool-tile__desc">{desc}</span>
            <span className="tool-tile__go">Mở công cụ →</span>
          </Link>
        ))}
      </main>
      <SiteFooter />
    </>
  );
}
