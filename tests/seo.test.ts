import { test } from "node:test";
import assert from "node:assert/strict";
import { DESCRIPTION_MAX, DESCRIPTION_MIN, SEO_PAGES, TITLE_MAX, TITLE_SUFFIX, templateSeo } from "../lib/seo.ts";
import { PUBLIC_ROUTES } from "../lib/route-inventory.ts";
import { templates } from "../lib/templates.ts";
import { blogPostSeo, posts } from "../lib/blog/index.ts";

const PRIVATE = new Set(["/account", "/studio"]);
const fullTitle = (path: string, title: string) => (path === "/" ? title : title + TITLE_SUFFIX);

const entries = [
  ...Object.entries(SEO_PAGES).map(([path, p]) => [path, p.title, p.description] as const),
  ...templates.map((t) => [`/templates/${t.id}`, templateSeo(t).title, templateSeo(t).description] as const),
  ...posts.map((p) => [`/blog/${p.slug}`, blogPostSeo(p).title, blogPostSeo(p).description] as const),
];

test("every public indexable route has an SEO entry, and no private route does", () => {
  const expected = PUBLIC_ROUTES.filter((r) => !PRIVATE.has(r) && !r.startsWith("/templates/") && !r.startsWith("/blog/"));
  assert.deepEqual([...expected].sort(), Object.keys(SEO_PAGES).sort());
});

test("titles fit 60 chars with the site suffix, descriptions are 70-160 chars", () => {
  for (const [path, title, description] of entries) {
    assert.ok(fullTitle(path, title).length <= TITLE_MAX, `${path} title ${fullTitle(path, title).length} chars`);
    assert.ok(description.length >= DESCRIPTION_MIN && description.length <= DESCRIPTION_MAX, `${path} description ${description.length} chars`);
  }
});

test("titles and descriptions are unique across pages", () => {
  const titles = entries.map((e) => e[1]);
  const descriptions = entries.map((e) => e[2]);
  assert.equal(new Set(titles).size, titles.length);
  assert.equal(new Set(descriptions).size, descriptions.length);
});
