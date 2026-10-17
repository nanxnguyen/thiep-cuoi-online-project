# Cloudflare Free Performance & CPU Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep every route under the Workers Free budget (10 ms CPU per request, 3 MiB compressed worker, 100k Worker requests per day) with headroom, and prove the site still works on desktop, phone, tablet and in-app browsers (Zalo, Messenger, Facebook).

**Architecture:** Measure real per-route CPU first (Task 0) and let the numbers decide how far to go. Then remove per-request server work in this order of gain per risk: pages that are dynamic only because they read `searchParams` become static (Task 1), the guest page `/invite/[slug]` gets a cheaper render path (Task 2), the worker bundle and cold-start cost get a hard size budget (Task 3), image transformation and static asset caching stop costing CPU/quota (Tasks 4-5). Task 6 is the cross-device regression gate; Task 7 ships and records the before/after.

**Tech Stack:** Next.js 16 (Turbopack, `output: "standalone"`), `@opennextjs/cloudflare` 1.20 (`staticAssetsIncrementalCache`), Wrangler, Cloudflare Workers Free + Static Assets, Supabase, Playwright (8 projects in `playwright.config.ts`), Chrome DevTools MCP / `npx lighthouse`.

**Spec:** none. This plan is the spec. Context: production hit `Error 1102 Worker exceeded resource limits` on 2026-10-11 because `open-next.config.ts` was empty (prerendered pages were re-rendered per request). Fixed in version `d447c6cc` (static-assets incremental cache + `populateCache local` in `npm run build`). Front-end load work (CSS, fonts, JS split) lives in `docs/superpowers/plans/2026-10-07-performance-plan.md` and is NOT repeated here.

## Global Constraints

- Workers Free limits: CPU 10 ms per request, compressed worker size 3 MiB, 100,000 Worker requests per day, 50 subrequests per request. Never set `limits.cpu_ms` (paid plans only).
- Current baseline (2026-10-11): `handler.mjs` 7.9 MB raw, 1.9 MB gzip (63% of the size limit); app chunks 5.6 MB, Next runtime 2.2 MB; 191 static asset files, 23 MB (`music` 11 MB, `cdn-cgi/_next_cache` 4.5 MB).
- Do not change how any page looks. After every task: layout probe diff at 768/1024/1280/1440 = 0 changes (`scripts/layout-probe.js`, `scripts/layout-diff.ts`).
- Gate per task: `npm test`, `npm run typecheck`, `npm run build:next` green. Build for deploy only with `npm run build` (it runs `populateCache local`; skipping it brings back Error 1102).
- Never run destructive commands against production Supabase. Production reads only after the owner says so.
- Owner runs `git commit`. Update `PROGRESS.md` (status + one dated log line + the "▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY" pointer) after each task.
- Keep `lib/api.ts` as the only client seam; keep guest URLs `/invite/[slug]?g=` and `?lang=` working.
- Browser checks use Chrome DevTools MCP or Playwright, lean and only after a whole task. Kill any `next dev`/`next start` you started.

## File Structure

| File | Responsibility |
|---|---|
| `scripts/cf-cpu-probe.mjs` (create) | Hit a list of routes against a base URL while `wrangler tail` records `cpuTime`; print a table |
| `scripts/check-worker-size.mjs` (create) | Fail the build when the gzipped worker exceeds the budget |
| `tests/worker-budget.test.ts` (create) | Unit test for the budget arithmetic |
| `app/studio/page.tsx`, `components/studio/StudioHome.tsx` (modify) | Static page; read `?template=&color=` on the client |
| `app/templates/[id]/page.tsx`, `components/templates/TemplateQuery.tsx` (create) | Static detail page; `?preview/gate/color` handled on the client |
| `app/invite/[slug]/page.tsx` (modify, Task 2) | Cheaper render path for the guest page (decision-gated) |
| `next.config.ts` (modify) | `images.unoptimized` for pre-optimized static photos |
| `public/_headers` (create) | Cache-Control for `/photos`, `/music`, `/fonts`, `/_next/static` |
| `docs/superpowers/plans/2026-10-11-cloudflare-free-baseline.md` (create in Task 0) | Measured before/after table |
| `DEPLOY.md`, `PROGRESS.md` (modify) | Process notes |

