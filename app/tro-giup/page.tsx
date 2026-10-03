import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/marketing/JsonLd";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { HelpClient } from "./HelpClient";
import { allHelpItems, helpGroups } from "@/lib/marketing/help";

export const metadata: Metadata = pageMetadata("/tro-giup");

export default function HelpPage() {
  return (
    <MarketingLayout path="/tro-giup" name="Trợ giúp">
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
