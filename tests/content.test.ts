import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSchema, defaultContent, normalizeContent, sampleContent, publishIssues, persistable, SAMPLE_NAMES, MAX_EVENTS, MAX_SCHEDULE_ITEMS } from "../lib/content.ts";

const NOW = new Date("2026-09-20T00:00:00Z");

test("defaultContent passes the schema and has future events", () => {
  const c = defaultContent(NOW);
  const r = contentSchema.safeParse(c);
  assert.equal(r.success, true, r.success ? "" : JSON.stringify(r.error.issues));
  for (const e of c.events) assert.ok(e.date > "2026-09-20", e.date);
});

test("defaultContent leaves Phase 5 bilingual fields empty (no English copy until the owner types one)", () => {
  const c = defaultContent(NOW);
  assert.equal(c.couple.messageEn, "");
  assert.equal(c.thanks.messageEn, "");
  assert.equal(c.gift.noteEn, "");
});

test("Editor v3 fields have complete autosave-safe defaults", () => {
  const c = defaultContent(NOW);
  assert.equal(c.envelope.greeting.length > 0, true);
  assert.equal(c.couple.groom.rank, "");
  assert.equal(c.events.every((event) => typeof event.arrivalTime === "string"), true);
  assert.deepEqual(c.schedule, []);
  assert.equal(c.sections.schedule, false);
  assert.equal(c.albumLayout, "grid");
});

test("legacy v1 content is normalized once before render or edit", () => {
  const current = defaultContent(NOW);
  const legacy = structuredClone(current) as unknown as Record<string, unknown>;
  delete legacy.envelope;
  delete legacy.schedule;
  delete legacy.sections;
  delete legacy.albumLayout;
  const couple = legacy.couple as { groom: Record<string, unknown>; bride: Record<string, unknown> };
  delete couple.groom.rank;
  delete couple.bride.rank;
  for (const event of legacy.events as Record<string, unknown>[]) delete event.arrivalTime;
  const normalized = normalizeContent(legacy);
  assert.equal(contentSchema.safeParse(normalized).success, true);
  assert.equal(normalized.sections.couple, true);
  assert.equal(normalized.events[0].arrivalTime, "");
});

test("palette key is persisted in content v1 and defaults for existing invitations", () => {
  const c = defaultContent(NOW);
  assert.equal(c.paletteKey, "");
  assert.equal(contentSchema.parse({ ...c, paletteKey: "xanh" }).paletteKey, "xanh");
  const { paletteKey: _missing, ...old } = c;
  assert.equal(contentSchema.parse(old).paletteKey, "");
});

test("schema rejects non-http(s) urls", () => {
  const c = defaultContent(NOW);
  c.couple.heroPhoto = "javascript:alert(1)";
  assert.equal(contentSchema.safeParse(c).success, false);
  c.couple.heroPhoto = "";
  c.events[0].mapUrl = "data:text/html,x";
  assert.equal(contentSchema.safeParse(c).success, false);
  c.events[0].mapUrl = "https://maps.google.com/?q=x";
  assert.equal(contentSchema.safeParse(c).success, true);
});

test("schema enforces limits", () => {
  const c = defaultContent(NOW);
  c.events = Array.from({ length: MAX_EVENTS + 1 }, (_, i) => ({ ...c.events[0], id: `e${i}` }));
  assert.equal(contentSchema.safeParse(c).success, false);

  const d = defaultContent(NOW);
  d.couple.message = "x".repeat(501);
  assert.equal(contentSchema.safeParse(d).success, false);

  const g = defaultContent(NOW);
  g.gift.accounts = [{ holder: "groom", bankCode: "970436", accountNumber: "12ab", accountName: "A" }];
  assert.equal(contentSchema.safeParse(g).success, false);

  const s = defaultContent(NOW);
  s.schedule = Array.from({ length: MAX_SCHEDULE_ITEMS + 1 }, (_, i) => ({ id: `s${i}`, time: "10:00", title: "Mốc" }));
  assert.equal(contentSchema.safeParse(s).success, false);
});

test("publishIssues flags empty and sample names, passes real names", () => {
  const c = defaultContent(NOW);
  assert.equal(c.couple.groom.name, SAMPLE_NAMES.groom);
  assert.equal(publishIssues(c).length, 1);
  c.couple.groom.name = "";
  assert.equal(publishIssues(c).length, 1);
  c.couple.groom.name = "Khoa";
  c.couple.bride.name = "Lan";
  assert.deepEqual(publishIssues(c), []);
});

test("sampleContent is richer than the default", () => {
  const s = sampleContent(NOW);
  assert.ok(s.album.length >= 6);
  assert.equal(s.gift.enabled, true);
});

test("persistable blanks half-typed map links the server would reject, without touching valid content", () => {
  const c = defaultContent(NOW);
  c.events[0].mapUrl = "www.goo";
  c.events[1].mapUrl = "https://maps.google.com/?q=x";
  const p = persistable(c);
  assert.equal(p.events[0].mapUrl, "");
  assert.equal(p.events[1].mapUrl, "https://maps.google.com/?q=x");
  assert.equal(contentSchema.safeParse(p).success, true);
  assert.equal(c.events[0].mapUrl, "www.goo"); // the draft the owner is typing in is left alone
  assert.equal(persistable(defaultContent(NOW)).events.length, 2);
});
