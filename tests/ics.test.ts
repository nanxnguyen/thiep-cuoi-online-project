import { test } from "node:test";
import assert from "node:assert/strict";
import { toIcs, googleCalendarUrl } from "../lib/ics.ts";

const ev = { title: "Tiệc cưới, Minh & An", date: "2026-11-08", time: "18:00", venue: "Nhà hàng Hoa Sen", address: "45 Lê Lợi, Quận 1" };
const NOW = new Date("2026-09-20T00:00:00Z");

test("toIcs converts +07:00 to UTC, defaults to 2 hours, escapes commas, uses CRLF", () => {
  const ics = toIcs(ev, "uid-1@moc", NOW)!;
  assert.match(ics, /DTSTART:20261108T110000Z\r\n/);
  assert.match(ics, /DTEND:20261108T130000Z\r\n/);
  assert.match(ics, /DTSTAMP:20260920T000000Z\r\n/);
  assert.match(ics, /SUMMARY:Tiệc cưới\\, Minh & An\r\n/);
  assert.match(ics, /LOCATION:Nhà hàng Hoa Sen\\, 45 Lê Lợi\\, Quận 1\r\n/);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
});

test("toIcs returns null without a date", () => {
  assert.equal(toIcs({ ...ev, date: "" }, "u", NOW), null);
});

test("long lines fold at 75 octets and unfold losslessly", () => {
  const long = { ...ev, title: "Lễ thành hôn của Nguyễn Văn Minh và Trần Thị Ánh ".repeat(4) };
  const ics = toIcs(long, "u", NOW)!;
  const enc = new TextEncoder();
  for (const line of ics.split("\r\n")) assert.ok(enc.encode(line).length <= 75, line);
  assert.ok(ics.replace(/\r\n /g, "").includes("SUMMARY:" + long.title));
});

test("googleCalendarUrl carries title, UTC range and location", () => {
  const url = new URL(googleCalendarUrl(ev)!);
  assert.equal(url.origin + url.pathname, "https://calendar.google.com/calendar/render");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(url.searchParams.get("text"), ev.title);
  assert.equal(url.searchParams.get("dates"), "20261108T110000Z/20261108T130000Z");
  assert.equal(url.searchParams.get("location"), "Nhà hàng Hoa Sen, 45 Lê Lợi, Quận 1");
  assert.equal(googleCalendarUrl({ ...ev, date: "" }), null);
});
