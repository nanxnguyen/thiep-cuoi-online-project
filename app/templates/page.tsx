import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { GalleryCatalog, GalleryFaq } from "@/components/templates/GalleryCatalog";
import { colors, templates } from "@/lib/templates";
import "@/components/templates/gallery.css";

export const metadata: Metadata = {
  title: "Mẫu thiệp cưới",
  description: "Mẫu thiệp cưới online thiết kế riêng cho MỘC: chữ lớn, tối giản, cổ điển, vườn xanh, đỏ son, ngọc bích, thủy mặc và phong cách Hàn.",
  alternates: { canonical: "/templates" },
};

// design/Mau Thiep v2.dc.html. Copy that promises a paid plan ("3 ngày dùng thử", "Ưng mới trả", "Một giá cho mọi mẫu")
// states the free product instead; everything else is value for value.
const COLLECTIONS = [
  ["Màu đỏ", colors.do.deep], ["Xanh rêu", colors.xanh.deep], ["Lam", colors.lam.deep], ["Vàng kim", colors.xanh.gold], ["Chữ Hỷ", "var(--accent)"],
  ["Truyền thống", colors.dodam.deep], ["Tối giản", colors.muc.deep], ["Hoa", colors.hong.deep], ["Sân vườn", colors.oliu.deep], ["Châu Âu", colors.vang.deep],
] as const;
const FAQ = [
  ["Tạo xong rồi có đổi mẫu được không?", "Được. Bạn đổi mẫu bất cứ lúc nào trong Studio. Tên, ngày, địa điểm và ảnh đã nhập được giữ nguyên khi chuyển sang mẫu mới."],
  ["Có được dùng thử miễn phí không?", "Mọi mẫu đều tạo miễn phí và dùng đầy đủ tính năng, không cần thẻ ngân hàng."],
  ["Mẫu nào hợp với đám cưới của tôi?", "Tiệc truyền thống hợp Song Hỷ hoặc Hỷ Sự. Tiệc sân vườn hợp Hoa Nhài, Vườn Ươm. Tiệc hiện đại hợp Nét Mực, Bìa Báo. Bạn có thể xem thử từng mẫu trước khi quyết định."],
  ["Mỗi mẫu có bao nhiêu màu?", "Mỗi mẫu có từ 2 đến 4 phiên bản màu. Bấm vào chấm màu dưới mỗi thẻ để xem trước ngay."],
] as const;

export default function TemplatesPage() {
  return (
    <div className="gal">
      <SiteHeader />
      <section className="gal-hero">
        <div>
          <div className="gal-hero__kicker">
            <span aria-hidden="true" />
            BỘ SƯU TẬP MẪU THIỆP
          </div>
          <h1>
            Chọn cảm giác
            <br />
            <em>đúng là mình.</em>
          </h1>
        </div>
        <div className="gal-hero__side">
          <p>Mỗi mẫu có một nhịp điệu riêng. Đổi mẫu lúc nào cũng được, nội dung của bạn vẫn còn nguyên.</p>
          <div className="gal-stats">
            <div>
              <span>Miễn phí</span>
              <span>khi tạo thiệp</span>
            </div>
            <div>
              <span>{templates.length} mẫu</span>
              <span>thiết kế riêng</span>
            </div>
            <div>
              <span>0đ</span>
              <span>mọi tính năng</span>
            </div>
          </div>
        </div>
      </section>

      <GalleryCatalog />

      <section className="gal-discover">
        <div className="gal-suggest">
          <span className="gal-kicker">GỢI Ý MẪU</span>
          <h3>Chưa thấy mẫu ưng ý?</h3>
          <p>Kể cho Mộc nghe bạn đang tìm gì: màu chủ đạo, không khí buổi tiệc, một hình ảnh bạn thích. Mẫu mới được thiết kế mỗi tháng theo gợi ý của các cặp đôi.</p>
          <form action="/tro-giup">
            <input name="q" aria-label="Gợi ý mẫu" placeholder="Ví dụ: tông xanh rêu, tiệc sân vườn ở Đà Lạt" />
            <button type="submit">Gửi gợi ý</button>
          </form>
        </div>
        <div className="gal-discover__side">
          <div className="gal-collections">
            <span className="gal-kicker">BỘ SƯU TẬP</span>
            <div>
              {COLLECTIONS.map(([label, color]) => (
                <Link href="/studio" key={label}>
                  <span style={{ background: color }} />
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="gal-links">
            <Link href="/studio">
              <span>Hướng dẫn</span>
              <span>Tạo thiệp trong 10 phút</span>
              <span>Xem từng bước →</span>
            </Link>
            <Link href="/bang-gia">
              <span>Bảng giá</span>
              <span>Miễn phí mọi mẫu</span>
              <span>Xem bảng giá →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="gal-faq">
        <div>
          <div>
            <span className="gal-kicker">HỎI ĐÁP</span>
            <h2>
              Trước khi
              <br />
              <em>bạn chọn</em>
            </h2>
          </div>
          <GalleryFaq items={FAQ} />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
