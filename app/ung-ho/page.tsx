import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import type { CSSProperties } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { DonateCard } from "./DonateCard";
import "./donate.css";
import { PageJsonLd } from "@/components/marketing/PageJsonLd";

export const metadata: Metadata = pageMetadata("/ung-ho");

const rnd = (i: number, n: number) => {
  const x = Math.sin(i * 71.3 + n * 9.1) * 1e4;
  return x - Math.floor(x);
};
const HEARTS = Array.from({ length: 16 }, (_, i) => {
  const d = 6 + rnd(i, 1) * 6;
  return { left: `${rnd(i, 2) * 100}%`, size: 12 + rnd(i, 3) * 18, dur: `${d}s`, delay: `${-rnd(i, 4) * d}s` };
});

// design/Ung Ho.dc.html (05/10/2026 redesign). Deviations in DESIGN.md: no invented "238 supporters" row and
// no named testimonial; the QR is a real VietQR for the owner's account (lib/donate.ts).
export default function DonatePage() {
  return (
    <>
      <SiteHeader />
      <PageJsonLd path="/ung-ho" name="Ủng hộ dự án" />
      <main>
        <section className="donate-hero">
          <div className="donate-hearts" aria-hidden="true">
            {HEARTS.map((h, i) => (
              <span key={i} style={{ left: h.left, fontSize: h.size, animationDuration: h.dur, animationDelay: h.delay } as CSSProperties}>
                ♥
              </span>
            ))}
          </div>
          <div className="donate-hero__inner">
            <div className="donate-hero__copy">
              <span className="donate-hero__heart" aria-hidden="true">♥</span>
              <h1>
                Giữ Mộc sống, <em>miễn phí mãi mãi</em>
              </h1>
              <p>Mỗi tháng Mộc phục vụ hàng nghìn tấm thiệp miễn phí. Chi phí máy chủ và thời gian thiết kế vẫn phải trả — một khoản ủng hộ nhỏ ngay hôm nay giúp Mộc tiếp tục đứng vững cho tháng tới.</p>
              <a className="donate-hero__cta" href="#bank-card">Ủng hộ ngay ↓</a>
            </div>
            <DonateCard />
          </div>
        </section>
        <section className="donate-quote">
          <span>“Dùng thử rồi mới tin là thật miễn phí. Ủng hộ một chút để Mộc còn đó cho những cặp đôi sau mình.”</span>
          <a href="#bank-card">Ủng hộ ngay</a>
        </section>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
