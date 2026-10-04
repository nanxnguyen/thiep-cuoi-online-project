import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { templates, getTemplate, getPalette, DEFAULT_TEMPLATE_ID, archetypes } from "../lib/templates.ts";

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

test("design catalog has fifty distinct names and fifty cover families", () => {
  assert.equal(templates.length, 50);
  assert.equal(new Set(templates.map((t) => t.id)).size, 50);
  assert.equal(new Set(templates.map((t) => t.name)).size, 50);
  assert.equal(new Set(templates.map((t) => t.family)).size, 50);
  assert.deepEqual(templates.slice(0, 3).map((t) => t.name), ["Song Hỷ", "Nét Mực", "Hoa Nhài"]);
});

test("five redesigned legacy templates use the current P–T cover families", () => {
  assert.deepEqual(
    ["hy-su", "vuon-uom", "nhung-lam", "thu-tinh", "chan-dung"].map((id) => getTemplate(id)?.family),
    ["P", "Q", "R", "S", "T"],
  );

  const preview = readFileSync("components/templates/ThiepPreview.tsx", "utf8");
  for (const family of ["P", "Q", "R", "S", "T"]) {
    assert.match(preview, new RegExp(`f === "${family}"`), `missing ${family} renderer`);
  }
});

test("published legacy template IDs resolve to their new visual families", () => {
  assert.equal(getTemplate("lua-son")?.name, "Song Hỷ");
  assert.equal(getTemplate("gallery-noir")?.name, "Bìa Báo");
  assert.equal(getTemplate("thanh-ngoc")?.family, "J");
  assert.equal(getTemplate("giay-do")?.name, "Nét Mực");
});

test("selected palette is resolved per template and invalid/old key falls back to first", () => {
  const songHy = getTemplate("song-hy")!;
  assert.equal(getPalette(songHy, "xanh").bg, "#24493a");
  assert.equal(getPalette(songHy, "unknown").bg, getPalette(songHy, "").bg);
});

test("default template exists and getTemplate misses cleanly", () => {
  assert.ok(getTemplate(DEFAULT_TEMPLATE_ID));
  assert.equal(getTemplate("nope"), undefined);
});

test("every archetype is used at least once", () => {
  for (const a of archetypes) assert.ok(templates.some((t) => t.archetype === a), a);
});

