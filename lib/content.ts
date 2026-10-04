import { z } from "zod";
import { isLibraryMusicUrl } from "./music.ts";

export const MAX_EVENTS = 6;
export const MAX_ALBUM = 24;
export const MAX_QUESTIONS = 3;
export const MAX_ACCOUNTS = 2;
export const MAX_SCHEDULE_ITEMS = 8;
export const EVENT_KINDS = ["engagement", "ceremony", "reception", "custom"] as const;

// Mirrors the backend record `InvitationContent` field for field (spec 6.2).
// Drafts are autosaved while typing, so every "empty" value is "" and stays valid.
const text = (max: number) => z.string().max(max);
const httpUrl = z.string().max(500).refine((v) => /^https?:\/\/\S+$/i.test(v), "URL không hợp lệ");
const optionalUrl = z.union([z.literal(""), httpUrl]);
// Music is either an https link/upload or one of the built-in tracks (site-relative path, exact match only).
const musicUrl = z.string().max(500).refine((v) => /^https?:\/\/\S+$/i.test(v) || isLibraryMusicUrl(v), "URL không hợp lệ");
const dateStr = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/);
const timeStr = z.string().regex(/^(\d{2}:\d{2})?$/);
const id = z.string().min(1).max(40);

const side = z.object({ father: text(60), mother: text(60), address: text(200) });
const person = z.object({ name: text(60), rank: text(30).default(""), photo: optionalUrl.default("") });

export const eventSchema = z.object({
  id,
  kind: z.enum(EVENT_KINDS),
  title: text(80),
  date: dateStr,
  time: timeStr,
  arrivalTime: timeStr.default(""),
  lunar: text(60),
  venue: text(120),
  address: text(200),
  mapUrl: optionalUrl,
  venuePhoto: optionalUrl.default(""),
  directionsNote: text(300).default(""),
  parkingNote: text(300).default(""),
});

export const MAX_STORY_ITEMS = 6;
export const MAX_DRESS_COLORS = 5;
export const MAX_VIDEO_URL = 500;

const httpsUrl = (max: number) => z.string().max(max).refine((v) => /^https?:\/\/\S+$/i.test(v), "URL không hợp lệ");

const storyItemSchema = z.object({
  id,
  date: text(40),
  title: text(100),
  body: text(500),
  photo: optionalUrl,
  alt: text(120),
});

const storySchema = z.object({ enabled: z.boolean(), items: z.array(storyItemSchema).max(MAX_STORY_ITEMS) });

const videoSchema = z.object({
  enabled: z.boolean(),
  url: z.union([z.literal(""), httpsUrl(MAX_VIDEO_URL)]),
  posterUrl: z.union([z.literal(""), httpsUrl(MAX_VIDEO_URL)]),
  title: text(120),
});

