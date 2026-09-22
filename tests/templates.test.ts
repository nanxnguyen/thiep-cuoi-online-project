import { test } from "node:test";
import assert from "node:assert/strict";
import { templates, getTemplate, DEFAULT_TEMPLATE_ID, archetypes, FONT_VARS } from "../lib/templates.ts";

const channel = (v: number) => {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

test("ten templates with unique ids and names", () => {
  assert.equal(templates.length, 10);
  assert.equal(new Set(templates.map((t) => t.id)).size, 10);
  assert.equal(new Set(templates.map((t) => t.name)).size, 10);
});

test("default template exists and getTemplate misses cleanly", () => {
  assert.ok(getTemplate(DEFAULT_TEMPLATE_ID));
  assert.equal(getTemplate("nope"), undefined);
});

test("every archetype is used at least once", () => {
  for (const a of archetypes) assert.ok(templates.some((t) => t.archetype === a), a);
});

test("palettes are hex and every text pair meets WCAG AA 4.5:1", () => {
  type Key = keyof (typeof templates)[number]["palette"];
  const pairs: [Key, Key][] = [
    ["ink", "bg"],
    ["ink", "surface"],
    ["muted", "bg"],
    ["muted", "surface"],
    ["accent", "bg"],
    ["accentInk", "accent"],
  ];
  for (const t of templates) {
    for (const v of Object.values(t.palette)) assert.match(v, /^#[0-9a-f]{6}$/i, t.id);
    for (const [fg, bg] of pairs) assert.ok(ratio(t.palette[fg], t.palette[bg]) >= 4.5, `${t.id} ${fg}/${bg}`);
  }
});

test("fonts reference known keys", () => {
  for (const t of templates) for (const f of Object.values(t.fonts)) assert.ok(f in FONT_VARS, `${t.id} ${f}`);
});
