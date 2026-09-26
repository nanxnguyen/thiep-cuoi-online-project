export const archetypes = ["editorial", "minimal", "classic", "botanical", "traditional", "korean"] as const;
export type Archetype = (typeof archetypes)[number];
export type FontKey = "playfair" | "fraunces" | "cormorant" | "newsreader" | "notoDisplay" | "jakarta" | "allura";
export type Palette = { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string };
export type ColorKey = "do" | "dodam" | "nau" | "lam" | "tim" | "xanh" | "hong" | "vang" | "oliu" | "cam" | "muc";
export type CoverFamily = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J";
export type Template = {
  id: string; name: string; family: CoverFamily; archetype: Archetype; blurb: string;
  colors: readonly ColorKey[]; palette: Palette;
  fonts: { display: FontKey; body: FontKey; script?: FontKey };
};

// Color tokens transcribed from design/Mau Thiep v2.dc.html.
export const colors: Record<ColorKey, { label: string; deep: string; paper: string; gold: string }> = {
  do: { label: "Đỏ", deep: "#8e1b1f", paper: "#f7efe3", gold: "#e0bb74" },
  dodam: { label: "Đỏ đậm", deep: "#5a1119", paper: "#f5ece2", gold: "#d4ac6a" },
  nau: { label: "Nâu", deep: "#6b4a33", paper: "#f3ece2", gold: "#b88a55" },
  lam: { label: "Lam", deep: "#1f3a5f", paper: "#eef1f4", gold: "#c9ab72" },
  tim: { label: "Tím", deep: "#4b3566", paper: "#f2eff5", gold: "#c7a878" },
  xanh: { label: "Xanh rêu", deep: "#24493a", paper: "#eef1ea", gold: "#c9a86a" },
  hong: { label: "Hồng", deep: "#a4505f", paper: "#fbf1ef", gold: "#d8a977" },
  vang: { label: "Vàng kim", deep: "#7a5a22", paper: "#f7f0e0", gold: "#e3c27e" },
  oliu: { label: "Ô liu", deep: "#5a6636", paper: "#f2f1e6", gold: "#c8b07a" },
  cam: { label: "Cam đất", deep: "#a4552a", paper: "#f8efe6", gold: "#e0b27a" },
  muc: { label: "Mực", deep: "#1a1412", paper: "#f4f1ec", gold: "#c9a86a" },
};

type Entry = [string, string, CoverFamily, Archetype, string, ColorKey[], string?];
const catalog: Entry[] = [
  ["song-hy", "Song Hỷ", "A", "traditional", "Chữ Hỷ · truyền thống", ["do", "xanh"], "lua-son"],
  ["net-muc", "Nét Mực", "B", "minimal", "Chữ lớn · tối giản", ["dodam", "nau", "lam", "tim"], "soft-type"],
  ["hoa-nhai", "Hoa Nhài", "C", "botanical", "Vòm hoa · dịu dàng", ["xanh", "hong", "nau"], "wild-garden"],
  ["hoang-gia", "Hoàng Gia", "D", "classic", "Khung vàng · trang nhã", ["vang", "dodam", "lam"], "maison-blanc"],
  ["phong-thu", "Phong Thư", "E", "editorial", "Phong bì · lãng mạn", ["do", "oliu"], "afterglow"],
  ["bia-bao", "Bìa Báo", "F", "editorial", "Tạp chí · hiện đại", ["muc", "hong"], "gallery-noir"],
  ["hy-su", "Hỷ Sự", "A", "traditional", "Chữ Hỷ · lễ thành hôn", ["dodam", "lam"]],
  ["giay-do", "Giấy Dó", "B", "minimal", "Giấy kem · thanh thoát", ["nau", "xanh"]],
  ["vuon-uom", "Vườn Ươm", "C", "botanical", "Sân vườn · nên thơ", ["oliu", "cam"]],
  ["nhung-lam", "Nhung Lam", "D", "classic", "Nhung lam · cổ điển", ["lam", "do"]],
  ["thu-tinh", "Thư Tình", "E", "editorial", "Sáp niêm · lãng mạn", ["hong", "dodam"]],
  ["chan-dung", "Chân Dung", "F", "editorial", "Ảnh lớn · đương đại", ["muc", "xanh"]],
  ["song-phung", "Song Phụng", "I", "traditional", "Chữ Hỷ lớn · trang trọng", ["do", "dodam", "lam"], "thuy-mac"],
  ["bao-hy", "Báo Hỷ", "H", "traditional", "Thông tin lễ · truyền thống", ["do", "lam"], "so-xuan"],
  ["doi-khung", "Đôi Khung", "G", "korean", "Ảnh đôi · lãng mạn", ["xanh", "hong", "nau"], "olive-story"],
  ["song-cua", "Song Cửa", "J", "traditional", "Khung vòm · trang trọng", ["dodam", "do", "xanh"], "thanh-ngoc"],
];

// One-line description of each cover layout, from design/Mau Thiep Chi Tiet.dc.html (shown on /templates/[id]).
export const familyLayout: Record<CoverFamily, string> = {
  A: "Dải màu cong ôm chữ Hỷ lớn, ảnh cưới hình vòm phía dưới.",
  B: "Chỉ có chữ, không ảnh. Con số ngày cưới làm điểm nhấn duy nhất.",
  C: "Ảnh tròn dưới vòm cổng chạm khắc, gợi không khí sân vườn.",
  D: "Khung ảnh cong viền vàng, chữ viết tay kiểu Pháp cổ.",
  E: "Ảnh dán trong phong thư nghiêng, gợi cảm giác một lá thư tay.",
  F: "Nền chữ lớn kiểu bìa tạp chí, ảnh cưới nằm giữa như một trang biên tập.",
  G: "Hai khung ảnh polaroid so le cho cô dâu và chú rể.",
  H: "Bố cục hai ảnh tròn và bảng thông tin lễ cưới đầy đủ hai họ.",
  I: "Nhánh hoa vẽ tay mảnh, tên hai bên theo chiều dọc.",
  J: "Khung vòm viền vàng ôm ảnh cưới, nền đậm sang trọng.",
};

export const DEFAULT_TEMPLATE_ID = "song-hy";
const legacy = new Map(catalog.filter((entry) => entry[6]).map((entry) => [entry[6], entry[0]]));

export function getPalette(template: Pick<Template, "family" | "colors">, key = ""): Palette {
  const selected = colors[template.colors.includes(key as ColorKey) ? key as ColorKey : template.colors[0]];
  const dark = ["A", "D", "F", "J"].includes(template.family);
  return dark
    ? { bg: selected.deep, surface: selected.deep, ink: selected.paper, muted: selected.paper, accent: selected.paper, accentInk: selected.deep }
    : { bg: selected.paper, surface: selected.paper, ink: selected.deep, muted: selected.deep, accent: selected.deep, accentInk: selected.paper };
}

export const templates: readonly Template[] = catalog.map(([id, name, family, archetype, blurb, paletteKeys]) => {
  const t = { id, name, family, archetype, blurb, colors: paletteKeys, fonts: { display: "playfair" as const, body: "jakarta" as const } };
  return { ...t, palette: getPalette(t) };
});

export const getTemplate = (id: string): Template | undefined => templates.find((t) => t.id === (legacy.get(id) ?? id));

export const FONT_VARS: Record<FontKey, string> = {
  playfair: "var(--font-playfair)", fraunces: "var(--font-fraunces)", cormorant: "var(--font-cormorant)",
  newsreader: "var(--font-newsreader)", notoDisplay: "var(--font-noto-display)", jakarta: "var(--font-jakarta)", allura: "var(--font-allura)",
};
