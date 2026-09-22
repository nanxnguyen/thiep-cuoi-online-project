import { test } from "node:test";
import assert from "node:assert/strict";
import { directionsUrl, embedUrl, hasPlace } from "../lib/maps.ts";
import { earliestEvent } from "../lib/datetime.ts";

const ev = { venue: "Nhà hàng Hoa Sen", address: "45 Lê Lợi, Quận 1", mapUrl: "" };

test("directionsUrl uses the typed place, or the owner's own map link when given", () => {
  const url = new URL(directionsUrl(ev)!);
  assert.equal(url.origin + url.pathname, "https://www.google.com/maps/dir/");
  assert.equal(url.searchParams.get("api"), "1");
  assert.equal(url.searchParams.get("destination"), "Nhà hàng Hoa Sen, 45 Lê Lợi, Quận 1");
  assert.equal(directionsUrl({ ...ev, mapUrl: "https://maps.app.goo.gl/abc" }), "https://maps.app.goo.gl/abc");
  assert.equal(directionsUrl({ venue: "", address: "", mapUrl: "" }), null);
});

test("embedUrl needs a place and never uses the owner's link", () => {
  const url = new URL(embedUrl(ev)!);
  assert.equal(url.origin + url.pathname, "https://www.google.com/maps");
  assert.equal(url.searchParams.get("q"), "Nhà hàng Hoa Sen, 45 Lê Lợi, Quận 1");
  assert.equal(url.searchParams.get("output"), "embed");
  assert.equal(embedUrl({ venue: "", address: "", mapUrl: "https://x.example" }), null);
});

test("hasPlace is true when venue or address is typed", () => {
  assert.equal(hasPlace(ev), true);
  assert.equal(hasPlace({ venue: "", address: "  " }), false);
});

test("earliestEvent returns the soonest dated event, even if it is in the past", () => {
  const a = { id: "a", date: "2026-11-09", time: "09:00" };
  const b = { id: "b", date: "2026-11-08", time: "18:00" };
  const c = { id: "c", date: "", time: "" };
  assert.equal(earliestEvent([a, c, b])?.id, "b");
  assert.equal(earliestEvent([c]), null);
  assert.equal(earliestEvent([]), null);
});
