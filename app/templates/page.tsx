import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { GalleryCatalog } from "@/components/templates/GalleryCatalog";
import { ScaledFrame } from "@/components/templates/ScaledFrame";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { sampleContent } from "@/lib/content";
import { allFontClasses } from "@/lib/fonts";
import { colors, getTemplate, templates } from "@/lib/templates";
import "@/components/templates/gallery.css";

export const metadata: Metadata = {
  title: "Mẫu thiệp cưới",
  description: "Mẫu thiệp cưới online thiết kế riêng cho MỘC: chữ lớn, tối giản, cổ điển, vườn xanh, đỏ son, ngọc bích, thủy mặc và phong cách Hàn.",
  alternates: { canonical: "/templates" },
};

const RANKING = ["song-hy", "song-phung", "song-cua", "hoang-gia", "chan-dung", "hy-su", "bao-hy"];
const COLLECTIONS = [
  ["Màu đỏ", colors.do.deep], ["Xanh rêu", colors.xanh.deep], ["Lam", colors.lam.deep], ["Vàng kim", colors.xanh.gold],
  ["Chữ Hỷ", "var(--accent)"], ["Truyền thống", colors.dodam.deep], ["Tối giản", colors.muc.deep], ["Hoa", colors.hong.deep],
] as const;
const FAQ = [
  ["Tạo xong rồi có đổi mẫu được không?", "Được. Bạn đổi mẫu bất cứ lúc nào trong Studio. Tên, ngày, địa điểm và ảnh đã nhập vẫn được giữ nguyên."],
  ["Có được dùng thử miễn phí không?", "Mọi mẫu đều tạo miễn phí và dùng thử đầy đủ tính năng trong giai đoạn hiện tại."],
  ["Mẫu nào hợp với đám cưới của tôi?", "Tiệc truyền thống hợp Song Hỷ hoặc Hỷ Sự; tiệc sân vườn hợp Hoa Nhài, Vườn Ươm; tiệc hiện đại hợp Nét Mực, Bìa Báo."],
  ["Mỗi mẫu có bao nhiêu màu?", "Mỗi mẫu có từ hai đến bốn màu. Bạn có thể đổi màu trước và sau khi tạo thiệp."],
] as const;

export default function TemplatesPage() {
  const sample = sampleContent();
  const content = { ...sample, couple: { ...sample.couple, heroPhoto: "" } };
  return (
    <div className={allFontClasses}>
      <SiteHeader />
      <main className="templates-page">
        <section className="templates-hero">
          <div>
            <p className="eyebrow">Bộ sưu tập mẫu thiệp</p>
            <h1>
              Chọn cảm giác
              <br />
              <em>đúng là mình.</em>
            </h1>
          </div>
          <div className="templates-hero__side">
            <p className="lede">Mỗi mẫu có một nhịp điệu riêng. Đổi mẫu lúc nào cũng được, nội dung của bạn vẫn còn nguyên.</p>
            <Link className="button-ghost" href="/demo">Mở demo tương tác →</Link>
            <div className="templates-stats"><strong>{templates.length}</strong><span>mẫu thiết kế riêng</span><strong>0đ</strong><span>khi tạo thiệp</span></div>
          </div>
        </section>

        <section className="templates-ranking on-dark" aria-labelledby="ranking-title">
          <div className="templates-ranking__head">
            <div>
              <p className="eyebrow">Bảng xếp hạng · tháng này</p>
              <h2 id="ranking-title">Được các cặp đôi <em>chọn nhiều nhất.</em></h2>
            </div>
            <p className="lede">Xem nhanh những mẫu đang được yêu thích trước khi chọn phong cách cho ngày vui.</p>
          </div>
          <div className="templates-ranking__rail">
            {RANKING.map((id, index) => {
              const t = getTemplate(id)!;
              return <Link href={`/templates/${t.id}`} key={t.id} className="templates-rank-card">
                <div className="templates-rank-card__thumb"><span>{String(index + 1).padStart(2, "0")}</span><ScaledFrame className="tpl-thumb"><InvitationRenderer only="cover" mode="preview" gate={false} template={t} content={content} /></ScaledFrame></div>
                <strong>{t.name}</strong><small>{t.blurb}</small>
              </Link>;
            })}
          </div>
        </section>

        <section className="section templates-catalog">
          <div className="templates-catalog__head">
            <div><p className="eyebrow">Tất cả mẫu thiệp</p><h2>Tìm một mẫu <em>vừa mắt.</em></h2></div>
            <p className="lede">Lọc theo phong cách, mở xem trước, rồi dùng ngay trong Studio.</p>
          </div>
          <GalleryCatalog />
        </section>

        <section className="templates-discovery section">
          <div className="templates-suggest">
            <p className="eyebrow">Gợi ý mẫu</p>
            <h3>Chưa thấy mẫu ưng ý?</h3>
            <p>Kể cho MỘC nghe màu chủ đạo và không khí buổi tiệc. Mẫu mới được thiết kế theo gợi ý của các cặp đôi.</p>
            <Link className="button-ghost" href="/tro-giup">Gửi gợi ý →</Link>
          </div>
          <div className="templates-collections">
            <p className="eyebrow">Bộ sưu tập</p>
            <div>{COLLECTIONS.map(([label, color]) => <Link href="/studio" key={label}><i style={{ background: color }} />{label}</Link>)}</div>
            <div className="templates-discovery__links"><Link href="/studio"><small>Hướng dẫn</small><strong>Tạo thiệp trong 10 phút →</strong></Link><Link href="/bang-gia"><small>Bảng giá</small><strong>Miễn phí mọi mẫu →</strong></Link></div>
          </div>
        </section>

        <section className="templates-faq">
          <div><p className="eyebrow">Hỏi đáp</p><h2>Trước khi<br /><em>bạn chọn.</em></h2></div>
          <div className="templates-faq__list">{FAQ.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
