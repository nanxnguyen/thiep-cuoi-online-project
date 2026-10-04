// Pure cover metadata for the 30 new invitation families (spec 2026-10-04-thirty-new-templates).
// No React here so node --test can import this module directly. Families activate
// batch by batch; NEW_FAMILIES holds exactly the active ones.

import type { SectionOrnament, SectionProfileKey } from "./section-profiles.ts";

export const NEW_FAMILIES = [
  "ink-wash", "phoenix-fold", "lotus-scroll", "porcelain-blue", "silk-knot",
  "glasshouse", "white-orchid", "pressed-garden", "venue-sketch", "midnight-bloom",
  "edge-invite", "mono-contact", "split-portrait", "pennant", "duotone-script",
  "floral-monogram", "octagon-frame", "champagne-line", "pearl-arch", "rose-cluster",
  "story-journal", "route-map", "cafe-card", "overlap-rings", "floating-card",
  "kinetic-type", "color-block", "chibi-story", "paper-cut", "constellation",
] as const;

export type NewCoverFamily = (typeof NEW_FAMILIES)[number];

export type CoverFamilyMeta = {
  /** Short label for the demo workbench family grid. */
  label: string;
  /** One-line cover description, shown on /templates/[id]. */
  layout: string;
  /** Sample photos served from public/photos (design DEF equivalent). */
  photos: readonly string[];
  /** Dark cover: palette resolves to light-on-dark like legacy A/D/F/J/L. */
  dark: boolean;
  profile: SectionProfileKey;
  ornament: SectionOrnament;
};

