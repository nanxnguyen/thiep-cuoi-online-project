import type { Content } from "@/lib/content";
import { eventStart, nextEvent } from "@/lib/datetime";
import { t, type Locale } from "@/lib/i18n";
import { AddToCalendar } from "../client/AddToCalendar";
import { CountdownClock } from "../client/CountdownClock";

// Counts down to the next event that has not started yet; once every event is over the section disappears.
export function CountdownSection({ content, now, locale = "vi" }: { content: Content; now: Date; locale?: Locale }) {
  if (!content.sections.countdown) return null;
  const dict = t(locale);
  const next = nextEvent(content.events, now);
  const start = next && eventStart(next);
  if (!next || !start) return null;
  const title = next.title.trim() || dict.weddingFallback;
  return (
    <section className="inv-sec inv-countdown">
      <span className="inv-k">{dict.countdownLabel}</span>
      <CountdownClock targetIso={start.toISOString()} nowIso={now.toISOString()} locale={locale} />
      {content.sections.calendar && (
        <AddToCalendar
          uid={`${next.id}@moc-wedding`}
          event={{ title: `${title}: ${content.couple.groom.name} & ${content.couple.bride.name}`, date: next.date, time: next.time, venue: next.venue, address: next.address }}
          locale={locale}
        />
      )}
    </section>
  );
}
