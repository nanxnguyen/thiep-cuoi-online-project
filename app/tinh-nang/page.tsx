import type { Metadata } from "next";
import Link from "next/link";
import { FEATURE_ICON } from "@/components/marketing/featureIcons";
import { CtaBand, MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";
import { features } from "@/lib/marketing/features";

export const metadata: Metadata = {
  title: "Tính năng",
  description: "Xác nhận tham dự, sổ lưu bút, mừng cưới bằng QR, bản đồ, đếm ngược, album ảnh, nhạc nền và phong bì ghi tên khách: những gì một tấm thiệp cưới online của MỘC làm được.",
  alternates: { canonical: "/tinh-nang" },
};

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <PageHero
        crumbs={[{ label: "Tính năng" }]}
        eyebrow="Tính năng"
        title={
          <>
            Mọi điều một tấm thiệp cần,
            <br />
            <em>trong một đường link.</em>
          </>
        }
        lede="Từ lời mời, bản đồ, đếm ngược đến xác nhận tham dự và mừng cưới. Tám tính năng làm việc cùng nhau để khách biết phải đến đâu, lúc nào, và hai bạn biết ai sẽ đến."
      />
      <section className="mk-section" aria-labelledby="all">
        <h2 className="mk-sr" id="all">
          Tất cả tính năng
        </h2>
        <ul className="mk-grid">
          {features.map((f) => {
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
      <CtaBand
        title={
          <>
            Thử tất cả, <em>miễn phí.</em>
          </>
        }
      />
    </MarketingLayout>
  );
}
