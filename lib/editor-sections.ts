import type { Content } from "./content.ts";

// Studio Editor v3 structure (design/Studio Editor v3.dc.html SECS/DESC/MISS): 14 parts in 4 groups, each pointing at
// the existing panel that edits it (`panel`) and the PanelSection inside it (`anchor`), plus the preview element to
// scroll to (`preview`).
// The last group keeps the owner tools the design shows elsewhere (guest list, responses).
export type PanelId = "couple" | "events" | "media" | "rsvp" | "guests" | "gift" | "template" | "responses";
export type SectionItem = {
  key: string;
  label: string;
  desc: string;
  panel: PanelId;
  anchor?: string;
  preview?: string;
};

export const SECTION_GROUPS: { label: string; items: SectionItem[] }[] = [
  {
    label: "Mở đầu",
    items: [
      { key: "envelope", label: "Phong bì", desc: "Màn hình đầu tiên khách thấy. Tên khách hiện trên phong bì theo link riêng.", panel: "couple", anchor: "Lời mời", preview: ".inv-envelope-sec" },
      { key: "template", label: "Mẫu & kiểu chữ", desc: "Đổi mẫu bất cứ lúc nào, nội dung đã nhập được giữ nguyên.", panel: "template", preview: ".inv-cover" },
    ],
  },
  {
    label: "Thông tin chính",
    items: [
      { key: "couple", label: "Cô dâu & chú rể", desc: "Tên hiển thị trên bìa, phong bì và lời cảm ơn.", panel: "couple", anchor: "Cô dâu và chú rể", preview: ".inv-couple" },
      { key: "family", label: "Gia đình hai bên", desc: "Tên bố mẹ hai bên, in trang trọng như thiệp giấy.", panel: "couple", anchor: "Gia đình hai bên", preview: ".inv-family" },
      { key: "ceremony", label: "Lễ cưới", desc: "Lễ Vu Quy, Thành Hôn hoặc Tân Hôn — ngày, giờ và nơi làm lễ.", panel: "events", preview: ".inv-ceremony" },
      { key: "party", label: "Tiệc cưới", desc: "Giờ đón khách, giờ khai tiệc và địa chỉ nhà hàng có chỉ đường.", panel: "events", preview: ".inv-party" },
      { key: "schedule", label: "Lịch trình trong ngày", desc: "Các mốc trong ngày để khách biết khi nào đến và khi nào có phần chính.", panel: "events", anchor: "Lịch trình trong ngày", preview: ".inv-schedule" },
      { key: "countdown", label: "Đếm ngược", desc: "Đồng hồ đếm ngược và nút lưu ngày cưới vào lịch điện thoại.", panel: "events", preview: ".inv-countdown" },
      { key: "venue", label: "Địa điểm chi tiết", desc: "Ảnh nơi đãi tiệc, đường đi và chỗ đỗ xe cho khách ở xa.", panel: "events", anchor: "Địa điểm chi tiết", preview: ".inv-venue" },
      { key: "dressCode", label: "Trang phục gợi ý", desc: "Mức độ trang trọng và màu sắc gợi ý để khách chọn đồ.", panel: "events", anchor: "Trang phục gợi ý", preview: ".inv-dresscode" },
    ],
  },
  {
    label: "Câu chuyện & media",
    items: [
      { key: "story", label: "Chuyện tình yêu", desc: "Vài cột mốc đáng nhớ của hai bạn, kể bằng ngày, ảnh và lời ngắn.", panel: "media", anchor: "Chuyện tình yêu", preview: ".inv-story" },
      { key: "album", label: "Album ảnh", desc: "Ảnh cưới hiển thị dạng lưới, bấm để phóng to.", panel: "media", anchor: "Album ảnh", preview: ".inv-albumsec" },
      { key: "video", label: "Video cưới", desc: "Một video ngắn phát ngay trên thiệp, kèm ảnh bìa.", panel: "media", anchor: "Video cưới", preview: ".inv-video" },
      { key: "music", label: "Nhạc nền", desc: "Chọn bản nhạc phát khi khách mở thiệp.", panel: "media", anchor: "Nhạc nền" },
    ],
  },
  {
    label: "Tương tác với khách",
    items: [
      { key: "rsvp", label: "Xác nhận tham dự", desc: "Khách xác nhận ngay trên thiệp. Thêm câu hỏi để chuẩn bị chu đáo.", panel: "rsvp", anchor: "Xác nhận tham dự", preview: ".inv-rsvp" },
      { key: "guestbook", label: "Sổ lưu bút", desc: "Khách để lại lời chúc trực tiếp trên thiệp.", panel: "rsvp", anchor: "Sổ lưu bút", preview: ".inv-wishsec" },
      { key: "gift", label: "Hộp mừng cưới", desc: "Số tài khoản hai bên, mã QR được tạo tự động.", panel: "gift", preview: ".inv-gift" },
      { key: "thanks", label: "Lời cảm ơn", desc: "Lời nhắn cuối thiệp gửi tới khách mời.", panel: "couple", anchor: "Lời cảm ơn", preview: ".inv-thanks" },
    ],
  },
  {
    label: "Quản lý",
    items: [
      { key: "guests", label: "Khách mời", desc: "Danh sách khách và link riêng cho từng người.", panel: "guests" },
      { key: "responses", label: "Phản hồi", desc: "Xác nhận tham dự và lời chúc khách đã gửi.", panel: "responses" },
    ],
  },
];

