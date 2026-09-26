import type { Content } from "@/lib/content";
import type { PublicWish } from "@/lib/api";
import { t, type Locale } from "@/lib/i18n";
import { Reveal } from "../client/Reveal";
import { WishesPanel } from "../client/WishesPanel";

export function WishesSection({
  content,
  slug,
  invitationId,
  preview,
  guestName,
  wishes,
  locale = "vi",
}: {
  content: Content;
  slug?: string;
  invitationId?: string;
  preview: boolean;
  guestName: string;
  wishes: PublicWish[];
  locale?: Locale;
}) {
  if (!content.guestbook.enabled) return null;
  const dict = t(locale);
  return (
    <section id="loi-chuc" className="inv-section inv-wishsec" aria-labelledby="inv-wish-h">
      <Reveal>
        <h2 className="inv-label" id="inv-wish-h">
          {dict.wishesTitle}
        </h2>
        <WishesPanel slug={slug} invitationId={invitationId} preview={preview} guestName={guestName} initial={wishes} locale={locale} />
      </Reveal>
    </section>
  );
}
