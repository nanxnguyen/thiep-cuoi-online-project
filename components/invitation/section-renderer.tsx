import type { ReactNode } from "react";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { Template } from "@/lib/templates";
import type { InvitationSectionKey, SectionProfile } from "@/lib/section-profiles";
import type { PublicWish } from "@/lib/api";
import { Album } from "./sections/Album";
import { CountdownSection } from "./sections/CountdownSection";
import { Couple } from "./sections/Couple";
import { Cover } from "./sections/Cover";
import { DressCode } from "./sections/DressCode";
import { Events } from "./sections/Events";
import { Family } from "./sections/Family";
import { Gift } from "./sections/Gift";
import { RsvpSection } from "./sections/RsvpSection";
import { Schedule } from "./sections/Schedule";
import { Story } from "./sections/Story";
import { Thanks } from "./sections/Thanks";
import { Venue } from "./sections/Venue";
import { Video } from "./sections/Video";
import { WishesSection } from "./sections/WishesSection";

export type SectionRenderContext = {
  content: Content;
  template: Template;
  profile: SectionProfile;
  mode: "live" | "preview";
  slug?: string;
  invitationId?: string;
  guestName: string;
  guestToken: string;
  wishes: PublicWish[];
  now: Date;
  locale: Locale;
  showcase: boolean;
};

// One owner for every section's behaviour: profiles only reorder and pick variants,
// each section still decides for itself whether it has anything to show.
export function renderInvitationSection(key: InvitationSectionKey, ctx: SectionRenderContext): ReactNode {
  const { content, template, profile, mode, slug, invitationId, guestName, guestToken, wishes, now, locale, showcase } = ctx;
  const preview = mode === "preview";
  switch (key) {
    case "cover":
      return <Cover content={content} template={template} locale={locale} showcase={showcase} />;
    case "couple":
      return <Couple content={content} locale={locale} />;
    case "family":
      return <Family content={content} locale={locale} />;
    case "events":
      return <Events content={content} locale={locale} />;
    case "venue":
      return <Venue content={content} variant={profile.variants.venue} locale={locale} />;
    case "schedule":
      return <Schedule content={content} locale={locale} />;
    case "countdown":
      return <CountdownSection content={content} now={now} locale={locale} />;
    case "dressCode":
      return <DressCode content={content} variant={profile.variants.dressCode} locale={locale} />;
    case "story":
      return <Story content={content} variant={profile.variants.story} locale={locale} />;
    case "album":
      return <Album content={content} locale={locale} />;
    case "video":
      return <Video content={content} preview={preview} locale={locale} />;
    case "rsvp":
      return <RsvpSection content={content} slug={slug} preview={preview} guestName={guestName} guestToken={guestToken} locale={locale} />;
    case "guestbook":
      return <WishesSection content={content} slug={slug} invitationId={invitationId} preview={preview} guestName={guestName} wishes={wishes} locale={locale} />;
    case "gift":
      return <Gift content={content} locale={locale} />;
    case "thanks":
      return <Thanks content={content} locale={locale} />;
  }
}
