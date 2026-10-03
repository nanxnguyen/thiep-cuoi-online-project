import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { CtaBand, PageHero } from "@/components/marketing/MarketingLayout";
import { JsonLd } from "@/components/marketing/JsonLd";
import { PostPhoto } from "@/components/blog/PostPhoto";
import { PostRow, formatPostDate } from "@/components/blog/PostRow";
import { posts, readingMinutes } from "@/lib/blog";
import { itemList } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import "@/components/marketing/marketing.css";
import "@/components/blog/blog.css";

export const metadata: Metadata = pageMetadata("/blog");

// Not wrapped in MarketingLayout: its PageJsonLd would repeat the BreadcrumbList that PageHero's crumbs already emit.
export default function BlogIndexPage() {
  const [featured, ...rest] = posts;
  return (
    <>
      <SiteHeader />
      <main className="mk">
        <PageHero
          crumbs={[{ label: "Blog cưới" }]}
          eyebrow="BLOG CƯỚI"
          title={
            <>
              Chuẩn bị đám cưới, <em>bớt rối đi một chút.</em>
            </>
          }
          lede="Hướng dẫn thực tế từ việc làm thiệp, viết lời mời, mừng cưới bằng QR đến lên danh sách khách. Viết ngắn, có ví dụ, làm theo được ngay."
        />
        <JsonLd data={itemList(SITE_URL, posts.map((p) => ({ name: p.title, path: `/blog/${p.slug}` })))} />
        <section className="bl-index" aria-label="Bài viết">
          <article className="bl-feature" data-reveal="1">
            <div className="bl-feature__main">
              <span className="bl-cat">{featured.category}</span>
              <h2 className="bl-feature__title">
                <Link href={`/blog/${featured.slug}`} prefetch={false}>
                  {featured.title}
                </Link>
              </h2>
              <p className="bl-feature__excerpt">{featured.excerpt}</p>
              <p className="bl-feature__meta">
                <time dateTime={featured.date}>{formatPostDate(featured.date)}</time>
                <span>{readingMinutes(featured)} phút đọc</span>
              </p>
              <Link className="bl-feature__go" href={`/blog/${featured.slug}`} prefetch={false}>
                Đọc bài này →
              </Link>
            </div>
            <Link className="bl-feature__photo" href={`/blog/${featured.slug}`} prefetch={false} tabIndex={-1} aria-hidden="true">
              <PostPhoto image={featured.cover} sizes="(max-width: 760px) 100vw, 420px" priority />
            </Link>
          </article>
          <ul className="bl-list" data-reveal="1" data-delay="120">
            {rest.map((p) => (
              <PostRow key={p.slug} post={p} />
            ))}
          </ul>
        </section>
        <CtaBand title={<>Đọc xong thì làm thiệp luôn, <em>miễn phí.</em></>} />
      </main>
      <SiteFooter />
    </>
  );
}
