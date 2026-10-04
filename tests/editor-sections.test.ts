import { test } from "node:test";
import assert from "node:assert/strict";
import { SECTION_GROUPS, completion, isOn, missingReason, toggleOn } from "../lib/editor-sections.ts";
import { defaultContent, sampleContent } from "../lib/content.ts";

const keys = SECTION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

test("section list follows the design's parts plus story, video, dress code and venue", () => {
  assert.deepEqual(keys.slice(0, 18), ["envelope", "template", "couple", "family", "ceremony", "party", "schedule", "countdown", "venue", "dressCode", "story", "album", "video", "music", "rsvp", "guestbook", "gift", "thanks"]);
  assert.deepEqual(SECTION_GROUPS.map((g) => g.label), ["Mở đầu", "Thông tin chính", "Câu chuyện & media", "Tương tác với khách", "Quản lý"]);
  assert.ok(keys.includes("guests") && keys.includes("responses"));
  assert.equal(new Set(keys).size, keys.length);
});

test("an empty draft reports what is missing, a filled one does not", () => {
  const base = defaultContent();
  const empty = { ...base, couple: { ...base.couple, groom: { ...base.couple.groom, name: "" }, bride: { ...base.couple.bride, name: " " } } };
  assert.equal(missingReason("couple", empty), "Thiếu tên cô dâu hoặc chú rể");
  assert.equal(missingReason("couple", base.couple.groom.name && base.couple.bride.name ? base : { ...base, couple: { ...base.couple, groom: { ...base.couple.groom, name: "A" }, bride: { ...base.couple.bride, name: "B" } } }), null);
  assert.equal(missingReason("thanks", { ...empty, thanks: { message: "", messageEn: "" } }), "Chưa có lời cảm ơn");
  assert.ok(completion(empty) < 100);
});

test("switched-off optional sections are never 'missing'", () => {
  const c = defaultContent();
  const off = { ...c, rsvp: { ...c.rsvp, enabled: false, deadline: "" }, gift: { ...c.gift, enabled: false, accounts: [] } };
  assert.equal(missingReason("rsvp", off), null);
  assert.equal(missingReason("gift", off), null);
});

test("completion is a whole percentage between 0 and 100", () => {
  for (const c of [defaultContent(), sampleContent()]) {
    const p = completion(c);
    assert.ok(Number.isInteger(p) && p >= 0 && p <= 100, String(p));
  }
});

test("progress counts the parts that are switched on, as the design's ring does", async () => {
  const { progress, isOn, toggleOn, OPTIONAL } = await import("../lib/editor-sections.ts");
  assert.deepEqual([...OPTIONAL].sort(), ["album", "countdown", "dressCode", "envelope", "gift", "guestbook", "music", "rsvp", "schedule", "story", "thanks", "venue", "video"]);
  const c = sampleContent();
  const all = progress(c);
  assert.equal(all.total, 14);
  const off = toggleOn("schedule", c);
  assert.equal(isOn("schedule", off), false);
  assert.equal(progress(off).total, 13);
  assert.equal(isOn("rsvp", toggleOn("rsvp", c)), false);
  assert.equal(toggleOn("rsvp", c).rsvp.enabled, false);
});

test("envelope, schedule and a one-sided gift report what is missing", () => {
  const c = defaultContent();
  assert.equal(missingReason("envelope", { ...c, envelope: { greeting: " " } }), "Chưa có lời mời");
  assert.equal(missingReason("schedule", { ...c, sections: { ...c.sections, schedule: true }, schedule: [] }), "Chưa có mốc thời gian");
  const oneSide = { ...c, gift: { ...c.gift, enabled: true, accounts: [{ holder: "groom" as const, bankCode: "970436", accountNumber: "1", accountName: "A" }] } };
  assert.equal(missingReason("gift", oneSide), "Chưa đủ số tài khoản hai bên");
});

test("the four new sections toggle, report missing data and stay quiet when off", () => {
  const c = defaultContent();
  for (const key of ["story", "video", "dressCode", "venue"] as const) {
    assert.equal(isOn(key, c), false);
    assert.equal(missingReason(key, c), null);
    assert.equal(isOn(key, toggleOn(key, c)), true);
  }
  const story = toggleOn("story", c);
  assert.equal(story.story.enabled, true);
  assert.equal(story.sections.story, true);
  assert.ok(missingReason("story", story));
  const filled = { ...story, story: { enabled: true, items: [{ id: "m1", date: "2020-05-01", title: "Lần đầu gặp", body: "", photo: "", alt: "" }] } };
  assert.equal(missingReason("story", filled), null);

  const video = toggleOn("video", c);
  assert.equal(video.video.enabled, true);
  assert.equal(video.sections.video, true);
  assert.ok(missingReason("video", video));
  assert.equal(missingReason("video", { ...video, video: { enabled: true, url: "https://cdn.example.com/v.mp4", posterUrl: "", title: "" } }), "Chưa có link video hoặc ảnh bìa");
  assert.equal(missingReason("video", { ...video, video: { enabled: true, url: "https://cdn.example.com/v.mp4", posterUrl: "https://cdn.example.com/p.jpg", title: "" } }), null);

  const dress = toggleOn("dressCode", c);
  assert.equal(dress.dressCode.enabled, true);
  assert.equal(dress.sections.dressCode, true);
  assert.ok(missingReason("dressCode", dress));
  assert.equal(missingReason("dressCode", { ...dress, dressCode: { enabled: true, title: "Lịch sự", note: "", colors: [] } }), "Chưa có tiêu đề hoặc màu gợi ý");
  assert.equal(missingReason("dressCode", { ...dress, dressCode: { enabled: true, title: "Lịch sự", note: "", colors: [{ value: "#24493a", label: "Xanh rêu" }] } }), null);

  const venue = toggleOn("venue", c);
  assert.equal(venue.sections.venue, true);
  assert.equal(missingReason("venue", venue), null);
  const noAddress = { ...venue, events: venue.events.map((e) => (e.kind === "reception" ? { ...e, address: "" } : e)) };
  assert.equal(missingReason("venue", noAddress), "Thiếu nơi đãi tiệc hoặc địa chỉ");
});
