import type { Metadata } from "next";
import { JsonLd } from "@/components/marketing/JsonLd";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { HelpClient } from "./HelpClient";
import { allHelpItems, helpGroups } from "@/lib/marketing/help";

export const metadata: Metadata = {
  title: "Trợ giúp",
  description: "Giải đáp về link chỉnh sửa, xuất bản, ảnh và nhạc, xác nhận tham dự, lời chúc và quyền riêng tư khi làm thiệp cưới online với MỘC.",
  alternates: { canonical: "/tro-giup" },
};

export default function HelpPage() {
  return (
    <MarketingLayout>
      <HelpClient groups={helpGroups} />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: allHelpItems().map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
          }}
        />
    </MarketingLayout>
  );
}
