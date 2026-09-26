import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { featureArt, features } from "@/lib/marketing/features";
import "./features.css";

export const metadata: Metadata = {
  title: "Tính năng",
  description: "Xác nhận tham dự, sổ lưu bút, mừng cưới bằng QR, bản đồ, đếm ngược, album ảnh, nhạc nền và phong bì ghi tên khách: những gì một tấm thiệp cưới online của MỘC làm được.",
  alternates: { canonical: "/tinh-nang" },
};

// design/Tinh Nang.dc.html: copy and colours come from featureArt, the design's own feature table.
export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <ScrollReveal easeOpacity />
      <section className="features-hero">
        <div className="features-hero__head">
          <div className="features-kicker">
            <span aria-hidden="true" />8 TÍNH NĂNG
          </div>
          <h1>
            Không chỉ là
            <br />
            <em>một tấm thiệp.</em>
          </h1>
        </div>
        <p>Từ lúc khách mở phong bì đến khi gửi lời chúc, mọi thứ diễn ra trong cùng một đường link. Bạn không cần thêm ứng dụng nào khác.</p>
      </section>
      <nav className="features-jump" aria-label="Tính năng">
        <div>
          {features.map((f) => (
            <a key={f.slug} href={`#${f.slug}`}>
              {featureArt[f.slug].title}
            </a>
          ))}
        </div>
      </nav>
      <div className="features-list">
        {features.map((f, index) => {
          const art = featureArt[f.slug];
          return (
            <section key={f.slug} id={f.slug} className="features-row" data-reveal="1">
              <div className="features-row__copy" style={{ order: index % 2 ? 2 : 1 }}>
                <span className="features-row__number">{String(index + 1).padStart(2, "0")}</span>
                <h2>{art.title}</h2>
                <p>{art.desc}</p>
                <div className="features-row__points">
                  {art.bullets.map((b) => (
                    <div key={b}>
                      <span aria-hidden="true" />
                      {b}
                    </div>
                  ))}
                </div>
                <Link href={`/tinh-nang/${f.slug}`}>Tìm hiểu thêm →</Link>
              </div>
              <div className="features-row__art" style={{ order: index % 2 ? 1 : 2, background: art.bg, color: art.ink }} aria-hidden="true">
                <div className="features-row__ring" />
                <div className="features-row__glyph">
                  <span>{art.glyph}</span>
                  <span>{art.caption}</span>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </MarketingLayout>
  );
}
