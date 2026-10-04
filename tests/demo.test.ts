import { test } from "node:test";
import assert from "node:assert/strict";
import { PUBLIC_ROUTES } from "../lib/route-inventory.ts";
import { templates } from "../lib/templates.ts";

test("demo route is public and covers every invitation family", () => {
  assert.ok(PUBLIC_ROUTES.includes("/demo"));
  assert.deepEqual(
    [...new Set(templates.map((template) => template.family))].sort(),
    ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "cafe-card", "champagne-line", "chibi-story", "color-block", "constellation", "duotone-script", "edge-invite", "floating-card", "floral-monogram", "glasshouse", "ink-wash", "kinetic-type", "lotus-scroll", "midnight-bloom", "mono-contact", "octagon-frame", "overlap-rings", "paper-cut", "pearl-arch", "pennant", "phoenix-fold", "porcelain-blue", "pressed-garden", "rose-cluster", "route-map", "silk-knot", "split-portrait", "story-journal", "venue-sketch", "white-orchid"],
  );
});