---

### Task 0: Measure real CPU per route (gate for Tasks 2-3)

**Files:**
- Create: `scripts/cf-cpu-probe.mjs`
- Create: `docs/superpowers/plans/2026-10-11-cloudflare-free-baseline.md`

**Interfaces:**
- Produces: a table `route | p50 cpuMs | max cpuMs | exceededCpu count` that Tasks 1-5 compare against.

- [ ] **Step 1: Write the probe script**

```js
// scripts/cf-cpu-probe.mjs
// Usage: node scripts/cf-cpu-probe.mjs https://taothiepcuoimienphi.raystudio.com.vn [rounds]
// Runs `wrangler tail --format json`, requests each route `rounds` times (sequentially, so a
// log line maps to one request) and prints cpuTime per route from the tail events.
import { spawn } from "node:child_process";

const base = process.argv[2];
const rounds = Number(process.argv[3] ?? 5);
if (!base) throw new Error("base URL required");

const ROUTES = [
  "/", "/templates", "/templates/song-hy", "/studio", "/ung-ho", "/bang-gia", "/blog",
  "/cong-cu/tao-qr", "/admin/login", "/api/auth/me", "/api/admin/me",
];
// Add real guest URLs the owner provides (a published slug): "/invite/<slug>", "/invite/<slug>?g=<token>".
for (const extra of (process.env.PROBE_EXTRA ?? "").split(",").filter(Boolean)) ROUTES.push(extra);

const events = [];
const tail = spawn("npx", ["wrangler", "tail", "thiep-cuoi-online", "--format", "json"], { stdio: ["ignore", "pipe", "inherit"] });
let buf = "";
tail.stdout.on("data", (chunk) => {
  buf += chunk;
  let i;
  while ((i = buf.indexOf("\n")) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line.startsWith("{")) continue;
    try { events.push(JSON.parse(line)); } catch { /* partial line */ }
  }
});

await new Promise((r) => setTimeout(r, 6000)); // let the tail connect
const rows = [];
for (const route of ROUTES) {
  const start = events.length;
  for (let n = 0; n < rounds; n += 1) {
    await fetch(base + route, { redirect: "manual" }).then((r) => r.arrayBuffer());
    await new Promise((r) => setTimeout(r, 700));
  }
  await new Promise((r) => setTimeout(r, 1500));
  const mine = events.slice(start).filter((e) => (e.event?.request?.url ?? "").includes(route.split("?")[0]));
  const cpu = mine.map((e) => e.cpuTime ?? e.event?.cpuTime).filter((v) => typeof v === "number").sort((a, b) => a - b);
  const exceeded = mine.filter((e) => /exceeded/i.test(e.outcome ?? "")).length;
  rows.push({ route, n: cpu.length, p50: cpu[Math.floor(cpu.length / 2)] ?? "n/a", max: cpu.at(-1) ?? "n/a", exceeded });
}
tail.kill();
console.table(rows);
```

- [ ] **Step 2: Verify the tail event actually carries `cpuTime`**

Run: `npx wrangler tail thiep-cuoi-online --format json` in one terminal, `curl -s -o /dev/null https://taothiepcuoimienphi.raystudio.com.vn/` in another.
Expected: a JSON line with `"outcome":"ok"` and a numeric `cpuTime` (milliseconds). If the field is missing, read per-request CPU from the Cloudflare dashboard (Workers & Pages → thiep-cuoi-online → Metrics → CPU time p50/p99) and put those numbers in the baseline doc instead; adjust Step 3 accordingly. Do not guess the field name.

- [ ] **Step 3: Run the probe on production and write the baseline**

Run: `node scripts/cf-cpu-probe.mjs https://taothiepcuoimienphi.raystudio.com.vn 5`
Ask the owner for one published slug and one `?g=` token, then rerun with `PROBE_EXTRA="/invite/<slug>,/invite/<slug>?g=<token>"`.
Write the table into `docs/superpowers/plans/2026-10-11-cloudflare-free-baseline.md` under a heading `## Before`. Mark every route with p50 above 6 ms or any `exceeded` as **hot**.

