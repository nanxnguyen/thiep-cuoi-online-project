import { test } from "node:test";
import assert from "node:assert/strict";
import { siteUrl } from "../lib/site.ts";

test("siteUrl prefers the explicit domain, then Vercel's, then localhost, without a trailing slash", () => {
  assert.equal(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://moc.vn/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }), "https://moc.vn");
  assert.equal(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "moc.vercel.app" }), "https://moc.vercel.app");
  assert.equal(siteUrl({ NEXT_PUBLIC_SITE_URL: "" }), "http://localhost:3000");
});
