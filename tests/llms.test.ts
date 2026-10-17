import { test } from "node:test";
import assert from "node:assert/strict";
import { llmsTxt } from "../lib/llms.ts";
import { SEO_PAGES } from "../lib/seo.ts";
import { templates } from "../lib/templates.ts";
import { posts } from "../lib/blog/index.ts";

test("llms.txt lists every indexable page, template and post with absolute URLs and no private routes", () => {
  const txt = llmsTxt("https://x.vn");
  assert.match(txt, /^# MỘC Wedding\n\n> /);
  for (const path of Object.keys(SEO_PAGES).filter((p) => p !== "/")) assert.ok(txt.includes(`(https://x.vn${path})`), path);
  for (const t of templates) assert.ok(txt.includes(`(https://x.vn/templates/${t.id})`), t.id);
  for (const p of posts) assert.ok(txt.includes(`(https://x.vn/blog/${p.slug})`), p.slug);
  assert.doesNotMatch(txt, /\]\(https:\/\/x\.vn\/(studio|account|invite)/);
});
