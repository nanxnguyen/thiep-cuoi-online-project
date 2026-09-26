import { test } from "node:test";
import assert from "node:assert/strict";
import { inviteMessages } from "../lib/tools/inviteMessage.ts";

const input = { bride: "Hạ Vy", groom: "Minh Khôi", link: "https://moc.vn/invite/vy-khoi" };

test("inviteMessages gives three messages per tone, each ending with the link", () => {
  for (const tone of ["formal", "friendly"] as const) {
    const list = inviteMessages(tone, input);
    assert.equal(list.length, 3);
    for (const m of list) assert.match(m, /https:\/\/moc\.vn\/invite\/vy-khoi/);
  }
});

test("inviteMessages puts the bride first, like the design", () => {
  assert.match(inviteMessages("formal", input)[0], /của Hạ Vy và Minh Khôi\./);
  assert.match(inviteMessages("friendly", input)[0], /^Ê, Hạ Vy với Minh Khôi cưới rồi nè!/);
});

test("inviteMessages falls back to placeholders for blank fields", () => {
  const [first] = inviteMessages("formal", { bride: " ", groom: "", link: "" });
  assert.match(first, /của cô dâu và chú rể\./);
  assert.match(first, /\[link thiệp\]$/);
});
