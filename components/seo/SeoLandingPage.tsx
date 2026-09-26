import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

// Shared shell for the SEO landings, value for value with design/Tao Thiep Cuoi, Thiep Cuoi Online Mien Phi,
// QR Tien Mung and Tin Nhan Moi Cuoi: a centred hero (or the split QR hero passed as `hero`) and the page's own block.
type SeoLandingPageProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  cta?: { href: string; label: string };
  /** Per-page hero numbers the four designs vary: padding, h1 size/leading, lede width, CTA size. */
  heroStyle?: CSSProperties;
  small?: boolean;
  /** Replaces the centred hero (QR Tien Mung's two-column hero). */
  hero?: ReactNode;
  children?: ReactNode;
};

export function SeoLandingPage({ eyebrow, title, description, cta, heroStyle, small, hero, children }: SeoLandingPageProps) {
  return (
    <>
      <SiteHeader />
      <main>
        {hero ?? (
          <section className="lp-hero" style={heroStyle}>
            <span className="lp-kicker">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{description}</p>
            {cta && (
              <Link className={small ? "lp-cta lp-cta--small" : "lp-cta"} href={cta.href}>
                {cta.label}
              </Link>
            )}
          </section>
        )}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

/** Tao Thiep Cuoi: centred big numerals. */
export function LpSteps({ steps }: { steps: { n: string; t: string; d: string }[] }) {
  return (
    <section className="lp-steps">
      {steps.map((s) => (
        <div key={s.n}>
          <span>{s.n}</span>
          <span>{s.t}</span>
          <span>{s.d}</span>
        </div>
      ))}
    </section>
  );
}

/** QR Tien Mung: ruled columns under a title. */
export function LpRuledSteps({ title, steps }: { title: string; steps: { n: string; t: string }[] }) {
  return (
    <section className="lp-ruled">
      <span className="lp-ruled__title">{title}</span>
      <div>
        {steps.map((s) => (
          <div key={s.n}>
            <span>{s.n}</span>
            <span>{s.t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Tao Thiep Cuoi: "Vì sao chọn Mộc" cards on the alt paper band. */
export function LpWhy({ title, items }: { title: string; items: { t: string; d: string }[] }) {
  return (
    <section className="lp-why">
      <div>
        <span className="lp-why__title">{title}</span>
        <div>
          {items.map((w) => (
            <div key={w.t}>
              <span>{w.t}</span>
              <span>{w.d}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Thiep Cuoi Online Mien Phi: ruled checklist. */
export function LpChecklist({ items }: { items: string[] }) {
  return (
    <section className="lp-checklist">
      <div>
        {items.map((item) => (
          <div key={item}>
            <span aria-hidden="true">✓</span>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Tin Nhan Moi Cuoi: message sample cards. */
export function LpQuotes({ items }: { items: { tag: string; text: string }[] }) {
  return (
    <section className="lp-quotes">
      {items.map((m) => (
        <div key={m.tag}>
          <span>{m.tag}</span>
          <span>{m.text}</span>
        </div>
      ))}
    </section>
  );
}
