import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

type SeoLandingPageProps = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  points: string[];
  related: { href: string; label: string; description: string }[];
};

export function SeoLandingPage({ eyebrow, title, description, points, related }: SeoLandingPageProps) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="seo-hero">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{description}</p>
          <div className="actions">
            <Link className="button-primary" href="/studio">
              Bắt đầu miễn phí
            </Link>
            <Link className="button-ghost" href="/templates">
              Xem mẫu thiệp
            </Link>
          </div>
        </section>
        <section className="seo-content">
          <div>
            <p className="eyebrow">Vì sao chọn MỘC</p>
            <h2>
              Đẹp, dễ dùng
              <br />
              <em>và có câu chuyện.</em>
            </h2>
          </div>
          <div className="seo-points">
            {points.map((point, index) => (
              <div key={point}>
                <span>{index + 1}</span>
                <p>{point}</p>
              </div>
            ))}
          </div>
        </section>
        {related.length > 0 && (
          <section className="section seo-related">
            <p className="eyebrow">Khám phá thêm</p>
            <h2 style={{ margin: "18px 0 32px" }}>
              Có thể bạn
              <br />
              <em>cũng quan tâm.</em>
            </h2>
            <div className="related-grid">
              {related.map((item) => (
                <Link className="related-card" href={item.href} key={item.href}>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                  <span>Khám phá →</span>
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="seo-cta">
          <p className="eyebrow">MỘC Wedding</p>
          <h2>
            Một lời mời
            <br />
            <em>thật riêng.</em>
          </h2>
          <Link className="button-primary" href="/studio">
            Tạo thiệp ngay
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
