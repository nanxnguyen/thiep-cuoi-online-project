import { test } from "node:test";
import assert from "node:assert/strict";
import { PUBLIC_ROUTES } from "../lib/route-inventory.ts";
import { templates } from "../lib/templates.ts";

test("demo route is public and covers every invitation family", () => {
  assert.ok(PUBLIC_ROUTES.includes("/demo"));
  assert.deepEqual(
    [...new Set(templates.map((template) => template.family))].sort(),
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  );
});
