import { test } from "node:test";
import assert from "node:assert/strict";
import { features, getFeature, featureDescription } from "../lib/marketing/features.ts";
import { helpGroups, allHelpItems } from "../lib/marketing/help.ts";

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

test("feature meta descriptions fit a search result", () => {
  for (const f of features) {
    const d = featureDescription(f);
    assert.ok(d.length >= 60 && d.length <= 161, `${f.slug}: ${d.length}`);
    assert.ok(d.startsWith(f.tagline), f.slug);
  }
});

test("every feature has an illustration tile", async () => {
  const { featureArt, features } = await import("../lib/marketing/features.ts");
  for (const f of features) assert.ok(featureArt[f.slug], `featureArt missing for ${f.slug}`);
  assert.equal(Object.keys(featureArt).length, features.length);
});
