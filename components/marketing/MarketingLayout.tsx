import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { JsonLd } from "./JsonLd";
import { SITE_URL } from "@/lib/site";
import "./marketing.css";

// Header + main + footer for every marketing page, so a page only supplies its sections.
export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mk">{children}</main>
      <SiteFooter />
    </>
  );
}

type Crumb = { label: string; href?: string };

// Visible trail plus the matching BreadcrumbList for search engines. The last item is the current page (no link).
export function Breadcrumb({ items }: { items: Crumb[] }) {
  const trail: Crumb[] = [{ label: "Trang chủ", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Đường dẫn">
        <ol className="mk-crumbs">
          {trail.map((c, i) => (
            <li key={c.label} aria-current={i === trail.length - 1 ? "page" : undefined}>
              {c.href && i < trail.length - 1 ? <Link href={c.href}>{c.label}</Link> : c.label}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: `${SITE_URL}${c.href === "/" ? "" : c.href}` } : {}) })),
        }}
      />
    </>
  );
}

export function PageHero({ crumbs, eyebrow, title, lede, children }: { crumbs?: Crumb[]; eyebrow: string; title: ReactNode; lede?: string; children?: ReactNode }) {
  return (
    <section className="mk-hero">
      {crumbs && <Breadcrumb items={crumbs} />}
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {lede && <p className="lede">{lede}</p>}
      {children}
    </section>
  );
}

// Closing call to action on the lacquer band.
export function CtaBand({ title, label = "Tạo thiệp ngay" }: { title: ReactNode; label?: string }) {
  return (
    <section className="mk-cta on-dark">
      <p className="eyebrow">MỘC Wedding</p>
      <h2>{title}</h2>
      <Link className="button-primary" href="/studio">
        {label}
      </Link>
    </section>
  );
}
