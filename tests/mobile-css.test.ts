import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// docs/superpowers/specs/2026-10-07-mobile-first-design.md §2: phone rules live in max-width blocks at the very end
// of the file that owns the selectors, so they win by order and nothing above them (desktop) changes.
const FILES = ["app/styles/tokens.css", "app/globals.css", "components/invitation/invitation.css", "components/studio/studio.css", "components/studio/panels.css", "components/account/account.css", "components/home/home.css", "components/templates/gallery.css", "app/templates/[id]/detail.css", "app/demo/demo.css", "components/marketing/marketing.css", "app/seo.css", "app/bang-gia/pricing.css", "app/ung-ho/donate.css", "app/thiet-ke-thiep-rieng/custom.css", "app/tro-giup/help.css", "components/tools/tools.css", "components/blog/blog.css"];
const MOBILE = /^@media\s*\(max-width:\s*(767|479|359)px\)$/;

type Block = { prelude: string; body: string };
function blocks(css: string): Block[] {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Block[] = [];
  let depth = 0;
  let from = 0;
  let start = 0;
  let prelude = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === "{") {
      if (depth === 0) {
        prelude = src.slice(from, i).trim();
        start = i + 1;
      }
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0) {
        out.push({ prelude, body: src.slice(start, i) });
        from = i + 1;
      }
    } else if (c === ";" && depth === 0) from = i + 1;
  }
  return out;
}
const trailingMobile = (css: string): Block[] => {
  const all = blocks(css);
  let i = all.length;
  while (i > 0 && MOBILE.test(all[i - 1].prelude.replace(/\s+/g, " "))) i--;
  return all.slice(i);
};
const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

test("every file of the phase ends with its phone blocks, including a 767px one", () => {
  const bad = FILES.filter((f) => !trailingMobile(readFileSync(f, "utf8")).some((b) => b.prelude.includes("767px")));
  assert.deepEqual(bad, []);
});

test("phone rules never switch on pointer or hover capability", () => {
  const css = [...walk("app"), ...walk("components")].filter((f) => f.endsWith(".css"));
  assert.deepEqual(css.filter((f) => /\((any-)?pointer\s*:|hover:\s*none/.test(readFileSync(f, "utf8"))), []);
});

test("invitation phone rules only touch the real guest page, never the Studio preview", () => {
  const f = "components/invitation/invitation.css";
  if (!FILES.includes(f)) return;
  const selectors = trailingMobile(readFileSync(f, "utf8")).flatMap((b) => blocks(b.body).flatMap((r) => r.prelude.split(",").map((s) => s.trim())));
  assert.deepEqual(selectors.filter((s) => !s.startsWith('.inv-stage[data-mode="live"]')), []);
});

test("phone tokens exist", () => {
  const root = trailingMobile(readFileSync("app/styles/tokens.css", "utf8")).map((b) => b.body).join("");
  for (const t of ["--m-gutter", "--m-section-y", "--m-display-xl", "--m-display-l", "--m-h2", "--m-btn-h", "--m-tap", "--m-input-fs", "--m-header-h"]) assert.match(root, new RegExp(`${t}:`));
});
