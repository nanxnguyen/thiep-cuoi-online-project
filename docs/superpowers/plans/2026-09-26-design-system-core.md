# MỘC design system core + full design port — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Supersedes** `docs/superpowers/plans/2026-09-26-design-refresh.md`. That plan's "100%" meant route health (HTTP 200, clean console, no overflow). It never verified visual parity (see PROGRESS.md "CHƯA nghiệm thu độ khớp design"). This plan redefines done.

**Goal:** Make the MỘC design system (`design/design.md` + `design/Wedding Design System.dc.html`) the single styling core of the app, then port every `design/*.dc.html` page onto that core until each section/state is matched, deliberately deviated, or blocked on an owner decision.

**Architecture:** Tokens live in one file, `app/styles/tokens.css`. Shared keyframes live in `app/styles/motion.css`. Global primitives stay in `app/globals.css`. All three are imported from `app/layout.tsx` in that order. Page and component CSS may only consume `var(--*)`. A node test (`tests/design-system.test.ts`) pins token values, checks AA contrast on text pairs, and ratchets raw hex out of site CSS/TSX. Page ports come after the core is locked (owner order: **design system first, then HTML → app**).

**Tech Stack:** Next.js 16 App Router, React 19, plain CSS custom properties, `next/font/google`, Node 22 `node --test` (type-stripping), Playwright MCP for end-of-phase QA only.

**Spec:** `design/README.md` §6, `design/design.md`, `design/Wedding Design System.dc.html` (primitive scales `FAM`, semantic tokens, type scale `TYPE`, `SPACES`, `radii`). Page sources are `design/*.dc.html`.

## Global Constraints

- `design/` is **read-only source**. Never edit it. Its `CLAUDE.md` README rule applies only to that folder.
- Ignore `design/Stock Design System.dc.html`, `design/stock-tokens.*` (README: not for MỘC), `design/Mau Thiep.dc.html` (v1), `design/support.js` and `design/image-slot.js`.
- Keep URLs, query params (`?to=`, `?g=`, `?lang=`, `#k=`), APIs, localStorage keys (`moc.invitations.v1`) and `content.v = 1` stable.
- Template palettes (`lib/templates.ts`, `components/invitation/arch-*.css`, `design-cover.css`) are **not** site tokens. The hex guard does not touch them.
- **Legibility beats fidelity.** Any design value that fails WCAG AA for text is swapped, and the swap is recorded in the deviation table below.
- Keep old token names as aliases, so the ~7k lines of existing CSS keep working while they are migrated.
- No new dependency. `next/font` is already the font loader.
- Before editing Next code, read the relevant guide in `node_modules/next/dist/docs/`.
- Gate per task: `npm test`, `npm run typecheck`. Gate per phase: add `npm run build`. Heavy runs go **sequentially** (owner request).
- No `git commit` by the agent (permission layer blocks it). Hand the owner the commands.
- Browser QA runs once per phase, at the end, at 390px and 1280px. It is never per task.
- After every meaningful step, update `PROGRESS.md` (status, dated log line with verification, and the "▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY" pointer).

## Measured source facts (2026-09-26)

- Colour frequency across `design/*.dc.html`: `#a3161c` 201, `#1a1412` 200, `#8a7d72` 142, `#5e534b` 128, `#ddd2c4` 102, `#efe6d9` 72, `#c9a86a` 68, `#8a6425` 60, `#f8f4ee` 51, `#7d0f14` 48, `#8e1b1f` 33, `#f4f0e9` 25, `#e0d5c6` 25, `#f1e7d6` 24, `#e8dfd3` 22, `#24493a` 22, `#1c1012` 21, `#e0bb74` 17.
- Fonts: Playfair Display 140 uses, Cormorant Garamond 57 (13 pages, including Trang Chu, Tinh Nang, Tai Khoan), Be Vietnam Pro, Great Vibes 13 (8 pages). Great Vibes **has** a `vietnamese` subset in next/font.
- Design headings are weight **400** (h1/h2) and **500** (h3). The app currently uses 600.
- Current app drift: `--gold #d9b45f` (design `#c9a86a`), `--gold-deep #8a6420` (`#8a6425`), `--night #1a0c0d` (`#1c1012`), `--on-dark #f6ecd6` (`#f1e7d6`), `--surface #fffdf9` (`#ffffff`), radius 10/16/20 (design 8/14/24/999), `--wrap 1200px` (design 1280px).
- Raw hex outside tokens: CSS in 12 files (globals 36, home 27, pricing 17, blog 16, help 16, account 15, features 12, panels 11, studio 9, detail 7, marketing 4, gallery 2). TSX in 4 files (`app/tinh-nang/page.tsx`, `app/blog/BlogCatalog.tsx`, `app/templates/page.tsx`, `components/templates/GalleryCatalog.tsx`), plus `SaveTheDateTool.tsx` (canvas, allowed).

