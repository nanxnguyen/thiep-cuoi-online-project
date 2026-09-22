import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import "@/app/seo.css";
import "./tools.css";

// Shared shell for the 7 standalone browser tools (Phase 4): same header/footer/hero/related pattern
// as SeoLandingPage, but `children` is an interactive tool body instead of static copy paragraphs.
type Related = { href: string; label: string; description: string };

export function ToolPage({
  eyebrow,
  title,
  description,
  children,
  related = [],
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
  related?: Related[];
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="seo-hero tool-hero">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{description}</p>
        </section>
        <section className="tool-body">
          <h2 className="tool-sr">{eyebrow}</h2>
          {children}
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
            Tạo cả thiệp cưới
            <br />
            <em>chỉ trong Studio.</em>
          </h2>
          <Link className="button-primary" href="/studio">
            Mở Studio
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
