import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { RsvpForm } from "../client/RsvpForm";
import { split } from "./shared";

export function RsvpSection({ content, slug, preview, guestName, guestToken, locale = "vi" }: { content: Content; slug?: string; preview: boolean; guestName: string; guestToken?: string; locale?: Locale }) {
  const { rsvp } = content;
  if (!content.sections.rsvp || !rsvp.enabled) return null;
  const dict = t(locale);
  const { m, d } = split(rsvp.deadline);
  return (
    <section id="tham-du" className="inv-sec inv-rsvp">
      <span className="inv-k inv-k--gold">{dict.rsvpTitle}</span>
      {d && <span className="inv-rsvp__by">{dict.rsvpBy(`${d}/${m}`)}</span>}
      <RsvpForm slug={slug} preview={preview} guestName={guestName} guestToken={guestToken} questions={rsvp.questions} plusOnes={rsvp.plusOnes} locale={locale} />
    </section>
  );
}
