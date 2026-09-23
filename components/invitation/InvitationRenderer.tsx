import type { CSSProperties } from "react";
import type { PublicWish } from "@/lib/api";
import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { FONT_VARS, type Template } from "@/lib/templates";
import { InvitationShell } from "./client/InvitationShell";
import { Album } from "./sections/Album";
import { CountdownSection } from "./sections/CountdownSection";
import { Couple } from "./sections/Couple";
import { Cover } from "./sections/Cover";
import { Events } from "./sections/Events";
import { Family } from "./sections/Family";
import { Gift } from "./sections/Gift";
import { RsvpSection } from "./sections/RsvpSection";
import { Thanks } from "./sections/Thanks";
import { WishesSection } from "./sections/WishesSection";
import "./invitation.css";
import "./arch-editorial.css";
import "./arch-minimal.css";
import "./arch-classic.css";
import "./arch-botanical.css";
import "./arch-traditional.css";
import "./arch-korean.css";

export type InvitationRendererProps = {
  content: Content;
  template: Template;
  /** "preview": forms are shown but disabled (template gallery, Studio). "live": the public page. */
  mode: "live" | "preview";
  /** Required in live mode: the RSVP and wish forms post to /api/public/invitations/{slug}. */
  slug?: string;
  /** From `?to=` on the link the guest opened, or resolved from `?g=` (guest-manager link, Phase 3). */
  guestName?: string;
  /** From `?g=` when it resolved to a real guest; sent with the RSVP so it can be attributed (lib/api.ts RsvpInput.guestToken). */
  guestToken?: string;
  wishes?: PublicWish[];
  /** Fixed clock for deterministic rendering (tests, SSR). */
  now?: Date;
  /** Envelope overlay before the page; defaults to on for live pages. */
  gate?: boolean;
  /** Render only the wrapper and the cover (gallery thumbnails). */
  only?: "cover";
  /** Phase 5: chrome language for the public guest page. Defaults to "vi" — preview/Studio never pass this. */
  locale?: Locale;
  /** Link to the other public-page language, including the current guest query. */
  toggleHref?: string;
};

// One renderer for every template: the palette and fonts arrive as CSS variables on .inv-stage and the
// archetype selects the cover, ornaments and rhythm in CSS, so the section markup never forks per template.
// The public page, the template preview and the Studio's live preview all render exactly this component.
export function InvitationRenderer({ content, template, mode, slug, guestName = "", guestToken = "", wishes = [], now, gate, only, locale = "vi", toggleHref }: InvitationRendererProps) {
  const { palette: p, fonts: f } = template;
  const style = {
    "--inv-bg": p.bg,
    "--inv-surface": p.surface,
    "--inv-ink": p.ink,
    "--inv-muted": p.muted,
    "--inv-accent": p.accent,
    "--inv-accent-ink": p.accentInk,
    "--inv-font-display": FONT_VARS[f.display],
    "--inv-font-body": FONT_VARS[f.body],
    "--inv-font-script": FONT_VARS[f.script ?? f.display],
  } as CSSProperties;

  const clock = now ?? new Date();
  const preview = mode === "preview";
  const guest = guestName.trim();
  const dict = t(locale);

  return (
    <div className="inv-stage" data-archetype={template.archetype} data-template={template.id} style={style}>
      <div className="inv">
        {toggleHref && <a className="inv-language-toggle" href={toggleHref}>{locale === "en" ? "VI" : "EN"}</a>}
        {only === "cover" ? (
          <div className="inv-content">
            <Cover content={content} template={template} locale={locale} />
          </div>
        ) : (
          <InvitationShell
            gate={gate ?? mode === "live"}
            guestName={guest}
            groom={content.couple.groom.name.trim() || dict.groomFallback}
            bride={content.couple.bride.name.trim() || dict.brideFallback}
            music={content.music}
            locale={locale}
          >
            <main className="inv-main">
              <Cover content={content} template={template} locale={locale} />
              <Couple content={content} locale={locale} />
              <Family content={content} locale={locale} />
              <Events content={content} locale={locale} />
              <CountdownSection content={content} now={clock} locale={locale} />
              <Album content={content} locale={locale} />
              <RsvpSection content={content} slug={slug} preview={preview} guestName={guest} guestToken={guestToken} locale={locale} />
              <WishesSection content={content} slug={slug} preview={preview} guestName={guest} wishes={wishes} locale={locale} />
              <Gift content={content} locale={locale} />
            </main>
            <Thanks content={content} locale={locale} />
          </InvitationShell>
        )}
      </div>
    </div>
  );
}