- [ ] **Step 4: Decide**

Rule written into the baseline doc: Task 2 runs only if `/invite/[slug]` (with and without `?g=`) has p50 above 6 ms or any exceeded request; Task 3 runs regardless (budget guard is cheap). Tasks 1, 4, 5 run regardless.

- [ ] **Step 5: Commit**

```bash
git add scripts/cf-cpu-probe.mjs docs/superpowers/plans/2026-10-11-cloudflare-free-baseline.md
git commit -m "chore(perf): add Workers CPU probe and record production baseline"
```

---

### Task 1: Make `/studio` and `/templates/[id]` static

Both pages are server-rendered on every request only because they `await searchParams`. Reading the query string on the client lets Next prerender them, and with the static-assets cache they cost almost no CPU.

**Files:**
- Modify: `app/studio/page.tsx`
- Modify: `components/studio/StudioHome.tsx:24` (props)
- Create: `components/studio/StudioHomeQuery.tsx`
- Modify: `app/templates/[id]/page.tsx`
- Create: `components/templates/TemplateQuery.tsx`
- Test: `tests/static-routes.test.ts`

**Interfaces:**
- Consumes: `StudioHome({ initialTemplate?: string; initialColor?: string })` (unchanged).
- Produces: `StudioHomeQuery()` client wrapper that reads `useSearchParams()`; `app/studio/page.tsx` has no `searchParams` prop.

- [ ] **Step 1: Write the failing test**

```ts
// tests/static-routes.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("/studio is prerenderable: the page never awaits searchParams", () => {
  const src = read("app/studio/page.tsx");
  assert.doesNotMatch(src, /searchParams/);
  assert.match(src, /<Suspense/);
});

test("/templates/[id] is prerenderable: the page never awaits searchParams", () => {
  const src = read("app/templates/[id]/page.tsx");
  assert.doesNotMatch(src, /searchParams/);
  assert.match(src, /generateStaticParams/);
});

test("query-string readers are client components wrapped in Suspense", () => {
  for (const p of ["components/studio/StudioHomeQuery.tsx", "components/templates/TemplateQuery.tsx"]) {
    const src = read(p);
    assert.match(src, /^"use client";/);
    assert.match(src, /useSearchParams/);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/static-routes.test.ts`
Expected: FAIL (`searchParams` still present).

- [ ] **Step 3: Implement `/studio`**

```tsx
// components/studio/StudioHomeQuery.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { StudioHome } from "./StudioHome";

// Reads ?template=&color= in the browser so the /studio page itself stays static.
export function StudioHomeQuery() {
  const sp = useSearchParams();
  return <StudioHome initialTemplate={sp.get("template") ?? undefined} initialColor={sp.get("color") ?? undefined} />;
}
```

```tsx
// app/studio/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StudioHomeQuery } from "@/components/studio/StudioHomeQuery";

export const metadata: Metadata = { title: "Tạo thiệp cưới", robots: { index: false, follow: false } };

export default function StudioPage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={null}>
        <StudioHomeQuery />
      </Suspense>
    </>
  );
}
```

- [ ] **Step 4: Implement `/templates/[id]`**

Move the body that depends on `gate`, `color`, `preview` into a client component `TemplateQuery` that receives the already-resolved `template` id and the server-built static pieces. Concretely:

1. `TemplateQuery({ templateId })` is a `"use client"` component that calls `useSearchParams()` for `gate`, `color`, `preview`, looks the template up with `getTemplate(templateId)`, and renders exactly the two branches that exist today in `app/templates/[id]/page.tsx` (the `preview === "1" || gate === "1"` branch with `InvitationRenderer`, and the detail branch). Copy the JSX verbatim from the current page, replacing the `await searchParams` destructuring with `const sp = useSearchParams(); const gate = sp.get("gate"); const color = sp.get("color"); const preview = sp.get("preview");`.
2. `app/templates/[id]/page.tsx` keeps `generateStaticParams` and `generateMetadata`, removes the `searchParams` prop, still calls `notFound()` for an unknown id, and returns `<Suspense fallback={null}><TemplateQuery templateId={template.id} /></Suspense>` plus the existing `JsonLd`/`PageJsonLd` blocks.
3. Keep every class name and `detail.css` import unchanged so the layout probe stays at 0 changes.

