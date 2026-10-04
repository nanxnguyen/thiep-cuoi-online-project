export const archetypes = ["editorial", "minimal", "classic", "botanical", "traditional", "korean"] as const;
export type Archetype = (typeof archetypes)[number];
export type Palette = { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string };
export type ColorKey = "do" | "dodam" | "nau" | "lam" | "tim" | "xanh" | "hong" | "vang" | "oliu" | "cam" | "muc";
import type { NewCoverFamily } from "./covers.ts";
import { NEW_FAMILIES, familyMeta, isNewFamily } from "./covers.ts";

export type LegacyFamily = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O";
export type CoverFamily = LegacyFamily | NewCoverFamily;
import type { SectionProfileKey } from "./section-profiles.ts";

export type Template = {
  id: string; name: string; family: CoverFamily; archetype: Archetype; blurb: string;
  colors: readonly ColorKey[]; palette: Palette;
  /** Section profile key. All 20 legacy templates use "default"; new profiles are for new templates only. */
  profile: SectionProfileKey;
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
  ["muc-loang", "Mực Loang", "ink-wash", "traditional", "Thủy mặc · mực loang", ["muc", "dodam", "xanh"], undefined, "Mẫu thiệp cưới Mực Loang phong cách thủy mặc: vệt mực loang, núi xa mờ và ảnh cưới trong vòng cọ. Tạo thiệp online miễn phí."],
  ["phung-vu", "Phụng Vũ", "phoenix-fold", "traditional", "Cánh phụng · sum vầy", ["do", "dodam", "lam"], undefined, "Mẫu thiệp cưới Phụng Vũ với đôi cánh phụng mở ra ảnh cưới uy nghi. Tạo thiệp cưới online miễn phí gửi khách."],
  ["lien-hoa", "Liên Hoa", "lotus-scroll", "traditional", "Cuộn sen · thanh tịnh", ["xanh", "hong", "nau"], undefined, "Mẫu thiệp cưới Liên Hoa dạng cuộn giấy với sen nét mảnh thanh tịnh. Tạo thiệp cưới online miễn phí, trang nhã."],
  ["lam-su", "Lam Sứ", "porcelain-blue", "classic", "Men lam · tinh xảo", ["lam", "muc", "xanh"], undefined, "Mẫu thiệp cưới Lam Sứ tinh xảo với khung men lam trên nền giấy sáng. Tạo thiệp cưới online miễn phí."],
  ["to-hong", "Tơ Hồng", "silk-knot", "classic", "Dải lụa · se duyên", ["do", "hong", "dodam"], undefined, "Mẫu thiệp cưới Tơ Hồng với dải lụa đỏ se duyên nối tên và ngày cưới. Tạo thiệp online miễn phí, lãng mạn."],
  ["vuon-kinh", "Vườn Kính", "glasshouse", "botanical", "Vòm kính · trong suốt", ["hong", "xanh", "oliu"], undefined, "Mẫu thiệp cưới Vườn Kính với khung cửa vòm và ảnh sau lớp lá trong suốt. Tạo thiệp cưới online miễn phí cho tiệc sân vườn."],
  ["mai-lan", "Mai Lan", "white-orchid", "minimal", "Lan trắng · tối giản", ["muc", "xanh", "nau"], undefined, "Mẫu thiệp cưới Mai Lan tối giản với cành lan trắng và khoảng thở rộng. Tạo thiệp cưới online miễn phí, tinh tế."],
  ["vuon-ep-hoa", "Vườn Ép Hoa", "pressed-garden", "botanical", "Hoa ép · herbarium", ["xanh", "cam", "hong"], undefined, "Mẫu thiệp cưới Vườn Ép Hoa với hoa ép rải bất đối xứng như tiêu bản. Tạo thiệp cưới online miễn phí, nên thơ."],
  ["noi-minh-hen", "Nơi Mình Hẹn", "venue-sketch", "classic", "Line-art · địa điểm", ["nau", "lam", "oliu"], undefined, "Mẫu thiệp cưới Nơi Mình Hẹn với minh họa line-art địa điểm làm điểm nhấn. Tạo thiệp cưới online miễn phí."],
  ["da-hoa", "Dạ Hoa", "midnight-bloom", "botanical", "Hoa đêm · nền tối", ["muc", "dodam", "tim"], undefined, "Mẫu thiệp cưới Dạ Hoa nền tối với hoa chạy viền và ảnh như cửa sổ đêm. Tạo thiệp cưới online miễn phí."],
  ["thu-doc", "Thư Dọc", "edge-invite", "editorial", "Chữ dọc · bìa tạp chí", ["muc", "lam", "xanh"], undefined, "Mẫu thiệp cưới Thư Dọc với dòng chữ khổng lồ chạy dọc hai bên ảnh cưới như bìa tạp chí. Tạo thiệp cưới online miễn phí."],
  ["phong-toi", "Phòng Tối", "mono-contact", "editorial", "Đen trắng · contact", ["muc", "do", "nau"], undefined, "Mẫu thiệp cưới Phòng Tối đen trắng kiểu contact sheet với dấu son chọn ảnh. Tạo thiệp cưới online miễn phí."],
  ["song-anh", "Song Ảnh", "split-portrait", "editorial", "Chia đôi · tên dọc", ["lam", "muc", "hong"], undefined, "Mẫu thiệp cưới Song Ảnh với hai chân dung chia đôi và tên chạy dọc. Tạo thiệp cưới online miễn phí, hiện đại."],
  ["co-hieu", "Cờ Hiệu", "pennant", "korean", "Cờ đuôi nheo · vui mắt", ["hong", "do", "xanh"], undefined, "Mẫu thiệp cưới Cờ Hiệu với dải cờ đuôi nheo treo ảnh tròn và dòng Save the date vui mắt. Tạo thiệp cưới online miễn phí."],
  ["sac-doi", "Sắc Đôi", "duotone-script", "editorial", "Ảnh hai tông · chữ tay", ["dodam", "lam", "nau"], undefined, "Mẫu thiệp cưới Sắc Đôi phủ ảnh hai tông màu, chữ viết tay cỡ lớn và ngày cưới đứng dọc. Tạo thiệp cưới online miễn phí."],
  ["hoa-chu", "Hoa Chữ", "floral-monogram", "botanical", "Chữ cái · cành hoa", ["nau", "xanh", "hong"], undefined, "Mẫu thiệp cưới Hoa Chữ với hai chữ cái đầu của cô dâu chú rể ôm cành hoa line-art mảnh. Tạo thiệp cưới online miễn phí."],
  ["bat-giac", "Bát Giác", "octagon-frame", "classic", "Khung bát giác · viền vàng", ["muc", "dodam", "lam"], undefined, "Mẫu thiệp cưới Bát Giác với khung ảnh hình bát giác viền vàng trên nền đậm, sang trọng và hiện đại. Tạo thiệp online miễn phí."],
  ["sam-panh", "Sâm Panh", "champagne-line", "classic", "Line vàng · xuyên suốt", ["vang", "nau", "hong"], undefined, "Mẫu thiệp cưới Sâm Panh với đường line vàng chạy xuyên toàn bộ thiệp. Tạo thiệp cưới online miễn phí."],
  ["ngoc-trai", "Ngọc Trai", "pearl-arch", "minimal", "Vòm ngọc · đơn sắc", ["muc", "hong", "lam"], undefined, "Mẫu thiệp cưới Ngọc Trai tinh khôi với vòm chấm ngọc trai trên nền giấy sáng. Tạo thiệp cưới online miễn phí."],
  ["hong-nhung", "Hồng Nhung", "rose-cluster", "botanical", "Chùm hồng · đỏ mận", ["dodam", "tim", "muc"], undefined, "Mẫu thiệp cưới Hồng Nhung với chùm hoa hồng vẽ tay trên nền đỏ mận, lãng mạn và nồng nàn. Tạo thiệp cưới online miễn phí."],
  ["nhat-ky-doi-minh", "Nhật Ký Đôi Mình", "story-journal", "korean", "Nhật ký · cột mốc", ["nau", "hong", "xanh"], undefined, "Mẫu thiệp cưới Nhật Ký Đôi Mình dạng trang nhật ký với tab năm cột mốc. Tạo thiệp cưới online miễn phí, trẻ trung."],
  ["chung-mot-hanh-trinh", "Chung Một Hành Trình", "route-map", "editorial", "Tuyến đường · 3 điểm", ["lam", "oliu", "do"], undefined, "Mẫu thiệp cưới Chung Một Hành Trình với tuyến đường từ nơi gặp đến ngày cưới. Tạo thiệp online miễn phí."],
  ["quan-quen", "Quán Quen", "cafe-card", "classic", "Menu quán · mốc yêu", ["nau", "cam", "muc"], undefined, "Mẫu thiệp cưới Quán Quen dạng thẻ menu quán thân thuộc thanh lịch. Tạo thiệp cưới online miễn phí, gần gũi."],
  ["giao-diem", "Giao Điểm", "overlap-rings", "minimal", "Hai vòng tròn · giao nhau", ["xanh", "hong", "lam"], undefined, "Mẫu thiệp cưới Giao Điểm với hai vòng tròn giao nhau: một vòng ảnh, một vòng ngày cưới. Tạo thiệp cưới online miễn phí."],
  ["the-noi", "Thẻ Nổi", "floating-card", "classic", "Thẻ nổi · nền hoạ tiết", ["dodam", "lam", "xanh"], undefined, "Mẫu thiệp cưới Thẻ Nổi với tấm thiệp nổi trên nền hoạ tiết, ảnh cưới và lời mời gọn gàng. Tạo thiệp cưới online miễn phí."],
  ["chu-chuyen-nhip", "Chữ Chuyển Nhịp", "kinetic-type", "editorial", "Chữ lớn · chuyển nhịp", ["muc", "do", "lam"], undefined, "Mẫu thiệp cưới Chữ Chuyển Nhịp với typography cỡ lớn chuyển nhịp khi mở. Tạo thiệp cưới online miễn phí, cá tính."],
  ["khoi-hy", "Khối Hỷ", "color-block", "editorial", "Mảng màu · cắt giấy", ["do", "cam", "hong"], undefined, "Mẫu thiệp cưới Khối Hỷ với mảng màu bão hòa cắt giấy rực rỡ. Tạo thiệp cưới online miễn phí, nổi bật."],
  ["chung-minh", "Chúng Mình", "chibi-story", "korean", "Chibi · bong bóng", ["hong", "xanh", "do"], undefined, "Mẫu thiệp cưới Chúng Mình với minh họa chibi dễ thương và bong bóng kể chuyện. Tạo thiệp online miễn phí."],
  ["cat-giay", "Cắt Giấy", "paper-cut", "botanical", "Lớp giấy · chiều sâu", ["xanh", "hong", "lam"], undefined, "Mẫu thiệp cưới Cắt Giấy với lớp giấy cắt tạo chiều sâu quanh tên. Tạo thiệp cưới online miễn phí, khéo léo."],
  ["duyen-tinh-tu", "Duyên Tinh Tú", "constellation", "classic", "Chòm sao · ngày cưới", ["muc", "lam", "tim"], undefined, "Mẫu thiệp cưới Duyên Tinh Tú với chòm sao gieo từ đúng ngày cưới. Tạo thiệp cưới online miễn phí, mộng mơ."],
];

