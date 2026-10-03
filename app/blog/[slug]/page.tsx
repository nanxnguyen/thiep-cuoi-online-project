import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CtaBand, PageHero } from "@/components/marketing/MarketingLayout";
import { FaqList } from "@/components/marketing/FaqList";
import { JsonLd } from "@/components/marketing/JsonLd";
import { PostBody } from "@/components/blog/PostBody";
import { PostPhoto } from "@/components/blog/PostPhoto";
import { PostRow, formatPostDate } from "@/components/blog/PostRow";
import { Toc } from "@/components/blog/Toc";
import { blogPostSeo, getPost, headings, posts, readingMinutes } from "@/lib/blog";
import { blogPosting } from "@/lib/jsonld";
import { metadataFor } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "@/components/marketing/marketing.css";
import "@/components/blog/blog.css";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const { title, description } = blogPostSeo(post);
  const meta = metadataFor(`/blog/${post.slug}`, title, description);
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: "article", publishedTime: post.date, modifiedTime: post.updated, authors: ["MỘC Wedding"] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const outline = headings(post);
  const related = post.related.flatMap((s) => getPost(s) ?? []);
  return (
    <>
      <SiteHeader />
      <main className="mk">
        <JsonLd data={blogPosting(SITE_URL, post)} />
        <PageHero
          crumbs={[{ label: "Blog cưới", href: "/blog" }, { label: post.title }]}
          eyebrow={post.category.toUpperCase()}
          title={post.title}
        >
          <p className="mk-meta">
            <span>
              Đăng <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </span>
            {post.updated !== post.date && (
              <span>
                Cập nhật <time dateTime={post.updated}>{formatPostDate(post.updated)}</time>
              </span>
            )}
            <span>{readingMinutes(post)} phút đọc</span>
            <span>Đội ngũ MỘC</span>
          </p>
        </PageHero>
        <div className="bl-article">
          <Toc items={outline} />
          <article className="bl-article__main">
            <figure className="bl-cover">
              <div className="bl-cover__frame">
                <PostPhoto image={post.cover} sizes="(max-width: 760px) 100vw, 680px" priority />
              </div>
            </figure>
            <p className="bl-lede">{post.excerpt}</p>
            <PostBody blocks={post.blocks} />
            <section className="bl-faq" aria-labelledby="faq-title">
              <h2 id="faq-title">Câu hỏi thường gặp</h2>
              <FaqList items={post.faq} schema />
            </section>
            <span className="bl-seal xi" aria-hidden="true">
              囍
            </span>
          </article>
        </div>
        {related.length > 0 && (
          <section className="bl-related" aria-labelledby="related-title">
            <h2 id="related-title">Đọc tiếp</h2>
            <ul className="bl-list">
              {related.map((p) => (
                <PostRow key={p.slug} post={p} />
              ))}
            </ul>
          </section>
        )}
        <CtaBand title={<>Làm thiệp cưới online của hai bạn, <em>miễn phí.</em></>} />
      </main>
      <SiteFooter />
    </>
  );
}
