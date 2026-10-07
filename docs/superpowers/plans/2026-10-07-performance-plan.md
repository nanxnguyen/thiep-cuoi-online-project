# Performance Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the pages real users open (home, `/templates`, `/studio`, the guest page `/invite/[slug]`) load and become interactive faster on a mid-range phone over a slow network, without changing how any page looks on desktop or phone.

**Architecture:** Measure first, then cut in order of gain per risk: (1) bytes every page pays (render-blocking CSS, 21 font files, shared JS), (2) JS only some routes need (guest-page lightbox + Supabase client, Studio panels), (3) server cost of the guest page, (4) caching headers. Each task ships alone and is re-measured against the baseline from Task 0.

**Tech Stack:** Next.js 16 (Turbopack, `output: "standalone"`, Cloudflare Workers Free: 10 ms CPU), React 19, Supabase, `next/font/google`, Lighthouse CLI (`npx lighthouse`), existing layout probe (`scripts/layout-probe.js`, `scripts/layout-diff.ts`).

**Spec:** none yet. This plan is the spec; findings below are measured on the production build (`.next`, `next start -p 3100`, Lighthouse mobile preset, 2026-10-07). Read `node_modules/next/dist/docs/` for the Next 16 feature in question before each task (AGENTS.md).

## Global Constraints

- Desktop and phone layout must not change: after every task run the layout probe diff at 768/1024/1280/1440 and expect 0 changes (see `docs/superpowers/specs/2026-10-07-mobile-first-design.md` §6).
- No hex outside `app/styles/tokens.css`; fonts keep the design's families and weights unless the owner approves a change (DESIGN.md, `design/` is read-only).
- Gate per task: `npm test`, `npm run typecheck`, `npm run build:next` green; `npm run e2e -- --project=mobile-chrome` green before the last task.
- Owner runs `git commit`. Update `PROGRESS.md` (status + one dated log line + the "▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY" pointer) after each task.
- Keep the Workers Free CPU budget: no new per-request work on the server.
- Browser checks use Chrome DevTools MCP or `npx lighthouse`, kept lean; `.playwright-mcp/` is git-ignored.

## Findings (what the numbers say)

Lighthouse mobile, production build on localhost (simulated slow 4G + 4× CPU):

| Route | Perf | FCP | LCP | JS first load (uncompressed) | Transfer |
|---|---|---|---|---|---|
| `/` | 75 | 2.9 s | 5.2 s | 633 KB | 741 KB |
| `/studio` | 75 | 1.7 s | 6.8 s | 1035 KB | 1021 KB |
| `/templates` | 88 | 1.5 s | 3.8 s | 635 KB | 701 KB |
| `/invite/[slug]` | not measured (needs a real slug) | | | 835 KB | |

Observed (unthrottled) LCP on `/` is 138 ms and TTFB 6 ms, so the server is not the bottleneck locally; the 5.2 s is network + CPU simulation. Real production numbers must come from the deployed URL (Task 0).

