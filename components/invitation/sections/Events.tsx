import type { Content, EventItem } from "@/lib/content";
import { formatDateVi } from "@/lib/datetime";
import { directionsUrl, embedUrl } from "@/lib/maps";
import { EventActions } from "../client/EventActions";
import { Reveal } from "../client/Reveal";

const DEFAULT_TITLE: Record<EventItem["kind"], string> = {
  engagement: "Lễ đính hôn",
  ceremony: "Lễ thành hôn",
  reception: "Tiệc cưới",
  custom: "Sự kiện",
};

// The date is drawn as a tear-off wall calendar leaf (tờ lịch bloc): a big day number with the month,
// weekday and, when the couple typed it, the lunar date underneath. That is how Vietnamese homes read a date.
function CalendarLeaf({ ev }: { ev: EventItem }) {
  const [year, month, day] = ev.date.split("-");
  const weekday = formatDateVi(ev.date).split(",")[0];
  if (!weekday) return null;
  return (
    <time className="inv-leaf" dateTime={ev.date}>
      <span className="inv-leaf__month">
        Tháng {Number(month)} · {year}
      </span>
      <span className="inv-leaf__day">{day}</span>
      <span className="inv-leaf__weekday">{weekday}</span>
      {ev.lunar.trim() && <span className="inv-leaf__lunar">{ev.lunar}</span>}
    </time>
  );
}

export function Events({ content }: { content: Content }) {
  const events = content.events.filter((e) => e.date || e.venue.trim() || e.address.trim() || e.title.trim());
  if (events.length === 0) return null;

  return (
    <section className="inv-section inv-events" aria-labelledby="inv-events-h">
      <Reveal>
        <h2 className="inv-label" id="inv-events-h">
          Thời gian và địa điểm
        </h2>
      </Reveal>
      {events.map((ev) => {
        const title = ev.title.trim() || DEFAULT_TITLE[ev.kind];
        return (
          <Reveal key={ev.id} className="inv-event">
            <CalendarLeaf ev={ev} />
            <div className="inv-event__body">
              <h3 className="inv-event__title">{title}</h3>
              {ev.time && <p className="inv-event__time">Vào lúc {ev.time}</p>}
              {ev.venue.trim() && <p className="inv-event__venue">{ev.venue}</p>}
              {ev.address.trim() && <p className="inv-event__address">{ev.address}</p>}
              <EventActions directions={directionsUrl(ev)} embed={embedUrl(ev)} title={ev.venue.trim() || title} />
            </div>
          </Reveal>
        );
      })}
    </section>
  );
}
