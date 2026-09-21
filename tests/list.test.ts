import { test } from "node:test";
import assert from "node:assert/strict";
import { move, newId, removeAt, updateAt } from "../lib/list.ts";

test("move shifts an item and never mutates the input", () => {
  const list = ["a", "b", "c", "d"];
  assert.deepEqual(move(list, 0, 2), ["b", "c", "a", "d"]);
  assert.deepEqual(move(list, 3, 1), ["a", "d", "b", "c"]);
  assert.deepEqual(move(list, 1, 2), ["a", "c", "b", "d"]);
  assert.deepEqual(list, ["a", "b", "c", "d"]);
});

test("move is a no-op copy for the same or out-of-range positions", () => {
  const list = ["a", "b", "c"];
  for (const [from, to] of [[1, 1], [-1, 0], [0, -1], [3, 0], [0, 3]] as const) {
    const next = move(list, from, to);
    assert.deepEqual(next, list);
    assert.notEqual(next, list);
  }
});

test("removeAt drops one item and never mutates the input", () => {
  const list = ["a", "b", "c"];
  assert.deepEqual(removeAt(list, 1), ["a", "c"]);
  assert.deepEqual(removeAt(list, 0), ["b", "c"]);
  assert.deepEqual(removeAt(list, 2), ["a", "b"]);
  assert.deepEqual(removeAt(list, 9), ["a", "b", "c"]);
  assert.deepEqual(list, ["a", "b", "c"]);
});

test("updateAt merges a patch into one item and keeps the others by reference", () => {
  const first = { id: "1", title: "Lễ", venue: "" };
  const second = { id: "2", title: "Tiệc", venue: "" };
  const list = [first, second];
  const next = updateAt(list, 1, { venue: "Hoa Sen" });
  assert.deepEqual(next, [first, { id: "2", title: "Tiệc", venue: "Hoa Sen" }]);
  assert.equal(next[0], first);
  assert.deepEqual(second, { id: "2", title: "Tiệc", venue: "" });
  assert.deepEqual(updateAt(list, 5, { venue: "x" }), list);
});

test("newId is 8 hex characters and does not repeat", () => {
  const ids = new Set(Array.from({ length: 200 }, () => newId()));
  assert.equal(ids.size, 200);
  for (const id of ids) assert.match(id, /^[0-9a-f]{8}$/);
});
