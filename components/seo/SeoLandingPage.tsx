import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

// Shared shell for the SEO landings (design/Tao Thiep Cuoi, Thiep Cuoi Online Mien Phi, QR Tien Mung, Tin Nhan Moi Cuoi):
// hero → the page's own block (children) → long-form copy + related links. The last two are not in the design; they are
// kept on purpose for search ranking and internal linking (deviation logged in the parity checklist).
type SeoLandingPageProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  cta: { href: string; label: string };
  /** Optional illustration: switches the hero to the design's two-column layout (QR Tien Mung). */
  art?: ReactNode;
  children?: ReactNode;
  sections?: { title: string; paragraphs: string[] }[];
  related?: { href: string; label: string; description: string }[];
};

export function SeoLandingPage({ eyebrow, title, description, cta, art, children, sections = [], related = [] }: SeoLandingPageProps) {
  const copy = (
    <>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lp-lede">{description}</p>
      <Link className="button-primary" href={cta.href}>
        {cta.label}
      </Link>
    </>
  );
  return (
    <>
      <SiteHeader />
      <main>
        {art ? (
          <section className="lp-hero lp-hero--split">
            <div className="lp-hero__copy anim-fade-up">{copy}</div>
            {art}
          </section>
        ) : (
          <section className="lp-hero anim-fade-up">{copy}</section>
        )}
        {children}
        {sections.length > 0 && (
          <section className="lp-copy">
            {sections.map((section) => (
              <div key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ))}
          </section>
        )}
        {related.length > 0 && (
          <section className="lp-related" aria-labelledby="lp-related-title">
            <h2 id="lp-related-title">Khám phá thêm</h2>
            <div>
              {related.map((item) => (
                <Link className="card card--lift" href={item.href} key={item.href}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

/** Design block: numbered steps (Tao Thiep Cuoi: centred big numerals; QR Tien Mung: ruled columns with a title). */
export function LpSteps({ title, steps, ruled = false }: { title?: string; steps: { n: string; t: string; d?: string }[]; ruled?: boolean }) {
  return (
    <section className={ruled ? "lp-steps lp-steps--ruled" : "lp-steps"}>
      {title && <h2>{title}</h2>}
      <ol>
        {steps.map((s) => (
          <li key={s.n}>
            <span className="lp-steps__n">{s.n}</span>
            <strong>{s.t}</strong>
            {s.d && <span>{s.d}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Design block: "Vì sao chọn Mộc" cards on the alt paper band. */
export function LpWhy({ title, items }: { title: string; items: { t: string; d: string }[] }) {
  return (
    <section className="lp-why">
      <div>
        <h2>{title}</h2>
        <ul>
          {items.map((w) => (
            <li key={w.t}>
              <strong>{w.t}</strong>
              <span>{w.d}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Design block: ruled checklist (Thiep Cuoi Online Mien Phi). */
export function LpChecklist({ items }: { items: string[] }) {
  return (
    <section className="lp-checklist">
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span aria-hidden="true">✓</span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Design block: message sample cards (Tin Nhan Moi Cuoi). */
export function LpQuotes({ items }: { items: { tag: string; text: string }[] }) {
  return (
    <section className="lp-quotes">
      {items.map((m) => (
        <figure className="card" key={m.tag}>
          <figcaption className="eyebrow">{m.tag}</figcaption>
          <blockquote className="script">{m.text}</blockquote>
        </figure>
      ))}
    </section>
  );
}
