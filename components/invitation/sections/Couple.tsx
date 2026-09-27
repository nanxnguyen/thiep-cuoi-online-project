import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { brideName, groomName } from "./shared";

function Person({ photo, rank, name, alt }: { photo: string; rank: string; name: string; alt: string }) {
  return (
    <div className="inv-couple__who">
      <div className="inv-couple__ph">{photo ? <img src={photo} alt={alt} decoding="async" /> : <span className="inv-empty" aria-hidden="true" />}</div>
      {rank.trim() && <span className="inv-couple__rank">{rank}</span>}
      <span className="inv-couple__name inv-name-font">{name}</span>
    </div>
  );
}

export function Couple({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  if (!content.sections.couple) return null;
  const dict = t(locale);
  const { groom, bride } = content.couple;
  return (
    <section className="inv-sec inv-couple">
      <span className="inv-k">{dict.coupleTitle}</span>
      <div className="inv-couple__row">
        <Person photo={groom.photo} rank={groom.rank} name={groomName(content, locale)} alt={dict.groomFallback} />
        <span className="inv-couple__amp" aria-hidden="true">
          &amp;
        </span>
        <Person photo={bride.photo} rank={bride.rank} name={brideName(content, locale)} alt={dict.brideFallback} />
      </div>
    </section>
  );
}
