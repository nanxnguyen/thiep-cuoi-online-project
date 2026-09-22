import { test } from "node:test";
import assert from "node:assert/strict";
import { toBankName } from "../lib/bank-name.ts";

test("toBankName gives the upper-case, diacritic-free form banks print on the card", () => {
  assert.equal(toBankName("Nguyễn Văn Minh"), "NGUYEN VAN MINH");
  assert.equal(toBankName("Đặng Thị Ánh"), "DANG THI ANH");
  assert.equal(toBankName("  lê   thị an "), "LE THI AN");
  assert.equal(toBankName(""), "");
});
