import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StudioHome } from "@/components/studio/StudioHome";

export const metadata: Metadata = { title: "Tạo thiệp cưới", robots: { index: false, follow: false } };

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ template?: string; color?: string }> }) {
  const { template, color } = await searchParams;
  return (
    <>
      <SiteHeader />
      <StudioHome initialTemplate={template} initialColor={color} />
    </>
  );
}
