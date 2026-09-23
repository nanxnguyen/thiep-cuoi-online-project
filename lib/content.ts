import { z } from "zod";

export const MAX_EVENTS = 6;
export const MAX_ALBUM = 24;
export const MAX_QUESTIONS = 3;
export const MAX_ACCOUNTS = 2;
export const EVENT_KINDS = ["engagement", "ceremony", "reception", "custom"] as const;

// Mirrors the backend record `InvitationContent` field for field (spec 6.2).
// Drafts are autosaved while typing, so every "empty" value is "" and stays valid.
const text = (max: number) => z.string().max(max);
const httpUrl = z.string().max(500).refine((v) => /^https?:\/\/\S+$/i.test(v), "URL không hợp lệ");
const optionalUrl = z.union([z.literal(""), httpUrl]);
const dateStr = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/);
const timeStr = z.string().regex(/^(\d{2}:\d{2})?$/);
const id = z.string().min(1).max(40);

const side = z.object({ father: text(60), mother: text(60), address: text(200) });

export const eventSchema = z.object({
  id,
  kind: z.enum(EVENT_KINDS),
  title: text(80),
  date: dateStr,
  time: timeStr,
  lunar: text(60),
  venue: text(120),
  address: text(200),
  mapUrl: optionalUrl,
});

export const contentSchema = z.object({
  v: z.literal(1),
  couple: z.object({
    groom: z.object({ name: text(60) }),
    bride: z.object({ name: text(60) }),
    message: text(500),
    // Bản tiếng Anh tuỳ chọn của "message" (Phase 5, đa ngôn ngữ) — "" khi chủ thiệp chưa gõ, trang khách
    // fallback về "message". Không dịch tên/địa chỉ/ngày — xem docs/superpowers/specs/2026-09-23-i18n-phase5-design.md.
    messageEn: text(500),
    heroPhoto: optionalUrl,
  }),
  family: z.object({ groomSide: side, brideSide: side }),
  events: z.array(eventSchema).max(MAX_EVENTS),
  album: z.array(z.object({ url: httpUrl, alt: text(120) })).max(MAX_ALBUM),
  music: z.object({ url: httpUrl, title: text(80) }).nullable(),
  rsvp: z.object({
    enabled: z.boolean(),
    deadline: dateStr,
    questions: z
      .array(z.object({ id, label: text(120), labelEn: text(120), type: z.enum(["text", "yesno"]) }))
      .max(MAX_QUESTIONS),
  }),
  guestbook: z.object({ enabled: z.boolean() }),
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
});

export type Content = z.infer<typeof contentSchema>;
export type EventItem = Content["events"][number];

export const SAMPLE_NAMES = { groom: "Minh", bride: "An" } as const;

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const daysFrom = (now: Date, n: number) => new Date(now.getTime() + n * 86_400_000);

export function defaultContent(now: Date = new Date()): Content {
  const day = isoDate(daysFrom(now, 75));
  return {
    v: 1,
    couple: {
      groom: { name: SAMPLE_NAMES.groom },
      bride: { name: SAMPLE_NAMES.bride },
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
      { id: "ceremony", kind: "ceremony", title: "Lễ thành hôn", date: day, time: "10:00", lunar: "", venue: "Tư gia nhà trai", address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", mapUrl: "" },
      { id: "reception", kind: "reception", title: "Tiệc cưới", date: day, time: "18:00", lunar: "", venue: "Nhà hàng Hoa Sen", address: "45 Lê Lợi, Quận 1, TP. Hồ Chí Minh", mapUrl: "" },
    ],
    album: [],
    music: null,
    rsvp: { enabled: true, deadline: "", questions: [] },
    guestbook: { enabled: true },
    gift: { enabled: false, note: "Sự hiện diện của bạn là niềm vui lớn nhất của chúng mình.", noteEn: "", accounts: [] },
    thanks: { message: "Cảm ơn bạn đã dành thời gian và tình cảm cho chúng mình.", messageEn: "" },
  };
}

// Preview data for /templates/[id]. Album paths are root-relative, so this is intentionally
// not schema-valid: it is only ever rendered, never sent to the API.
export function sampleContent(now: Date = new Date()): Content {
  const base = defaultContent(now);
  return {
    ...base,
    couple: { ...base.couple, heroPhoto: "/sample/photo-1.svg" },
    album: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `/sample/photo-${n}.svg`, alt: `Ảnh cưới ${n}` })),
    rsvp: { enabled: true, deadline: "", questions: [{ id: "q1", label: "Bạn có cần chỗ đậu xe không?", labelEn: "Do you need parking?", type: "yesno" }] },
    gift: {
      enabled: true,
      note: base.gift.note,
      noteEn: base.gift.noteEn,
      accounts: [
        { holder: "groom", bankCode: "970436", accountNumber: "0123456789", accountName: "NGUYEN VAN MINH" },
        { holder: "bride", bankCode: "970407", accountNumber: "9876543210", accountName: "LE THI AN" },
      ],
    },
  };
}

export function publishIssues(c: Content): string[] {
  const groom = c.couple.groom.name.trim();
  const bride = c.couple.bride.name.trim();
  if (!groom || !bride) return ["Hãy nhập tên cả chú rể và cô dâu."];
  if (groom === SAMPLE_NAMES.groom && bride === SAMPLE_NAMES.bride) {
    return ["Tên cô dâu chú rể vẫn là tên mẫu, hãy đổi thành tên của bạn."];
  }
  return [];
}

const HTTP_URL = /^https?:\/\/\S+$/i;

// The draft keeps whatever the owner is typing, but the server rejects a half-typed link (e.g. "www.goo"). The copy
// that is sent blanks those, so autosave never stalls; the link is saved as soon as it becomes a valid http(s) URL.
export function persistable(c: Content): Content {
  return { ...c, events: c.events.map((e) => (e.mapUrl === "" || HTTP_URL.test(e.mapUrl) ? e : { ...e, mapUrl: "" })) };
}
