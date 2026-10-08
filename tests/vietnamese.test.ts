import assert from "node:assert/strict";
import test from "node:test";
import { normalizeVi, VI_ACCENT_FROM, VI_ACCENT_TO } from "../lib/vietnamese.ts";

// The SQL mirror (search_norm generated columns in
// supabase/migrations/202610090001_admin.sql) must stay identical to this
// mapping — positions, not just lengths.
test("accent mapping covers every Vietnamese vowel family plus đ", () => {
  assert.equal([...VI_ACCENT_FROM].length, 67);
  assert.equal(VI_ACCENT_TO.length, 67);
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  [...VI_ACCENT_FROM].forEach((ch, i) => {
    assert.equal(norm(ch), VI_ACCENT_TO[i], `char ${ch} must fold to ${VI_ACCENT_TO[i]}`);
  });
});

test("normalizeVi folds the reported search case", () => {
  assert.equal(normalizeVi("Anh Nhựt Nguyễn"), "anh nhut nguyen");
  assert.ok(normalizeVi("Anh Nhựt Nguyễn").includes(normalizeVi("anh nhut")));
});

test("normalizeVi handles uppercase, Đ and mixed content", () => {
  assert.equal(normalizeVi("ĐĨA THAN"), "dia than");
  assert.equal(normalizeVi("Song Phụng HOÀNG-Gia 98"), "song phung hoang-gia 98");
  assert.equal(normalizeVi("Nguyễn Thu Hà"), "nguyen thu ha");
  assert.equal(normalizeVi("Ỡ ngỡ NGỠ"), "o ngo ngo");
});


test("normalizeVi passes ASCII through unchanged", () => {
  assert.equal(normalizeVi("admin@moc.vn"), "admin@moc.vn");
  assert.equal(normalizeVi("song-hy 123"), "song-hy 123");
  assert.equal(normalizeVi(""), "");
});
