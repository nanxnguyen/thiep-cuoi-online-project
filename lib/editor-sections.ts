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
  blocked?: string;
};

export const SECTION_GROUPS: { label: string; items: SectionItem[] }[] = [
  {
    label: "Mở đầu",
    items: [
      { key: "envelope", label: "Phong bì", desc: "Màn hình đầu tiên khách thấy. Tên khách hiện trên phong bì theo link riêng.", panel: "couple", anchor: "Lời mời", preview: ".inv-cover" },
      { key: "template", label: "Mẫu & kiểu chữ", desc: "Đổi mẫu bất cứ lúc nào, nội dung đã nhập được giữ nguyên.", panel: "template", preview: ".inv-cover" },
    ],
  },
  {
    label: "Thông tin chính",
    items: [
      { key: "couple", label: "Cô dâu & chú rể", desc: "Tên hiển thị trên bìa, phong bì và lời cảm ơn.", panel: "couple", anchor: "Cô dâu và chú rể", preview: ".inv-couple" },
      { key: "family", label: "Gia đình hai bên", desc: "Tên bố mẹ hai bên, in trang trọng như thiệp giấy.", panel: "couple", anchor: "Gia đình hai bên", preview: ".inv-family" },
      { key: "ceremony", label: "Lễ cưới", desc: "Lễ Vu Quy, Thành Hôn hoặc Tân Hôn — ngày, giờ và nơi làm lễ.", panel: "events", preview: ".inv-events" },
      { key: "party", label: "Tiệc cưới", desc: "Giờ đón khách, giờ khai tiệc và địa chỉ nhà hàng có chỉ đường.", panel: "events", preview: ".inv-events" },
      { key: "schedule", label: "Lịch trình trong ngày", desc: "Các mốc trong ngày để khách biết khi nào đến và khi nào có phần chính.", panel: "events", anchor: "Lịch trình trong ngày", preview: ".inv-schedule" },
      { key: "countdown", label: "Đếm ngược", desc: "Đồng hồ đếm ngược và nút lưu ngày cưới vào lịch điện thoại.", panel: "events", preview: ".inv-countdown" },
    ],
  },
  {
    label: "Ảnh & âm nhạc",
    items: [
      { key: "album", label: "Album ảnh", desc: "Ảnh cưới hiển thị dạng lưới, bấm để phóng to.", panel: "media", anchor: "Album ảnh", preview: ".inv-albumsec" },
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

// Returns why a part is incomplete, or null when it is done / optional-and-off / has no rule.
export function missingReason(key: string, c: Content): string | null {
  switch (key) {
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
    case "rsvp":
      return !c.rsvp.enabled || has(c.rsvp.deadline) ? null : "Chưa đặt hạn phản hồi";
    case "gift":
      return !c.gift.enabled || (c.gift.accounts.length > 0 && c.gift.accounts.every((a) => has(a.accountNumber))) ? null : "Chưa đủ số tài khoản";
    case "thanks":
      return has(c.thanks.message) ? null : "Chưa có lời cảm ơn";
    default:
      return null;
  }
}

const RULED = ["couple", "family", "ceremony", "party", "rsvp", "gift", "thanks"];

/** Percentage of ruled parts that are complete (design's % ring). */
export function completion(c: Content): number {
  const done = RULED.filter((k) => missingReason(k, c) === null).length;
  return Math.round((done / RULED.length) * 100);
}
