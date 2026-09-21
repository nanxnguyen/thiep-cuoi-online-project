import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, isValidSlug, randomSlug } from "../lib/slug.ts";

test("slugify strips Vietnamese diacritics and joins with hyphens", () => {
  assert.equal(slugify("Nguyễn Minh & Trần Ánh"), "nguyen-minh-tran-anh");
  assert.equal(slugify("Đặng Đức"), "dang-duc");
});

test("slugify collapses junk and caps at 40 chars", () => {
  assert.equal(slugify("  --A   B--  "), "a-b");
  assert.ok(slugify("a".repeat(80)).length <= 40);
});

test("isValidSlug", () => {
  assert.equal(isValidSlug("minh-va-an"), true);
  for (const bad of ["ab", "-abc", "abc-", "a--b", "Abc", "a b", "a".repeat(41)]) {
    assert.equal(isValidSlug(bad), false, bad);
  }
});

test("randomSlug is 8 valid chars and varies", () => {
  const a = randomSlug();
  const b = randomSlug();
  assert.match(a, /^[a-z0-9]{8}$/);
  assert.equal(isValidSlug(a), true);
  assert.notEqual(a, b);
});
