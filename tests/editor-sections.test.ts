import { test } from "node:test";
import assert from "node:assert/strict";
import { SECTION_GROUPS, completion, missingReason } from "../lib/editor-sections.ts";
import { defaultContent, sampleContent } from "../lib/content.ts";

const keys = SECTION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

test("section list follows the design's 14 parts plus the owner tools", () => {
  assert.deepEqual(keys.slice(0, 14), ["envelope", "template", "couple", "family", "ceremony", "party", "schedule", "countdown", "album", "music", "rsvp", "guestbook", "gift", "thanks"]);
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
  assert.deepEqual([...OPTIONAL].sort(), ["album", "countdown", "envelope", "gift", "guestbook", "music", "rsvp", "schedule", "thanks"]);
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
