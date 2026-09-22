import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";
import { formatPostDate, postsByDate } from "@/lib/marketing/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Gợi ý viết lời mời, lịch gửi thiệp, mừng cưới bằng QR và chọn ảnh cho thiệp cưới online, viết cho các cặp đôi đang chuẩn bị đám cưới.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <MarketingLayout>
      <PageHero
        crumbs={[{ label: "Blog" }]}
        eyebrow="Blog"
        title={
          <>
            Chuẩn bị đám cưới,
            <br />
            <em>từng việc một.</em>
          </>
        }
        lede="Những bài viết ngắn, thực tế cho các cặp đôi: viết lời mời, chọn thời điểm gửi thiệp, mừng cưới và ảnh cưới."
      />
      <section className="mk-section" aria-labelledby="all">
        <h2 className="mk-sr" id="all">
          Tất cả bài viết
        </h2>
        <ul className="mk-grid">
          {postsByDate().map((p) => (
            <li key={p.slug}>
              <Link className="mk-card mk-post" href={`/blog/${p.slug}`}>
                <span className="mk-post__tag">{p.category}</span>
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <small>
                  {formatPostDate(p.date)} · {p.readMinutes} phút đọc
                </small>
                <span className="mk-card__more">Đọc bài →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaBand
        title={
          <>
            Từ ý tưởng đến <em>tấm thiệp.</em>
          </>
        }
      />
    </MarketingLayout>
  );
}
