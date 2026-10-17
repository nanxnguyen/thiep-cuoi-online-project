import Link from "next/link";
import { archetypeCopy, relatedTemplates, templateFit } from "@/lib/template-copy";
import { colors, type Template } from "@/lib/templates";
import "@/components/marketing/marketing.css";

// Long-form copy under the design-exact detail block (not in design/Mau Thiep Chi Tiet.dc.html; logged in DESIGN.md):
// gives each of the 50 template pages its own words for search. Static page only, not the ?preview/?gate twin.
export function TemplateAbout({ template }: { template: Template }) {
  const style = archetypeCopy[template.archetype];
  const palettes = template.colors.map((key) => colors[key].label);
  const related = relatedTemplates(template.id);
  return (
    <section className="mk-prose" aria-labelledby="about-template">
      <h2 id="about-template">Về mẫu thiệp {template.name}</h2>
      <p>{template.seo}</p>
      <p>{templateFit[template.id]}</p>
      <h2>Phong cách {style.label}</h2>
      <p>{style.text}</p>
      <p>
        Mẫu {template.name} có {palettes.length} bảng màu: {palettes.join(", ")}. Hai bạn đổi màu hoặc chuyển sang mẫu khác bất cứ lúc nào trong
        Studio, nội dung đã nhập được giữ nguyên, chỉ giao diện thay đổi.
      </p>
      <h2>Mẫu cùng phong cách</h2>
      <ul>
        {related.map((t) => (
          <li key={t.id}>
            <Link href={`/templates/${t.id}`}>Mẫu thiệp {t.name}</Link>: {t.blurb}
          </li>
        ))}
      </ul>
    </section>
  );
}
