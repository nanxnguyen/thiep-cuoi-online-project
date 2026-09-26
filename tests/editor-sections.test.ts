import { test } from "node:test";
import assert from "node:assert/strict";
import { SECTION_GROUPS, completion, missingReason } from "../lib/editor-sections.ts";
import { defaultContent, sampleContent } from "../lib/content.ts";

const keys = SECTION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

test("section list follows the design's 14 parts plus the owner tools", () => {
  assert.deepEqual(keys.slice(0, 14), ["envelope", "template", "couple", "family", "ceremony", "party", "schedule", "countdown", "album", "music", "rsvp", "guestbook", "gift", "thanks"]);
  assert.ok(keys.includes("guests") && keys.includes("responses"));
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(SECTION_GROUPS.flatMap((g) => g.items).find((item) => item.key === "envelope")?.blocked, undefined);
  assert.equal(SECTION_GROUPS.flatMap((g) => g.items).find((item) => item.key === "schedule")?.blocked, undefined);
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
