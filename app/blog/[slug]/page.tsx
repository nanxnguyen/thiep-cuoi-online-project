import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogBody } from "@/components/marketing/BlogBody";
import { FEATURE_ICON } from "@/components/marketing/featureIcons";
import { JsonLd } from "@/components/marketing/JsonLd";
import { CtaBand, MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";
import { getFeature } from "@/lib/marketing/features";
import { formatPostDate, getPost, posts } from "@/lib/marketing/blog";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.description, publishedTime: p.date, locale: "vi_VN", siteName: "MỘC Wedding" },
  };
}

export default async function PostPage({ params }: Props) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const related = p.related.map((slug) => getFeature(slug)).filter((f) => f !== undefined);

  return (
    <MarketingLayout>
      <PageHero crumbs={[{ label: "Blog", href: "/blog" }, { label: p.title }]} eyebrow={p.category} title={p.title} lede={p.description}>
        <p className="mk-meta">
          <span>
            <time dateTime={p.date}>{formatPostDate(p.date)}</time>
          </span>
          <span>{p.readMinutes} phút đọc</span>
        </p>
      </PageHero>

      <article className="mk-prose">
        <BlogBody blocks={p.blocks} />
      </article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.description,
          datePublished: p.date,
          dateModified: p.date,
          inLanguage: "vi",
          mainEntityOfPage: `${SITE_URL}/blog/${p.slug}`,
          author: { "@type": "Organization", name: "MỘC Wedding" },
          publisher: { "@type": "Organization", name: "MỘC Wedding" },
        }}
      />

      {related.length > 0 && (
        <section className="mk-section" aria-labelledby="related">
          <h2 id="related">Tính năng liên quan trong bài</h2>
          <ul className="mk-grid">
            {related.map((f) => {
              const Icon = FEATURE_ICON[f.slug];
              return (
                <li key={f.slug}>
                  <Link className="mk-card" href={`/tinh-nang/${f.slug}`}>
                    <span className="mk-icon" aria-hidden="true">
                      {Icon && <Icon size={24} />}
                    </span>
                    <h3>{f.name}</h3>
                    <p>{f.tagline}</p>
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
            Làm thiệp cưới <em>của hai bạn.</em>
          </>
        }
      />
    </MarketingLayout>
  );
}
