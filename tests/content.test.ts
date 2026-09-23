import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSchema, defaultContent, sampleContent, publishIssues, persistable, SAMPLE_NAMES, MAX_EVENTS } from "../lib/content.ts";

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
