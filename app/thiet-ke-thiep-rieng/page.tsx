import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { DesignRequestForm } from "@/components/marketing/DesignRequestForm";
import { FaqList } from "@/components/marketing/FaqList";
import { Breadcrumb, MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { ThiepPreview } from "@/components/templates/ThiepPreview";
import { colors, templateSamples, templates, type ColorKey } from "@/lib/templates";
import { CONTACT_ZALO } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
import "./custom.css";

export const metadata: Metadata = pageMetadata("/thiet-ke-thiep-rieng");

// design/Thiet Ke Rieng.dc.html: four sample covers floating in the hero (the design's P, Q, S, T families), a stat strip,
// a three-step timeline and a palette strip. Size/rotation per card sit in CSS vars so the markup stays flat.
const HERO_CARDS: { id: string; palette: ColorKey; cls: string }[] = [
  { id: "thu-tinh", palette: "hong", cls: "cd-card--left" },
  { id: "vuon-uom", palette: "oliu", cls: "cd-card--mid" },
  { id: "hy-su", palette: "dodam", cls: "cd-card--right" },
  { id: "chan-dung", palette: "muc", cls: "cd-card--mini" },
];
const SPARKLES = [["12%", "14%"], ["88%", "10%"], ["6%", "55%"], ["92%", "48%"], ["20%", "82%"], ["78%", "78%"], ["50%", "6%"], ["60%", "90%"]];
const STATS = [
  ["24 giờ", "phản hồi bản phác thảo đầu"],
  ["Không giới hạn", "lượt góp ý chỉnh sửa"],
  ["0đ", "để gửi yêu cầu"],
];
const steps = [
  ["01", "Gửi yêu cầu", "Điền thông tin bên dưới, Mộc liên hệ lại trong vòng 24 giờ."],
  ["02", "Nhận bản phác thảo", "Mộc gửi mẫu thiệp phác thảo đầu tiên để hai bạn góp ý."],
  ["03", "Hoàn thiện & dùng", "Chỉnh đến khi vừa ý, rồi chuyển sang Studio để tự điền nội dung và xuất bản."],
];
const PALETTES: [ColorKey, string][] = [["do", "Đỏ truyền thống"], ["lam", "Lam cổ điển"], ["xanh", "Xanh rêu"], ["hong", "Hồng lãng mạn"], ["vang", "Vàng kim"], ["nau", "Nâu đất"], ["muc", "Mực"], ["tim", "Tím"]];
const PROMISES = ["Mộc liên hệ báo giá sau khi nhận yêu cầu", "Không cần đăng nhập để gửi yêu cầu", "Liên hệ lại trong vòng 24 giờ"];

function HeroCard({ id, palette, cls }: { id: string; palette: ColorKey; cls: string }) {
  const t = templates.find((x) => x.id === id);
  if (!t) return null;
  const s = templateSamples[t.id];
  const c = colors[palette];
  return (
    <div className={`cd-card ${cls}`} aria-hidden="true">
      <ThiepPreview family={t.family} deep={c.deep} paper={c.paper} gold={c.gold} a={s.a} b={s.b} date={s.date} place={s.place} radius="14px" fit maxW="100%" />
    </div>
  );
}

const faqs = [
  { q: "Thiết kế riêng có mất phí không?", a: "Có. Các mẫu có sẵn trên MỘC vẫn miễn phí. Thiết kế riêng được báo giá theo mức độ tuỳ chỉnh, bạn chỉ trả khi đã đồng ý với báo giá." },
  { q: "Mất bao lâu để nhận thiệp?", a: "Phụ thuộc độ phức tạp và số lần chỉnh sửa. Mộc sẽ báo thời gian dự kiến khi tư vấn, hãy gửi yêu cầu sớm nếu ngày cưới đã gần." },
  { q: "Sau khi nhận thiệp tôi có tự sửa được không?", a: "Được. Nội dung như tên, ngày giờ, địa điểm, ảnh và nhạc vẫn chỉnh được trong Studio như mọi thiệp khác." },
  { q: "Tôi chưa có ý tưởng rõ ràng thì sao?", a: "Không sao. Bạn chỉ cần gửi vài thiệp hoặc ảnh bạn thích, Mộc sẽ tư vấn phong cách phù hợp." },
];

export default function CustomDesignPage() {
  return (
    <MarketingLayout path="/thiet-ke-thiep-rieng" name="Thiết kế thiệp riêng">
      <ScrollReveal />
      <section className="cd-hero">
        <span className="cd-glow cd-glow--a" aria-hidden="true" />
        <span className="cd-glow cd-glow--b" aria-hidden="true" />
        {SPARKLES.map(([x, y], i) => (
          <span key={i} className="cd-spark" aria-hidden="true" style={{ left: x, top: y, "--d": `${2.4 + (i % 3) * 0.5}s`, "--w": `${i * 0.3}s` } as CSSProperties} />
        ))}
        <div className="cd-hero__grid">
          <div className="cd-hero__copy">
            <Breadcrumb items={[{ label: "Thiết kế thiệp riêng" }]} />
            <p className="cd-kicker">THIẾT KẾ RIÊNG · MAY ĐO CHO ĐÁM CƯỚI CỦA BẠN</p>
            <h1>
              Một mẫu thiệp
              <br />
              <em>không giống ai khác.</em>
            </h1>
            <p className="cd-hero__lede">
              Kể cho Mộc về màu sắc, hoạ tiết, câu chuyện của hai bạn. Một người thiết kế sẽ phác thảo riêng một mẫu thiệp, không nằm trong bộ sưu tập chung, rồi cùng bạn hoàn thiện đến khi vừa ý.
            </p>
            <dl className="cd-stats">
              {STATS.map(([big, small]) => (
                <div key={big}>
                  <dt>{big}</dt>
                  <dd>{small}</dd>
                </div>
              ))}
            </dl>
            <div className="cd-actions">
              <a className="button-primary" href="#yeu-cau">
                Gửi yêu cầu thiết kế →
              </a>
              {CONTACT_ZALO && (
                <a className="cd-zalo-btn" href={`https://zalo.me/${CONTACT_ZALO}`} target="_blank" rel="noopener noreferrer">
                  <ZaloIcon />
                  Chat qua Zalo
                </a>
              )}
            </div>
          </div>
          <div className="cd-stack">
            <span className="cd-tag">✦ VÍ DỤ ĐÃ PHÁC THẢO RIÊNG</span>
            {HERO_CARDS.map((c) => (
              <HeroCard key={c.id} {...c} />
            ))}
            <span className="cd-chip">
              <span aria-hidden="true">✓</span>
              Hoàn thiện trong 3 bước
            </span>
          </div>
        </div>
      </section>

      <section className="cd-steps" data-reveal="1" aria-label="Quy trình">
        <ol>
          {steps.map(([num, title, text]) => (
            <li key={num}>
              <span>{num}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cd-palettes" data-reveal="1" aria-label="Tuỳ biến màu sắc">
        <p className="cd-kicker cd-kicker--dark">TUỲ BIẾN ĐƯỢC</p>
        <h2>Mọi tông màu, mọi hoạ tiết</h2>
        <ul>
          {PALETTES.map(([key, label]) => (
            <li key={key}>
              <span style={{ background: colors[key].deep }} aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      <section className="cd-request" id="yeu-cau" data-reveal="1">
        <div className="cd-request__intro">
          <p className="cd-kicker cd-kicker--dark">GỬI YÊU CẦU</p>
          <h2>
            Bắt đầu câu chuyện
            <br />
            thiệp cưới của hai bạn
          </h2>
          <p>Chỉ cần vài dòng: màu sắc yêu thích, phong cách, hoặc một mẫu bạn từng thích. Mộc sẽ phác thảo và gửi lại để hai bạn góp ý trước khi hoàn thiện.</p>
          <ul>
            {PROMISES.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <Link href="/templates" className="cd-zalo-link cd-zalo-link--plain">
            Xem mẫu có sẵn
          </Link>
          {CONTACT_ZALO && (
            <a className="cd-zalo-link" href={`https://zalo.me/${CONTACT_ZALO}`} target="_blank" rel="noopener noreferrer">
              <ZaloIcon />
              Hoặc chat trực tiếp qua Zalo →
            </a>
          )}
        </div>
        <div className="cd-request__card">
          <DesignRequestForm />
        </div>
      </section>

      <section className="mk-section mk-narrow" data-reveal="1">
        <h2>Câu hỏi thường gặp</h2>
        <FaqList items={faqs} schema />
      </section>
    </MarketingLayout>
  );
}

function ZaloIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 5.94 2 10.78c0 2.78 1.56 5.25 4 6.86V22l3.8-2.1c.7.12 1.44.18 2.2.18 5.52 0 10-3.94 10-8.78S17.52 2 12 2z" />
    </svg>
  );
}
