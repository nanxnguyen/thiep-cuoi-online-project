import { test } from "node:test";
import assert from "node:assert/strict";
import { BANKS, bankName } from "../lib/banks.ts";

test("bank bins are unique 6-digit codes with names", () => {
  const bins = BANKS.map((b) => b.bin);
  assert.equal(new Set(bins).size, bins.length);
  for (const b of BANKS) {
    assert.match(b.bin, /^\d{6}$/);
    assert.ok(b.name.length > 0);
  }
});

test("bankName resolves a bin and falls back to the raw code", () => {
  assert.equal(bankName("970436"), "Vietcombank");
  assert.equal(bankName("999999"), "999999");
});
