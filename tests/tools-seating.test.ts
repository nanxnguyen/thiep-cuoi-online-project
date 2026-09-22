import { test } from "node:test";
import assert from "node:assert/strict";
import { assignGuest, countByTable, unassignGuest, unassignedGuestIds } from "../lib/tools/seating.ts";
import type { Table } from "../lib/tools/seating.ts";

const tables: Table[] = [
  { id: "t1", name: "Bàn 1", capacity: 2 },
  { id: "t2", name: "Bàn 2", capacity: 1 },
];

test("assignGuest seats a guest at a table with room", () => {
  const result = assignGuest({}, "g1", "t1", tables);
  assert.deepEqual(result, { g1: "t1" });
});

test("assignGuest refuses a full table", () => {
  const full = { g1: "t2" };
  assert.equal(assignGuest(full, "g2", "t2", tables), null);
});

test("assignGuest allows re-assigning a guest already at that table (no-op capacity-wise)", () => {
  const state = { g1: "t2" };
  const result = assignGuest(state, "g1", "t2", tables);
  assert.deepEqual(result, { g1: "t2" });
});

test("assignGuest moves a guest between tables, freeing the old seat", () => {
  const state = { g1: "t1", g2: "t1" };
  const result = assignGuest(state, "g1", "t2", tables);
  assert.deepEqual(result, { g1: "t2", g2: "t1" });
  assert.deepEqual(countByTable(result!), { t1: 1, t2: 1 });
});

test("assignGuest returns null for an unknown table", () => {
  assert.equal(assignGuest({}, "g1", "nope", tables), null);
});

test("unassignGuest removes only the given guest", () => {
  const state = { g1: "t1", g2: "t2" };
  assert.deepEqual(unassignGuest(state, "g1"), { g2: "t2" });
});

test("unassignedGuestIds returns guests with no table", () => {
  const state = { g1: "t1" };
  assert.deepEqual(unassignedGuestIds(["g1", "g2", "g3"], state), ["g2", "g3"]);
});
