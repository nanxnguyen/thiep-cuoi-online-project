import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveLocale, pick, t } from "../lib/i18n.ts";
import { EVENT_KINDS } from "../lib/content.ts";

test("resolveLocale: only the exact string 'en' is English, everything else is Vietnamese", () => {
  assert.equal(resolveLocale("en"), "en");
  assert.equal(resolveLocale("vi"), "vi");
  assert.equal(resolveLocale(undefined), "vi");
  assert.equal(resolveLocale(""), "vi");
  assert.equal(resolveLocale("EN"), "vi");
  assert.equal(resolveLocale(["en", "en"]), "vi"); // Next gives an array on a repeated query param; not a valid single value
});

test("pick: English wins only in en locale and only when the owner actually typed something", () => {
  assert.equal(pick("vi", "Xin chào", "Hello"), "Xin chào");
  assert.equal(pick("en", "Xin chào", "Hello"), "Hello");
  assert.equal(pick("en", "Xin chào", ""), "Xin chào");
  assert.equal(pick("en", "Xin chào", "   "), "Xin chào");
});

test("t(): vi and en dictionaries cover the same event kinds as the content schema", () => {
  for (const kind of EVENT_KINDS) {
    assert.ok(t("vi").eventKindTitle[kind], kind);
    assert.ok(t("en").eventKindTitle[kind], kind);
  }
});

test("t(): a couple of interpolated strings render as expected in both locales", () => {
  assert.equal(t("vi").atTime("18:00"), "Vào lúc 18:00");
  assert.equal(t("en").atTime("18:00"), "At 18:00");
  assert.equal(t("vi").srCountdown(5), "Còn 5 ngày nữa đến lễ cưới.");
  assert.equal(t("en").srCountdown(5), "5 days left until the wedding.");
});
