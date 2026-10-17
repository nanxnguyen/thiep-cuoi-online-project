import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { TemplateAbout } from "@/components/templates/TemplateAbout";
import { TemplateDetailMain } from "@/components/templates/TemplateDetailMain";
import { TemplateQuery } from "@/components/templates/TemplateQuery";
import { metadataFor, templateSeo, withShareImage } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { familyPhotos, getTemplate, templates } from "@/lib/templates";
import { product } from "@/lib/jsonld";
import { relatedTemplates } from "@/lib/template-copy";
import "./detail.css";
import { JsonLd } from "@/components/marketing/JsonLd";
import { PageJsonLd } from "@/components/marketing/PageJsonLd";

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const template = getTemplate((await params).id);
  if (!template) return {};
  const { title, description } = templateSeo(template);
  const meta = metadataFor(`/templates/${template.id}`, title, description);
  const photo = familyPhotos[template.family]?.[0] ?? "/og.png";
  return withShareImage(meta, { url: `${SITE_URL}${photo}`, alt: title });
}

// Prerendered with the first palette (full HTML for search engines). `?color=` is applied in the browser;
// `?preview=` / `?gate=` never reach this page: next.config.ts rewrites them to ./live (dynamic).
export default async function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const template = getTemplate((await params).id);
  if (!template) notFound();
  const { title: productName, description: productDescription } = templateSeo(template);
  const productImage = familyPhotos[template.family]?.[0] ?? "/og.png";
  return (
    <>
      <SiteHeader />
      <PageJsonLd path={`/templates/${template.id}`} name={template.name} parents={[{ name: "Mẫu thiệp", path: "/templates" }]} />
      <JsonLd data={product(SITE_URL, { name: productName, description: productDescription, image: productImage, url: `/templates/${template.id}`, relatedUrls: relatedTemplates(template.id).map((t) => `/templates/${t.id}`) })} />
      <Suspense fallback={<TemplateDetailMain templateId={template.id} />}>
        <TemplateQuery templateId={template.id} />
      </Suspense>
      <TemplateAbout template={template} />
      <SiteFooter />
    </>
  );
}
