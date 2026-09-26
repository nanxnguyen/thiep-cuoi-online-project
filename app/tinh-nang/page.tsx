import type { Metadata } from "next";
import Link from "next/link";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { featureArt, features } from "@/lib/marketing/features";
import "./features.css";


export const metadata: Metadata = {
  title: "Tính năng",
  description: "Xác nhận tham dự, sổ lưu bút, mừng cưới bằng QR, bản đồ, đếm ngược, album ảnh, nhạc nền và phong bì ghi tên khách: những gì một tấm thiệp cưới online của MỘC làm được.",
  alternates: { canonical: "/tinh-nang" },
};

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <section className="features-hero"><div><p className="features-kicker">8 TÍNH NĂNG</p><h1>Không chỉ là<br /><em>một tấm thiệp.</em></h1></div><p>Từ lúc khách mở phong bì đến khi gửi lời chúc, mọi thứ diễn ra trong cùng một đường link. Bạn không cần thêm ứng dụng nào khác.</p></section>
      <nav className="features-jump" aria-label="Tính năng"><div>{features.map((f) => <a key={f.slug} href={`#${f.slug}`}>{f.name}</a>)}</div></nav>
      <div className="features-list">{features.map((f, index) => <section key={f.slug} id={f.slug} className="features-row"><div className="features-row__copy"><span className="features-row__number">{String(index + 1).padStart(2, "0")}</span><h2>{f.name}</h2><p>{f.intro}</p><div className="features-row__points">{f.points.map((point) => <span key={point.title}>{point.title}</span>)}</div><Link href={`/tinh-nang/${f.slug}`}>Tìm hiểu thêm →</Link></div><div className="features-row__art" style={{ background: featureArt[f.slug].bg, color: featureArt[f.slug].ink }}><span className="features-row__ring" aria-hidden="true" /><div><strong>{featureArt[f.slug].glyph}</strong><small>{featureArt[f.slug].caption}</small></div></div></section>)}</div>
    </MarketingLayout>
  );
}
