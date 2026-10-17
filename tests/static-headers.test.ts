import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";

test("cache headers exist for static assets, immutable for hashed chunks and fonts", () => {
  const url = new URL("../public/_headers", import.meta.url);
  assert.ok(existsSync(url), "public/_headers missing");
  const src = readFileSync(url, "utf8");
  for (const path of ["/_next/static/*", "/fonts/*", "/photos/*", "/music/*"]) assert.ok(src.split("\n").includes(path), `${path} block missing`);
  assert.match(src, /\/_next\/static\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
  assert.match(src, /\/fonts\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
});
