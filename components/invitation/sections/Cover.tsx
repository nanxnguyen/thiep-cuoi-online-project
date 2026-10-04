import { ThiepPreview } from "@/components/templates/ThiepPreview";
import type { Content } from "@/lib/content";
import { earliestEvent } from "@/lib/datetime";
import type { Locale } from "@/lib/i18n";
import type { Template } from "@/lib/templates";
import { brideName, groomName } from "./shared";

// The template's own cover (design/Thiep Preview.dc.html, all twenty original families), recoloured by the invitation
// palette. An empty hero photo shows the empty frame, never a sample couple.
export function Cover({ content, template, locale = "vi", showcase = false }: { content: Content; template: Template; locale?: Locale; showcase?: boolean }) {
  const event = earliestEvent(content.events);
  const [year = "", month = "", day = ""] = event?.date.split("-") ?? [];
  const date = [day, month, year].filter(Boolean).join(" · ");
  const place = (event?.venue || event?.address || "").toUpperCase();
  const { couple, family } = content;
  const photo = couple.heroPhoto || (showcase ? undefined : "");
  const pair = template.family === "G" || template.family === "H";
  return (
    <section className="inv-cover">
      <h1 className="inv-sr-only">
        {groomName(content, locale)} &amp; {brideName(content, locale)}
      </h1>
      <ThiepPreview
        fit
        maxW="100%"
        radius="0"
        family={template.family}
        deep="var(--c-deep)"
        paper="var(--c-paper)"
        gold="var(--c-gold)"
        tint="var(--c-tint)"
        a={brideName(content, locale)}
        b={groomName(content, locale)}
        date={date}
        place={place}
        photo={pair && !showcase ? couple.groom.photo || photo : photo}
        photo2={pair && !showcase ? couple.bride.photo || photo : photo}
        photo3={photo}
        ranks={[couple.groom.rank, couple.bride.rank]}
        parents={[
          [family.groomSide.father, family.groomSide.mother],
          [family.brideSide.father, family.brideSide.mother],
        ]}
      />
    </section>
  );
}
