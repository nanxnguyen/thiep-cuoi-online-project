import { Fragment, type CSSProperties } from "react";
import type { PublicWish } from "@/lib/api";
import type { Content } from "@/lib/content";
import { t, type Locale } from "@/lib/i18n";
import { colors, type Template } from "@/lib/templates";
import { InvitationShell } from "./client/InvitationShell";
import { ViewTracker } from "./client/ViewTracker";
import { renderInvitationSection } from "./section-renderer";
import { Envelope } from "./sections/Envelope";
import { SECTION_PROFILES } from "@/lib/section-profiles";
import { resolveSectionOrder } from "@/lib/section-profiles";
import "./invitation.css";

export type InvitationRendererProps = {
  content: Content;
  template: Template;
  /** "preview": forms are shown but disabled (template gallery, Studio). "live": the public page. */
  mode: "live" | "preview";
  /** Required in live mode: the RSVP and wish forms post to /api/public/invitations/{slug}. */
  slug?: string;
  /** Public invitation id used only to scope Realtime wishes. */
  invitationId?: string;
  /** Tên hộ resolve từ link riêng `?g=` (danh sách khách trong DB). Không có token thì dùng tên mặc định. */
  guestName?: string;
  /** From `?g=` when it resolved to a real guest; sent with the RSVP so it can be attributed (lib/api.ts RsvpInput.guestToken). */
  guestToken?: string;
  wishes?: PublicWish[];
  /** Fixed clock for deterministic rendering (tests, SSR). */
  now?: Date;
  /** Envelope overlay before the page; defaults to on for live pages. */
  gate?: boolean;
  /** Phase 5: chrome language for the public guest page. Defaults to "vi" — preview/Studio never pass this. */
  locale?: Locale;
  /** Link to the other public-page language, including the current guest query. */
  toggleHref?: string;
  /** Marketing previews: an empty hero photo shows the template's sample photo instead of the empty frame. */
  showcase?: boolean;
};

const NAME_FONTS = { playfair: "var(--display)", cormorant: "var(--script)", vibes: "var(--hand)" } as const;

// Sticky jump links to the sections this invitation actually shows (design/Thiep Khach.dc.html). Guest page only.
function SectionNav({ content, labels }: { content: Content; labels: readonly string[] }) {
  const s = content.sections;
  const items = [
    ["gia-dinh", labels[0], s.family],
    ["su-kien", labels[1], s.events && content.events.length > 0],
    ["album", labels[2], s.album && content.album.length > 0],
    ["tham-du", labels[3], s.rsvp && content.rsvp.enabled],
    ["loi-chuc", labels[4], s.guestbook && content.guestbook.enabled],
    ["mung-cuoi", labels[5], s.gift && content.gift.enabled && content.gift.accounts.length > 0],
  ] as const;
  return (
    <nav className="inv-nav" aria-label="Các phần của thiệp">
      <div>
        {items.filter(([, , on]) => on).map(([id, label]) => (
          <a key={id} href={`#${id}`}>
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

// One renderer for every template (design/Studio Editor v3.dc.html preview pane): the palette arrives as CSS
// variables, the template's family picks the cover, and every other section is the same markup for all templates.
// The public page, the template preview and the Studio's live preview all render exactly this component.
export function InvitationRenderer({ content, template, mode, slug, invitationId, guestName = "", guestToken = "", wishes = [], now, gate, locale = "vi", toggleHref, showcase = false }: InvitationRendererProps) {
  const key = template.colors.includes(content.paletteKey as keyof typeof colors) ? (content.paletteKey as keyof typeof colors) : template.colors[0];
  const c = colors[key];
  const style = {
    "--c-deep": c.deep,
    "--c-paper": c.paper,
    "--c-gold": c.gold,
    "--c-tint": `${c.deep}14`,
    "--c-name": NAME_FONTS[content.nameFont],
  } as CSSProperties;
  const clock = now ?? new Date();
  const guest = guestName.trim();
  const dict = t(locale);
  // Profiles only reorder the sections inside <main>; envelope, tracker, nav and
  // shell stay exactly where they are, so legacy templates render the same DOM.
  const profile = SECTION_PROFILES[template.profile];
  const order = resolveSectionOrder(profile, () => true);
  const ctx = { content, template, profile, mode, slug, invitationId, guestName: guest, guestToken, wishes, now: clock, locale, showcase };

  return (
    <div className="inv-stage" data-mode={mode} data-template={template.id} data-family={template.family} data-color={key} data-profile={template.profile} data-density={profile.density} data-ornament={profile.ornament} style={style}>
      <InvitationShell
        gate={gate ?? mode === "live"}
        guestName={guest}
        groom={content.couple.groom.name.trim() || dict.groomFallback}
        bride={content.couple.bride.name.trim() || dict.brideFallback}
        music={content.sections.music ? content.music : null}
        locale={locale}
      >
        {mode === "live" && slug && <ViewTracker slug={slug} />}
        {mode === "live" && <SectionNav content={content} labels={dict.nav} />}
        {toggleHref && (
          <a className="inv-language-toggle" href={toggleHref}>
            {locale === "en" ? "VI" : "EN"}
          </a>
        )}
        <main className="inv-col">
          <Envelope content={content} guestName={guest} locale={locale} />
          {order.map((section) => (
            <Fragment key={section}>{renderInvitationSection(section, ctx)}</Fragment>
          ))}
        </main>
      </InvitationShell>
    </div>
  );
}
