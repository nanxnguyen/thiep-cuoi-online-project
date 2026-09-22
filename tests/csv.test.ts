import { test } from "node:test";
import assert from "node:assert/strict";
import { BOM, guestsToCsv, parseCsv, parseGuestsCsv, toCsv } from "../lib/csv.ts";

test("toCsv/parseCsv round-trip a comma table, quoting fields that need it", () => {
  const rows = [
    ["a", "b,c", 'has "quotes"'],
    ["line\nbreak", "", "d"],
  ];
  const csv = toCsv(rows);
  assert.deepEqual(parseCsv(csv), rows);
});

test("parseCsv strips a leading BOM", () => {
  assert.deepEqual(parseCsv(BOM + "a,b\nc,d"), [
    ["a", "b"],
    ["c", "d"],
  ]);
});

test("parseCsv sniffs ; and tab delimiters from the first line", () => {
  assert.deepEqual(parseCsv("a;b\nc;d"), [
    ["a", "b"],
    ["c", "d"],
  ]);
  assert.deepEqual(parseCsv("a\tb\nc\td"), [
    ["a", "b"],
    ["c", "d"],
  ]);
});

test("parseCsv drops a trailing blank line without inventing an extra row", () => {
  assert.deepEqual(parseCsv("a,b\nc,d\n"), [
    ["a", "b"],
    ["c", "d"],
  ]);
  assert.deepEqual(parseCsv("a,b\nc,d\n\n\n"), [
    ["a", "b"],
    ["c", "d"],
  ]);
});

const guest = (over: Partial<Parameters<typeof guestsToCsv>[0][number]> = {}) => ({
  household: "Gia đình chú Ba",
  groupName: "Họ nhà trai",
  tableNo: "B1",
  phone: "0900000000",
  expectedPax: 4,
  note: "Ăn chay",
  link: "/invite/an-minh?g=abc123",
  ...over,
});

test("guestsToCsv starts with a BOM and parseGuestsCsv reads it straight back, diacritics intact", () => {
  const csv = guestsToCsv([guest()]);
  assert.ok(csv.startsWith(BOM));
  const { rows, errors } = parseGuestsCsv(csv);
  assert.deepEqual(errors, []);
  assert.deepEqual(rows, [
    { line: 2, household: "Gia đình chú Ba", groupName: "Họ nhà trai", tableNo: "B1", phone: "0900000000", expectedPax: 4, note: "Ăn chay" },
  ]);
});

test("parseGuestsCsv defaults expectedPax to 1 and blank strings for missing optional columns", () => {
  const { rows, errors } = parseGuestsCsv("ho_gia_dinh\nMột hộ");
  assert.deepEqual(errors, []);
  assert.deepEqual(rows, [{ line: 2, household: "Một hộ", groupName: "", tableNo: "", phone: "", expectedPax: 1, note: "" }]);
});

test("a bad row is reported by its file line number and does not block the good rows around it", () => {
  const csv = ["ho_gia_dinh,so_khach_du_kien", "Hộ một,2", ",3", "Hộ ba,30", "Hộ bốn,4"].join("\n");
  const { rows, errors } = parseGuestsCsv(csv);
  assert.deepEqual(
    rows.map((r) => r.household),
    ["Hộ một", "Hộ bốn"],
  );
  assert.deepEqual(errors, [
    { line: 3, message: "Tên hộ/nhóm không được để trống." },
    { line: 4, message: "Số khách dự kiến phải là số nguyên từ 0 đến 20." },
  ]);
});

test("a header missing ho_gia_dinh is one whole-file error, not a crash", () => {
  const { rows, errors } = parseGuestsCsv("nhom,ban\nHọ trai,B1");
  assert.deepEqual(rows, []);
  assert.deepEqual(errors, [{ line: -1, message: 'Thiếu cột "ho_gia_dinh" ở dòng tiêu đề.' }]);
});

test("header matching is case-insensitive and column order does not matter", () => {
  const csv = "BAN,HO_GIA_DINH\nB2,Gia đình cô Tư";
  const { rows, errors } = parseGuestsCsv(csv);
  assert.deepEqual(errors, []);
  assert.deepEqual(rows, [{ line: 2, household: "Gia đình cô Tư", groupName: "", tableNo: "B2", phone: "", expectedPax: 1, note: "" }]);
});
