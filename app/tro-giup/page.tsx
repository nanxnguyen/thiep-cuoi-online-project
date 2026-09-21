import type { Metadata } from "next";
import { FaqList } from "@/components/marketing/FaqList";
import { JsonLd } from "@/components/marketing/JsonLd";
import { CtaBand, MarketingLayout, PageHero } from "@/components/marketing/MarketingLayout";
import { allHelpItems, helpGroups } from "@/lib/marketing/help";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trợ giúp",
  description: "Giải đáp về link chỉnh sửa, xuất bản, ảnh và nhạc, xác nhận tham dự, lời chúc và quyền riêng tư khi làm thiệp cưới online với MỘC.",
  alternates: { canonical: "/tro-giup" },
};

export default function HelpPage() {
  return (
    <MarketingLayout>
      <PageHero
        crumbs={[{ label: "Trợ giúp" }]}
        eyebrow="Trung tâm trợ giúp"
        title={
          <>
            Có gì thắc mắc,
            <br />
            <em>xem ở đây trước.</em>
          </>
        }
        lede="Những câu hỏi hai bạn hay gặp khi làm thiệp: link chỉnh sửa, xuất bản, ảnh và nhạc, phản hồi của khách."
      >
        <ul className="mk-chips" aria-label="Chủ đề">
          {helpGroups.map((g) => (
            <li key={g.id}>
              <a href={`#${g.id}`}>{g.title}</a>
            </li>
          ))}
        </ul>
      </PageHero>

      <section className="mk-section mk-narrow">
        {helpGroups.map((g) => (
          <div className="mk-group" id={g.id} key={g.id}>
            <h2>{g.title}</h2>
            <FaqList items={g.items} />
          </div>
        ))}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: allHelpItems().map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
          }}
        />
      </section>

      <section className="mk-section mk-narrow" aria-labelledby="contact">
        <div className="mk-card">
          <h3 id="contact">Chưa thấy câu trả lời?</h3>
          {CONTACT_EMAIL ? (
            <p>
              Hãy viết cho chúng mình tại <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Kèm đường dẫn thiệp (không cần gửi link chỉnh sửa) để chúng mình xem giúp nhanh hơn.
            </p>
          ) : (
            <p>Kênh liên hệ sẽ được công bố ngay khi MỘC chính thức ra mắt. Trong lúc này, các câu trả lời ở trên bao quát những tình huống thường gặp nhất.</p>
          )}
        </div>
      </section>

      <CtaBand
        title={
          <>
            Sẵn sàng làm thiệp <em>của bạn?</em>
          </>
        }
      />
    </MarketingLayout>
  );
}
