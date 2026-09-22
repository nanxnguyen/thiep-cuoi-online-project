import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInviteMessages } from "../lib/tools/inviteMessage.ts";

const full = { groom: "Nam", bride: "Lan", date: "2026-11-08", link: "https://moc.wedding/invite/nam-lan", guestName: "Chú Ba" };

test("buildInviteMessages includes date and link when given", () => {
  const { friendly, formal } = buildInviteMessages(full);
  assert.match(friendly, /Chú Ba ơi/);
  assert.match(friendly, /Chủ nhật, 08\/11\/2026/);
  assert.match(friendly, /https:\/\/moc\.wedding\/invite\/nam-lan/);
  assert.match(formal, /Kính gửi Chú Ba/);
  assert.match(formal, /Chủ nhật, 08\/11\/2026/);
});

test("buildInviteMessages drops the link sentence entirely when link is empty", () => {
  const { friendly, formal } = buildInviteMessages({ ...full, link: "" });
  assert.doesNotMatch(friendly, /xem thiệp/);
  assert.doesNotMatch(formal, /xem thiệp/);
  assert.doesNotMatch(friendly, /tại:\s*\./);
});

test("buildInviteMessages drops the date clause when date is empty or invalid", () => {
  const { friendly } = buildInviteMessages({ ...full, date: "" });
  assert.doesNotMatch(friendly, / vào \./);
  assert.match(friendly, /tổ chức lễ cưới\./);
  const { friendly: f2 } = buildInviteMessages({ ...full, date: "not-a-date" });
  assert.doesNotMatch(f2, / vào \./);
});

test("buildInviteMessages falls back to a generic greeting when guestName is empty", () => {
  const { friendly, formal } = buildInviteMessages({ ...full, guestName: "" });
  assert.match(friendly, /^Cả nhà ơi, /);
  assert.match(formal, /^Kính gửi,/);
});

test("buildInviteMessages falls back to generic couple names when both are empty", () => {
  const { friendly } = buildInviteMessages({ ...full, groom: "", bride: "" });
  assert.match(friendly, /chú rể và cô dâu tổ chức lễ cưới/);
});
