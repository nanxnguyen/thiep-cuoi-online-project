export const archetypes = ["editorial", "minimal", "classic", "botanical", "traditional", "korean"] as const;
export type Archetype = (typeof archetypes)[number];
export type Palette = { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string };
export type ColorKey = "do" | "dodam" | "nau" | "lam" | "tim" | "xanh" | "hong" | "vang" | "oliu" | "cam" | "muc";
export type CoverFamily = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O";
export type Template = {
  id: string; name: string; family: CoverFamily; archetype: Archetype; blurb: string;
  colors: readonly ColorKey[]; palette: Palette;
  /** Mô tả riêng từng mẫu cho SEO (meta description + trang chi tiết), không trùng nhau. */
  seo: string;
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

type Entry = [string, string, CoverFamily, Archetype, string, ColorKey[], string?, string?];
const catalog: Entry[] = [
  ["song-hy", "Song Hỷ", "A", "traditional", "Chữ Hỷ · truyền thống", ["do", "xanh"], "lua-son", "Mẫu thiệp cưới online Song Hỷ với chữ Hỷ đỏ truyền thống, ảnh vòm và đếm ngược. Tạo thiệp miễn phí, gửi link cho khách qua Zalo."],
  ["net-muc", "Nét Mực", "B", "minimal", "Chữ lớn · tối giản", ["dodam", "nau", "lam", "tim"], "soft-type", "Mẫu thiệp cưới tối giản Nét Mực: chữ lớn làm điểm nhấn, không ảnh, hợp cặp đôi thích phong cách hiện đại. Tạo online miễn phí."],
  ["hoa-nhai", "Hoa Nhài", "C", "botanical", "Vòm hoa · dịu dàng", ["xanh", "hong", "nau"], "wild-garden", "Mẫu thiệp cưới Hoa Nhài dịu dàng với vòm hoa và ảnh tròn, tông xanh hồng. Tạo thiệp cưới online miễn phí gửi khách."],
  ["hoang-gia", "Hoàng Gia", "D", "classic", "Khung vàng · trang nhã", ["vang", "dodam", "lam"], "maison-blanc", "Mẫu thiệp cưới Hoàng Gia sang trọng: khung vàng, chữ viết tay cổ điển. Tạo thiệp cưới online miễn phí cho lễ cưới trang trọng."],
  ["phong-thu", "Phong Thư", "E", "editorial", "Phong bì · lãng mạn", ["do", "oliu"], "afterglow", "Mẫu thiệp cưới Phong Thư lãng mạn như lá thư tay: ảnh nghiêng trong phong bì. Tạo thiệp online miễn phí, gửi qua Zalo."],
  ["bia-bao", "Bìa Báo", "F", "editorial", "Tạp chí · hiện đại", ["muc", "hong"], "gallery-noir", "Mẫu thiệp cưới Bìa Báo hiện đại phong cách tạp chí, chữ lớn nổi bật. Tạo thiệp cưới online miễn phí, cá tính."],
  ["hy-su", "Hỷ Sự", "A", "traditional", "Chữ Hỷ · lễ thành hôn", ["dodam", "lam"], undefined, "Mẫu thiệp cưới Hỷ Sự với chữ Hỷ cho lễ thành hôn truyền thống. Tạo thiệp online miễn phí, có xác nhận tham dự."],
  ["vuon-uom", "Vườn Ươm", "C", "botanical", "Sân vườn · nên thơ", ["oliu", "cam"], undefined, "Mẫu thiệp cưới Vườn Ươm nên thơ cho tiệc sân vườn: vòm cổng hoa, tông ô liu cam. Tạo thiệp online miễn phí."],
  ["nhung-lam", "Nhung Lam", "D", "classic", "Nhung lam · cổ điển", ["lam", "do"], undefined, "Mẫu thiệp cưới Nhung Lam cổ điển tông lam, khung cong viền vàng. Tạo thiệp cưới online miễn phí, trang nhã."],
  ["thu-tinh", "Thư Tình", "E", "editorial", "Sáp niêm · lãng mạn", ["hong", "dodam"], undefined, "Mẫu thiệp cưới Thư Tình với con dấu sáp niêm lãng mạn như thư tay xưa. Tạo thiệp online miễn phí gửi người thương."],
  ["chan-dung", "Chân Dung", "F", "editorial", "Ảnh lớn · đương đại", ["muc", "xanh"], undefined, "Mẫu thiệp cưới Chân Dung hiện đại với ảnh lớn đương đại. Tạo thiệp cưới online miễn phí, khoe ảnh cưới đẹp."],
  ["song-phung", "Song Phụng", "I", "traditional", "Chữ Hỷ lớn · trang trọng", ["do", "dodam", "lam"], "thuy-mac", "Mẫu thiệp cưới Song Phụng trang trọng với chữ Hỷ lớn. Tạo thiệp online miễn phí cho đại lễ gia đình."],
  ["bao-hy", "Báo Hỷ", "H", "traditional", "Thông tin lễ · truyền thống", ["do", "lam"], "so-xuan", "Mẫu thiệp cưới Báo Hỷ đầy đủ thông tin lễ hai họ. Tạo thiệp online miễn phí, rõ ràng cho khách lớn tuổi."],
  ["doi-khung", "Đôi Khung", "G", "korean", "Ảnh đôi · lãng mạn", ["xanh", "hong", "nau"], "olive-story", "Mẫu thiệp cưới Đôi Khung phong cách Hàn với hai khung ảnh polaroid. Tạo thiệp online miễn phí, trẻ trung."],
  ["song-cua", "Song Cửa", "J", "traditional", "Khung vòm · trang trọng", ["dodam", "do", "xanh"], "thanh-ngoc", "Mẫu thiệp cưới Song Cửa trang trọng với khung vòm viền vàng trên nền đậm. Tạo thiệp cưới online miễn phí."],
  ["tem-thu", "Tem Thư", "K", "editorial", "Tem & dấu bưu điện · lãng mạn", ["do", "lam", "xanh"], undefined, "Mẫu thiệp cưới Tem Thư lãng mạn kiểu bưu thiếp: tem răng cưa, dấu bưu điện. Tạo thiệp online miễn phí."],
  ["ve-hanh-phuc", "Vé Hạnh Phúc", "L", "editorial", "Vé tàu · hiện đại", ["lam", "dodam", "xanh"], undefined, "Mẫu thiệp cưới Vé Hạnh Phúc độc lạ như vé tàu: ga đi chú rể, ga đến cô dâu. Tạo thiệp online miễn phí."],
  ["dia-than", "Đĩa Than", "M", "editorial", "Vinyl · hiện đại", ["muc", "dodam", "cam"], undefined, "Mẫu thiệp cưới Đĩa Than hiện đại cho cặp đôi mê nhạc: đĩa vinyl, tracklist lịch trình. Tạo online miễn phí."],
  ["cuon-phim", "Cuộn Phim", "N", "editorial", "Phim nhựa · hiện đại", ["muc", "nau", "hong"], undefined, "Mẫu thiệp cưới Cuộn Phim cho cặp đôi thích điện ảnh: dải phim, dấu ngày kiểu máy film. Tạo online miễn phí."],
  ["lich-bloc", "Lịch Bloc", "O", "traditional", "Lịch xé · truyền thống", ["do", "xanh", "lam"], undefined, "Mẫu thiệp cưới Lịch Bloc truyền thống như tờ lịch xé ngày lành tháng tốt. Tạo thiệp online miễn phí."],
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
  K: "Con tem răng cưa và dấu bưu điện ghi ngày cưới, viền thư máy bay.",
  L: "Vé tàu một chiều: ga đi chú rể, ga đến cô dâu, toa ghế, mã vạch và cuống vé.",
  M: "Đĩa vinyl và bìa Side A, nhãn đĩa là ảnh cưới, tracklist là lịch trình.",
  N: "Dải phim ba khung có lỗ răng, dấu ngày màu cam kiểu máy film.",
  O: "Tờ lịch xé: số ngày lớn, thứ, dòng Ngày lành tháng tốt.",
};

// Default sample photos per cover family (design/Thiep Preview.dc.html DEF, README §4.8), served from public/photos.
const ph = (...names: string[]) => names.map((n) => `/photos/${n}.jpg`);
export const familyPhotos: Record<CoverFamily, string[]> = {
  A: ph("hy-phuc-do"), B: ph("han-quoc-toi-gian"), C: ph("om-hem-nui"), D: ph("lau-dai-trang"), E: ph("retro-pho-cho"),
  F: ph("vuon-xanh"), G: ph("o-hoa", "vest-xanh-navy"), H: ph("retro-do-hoa-hong", "ao-dai-do"), I: ph("studio-hoa-trang"),
  J: ph("ao-dai-do"), K: ph("nang-chieu"), L: ph("cua-so-vom"), M: ph("khoi-hong"), N: ph("voan-hoa-kho", "vuon-bong-bong", "nang-chieu"),
  O: ph("han-phuc-co-trang"),
};

export const DEFAULT_TEMPLATE_ID = "song-hy";
// "giay-do" left the design (same layout as Nét Mực); invitations saved with it render as Nét Mực.
const legacy = new Map([...catalog.filter((entry) => entry[6]).map((entry) => [entry[6]!, entry[0]] as const), ["giay-do", "net-muc"] as const]);

export function getPalette(template: Pick<Template, "family" | "colors">, key = ""): Palette {
  const selected = colors[template.colors.includes(key as ColorKey) ? key as ColorKey : template.colors[0]];
  const dark = ["A", "D", "F", "J", "L"].includes(template.family);
  return dark
    ? { bg: selected.deep, surface: selected.deep, ink: selected.paper, muted: selected.paper, accent: selected.paper, accentInk: selected.deep }
    : { bg: selected.paper, surface: selected.paper, ink: selected.deep, muted: selected.deep, accent: selected.deep, accentInk: selected.paper };
}

export const templates: readonly Template[] = catalog.map(([id, name, family, archetype, blurb, paletteKeys, , seo]) => {
  const t = { id, name, family, archetype, blurb, colors: paletteKeys };
  return { ...t, seo: seo ?? blurb, palette: getPalette(t) };
});

export const getTemplate = (id: string): Template | undefined => templates.find((t) => t.id === (legacy.get(id) ?? id));

/** Gallery card data from design/Mau Thiep v2.dc.html (T): style/motif labels, badge, popularity and the sample couple,
 * date and place each card previews with. Keyed by template id. */
export type TemplateSample = { style: string; motif: string; badge: "" | "HOT" | "MỚI"; pop: number; isNew: boolean; a: string; b: string; date: string; place: string };
export const templateSamples: Record<string, TemplateSample> = {
  "song-hy": { style: "Truyền thống", motif: "Chữ Hỷ", badge: "HOT", pop: 98, isNew: false, a: "Ngọc Hân", b: "Đức Huy", date: "20 · 11 · 2026", place: "TƯ GIA · NAM ĐỊNH" },
  "net-muc": { style: "Tối giản", motif: "Typography", badge: "MỚI", pop: 80, isNew: true, a: "An", b: "Bảo", date: "09 · 11 · 2026", place: "HÀ NỘI" },
  "hoa-nhai": { style: "Hoa", motif: "Vòm hoa", badge: "", pop: 86, isNew: false, a: "Thu Hà", b: "Văn Long", date: "14 · 12 · 2026", place: "ĐÀ LẠT" },
  "hoang-gia": { style: "Cổ điển", motif: "Khung vàng", badge: "HOT", pop: 95, isNew: false, a: "Phương Thảo", b: "Trung Kiên", date: "06 · 12 · 2026", place: "KHÁCH SẠN METROPOLE" },
  "phong-thu": { style: "Lãng mạn", motif: "Phong bì", badge: "MỚI", pop: 88, isNew: true, a: "Hoàng Long", b: "Bảo Ngọc", date: "28 · 09 · 2027", place: "ĐÀ NẴNG" },
  "bia-bao": { style: "Hiện đại", motif: "Tạp chí", badge: "", pop: 72, isNew: false, a: "Linh", b: "Tuấn", date: "SÀI GÒN · 11.2026", place: "Một ngày cuối thu" },
  "hy-su": { style: "Truyền thống", motif: "Chữ Hỷ", badge: "", pop: 90, isNew: false, a: "Quỳnh Anh", b: "Gia Khánh", date: "15 · 01 · 2027", place: "TƯ GIA · HUẾ" },
  "vuon-uom": { style: "Hoa", motif: "Sân vườn", badge: "MỚI", pop: 76, isNew: true, a: "Mai", b: "Phong", date: "21 · 03 · 2027", place: "TAM ĐẢO" },
  "nhung-lam": { style: "Cổ điển", motif: "Nhung", badge: "", pop: 74, isNew: false, a: "Thanh Trúc", b: "Quốc Anh", date: "12 · 12 · 2026", place: "NHÀ HÁT LỚN" },
  "thu-tinh": { style: "Lãng mạn", motif: "Sáp niêm", badge: "", pop: 82, isNew: false, a: "Minh Ánh", b: "Thế Bảo", date: "14 · 02 · 2027", place: "CẦN THƠ" },
  "chan-dung": { style: "Hiện đại", motif: "Ảnh lớn", badge: "HOT", pop: 92, isNew: false, a: "Hạ Vy", b: "Minh Khôi", date: "HÀ NỘI · 11.2026", place: "Chủ nhật, 5 giờ chiều" },
  "song-phung": { style: "Truyền thống", motif: "Chữ Hỷ lớn", badge: "HOT", pop: 97, isNew: false, a: "Ngọc Ánh", b: "Thế Bảo", date: "08 · 12 · 2026", place: "TƯ GIA · BẮC NINH" },
  "bao-hy": { style: "Truyền thống", motif: "Thông tin lễ", badge: "MỚI", pop: 89, isNew: true, a: "Thanh Tú", b: "Hoàng Nam", date: "NGÀY 22 · 11 · 2026", place: "" },
  "doi-khung": { style: "Lãng mạn", motif: "Ảnh đôi", badge: "MỚI", pop: 85, isNew: true, a: "Thu Hà", b: "Minh Quân", date: "19 · 10 · 2026", place: "" },
  "song-cua": { style: "Truyền thống", motif: "Khung vòm", badge: "HOT", pop: 96, isNew: false, a: "Thanh Hà", b: "Tuấn Kiệt", date: "05 · 01 · 2027", place: "TRUNG TÂM TIỆC CƯỚI · HÀ NỘI" },
  "tem-thu": { style: "Lãng mạn", motif: "Tem & dấu bưu điện", badge: "MỚI", pop: 91, isNew: true, a: "Khánh Linh", b: "Đức Anh", date: "18 · 10 · 2026", place: "BƯU ĐIỆN HÀ NỘI" },
  "ve-hanh-phuc": { style: "Hiện đại", motif: "Vé tàu", badge: "MỚI", pop: 93, isNew: true, a: "Bảo Trâm", b: "Minh Đức", date: "24 · 10 · 2026", place: "GA HUẾ" },
  "dia-than": { style: "Hiện đại", motif: "Vinyl", badge: "MỚI", pop: 87, isNew: true, a: "Diệu Linh", b: "Hải Nam", date: "07 · 11 · 2026", place: "SÀI GÒN" },
  "cuon-phim": { style: "Hiện đại", motif: "Phim nhựa", badge: "MỚI", pop: 84, isNew: true, a: "Tường Vi", b: "Quang Huy", date: "29 · 11 · 2026", place: "ĐÀ LẠT" },
  "lich-bloc": { style: "Truyền thống", motif: "Lịch xé", badge: "MỚI", pop: 94, isNew: true, a: "Hồng Nhung", b: "Văn Khoa", date: "13 · 12 · 2026", place: "TƯ GIA · HẢI PHÒNG" },
};