1. **Render-blocking CSS: ~2 s of simulated delay on `/`.** 4 stylesheets block first paint (`globals.css` 22 KB, `home.css` 34 KB, `tokens.css`, `motion.css`, plus `seo.css` 7.8 KB). `app/layout.tsx` imports `seo.css` for every route, and only SEO/marketing pages use it.
2. **21 font files on `/`** (~400 KB, 33–46 KB each): 4 families × latin/vietnamese subsets × normal/italic. The font files are discovered only after the CSS, so they chain behind the blocking CSS (network tree: HTML → CSS → woff2).
3. **Guest page ships 835 KB of JS.** One 289 KB chunk contains the Supabase browser client (GoTrue) and `yet-another-react-lightbox`: `WishesPanel` imports `subscribeToWishes` statically, `AlbumGallery` imports the lightbox statically. Most guests never open the lightbox or need realtime wishes on first paint.
4. **Studio is the heaviest route** (`/studio/[id]` 1438 KB, `/studio` 1035 KB, `/demo` 1365 KB uncompressed). No `next/dynamic` anywhere except `/docs`: every panel, dialog and the lightbox load up front. `/docs` correctly lazy-loads `swagger-ui-react` (1.2 MB chunk) and is fine.
5. **Legacy JavaScript insight scores 0** on `/`: polyfills/transpilation for old browsers. Unused JS: 49 KB (`/`), 121 KB (`/studio`).
6. **Main thread on `/` (4× CPU): 4.0 s** — Style & Layout 1.0 s, Rendering 0.6 s, Script 0.4 s, Other 2.0 s. The `Motion` layer runs on every page (page veil, petal trail, scroll progress, reveal observers).
7. **Guest page is `force-dynamic`** with a Supabase query per request (`app/invite/[slug]/page.tsx`). Guests always get the latest version, but every visit costs Worker CPU and a DB round-trip, and nothing can be edge-cached.
8. **Images:** `next/image` is used on the home and template previews (good: 5 images, 5–14 KB each). Invitation sections use plain `<img>` for user photos (`Story`, `Venue`, `AlbumGallery` has `loading="lazy"`); `Cover` hero images are not measured yet. `public/photos` is 2.4 MB (up to 178 KB per file) and `public/music` is 11 MB (`preload="none"`, fine).
9. **Cache headers:** `next.config.ts` sets only security headers; Lighthouse cache insight passes locally, but static `/photos`, `/music`, `/fonts` need checking on the deployed Worker.
10. **Already good:** CLS 0 on all routes, TBT 10–30 ms, `/templates` already virtualises its card grid, 0 broken images, best-practices 100, accessibility 96.

---

### Task 0: Baseline on the real deployment

**Files:**
- Create: `scripts/perf-baseline.sh`
- Create: `docs/superpowers/plans/perf-baseline.md` (table of results, overwritten per run)

**Interfaces:**
- Produces: `bash scripts/perf-baseline.sh <base-url>` → one line per route: `route perf FCP LCP TBT CLS transferKB`. Later tasks quote its before/after numbers.

- [ ] **Step 1: Write the script**

```bash
#!/usr/bin/env bash
# Usage: bash scripts/perf-baseline.sh http://localhost:3100   (or the production URL)
set -euo pipefail
base="${1:?base url}"; out=.playwright-mcp/lh; mkdir -p "$out"
for route in / /templates /studio /templates/song-hy /blog "${INVITE_PATH:-}"; do
  [ -z "$route" ] && continue
  name=$(echo "$route" | tr '/' '_'); name=${name:-_home}
  npx --yes lighthouse "$base$route" --form-factor=mobile --only-categories=performance \
    --chrome-flags="--headless=new" --output=json --output-path="$out/$name.json" --quiet >/dev/null 2>&1
  node -e '
    const r=require(process.argv[1]),a=r.audits,v=k=>a[k].displayValue;
    console.log(process.argv[2],Math.round(r.categories.performance.score*100),v("first-contentful-paint"),v("largest-contentful-paint"),v("total-blocking-time"),v("cumulative-layout-shift"),Math.round(a["total-byte-weight"].numericValue/1024)+"KB")
  ' "./$out/$name.json" "$route"
done
```

- [ ] **Step 2: Run on local production build and on the deployed URL**

Run: `npx next start -p 3100 &` then `INVITE_PATH=/invite/<a real published slug> bash scripts/perf-baseline.sh http://localhost:3100`, then the same against the production domain. Take 3 runs, keep the median.
Expected: a table; the home row on localhost matches the Findings table (±5 points).

- [ ] **Step 3: Record and decide the targets**

Write the table into `perf-baseline.md`. Proposed targets on localhost mobile: `/` ≥ 90, `/studio` ≥ 85, `/invite/[slug]` ≥ 85, LCP ≤ 2.5 s on production. Adjust after seeing the production numbers (they may already be better than localhost simulation).

---

### Task 1: Stop loading `seo.css` on every route

**Files:**
- Modify: `app/layout.tsx` (remove `import "./seo.css"`)
- Modify: the pages/components that render `.seo-*` markup (find with `grep -rln "className=\"seo" app components`) — add `import "@/app/seo.css"` where the markup lives
- Test: `tests/design-system.test.ts` (token guard still passes), `e2e/all-pages.spec.ts`

