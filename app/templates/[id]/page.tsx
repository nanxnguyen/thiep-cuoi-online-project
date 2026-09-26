import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { ThiepPreview } from "@/components/templates/ThiepPreview";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { sampleContent } from "@/lib/content";
import { colors, familyLayout, getTemplate, templateSamples, templates } from "@/lib/templates";
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

  const sample = templateSamples[template.id];
  const pal = colors[paletteKey as keyof typeof colors];
  // design/Mau Thiep Chi Tiet.dc.html, value for value.
  return (
    <>
      <SiteHeader />
      <main className="tdt">
        <div className="tdt__stage">
          <div className="tdt__card">
            <ThiepPreview family={template.family} deep={pal.deep} paper={pal.paper} gold={pal.gold} a={sample.a} b={sample.b} date={sample.date} place={sample.place} radius="14px" />
          </div>
        </div>
        <div className="tdt__info">
          <nav className="tdt__crumb" aria-label="Đường dẫn">
            <Link href="/templates">Mẫu thiệp</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{template.name}</span>
          </nav>
          <div className="tdt__head">
            <span>
              {sample.style} · {sample.motif}
            </span>
            <h1>{template.name}</h1>
            <p>{familyLayout[template.family]}</p>
          </div>
          <div className="tdt__colors">
            <span>Chọn màu để xem trước</span>
            <div role="group" aria-label="Chọn màu mẫu thiệp">
              {template.colors.map((key) => (
                <Link key={key} href={`/templates/${template.id}?color=${key}`} title={colors[key].label} aria-label={colors[key].label} aria-current={paletteKey === key ? "true" : undefined} style={{ background: colors[key].deep }} />
              ))}
            </div>
          </div>
          <div className="tdt__incl">
            <span>Mẫu này bao gồm</span>
            {["Trang bìa và đếm ngược", "Ảnh và nhạc nền", "Xác nhận tham dự", "Sổ lưu bút", "Mừng cưới QR", "Link riêng cho khách"].map((feature) => (
              <div key={feature}>
                <span aria-hidden="true" />
                {feature}
              </div>
            ))}
          </div>
          <div className="tdt__actions">
            <Link href={`/studio?template=${template.id}&color=${paletteKey}`}>Dùng mẫu này</Link>
            <Link href="/templates">Xem các mẫu khác</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
