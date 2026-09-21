import { test } from "node:test";
import assert from "node:assert/strict";
import { features, getFeature, featureDescription } from "../lib/marketing/features.ts";
import { helpGroups, allHelpItems } from "../lib/marketing/help.ts";
import { posts, getPost, postsByDate, formatPostDate } from "../lib/marketing/blog.ts";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

test("feature slugs are unique URL-safe and every related slug exists", () => {
  assert.equal(new Set(features.map((f) => f.slug)).size, features.length);
  for (const f of features) {
    assert.match(f.slug, SLUG);
    assert.ok(f.steps.length >= 2 && f.points.length >= 2 && f.faq.length >= 1, f.slug);
    assert.ok(f.related.length >= 1, f.slug);
    for (const r of f.related) {
      assert.ok(getFeature(r), `${f.slug} -> ${r}`);
      assert.notEqual(r, f.slug, `${f.slug} links to itself`);
    }
  }
});

test("help groups have unique ids and no empty question or answer", () => {
  assert.equal(new Set(helpGroups.map((g) => g.id)).size, helpGroups.length);
  for (const g of helpGroups) assert.ok(g.items.length >= 2, g.id);
  const all = allHelpItems();
  assert.equal(new Set(all.map((i) => i.q)).size, all.length, "duplicate question");
  for (const i of all) assert.ok(i.q.trim().length > 5 && i.a.trim().length > 20, i.q);
});

test("posts have unique slugs, valid dates, non-empty bodies and valid related features", () => {
  assert.equal(new Set(posts.map((p) => p.slug)).size, posts.length);
  for (const p of posts) {
    assert.match(p.slug, SLUG);
    assert.match(p.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!Number.isNaN(new Date(p.date).getTime()), p.slug);
    assert.ok(p.title.length <= 90, `${p.slug} title too long for a search result`);
    assert.ok(p.description.length >= 60 && p.description.length <= 200, `${p.slug} description length`);
    assert.ok(p.blocks.length >= 5 && p.blocks.some((b) => b.type === "h2"), p.slug);
    for (const r of p.related) assert.ok(getFeature(r), `${p.slug} -> ${r}`);
  }
  assert.ok(getPost(posts[0].slug));
  assert.equal(getPost("nope"), undefined);
  const dates = postsByDate().map((p) => p.date);
  assert.deepEqual(dates, [...dates].sort().reverse());
});

test("feature meta descriptions fit a search result", () => {
  for (const f of features) {
    const d = featureDescription(f);
    assert.ok(d.length >= 60 && d.length <= 161, `${f.slug}: ${d.length}`);
    assert.ok(d.startsWith(f.tagline), f.slug);
  }
});

test("post dates format in Vietnamese without shifting the day", () => {
  assert.match(formatPostDate("2026-09-21"), /21 tháng 9,? 2026/);
  assert.match(formatPostDate("2026-01-01"), /1 tháng 1,? 2026/);
});