## Contrast deviations (decided defaults; owner may override)

| Design value | Use in design | Contrast | App value |
|---|---|---|---|
| `#8a7d72` text-faint on `#f8f4ee` | captions, meta (142×) | 3.65:1 ✗ | `--faint: #6b5f57` (ink-600 from the design's own scale, 5.64:1). `#8a7d72` is kept as `--faint-deco` for icons and borders only |
| `#8a7d72` on `#efe6d9` (neutral badge) | "Chưa trả lời" | 3.23:1 ✗ | badge fg `--faint` |
| `#c9a86a` gold text on ivory | italic keywords | 2.06:1 ✗ | `--gold-deep #8a6425` (4.88:1). `#c9a86a` is used only on dark (8.21:1) and for ornaments |

## Owner decisions (defaults applied unless the owner says otherwise)

1. **Blog:** design removed it. **Default:** keep `/blog` with no design source; style it with DS primitives only.
2. **Guestbook moderation** (`moderate`): needs a new BE endpoint and owner UI. **Default:** separate phase, out of scope here.
3. **Music:** design uses a fixed track library (hosted audio + licensing). **Default:** keep URL input, styled like the design list.
4. **AI thank-you suggestions:** **Default:** rotate the 3 preset texts from `Studio Editor v3` `THANKS_PRE`. No LLM call.
5. **Hand font:** **Default:** add Great Vibes as `--hand` for site and marketing use. The template font set (`lib/fonts.ts`, Allura) is unchanged.
6. **`Thiep Mau Day Du` (full sample invitation):** **Default:** no new route. `/templates/[id]` "Xem toàn bộ thiệp" already renders the full sample.
7. **Contrast deviations** in the table above: **Default:** accepted.

---

## PHASE 1 — Design system core (blocks everything else)

### Task 1: Token file + guard test

**Files:**
- Create: `app/styles/tokens.css`
- Modify: `app/globals.css:22-58` (remove the `:root` block; tokens move out)
- Modify: `app/layout.tsx` (import order)
- Test: `tests/design-system.test.ts`

**Interfaces:**
- Produces: CSS custom properties (exact names, used by every later task):
  - scales `--red-{50..950}`, `--gold-{50..950}`, `--ink-{50..950}`
  - semantic `--paper --paper-alt --paper-soft --surface --ink --muted --faint --faint-deco --line --line-strong --accent --accent-hover --accent-deep --accent-soft --gold --gold-deep --gold-light --jade --night --on-dark --on-dark-muted --line-on-dark`
  - status `--ok-bg --ok-fg --warn-bg --warn-fg --neutral-bg --neutral-fg --danger-bg --danger-fg`
  - `--radius-s --radius --radius-l --radius-full`, `--space-1..--space-9`
  - `--shadow-card --shadow-card-hover --shadow-float --shadow-deep`, with aliases `--shadow --shadow-lift`
  - `--display --sans --serif --script --hand`, `--fs-h1 --fs-h2 --fs-h3 --fw-display`
  - `--ease --dur-fast --dur --dur-reveal`, `--wrap --wrap-read --wrap-narrow`
- Produces: `tests/design-system.test.ts` exporting nothing. Its `PENDING` set is the migration ratchet that Phase 2 empties.

- [ ] **Step 1: Write the failing test** `tests/design-system.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const TOKENS = "app/styles/tokens.css";
const tokens = (): Map<string, string> => {
  const css = readFileSync(TOKENS, "utf8");
  return new Map([...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
};

// Values copied from design/Wedding Design System.dc.html + design/design.md; deviations documented in the plan.
const EXPECTED: Record<string, string> = {
  "--paper": "#f8f4ee", "--paper-alt": "#efe6d9", "--paper-soft": "#f4f0e9", "--surface": "#ffffff",
  "--ink": "#1a1412", "--muted": "#5e534b", "--faint": "#6b5f57", "--faint-deco": "#8a7d72",
  "--line": "#e8dfd3", "--line-strong": "#ddd2c4",
  "--accent": "#a3161c", "--accent-hover": "#7d0f14", "--accent-deep": "#8e1b1f",
  "--gold": "#c9a86a", "--gold-deep": "#8a6425", "--gold-light": "#e0bb74",
  "--night": "#1c1012", "--on-dark": "#f1e7d6", "--on-dark-muted": "#a8998c", "--line-on-dark": "#4a3a36",
  "--ok-bg": "#e7eee6", "--ok-fg": "#24493a", "--warn-bg": "#f5efe0", "--warn-fg": "#7a5a22",
  "--neutral-bg": "#efe6d9", "--danger-bg": "#f5e3e1", "--danger-fg": "#8e1b1f",
  "--radius-s": "8px", "--radius": "14px", "--radius-l": "24px", "--radius-full": "999px",
  "--wrap": "1280px",
};

test("tokens match the design system", () => {
  const t = tokens();
  for (const [k, v] of Object.entries(EXPECTED)) assert.equal(t.get(k)?.toLowerCase(), v, k);
  for (const fam of ["red", "gold", "ink"])
    for (const s of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) assert.ok(t.has(`--${fam}-${s}`), `--${fam}-${s}`);
});

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const resolve = (t: Map<string, string>, v: string): string => { const m = /^var\((--[a-z0-9-]+)\)$/.exec(v); return m ? resolve(t, t.get(m[1])!) : v; };

test("site text pairs pass WCAG AA (4.5:1)", () => {
  const t = tokens();
  const pairs: [string, string][] = [
    ["--ink", "--paper"], ["--muted", "--paper"], ["--faint", "--paper"], ["--faint", "--paper-alt"], ["--muted", "--surface"],
    ["--gold-deep", "--paper"], ["--accent", "--paper"], ["--surface", "--accent"], ["--surface", "--accent-hover"],
    ["--on-dark", "--night"], ["--on-dark-muted", "--night"], ["--gold", "--night"],
    ["--ok-fg", "--ok-bg"], ["--warn-fg", "--warn-bg"], ["--neutral-fg", "--neutral-bg"], ["--danger-fg", "--danger-bg"],
  ];
  for (const [fg, bg] of pairs) {
    const r = ratio(resolve(t, t.get(fg)!), resolve(t, t.get(bg)!));
    assert.ok(r >= 4.5, `${fg} on ${bg} = ${r.toFixed(2)}`);
  }
});

// Raw colours belong in tokens.css. Template palettes, canvas drawing and the invitation renderer own theirs.
const ALLOWED = [/^app\/styles\/tokens\.css$/, /^components\/invitation\//, /^components\/tools\/SaveTheDateTool\.tsx$/];
// Migration ratchet: files that still hold raw hex. Phase 2 removes entries; an entry with no hex left fails too.
const PENDING = new Set<string>([
  "app/globals.css", "components/home/home.css", "app/bang-gia/pricing.css", "app/blog/blog.css", "app/tro-giup/help.css",
  "components/account/account.css", "app/tinh-nang/features.css", "components/studio/panels.css", "components/studio/studio.css",
  "app/templates/[id]/detail.css", "components/marketing/marketing.css", "components/templates/gallery.css",
  "app/tinh-nang/page.tsx", "app/blog/BlogCatalog.tsx", "app/templates/page.tsx", "components/templates/GalleryCatalog.tsx",
]);
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const HEX_CSS = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/;
const HEX_TSX = /["'`(\s:]#[0-9a-fA-F]{6}\b/;

test("no raw hex colours outside tokens.css", () => {
  const offenders: string[] = [];
  for (const f of [...walk("app"), ...walk("components")]) {
    const re = f.endsWith(".css") ? HEX_CSS : /\.tsx?$/.test(f) ? HEX_TSX : null;
    if (!re || ALLOWED.some((a) => a.test(f))) continue;
    const has = re.test(readFileSync(f, "utf8"));
    if (has && !PENDING.has(f)) offenders.push(`${f}: raw hex — use a var(--token)`);
    if (!has && PENDING.has(f)) offenders.push(`${f}: clean now — remove it from PENDING`);
  }
  assert.deepEqual(offenders, []);
});
```

- [ ] **Step 2: Run it and confirm it fails.** Run `node --test tests/design-system.test.ts`. Expected: FAIL with `ENOENT ... app/styles/tokens.css`.

- [ ] **Step 3: Create `app/styles/tokens.css`**

```css
/* MỘC design tokens — the one place raw colours live. Source: design/Wedding Design System.dc.html (FAM scales,
   semantic tokens, type/space/radius) + design/design.md. Guarded by tests/design-system.test.ts.
   Deviations from the source (AA contrast) are listed in docs/superpowers/plans/2026-09-26-design-system-core.md. */
:root {
  /* primitive scales */
  --red-50: #fdf2f1; --red-100: #f9dfdd; --red-200: #f0b9b6; --red-300: #e08d88; --red-400: #c85a51; --red-500: #a3161c;
  --red-600: #8e1319; --red-700: #7d0f14; --red-800: #5a1119; --red-900: #3d0a0d; --red-950: #280608;
  --gold-50: #fbf6ea; --gold-100: #f5ead0; --gold-200: #e9d4a3; --gold-300: #dfbf80; --gold-400: #d3a862; --gold-500: #c9a86a;
  --gold-600: #b8893e; --gold-700: #8a6425; --gold-800: #6b4a1a; --gold-900: #4d3512; --gold-950: #2e1f0b;
  --ink-50: #f8f4ee; --ink-100: #f4f0e9; --ink-200: #e8dfd3; --ink-300: #ddd2c4; --ink-400: #b0a498; --ink-500: #8a7d72;
  --ink-600: #6b5f57; --ink-700: #5e534b; --ink-800: #3d342e; --ink-900: #1c1012; --ink-950: #0d0908;

  /* semantic: grounds, text, lines */
  --paper: #f8f4ee;
  --paper-alt: #efe6d9;
  --paper-soft: #f4f0e9;
  --surface: #ffffff;
  --ink: #1a1412;
  --muted: #5e534b;
  --faint: #6b5f57; /* design #8a7d72 fails AA as text; kept below for non-text */
  --faint-deco: #8a7d72;
  --line: #e8dfd3;
  --line-strong: #ddd2c4;

  /* brand */
  --accent: #a3161c;
  --accent-hover: #7d0f14;
  --accent-deep: #8e1b1f;
  --accent-soft: var(--red-100);
  --accent-ink: #fbf3df;
  --gold: #c9a86a; /* ornaments + text on dark only (2:1 on ivory) */
  --gold-deep: #8a6425; /* text-safe gold on light grounds */
  --gold-light: #e0bb74;
  --jade: #24493a;
  --night: #1c1012;
  --oxblood: #4b0e14;
  --on-dark: #f1e7d6;
  --on-dark-muted: #a8998c;
  --line-on-dark: #4a3a36;

  /* status (guest badges, RSVP) */
  --ok-bg: #e7eee6; --ok-fg: #24493a;
  --warn-bg: #f5efe0; --warn-fg: #7a5a22;
  --neutral-bg: #efe6d9; --neutral-fg: var(--faint);
  --danger-bg: #f5e3e1; --danger-fg: #8e1b1f;

  /* legacy tint names still read by existing CSS */
  --tint-gold: #f1e4c3;
  --tint-rose: #f3d9d2;
  --tint-jade: #d8e7de;
  --tint-ink: #e9e2d6;
  --lilac: var(--tint-gold);
  --peach: var(--tint-rose);
  --mint: var(--tint-jade);
  --sky: var(--tint-ink);

  /* shape + space */
  --radius-s: 8px;
  --radius: 14px;
  --radius-l: 24px;
  --radius-full: 999px;
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 20px;
  --space-6: 24px; --space-7: 32px; --space-8: 48px; --space-9: 64px;
  --wrap: 1280px;
  --wrap-read: 1180px;
  --wrap-narrow: 720px;

  /* elevation */
  --shadow-card: 0 12px 32px -14px rgb(26 20 18 / 0.3);
  --shadow-card-hover: 0 30px 50px -24px rgb(26 20 18 / 0.45);
  --shadow-float: 0 18px 36px -18px rgb(26 20 18 / 0.35);
  --shadow-deep: 0 40px 80px -40px rgb(0 0 0 / 0.8);
  --shadow: var(--shadow-card);
  --shadow-lift: var(--shadow-card-hover);

  /* type */
  --display: var(--font-display), "Times New Roman", serif;
  --sans: var(--font-sans), system-ui, sans-serif;
  --serif: var(--font-display), Georgia, serif;
  --script: var(--font-script), Georgia, serif;
  --hand: var(--font-hand), cursive;
  --fs-h1: clamp(38px, 5.6vw, 96px);
  --fs-h2: clamp(32px, 4.4vw, 60px);
  --fs-h3: 22px;
  --fw-display: 400;

  /* motion */
  --ease: cubic-bezier(0.2, 0.7, 0.2, 1);
  --dur-fast: 200ms;
  --dur: 300ms;
  --dur-reveal: 900ms;

  /* ornaments (gold lattice, drawn for MỘC) */
  --lattice-soft: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Cpath d='M28 0 56 28 28 56 0 28Z' fill='none' stroke='%23b8892f' stroke-opacity='.16'/%3E%3Cpath d='M28 14 42 28 28 42 14 28Z' fill='none' stroke='%23b8892f' stroke-opacity='.09'/%3E%3C/svg%3E");
  --lattice: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Cpath d='M28 0 56 28 28 56 0 28Z' fill='none' stroke='%23c9a86a' stroke-opacity='.2'/%3E%3Cpath d='M28 14 42 28 28 42 14 28Z' fill='none' stroke='%23c9a86a' stroke-opacity='.12'/%3E%3C/svg%3E");
}
```

- [ ] **Step 4: Remove the old `:root { … }` block from `app/globals.css`** (currently lines 22–58). In `app/layout.tsx`, add `import "./styles/tokens.css";` **before** `import "./globals.css";`.
- [ ] **Step 5: Run `node --test tests/design-system.test.ts`.** Expected: PASS on all 3 tests. `app/globals.css` is still in `PENDING`, so the hex test passes. Then run `npm test && npm run typecheck`.
- [ ] **Step 6:** Update PROGRESS.md with a log line and a pointer to Task 2. Commit commands for the owner:

```bash
git add app/styles/tokens.css app/globals.css app/layout.tsx tests/design-system.test.ts
git commit -m "feat(design): extract MỘC design tokens into app/styles/tokens.css with guard test"
```

### Task 2: Fonts — script + hand roles, design heading weights

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (h1–h3 rules)

- [ ] **Step 1:** Read `node_modules/next/dist/docs/` → the font optimization guide. Confirm the `variable` + `preload` options.
- [ ] **Step 2:** In `app/layout.tsx`, add two loaders. Set `preload: false` so a page only fetches them if it renders them:

```ts
import { Be_Vietnam_Pro, Cormorant_Garamond, Great_Vibes, Playfair_Display } from "next/font/google";
const script = Cormorant_Garamond({ subsets: ["latin", "vietnamese"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-script", preload: false });
const hand = Great_Vibes({ subsets: ["latin", "vietnamese"], weight: "400", variable: "--font-hand", preload: false });
// <html className={`${sans.variable} ${display.variable} ${script.variable} ${hand.variable}`}>
```

- [ ] **Step 3:** In `app/globals.css`, change the heading rules:
  - `h1,h2,h3 { font-weight: var(--fw-display); }`
  - `h1 { font-size: var(--fs-h1); line-height: 1.05 }`
  - `h2 { font-size: var(--fs-h2) }`
  - `h3 { font-size: var(--fs-h3); font-weight: 500 }`
  - Add utility classes `.script { font-family: var(--script); font-style: italic; }` and `.hand { font-family: var(--hand); font-weight: 400; }`.
- [ ] **Step 4:** Run `npm test && npm run typecheck && npm run build:next`. Expected: PASS. The build log lists no font errors.

### Task 3: Motion core

**Files:**
- Create: `app/styles/motion.css`
- Modify: `app/layout.tsx` (import after `globals.css`)
- Modify: `app/globals.css` (move `@keyframes foil`/`rise` and the reduced-motion block out)
- Modify: `components/home/home.css`, `app/bang-gia/pricing.css`, `app/templates/[id]/detail.css`, `components/account/account.css` (drop duplicated keyframes and use the shared names)

- [ ] **Step 1:** Create `app/styles/motion.css`:
  - Put in the design keyframe set that site pages use: `fadeUp`, `fadeIn`, `popIn`, `floaty`, `heart`, `shimmer`, `spinSlow`, `marqueeL`, `marqueeR`, `foil`, `rise`. Keep invitation-only keyframes (`inv-*`) in `components/invitation/`.
  - Put in utility classes `.anim-floaty`, `.anim-heart`, `.anim-shimmer`, `.anim-spin-slow`, `.marquee`, with `.marquee:hover { animation-play-state: paused }`, all using `var(--ease)` and `var(--dur*)`.
  - Add the single global `@media (prefers-reduced-motion: reduce)` block moved from `globals.css`.
- [ ] **Step 2:** Replace the page-local keyframes `pricing-shimmer` → `shimmer`, `template-bob` → `floaty`, `hero-card-rise`/`float-chip` → shared names where the curve is identical. Keep a local keyframe only when its curve is unique, and note why in a comment.
- [ ] **Step 3:** Reuse the existing `components/invitation/client/Reveal.tsx` and `components/motion/Motion.tsx` `FadeUp` for reveal-on-scroll. **Do not add a third reveal implementation.**
- [ ] **Step 4:** Run `npm test && npm run typecheck`.

### Task 4: Primitives on tokens + missing primitives

**Files:**
- Modify: `app/globals.css` (primitives section, footer, header, `.foil`)
- Test: `tests/design-system.test.ts` (remove `app/globals.css` from `PENDING`)

- [ ] **Step 1:** Remove `"app/globals.css"` from `PENDING`. Run the test. Expected: FAIL listing `app/globals.css: raw hex`.
- [ ] **Step 2:** Rewrite each raw hex in `globals.css` to a token. Examples: footer `#f1e7d6` → `var(--on-dark)`, `#c9a86a` → `var(--gold)`, `#a3161c` → `var(--accent)`, `#c01d24` hover → `var(--accent-hover)`, `.foil` gradient stops → `var(--gold-700) var(--gold-400) var(--gold-600) var(--gold-200)`.
- [ ] **Step 3:** Align the existing primitives to design.md §7:
  - `.button-primary`/`.nav-cta`: `background: var(--accent)`, `border-radius: var(--radius-full)`, `padding: 14px 28px`, `transition: background var(--dur) var(--ease), transform var(--dur) var(--ease)`, `:hover { background: var(--accent-hover); transform: translateY(-2px) }`.
  - `.button-ghost`: `border: 1px solid var(--ink)`, transparent, `:hover` inverts (`background: var(--ink); color: var(--paper)`).
  - `.eyebrow`: `font-size: 12px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase`.
  - `.card`: `border-radius: var(--radius); box-shadow: var(--shadow-card)`, and add `.card--lift:hover { transform: translateY(-6px); box-shadow: var(--shadow-card-hover) }`.
  - `.input/.select/.textarea`: border `var(--line-strong)`, radius `var(--radius-s)`.
- [ ] **Step 4:** Add the missing primitives, used by Studio, tools and the gallery (they replace ad-hoc variants in later tasks):

```css
.chip { display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 8px 14px; border: 1px solid var(--line-strong);
  border-radius: var(--radius-full); background: var(--surface); color: var(--ink); font: 500 13px/1 var(--sans); cursor: pointer;
  transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease); }
.chip:hover { border-color: var(--ink); }
.chip[aria-pressed="true"], .chip[aria-checked="true"], .chip[aria-current="true"] { background: var(--ink); border-color: var(--ink); color: var(--paper); }
.badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: var(--radius-full); font: 600 11px/1.4 var(--sans); background: var(--neutral-bg); color: var(--neutral-fg); }
.badge--ok { background: var(--ok-bg); color: var(--ok-fg); }
.badge--warn { background: var(--warn-bg); color: var(--warn-fg); }
.badge--danger { background: var(--danger-bg); color: var(--danger-fg); }
.badge--hot { background: var(--accent); color: var(--surface); }
.wrap-read { max-width: var(--wrap-read); margin-inline: auto; padding-inline: 24px; }
.wrap-narrow { max-width: var(--wrap-narrow); margin-inline: auto; padding-inline: 24px; }
```

- [ ] **Step 5:** Run `node --test tests/design-system.test.ts && npm test && npm run typecheck`. Expected: PASS.

### Task 5: Living docs + phase gate

**Files:**
- Modify: `DESIGN.md` (frontmatter values → the new tokens; add the scales, status, motion, fonts `script`/`hand`; link `app/styles/tokens.css` as the runtime source; add the deviation table)
- Modify: `docs/superpowers/plans/2026-09-26-design-refresh.md` (add a "Superseded by" line at the top)
- Modify: `PROGRESS.md`

- [ ] **Step 1:** Sync `DESIGN.md`. Clear the 11 lint warnings by referencing every token in the prose.
- [ ] **Step 2:** Phase gate, run sequentially: `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`.
- [ ] **Step 3:** Phase 1 browser QA (once):
  - Start the servers per README "Chạy local".
  - Use Playwright on `/`, `/templates`, `/studio`, `/account`, `/cong-cu-dam-cuoi` at 390 and 1280.
  - Check 0 console errors, no horizontal overflow, fonts loaded (`document.fonts` has Be Vietnam Pro + Playfair; Cormorant/Great Vibes only where used).
  - Global token changes (radius, wrap 1280, heading weight 400, gold) shift every page. **Record the before/after screenshots** under `.playwright-mcp/ds-core-*`.
- [ ] **Step 4:** Update PROGRESS.md. Set the pointer to Phase 2 Task 6.

---

## PHASE 2 — Put every site surface on tokens (the ratchet empties)

### Task 6: Migrate hex offenders, one file group per commit

**Files:** every `PENDING` entry in `tests/design-system.test.ts`.

For each group, run this loop: remove the group from `PENDING` → run the test and see it FAIL → replace the hex with the nearest token → the test PASSES → `npm run typecheck`.

- [ ] Group A: `components/home/home.css`, `components/marketing/marketing.css`
- [ ] Group B: `app/bang-gia/pricing.css`, `app/tro-giup/help.css`, `app/blog/blog.css`, `app/tinh-nang/features.css`, `app/templates/[id]/detail.css`
- [ ] Group C: `components/account/account.css`, `components/studio/studio.css`, `components/studio/panels.css`, `components/templates/gallery.css`
- [ ] Group D (TSX):
  - `components/templates/GalleryCatalog.tsx` and `app/templates/page.tsx`: derive colour-filter swatches from `lib/templates.ts` palettes (`getPalette(key).deep`) instead of copied hex. This removes duplication, not just hex.
  - `app/tinh-nang/page.tsx` and `app/blog/BlogCatalog.tsx`: tile colours → `var(--ok-bg)`, `var(--paper-alt)` etc. passed through `style={{ background: "var(--ok-bg)" }}`. Where no token exists (e.g. `#e6ebef`), add a scale value to `tokens.css` and its `EXPECTED`/scale check only if it appears in the design twice or more. Otherwise use the nearest token.
- [ ] Final: `PENDING` is empty. Delete the `PENDING` constant and the "clean now" branch from the test (the ratchet is done). Run the full gate.

**Rule for choosing a token:**
- Exact match → that token.
- Within ΔE of a scale step → the scale step.
- Text colour → it must be a token that passes the AA test.
- Never invent a new semantic token for a one-off.

---

## PHASE 3 — Page parity (HTML → app), on the core

### Task 7: Parity checklist = the definition of "100%"

**Files:**
- Create: `docs/superpowers/specs/2026-09-26-design-parity-checklist.md`
- Modify: `PROGRESS.md` (replace the stale inventory table: it lists non-existent `Blog.dc.html`, `Blog Bai Viet.dc.html`, `Studio Editor.dc.html` and wrongly says the CC tool mockups are missing)

- [ ] **Step 1:** Create one table per source page. Columns: `Section/state (in source order) | App file | Status (matched / deviated: reason / blocked: decision #) | Evidence (screenshot path)`. Derive rows by reading each `.dc.html` top-to-bottom (sections, `sc-if` states, hover/active states, empty/error/loading states). Pages and routes:

| Source | Route |
|---|---|
| Site Header / Site Footer | shared shell (`components/site/*`) |
| Trang Chu | `/` |
| Mau Thiep v2 / Mau Thiep Chi Tiet / Thiep Preview | `/templates`, `/templates/[id]`, `Cover.tsx` (A–J) |
| Tinh Nang / Tinh Nang Chi Tiet | `/tinh-nang`, `/tinh-nang/[slug]` |
| Bang Gia / Ung Ho / Tro Giup / Phap Ly | `/bang-gia`, `/ung-ho`, `/tro-giup`, `/dieu-khoan` + `/quyen-rieng-tu` |
| Tao Thiep Cuoi / Thiep Cuoi Online Mien Phi / QR Tien Mung / Tin Nhan Moi Cuoi | the 4 SEO landings |
| Cong Cu + CC Tao QR / CC Nen Anh / CC Tin Nhan / CC Danh Sach Khach / CC So Do Cho Ngoi / CC Save The Date | `/cong-cu-dam-cuoi`, `/cong-cu/*` (`nen-video` has no source → DS primitives only) |
| Studio / Studio Editor v3 | `/studio`, `/studio/[id]` |
| Tai Khoan | `/account` |
| Thiep Khach / Thiep Mau Day Du | `/invite/[slug]` (decision 6) |
| Wedding Design System | none — it is the spec for Phase 1 |

- [ ] **Step 2:** Pre-fill statuses from PROGRESS.md evidence (gallery, detail, features, pricing, help were ported but not visually verified → `pending-verify`).

### Task 8: Paired screenshot harness (used by every Phase 3 task)

**Files:**
- Create: `scripts/design-parity.mjs` (dev-only, run with Playwright MCP or `npx playwright`, not part of `npm test`)

- [ ] Serve `design/` statically (`npx serve design -l 5055`). For each checklist row's page pair, capture `design` vs `app` at 390 and 1280 into `.playwright-mcp/parity/<page>-<vw>-{design,app}.png`. **Before capturing a design page, scroll to the bottom in steps** so its IntersectionObserver reveals fire (known trap: below-the-fold sections render blank otherwise). Compare section order, geometry and tokens, **not pixels** (sample content differs).

### Tasks 9–15: Port page groups (one task each, same loop)

Each task follows this loop:
1. Open the source `.dc.html` and the checklist rows.
2. Rewrite the page's markup/CSS using only DS primitives and tokens.
3. Keep data from the real registries (`lib/templates.ts`, `lib/marketing/*`, `lib/donate.ts`).
4. Mark the rows.
5. Run `npm test && npm run typecheck`.

Gallery/detail/features/pricing/help/blog already had a structural port. For them the task is **verify → fix deltas**, not a rewrite.

- [ ] **Task 9:** Shared shell (Header, Footer, mobile menu) + Trang Chu (largest source; hero envelope tilt, template marquee, quote strip in `--script`, stats counter, 3 steps, 8 animated features, guest link demo, 7 tools, pricing, final CTA).
- [ ] **Task 10:** Gallery + detail + cover A–J. Verify each family × at least 2 palettes against `Thiep Preview.dc.html`.
- [ ] **Task 11:** Tinh Nang + Tinh Nang Chi Tiet (prev/next navigation).
- [ ] **Task 12:** Bang Gia, Ung Ho, Tro Giup, Phap Ly (2 tabs), Blog (decision 1: DS only).
- [ ] **Task 13:** 4 SEO landings (`components/seo/SeoLandingPage.tsx` shared).
- [ ] **Task 14:** Tool hub + 6 CC tools. Keep existing working logic (`lib/tools/*`, CSV, canvas). Restyle `ToolPage` shell once, then each tool body.
- [ ] **Task 15:** Studio landing + Tai Khoan (login/register, `#k=` claim, invitation list).
- [ ] **Phase 3 gate:**
  - Full unit/typecheck/build.
  - Paired screenshots for every row.
  - Sitemap smoke sweep 390/1280 (0 errors, 0 overflow, 0 broken images).
  - Mobile Lighthouse on touched routes.
  - PROGRESS.md update.

---

## PHASE 4 — Studio Editor v3 (contract change, not a restyle)

> **Blocked (2026-09-26):** the owner moved the stack to Next.js + Supabase and there is no more Java backend work (see CLAUDE.md "Stack direction"). The field list below stays valid. Implement it against the Supabase migration spec: a JSONB `content` column with `contentSchema` on the FE, not the Java record steps in Task 16.

The v3 state has fields the `contentSchema` lacks. It needs a short spec first: `docs/superpowers/specs/2026-09-26-editor-v3-design.md`.

### Task 16: Content contract additions (FE + BE together)

**Files:**
- Modify: `lib/content.ts`, `tests/content.test.ts`
- Modify: BE `../Thiep-cuoi-online-backend/.../InvitationContent.java`
- Regenerate the fixture per README

New fields. Each uses `.default()` on the FE and a compact constructor `null → ""/false/[]` on the BE. Keep `v: 1` (same precedent as `paletteKey` and the Phase 5 `*En` fields). All must be valid when empty.

| Field | Type | Source (`Studio Editor v3` state) |
|---|---|---|
| `envelope.greeting` | `text(80)`, default `"Trân trọng kính mời"` | `greet` |
| `couple.groom.rank` / `couple.bride.rank` | `text(30)` | `rankA`/`rankB` (chip values `Trưởng nam`, `Thứ nam`, `Út nam`, `Trưởng nữ`, `Thứ nữ`, `Út nữ`) |
| `schedule` | `array({ id, time: timeStr, label: text(80) }).max(12)` | `sched` |
| `sections` | `object` of booleans: `envelope`, `schedule`, `countdown`, `album`, `music`, `thanks` (default all `true`) | `on{}` (rsvp/guestbook/gift already have `enabled`) |
| `albumLayout` | `z.union([z.literal(3), z.literal(6), z.literal(9)])`, default `6` | `albumN` |
| event `welcomeTime` | `timeStr` on `eventSchema` | `pWelcome` (reception `time` = dinner) |

- [ ] TDD:
  - Write failing tests: old content without the new keys parses to the defaults; empty values are valid; `albumLayout: 4` is rejected.
  - Implement.
  - Run BE `./mvnw test` + FE `npm test`.
  - Regenerate the fixture.

### Task 17: `lib/editor-sections.ts` — section registry + completeness (pure, tested)

- [ ] Port `SECS`, `DESC`, `MISS`, `done()` from the source into `export const SECTION_GROUPS`, `export function missingReason(key, content): string | null`, `export function completion(content): number` (0–100). Write tests first in `tests/editor-sections.test.ts`.

### Task 18: Renderer additions

- [ ] Add a new `components/invitation/sections/Schedule.tsx`.
- [ ] Add a `data-sec="<key>"` anchor on every section root in `InvitationRenderer` (for click-to-jump).
- [ ] Honour `sections.*` toggles, `albumLayout` and `envelope.greeting` in `InvitationShell`. Show family/rank lines.

### Task 19: Editor v3 shell

- [ ] Build the 3-column layout (section list with the % ring → form → preview with phone/desktop frame).
- [ ] Clicking the preview jumps to that section; selecting a section scrolls the preview and shows the "ĐANG SỬA" label.
- [ ] "Xem như khách" guest-name switcher.
- [ ] Below 1024px: full-screen preview + bottom sheets.
- [ ] Publish dialog lists missing sections from `missingReason`.
- [ ] Preserve `useAutosave` + `#k=`.
- [ ] Use DS `.chip` for rank/bank/guest choice.
- [ ] Phase 4 gate + real E2E: create → edit every section → autosave → reload → publish → guest.

## PHASE 5 — Guest page parity (`Thiep Khach`)

### Task 20

- [ ] Envelope open with a light burst.
- [ ] Flip-clock countdown.
- [ ] Staggered reveal (reuse `Reveal`).
- [ ] RSVP tick drawn progressively.
- [ ] `--script`/`--hand` for names **only where the template font set allows** (template fonts win).
- [ ] Must work with `prefers-reduced-motion`.
- [ ] Preserve `?to=`, `?g=`, `?lang=`.
- [ ] Phase gate + checklist rows.

## PHASE 6 — Final acceptance

### Task 21

- [ ] Every checklist row is `matched`, `deviated: <reason>` or `blocked: <decision>`. None are `pending`.
- [ ] Full gate: `npm test`, `typecheck`, `build`, BE `./mvnw test`, `git diff --check`.
- [ ] Sitemap sweep 390/1280 with `reducedMotion` both on and off. Pass bar: 0 console/page errors, 0 overflow, 0 broken images, correct fonts.
- [ ] E2E flows (account claim, create → publish → RSVP/wish, legacy template ID).
- [ ] Mobile Lighthouse on touched routes.
- [ ] Record exact counts in PROGRESS.md. Only then say "100%", scoped to the checklist.
