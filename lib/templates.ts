export const archetypes = ["editorial", "minimal", "classic", "botanical", "traditional", "korean"] as const;
export type Archetype = (typeof archetypes)[number];
export type FontKey = "playfair" | "fraunces" | "cormorant" | "newsreader" | "notoDisplay" | "jakarta" | "allura";
export type Palette = { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string };
export type Template = {
  id: string;
  name: string;
  archetype: Archetype;
  blurb: string;
  palette: Palette;
  fonts: { display: FontKey; body: FontKey; script?: FontKey };
};

export const DEFAULT_TEMPLATE_ID = "gallery-noir";

// A template is data: shared section components read the palette/fonts, and the archetype picks
// the cover, ornaments and rhythm. Palettes are tuned so every text pair passes WCAG AA
// (tests/templates.test.ts). Adding a template = adding one entry here.
export const templates: readonly Template[] = [
  {
    id: "gallery-noir",
    name: "Gallery Noir",
    archetype: "editorial",
    blurb: "Chữ lớn, nền tối, nhịp điệu như một trang tạp chí.",
    palette: { bg: "#152527", surface: "#1e3335", ink: "#f5eee2", muted: "#a9b5b0", accent: "#e08a7a", accentInk: "#152527" },
    fonts: { display: "playfair", body: "jakarta" },
  },
  {
    id: "afterglow",
    name: "Afterglow",
    archetype: "editorial",
    blurb: "Sắc hoàng hôn ấm, dành cho lễ cưới chiều muộn.",
    palette: { bg: "#fbeee6", surface: "#fff8f3", ink: "#3b1f2b", muted: "#7a5a63", accent: "#b5432c", accentInk: "#fff8f3" },
    fonts: { display: "fraunces", body: "jakarta" },
  },
  {
    id: "soft-type",
    name: "Soft Type",
    archetype: "minimal",
    blurb: "Gần như chỉ có chữ. Thanh, thoáng, không thừa.",
    palette: { bg: "#ece8f0", surface: "#f7f5fa", ink: "#26202e", muted: "#5d5568", accent: "#6b3f86", accentInk: "#f7f5fa" },
    fonts: { display: "jakarta", body: "jakarta" },
  },
  {
    id: "maison-blanc",
    name: "Maison Blanc",
    archetype: "classic",
    blurb: "Khung viền đôi, chữ nghiêng cổ điển, đối xứng trang nhã.",
    palette: { bg: "#fbfaf7", surface: "#ffffff", ink: "#1f2a3a", muted: "#5f6878", accent: "#8a6a35", accentInk: "#ffffff" },
    fonts: { display: "cormorant", body: "jakarta" },
  },
  {
    id: "wild-garden",
    name: "Wild Garden",
    archetype: "botanical",
    blurb: "Khung vòm, cành lá vẽ tay, xanh dịu như vườn sớm.",
    palette: { bg: "#e6ecdf", surface: "#f3f6ee", ink: "#26382b", muted: "#566656", accent: "#456e50", accentInk: "#f3f6ee" },
    fonts: { display: "playfair", body: "jakarta", script: "allura" },
  },
  {
    id: "olive-story",
    name: "Olive Story",
    archetype: "botanical",
    blurb: "Tông ô liu và giấy da, ấm và chậm.",
    palette: { bg: "#f1ecdd", surface: "#faf6ea", ink: "#3a3a1f", muted: "#666648", accent: "#6b6a25", accentInk: "#faf6ea" },
    fonts: { display: "newsreader", body: "jakarta", script: "allura" },
  },
  {
    id: "lua-son",
    name: "Lụa Son",
    archetype: "traditional",
    blurb: "Đỏ son và vàng ánh, hoa văn sen, đậm chất lễ thành hôn.",
    palette: { bg: "#7d1417", surface: "#93191c", ink: "#f7e9c8", muted: "#e0c7a0", accent: "#e2b857", accentInk: "#5b0d10" },
    fonts: { display: "notoDisplay", body: "jakarta" },
  },
  {
    id: "thanh-ngoc",
    name: "Thanh Ngọc",
    archetype: "traditional",
    blurb: "Xanh ngọc thẫm và vàng ánh, lưới cửa sổ tròn, điềm tĩnh mà sang.",
    palette: { bg: "#0e3a33", surface: "#134a41", ink: "#f4ecd6", muted: "#bcd0c2", accent: "#dcb765", accentInk: "#0b2f29" },
    fonts: { display: "cormorant", body: "jakarta" },
  },
  {
    id: "thuy-mac",
    name: "Thủy Mặc",
    archetype: "traditional",
    blurb: "Giấy dó ngà, nét mực và núi mờ sương, chỉ một con dấu son.",
    palette: { bg: "#f3eee2", surface: "#fbf8f0", ink: "#1c1b1a", muted: "#5b574f", accent: "#b0281f", accentInk: "#fbf8f0" },
    fonts: { display: "notoDisplay", body: "jakarta" },
  },
  {
    id: "so-xuan",
    name: "Sơ Xuân",
    archetype: "korean",
    blurb: "Giấy hanji kem, hồng phấn và xanh xô thơm, khung ảnh phim nhẹ như buổi sớm đầu xuân.",
    palette: { bg: "#f6efe4", surface: "#fffaf2", ink: "#3b2f2c", muted: "#6b5d57", accent: "#9c4f5a", accentInk: "#fffaf2" },
    fonts: { display: "cormorant", body: "jakarta", script: "allura" },
  },
];

export const getTemplate = (id: string): Template | undefined => templates.find((t) => t.id === id);

export const FONT_VARS: Record<FontKey, string> = {
  playfair: "var(--font-playfair)",
  fraunces: "var(--font-fraunces)",
  cormorant: "var(--font-cormorant)",
  newsreader: "var(--font-newsreader)",
  notoDisplay: "var(--font-noto-display)",
  jakarta: "var(--font-jakarta)",
  allura: "var(--font-allura)",
};
