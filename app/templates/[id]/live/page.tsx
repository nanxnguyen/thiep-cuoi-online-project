import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { TemplateDetailMain } from "@/components/templates/TemplateDetailMain";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { sampleContent } from "@/lib/content";
import { metadataFor, templateSeo, withShareImage } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { familyPhotos, getTemplate } from "@/lib/templates";
import { product } from "@/lib/jsonld";
import "../detail.css";
import { JsonLd } from "@/components/marketing/JsonLd";
import { PageJsonLd } from "@/components/marketing/PageJsonLd";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const template = getTemplate((await params).id);
  if (!template) return {};
  const { title, description } = templateSeo(template);
  const meta = metadataFor(`/templates/${template.id}`, title, description);
  const photo = familyPhotos[template.family]?.[0] ?? "/og.png";
  // Reached only through the rewrite in next.config.ts (?preview= / ?gate=); the static /templates/[id] page is the indexed one.
  return { ...withShareImage(meta, { url: `${SITE_URL}${photo}`, alt: title }), robots: { index: false, follow: false } };
}

// Dynamic twin of /templates/[id]: `?preview=1` full-page preview, `?gate=1` opening envelope for a sample guest.
// next.config.ts rewrites those two query strings here so the plain detail page can stay static.
export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gate?: string; color?: string; preview?: string }>;
}) {
  const template = getTemplate((await params).id);
  if (!template) notFound();
  const { gate, color, preview } = await searchParams;
  const paletteKey = template.colors.includes(color as typeof template.colors[number]) ? color! : template.colors[0];

  if (preview === "1" || gate === "1") return (
    <>
      <div className="preview-bar">
        <Link href={`/templates/${template.id}?color=${paletteKey}`}>← Chi tiết mẫu</Link>
        <strong>{template.name}</strong>
        <span className="preview-bar__actions">
          <Link href={gate === "1" ? `/templates/${template.id}?preview=1&color=${paletteKey}` : `/templates/${template.id}?gate=1&color=${paletteKey}`}>
            {gate === "1" ? "Bỏ phong bì" : "Xem phong bì"}
          </Link>
          <Link className="nav-cta" href={`/studio?template=${template.id}&color=${paletteKey}`}>Dùng mẫu này →</Link>
        </span>
      </div>
      <InvitationRenderer showcase mode="preview" gate={gate === "1"} guestName={gate === "1" ? "Chú Ba" : undefined} template={template} content={{ ...sampleContent(), paletteKey }} />
    </>
  );

  const { title: productName, description: productDescription } = templateSeo(template);
  const productImage = familyPhotos[template.family]?.[0] ?? "/og.png";
  // design/Mau Thiep Chi Tiet.dc.html, value for value.
  return (
    <>
      <SiteHeader />
      <PageJsonLd path={`/templates/${template.id}`} name={template.name} parents={[{ name: "Mẫu thiệp", path: "/templates" }]} />
      <JsonLd data={product(SITE_URL, { name: productName, description: productDescription, image: productImage, url: `/templates/${template.id}` })} />
      <TemplateDetailMain templateId={template.id} color={paletteKey} />
      <SiteFooter />
    </>
  );
}
