import type { Content, EventItem } from "@/lib/content";
import { formatDateEn, formatDateVi } from "@/lib/datetime";
import { t, type Locale } from "@/lib/i18n";
import { directionsUrl, embedUrl } from "@/lib/maps";
import { EventActions } from "../client/EventActions";
import { Reveal } from "../client/Reveal";

const MONTH_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// The date is drawn as a tear-off wall calendar leaf (tờ lịch bloc): a big day number with the month,
// weekday and, when the couple typed it, the lunar date underneath. That is how Vietnamese homes read a date.
function CalendarLeaf({ ev, locale }: { ev: EventItem; locale: Locale }) {
  const [year, month, day] = ev.date.split("-");
  const weekday = (locale === "en" ? formatDateEn(ev.date) : formatDateVi(ev.date)).split(",")[0];
  if (!weekday) return null;
  return (
    <time className="inv-leaf" dateTime={ev.date}>
      <span className="inv-leaf__month">{locale === "en" ? `${MONTH_EN[Number(month) - 1]} · ${year}` : `Tháng ${Number(month)} · ${year}`}</span>
      <span className="inv-leaf__day">{day}</span>
      <span className="inv-leaf__weekday">{weekday}</span>
      {ev.lunar.trim() && <span className="inv-leaf__lunar">{ev.lunar}</span>}
    </time>
  );
}

export function Events({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  const dict = t(locale);
  const events = content.events.filter((e) => e.date || e.venue.trim() || e.address.trim() || e.title.trim());
  if (events.length === 0) return null;

  return (
    <section id="su-kien" className="inv-section inv-events" aria-labelledby="inv-events-h">
      <Reveal>
        <h2 className="inv-label" id="inv-events-h">
          {dict.eventsTitle}
        </h2>
      </Reveal>
      {events.map((ev) => {
        // Sự kiện chuẩn (không phải "custom") luôn hiện nhãn tiếng Anh cố định ở locale en — chữ chủ thiệp gõ
        // ở "title" là tiếng Việt, không có bản dịch riêng (xem spec Phase 5 mục 2). "custom" giữ nguyên chữ gõ.
        const title = ev.kind !== "custom" && locale === "en" ? dict.eventKindTitle[ev.kind] : ev.title.trim() || dict.eventKindTitle[ev.kind];
        return (
          <Reveal key={ev.id} className="inv-event">
            <CalendarLeaf ev={ev} locale={locale} />
            <div className="inv-event__body">
              <h3 className="inv-event__title">{title}</h3>
              {ev.time && <p className="inv-event__time">{dict.atTime(ev.time)}</p>}
              {ev.venue.trim() && <p className="inv-event__venue">{ev.venue}</p>}
              {ev.address.trim() && <p className="inv-event__address">{ev.address}</p>}
              <EventActions directions={directionsUrl(ev)} embed={embedUrl(ev)} title={ev.venue.trim() || title} locale={locale} />
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}
