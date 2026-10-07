import { test } from "node:test";
import assert from "node:assert/strict";
import { siteUrl } from "../lib/site.ts";

test("siteUrl prefers the explicit domain, then Vercel's, then localhost, without a trailing slash", () => {
  assert.equal(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://moc.vn/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }), "https://moc.vn");
  assert.equal(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "moc.vercel.app" }), "https://moc.vercel.app");
  assert.equal(siteUrl({ NEXT_PUBLIC_SITE_URL: "" }), "http://localhost:3000");
});

import { readFileSync } from "node:fs";
import { THEME_COLOR } from "../lib/site.ts";

test("the browser bar matches the ivory paper token", () => {
  const tokens = readFileSync("app/styles/tokens.css", "utf8");
  assert.equal(`--paper: ${THEME_COLOR};`, tokens.match(/--paper: #[0-9a-f]{6};/)?.[0]);
});

test("the root layout sets the phone viewport without blocking zoom", () => {
  const layout = readFileSync("app/layout.tsx", "utf8");
  assert.match(layout, /export const viewport: Viewport = \{[^}]*themeColor: THEME_COLOR/);
  assert.match(layout, /interactiveWidget: "resizes-content"/);
  assert.doesNotMatch(layout, /maximumScale|userScalable|viewportFit/);
});