**Interfaces:**
- Consumes: Findings 1. Produces: 7.8 KB less blocking CSS on routes that do not render SEO markup.

- [ ] **Step 1: List the selectors in `seo.css` and the files that render them**

Run: `grep -o "^\.[a-z0-9_-]*" app/seo.css | sort -u | head -50` then grep each class prefix in `app components`.
Expected: the set of owner components (marketing/SEO shells, blog chrome).

- [ ] **Step 2: Move the import to those owners; remove it from the root layout**

Next.js code-splits CSS by import, so the file loads only on routes that import it.

- [ ] **Step 3: Verify**

Run: `npm run build:next` then layout probe diff at 1280 and 375 (expect 0 changes), `npm test`, `npm run e2e -- --project=mobile-chrome`.
Check with `bash scripts/perf-baseline.sh http://localhost:3100` that `/` and `/studio` transfer dropped by ≈8 KB.

---

### Task 2: Fonts: preload what the first screen needs, drop what it does not

**Files:**
- Modify: `app/layout.tsx` (font options)
- Modify: `DESIGN.md` (only if a deviation is approved)
- Create: `docs/superpowers/plans/perf-fonts.md` (per-route font-use table, decision record)

**Interfaces:**
- Consumes: Findings 2. Produces: fewer font files per route; same glyphs on screen.

- [ ] **Step 1: Measure which font files each route actually uses**

With Chrome DevTools MCP `list_network_requests` (`resourceTypes: ["font"]`) on `/`, `/templates`, `/studio`, `/invite/<slug>`; map each woff2 to family/subset/style via the `@font-face` rules in `.next/static/chunks/*.css`.
Expected: a table. Look for files that are fetched but never painted (for example italic Playfair on routes without an italic heading, a latin subset when only Vietnamese diacritics are used).

- [ ] **Step 2: Decide with the owner before changing**

Candidates, each changes visuals or fidelity so each needs a yes: (a) `weight: ["400"]` for Be Vietnam if 500 is barely used; (b) Playfair italic only where the italic phrase exists; (c) `display: "optional"` on the heading font to avoid a swap flash on slow networks. Do not change without approval; `design/` pins the families.

- [ ] **Step 3: Apply approved changes, verify**

Run: layout probe diff (desktop 0 changes; if a weight is removed, expected diff is explicit and approved), `npm test`, `npm run build:next`; confirm font request count on `/` dropped from 21.

---

### Task 3: Guest page: load the lightbox and the Supabase client only when needed

**Files:**
- Modify: `components/invitation/client/AlbumGallery.tsx` (lazy lightbox)
- Modify: `components/invitation/client/WishesPanel.tsx` (lazy `subscribeToWishes`)
- Test: `tests/` (pure logic only); behaviour verified in the browser

**Interfaces:**
- Consumes: Findings 3. Produces: `/invite/[slug]` first-load JS down from 835 KB; lightbox and realtime code load on first interaction / when the wishes panel nears the viewport.

- [ ] **Step 1: Lazy-load the lightbox**

In `AlbumGallery.tsx`, replace the static `import Lightbox ...` and plugin imports with `const Lightbox = dynamic(() => import("./AlbumLightbox"), { ssr: false })` where the new `AlbumLightbox.tsx` holds the lightbox + `Counter` + `Zoom` imports; render it only after the first photo click (state `opened`). Keep the same props so the open/close behaviour is unchanged.

- [ ] **Step 2: Lazy-load realtime**

In `WishesPanel.tsx`, call `import("@/lib/supabase-browser")` inside the effect that subscribes, started on `requestIdleCallback` (fallback `setTimeout(…, 1500)`) or when the panel intersects the viewport (IntersectionObserver, 400 px margin). Wishes already rendered server-side stay visible; only live updates wait.

- [ ] **Step 3: Verify**

Run: `npm run build:next`, read `.next/diagnostics/route-bundle-stats.json` for `/invite/[slug]`: expect the 289 KB chunk gone from first load. In the browser: open a published invitation, open the album lightbox (works, zoom works), post a wish and see it appear live. `bash scripts/perf-baseline.sh` on the invite URL: JS and transfer down, no regression elsewhere.

