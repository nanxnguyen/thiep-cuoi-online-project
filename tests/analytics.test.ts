import assert from "node:assert/strict";
import test from "node:test";
import { visitorHash, viewCookieValue } from "../lib/server/analytics.ts";

test("visitor hash is stable for a cookie and never contains the raw visitor value", async () => {
  const value = viewCookieValue("visitor-1");
  const first = await visitorHash(value, "secret");
  const second = await visitorHash(value, "secret");
  assert.equal(first, second);
  assert.notEqual(first, value);
  assert.match(first, /^[0-9a-f]{64}$/);
});
