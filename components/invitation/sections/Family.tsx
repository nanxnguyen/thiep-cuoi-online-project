import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";

type Side = Content["family"]["groomSide"];

function SideCol({ title, side }: { title: string; side: Side }) {
  return (
    <div className="inv-family__side">
      <span className="inv-family__k">{title}</span>
      {side.father.trim() && <span className="inv-family__n">{side.father}</span>}
      {side.mother.trim() && <span className="inv-family__n">{side.mother}</span>}
      {side.address.trim() && <span className="inv-family__a">{side.address}</span>}
    </div>
  );
}

export function Family({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  const { groomSide: g, brideSide: b } = content.family;
  const any = [g.father, g.mother, b.father, b.mother].some((v) => v.trim());
  if (!content.sections.family || !any) return null;
  const dict = t(locale);
  return (
    <section id="gia-dinh" className="inv-sec inv-family">
      <SideCol title={dict.groomSideTitle} side={g} />
      <div className="inv-family__rule" aria-hidden="true" />
      <SideCol title={dict.brideSideTitle} side={b} />
    </section>
  );
}
