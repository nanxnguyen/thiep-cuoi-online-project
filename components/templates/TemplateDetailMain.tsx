import Link from "next/link";
import { ThiepPreview } from "@/components/templates/ThiepPreview";
import { colors, familyLayout, getTemplate, templateSamples } from "@/lib/templates";

// design/Mau Thiep Chi Tiet.dc.html, value for value. Pure presentation: used by the static
// /templates/[id] page (fallback + client island) and by the dynamic live twin.
export function TemplateDetailMain({ templateId, color }: { templateId: string; color?: string | null }) {
  const template = getTemplate(templateId);
  if (!template) return null;
  const paletteKey = template.colors.includes(color as (typeof template.colors)[number]) ? (color as string) : template.colors[0];
  const sample = templateSamples[template.id];
  const pal = colors[paletteKey as keyof typeof colors];
  return (
    <main className="tdt">
      <div className="tdt__stage">
        <div className="tdt__card">
          <ThiepPreview family={template.family} deep={pal.deep} paper={pal.paper} gold={pal.gold} a={sample.a} b={sample.b} date={sample.date} place={sample.place} radius="14px" eager />
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
  );
}