const dressCodeSchema = z.object({
  enabled: z.boolean(),
  title: text(80),
  note: text(300),
  colors: z.array(z.object({ value: z.string().regex(/^#[0-9a-fA-F]{6}$/), label: text(40) })).max(MAX_DRESS_COLORS),
});

const sectionsV1Shape = {
    envelope: z.boolean().default(true),
    calendar: z.boolean().default(true),
    music: z.boolean().default(true),
    couple: z.boolean().default(true),
    family: z.boolean().default(true),
    events: z.boolean().default(true),
    schedule: z.boolean().default(false),
    countdown: z.boolean().default(true),
    album: z.boolean().default(true),
    rsvp: z.boolean().default(true),
    guestbook: z.boolean().default(true),
    gift: z.boolean().default(true),
    thanks: z.boolean().default(true),
};

// Byte-compatible v1 contract: every invitation stored before content v2 still parses.
// New top-level objects and section toggles are absent here; upgradeV1 fills them.
export const legacyContentV1Schema = z.object({
  v: z.literal(1),
  paletteKey: z.string().max(20).regex(/^[a-z]*$/).default(""),
  // Studio Editor v3 "Mẫu & kiểu chữ": the font the couple's names are set in.
  nameFont: z.enum(["playfair", "cormorant", "vibes"]).default("playfair"),
  envelope: z.object({ greeting: text(120) }).default({ greeting: "Trân trọng kính mời" }),
  couple: z.object({
    groom: person,
    bride: person,
    message: text(500),
    // Bản tiếng Anh tuỳ chọn của "message" (Phase 5, đa ngôn ngữ) — "" khi chủ thiệp chưa gõ, trang khách
    // fallback về "message". Không dịch tên/địa chỉ/ngày — xem docs/superpowers/specs/2026-09-23-i18n-phase5-design.md.
    messageEn: text(500),
    heroPhoto: optionalUrl,
  }),
  family: z.object({ groomSide: side, brideSide: side }),
  events: z.array(eventSchema).max(MAX_EVENTS),
  schedule: z.array(z.object({ id, time: timeStr, title: text(80) })).max(MAX_SCHEDULE_ITEMS).default([]),
  album: z.array(z.object({ url: httpUrl, alt: text(120) })).max(MAX_ALBUM),
  albumLayout: z.enum(["grid", "masonry", "filmstrip"]).default("grid"),
  // Studio Editor v3 "Số ảnh hiển thị".
  albumCount: z.union([z.literal(3), z.literal(6), z.literal(9)]).default(6),
  music: z.object({ url: musicUrl, title: text(80) }).nullable(),
  rsvp: z.object({
    enabled: z.boolean(),
    deadline: dateStr,
    plusOnes: z.boolean().default(true),
    questions: z
      .array(z.object({ id, label: text(120), labelEn: text(120), type: z.enum(["text", "yesno"]) }))
      .max(MAX_QUESTIONS),
  }),
  guestbook: z.object({ enabled: z.boolean(), moderate: z.boolean().default(true) }),
  gift: z.object({
    enabled: z.boolean(),
    note: text(300),
    noteEn: text(300),
    accounts: z
      .array(
        z.object({
          holder: z.enum(["groom", "bride"]),
          bankCode: text(20),
          accountNumber: z.string().regex(/^\d{0,20}$/),
          accountName: text(80),
        }),
      )
      .max(MAX_ACCOUNTS),
  }),
  thanks: z.object({ message: text(500), messageEn: text(500) }),
  sections: z.object(sectionsV1Shape).default({ envelope: true, calendar: true, music: true, couple: true, family: true, events: true, schedule: false, countdown: true, album: true, rsvp: true, guestbook: true, gift: true, thanks: true }),
});

export type LegacyContentV1 = z.infer<typeof legacyContentV1Schema>;

const contentV2Schema = legacyContentV1Schema.extend({
  v: z.literal(2),
  story: storySchema.default({ enabled: false, items: [] }),
  video: videoSchema.default({ enabled: false, url: "", posterUrl: "", title: "" }),
  dressCode: dressCodeSchema.default({ enabled: false, title: "", note: "", colors: [] }),
  sections: z
    .object({
      ...sectionsV1Shape,
      story: z.boolean().default(false),
      video: z.boolean().default(false),
      dressCode: z.boolean().default(false),
      venue: z.boolean().default(false),
    })
    .default({ envelope: true, calendar: true, music: true, couple: true, family: true, events: true, schedule: false, countdown: true, album: true, rsvp: true, guestbook: true, gift: true, thanks: true, story: false, video: false, dressCode: false, venue: false }),
});

// Accepts stored v1 and new v2 payloads; output is always v2.
export const contentSchema = z.union([contentV2Schema, legacyContentV1Schema.transform(upgradeV1)]);

export type Content = z.output<typeof contentV2Schema>;
export type EventItem = Content["events"][number];

export function upgradeV1(input: LegacyContentV1): Content {
  return {
    ...input,
    v: 2 as const,
    story: { enabled: false, items: [] },
    video: { enabled: false, url: "", posterUrl: "", title: "" },
    dressCode: { enabled: false, title: "", note: "", colors: [] },
    sections: { ...input.sections, story: false, video: false, dressCode: false, venue: false },
  };
}

export const SAMPLE_NAMES = { groom: "Minh", bride: "An" } as const;

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const daysFrom = (now: Date, n: number) => new Date(now.getTime() + n * 86_400_000);

export function defaultContent(now: Date = new Date()): Content {
  const day = isoDate(daysFrom(now, 75));
  return {
    v: 2,
    paletteKey: "",
    nameFont: "playfair",
    envelope: { greeting: "Trân trọng kính mời" },
    couple: {
      groom: { name: SAMPLE_NAMES.groom, rank: "", photo: "" },
      bride: { name: SAMPLE_NAMES.bride, rank: "", photo: "" },
      message:
        "Chúng mình sắp về chung một nhà. Rất mong bạn đến chung vui và chúc phúc cho ngày trọng đại của hai đứa.",
      messageEn: "",
      heroPhoto: "",
    },
    family: {
      groomSide: { father: "Ông Nguyễn Văn Hòa", mother: "Bà Trần Thị Lan", address: "Quận 1, TP. Hồ Chí Minh" },
      brideSide: { father: "Ông Lê Quang Minh", mother: "Bà Phạm Thị Thu", address: "Quận 3, TP. Hồ Chí Minh" },
    },
    events: [
      { id: "ceremony", kind: "ceremony", title: "Lễ thành hôn", date: day, time: "10:00", arrivalTime: "", lunar: "", venue: "Tư gia nhà trai", address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", mapUrl: "", venuePhoto: "", directionsNote: "", parkingNote: "" },
      { id: "reception", kind: "reception", title: "Tiệc cưới", date: day, time: "18:00", arrivalTime: "17:30", lunar: "", venue: "Nhà hàng Hoa Sen", address: "45 Lê Lợi, Quận 1, TP. Hồ Chí Minh", mapUrl: "", venuePhoto: "", directionsNote: "", parkingNote: "" },
    ],
    schedule: [],
    album: [],
    albumLayout: "grid",
    albumCount: 6,
    music: null,
    rsvp: { enabled: true, deadline: "", plusOnes: true, questions: [] },
    guestbook: { enabled: true, moderate: true },
    gift: { enabled: false, note: "Sự hiện diện của bạn là niềm vui lớn nhất của chúng mình.", noteEn: "", accounts: [] },
    thanks: { message: "Cảm ơn bạn đã dành thời gian và tình cảm cho chúng mình.", messageEn: "" },
    story: { enabled: false, items: [] },
    video: { enabled: false, url: "", posterUrl: "", title: "" },
    dressCode: { enabled: false, title: "", note: "", colors: [] },
    sections: { envelope: true, calendar: true, music: true, couple: true, family: true, events: true, schedule: false, countdown: true, album: true, rsvp: true, guestbook: true, gift: true, thanks: true, story: false, video: false, dressCode: false, venue: false },
  };
}

export function normalizeContent(input: unknown): Content {
  const c = contentSchema.parse(input);
  // Canonical toggles: the section objects own the on/off state; sections.* mirrors them
  // so Studio mutations only need one update site (see toggleOn in lib/editor-sections.ts).
  // Venue has no object of its own — its data lives on the reception event.
  return {
    ...c,
    sections: { ...c.sections, story: c.story.enabled, video: c.video.enabled, dressCode: c.dressCode.enabled },
  };
}

// Preview data for /templates/[id]. Album paths are root-relative, so this is intentionally
// not schema-valid: it is only ever rendered, never sent to the API.
export function sampleContent(now: Date = new Date()): Content {
  const base = defaultContent(now);
  const photo = (n: string) => `/photos/${n}.jpg`;
  return {
    ...base,
    couple: {
      ...base.couple,
      groom: { name: "Minh Khôi", rank: "Trưởng nam", photo: photo("vest-xanh-navy") },
      bride: { name: "Hạ Vy", rank: "Út nữ", photo: photo("studio-hoa-trang") },
    },
    events: base.events.map((e) => (e.kind === "ceremony" ? { ...e, time: "09:00", lunar: "Tức ngày 19 tháng 9 năm Bính Ngọ" } : e)),
    schedule: [
      ["17:30", "Đón khách"],
      ["18:30", "Làm lễ & khai tiệc"],
      ["19:30", "Cắt bánh, nâng ly"],
      ["21:00", "Tiễn khách"],
    ].map(([time, title], i) => ({ id: `s${i}`, time, title })),
    album: ["phong-phap-kem", "han-quoc-nude", "paris-vong-xoay", "may-hong-trai-tim", "hoa-hong-phan", "lau-dai-trang"].map((n, i) => ({ url: photo(n), alt: `Ảnh cưới ${i + 1}` })),
    rsvp: { enabled: true, deadline: "", plusOnes: true, questions: [{ id: "bus", label: "Cần xe đưa đón", labelEn: "Need a shuttle", type: "yesno" }] },
    gift: {
      enabled: true,
      note: base.gift.note,
      noteEn: base.gift.noteEn,
      accounts: [
        { holder: "groom", bankCode: "970436", accountNumber: "0123456789", accountName: "NGUYEN MINH KHOI" },
        { holder: "bride", bankCode: "970407", accountNumber: "9876543210", accountName: "LE HA VY" },
      ],
    },
    sections: { ...base.sections, schedule: true },
  };
}

export function publishIssues(c: Content): string[] {
  const groom = c.couple.groom.name.trim();
  const bride = c.couple.bride.name.trim();
  if (!groom || !bride) return ["Hãy nhập tên cả chú rể và cô dâu."];
  if (groom === SAMPLE_NAMES.groom && bride === SAMPLE_NAMES.bride) {
    return ["Tên cô dâu chú rể vẫn là tên mẫu, hãy đổi thành tên của bạn."];
  }
  if (c.story.enabled && !c.story.items.some((i) => i.title.trim() && i.date.trim())) {
    return ["Phần chuyện tình yêu đang bật nhưng chưa có cột mốc nào hoàn chỉnh."];
  }
  if (c.video.enabled && (!c.video.url || !c.video.posterUrl)) {
    return ["Phần video đang bật nhưng thiếu link video hoặc ảnh bìa."];
  }
  if (c.dressCode.enabled && (!c.dressCode.title.trim() || c.dressCode.colors.length === 0 || c.dressCode.colors.some((col) => !col.label.trim()))) {
    return ["Phần trang phục đang bật nhưng thiếu tiêu đề hoặc nhãn màu gợi ý."];
  }
  if (c.sections.venue) {
    const reception = c.events.find((e) => e.kind === "reception") ?? c.events[0];
    if (!reception || !reception.venue.trim() || !reception.address.trim()) {
      return ["Phần địa điểm đang bật nhưng thiếu tên hoặc địa chỉ nơi đãi tiệc."];
    }
  }
  return [];
}

const HTTP_URL = /^https?:\/\/\S+$/i;

// The draft keeps whatever the owner is typing, but the server rejects a half-typed link (e.g. "www.goo"). The copy
// that is sent blanks those, so autosave never stalls; the link is saved as soon as it becomes a valid http(s) URL.
export function persistable(c: Content): Content {
  const video = {
    ...c.video,
    url: c.video.url === "" || HTTP_URL.test(c.video.url) ? c.video.url : "",
    posterUrl: c.video.posterUrl === "" || HTTP_URL.test(c.video.posterUrl) ? c.video.posterUrl : "",
  };
  return {
    ...c,
    video,
    events: c.events.map((e) => ({
      ...e,
      mapUrl: e.mapUrl === "" || HTTP_URL.test(e.mapUrl) ? e.mapUrl : "",
      venuePhoto: e.venuePhoto === "" || HTTP_URL.test(e.venuePhoto) ? e.venuePhoto : "",
    })),
  };
}