test("palettes are hex and every text pair meets WCAG AA 4.5:1", () => {
  type Key = keyof (typeof templates)[number]["palette"];
  const pairs: [Key, Key][] = [
    ["ink", "bg"],
    ["ink", "surface"],
    ["muted", "bg"],
    ["muted", "surface"],
    ["accent", "bg"],
    ["accentInk", "accent"],
  ];
  for (const t of templates) {
    for (const v of Object.values(t.palette)) assert.match(v, /^#[0-9a-f]{6}$/i, t.id);
    for (const [fg, bg] of pairs) assert.ok(ratio(t.palette[fg], t.palette[bg]) >= 4.5, `${t.id} ${fg}/${bg}`);
  }
});

test("every cover family has a layout description", async () => {
  const { familyLayout, templates: all } = await import("../lib/templates.ts");
  for (const t of all) assert.ok(familyLayout[t.family], `familyLayout missing for ${t.family}`);
});

test("every template has a unique SEO description fitting a search result", () => {
  const seos = templates.map((t) => t.seo);
  assert.equal(new Set(seos).size, templates.length, "duplicate seo description");
  for (const t of templates) {
    assert.ok(t.seo.length >= 100 && t.seo.length <= 161, `${t.id}: ${t.seo.length}`);
  }
});

test("template detail renders the design's single layout paragraph", () => {
  const page = readFileSync("app/templates/[id]/page.tsx", "utf8");
  const head = page.match(/<div className="tdt__head">([\s\S]*?)<\/div>/)?.[1] ?? "";

  assert.equal((head.match(/<p>/g) ?? []).length, 1);
  assert.match(head, /<p>\{familyLayout\[template\.family\]\}<\/p>/);
});

// Baseline for the original 20 catalog rows. Owner decision 2026-10-04 permits
// their cover families to follow the current design; IDs, names, archetypes,
// palettes and SEO remain stable so published invitations keep resolving.
test("original twenty catalog rows keep their public contract", () => {
  assert.deepEqual(
    templates.slice(0, 20).map((t) => ({ id: t.id, name: t.name, family: t.family, archetype: t.archetype, blurb: t.blurb, colors: [...t.colors], seo: t.seo })),
    [
      { id: "song-hy", name: "Song Hỷ", family: "A", archetype: "traditional", blurb: "Chữ Hỷ · truyền thống", colors: ["do", "xanh"], seo: "Mẫu thiệp cưới online Song Hỷ với chữ Hỷ đỏ truyền thống, ảnh vòm và đếm ngược. Tạo thiệp miễn phí, gửi link cho khách qua Zalo." },
      { id: "net-muc", name: "Nét Mực", family: "B", archetype: "minimal", blurb: "Chữ lớn · tối giản", colors: ["dodam", "nau", "lam", "tim"], seo: "Mẫu thiệp cưới tối giản Nét Mực: chữ lớn làm điểm nhấn, không ảnh, hợp cặp đôi thích phong cách hiện đại. Tạo online miễn phí." },
      { id: "hoa-nhai", name: "Hoa Nhài", family: "C", archetype: "botanical", blurb: "Vòm hoa · dịu dàng", colors: ["xanh", "hong", "nau"], seo: "Mẫu thiệp cưới Hoa Nhài dịu dàng với vòm hoa và ảnh tròn, tông xanh hồng. Tạo thiệp cưới online miễn phí gửi khách." },
      { id: "hoang-gia", name: "Hoàng Gia", family: "D", archetype: "classic", blurb: "Khung vàng · trang nhã", colors: ["vang", "dodam", "lam"], seo: "Mẫu thiệp cưới Hoàng Gia sang trọng: khung vàng, chữ viết tay cổ điển. Tạo thiệp cưới online miễn phí cho lễ cưới trang trọng." },
      { id: "phong-thu", name: "Phong Thư", family: "E", archetype: "editorial", blurb: "Phong bì · lãng mạn", colors: ["do", "oliu"], seo: "Mẫu thiệp cưới Phong Thư lãng mạn như lá thư tay: ảnh nghiêng trong phong bì. Tạo thiệp online miễn phí, gửi qua Zalo." },
      { id: "bia-bao", name: "Bìa Báo", family: "F", archetype: "editorial", blurb: "Tạp chí · hiện đại", colors: ["muc", "hong"], seo: "Mẫu thiệp cưới Bìa Báo hiện đại phong cách tạp chí, chữ lớn nổi bật. Tạo thiệp cưới online miễn phí, cá tính." },
      { id: "hy-su", name: "Hỷ Sự", family: "P", archetype: "traditional", blurb: "Chữ Hỷ · lễ thành hôn", colors: ["dodam", "lam"], seo: "Mẫu thiệp cưới Hỷ Sự với chữ Hỷ cho lễ thành hôn truyền thống. Tạo thiệp online miễn phí, có xác nhận tham dự." },
      { id: "vuon-uom", name: "Vườn Ươm", family: "Q", archetype: "botanical", blurb: "Sân vườn · nên thơ", colors: ["oliu", "cam"], seo: "Mẫu thiệp cưới Vườn Ươm nên thơ cho tiệc sân vườn: vòm cổng hoa, tông ô liu cam. Tạo thiệp online miễn phí." },
      { id: "nhung-lam", name: "Nhung Lam", family: "R", archetype: "classic", blurb: "Nhung lam · cổ điển", colors: ["lam", "do"], seo: "Mẫu thiệp cưới Nhung Lam cổ điển tông lam, khung cong viền vàng. Tạo thiệp cưới online miễn phí, trang nhã." },
      { id: "thu-tinh", name: "Thư Tình", family: "S", archetype: "editorial", blurb: "Sáp niêm · lãng mạn", colors: ["hong", "dodam"], seo: "Mẫu thiệp cưới Thư Tình với con dấu sáp niêm lãng mạn như thư tay xưa. Tạo thiệp online miễn phí gửi người thương." },
      { id: "chan-dung", name: "Chân Dung", family: "T", archetype: "editorial", blurb: "Ảnh lớn · đương đại", colors: ["muc", "xanh"], seo: "Mẫu thiệp cưới Chân Dung hiện đại với ảnh lớn đương đại. Tạo thiệp cưới online miễn phí, khoe ảnh cưới đẹp." },
      { id: "song-phung", name: "Song Phụng", family: "I", archetype: "traditional", blurb: "Chữ Hỷ lớn · trang trọng", colors: ["do", "dodam", "lam"], seo: "Mẫu thiệp cưới Song Phụng trang trọng với chữ Hỷ lớn. Tạo thiệp online miễn phí cho đại lễ gia đình." },
      { id: "bao-hy", name: "Báo Hỷ", family: "H", archetype: "traditional", blurb: "Thông tin lễ · truyền thống", colors: ["do", "lam"], seo: "Mẫu thiệp cưới Báo Hỷ đầy đủ thông tin lễ hai họ. Tạo thiệp online miễn phí, rõ ràng cho khách lớn tuổi." },
      { id: "doi-khung", name: "Đôi Khung", family: "G", archetype: "korean", blurb: "Ảnh đôi · lãng mạn", colors: ["xanh", "hong", "nau"], seo: "Mẫu thiệp cưới Đôi Khung phong cách Hàn với hai khung ảnh polaroid. Tạo thiệp online miễn phí, trẻ trung." },
      { id: "song-cua", name: "Song Cửa", family: "J", archetype: "traditional", blurb: "Khung vòm · trang trọng", colors: ["dodam", "do", "xanh"], seo: "Mẫu thiệp cưới Song Cửa trang trọng với khung vòm viền vàng trên nền đậm. Tạo thiệp cưới online miễn phí." },
      { id: "tem-thu", name: "Tem Thư", family: "K", archetype: "editorial", blurb: "Tem & dấu bưu điện · lãng mạn", colors: ["do", "lam", "xanh"], seo: "Mẫu thiệp cưới Tem Thư lãng mạn kiểu bưu thiếp: tem răng cưa, dấu bưu điện. Tạo thiệp online miễn phí." },
      { id: "ve-hanh-phuc", name: "Vé Hạnh Phúc", family: "L", archetype: "editorial", blurb: "Vé tàu · hiện đại", colors: ["lam", "dodam", "xanh"], seo: "Mẫu thiệp cưới Vé Hạnh Phúc độc lạ như vé tàu: ga đi chú rể, ga đến cô dâu. Tạo thiệp online miễn phí." },
      { id: "dia-than", name: "Đĩa Than", family: "M", archetype: "editorial", blurb: "Vinyl · hiện đại", colors: ["muc", "dodam", "cam"], seo: "Mẫu thiệp cưới Đĩa Than hiện đại cho cặp đôi mê nhạc: đĩa vinyl, tracklist lịch trình. Tạo online miễn phí." },
      { id: "cuon-phim", name: "Cuộn Phim", family: "N", archetype: "editorial", blurb: "Phim nhựa · hiện đại", colors: ["muc", "nau", "hong"], seo: "Mẫu thiệp cưới Cuộn Phim cho cặp đôi thích điện ảnh: dải phim, dấu ngày kiểu máy film. Tạo online miễn phí." },
      { id: "lich-bloc", name: "Lịch Bloc", family: "O", archetype: "traditional", blurb: "Lịch xé · truyền thống", colors: ["do", "xanh", "lam"], seo: "Mẫu thiệp cưới Lịch Bloc truyền thống như tờ lịch xé ngày lành tháng tốt. Tạo thiệp online miễn phí." },
    ],
  );
});