export const familyMeta: Record<NewCoverFamily, CoverFamilyMeta> = {
  "ink-wash": {
    label: "Mực loang",
    layout: "Vệt mực loang và núi xa mờ kiểu thủy mặc, ảnh cưới nằm trong vòng cọ, con dấu đỏ nhỏ.",
    photos: ["/photos/ao-dai-do.jpg"],
    dark: false,
    profile: "heritage",
    ornament: "heritage",
  },
  "phoenix-fold": {
    label: "Phụng vũ",
    layout: "Hai cánh phụng khép hờ mở ra ảnh cưới, tên đặt dưới nếp gấp.",
    photos: ["/photos/studio-hoa-trang.jpg"],
    dark: false,
    profile: "heritage",
    ornament: "heritage",
  },
  "lotus-scroll": {
    label: "Liên hoa",
    layout: "Cuộn giấy dọc nẹp tre, sen nét mảnh và ngày cưới cùng thứ trong tuần.",
    photos: ["/photos/khoi-hong.jpg"],
    dark: false,
    profile: "heritage",
    ornament: "heritage",
  },
  "porcelain-blue": {
    label: "Lam sứ",
    layout: "Khung men lam vẽ tay trên nền giấy sáng, ảnh oval nhỏ dưới tên.",
    photos: ["/photos/lau-dai-trang.jpg"],
    dark: false,
    profile: "heritage",
    ornament: "heritage",
  },
  "silk-knot": {
    label: "Tơ hồng",
    layout: "Một dải lụa đỏ uốn liền từ tên qua ngày đến địa điểm.",
    photos: ["/photos/hoa-hong-phan.jpg"],
    dark: false,
    profile: "heritage",
    ornament: "heritage",
  },
  "glasshouse": {
    label: "Vườn kính",
    layout: "Cửa kính hình vòm, thanh đố trắng và ảnh cưới sau lớp lá trong suốt.",
    photos: ["/photos/vuon-xanh.jpg"],
    dark: false,
    profile: "garden",
    ornament: "garden",
  },
  "white-orchid": {
    label: "Mai lan",
    layout: "Một cành lan trắng trên giấy gần trống, tên nhỏ và khoảng thở lớn.",
    photos: ["/photos/han-quoc-toi-gian.jpg"],
    dark: false,
    profile: "garden",
    ornament: "garden",
  },
  "pressed-garden": {
    label: "Vườn ép hoa",
    layout: "Hoa ép rải bất đối xứng quanh tên như tiêu bản herbarium.",
    photos: ["/photos/om-hem-nui.jpg"],
    dark: false,
    profile: "garden",
    ornament: "garden",
  },
  "venue-sketch": {
    label: "Nơi mình hẹn",
    layout: "Minh họa line-art mái vòm địa điểm làm điểm nhấn chính của bìa.",
    photos: ["/photos/cua-so-vom.jpg"],
    dark: false,
    profile: "garden",
    ornament: "garden",
  },
  "midnight-bloom": {
    label: "Dạ hoa",
    layout: "Nền đêm, hoa chạy dọc hai viền và ảnh như ô cửa sổ sáng đèn.",
    photos: ["/photos/retro-pho-cho.jpg"],
    dark: true,
    profile: "garden",
    ornament: "garden",
  },
  "edge-invite": {
    label: "Thư dọc",
    layout: "Ảnh cưới giữa hai dòng chữ khổng lồ dựng dọc mép trang, tên bên dưới.",
    photos: ["/photos/vuon-xanh.jpg"],
    dark: false,
    profile: "editorial-photo",
    ornament: "editorial",
  },
  "mono-contact": {
    label: "Phòng tối",
    layout: "Lưới ảnh đen trắng kiểu contact sheet, một khung được đánh dấu son.",
    photos: ["/photos/han-quoc-toi-gian.jpg", "/photos/vest-xanh-navy.jpg", "/photos/sofa-han-quoc.jpg"],
    dark: false,
    profile: "editorial-photo",
    ornament: "editorial",
  },
  "split-portrait": {
    label: "Song ảnh",
    layout: "Hai chân dung chia 40/60, tên chạy dọc giữa hai ảnh.",
    photos: ["/photos/vest-xanh-navy.jpg", "/photos/o-hoa.jpg"],
    dark: false,
    profile: "editorial-photo",
    ornament: "editorial",
  },
  "pennant": {
    label: "Cờ hiệu",
    layout: "Dải cờ nhỏ treo trên cùng, lá cờ đuôi nheo lớn mang ảnh tròn, tên và ngày.",
    photos: ["/photos/o-hoa.jpg"],
    dark: false,
    profile: "editorial-photo",
    ornament: "editorial",
  },
  "duotone-script": {
    label: "Sắc đôi",
    layout: "Ảnh phủ hai tông màu lệch phải, chữ viết tay cỡ lớn chồng lên mảng màu và ngày dựng dọc.",
    photos: ["/photos/retro-pho-cho.jpg"],
    dark: false,
    profile: "editorial-photo",
    ornament: "editorial",
  },
  "floral-monogram": {
    label: "Hoa chữ",
    layout: "Hai chữ cái đầu cỡ lớn ôm một cành hoa line-art mảnh mọc giữa trang.",
    photos: ["/photos/studio-hoa-trang.jpg"],
    dark: false,
    profile: "quiet-luxury",
    ornament: "luxury",
  },
  "octagon-frame": {
    label: "Bát giác",
    layout: "Ảnh cưới trong khung bát giác viền vàng kép, tia hình học tỏa ra trên nền đậm.",
    photos: ["/photos/lau-dai-trang.jpg"],
    dark: true,
    profile: "quiet-luxury",
    ornament: "luxury",
  },
  "champagne-line": {
    label: "Sâm panh",
    layout: "Một đường line vàng chạy xuyên từ tên qua ngày đến địa điểm.",
    photos: ["/photos/hy-phuc-do.jpg"],
    dark: false,
    profile: "quiet-luxury",
    ornament: "luxury",
  },
  "pearl-arch": {
    label: "Ngọc trai",
    layout: "Vòm chấm ngọc trai trên nền sáng gần đơn sắc.",
    photos: ["/photos/studio-hoa-trang.jpg"],
    dark: false,
    profile: "quiet-luxury",
    ornament: "luxury",
  },
  "rose-cluster": {
    label: "Hồng nhung",
    layout: "Chùm hoa hồng vẽ tay tràn từ đỉnh trang xuống tên, nền đỏ mận đậm.",
    photos: ["/photos/retro-do-hoa-hong.jpg"],
    dark: true,
    profile: "quiet-luxury",
    ornament: "luxury",
  },
  "story-journal": {
    label: "Nhật ký đôi mình",
    layout: "Trang nhật ký kẻ dòng với tab năm đánh dấu các cột mốc.",
    photos: ["/photos/vest-xanh-navy.jpg"],
    dark: false,
    profile: "story-led",
    ornament: "story",
  },
  "route-map": {
    label: "Chung một hành trình",
    layout: "Đường tuyến nối nơi gặp nhau, nơi cầu hôn và ngày cưới.",
    photos: ["/photos/vuon-xanh.jpg"],
    dark: false,
    profile: "story-led",
    ornament: "story",
  },
  "cafe-card": {
    label: "Quán quen",
    layout: "Thẻ menu quán quen thanh lịch, các mốc tình yêu như món ăn.",
    photos: ["/photos/retro-pho-cho.jpg"],
    dark: true,
    profile: "story-led",
    ornament: "story",
  },
  "overlap-rings": {
    label: "Giao điểm",
    layout: "Hai vòng tròn lớn giao nhau: vòng ảnh bên trên, vòng màu mang ngày cưới, tên đặt ở giao điểm.",
    photos: ["/photos/vuon-bong-bong.jpg"],
    dark: false,
    profile: "story-led",
    ornament: "story",
  },
  "floating-card": {
    label: "Thẻ nổi",
    layout: "Tấm thiệp giấy nổi lên trên nền hoạ tiết tự vẽ, ảnh cưới phía trên, tên và lời mời bên dưới.",
    photos: ["/photos/sofa-han-quoc.jpg"],
    dark: false,
    profile: "story-led",
    ornament: "story",
  },
  "kinetic-type": {
    label: "Chữ chuyển nhịp",
    layout: "Chữ cỡ lớn chuyển nhịp một lần khi mở, rồi đứng yên trang trọng.",
    photos: ["/photos/han-quoc-toi-gian.jpg"],
    dark: false,
    profile: "expressive",
    ornament: "expressive",
  },
  "color-block": {
    label: "Khối hỷ",
    layout: "Ba mảng màu bão hòa cắt giấy: đậm, vàng và giấy sáng.",
    photos: ["/photos/bieu-thu-canh-hoa.jpg"],
    dark: false,
    profile: "expressive",
    ornament: "expressive",
  },
  "chibi-story": {
    label: "Chúng mình",
    layout: "Minh họa đôi chibi vẽ riêng cùng bong bóng kể chuyện.",
    photos: ["/photos/o-hoa.jpg"],
    dark: false,
    profile: "expressive",
    ornament: "expressive",
  },
  "paper-cut": {
    label: "Cắt giấy",
    layout: "Ba lớp giấy cắt tạo chiều sâu quanh tên và ngày cưới.",
    photos: ["/photos/hoa-hong-phan.jpg"],
    dark: true,
    profile: "expressive",
    ornament: "expressive",
  },
  "constellation": {
    label: "Duyên tinh tú",
    layout: "Chòm sao gieo từ đúng ngày cưới, nối bằng line mảnh trên nền đêm.",
    photos: ["/photos/voan-hoa-kho.jpg"],
    dark: true,
    profile: "expressive",
    ornament: "expressive",
  },
};

export function isNewFamily(family: string): family is NewCoverFamily {
  return (NEW_FAMILIES as readonly string[]).includes(family);
}

export type CoverDateParts = { dm: string; year: string; day: string; month: string; weekday: string };

const WEEKDAYS = ["CHỦ NHẬT", "THỨ HAI", "THỨ BA", "THỨ TƯ", "THỨ NĂM", "THỨ SÁU", "THỨ BẢY"];

// Best-effort split of the freeform cover date ("20 · 11 · 2026"). Unparseable
// parts stay empty and covers must render fine without them — never fabricate.
export function splitCoverDate(date: string): CoverDateParts {
  const parts = date.split("·").map((s) => s.trim());
  const [day = "", month = "", year = ""] = parts;
  const d = Number(day);
  const m = Number(month);
  const y = Number(year);
  const when = new Date(y || 2026, (m || 1) - 1, d || 1);
  const valid = /^\d{1,2}$/.test(day) && /^\d{1,2}$/.test(month) && /^\d{4}$/.test(year) && !Number.isNaN(when.getTime());
  return {
    dm: parts.slice(0, 2).join("."),
    year,
    day,
    month,
    weekday: valid ? WEEKDAYS[when.getDay()] : "",
  };
}
