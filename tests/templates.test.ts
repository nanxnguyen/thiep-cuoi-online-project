import { test } from "node:test";
import assert from "node:assert/strict";
import { templates, getTemplate, getPalette, DEFAULT_TEMPLATE_ID, archetypes, FONT_VARS } from "../lib/templates.ts";

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

test("design catalog has sixteen distinct names and ten cover families", () => {
  assert.equal(templates.length, 16);
  assert.equal(new Set(templates.map((t) => t.id)).size, 16);
  assert.equal(new Set(templates.map((t) => t.name)).size, 16);
  assert.equal(new Set(templates.map((t) => t.family)).size, 10);
  assert.deepEqual(templates.slice(0, 3).map((t) => t.name), ["Song Hỷ", "Nét Mực", "Hoa Nhài"]);
});

test("published legacy template IDs resolve to their new visual families", () => {
  assert.equal(getTemplate("lua-son")?.name, "Song Hỷ");
  assert.equal(getTemplate("gallery-noir")?.name, "Bìa Báo");
  assert.equal(getTemplate("thanh-ngoc")?.family, "J");
});

test("selected palette is resolved per template and invalid/old key falls back to first", () => {
  const songHy = getTemplate("song-hy")!;
  assert.equal(getPalette(songHy, "xanh").bg, "#24493a");
  assert.equal(getPalette(songHy, "unknown").bg, getPalette(songHy, "").bg);
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

test("every cover family has a layout description", async () => {
  const { familyLayout, templates: all } = await import("../lib/templates.ts");
  for (const t of all) assert.ok(familyLayout[t.family], `familyLayout missing for ${t.family}`);
});
