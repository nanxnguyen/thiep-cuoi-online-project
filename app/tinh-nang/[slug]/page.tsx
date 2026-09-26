import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

// design/Tinh Nang Chi Tiet.dc.html, copy from featureArt (the design's feature table).
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
        <nav className="feature-detail__crumb" aria-label="Đường dẫn">
          <Link href="/tinh-nang">Tính năng</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{art.title}</span>
        </nav>
        <div className="feature-detail__hero">
          <div className="feature-detail__copy">
            <span className="feature-detail__kicker">
              TÍNH NĂNG {i + 1}/{features.length}
            </span>
            <h1>{art.title}</h1>
            <p>{art.detailDesc}</p>
            <Link className="feature-detail__cta" href="/studio">
              Tạo thiệp có {art.title.toLowerCase()}
            </Link>
          </div>
          <div className="feature-detail__art" style={{ background: art.bg, color: art.ink }} aria-hidden="true">
            <div className="feature-detail__ring" />
            <div className="feature-detail__glyph">
              <span>{art.glyph}</span>
              <span>{art.caption}</span>
            </div>
          </div>
        </div>
        <section className="feature-detail__how">
          <h2>Hoạt động thế nào</h2>
          <div>
            {art.steps.map((s, n) => (
              <div key={s}>
                <span>{String(n + 1).padStart(2, "0")}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>
        <div className="feature-detail__pager">
          <Link href={`/tinh-nang/${prev.slug}`}>← Tính năng trước</Link>
          <Link href={`/tinh-nang/${next.slug}`}>Tính năng sau →</Link>
        </div>
      </div>
    </MarketingLayout>
  );
}
