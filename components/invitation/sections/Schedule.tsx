import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";

export function Schedule({ content, locale = "vi" }: { content: Content; locale?: Locale }) {
  const items = content.schedule.filter((s) => s.time || s.title.trim());
  if (!content.sections.schedule || items.length === 0) return null;
  return (
    <section className="inv-sec inv-schedule">
      <span className="inv-k">{t(locale).scheduleTitle}</span>
      <ol className="inv-schedule__list">
        {items.map((s) => (
          <li key={s.id}>
            <i aria-hidden="true" />
            <span className="inv-schedule__t">{s.time}</span>
            <span>{s.title}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
