import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ArchetypeFilter } from "@/components/templates/ArchetypeFilter";
import { ScaledFrame } from "@/components/templates/ScaledFrame";
import { InvitationRenderer } from "@/components/invitation/InvitationRenderer";
import { sampleContent } from "@/lib/content";
import { allFontClasses } from "@/lib/fonts";
import { archetypes, templates, type Archetype } from "@/lib/templates";
import "@/components/templates/gallery.css";

export const metadata: Metadata = {
  title: "Mẫu thiệp cưới",
  description: "Mẫu thiệp cưới online thiết kế riêng cho MỘC: chữ lớn, tối giản, cổ điển, vườn xanh, đỏ son, ngọc bích, thủy mặc và phong cách Hàn.",
  alternates: { canonical: "/templates" },
};

const LABEL: Record<Archetype, string> = {
  editorial: "Editorial",
  minimal: "Tối giản",
  classic: "Cổ điển",
  botanical: "Botanical",
  traditional: "Truyền thống",
  korean: "Phong cách Hàn",
};

export default function TemplatesPage() {
  const content = sampleContent();
  return (
    <div className={allFontClasses}>
      <SiteHeader />
      <main className="section">
        <p className="eyebrow">{templates.length} mẫu thiết kế riêng</p>
        <h1 style={{ marginTop: 20 }}>
          Chọn cảm giác
          <br />
          <em>đúng là mình.</em>
        </h1>
        <p className="lede" style={{ marginTop: 20 }}>Mỗi mẫu có một nhịp điệu riêng. Đổi mẫu lúc nào cũng được, nội dung của bạn vẫn còn nguyên.</p>

        <ArchetypeFilter options={archetypes.map((a) => ({ value: a, label: LABEL[a] }))}>
          {templates.map((t) => (
            <Link className="tpl-card" href={`/templates/${t.id}`} key={t.id} data-archetype={t.archetype}>
              <ScaledFrame className="tpl-thumb">
                <InvitationRenderer only="cover" mode="preview" gate={false} template={t} content={content} />
              </ScaledFrame>
              <div className="tpl-card__meta">
                <span className="tpl-card__tag">{LABEL[t.archetype]}</span>
                <strong>{t.name}</strong>
                <p>{t.blurb}</p>
              </div>
            </Link>
          ))}
        </ArchetypeFilter>
      </main>
      <SiteFooter />
    </div>
  );
}
