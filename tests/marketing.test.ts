import { test } from "node:test";
import assert from "node:assert/strict";
import { helpGroups, allHelpItems } from "../lib/marketing/help.ts";

test("help groups have unique ids and no empty question or answer", () => {
  assert.equal(new Set(helpGroups.map((g) => g.id)).size, helpGroups.length);
  for (const g of helpGroups) assert.ok(g.items.length >= 2, g.id);
  const all = allHelpItems();
  assert.equal(new Set(all.map((i) => i.q)).size, all.length, "duplicate question");
  for (const i of all) assert.ok(i.q.trim().length > 5 && i.a.trim().length > 20, i.q);
});
