import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { designRequestSchema } from "../lib/design-request.ts";

const valid = { name: " Lan ", phone: "0901 234 567", email: "", weddingDate: "", budget: "", details: "Thiệp tối giản màu xanh rêu", referenceLinks: "" };

test("design request accepts a minimal valid payload and trims text", () => {
  const out = designRequestSchema.parse(valid);
  assert.equal(out.name, "Lan");
  assert.equal(out.website, "");
});

test("design request normalizes the wedding date to ISO (iPhone dd/mm/yyyy) and rejects impossible ones", () => {
  assert.equal(designRequestSchema.parse({ ...valid, weddingDate: "09/11/2026" }).weddingDate, "2026-11-09");
  assert.equal(designRequestSchema.parse({ ...valid, weddingDate: "2026-11-09" }).weddingDate, "2026-11-09");
  assert.equal(designRequestSchema.safeParse({ ...valid, weddingDate: "31/02/2026" }).success, false);
});

test("design request rejects bad phone, email, budget and short details", () => {
  assert.equal(designRequestSchema.safeParse({ ...valid, phone: "12345" }).success, false);
  assert.equal(designRequestSchema.safeParse({ ...valid, phone: "+84901234567" }).success, true);
  assert.equal(designRequestSchema.safeParse({ ...valid, email: "not-an-email" }).success, false);
  assert.equal(designRequestSchema.safeParse({ ...valid, budget: "free" }).success, false);
  assert.equal(designRequestSchema.safeParse({ ...valid, details: "ngắn" }).success, false);
});

test("design request route checks origin, bounds the body, rate limits and keeps the service key server-side", () => {
  const source = readFileSync(new URL("../app/api/public/design-requests/route.ts", import.meta.url), "utf8");
  assert.match(source, /assertSameOrigin\(request\)/);
  assert.match(source, /parseJson\(request, designRequestSchema, JSON_MAX_BYTES\)/);
  assert.match(source, /enforceRateLimit\(/);
  assert.doesNotMatch(source, /request\.json\(/);
});
