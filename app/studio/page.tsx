import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StudioHome } from "@/components/studio/StudioHome";
import { StudioHomeQuery } from "@/components/studio/StudioHomeQuery";

export const metadata: Metadata = { title: "Tạo thiệp cưới", robots: { index: false, follow: false } };

// Prerendered with the default template; ?template=&color= are read in the browser (soft navigation from
// a template page has no flash, a direct load shows the default for the moment before hydration).
export default function StudioPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<StudioHome />}>
        <StudioHomeQuery />
      </Suspense>
    </>
  );
}
