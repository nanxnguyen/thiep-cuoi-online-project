import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSchema, defaultContent, normalizeContent, sampleContent, publishIssues, persistable, SAMPLE_NAMES, MAX_EVENTS, MAX_SCHEDULE_ITEMS, MAX_STORY_ITEMS, MAX_DRESS_COLORS, upgradeV1 } from "../lib/content.ts";

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

test("music accepts https links and built-in tracks only, never other relative paths", () => {
  const withMusic = (url: string) => contentSchema.safeParse({ ...defaultContent(NOW), music: { url, title: "x" } }).success;
  assert.equal(withMusic("https://cdn.example.com/a.mp3"), true);
  assert.equal(withMusic("/music/ngay-dau-tien.mp3"), true);
  assert.equal(withMusic("/music/khong-co-bai-nay.mp3"), false);
  assert.equal(withMusic("/music/../secret.mp3"), false);
  assert.equal(withMusic("/other/ngay-dau-tien.mp3"), false);
  assert.equal(withMusic("javascript:alert(1)"), false);
});

test("v1 payloads upgrade to v2 without touching couple, events, album, rsvp, gift or old sections", () => {
  const v1 = JSON.parse(JSON.stringify(defaultContent(NOW)));
  v1.v = 1;
  delete v1.story;
  delete v1.video;
  delete v1.dressCode;
  for (const e of v1.events) { delete e.venuePhoto; delete e.directionsNote; delete e.parkingNote; }
  delete v1.sections.story;
  delete v1.sections.video;
  delete v1.sections.dressCode;
  delete v1.sections.venue;
  const upgraded = upgradeV1(v1);
  const fresh = defaultContent(NOW);
  const stripVenue = (e: Record<string, unknown>) => {
    const { venuePhoto: _vp, directionsNote: _dn, parkingNote: _pn, ...rest } = e;
    return rest;
  };
  assert.equal(upgraded.v, 2);
  assert.deepEqual(upgraded.couple, fresh.couple);
  assert.deepEqual(upgraded.events.map(stripVenue), fresh.events.map(stripVenue));
  assert.deepEqual(upgraded.album, fresh.album);
  assert.deepEqual(upgraded.rsvp, fresh.rsvp);
  assert.deepEqual(upgraded.gift, fresh.gift);
  assert.equal(upgraded.story.enabled, false);
  assert.equal(upgraded.video.enabled, false);
  assert.equal(upgraded.dressCode.enabled, false);
  const normalized = normalizeContent(v1);
  assert.equal(normalized.v, 2);
  assert.equal(contentSchema.safeParse(normalized).success, true);
});

test("normalize mirrors the new section toggles onto sections", () => {
  const c = defaultContent(NOW);
  c.story.enabled = true;
  c.story.items = [{ id: "m1", date: "2020-01-01", title: "Lần đầu gặp", body: "", photo: "", alt: "" }];
  const n = normalizeContent(c);
  assert.equal(n.sections.story, true);
  assert.equal(n.sections.video, false);
  assert.equal(n.sections.dressCode, false);
  assert.equal(n.sections.venue, false);
});

test("v2 schema enforces story, dress-code, video and venue limits", () => {
  const item = { id: "m", date: "2020-01-01", title: "T", body: "", photo: "", alt: "" };
  const seven = defaultContent(NOW);
  seven.story = { enabled: true, items: Array.from({ length: MAX_STORY_ITEMS + 1 }, (_, i) => ({ ...item, id: `m${i}` })) };
  assert.equal(contentSchema.safeParse(seven).success, false);

  const colors = defaultContent(NOW);
  colors.dressCode = { enabled: true, title: "Lịch sự", note: "", colors: Array.from({ length: MAX_DRESS_COLORS + 1 }, (_, i) => ({ value: "#ffffff", label: `Màu ${i}` })) };
  assert.equal(contentSchema.safeParse(colors).success, false);

  const badHex = defaultContent(NOW);
  badHex.dressCode = { enabled: false, title: "", note: "", colors: [{ value: "red", label: "Đỏ" }] };
  assert.equal(contentSchema.safeParse(badHex).success, false);

  const badVideo = defaultContent(NOW);
  badVideo.video = { enabled: true, url: "www.video", posterUrl: "", title: "" };
  assert.equal(contentSchema.safeParse(badVideo).success, false);

  const longTitle = defaultContent(NOW);
  longTitle.story = { enabled: true, items: [{ ...item, title: "x".repeat(101) }] };
  assert.equal(contentSchema.safeParse(longTitle).success, false);

  const longBody = defaultContent(NOW);
  longBody.story = { enabled: true, items: [{ ...item, body: "x".repeat(501) }] };
  assert.equal(contentSchema.safeParse(longBody).success, false);

  const longNote = defaultContent(NOW);
  longNote.events[0].directionsNote = "x".repeat(301);
  assert.equal(contentSchema.safeParse(longNote).success, false);
});

test("persistable blanks half-typed video and venue links without mutating the draft", () => {
  const c = defaultContent(NOW);
  c.video = { enabled: true, url: "www.vid", posterUrl: "cdn/x", title: "T" };
  c.events[0].venuePhoto = "photos/place";
  const p = persistable(c);
  assert.equal(p.video.url, "");
  assert.equal(p.video.posterUrl, "");
  assert.equal(p.events[0].venuePhoto, "");
  assert.equal(c.video.url, "www.vid");
  assert.equal(c.events[0].venuePhoto, "photos/place");
  assert.equal(contentSchema.safeParse(p).success, true);
});

test("publishIssues covers the four new sections", () => {
  const base = defaultContent(NOW);
  base.couple.groom.name = "Khoa";
  base.couple.bride.name = "Lan";

  const story = structuredClone(base);
  story.story.enabled = true;
  assert.ok(publishIssues(story).length > 0);
  story.story.items = [{ id: "m1", date: "2020-01-01", title: "Lần đầu gặp", body: "", photo: "", alt: "" }];
  assert.deepEqual(publishIssues(story), []);

  const video = structuredClone(base);
  video.video.enabled = true;
  assert.ok(publishIssues(video).length > 0);
  video.video.url = "https://cdn.example.com/v.mp4";
  assert.ok(publishIssues(video).length > 0);
  video.video.posterUrl = "https://cdn.example.com/p.jpg";
  assert.deepEqual(publishIssues(video), []);

  const dress = structuredClone(base);
  dress.dressCode.enabled = true;
  assert.ok(publishIssues(dress).length > 0);
  dress.dressCode.title = "Lịch sự";
  assert.ok(publishIssues(dress).length > 0);
  dress.dressCode.colors = [{ value: "#1f3a5f", label: "Xanh lam" }];
  assert.deepEqual(publishIssues(dress), []);

  const venue = structuredClone(base);
  venue.sections.venue = true;
  assert.deepEqual(publishIssues(venue), []);
  venue.events.find((e) => e.kind === "reception")!.address = "";
  assert.ok(publishIssues(venue).length > 0);
});
