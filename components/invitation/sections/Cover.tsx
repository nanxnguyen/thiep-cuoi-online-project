import type { Content } from "@/lib/content";
import { earliestEvent, formatDateVi } from "@/lib/datetime";
import type { Archetype, Template } from "@/lib/templates";
import { CoverOrnament } from "../ornaments";

const KICKER: Record<Archetype, string> = {
  editorial: "Lễ thành hôn của",
  minimal: "Thiệp mời",
  classic: "Trân trọng báo tin lễ thành hôn của",
  botanical: "Cùng nhau về một nhà",
  traditional: "Thư mời dự lễ thành hôn",
  korean: "Chúng mình sắp cưới",
};

// First screen of the invitation. It only shows the couple, the wedding date and (optionally) a photo,
// so it looks right even for a brand-new draft with no photo at all.
export function Cover({ content, template }: { content: Content; template: Template }) {
  const { couple, events } = content;
  const groom = couple.groom.name.trim() || "Chú rể";
  const bride = couple.bride.name.trim() || "Cô dâu";
  const main = earliestEvent(events);
  const [year, month, day] = main ? main.date.split("-") : [];
  const weekday = main ? formatDateVi(main.date).split(",")[0] : "";

  return (
    <section className="inv-cover" aria-labelledby="inv-title">
      <div className="inv-cover__frame">
        <CoverOrnament archetype={template.archetype} groom={groom} bride={bride} hasPhoto={Boolean(couple.heroPhoto)} />
        <p className="inv-kicker">{KICKER[template.archetype]}</p>
        {couple.heroPhoto && (
          <figure className="inv-hero">
            <img src={couple.heroPhoto} alt={`Ảnh cưới của ${groom} và ${bride}`} decoding="async" />
          </figure>
        )}
        <h1 className="inv-names" id="inv-title">
          <span className="inv-name">{groom}</span>
          <span className="inv-amp" aria-hidden="true">
            &amp;
          </span>
          <span className="inv-sr-only"> và </span>
          <span className="inv-name">{bride}</span>
        </h1>
        {main && (
          <p className="inv-date">
            <time dateTime={main.date}>
              <span className="inv-date__num">
                <span className="inv-date__d">{day}</span>
                <span className="inv-date__sep"> · </span>
                <span className="inv-date__m">{month}</span>
                <span className="inv-date__sep"> · </span>
                <span className="inv-date__y">{year}</span>
              </span>
              <span className="inv-date__day">{weekday}</span>
            </time>
          </p>
        )}
        <p className="inv-scroll" aria-hidden="true">
          Cuộn xuống
        </p>
      </div>
    </section>
  );
}
