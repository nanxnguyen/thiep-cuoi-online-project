import { test } from "node:test";
import assert from "node:assert/strict";
import { eventStart, nextEvent, remaining, formatDateVi, formatDateEn } from "../lib/datetime.ts";

test("eventStart reads wall-clock time as +07:00", () => {
  assert.equal(eventStart({ date: "2026-11-08", time: "10:00" })?.toISOString(), "2026-11-08T03:00:00.000Z");
  assert.equal(eventStart({ date: "2026-11-08", time: "" })?.toISOString(), "2026-11-07T17:00:00.000Z");
  assert.equal(eventStart({ date: "", time: "10:00" }), null);
  assert.equal(eventStart({ date: "2026-13-45", time: "10:00" }), null);
});

test("nextEvent picks the earliest future event, ignoring past and undated", () => {
  const now = new Date("2026-11-08T05:00:00Z"); // 12:00 +07
  const past = { id: "past", date: "2026-11-08", time: "10:00" };
  const soon = { id: "soon", date: "2026-11-08", time: "18:00" };
  const later = { id: "later", date: "2026-11-09", time: "09:00" };
  const undated = { id: "undated", date: "", time: "" };
  assert.equal(nextEvent([later, undated, past, soon], now)?.id, "soon");
  assert.equal(nextEvent([past], now), null);
});

test("remaining splits a duration and clamps at zero", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const t = new Date(now.getTime() + ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000);
  assert.deepEqual(remaining(t, now), { days: 2, hours: 3, minutes: 4, seconds: 5 });
  assert.deepEqual(remaining(now, t), { days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test("formatDateVi gives weekday + dd/mm/yyyy, empty for bad input", () => {
  assert.equal(formatDateVi("2026-11-08"), "Chủ nhật, 08/11/2026");
  assert.equal(formatDateVi("2026-11-09"), "Thứ hai, 09/11/2026");
  assert.equal(formatDateVi(""), "");
  assert.equal(formatDateVi("2026-02-31"), "");
});

test("formatDateEn gives weekday + d Month yyyy, empty for bad input (Phase 5)", () => {
  assert.equal(formatDateEn("2026-11-08"), "Sunday, 8 November 2026");
  assert.equal(formatDateEn("2026-11-09"), "Monday, 9 November 2026");
  assert.equal(formatDateEn(""), "");
  assert.equal(formatDateEn("2026-02-31"), "");
});
