import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/marketing/FaqList";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { featureArt, featureDescription, features, getFeature } from "@/lib/marketing/features";
import "../features.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return features.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const f = getFeature((await params).slug);
  if (!f) return {};
  return {
    title: f.name,
    description: featureDescription(f),
    alternates: { canonical: `/tinh-nang/${f.slug}` },
    openGraph: { type: "website", title: `${f.name} | MỘC Wedding`, description: featureDescription(f) },
  };
}

// design/Tinh Nang Chi Tiet.dc.html. "Đáng biết" and the FAQ (FAQPage JSON-LD) are not in the design; kept below it
// for search and because they carry the real limits of each feature.
export default async function FeaturePage({ params }: Props) {
  const f = getFeature((await params).slug);
  if (!f) notFound();
  const i = features.indexOf(f);
  const prev = features[(i - 1 + features.length) % features.length];
  const next = features[(i + 1) % features.length];
  const art = featureArt[f.slug];

  return (
    <MarketingLayout>
      <div className="feature-detail">
        <nav className="tool-crumb" aria-label="Đường dẫn">
          <Link href="/tinh-nang">Tính năng</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{f.name}</span>
        </nav>
        <section className="feature-detail__hero anim-fade-up">
          <div>
            <p className="eyebrow">
              Tính năng {i + 1}/{features.length}
            </p>
            <h1>{f.name}</h1>
            <p className="feature-detail__lede">{f.intro}</p>
            <Link className="button-primary" href="/studio">
              Tạo thiệp có {f.name.toLowerCase()}
            </Link>
          </div>
          <div className="feature-detail__art" style={{ background: art.bg, color: art.ink }} aria-hidden="true">
            <i />
            <div>
              <strong>{art.glyph}</strong>
              <small>{art.caption}</small>
            </div>
          </div>
        </section>
        <section className="feature-detail__how" aria-labelledby="how">
          <h2 id="how">Hoạt động thế nào</h2>
          <ol>
            {f.steps.map((s, n) => (
              <li key={s}>
                <span>{String(n + 1).padStart(2, "0")}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>
        <section className="feature-detail__notes" aria-labelledby="notes">
          <h2 id="notes">Đáng biết</h2>
          <ul>
            {f.points.map((p) => (
              <li key={p.title}>
                <strong>{p.title}</strong>
                <span>{p.body}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="feature-detail__faq" aria-labelledby="faq">
          <h2 id="faq">Câu hỏi thường gặp</h2>
          <FaqList items={f.faq} schema />
        </section>
        <nav className="feature-detail__pager" aria-label="Tính năng khác">
          <Link href={`/tinh-nang/${prev.slug}`}>← {prev.name}</Link>
          <Link href={`/tinh-nang/${next.slug}`}>{next.name} →</Link>
        </nav>
      </div>
    </MarketingLayout>
  );
}
