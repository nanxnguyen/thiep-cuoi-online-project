import type { CSSProperties } from "react";
import type { PublicWish } from "@/lib/api";
import type { Content } from "@/lib/content";
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
  /** From `?to=` on the link the guest opened. */
  guestName?: string;
  wishes?: PublicWish[];
  /** Fixed clock for deterministic rendering (tests, SSR). */
  now?: Date;
  /** Envelope overlay before the page; defaults to on for live pages. */
  gate?: boolean;
  /** Render only the wrapper and the cover (gallery thumbnails). */
  only?: "cover";
};

// One renderer for every template: the palette and fonts arrive as CSS variables on .inv-stage and the
// archetype selects the cover, ornaments and rhythm in CSS, so the section markup never forks per template.
// The public page, the template preview and the Studio's live preview all render exactly this component.
export function InvitationRenderer({ content, template, mode, slug, guestName = "", wishes = [], now, gate, only }: InvitationRendererProps) {
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

  return (
    <div className="inv-stage" data-archetype={template.archetype} data-template={template.id} style={style}>
      <div className="inv">
        {only === "cover" ? (
          <div className="inv-content">
            <Cover content={content} template={template} />
          </div>
        ) : (
          <InvitationShell
            gate={gate ?? mode === "live"}
            guestName={guest}
            groom={content.couple.groom.name.trim() || "Chú rể"}
            bride={content.couple.bride.name.trim() || "Cô dâu"}
            music={content.music}
          >
            <main className="inv-main">
              <Cover content={content} template={template} />
              <Couple content={content} />
              <Family content={content} />
              <Events content={content} />
              <CountdownSection content={content} now={clock} />
              <Album content={content} />
              <RsvpSection content={content} slug={slug} preview={preview} guestName={guest} />
              <WishesSection content={content} slug={slug} preview={preview} guestName={guest} wishes={wishes} />
              <Gift content={content} />
            </main>
            <Thanks content={content} />
          </InvitationShell>
        )}
      </div>
    </div>
  );
}
