import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/marketing/FaqList";
import { FEATURE_ICON } from "@/components/marketing/featureIcons";
import { CtaBand, MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";
import { featureDescription, features, getFeature } from "@/lib/marketing/features";

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

export default async function FeaturePage({ params }: Props) {
  const f = getFeature((await params).slug);
  if (!f) notFound();
  const Icon = FEATURE_ICON[f.slug];
  const related = f.related.map((slug) => getFeature(slug)).filter((r) => r !== undefined);

  return (
    <MarketingLayout>
      <PageHero
        crumbs={[{ label: "Tính năng", href: "/tinh-nang" }, { label: f.name }]}
        eyebrow="Tính năng"
        title={f.name}
        lede={f.tagline}
      >
        <div className="actions">
          <Link className="button-primary" href="/studio">
            Dùng thử ngay
          </Link>
          <Link className="button-ghost" href="/templates">
            Xem mẫu thiệp
          </Link>
        </div>
      </PageHero>

      <section className="mk-section mk-narrow">
        {Icon && (
          <span className="mk-icon" aria-hidden="true" style={{ marginBottom: 18 }}>
            <Icon size={24} />
          </span>
        )}
        <p className="lede" style={{ maxWidth: "none", fontSize: 19 }}>
          {f.intro}
        </p>
      </section>

      <section className="mk-section mk-narrow" aria-labelledby="how">
        <h2 id="how">Cách hoạt động</h2>
        <ol className="mk-steps">
          {f.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <section className="mk-section" aria-labelledby="notes">
        <h2 id="notes">Đáng biết</h2>
        <ul className="mk-grid">
          {f.points.map((p) => (
            <li key={p.title}>
              <div className="mk-card">
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mk-section mk-narrow" aria-labelledby="faq">
        <h2 id="faq">Câu hỏi thường gặp</h2>
        <FaqList items={f.faq} schema />
      </section>

      {related.length > 0 && (
        <section className="mk-section" aria-labelledby="more">
          <h2 id="more">Tính năng liên quan</h2>
          <ul className="mk-grid">
            {related.map((r) => {
              const RelIcon = FEATURE_ICON[r.slug];
              return (
                <li key={r.slug}>
                  <Link className="mk-card" href={`/tinh-nang/${r.slug}`}>
                    <span className="mk-icon" aria-hidden="true">
                      {RelIcon && <RelIcon size={24} />}
                    </span>
                    <h3>{r.name}</h3>
                    <p>{r.tagline}</p>
                    <span className="mk-card__more">Xem chi tiết →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <CtaBand
        title={
          <>
            Một lời mời <em>thật riêng.</em>
          </>
        }
      />
    </MarketingLayout>
  );
}
