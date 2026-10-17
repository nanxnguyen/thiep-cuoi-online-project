import assert from "node:assert/strict";
import test from "node:test";
import { workerBudget } from "../scripts/check-worker-size.mjs";

const MiB = 1024 * 1024;

test("budget passes below 2.4 MiB gzip and fails above", () => {
  assert.equal(workerBudget(8 * MiB, 1.9 * MiB).ok, true);
  assert.equal(workerBudget(9 * MiB, 2.5 * MiB).ok, false);
});

test("message names both numbers so a failing build is actionable", () => {
  const { message } = workerBudget(8 * MiB, 2.6 * MiB);
  assert.match(message, /2\.6/);
  assert.match(message, /2\.4/);
});