- [ ] **Step 5: Run the tests and the build**

Run: `node --test tests/static-routes.test.ts && npm run typecheck && npm run build:next`
Expected: PASS; in the route table `/studio` and `/templates/[id]` show `○` or `●` (static / SSG), not `ƒ`.

- [ ] **Step 6: Browser check (once, after the task)**

Open `/studio?template=song-hy&color=do`, `/templates/song-hy`, `/templates/song-hy?gate=1`, `/templates/song-hy?preview=1&color=do` at 1280 and 390 px. Expected: same selection and layout as before, 0 console errors, no hydration warning.

- [ ] **Step 7: Commit**

```bash
git add app/studio app/templates components/studio components/templates tests/static-routes.test.ts
git commit -m "perf(cf): prerender /studio and /templates/[id], read query string on the client"
```

---

### Task 2: Cheaper guest page `/invite/[slug]` (only if Task 0 marks it hot)

`/invite/[slug]` is `force-dynamic`: every guest view renders the whole `InvitationRenderer` tree on the server and makes 1-2 Supabase calls. It is the most CPU-heavy route and the one guests open on phones. Do the cheap steps first and re-measure; stop as soon as p50 is under 6 ms.

**Files:**
- Modify: `app/invite/[slug]/page.tsx`
- Modify: `lib/server/supabase.ts`
- Test: `tests/invite-page-cost.test.ts`

- [ ] **Step 1: Re-measure the two variants separately**

Use the Task 0 probe with `/invite/<slug>` and `/invite/<slug>?g=<token>`. Record p50 for both. If only `?g=` is hot, the extra guest lookup (`createAdminClient()` + `resolveGuestToken`) is the cost; if both are hot, React render is the cost.

- [ ] **Step 2: Cheap fix A, reuse Supabase clients per isolate**

In `lib/server/supabase.ts` memoize the anon and admin clients at module scope (they use `statelessAuth`, so no per-request state):

```ts
let anon: ReturnType<typeof createClient> | undefined;
export function createAnonClient() {
  const env = readEnv();
  return (anon ??= createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: statelessAuth }));
}
```

Keep `createRouteClient` (cookie-bound) un-memoized. Add a test that two calls return the same instance and that `createRouteClient` returns different ones.

- [ ] **Step 3: Cheap fix B, short edge cache for generic links (no `?g=`)**

For requests without `g`, wrap the response in the Workers Cache API with a 30-second TTL keyed by `slug + lang`. Only if the owner accepts a 30 s staleness window ("Guests must always see the latest version" is the current comment in the page). Ask the owner before enabling; default off. Implementation lives in a small `lib/server/edge-cache.ts` (`cachedResponse(request, ttlSeconds, render)`), unit-tested with a fake `caches.default`.

- [ ] **Step 4: Heavier option, only if A and B are not enough**

Render a small server shell and personalize on the client: the server sends the invitation HTML for a neutral guest, and the envelope reads the guest name from `/api/public/invitations/[slug]/guests/[token]` after hydration. This changes first paint for named guests, so write a short spec and get owner sign-off first. Do not start it without that.

- [ ] **Step 5: Verify and commit**

Run the probe again; the table must show p50 under 6 ms for the guest URLs. `npm test`, typecheck, build green.

```bash
git add app/invite lib/server tests/invite-page-cost.test.ts
git commit -m "perf(cf): cut CPU of the guest page"
```

---

### Task 3: Worker size budget and cold-start guard

Free plan limits the compressed worker to 3 MiB; today it is 1.9 MiB. Every new template cover or library eats into that headroom and into cold-start parse time.

**Files:**
- Create: `scripts/check-worker-size.mjs`
- Create: `tests/worker-budget.test.ts`
- Modify: `package.json` (`build` script)

**Interfaces:**
- Produces: `workerBudget(rawBytes: number, gzipBytes: number): { ok: boolean; message: string }` exported from `scripts/check-worker-size.mjs`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/worker-budget.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { workerBudget } from "../scripts/check-worker-size.mjs";

