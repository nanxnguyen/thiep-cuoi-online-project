import type { Content } from "@/lib/content";
import { earliestEvent, formatDateEn, formatDateVi } from "@/lib/datetime";
import { t, type Locale } from "@/lib/i18n";
import type { Template } from "@/lib/templates";
import { CoverOrnament } from "../ornaments";

// First screen of the invitation. It only shows the couple, the wedding date and (optionally) a photo,
// so it looks right even for a brand-new draft with no photo at all.
export function Cover({ content, template, locale = "vi" }: { content: Content; template: Template; locale?: Locale }) {
  const dict = t(locale);
  const { couple, events } = content;
  const groom = couple.groom.name.trim() || dict.groomFallback;
  const bride = couple.bride.name.trim() || dict.brideFallback;
  const main = earliestEvent(events);
  const [year, month, day] = main ? main.date.split("-") : [];
  const weekday = main ? (locale === "en" ? formatDateEn(main.date) : formatDateVi(main.date)).split(",")[0] : "";

  return (
    <section className="inv-cover" aria-labelledby="inv-title">
      <div className="inv-cover__frame">
        <CoverOrnament archetype={template.archetype} groom={groom} bride={bride} hasPhoto={Boolean(couple.heroPhoto)} />
        <p className="inv-kicker">{dict.kicker[template.archetype]}</p>
        {couple.heroPhoto && (
          <figure className="inv-hero">
            <img src={couple.heroPhoto} alt={dict.heroAlt(groom, bride)} decoding="async" />
          </figure>
        )}
        <h1 className="inv-names" id="inv-title">
          <span className="inv-name">{groom}</span>
          <span className="inv-amp" aria-hidden="true">
            &amp;
          </span>
          <span className="inv-sr-only"> {locale === "en" ? "and" : "và"} </span>
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
          {dict.scrollDown}
        </p>
      </div>
    </section>
  );
}
