import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { ceremonyOf, names } from "./shared";

// The personal greeting that opens the invitation: greeting, the guest's name, then the couple and a 囍 seal.
export function Envelope({ content, guestName, locale = "vi" }: { content: Content; guestName: string; locale?: Locale }) {
  if (!content.sections.envelope) return null;
  const dict = t(locale);
  const kind = (ceremonyOf(content)?.title.trim() || dict.eventKindTitle.ceremony).toLowerCase();
  return (
    <section className="inv-sec inv-envelope-sec">
      <span className="inv-envelope-sec__greet">{content.envelope.greeting.trim() || dict.kindlyInvites}</span>
      <span className="inv-envelope-sec__guest">{guestName || dict.defaultGuest}</span>
      <span className="inv-envelope-sec__to">{dict.toAttend(kind)}</span>
      <span className="inv-envelope-sec__names inv-name-font">{names(content, locale)}</span>
      <span className="inv-envelope-sec__seal" aria-hidden="true">
        囍
      </span>
    </section>
  );
}