const MiB = 1024 * 1024;

test("budget passes below 2.4 MiB gzip and fails above", () => {
  assert.equal(workerBudget(8 * MiB, 1.9 * MiB).ok, true);
  assert.equal(workerBudget(9 * MiB, 2.5 * MiB).ok, false);
});

test("message names both numbers so a failing build is actionable", () => {
  const { message } = workerBudget(8 * MiB, 2.6 * MiB);
  assert.match(message, /2\.6/);
  assert.match(message, /2\.4/);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/worker-budget.test.ts`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement the guard**

```js
// scripts/check-worker-size.mjs
import { readFileSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const MiB = 1024 * 1024;
// Free plan hard limit is 3 MiB compressed; keep 20% headroom.
export const GZIP_BUDGET = 2.4 * MiB;

export function workerBudget(rawBytes, gzipBytes) {
  const f = (n) => (n / MiB).toFixed(2);
  const ok = gzipBytes <= GZIP_BUDGET;
  return { ok, message: `worker ${f(rawBytes)} MiB raw, ${f(gzipBytes)} MiB gzip (budget ${f(GZIP_BUDGET)} MiB, Free limit 3.00 MiB)` };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = ".open-next/server-functions/default/handler.mjs";
  if (!existsSync(file)) throw new Error(`${file} missing: run opennextjs-cloudflare build first`);
  const raw = readFileSync(file);
  const { ok, message } = workerBudget(raw.length, gzipSync(raw).length);
  console.log(message);
  if (!ok) process.exit(1);
}
```

- [ ] **Step 4: Wire it into `npm run build` and run**

In `package.json` insert `node scripts/check-worker-size.mjs &&` right after `opennextjs-cloudflare populateCache local &&` in the `build` script.
Run: `node --test tests/worker-budget.test.ts && npm run build`
Expected: tests PASS; the build prints `worker 7.9x MiB raw, 1.8x MiB gzip (budget 2.40 MiB, ...)`.

- [ ] **Step 5: Find the heaviest app code (analysis, no change yet)**

Run: `node -e 'const m=JSON.parse(require("fs").readFileSync(".open-next/server-functions/default/handler.mjs.meta.json","utf8"));const o=Object.values(m.outputs)[0].inputs;console.log(Object.entries(o).sort((a,b)=>b[1].bytesInOutput-a[1].bytesInOutput).slice(0,25).map(([f,v])=>(v.bytesInOutput/1024|0)+" KB "+f).join("\n"))'`
Record the top 25 in the baseline doc. For each file over 150 KB that is only needed by a rarely used route (admin, docs, blog content, template covers), move it behind `next/dynamic` / `import()` in a follow-up task; do not refactor in this task.

- [ ] **Step 6: Commit**

```bash
git add scripts/check-worker-size.mjs tests/worker-budget.test.ts package.json docs/superpowers/plans/2026-10-11-cloudflare-free-baseline.md
git commit -m "chore(perf): fail the build when the worker exceeds the Free-plan size budget"
```

---

### Task 4: Stop paying CPU and quota for image transformation

`wrangler.jsonc` binds `IMAGES`, and 5 files use `next/image`. Static photos in `public/photos` are already compressed; running them through the Images binding spends CPU and the free transformation quota for no visible gain.

**Files:**
- Modify: `next.config.ts`
- Modify: the 5 `next/image` call sites only if the build warns about missing `sizes`
- Test: `tests/images-config.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/images-config.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("next/image does not transform pre-optimized static photos", () => {
  const src = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(src, /images:\s*\{[^}]*unoptimized:\s*true/s);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/images-config.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `next.config.ts` replace the `images` block with:

```ts
  // Photos in public/photos are already compressed; skip the Cloudflare Images binding (CPU + free quota).
  images: { unoptimized: true },
```

- [ ] **Step 4: Verify LCP does not regress**

Run `npm run build:next`, serve with `NEXT_DIST_DIR=.next-perf next start -p 3100`, run `npx lighthouse http://localhost:3100/ --preset=perf --form-factor=mobile --only-categories=performance` before/after (stash the change for "before"). Expected: LCP within +10% and no image 404s. If a hero image regresses, resize that one file in `public/photos` instead of re-enabling transformation.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts tests/images-config.test.ts
git commit -m "perf(cf): serve static photos untransformed"
```

---

### Task 5: Long-lived cache headers for static assets

Static Assets responses are free and unlimited on Workers Free, but browsers re-download `/photos`, `/music` (11 MB) and fonts unless told to cache. Fewer repeat downloads also means fewer retries on bad mobile networks.

**Files:**
- Create: `public/_headers`
- Test: `tests/static-headers.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/static-headers.test.ts
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";

test("immutable cache headers exist for hashed and rarely changing assets", () => {
  const url = new URL("../public/_headers", import.meta.url);
  assert.ok(existsSync(url), "public/_headers missing");
  const src = readFileSync(url, "utf8");
  for (const path of ["/_next/static/*", "/fonts/*", "/photos/*", "/music/*"]) assert.ok(src.split("\n").includes(path), `${path} block missing`);
  // Hashed chunks and fonts must be immutable.
  assert.match(src, /\/_next\/static\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
  assert.match(src, /\/fonts\/\*\n\s+Cache-Control: public, max-age=31536000, immutable/);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test tests/static-headers.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```
# public/_headers  (Cloudflare Workers Static Assets)
# Hashed Next chunks never change under the same URL.
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
# Fonts, photos and music change by renaming the file, never in place.
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/photos/*
  Cache-Control: public, max-age=2592000
/music/*
  Cache-Control: public, max-age=2592000
```

(`/photos` and `/music` use 30 days, not `immutable`, because the project replaces some files in place; switch to hashed names before making them immutable.)

- [ ] **Step 4: Build, deploy preview, verify**

Run: `npm run build`, then after the Task 7 deploy: `curl -sI https://taothiepcuoimienphi.raystudio.com.vn/photos/<any file> | grep -i cache-control`
Expected: `cache-control: public, max-age=2592000`.

- [ ] **Step 5: Commit**

```bash
git add public/_headers tests/static-headers.test.ts
git commit -m "perf(cf): cache static assets in the browser"
```

---

### Task 6: Cross-device regression gate (the "works on many devices" check)

Run after Tasks 1-5 and before deploy. Guests mostly open links inside Zalo/Messenger/Facebook in-app browsers on mid-range Android and iPhone, so those count as first-class targets.

**Files:**
- Create: `docs/superpowers/plans/2026-10-11-device-matrix.md` (result table)
- No code unless a check fails

- [ ] **Step 1: Install the extra engines once**

Run: `npx playwright install webkit firefox`
Expected: both download without errors (`safari`, `firefox`, `mobile-safari`, `tablet-safari` projects need them).

- [ ] **Step 2: Run the e2e suite on every project against a production build**

Run, one project at a time (workers=1 by config, and a parallel run starved this machine before):

```bash
npm run build:next && NEXT_DIST_DIR=.next-perf npx next start -p 3100 &
for p in chrome edge safari firefox coccoc-emulated mobile-safari mobile-chrome tablet-safari; do
  E2E_BASE_URL=http://localhost:3100 npx playwright test --project=$p 2>&1 | tail -3
done
```

Expected: every project `PASS (59) FAIL (0)` (59 = current count on chrome; 6 admin-panel tests are skipped without admin env). Kill the server afterwards (`kill %1`).

- [ ] **Step 3: Layout audit across widths**

Use `scripts/layout-probe.js` through Chrome DevTools MCP at 320, 360, 375, 390, 414, 768, 820, 1024, 1280, 1440 px and landscape 844x390 and 667x375. Expected: 0 horizontal overflow, 0 broken images, 0 tap targets under 44 px on phone widths, 0 console errors. Record counts in the matrix doc.

- [ ] **Step 4: Low-end device simulation**

For `/`, `/templates`, `/studio`, `/invite/<slug>?g=<token>` run Lighthouse mobile (simulated slow 4G, 4x CPU) and record performance, LCP, TBT, CLS. Budgets: performance 75+ on `/`, `/studio` and `/templates`; CLS under 0.1; TBT under 600 ms on `/invite/...`. A route below budget becomes a follow-up task, not a blocker for this plan unless it regressed versus the baseline.

- [ ] **Step 5: In-app browser and real-device checklist (owner, manual, 10 minutes)**

Send the owner a link to a test invitation and have them open it from: iPhone Safari, iPhone Zalo, iPhone Messenger, Android Chrome, Android Zalo, Android Facebook in-app, Samsung Internet, Cốc Cốc. For each, confirm: envelope opens, music plays after the tap, RSVP form submits, no horizontal scroll, the keyboard does not hide the RSVP input. Record pass/fail in the matrix doc. Anything failing is filed as a bug with device + OS version.

- [ ] **Step 6: Commit the matrix**

```bash
git add docs/superpowers/plans/2026-10-11-device-matrix.md
git commit -m "docs(perf): record cross-device verification"
```

---

### Task 7: Ship, measure after, keep guardrails

**Files:**
- Modify: `DEPLOY.md` (section 4c), `PROGRESS.md`
- Modify: `docs/superpowers/plans/2026-10-11-cloudflare-free-baseline.md` (add `## After`)

- [ ] **Step 1: Deploy**

```bash
NEXT_PUBLIC_SITE_URL=https://taothiepcuoimienphi.raystudio.com.vn npm run build
npx wrangler deploy
```

Expected: the build prints the worker size line from Task 3 and `Successfully populated static assets cache`; deploy prints a new `Current Version ID`. Write that id and the previous one (`b39c789c`) into `PROGRESS.md` for rollback.

- [ ] **Step 2: Re-run the probe and compare**

Run: `node scripts/cf-cpu-probe.mjs https://taothiepcuoimienphi.raystudio.com.vn 5` (with the same `PROBE_EXTRA`). Paste the table under `## After`. Acceptance: no route above 8 ms p50, zero `exceeded`, hot routes from Task 0 improved or explained.

- [ ] **Step 3: Burst test for error 1102**

Run 3 rounds of 4 parallel requests to each of 12 public routes (see the loop used on 2026-10-11 in `PROGRESS.md`). Acceptance: 100% HTTP 200.

- [ ] **Step 4: Daily request budget note**

Add to `DEPLOY.md` 4c: Free plan allows 100,000 Worker requests per day; every HTML page view and every API call is one request, static asset requests are free. Rule of thumb: about 8 Worker requests per invitation view (HTML + RSVP/wishes/view-count calls), so ~12,000 invitation views per day is the ceiling. Check the dashboard (Workers → Metrics → Requests) weekly during a wedding season, and move to Workers Paid ($5/month, 10M requests, 30 s CPU) before reaching 70% of the cap.

- [ ] **Step 5: Update docs and PROGRESS.md**

`DEPLOY.md` 4c: mention `check-worker-size` output and `public/_headers`. `PROGRESS.md`: status line, one dated log line with the before/after numbers, and the ▶ pointer.

- [ ] **Step 6: Commit**

```bash
git add DEPLOY.md PROGRESS.md docs/superpowers/plans
git commit -m "docs(perf): record Cloudflare Free before/after and guardrails"
```

---

## Self-Review

- **Spec coverage:** CPU per route (T0, T1, T2), worker size and cold start (T3), image CPU/quota (T4), asset caching (T5), multi-device including in-app browsers (T6), ship + request budget + 1102 regression (T7). Front-end bundle/font/CSS work is explicitly delegated to the existing 2026-10-07 plan.
- **Placeholders:** Task 1 Step 4 describes a verbatim move of existing JSX instead of reprinting 120 lines; the executor copies from `app/templates/[id]/page.tsx` as it stands. Task 2 Step 3/4 are gated on owner decisions, not left blank.
- **Consistency:** `workerBudget` / `GZIP_BUDGET` names match between script and test; `StudioHomeQuery` and `TemplateQuery` names match across tasks and the static-routes test.
- **Open decisions for the owner:** (1) accept a 30 s edge cache for guest links without `?g=` (Task 2 Step 3), (2) approve a client-side personalization spec only if cheaper options fail (Task 2 Step 4), (3) provide a published slug and a `?g=` token for measurement (Task 0 Step 3), (4) run the manual device checklist (Task 6 Step 5).
