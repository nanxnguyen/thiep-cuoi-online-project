import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { PreviewDemo } from "@/components/templates/PreviewDemo";
import "./demo.css";

export const metadata: Metadata = {
  title: "Demo thiệp cưới",
  description: "Xem thử các kiểu bìa và toàn bộ trải nghiệm thiệp cưới MỘC.",
};

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <main className="demo-page">
        <PreviewDemo />
      </main>
      <SiteFooter />
    </>
  );
}
