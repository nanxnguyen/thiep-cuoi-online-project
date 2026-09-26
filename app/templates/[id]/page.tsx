import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { ScaledFrame } from "@/components/templates/ScaledFrame";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { sampleContent } from "@/lib/content";
import { getTemplate, templates, familyLayout } from "@/lib/templates";
import { colors } from "@/lib/templates";
import "./detail.css";

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const template = getTemplate((await params).id);
  if (!template) return {};
  return {
    title: `Mẫu ${template.name}`,
    description: template.blurb,
    alternates: { canonical: `/templates/${template.id}` },
  };
}

// `?gate=1` shows the opening envelope addressed to a sample guest.
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
      <InvitationRenderer mode="preview" gate={gate === "1"} guestName={gate === "1" ? "Chú Ba" : undefined} template={template} content={{ ...sampleContent(), paletteKey }} />
    </>
  );

  return (
    <>
      <SiteHeader />
      <main className="template-detail">
        <div className="template-detail__preview"><ScaledFrame className="template-detail__cover"><InvitationRenderer only="cover" mode="preview" gate={false} template={template} content={{ ...sampleContent(), paletteKey }} /></ScaledFrame></div>
        <div className="template-detail__info">
          <nav aria-label="Đường dẫn"><Link href="/templates">Mẫu thiệp</Link><span>/</span>{template.name}</nav>
          <div><p className="template-detail__eyebrow">{template.archetype.toUpperCase()} · {template.blurb}</p><h1>{template.name}</h1><p className="template-detail__desc">{familyLayout[template.family]} Mọi thông tin chỉnh được trong Studio.</p></div>
          <div><p>Chọn màu để xem trước</p><div className="template-detail__swatches" role="group" aria-label="Chọn màu mẫu thiệp">{template.colors.map((key) => <Link key={key} href={`/templates/${template.id}?color=${key}`} title={colors[key].label} aria-label={colors[key].label} aria-current={paletteKey === key ? "true" : undefined} style={{ background: colors[key].deep }} />)}</div></div>
          <div className="template-detail__includes"><h2>Mẫu này bao gồm</h2>{["Trang bìa và đếm ngược", "Ảnh và nhạc nền", "Xác nhận tham dự", "Sổ lưu bút", "Mừng cưới QR", "Link riêng cho khách"].map((feature) => <p key={feature}><i aria-hidden="true" />{feature}</p>)}</div>
          <div className="template-detail__actions"><Link className="button-primary" href={`/studio?template=${template.id}&color=${paletteKey}`}>Dùng mẫu này</Link><Link className="template-detail__secondary" href="/templates">Xem các mẫu khác</Link><Link className="template-detail__full" href={`/templates/${template.id}?preview=1&color=${paletteKey}`}>Xem toàn bộ thiệp →</Link></div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
