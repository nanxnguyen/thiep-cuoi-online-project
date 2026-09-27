import type { Content, EventItem } from "@/lib/content";
import { formatDateEn, formatDateVi } from "@/lib/datetime";
import { t, type Locale } from "@/lib/i18n";
import { directionsUrl } from "@/lib/maps";
import { split } from "./shared";

// Design (Studio Editor v3 preview): the ceremony is a light block with a big day number, the reception a deep block
// with welcome/dinner times and a directions pill. Engagement and custom events use the ceremony layout.
function Ceremony({ ev, locale, first }: { ev: EventItem; locale: Locale; first: boolean }) {
  const dict = t(locale);
  const { y, m, d } = split(ev.date);
  const weekday = (locale === "en" ? formatDateEn(ev.date) : formatDateVi(ev.date)).split(",")[0];
  const title = ev.kind !== "custom" && locale === "en" ? dict.eventKindTitle[ev.kind] : ev.title.trim() || dict.eventKindTitle[ev.kind];
  const place = ev.venue.trim() || ev.address.trim();
  return (
    <section id={first ? "su-kien" : undefined} className="inv-sec inv-events inv-ceremony">
      <span className="inv-k">{dict.ceremonyKicker}</span>
      <span className="inv-ceremony__type inv-name-font">{title}</span>
      {ev.time && weekday && <span className="inv-ceremony__time">{dict.atTimeOn(ev.time, weekday)}</span>}
      {d && (
        <time className="inv-ceremony__date" dateTime={ev.date}>
          <i />
          <span>
            <span className="inv-ceremony__day">{d}</span>
            <span className="inv-ceremony__my">{dict.monthYear(m, y)}</span>
          </span>
          <i />
        </time>
      )}
      {ev.lunar.trim() && <span className="inv-ceremony__lunar">{ev.lunar}</span>}
      {place && <span className="inv-ceremony__place">{dict.atPlace(place)}</span>}
    </section>
  );
}

function Party({ ev, locale, first }: { ev: EventItem; locale: Locale; first: boolean }) {
  const dict = t(locale);
  const directions = directionsUrl(ev);
  return (
    <section id={first ? "su-kien" : undefined} className="inv-sec inv-party">
      <span className="inv-k inv-k--gold">{dict.partyKicker}</span>
      {ev.venue.trim() && <span className="inv-party__venue inv-name-font">{ev.venue}</span>}
      {(ev.arrivalTime || ev.time) && (
        <div className="inv-party__times">
          <div>
            <span>{dict.welcomeLabel}</span>
            <span>{ev.arrivalTime || "—"}</span>
          </div>
          <div>
            <span>{dict.dinnerLabel}</span>
            <span>{ev.time || "—"}</span>
          </div>
        </div>
      )}
      {ev.date && <span className="inv-party__date">{dict.longDate(ev.date)}</span>}
      {ev.address.trim() && <span className="inv-party__addr">{ev.address}</span>}
      {directions && (
        <a className="inv-party__map" href={directions} target="_blank" rel="noopener noreferrer">
          {dict.directions}
        </a>
      )}
    </section>
  );
}

export function Events({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  if (!content.sections.events) return null;
  const events = content.events.filter((e) => e.date || e.venue.trim() || e.address.trim());
  return events.map((ev, i) =>
    ev.kind === "reception" ? <Party key={ev.id} ev={ev} locale={locale} first={i === 0} /> : <Ceremony key={ev.id} ev={ev} locale={locale} first={i === 0} />,
  );
}