---

### Task 4: Studio: split heavy panels and dialogs

**Files:**
- Modify: `components/studio/Editor.tsx` (dynamic imports for panels and dialogs)
- Modify: `components/studio/StudioHome.tsx` (dynamic import of the login/publish dialogs if they are static)
- Create: `docs/superpowers/plans/perf-studio-chunks.md` (what each route loads before/after)

**Interfaces:**
- Consumes: Findings 4. Produces: `/studio` first-load JS from 1035 KB toward ~700 KB, `/studio/[id]` from 1438 KB toward ~1000 KB; the panel for the open section loads on demand.

- [ ] **Step 1: Find what weighs**

Run `npx next experimental-analyze` (Next 16 Turbopack analyzer; check the docs in `node_modules/next/dist/docs/` for the exact command) and list the top modules of `/studio/[id]` and `/demo`. Decide per module: keep (used on first paint), lazy (dialog, panel, tool), or replace.

- [ ] **Step 2: Lazy-load per-section panels and dialogs**

`next/dynamic` with `ssr: false` and a skeleton `loading` for: each file under `components/studio/panels/`, `PublishDialog`, `ResponsesPanel`, `GuestsDialog`, `PrintQrPanel`. The first panel shown on open stays static to avoid a flash.

- [ ] **Step 3: Verify**

Run `npm run e2e -- --project=mobile-chrome --project=chrome` (the Editor flows: every section opens its form, autosave, publish). Browser check: switch sections on a 3G throttle; the skeleton must not cause layout shift (CLS stays 0). Re-run Lighthouse on `/studio`.

---

### Task 5: Modern JS output

**Files:**
- Modify: `package.json` (`browserslist`) or `next.config.ts` (only if the docs for this Next version call for it)

- [ ] **Step 1: Check what the legacy insight lists**

Open `.playwright-mcp/lh/home.json` → `audits["legacy-javascript-insight"].details` for the polyfills and where they come from (app code vs `node_modules`).

- [ ] **Step 2: Set a modern `browserslist` if the polyfills come from app targets**

For example `["chrome >= 100", "safari >= 15.4", "firefox >= 100", "edge >= 100"]`. Verify against the real audience first (owner: does anything older matter? iOS 15.4+ covers almost all iPhones in use). Rebuild; expect the legacy insight score to rise and the shared chunk to shrink.

- [ ] **Step 3: Verify**

`npm run build:next`, `npm test`, WebKit e2e (`--project=mobile-safari`), because Safari is the most likely to break.

---

### Task 6: Main-thread cost of the `Motion` layer

**Files:**
- Modify: `components/site/Motion.tsx` (defer non-essential effects)

- [ ] **Step 1: Profile**

Chrome DevTools MCP `performance_start_trace` on `/` (reload, 4× CPU) and read the top tasks in the first 3 s. Expect the petal trail, reveal observers, magnetic CTA handlers and the veil.

- [ ] **Step 2: Defer what is not needed for first paint**

Start the petal trail and CTA magnetism in `requestIdleCallback` (or after the first user input); keep the veil and progress bar as they are (they are the first-paint design). Respect `prefers-reduced-motion` exactly as now.

- [ ] **Step 3: Verify**

Trace again: lower scripting time in the first 3 s, TBT not worse, motion visibly the same after the first interaction. The `design/` motion contract (DESIGN.md) is the check; if the delay is perceptible, revert this task.

---

### Task 7: Guest page server cost (decision needed)

**Files:**
- Modify: `app/invite/[slug]/page.tsx`, the publish/update route handlers that write invitations

This task changes a product rule ("guests must always see the latest version" via `force-dynamic`), so it needs the owner's decision first.

- [ ] **Step 1: Present the options**

