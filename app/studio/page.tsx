import type { Metadata } from "next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StudioHome } from "@/components/studio/StudioHome";

export const metadata: Metadata = { title: "Tạo thiệp cưới", robots: { index: false, follow: false } };

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const { template } = await searchParams;
  return (
    <>
      <SiteHeader />
      <StudioHome initialTemplate={template} />
      <SiteFooter />
    </>
  );
}
