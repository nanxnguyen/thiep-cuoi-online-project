import { test } from "node:test";
import assert from "node:assert/strict";
import { archetypes, templates } from "../lib/templates.ts";
import { archetypeCopy, relatedTemplates, templateFit } from "../lib/template-copy.ts";

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

test("every template has its own fit copy, no orphans, no duplicates", () => {
  assert.deepEqual(Object.keys(templateFit).sort(), templates.map((t) => t.id).sort());
  const texts = Object.values(templateFit);
  assert.equal(new Set(texts).size, texts.length);
  for (const t of templates) {
    const n = words(templateFit[t.id]);
    assert.ok(n >= 25 && n <= 80, `${t.id}: ${n} words`);
    assert.ok(templateFit[t.id].startsWith(t.name), `${t.id} should open with its name`);
  }
});

test("every archetype has copy", () => {
  for (const a of archetypes) assert.ok(words(archetypeCopy[a].text) >= 30, a);
});

test("related templates share the archetype, exclude the page itself and are distinct", () => {
  for (const t of templates) {
    const rel = relatedTemplates(t.id);
    assert.equal(rel.length, 3, t.id);
    assert.equal(new Set(rel.map((r) => r.id)).size, 3);
    for (const r of rel) {
      assert.equal(r.archetype, t.archetype);
      assert.notEqual(r.id, t.id);
    }
  }
});