export const SECTIONS: SectionItem[] = SECTION_GROUPS.flatMap((g) => g.items);

const has = (s: string) => s.trim() !== "";

/** Parts with an on/off switch in the outline (design SECS third column). */
export const OPTIONAL = new Set(["envelope", "schedule", "countdown", "venue", "dressCode", "story", "album", "video", "music", "rsvp", "guestbook", "gift", "thanks"]);
type SectionFlag = "envelope" | "schedule" | "countdown" | "venue" | "album" | "video" | "music" | "thanks";

export function isOn(key: string, c: Content): boolean {
  if (key === "rsvp") return c.rsvp.enabled;
  if (key === "guestbook") return c.guestbook.enabled;
  if (key === "gift") return c.gift.enabled;
  if (key === "story") return c.story.enabled;
  if (key === "video") return c.video.enabled;
  if (key === "dressCode") return c.dressCode.enabled;
  return OPTIONAL.has(key) ? c.sections[key as SectionFlag] : true;
}

export function toggleOn(key: string, c: Content): Content {
  if (key === "rsvp") return { ...c, rsvp: { ...c.rsvp, enabled: !c.rsvp.enabled } };
  if (key === "guestbook") return { ...c, guestbook: { ...c.guestbook, enabled: !c.guestbook.enabled } };
  if (key === "gift") return { ...c, gift: { ...c.gift, enabled: !c.gift.enabled } };
  // The section objects own the on/off state; sections.* mirrors them so render
  // and outline read one canonical toggle (see normalizeContent in lib/content.ts).
  if (key === "story") {
    const enabled = !c.story.enabled;
    return { ...c, story: { ...c.story, enabled }, sections: { ...c.sections, story: enabled } };
  }
  if (key === "video") {
    const enabled = !c.video.enabled;
    return { ...c, video: { ...c.video, enabled }, sections: { ...c.sections, video: enabled } };
  }
  if (key === "dressCode") {
    const enabled = !c.dressCode.enabled;
    return { ...c, dressCode: { ...c.dressCode, enabled }, sections: { ...c.sections, dressCode: enabled } };
  }
  if (!OPTIONAL.has(key)) return c;
  const k = key as SectionFlag;
  return { ...c, sections: { ...c.sections, [k]: !c.sections[k] } };
}

// Returns why a part is incomplete, or null when it is done / switched off / has no rule (design MISS).
export function missingReason(key: string, c: Content): string | null {
  if (!isOn(key, c)) return null;
  switch (key) {
    case "envelope":
      return has(c.envelope.greeting) ? null : "Chưa có lời mời";
    case "couple":
      return has(c.couple.groom.name) && has(c.couple.bride.name) ? null : "Thiếu tên cô dâu hoặc chú rể";
    case "family": {
      const { groomSide: g, brideSide: b } = c.family;
      return has(g.father) && has(g.mother) && has(b.father) && has(b.mother) ? null : "Thiếu tên bố mẹ";
    }
    case "ceremony":
      return c.events.some((e) => e.kind === "ceremony" && has(e.date) && has(e.venue)) ? null : "Thiếu ngày hoặc nơi làm lễ";
    case "party":
      return c.events.some((e) => e.kind === "reception" && has(e.venue) && has(e.address)) ? null : "Thiếu nhà hàng hoặc địa chỉ";
    case "schedule":
      return c.schedule.length > 0 ? null : "Chưa có mốc thời gian";
    case "venue": {
      const reception = c.events.find((e) => e.kind === "reception") ?? c.events[0];
      return reception && has(reception.venue) && has(reception.address) ? null : "Thiếu nơi đãi tiệc hoặc địa chỉ";
    }
    case "dressCode":
      return has(c.dressCode.title) && c.dressCode.colors.length > 0 && c.dressCode.colors.every((col) => has(col.label))
        ? null
        : "Chưa có tiêu đề hoặc màu gợi ý";
    case "story":
      return c.story.items.some((i) => has(i.title) && has(i.date)) ? null : "Chưa có cột mốc nào trong chuyện tình yêu";
    case "video":
      return has(c.video.url) && has(c.video.posterUrl) ? null : "Chưa có link video hoặc ảnh bìa";
    case "rsvp":
      return has(c.rsvp.deadline) ? null : "Chưa đặt hạn phản hồi";
    case "gift":
      return (["groom", "bride"] as const).every((h) => c.gift.accounts.some((a) => a.holder === h && has(a.accountNumber))) ? null : "Chưa đủ số tài khoản hai bên";
    case "thanks":
      return has(c.thanks.message) ? null : "Chưa có lời cảm ơn";
    default:
      return null;
  }
}

const PARTS = SECTION_GROUPS.slice(0, 4).flatMap((g) => g.items.map((i) => i.key));

/** The design's ring: parts switched on, and how many of them are complete. */
export function progress(c: Content): { done: number; total: number; pct: number } {
  const enabled = PARTS.filter((k) => isOn(k, c));
  const done = enabled.filter((k) => missingReason(k, c) === null).length;
  return { done, total: enabled.length, pct: enabled.length ? Math.round((done / enabled.length) * 100) : 100 };
}

export function completion(c: Content): number {
  return progress(c).pct;
}