// One-line description of each cover layout, from design/Mau Thiep Chi Tiet.dc.html (shown on /templates/[id]).
// New families take theirs from the cover metadata (lib/covers.ts, single source).
const legacyLayouts: Record<LegacyFamily, string> = {
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

export const familyLayout: Record<CoverFamily, string> = {
  ...legacyLayouts,
  ...(Object.fromEntries(NEW_FAMILIES.map((f) => [f, familyMeta[f].layout])) as Record<NewCoverFamily, string>),
};

// Default sample photos per cover family (design/Thiep Preview.dc.html DEF, README §4.8), served from public/photos.
// New families reuse audited sample shots; their ornaments are original CSS/SVG.
const ph = (...names: string[]) => names.map((n) => `/photos/${n}.jpg`);
const legacyPhotos: Record<LegacyFamily, string[]> = {
  A: ph("hy-phuc-do"), B: ph("han-quoc-toi-gian"), C: ph("om-hem-nui"), D: ph("lau-dai-trang"), E: ph("retro-pho-cho"),
  F: ph("vuon-xanh"), G: ph("o-hoa", "vest-xanh-navy"), H: ph("retro-do-hoa-hong", "ao-dai-do"), I: ph("studio-hoa-trang"),
  J: ph("ao-dai-do"), K: ph("nang-chieu"), L: ph("cua-so-vom"), M: ph("khoi-hong"), N: ph("voan-hoa-kho", "vuon-bong-bong", "nang-chieu"),
  O: ph("han-phuc-co-trang"),
};

export const familyPhotos: Record<CoverFamily, string[]> = {
  ...legacyPhotos,
  ...(Object.fromEntries(NEW_FAMILIES.map((f) => [f, [...familyMeta[f].photos]])) as Record<NewCoverFamily, string[]>),
};

export const DEFAULT_TEMPLATE_ID = "song-hy";
// "giay-do" left the design (same layout as Nét Mực); invitations saved with it render as Nét Mực.
const legacy = new Map([...catalog.filter((entry) => entry[6]).map((entry) => [entry[6]!, entry[0]] as const), ["giay-do", "net-muc"] as const]);

export function getPalette(template: Pick<Template, "family" | "colors">, key = ""): Palette {
  const selected = colors[template.colors.includes(key as ColorKey) ? key as ColorKey : template.colors[0]];
  // Legacy dark families render light-on-dark; new dark covers declare it in their metadata.
  const dark = ["A", "D", "F", "J", "L"].includes(template.family) || (isNewFamily(template.family) && familyMeta[template.family].dark);
  return dark
    ? { bg: selected.deep, surface: selected.deep, ink: selected.paper, muted: selected.paper, accent: selected.paper, accentInk: selected.deep }
    : { bg: selected.paper, surface: selected.paper, ink: selected.deep, muted: selected.deep, accent: selected.deep, accentInk: selected.paper };
}

export const templates: readonly Template[] = catalog.map(([id, name, family, archetype, blurb, paletteKeys, , seo]) => {
  const t = { id, name, family, archetype, blurb, colors: paletteKeys };
  // Frozen baseline: legacy A–O templates keep profile "default"; new families
  // take theirs from the cover metadata (lib/covers.ts, single source).
  const profile = isNewFamily(family) ? familyMeta[family].profile : ("default" as const);
  return { ...t, profile, seo: seo ?? blurb, palette: getPalette(t) };
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
  "muc-loang": { style: "Truyền thống", motif: "Thủy mặc", badge: "MỚI", pop: 72, isNew: true, a: "Quỳnh Anh", b: "Gia Khánh", date: "15 · 01 · 2027", place: "TƯ GIA · HUẾ" },
  "phung-vu": { style: "Truyền thống", motif: "Cánh phụng", badge: "MỚI", pop: 79, isNew: true, a: "Ngọc Ánh", b: "Thế Bảo", date: "08 · 12 · 2026", place: "TƯ GIA · BẮC NINH" },
  "lien-hoa": { style: "Truyền thống", motif: "Sen", badge: "MỚI", pop: 86, isNew: true, a: "Thu Hà", b: "Văn Long", date: "14 · 12 · 2026", place: "ĐÀ LẠT" },
  "lam-su": { style: "Cổ điển", motif: "Men lam", badge: "MỚI", pop: 93, isNew: true, a: "Thanh Trúc", b: "Quốc Anh", date: "12 · 12 · 2026", place: "NHÀ HÁT LỚN" },
  "to-hong": { style: "Lãng mạn", motif: "Dải lụa", badge: "MỚI", pop: 75, isNew: true, a: "Minh Ánh", b: "Đình Phong", date: "14 · 02 · 2027", place: "CẦN THƠ" },
  "vuon-kinh": { style: "Hoa", motif: "Vòm kính", badge: "MỚI", pop: 82, isNew: true, a: "Mai Chi", b: "Hải Phong", date: "21 · 03 · 2027", place: "TAM ĐẢO" },
  "mai-lan": { style: "Tối giản", motif: "Lan trắng", badge: "MỚI", pop: 89, isNew: true, a: "Bích Ngọc", b: "Anh Bảo", date: "09 · 11 · 2026", place: "HÀ NỘI" },
  "vuon-ep-hoa": { style: "Hoa", motif: "Hoa ép", badge: "MỚI", pop: 96, isNew: true, a: "Diệu Linh", b: "Tuấn Kiệt", date: "30 · 11 · 2026", place: "SÀI GÒN" },
  "noi-minh-hen": { style: "Cổ điển", motif: "Line-art", badge: "MỚI", pop: 78, isNew: true, a: "Phương Thảo", b: "Trung Kiên", date: "06 · 12 · 2026", place: "KHÁCH SẠN METROPOLE" },
  "da-hoa": { style: "Hoa", motif: "Hoa đêm", badge: "MỚI", pop: 85, isNew: true, a: "Hoàng Yến", b: "Bảo Long", date: "28 · 09 · 2027", place: "ĐÀ NẴNG" },
  "thu-doc": { style: "Hiện đại", motif: "Chữ dọc", badge: "MỚI", pop: 92, isNew: true, a: "Hạ Vy", b: "Minh Khôi", date: "22 · 11 · 2026", place: "HÀ NỘI" },
  "phong-toi": { style: "Hiện đại", motif: "Đen trắng", badge: "MỚI", pop: 74, isNew: true, a: "Gia Hân", b: "Đức Thịnh", date: "05 · 12 · 2026", place: "SÀI GÒN" },
  "song-anh": { style: "Hiện đại", motif: "Chia đôi", badge: "MỚI", pop: 81, isNew: true, a: "Khánh Vy", b: "Tuấn Anh", date: "19 · 10 · 2026", place: "HẢI PHÒNG" },
  "co-hieu": { style: "Lãng mạn", motif: "Cờ đuôi nheo", badge: "MỚI", pop: 88, isNew: true, a: "Mỹ Duyên", b: "Công Danh", date: "25 · 10 · 2026", place: "PHÚ QUỐC" },
  "sac-doi": { style: "Hiện đại", motif: "Ảnh hai tông", badge: "MỚI", pop: 95, isNew: true, a: "Cẩm Tú", b: "Hữu Phước", date: "16 · 01 · 2027", place: "HỘI AN" },
  "hoa-chu": { style: "Hoa", motif: "Chữ & hoa", badge: "MỚI", pop: 77, isNew: true, a: "Thảo Nguyên", b: "Quang Vinh", date: "07 · 02 · 2027", place: "HUẾ" },
  "bat-giac": { style: "Cổ điển", motif: "Bát giác", badge: "MỚI", pop: 84, isNew: true, a: "Tuyết Nhung", b: "Hoài Nam", date: "20 · 12 · 2026", place: "ĐÀ LẠT" },
  "sam-panh": { style: "Cổ điển", motif: "Line vàng", badge: "MỚI", pop: 91, isNew: true, a: "Yến Nhi", b: "Mạnh Cường", date: "27 · 12 · 2026", place: "SÀI GÒN" },
  "ngoc-trai": { style: "Tối giản", motif: "Vòm ngọc", badge: "MỚI", pop: 73, isNew: true, a: "Bảo Châu", b: "Minh Triết", date: "10 · 01 · 2027", place: "NHA TRANG" },
  "hong-nhung": { style: "Hoa", motif: "Hoa hồng", badge: "MỚI", pop: 80, isNew: true, a: "Thanh Mai", b: "Việt Hoàng", date: "03 · 04 · 2027", place: "NINH BÌNH" },
  "nhat-ky-doi-minh": { style: "Lãng mạn", motif: "Nhật ký", badge: "MỚI", pop: 87, isNew: true, a: "Bảo Trâm", b: "Minh Đức", date: "24 · 10 · 2026", place: "GA HUẾ" },
  "chung-mot-hanh-trinh": { style: "Hiện đại", motif: "Tuyến đường", badge: "MỚI", pop: 94, isNew: true, a: "Lan Hương", b: "Văn Toàn", date: "14 · 11 · 2026", place: "HÀ NỘI" },
  "quan-quen": { style: "Cổ điển", motif: "Menu quán", badge: "MỚI", pop: 76, isNew: true, a: "Khánh Linh", b: "Đức Anh", date: "18 · 10 · 2026", place: "BƯU ĐIỆN HÀ NỘI" },
  "giao-diem": { style: "Tối giản", motif: "Vòng giao", badge: "MỚI", pop: 83, isNew: true, a: "Ánh Tuyết", b: "Văn Hiếu", date: "27 · 06 · 2027", place: "ĐÀ NẴNG" },
  "the-noi": { style: "Cổ điển", motif: "Thẻ nổi", badge: "MỚI", pop: 90, isNew: true, a: "Thùy Dương", b: "Hoàng Việt", date: "12 · 05 · 2027", place: "VŨNG TÀU" },
  "chu-chuyen-nhip": { style: "Hiện đại", motif: "Chữ lớn", badge: "MỚI", pop: 72, isNew: true, a: "Tường Vi", b: "Quang Huy", date: "29 · 11 · 2026", place: "ĐÀ LẠT" },
  "khoi-hy": { style: "Hiện đại", motif: "Mảng màu", badge: "MỚI", pop: 79, isNew: true, a: "Nhã Phương", b: "Tuấn Hưng", date: "06 · 06 · 2027", place: "SÀI GÒN" },
  "chung-minh": { style: "Lãng mạn", motif: "Chibi", badge: "MỚI", pop: 86, isNew: true, a: "Thu Trang", b: "Hải Đăng", date: "13 · 03 · 2027", place: "HÀ NỘI" },
  "cat-giay": { style: "Hoa", motif: "Lớp giấy", badge: "MỚI", pop: 93, isNew: true, a: "Hồng Nhung", b: "Văn Khoa", date: "17 · 04 · 2027", place: "HẢI PHÒNG" },
  "duyen-tinh-tu": { style: "Cổ điển", motif: "Chòm sao", badge: "MỚI", pop: 75, isNew: true, a: "Kim Ngân", b: "Trọng Nghĩa", date: "24 · 04 · 2027", place: "HỘI AN" },
};
