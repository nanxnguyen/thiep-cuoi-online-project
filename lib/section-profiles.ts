// Section profiles for the invitation catalog (spec 2026-10-04-thirty-new-templates).
// A profile only governs sections rendered inside <main>. Envelope, music and the
// add-to-calendar control stay shell-level, so the legacy default DOM cannot shift
// when profiles roll out to the 30 new templates (owner decision 2026-10-04).

export const sectionKeys = [
  "cover", "couple", "family", "events", "venue", "schedule", "countdown",
  "dressCode", "story", "album", "video", "rsvp", "guestbook", "gift", "thanks",
] as const;

export type InvitationSectionKey = (typeof sectionKeys)[number];

export type SectionVariants = {
  story: "timeline" | "cards" | "editorial";
  venue: "card" | "editorial" | "illustrated";
  album: "grid" | "masonry" | "filmstrip";
  dressCode: "swatches" | "text";
};

export type SectionDensity = "airy" | "balanced" | "ceremonial";

export type SectionOrnament = "none" | "heritage" | "garden" | "editorial" | "luxury" | "story" | "expressive";

export type SectionProfile = {
  order: readonly InvitationSectionKey[];
  variants: SectionVariants;
  density: SectionDensity;
  ornament: SectionOrnament;
};

export type SectionProfileKey =
  | "default"
  | "heritage"
  | "garden"
  | "editorial-photo"
  | "quiet-luxury"
  | "story-led"
  | "expressive";

const baseVariants: SectionVariants = { story: "timeline", venue: "card", album: "grid", dressCode: "swatches" };

export const DEFAULT_SECTION_PROFILE: SectionProfile = {
  order: [
    "cover", "couple", "family", "events", "venue", "schedule", "countdown",
    "dressCode", "story", "album", "video", "rsvp", "guestbook", "gift", "thanks",
  ],
  variants: baseVariants,
  density: "balanced",
  ornament: "none",
};

export const SECTION_PROFILES: Record<SectionProfileKey, SectionProfile> = {
  default: DEFAULT_SECTION_PROFILE,
  heritage: {
    order: [
      "cover", "family", "couple", "events", "venue", "countdown", "schedule",
      "dressCode", "story", "album", "video", "rsvp", "guestbook", "gift", "thanks",
    ],
    variants: { ...baseVariants, venue: "illustrated" },
    density: "ceremonial",
    ornament: "heritage",
  },
  garden: {
    order: [
      "cover", "couple", "family", "story", "events", "venue", "countdown",
      "album", "dressCode", "video", "rsvp", "gift", "guestbook", "thanks", "schedule",
    ],
    variants: { story: "cards", venue: "illustrated", album: "masonry", dressCode: "swatches" },
    density: "airy",
    ornament: "garden",
  },
  "editorial-photo": {
    order: [
      "cover", "couple", "events", "countdown", "story", "album", "video",
      "venue", "dressCode", "family", "schedule", "rsvp", "gift", "guestbook", "thanks",
    ],
    variants: { story: "editorial", venue: "editorial", album: "masonry", dressCode: "text" },
    density: "balanced",
    ornament: "editorial",
  },
  "quiet-luxury": {
    order: [
      "cover", "family", "couple", "events", "venue", "countdown", "dressCode",
      "album", "story", "video", "schedule", "rsvp", "gift", "guestbook", "thanks",
    ],
    variants: baseVariants,
    density: "airy",
    ornament: "luxury",
  },
  "story-led": {
    order: [
      "cover", "story", "couple", "family", "events", "venue", "countdown",
      "schedule", "album", "video", "dressCode", "rsvp", "guestbook", "gift", "thanks",
    ],
    variants: { story: "cards", venue: "editorial", album: "filmstrip", dressCode: "swatches" },
    density: "balanced",
    ornament: "story",
  },
  expressive: {
    order: [
      "cover", "couple", "story", "family", "events", "schedule", "countdown",
      "album", "video", "venue", "dressCode", "rsvp", "guestbook", "gift", "thanks",
    ],
    variants: { story: "editorial", venue: "illustrated", album: "masonry", dressCode: "swatches" },
    density: "balanced",
    ornament: "expressive",
  },
};

export function resolveSectionOrder(
  profile: SectionProfile,
  isEnabled: (key: InvitationSectionKey) => boolean,
): InvitationSectionKey[] {
  return profile.order.filter(isEnabled);
}