(a) Keep `force-dynamic` (zero risk, every view costs a Worker invocation and a DB query). (b) Cache the invitation by slug with a tag and `revalidateTag` on every successful publish/save (guests see changes immediately because the write invalidates; reads are served from cache). (c) Short `s-maxage` + `stale-while-revalidate` (simplest; guests may see a version up to N seconds old).
Recommendation: (b), because the only writer is the owner through the edit-key routes, so invalidation is exact.

- [ ] **Step 2 (only after approval): implement (b)**

Wrap `getPublicInvitation` in the Next 16 cache API with a per-slug tag (read the caching docs in `node_modules/next/dist/docs/` first), call `revalidateTag` in the save/publish handlers, keep the per-guest `?g=` resolution outside the cached part so guest names stay personalised and are never cached across guests.

- [ ] **Step 3: Verify**

Publish → edit a field in the Editor → reload the guest page: the change appears at once. `?g=<token>` still shows the right guest. Check response headers and TTFB before/after on the deployed Worker.

---

### Task 8: Cache headers for static assets and images

**Files:**
- Modify: `next.config.ts` (`headers()`)
- Test: `tests/` (assert the header table, pure data)

- [ ] **Step 1: Check what the deployed Worker serves for `/photos/*`, `/fonts/*`, `/music/*`, `/_next/image`**

Run `curl -sI https://<prod>/photos/<file>.jpg | grep -i cache-control`.
Expected: note which have no long cache.

- [ ] **Step 2: Add long-lived headers for files whose names never change content**

`/fonts/*`: `public, max-age=31536000, immutable`. `/photos/*` and `/music/*`: `public, max-age=2592000` (30 days; they are replaced by new filenames, not edited in place; confirm with the owner that this holds). Do not touch `/_next/static` (Next already sets immutable).

- [ ] **Step 3: Verify**

Rebuild, `curl -sI` locally and on prod after deploy; second visit transfer in Lighthouse (`cache-insight`) shows 0 wasted bytes.

---

### Task 9: Close out

- [ ] **Step 1:** Re-run `bash scripts/perf-baseline.sh` locally and on production; fill the before/after table in `perf-baseline.md`.
- [ ] **Step 2:** Full gate: `npm test`, `npm run typecheck`, `npm run build:next`, `npm run e2e -- --project=mobile-chrome --project=mobile-safari --project=chrome`, layout probe diff (desktop 0 changes), audit at 375 (0 findings).
- [ ] **Step 3:** Update `PROGRESS.md` and `DESIGN.md` (only for approved visual deviations); hand the owner the commit and deploy commands (`DEPLOY.md` 4c).

## Order and expected value

| Order | Task | Gain | Risk |
|---|---|---|---|
| 1 | 0 Baseline | tells what is real | none |
| 2 | 1 `seo.css` | −8 KB blocking CSS on every route | low |
| 3 | 3 Guest page JS | −290 KB JS on the most visited public page | low |
| 4 | 4 Studio split | −300 to −400 KB JS on the Studio | medium (loading states) |
| 5 | 2 Fonts | −100 to −200 KB, earlier text paint | needs owner OK (design) |
| 6 | 5 Modern JS | smaller shared chunk | low–medium (browser support) |
| 7 | 8 Cache headers | repeat visits | low |
| 8 | 6 Motion defer | main thread | medium (design feel) |
| 9 | 7 Guest page cache | TTFB, Worker CPU | needs owner decision |

## Not planned (and why)

- Replacing fonts or the 囍/ornament design: fidelity to `design/` is a project rule.
- Moving `/docs` Swagger: already lazy.
- Compressing `public/music` (11 MB): `preload="none"`, only fetched on play.
- Chasing the localhost Lighthouse LCP of 5 s as an absolute number: it is a simulation; production numbers from Task 0 decide.

## Self-review

- Spec coverage: every finding 1–9 maps to a task (1→T1, 2→T2, 3→T3, 4→T4, 5→T5, 6→T6, 7→T7, 9→T8; 8 images is intentionally left to Task 0 data: if the guest hero image shows up as the LCP on the invite route, add a task for `fetchpriority`/sizes then).
- No placeholders left except values Task 0 must produce.
- Names consistent: `scripts/perf-baseline.sh`, `perf-baseline.md`, `AlbumLightbox.tsx`.
