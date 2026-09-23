import type { Content } from "@/lib/content";
import { formatDateEn, formatDateVi } from "@/lib/datetime";
import { t, type Locale } from "@/lib/i18n";
import { Reveal } from "../client/Reveal";
import { RsvpForm } from "../client/RsvpForm";

export function RsvpSection({
  content,
  slug,
  preview,
  guestName,
  guestToken,
  locale = "vi",
}: {
  content: Content;
  slug?: string;
  preview: boolean;
  guestName: string;
  guestToken?: string;
  locale?: Locale;
}) {
  const dict = t(locale);
  const { rsvp } = content;
  if (!rsvp.enabled) return null;
  const deadline = rsvp.deadline ? (locale === "en" ? formatDateEn(rsvp.deadline) : formatDateVi(rsvp.deadline)) : "";
  return (
    <section className="inv-section inv-rsvp" aria-labelledby="inv-rsvp-h">
      <Reveal>
        <h2 className="inv-label" id="inv-rsvp-h">
          {dict.rsvpTitle}
        </h2>
        <p className="inv-lead">
          {dict.rsvpLead}
          {deadline && dict.rsvpDeadlineNote(deadline.split(", ")[1])}
        </p>
        <RsvpForm slug={slug} preview={preview} guestName={guestName} guestToken={guestToken} questions={rsvp.questions} locale={locale} />
      </Reveal>
    </section>
  );
}
