import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SECTION_PROFILE, SECTION_PROFILES, resolveSectionOrder } from "../lib/section-profiles.ts";
import { isNewFamily } from "../lib/covers.ts";
import { templates } from "../lib/templates.ts";

// Section profiles only govern sections inside <main>. Envelope, music and the
// add-to-calendar control stay shell-level (owner decision 2026-10-04), so the
// legacy default DOM cannot shift when profiles roll out to the 30 new templates.
test("default profile keeps the legacy main-section order", () => {
  assert.deepEqual([...DEFAULT_SECTION_PROFILE.order], [
    "cover", "couple", "family", "events", "venue", "schedule", "countdown",
    "dressCode", "story", "album", "video", "rsvp", "guestbook", "gift", "thanks",
  ]);
});

test("registry holds exactly the seven approved profiles", () => {
  assert.deepEqual(Object.keys(SECTION_PROFILES).sort(), [
    "default", "editorial-photo", "expressive", "garden", "heritage", "quiet-luxury", "story-led",
  ]);
});

test("every profile order holds each section key exactly once", () => {
  const all = [...DEFAULT_SECTION_PROFILE.order].sort();
  for (const [key, profile] of Object.entries(SECTION_PROFILES)) {
    assert.deepEqual([...profile.order].sort(), all, key);
    assert.equal(new Set(profile.order).size, profile.order.length, key);
    assert.ok(profile.order.includes("cover"), key);
  }
});

test("profile densities and shared variants match the approved table", () => {
  const expected = {
    default: { density: "balanced", story: "timeline", venue: "card", album: "grid" },
    heritage: { density: "ceremonial", story: "timeline", venue: "illustrated", album: "grid" },
    garden: { density: "airy", story: "cards", venue: "illustrated", album: "masonry" },
    "editorial-photo": { density: "balanced", story: "editorial", venue: "editorial", album: "masonry" },
    "quiet-luxury": { density: "airy", story: "timeline", venue: "card", album: "grid" },
    "story-led": { density: "balanced", story: "cards", venue: "editorial", album: "filmstrip" },
    expressive: { density: "balanced", story: "editorial", venue: "illustrated", album: "masonry" },
  } as const;
  for (const [key, want] of Object.entries(expected)) {
    const got = SECTION_PROFILES[key as keyof typeof SECTION_PROFILES];
    assert.equal(got.density, want.density, key);
    assert.equal(got.variants.story, want.story, key);
    assert.equal(got.variants.venue, want.venue, key);
    assert.equal(got.variants.album, want.album, key);
  }
});

test("every catalog template points at a known profile", () => {
  for (const template of templates) assert.ok(SECTION_PROFILES[template.profile], template.id);
});

test("resolver drops disabled sections but keeps a stable order", () => {
  const order = resolveSectionOrder(DEFAULT_SECTION_PROFILE, (key) => key !== "schedule" && key !== "album");
  assert.ok(!order.includes("schedule") && !order.includes("album"));
  assert.deepEqual(order, DEFAULT_SECTION_PROFILE.order.filter((key) => key !== "schedule" && key !== "album"));
});

test("resolver on the default profile with the four new sections off reproduces the legacy DOM order", () => {
  const order = resolveSectionOrder(
    DEFAULT_SECTION_PROFILE,
    (key) => key !== "venue" && key !== "dressCode" && key !== "story" && key !== "video",
  );
  assert.deepEqual(order, [
    "cover", "couple", "family", "events", "schedule", "countdown",
    "album", "rsvp", "guestbook", "gift", "thanks",
  ]);
});

test("original A–T templates stay on the default profile", () => {
  for (const template of templates.filter((t) => !isNewFamily(t.family))) assert.equal(template.profile, "default");
});
