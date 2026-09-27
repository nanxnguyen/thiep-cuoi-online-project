import type { PublicWish } from "@/lib/api";
import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { WishesPanel } from "../client/WishesPanel";
import { names } from "./shared";

export function WishesSection({ content, slug, invitationId, preview, guestName, wishes, locale = "vi" }: { content: Content; slug?: string; invitationId?: string; preview: boolean; guestName: string; wishes: PublicWish[]; locale?: Locale }) {
  if (!content.sections.guestbook || !content.guestbook.enabled) return null;
  const dict = t(locale);
  return (
    <section id="loi-chuc" className="inv-sec inv-wishsec">
      <h2 className="inv-wishsec__title inv-name-font">{dict.wishesTitle}</h2>
      <WishesPanel slug={slug} invitationId={invitationId} preview={preview} guestName={guestName} initial={wishes} placeholder={dict.wishTo(names(content, locale))} locale={locale} />
    </section>
  );
}
