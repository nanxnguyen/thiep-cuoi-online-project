import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PreviewDemo } from "@/components/templates/PreviewDemo";
import "./demo.css";
import { PageJsonLd } from "@/components/marketing/PageJsonLd";

export const metadata: Metadata = pageMetadata("/demo");

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <PageJsonLd path="/demo" name="Xem thử" />
      <main className="demo-page">
        <PreviewDemo />
      </main>
      <SiteFooter />
    </>
  );
}
