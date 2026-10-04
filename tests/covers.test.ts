import { test } from "node:test";
import assert from "node:assert/strict";
import { NEW_FAMILIES, familyMeta, isNewFamily } from "../lib/covers.ts";
import { SECTION_PROFILES } from "../lib/section-profiles.ts";
import { familyLayout, familyPhotos, getTemplate, templateSamples, templates } from "../lib/templates.ts";

test("thirty heritage, garden, editorial, luxury, story and expressive families are active", () => {
  assert.deepEqual([...NEW_FAMILIES], ["ink-wash","phoenix-fold","lotus-scroll","porcelain-blue","silk-knot","glasshouse","white-orchid","pressed-garden","venue-sketch","midnight-bloom","edge-invite","mono-contact","split-portrait","pennant","duotone-script","floral-monogram","octagon-frame","champagne-line","pearl-arch","rose-cluster","story-journal","route-map","cafe-card","overlap-rings","floating-card","kinetic-type","color-block","chibi-story","paper-cut","constellation"]);
  assert.equal(new Set(NEW_FAMILIES).size, NEW_FAMILIES.length);
  for (const family of NEW_FAMILIES) {
    const meta = familyMeta[family];
    assert.ok(meta.label, family);
    assert.ok(meta.layout.length > 20, family);
    assert.ok(meta.photos.length >= 1, family);
    assert.ok(SECTION_PROFILES[meta.profile], family);
  }
});

test("design-native A–T families are not part of the thirty new families", () => {
  for (const f of ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"]) {
    assert.equal(isNewFamily(f), false, f);
  }
  for (const f of NEW_FAMILIES) assert.equal(isNewFamily(f), true);
});

test("each new family has exactly one template, profile, sample, layout and photos", () => {
  assert.equal(templates.length, 50);
  for (const family of NEW_FAMILIES) {
    const rows = templates.filter((t) => t.family === family);
    assert.equal(rows.length, 1, family);
    assert.equal(rows[0].profile, familyMeta[family].profile);
    assert.ok(rows[0].seo.length >= 100 && rows[0].seo.length <= 161, family);
    assert.ok(familyLayout[family], family);
    assert.deepEqual(familyPhotos[family], familyMeta[family].photos);
    assert.ok(templateSamples[rows[0].id], family);
  }
});

test("approved catalog rows match the spec tables", () => {
  const approved: [string, string, string, string, string, string[]][] = [
  ["muc-loang", "Mực Loang", "ink-wash", "traditional", "heritage", ["muc","dodam","xanh"]],
  ["phung-vu", "Phụng Vũ", "phoenix-fold", "traditional", "heritage", ["do","dodam","lam"]],
  ["lien-hoa", "Liên Hoa", "lotus-scroll", "traditional", "heritage", ["xanh","hong","nau"]],
  ["lam-su", "Lam Sứ", "porcelain-blue", "classic", "heritage", ["lam","muc","xanh"]],
  ["to-hong", "Tơ Hồng", "silk-knot", "classic", "heritage", ["do","hong","dodam"]],
  ["vuon-kinh", "Vườn Kính", "glasshouse", "botanical", "garden", ["hong","xanh","oliu"]],
  ["mai-lan", "Mai Lan", "white-orchid", "minimal", "garden", ["muc","xanh","nau"]],
  ["vuon-ep-hoa", "Vườn Ép Hoa", "pressed-garden", "botanical", "garden", ["xanh","cam","hong"]],
  ["noi-minh-hen", "Nơi Mình Hẹn", "venue-sketch", "classic", "garden", ["nau","lam","oliu"]],
  ["da-hoa", "Dạ Hoa", "midnight-bloom", "botanical", "garden", ["muc","dodam","tim"]],
  ["thu-doc", "Thư Dọc", "edge-invite", "editorial", "editorial-photo", ["muc","lam","xanh"]],
  ["phong-toi", "Phòng Tối", "mono-contact", "editorial", "editorial-photo", ["muc","do","nau"]],
  ["song-anh", "Song Ảnh", "split-portrait", "editorial", "editorial-photo", ["lam","muc","hong"]],
  ["co-hieu", "Cờ Hiệu", "pennant", "korean", "editorial-photo", ["hong","do","xanh"]],
  ["sac-doi", "Sắc Đôi", "duotone-script", "editorial", "editorial-photo", ["dodam","lam","nau"]],
  ["hoa-chu", "Hoa Chữ", "floral-monogram", "botanical", "quiet-luxury", ["nau","xanh","hong"]],
  ["bat-giac", "Bát Giác", "octagon-frame", "classic", "quiet-luxury", ["muc","dodam","lam"]],
  ["sam-panh", "Sâm Panh", "champagne-line", "classic", "quiet-luxury", ["vang","nau","hong"]],
  ["ngoc-trai", "Ngọc Trai", "pearl-arch", "minimal", "quiet-luxury", ["muc","hong","lam"]],
  ["hong-nhung", "Hồng Nhung", "rose-cluster", "botanical", "quiet-luxury", ["dodam","tim","muc"]],
  ["nhat-ky-doi-minh", "Nhật Ký Đôi Mình", "story-journal", "korean", "story-led", ["nau","hong","xanh"]],
  ["chung-mot-hanh-trinh", "Chung Một Hành Trình", "route-map", "editorial", "story-led", ["lam","oliu","do"]],
  ["quan-quen", "Quán Quen", "cafe-card", "classic", "story-led", ["nau","cam","muc"]],
  ["giao-diem", "Giao Điểm", "overlap-rings", "minimal", "story-led", ["xanh","hong","lam"]],
  ["the-noi", "Thẻ Nổi", "floating-card", "classic", "story-led", ["dodam","lam","xanh"]],
  ["chu-chuyen-nhip", "Chữ Chuyển Nhịp", "kinetic-type", "editorial", "expressive", ["muc","do","lam"]],
  ["khoi-hy", "Khối Hỷ", "color-block", "editorial", "expressive", ["do","cam","hong"]],
  ["chung-minh", "Chúng Mình", "chibi-story", "korean", "expressive", ["hong","xanh","do"]],
  ["cat-giay", "Cắt Giấy", "paper-cut", "botanical", "expressive", ["xanh","hong","lam"]],
  ["duyen-tinh-tu", "Duyên Tinh Tú", "constellation", "classic", "expressive", ["muc","lam","tim"]],
  ];
  for (const [id, name, family, archetype, profile, colors] of approved) {
    const t = getTemplate(id);
    assert.ok(t, id);
    assert.deepEqual([t.name, t.family, t.archetype, t.profile, [...t.colors]], [name, family, archetype, profile, colors], id);
  }
});

test("every cover stylesheet with animation respects reduced motion", async () => {
  const { readFileSync, readdirSync } = await import("node:fs");
  for (const file of readdirSync("components/templates/covers").filter((f) => f.endsWith(".css"))) {
    const css = readFileSync(`components/templates/covers/${file}`, "utf8");
    if (/@keyframes|animation:/.test(css)) {
      assert.ok(css.includes("prefers-reduced-motion"), `${file} animates without a reduced-motion guard`);
    }
  }
});
