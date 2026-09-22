# MỘC Wedding Phase 1 — Invitation Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the invitation core: 7 original templates, a Studio editor with live preview, a public invitation page, RSVP, guestbook, gift QR, maps, countdown, album and music.

**Architecture:** Two repos. **Frontend** (`thiep-cuoi-online-project`): Next.js 16 App Router, shared section components + per-archetype CSS + template data (palette/fonts), API client only (no route handlers). **Backend** (`/Users/nguyenanhnhut/Desktop/Projects/Thiep-cuoi-online-backend`): Spring Boot 4.1.1 / Java 17 REST API over Postgres (JPA + Flyway), media pushed to Supabase Storage. No accounts: edit access by a secret key stored as sha256, sent as `X-Edit-Key`.

**Tech Stack:** FE: Next ^16.3.5, React ^19.1, TypeScript 5.8, zod, plain CSS, `node --test` (Node 22 strips TS natively). BE: Spring Boot 4.1.1, Java 17, Maven wrapper, JPA/Hibernate, Flyway, Postgres, springdoc, JUnit + MockMvc + H2, Docker.

**Spec:** `docs/superpowers/specs/2026-09-20-invitation-core-phase1-design.md`

## STATUS / HANDOFF (read this first; last updated 2026-09-21)

> The live progress log is `PROGRESS.md` at the FE repo root: update it after every meaningful step. This section is the stable summary. **Completion (2026-09-21, end of session): whole project ≈ 44% (Phase 2 marketing is code-complete at ≈ 70%, see `docs/superpowers/plans/2026-09-21-marketing-phase2.md`), Phase 1 ≈ 93% (code done, browser QA passed; T28 deploy and T29 git wait on the owner). 10 templates now (added thanh-ngoc, thuy-mac, so-xuan / new archetype `korean`); ignore the older "7 templates" and "PARTIAL" notes below where they conflict.** `PROGRESS.md` §1 has the calculation, §3 the full roadmap to the end (T25-T29 finish Phase 1: template QA, 3 new templates, hardening, deploy, git; then Phases 2-6), §4 what is blocked on the owner.

Two repos: FE `/Users/nguyenanhnhut/Desktop/Projects/thiep-cuoi-online-project` (branch `feat/invitation-core-phase1`, NOTHING committed yet) and BE `/Users/nguyenanhnhut/Desktop/Projects/Thiep-cuoi-online-backend` (not a git repo). Read `README.md` (FE) and `CLAUDE.md` (BE) for run instructions. No subagent is running; the styling agent died on an API spend limit (see T7/T8).

**Run it:** `docker compose up -d db` (BE repo, Postgres :5433) → BE: `./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8090` (8080 is taken by the user's Ecomerce stack; mgmt port 8081) → FE: `npm run dev` (:3000) with `.env.local` `NEXT_PUBLIC_API_BASE_URL=http://localhost:8090` (gitignored, already present). Gates: FE `npm test` (58 pass), `npm run typecheck`, `npm run build` (passes, 20 routes); BE `./mvnw test` (52 pass).

| Task | State | Notes |
|---|---|---|
| 1 toolchain | DONE | `dist/` and `scripts/site-smoke.test.mjs` NOT deleted (`rm -rf` was denied): run `git rm -r dist scripts/site-smoke.test.mjs` if the user agrees. `next dev` auto-created untracked `AGENTS.md`/`CLAUDE.md` (Next 16.3 agent rules; harmless). |
| 2-5 lib logic | DONE | `content` (+`persistable`), `datetime` (+`earliestEvent`), `ics`, `vietqr`, `banks`, `maps`, `slug`, `templates`, `fonts`, `api`, `local-invitations` (+`parseEditLink`, `editLink`, `invitationTitle`), `image-compress`, `list`, `bank-name`. All unit-tested. |
| 6 renderer | DONE | `components/invitation/*`. Libraries: yet-another-react-lightbox (album), canvas-confetti (RSVP "will come", publish), auto-animate (wishes). The invitation `Reveal` stays hand-written on purpose: guests must read content without JS. |
| 7-8 archetypes | **PARTIAL** | Agent died mid-run without a report. `arch-minimal/classic/botanical/traditional.css`, `ornaments.tsx`, `invitation.css`, `Cover.tsx` were edited by it. Seen OK on the home carousel: Lụa Son, Gallery Noir, Maison Blanc, Wild Garden. NOT verified: Soft Type, Olive Story, Afterglow full pages; covers without a hero photo; envelope per template (`/templates/<id>?gate=1&to=Chú%20Ba`); 1280px; contrast; overflow. The two extra templates it was asked to add (`thanh-ngoc`, `thuy-mac`) were NOT added. |
| 9 gallery + sitemap | DONE | `/templates` filter chips, cards = scaled real covers; sitemap generated from the registry. |
| 10-18 backend | DONE | Spring Boot 4.1.1, 52 tests. JSON columns = `@JdbcTypeCode(SqlTypes.JSON) String` + `jsonb` (proven on H2 and Postgres). Live Supabase upload UNVERIFIED (needs `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, public bucket `media`); without them upload returns 503 and the UI shows a friendly message. |
| 19 public page | DONE | `/invite/[slug]?to=`; unpublished/unknown → 404 page; BE down → `error.tsx`. |
| 20-23 Studio | DONE | Home, Editor (autosave, live phone preview, 7 tabs, panels kept mounted so uploads survive tab switches), publish dialog, responses panel. Verified live end to end: create → edit → autosave → publish → guest opens link with `?to=` → RSVP + wish → owner sees summary → hides wish → public page no longer shows it. |
| 24 wrap-up | PARTIAL | README done. Still to do: error-path sweep (wrong key 403 screen, duplicate slug 409, throttle 429, oversized upload 413), accessibility pass (keyboard-only, Lighthouse), Studio panel visual polish (agent flagged: white cards on white, template grid, photo grid, toggle focus ring), mobile check of every tab. |

**Product directions given by the owner (all apply):** (1) feature parity with chungdoi.com but an original design; (2) backend in its own repo, Spring Boot; (3) design must be modern, bright (sáng sủa), luxurious, impressive, with a touch of classical Chinese wedding tradition (lacquer red, gold, jade, lattice, seal, 囍); the design system is in `app/globals.css` and spec §7; (4) integrate good animation/slider/lightbox libraries (done: motion, embla-carousel-react, yet-another-react-lightbox, canvas-confetti, @formkit/auto-animate, lucide-react; rejected Lenis/GSAP/Lottie/Swiper as heavy or hostile to accessibility); (5) the owner asked to use real Korean celebrity wedding photos: REFUSED (copyright + likeness rights); instead build an original K-wedding-style template.

**Next steps, in order:**
1. Visual QA of all 7 templates (390×844 and 1280×900, with/without hero photo, envelope, no console errors); fix at the root cause (shared bugs in `invitation.css`, archetype bugs in `arch-*.css`).
2. Add templates: `thanh-ngoc` (deep jade + gold + ivory, moon gate) and `thuy-mac` (ivory rice paper, ink type, one vermilion seal with 囍 or initials, ink-wash stroke), both `archetype: "traditional"`, fonts `notoDisplay` + `jakarta`; and `so-xuan` (K-wedding feel: hanji cream paper, dusty rose + sage, rounded arch, film/polaroid photo frames, thin serif + `allura`), which needs a NEW archetype `korean` (update `archetypes` in `lib/templates.ts`, the `KICKER` map in `sections/Cover.tsx`, the `LABEL` map in `app/templates/page.tsx`, a new `arch-korean.css` imported by `InvitationRenderer.tsx`). `tests/templates.test.ts` asserts count and WCAG AA for every palette pair (ratio helper included): update the count and keep every pair ≥ 4.5:1. Home copy says "Mỗi mẫu, một tâm trạng" (no number) so it needs no change.
3. Finish T24 items above; then decide git (create commits per repo, `git init` the backend) with the owner.
4. Later phases (spec §2): marketing pages (pricing, features/*, help, blog, legal), guest manager, 8 free tools, i18n, video, accounts + billing.

**Gotchas for the next agent:** `next/font` loaders must be module-scope consts with literal options; font CSS variables must sit on `<html>`. `node --test` strips types but rejects parameter properties/enums (`erasableSyntaxOnly` is on). The Playwright MCP browser is shared and headed: call `page.bringToFront()` before every screenshot or it hangs; write screenshots under `.playwright-mcp/` (git-ignored) and combine them with PIL. The 囍 glyph is a self-hosted 1KB font subset (`public/fonts/moc-xi.woff2`, class `.xi`). External services used by the UI: `img.vietqr.io` (gift QR), `api.qrserver.com` (QR of the public link), Google Maps embeds; each has a text fallback except the link QR. Throttling is in-memory (single instance). Losing the edit link = losing edit access (by design; accounts come in Phase 6). Dev DB currently holds test invitations (e.g. slug `khoa-lan`).

**Deviations from the spec (decided while planning):**
- `content.events[].lunar` (text ≤ 60) added: Vietnamese invitations commonly show the lunar date; user-typed, not computed.
- `invitations.published_at` column added: set on first publish, never cleared. Slug is locked once it is set.
- `content.couple.heroPhoto` is a string (`""` = none), not optional; all "empty" values are `""` so the draft stays schema-valid while typing.
- `Template.fonts` gets an optional `script` font (botanical/traditional accent).
- `publishIssues` also flags names still equal to the sample names (`Minh` / `An`).
- New public route `/templates/[id]`: live preview of a template with sample content (needs no backend).
- **Backend lives in its own repo** (user request, mid-planning). Stack chosen: Spring Boot 4.1.1 / Java 17 mirroring `Ecomerce-Backend`. Consequences: no Next route handlers, no `@supabase/supabase-js` in FE, `edit-key` / `throttle` / media rules / RSVP summary are Java, media goes FE → BE (multipart) → Supabase Storage, and the API paths are `/api/invitations/**` and `/api/public/invitations/**` (see spec 6.4).

**Scope note on UI tasks:** logic tasks carry full code + tests. UI tasks carry exact file lists, prop contracts, CSS-variable contract, design brief and acceptance checks; visual craft is verified with screenshots at 390px and 1280px, not with unit tests.

## Global Constraints

- Node 22 (`v22.22.3` installed); `next@^16.3.5`, `react@^19.1.0`.
- UI language: Vietnamese only. Times are `Asia/Ho_Chi_Minh`, fixed offset `+07:00`.
- Fonts: every family must ship the `vietnamese` subset (verified by rendering candidates). A page loads only the families of the template it shows (`fontClassesFor`); marketing pages load Noto Serif Display + Plus Jakarta Sans. `next/font` needs each loader called as a module-scope const with literal options.
- All template names, copy and visuals are original. Nothing copied from chungdoi.com. Design direction from the product owner: modern, bright, luxurious, impressive, with a touch of classical Chinese wedding tradition (see spec section 7).
- Secrets (DB password, `SUPABASE_SERVICE_ROLE_KEY`) exist only in the backend. Bucket `media`: public read, 8 MB, mime `image/webp,image/jpeg,image/png,audio/mpeg`.
- Untrusted URLs (`mapUrl`, media) must be `http(s)`; images must live under the invitation's own storage prefix. The BE enforces this; FE checks are convenience only.
- Backend follows `Ecomerce-Backend` conventions: package-by-layer, Maven wrapper, no interfaces with a single implementation (except `MediaStorage`, a test seam), Boot 4 / Jackson 3 imports (`tools.jackson.databind`). Read its `CLAUDE.md` before writing BE code.
- API contract (spec 6.4) is the seam between repos; the FE `lib/api.ts` and BE controllers must match it exactly.
- No commits unless the user asks; before the first commit create a feature branch (repo is on `main`).
- Unit-tested FE `lib/` modules import siblings with a `.ts` extension, use `import type` for types, and never import `@/` aliases or framework code.
- FE verification gate per task: `npm test`, `npm run typecheck`; plus `npm run build` at the end of each milestone. BE gate: `./mvnw test`.

## File Structure

**Frontend repo** (`thiep-cuoi-online-project`):
```
.gitignore  .env.example
lib/  slug.ts content.ts datetime.ts ics.ts vietqr.ts banks.ts templates.ts fonts.ts
      api.ts local-invitations.ts image-compress.ts
tests/*.test.ts
components/invitation/  InvitationRenderer.tsx invitation.css ornaments.tsx
      sections/*.tsx  client/*.tsx
components/studio/      StudioHome.tsx Editor.tsx PreviewFrame.tsx panels/*.tsx PublishDialog.tsx ResponsesPanel.tsx studio.css
app/templates/page.tsx  app/templates/[id]/page.tsx  app/templates/[id]/layout.tsx
app/invite/[slug]/page.tsx  app/invite/[slug]/layout.tsx
app/studio/page.tsx  app/studio/[id]/page.tsx  app/studio/layout.tsx
public/sample/photo-1..6.svg
```

**Backend repo** (`Thiep-cuoi-online-backend`, base package `com.moc.wedding`):
```
pom.xml  mvnw  Dockerfile  docker-compose.yml  CLAUDE.md  .env.example  .gitignore
src/main/resources/application.yml  db/migration/V1__init.sql
controller/  InvitationController PublicInvitationController ResponsesController MediaController
service/     InvitationService RsvpService WishService MediaService EditKeyService ThrottleService
repository/  InvitationRepository RsvpRepository WishRepository
entity/      Invitation Rsvp Wish
dto/         InvitationContent + request/response records
config/      AppProperties CorsConfig ApiExceptionHandler
storage/     MediaStorage SupabaseMediaStorage
src/test/...  *Test / *IT (H2 + MockMvc)
```

---

## Milestone 0 — Toolchain

### Task 1: Toolchain baseline + TDD harness (slug)

**Files:**
- Create: `.gitignore`, `.env.example`, `lib/slug.ts`, `tests/slug.test.ts`
- Modify: `package.json`, `tsconfig.json`
- Delete: `dist/`, `scripts/site-smoke.test.mjs`

**Interfaces:**
- Produces: `slugify(input: string): string`, `isValidSlug(s: string): boolean`, `randomSlug(): string` from `lib/slug.ts`.

- [ ] **Step 1: Repo hygiene**

Create `.gitignore`:
```
node_modules
.next
.env*
!.env.example
*.tsbuildinfo
.DS_Store
```
Create `.env.example`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```
Run: `git rm -r -q dist scripts/site-smoke.test.mjs`

- [ ] **Step 2: Install and add dependencies**

Run: `npm install && npm install zod`
Expected: no resolution errors. If Next 16 / React 19 fail to resolve, stop and report.

- [ ] **Step 3: Update `package.json` scripts and `tsconfig.json`**

`package.json` scripts: `"test": "node --test \"tests/**/*.test.ts\""`. Replace `"lint": "next lint"` only if `npx next lint --help` fails (Next 16 removed it); then drop the script.
`tsconfig.json` `compilerOptions`: add `"allowImportingTsExtensions": true`.

- [ ] **Step 4: Write the failing test** `tests/slug.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { slugify, isValidSlug, randomSlug } from "../lib/slug.ts";

test("slugify strips Vietnamese diacritics and joins with hyphens", () => {
  assert.equal(slugify("Nguyễn Minh & Trần Ánh"), "nguyen-minh-tran-anh");
  assert.equal(slugify("Đặng Đức"), "dang-duc");
});
test("slugify collapses junk and caps at 40 chars", () => {
  assert.equal(slugify("  --A   B--  "), "a-b");
  assert.ok(slugify("a".repeat(80)).length <= 40);
});
test("isValidSlug", () => {
  assert.equal(isValidSlug("minh-va-an"), true);
  for (const bad of ["ab", "-abc", "abc-", "a--b", "Abc", "a b", "a".repeat(41)]) assert.equal(isValidSlug(bad), false, bad);
});
test("randomSlug is 8 valid chars and varies", () => {
  const a = randomSlug(), b = randomSlug();
  assert.match(a, /^[a-z0-9]{8}$/);
  assert.equal(isValidSlug(a), true);
  assert.notEqual(a, b);
});
```

- [ ] **Step 5: Run to verify it fails**

Run: `npm test`
Expected: FAIL, cannot find `../lib/slug.ts`. (If the runner itself cannot execute `.ts`, fix the harness first: check `node -v` ≥ 22.18.)

- [ ] **Step 6: Implement** `lib/slug.ts`

```ts
const MAX = 40;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX)
    .replace(/-+$/g, "");
}

export function isValidSlug(s: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s) && s.length >= 3 && s.length <= MAX;
}

export function randomSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
```

- [ ] **Step 7: Verify tests, types, build**

Run: `npm test && npm run typecheck && npm run build`
Expected: tests pass; typecheck clean; build succeeds.

- [ ] **Step 8: Verify fonts before designing around them**

Run:
```bash
node -e "const p=require('path');const f=require('fs');const g=(d)=>f.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?g(p.join(d,e.name)):[p.join(d,e.name)]);const j=g('node_modules/next/dist/compiled/@next/font').find(x=>x.endsWith('font-data.json'));const d=require('./'+j);for(const n of ['DM Sans','Playfair Display','Cormorant Garamond','Be Vietnam Pro','Dancing Script'])console.log(n,d[n]&&d[n].subsets)"
```
Expected: each family lists `vietnamese`. Record any that lack it and replace that family in Task 5 (fonts) and in the root `app/layout.tsx` (which currently loads only `latin`).

- [ ] **Step 9: Checkpoint** — `git status` shows only intended changes; do not commit unless asked.

---

## Milestone 1 — Pure logic

### Task 2: Content schema

**Files:**
- Create: `lib/content.ts`, `tests/content.test.ts`

**Interfaces:**
- Produces: `contentSchema` (zod), `type Content`, `type EventItem`, `EVENT_KINDS`, `MAX_EVENTS=6`, `MAX_ALBUM=24`, `MAX_QUESTIONS=3`, `MAX_ACCOUNTS=2`, `SAMPLE_NAMES`, `defaultContent(now?: Date): Content` (schema-valid), `sampleContent(now?: Date): Content` (rich preview data, NOT schema-valid: album uses root-relative `/sample/*.svg`), `publishIssues(c: Content): string[]`.

- [ ] **Step 1: Write the failing test** `tests/content.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { contentSchema, defaultContent, sampleContent, publishIssues, SAMPLE_NAMES, MAX_EVENTS } from "../lib/content.ts";

const NOW = new Date("2026-09-20T00:00:00Z");

test("defaultContent passes the schema and has future events", () => {
  const c = defaultContent(NOW);
  const r = contentSchema.safeParse(c);
  assert.equal(r.success, true, r.success ? "" : JSON.stringify(r.error.issues));
  for (const e of c.events) assert.ok(e.date > "2026-09-20", e.date);
});

test("schema rejects non-http(s) urls", () => {
  const c = defaultContent(NOW);
  c.couple.heroPhoto = "javascript:alert(1)";
  assert.equal(contentSchema.safeParse(c).success, false);
  c.couple.heroPhoto = "";
  c.events[0].mapUrl = "data:text/html,x";
  assert.equal(contentSchema.safeParse(c).success, false);
  c.events[0].mapUrl = "https://maps.google.com/?q=x";
  assert.equal(contentSchema.safeParse(c).success, true);
});

test("schema enforces limits", () => {
  const c = defaultContent(NOW);
  c.events = Array.from({ length: MAX_EVENTS + 1 }, (_, i) => ({ ...c.events[0], id: `e${i}` }));
  assert.equal(contentSchema.safeParse(c).success, false);
  const d = defaultContent(NOW);
  d.couple.message = "x".repeat(501);
  assert.equal(contentSchema.safeParse(d).success, false);
  const g = defaultContent(NOW);
  g.gift.accounts = [{ holder: "groom", bankCode: "970436", accountNumber: "12ab", accountName: "A" }];
  assert.equal(contentSchema.safeParse(g).success, false);
});

test("publishIssues flags empty and sample names, passes real names", () => {
  const c = defaultContent(NOW);
  assert.equal(c.couple.groom.name, SAMPLE_NAMES.groom);
  assert.equal(publishIssues(c).length, 1);
  c.couple.groom.name = "";
  assert.equal(publishIssues(c).length, 1);
  c.couple.groom.name = "Khoa"; c.couple.bride.name = "Lan";
  assert.deepEqual(publishIssues(c), []);
});

test("sampleContent is richer than the default", () => {
  const s = sampleContent(NOW);
  assert.ok(s.album.length >= 6);
  assert.equal(s.gift.enabled, true);
});
```

- [ ] **Step 2: Run to verify it fails** — `npm test`. Expected: cannot find `../lib/content.ts`.

- [ ] **Step 3: Implement** `lib/content.ts`

```ts
import { z } from "zod";

export const MAX_EVENTS = 6;
export const MAX_ALBUM = 24;
export const MAX_QUESTIONS = 3;
export const MAX_ACCOUNTS = 2;
export const EVENT_KINDS = ["engagement", "ceremony", "reception", "custom"] as const;

// Drafts are autosaved while typing, so every "empty" value is "" and stays valid.
const text = (max: number) => z.string().max(max);
const httpUrl = z.string().max(500).refine((v) => /^https?:\/\/\S+$/i.test(v), "URL không hợp lệ");
const optionalUrl = z.union([z.literal(""), httpUrl]);
const dateStr = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/);
const timeStr = z.string().regex(/^(\d{2}:\d{2})?$/);
const id = z.string().min(1).max(40);

const side = z.object({ father: text(60), mother: text(60), address: text(200) });

export const eventSchema = z.object({
  id,
  kind: z.enum(EVENT_KINDS),
  title: text(80),
  date: dateStr,
  time: timeStr,
  lunar: text(60),
  venue: text(120),
  address: text(200),
  mapUrl: optionalUrl,
});

export const contentSchema = z.object({
  v: z.literal(1),
  couple: z.object({
    groom: z.object({ name: text(60) }),
    bride: z.object({ name: text(60) }),
    message: text(500),
    heroPhoto: optionalUrl,
  }),
  family: z.object({ groomSide: side, brideSide: side }),
  events: z.array(eventSchema).max(MAX_EVENTS),
  album: z.array(z.object({ url: httpUrl, alt: text(120) })).max(MAX_ALBUM),
  music: z.object({ url: httpUrl, title: text(80) }).nullable(),
  rsvp: z.object({
    enabled: z.boolean(),
    deadline: dateStr,
    questions: z
      .array(z.object({ id, label: text(120), type: z.enum(["text", "yesno"]) }))
      .max(MAX_QUESTIONS),
  }),
  guestbook: z.object({ enabled: z.boolean() }),
  gift: z.object({
    enabled: z.boolean(),
    note: text(300),
    accounts: z
      .array(
        z.object({
          holder: z.enum(["groom", "bride"]),
          bankCode: text(20),
          accountNumber: z.string().regex(/^\d{0,20}$/),
          accountName: text(80),
        }),
      )
      .max(MAX_ACCOUNTS),
  }),
  thanks: z.object({ message: text(500) }),
});

export type Content = z.infer<typeof contentSchema>;
export type EventItem = Content["events"][number];

export const SAMPLE_NAMES = { groom: "Minh", bride: "An" } as const;

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
const daysFrom = (now: Date, n: number) => new Date(now.getTime() + n * 86_400_000);

export function defaultContent(now: Date = new Date()): Content {
  const day = isoDate(daysFrom(now, 75));
  return {
    v: 1,
    couple: {
      groom: { name: SAMPLE_NAMES.groom },
      bride: { name: SAMPLE_NAMES.bride },
      message:
        "Chúng mình sắp về chung một nhà. Rất mong bạn đến chung vui và chúc phúc cho ngày trọng đại của hai đứa.",
      heroPhoto: "",
    },
    family: {
      groomSide: { father: "Ông Nguyễn Văn Hòa", mother: "Bà Trần Thị Lan", address: "Quận 1, TP. Hồ Chí Minh" },
      brideSide: { father: "Ông Lê Quang Minh", mother: "Bà Phạm Thị Thu", address: "Quận 3, TP. Hồ Chí Minh" },
    },
    events: [
      { id: "ceremony", kind: "ceremony", title: "Lễ thành hôn", date: day, time: "10:00", lunar: "", venue: "Tư gia nhà trai", address: "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", mapUrl: "" },
      { id: "reception", kind: "reception", title: "Tiệc cưới", date: day, time: "18:00", lunar: "", venue: "Nhà hàng Hoa Sen", address: "45 Lê Lợi, Quận 1, TP. Hồ Chí Minh", mapUrl: "" },
    ],
    album: [],
    music: null,
    rsvp: { enabled: true, deadline: "", questions: [] },
    guestbook: { enabled: true },
    gift: { enabled: false, note: "Sự hiện diện của bạn là niềm vui lớn nhất của chúng mình.", accounts: [] },
    thanks: { message: "Cảm ơn bạn đã dành thời gian và tình cảm cho chúng mình." },
  };
}

// Preview data for /templates/[id]. Album paths are root-relative, so this is intentionally
// not schema-valid: it is only ever rendered, never sent to the API.
export function sampleContent(now: Date = new Date()): Content {
  const base = defaultContent(now);
  return {
    ...base,
    couple: { ...base.couple, heroPhoto: "/sample/photo-1.svg" },
    album: [1, 2, 3, 4, 5, 6].map((n) => ({ url: `/sample/photo-${n}.svg`, alt: `Ảnh cưới ${n}` })),
    rsvp: { enabled: true, deadline: "", questions: [{ id: "q1", label: "Bạn có cần chỗ đậu xe không?", type: "yesno" }] },
    gift: {
      enabled: true,
      note: base.gift.note,
      accounts: [
        { holder: "groom", bankCode: "970436", accountNumber: "0123456789", accountName: "NGUYEN VAN MINH" },
        { holder: "bride", bankCode: "970407", accountNumber: "9876543210", accountName: "LE THI AN" },
      ],
    },
  };
}

export function publishIssues(c: Content): string[] {
  const groom = c.couple.groom.name.trim();
  const bride = c.couple.bride.name.trim();
  if (!groom || !bride) return ["Hãy nhập tên cả chú rể và cô dâu."];
  if (groom === SAMPLE_NAMES.groom && bride === SAMPLE_NAMES.bride) {
    return ["Tên cô dâu chú rể vẫn là tên mẫu, hãy đổi thành tên của bạn."];
  }
  return [];
}
```

- [ ] **Step 4: Verify** — `npm test && npm run typecheck`. Expected: all pass.
- [ ] **Step 5: Checkpoint** — no commit unless asked.

### Task 3: Date/time, calendar, VietQR, banks (FE `lib/`)

**Files:**
- Create: `lib/datetime.ts`, `lib/ics.ts`, `lib/vietqr.ts`, `lib/banks.ts`
- Test: `tests/datetime.test.ts`, `tests/ics.test.ts`, `tests/vietqr.test.ts`, `tests/banks.test.ts`

**Interfaces:**
- Produces:
  - `lib/datetime.ts`: `TZ_OFFSET = "+07:00"`, `eventStart(ev: {date: string; time: string}): Date | null`, `nextEvent<T extends {date: string; time: string}>(events: readonly T[], now: Date): T | null`, `remaining(target: Date, now: Date): {days: number; hours: number; minutes: number; seconds: number}`, `formatDateVi(date: string): string`
  - `lib/ics.ts`: `type CalendarEvent = {title: string; date: string; time: string; venue: string; address: string}`, `toIcs(ev: CalendarEvent, uid: string, now?: Date): string | null`, `googleCalendarUrl(ev: CalendarEvent): string | null`
  - `lib/vietqr.ts`: `type GiftAccount = {holder: "groom" | "bride"; bankCode: string; accountNumber: string; accountName: string}`, `isAccountComplete(a: GiftAccount): boolean`, `vietQrUrl(a: GiftAccount, addInfo?: string): string`
  - `lib/banks.ts`: `type Bank = {bin: string; name: string}`, `BANKS: readonly Bank[]`, `bankName(bin: string): string`

- [ ] **Step 1: Write failing tests**

`tests/datetime.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { eventStart, nextEvent, remaining, formatDateVi } from "../lib/datetime.ts";

test("eventStart reads wall-clock time as +07:00", () => {
  assert.equal(eventStart({ date: "2026-11-08", time: "10:00" })?.toISOString(), "2026-11-08T03:00:00.000Z");
  assert.equal(eventStart({ date: "2026-11-08", time: "" })?.toISOString(), "2026-11-07T17:00:00.000Z");
  assert.equal(eventStart({ date: "", time: "10:00" }), null);
  assert.equal(eventStart({ date: "2026-13-45", time: "10:00" }), null);
});

test("nextEvent picks the earliest future event, ignoring past and undated", () => {
  const now = new Date("2026-11-08T05:00:00Z"); // 12:00 +07
  const past = { id: "past", date: "2026-11-08", time: "10:00" };
  const soon = { id: "soon", date: "2026-11-08", time: "18:00" };
  const later = { id: "later", date: "2026-11-09", time: "09:00" };
  const undated = { id: "undated", date: "", time: "" };
  assert.equal(nextEvent([later, undated, past, soon], now)?.id, "soon");
  assert.equal(nextEvent([past], now), null);
});

test("remaining splits a duration and clamps at zero", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const t = new Date(now.getTime() + ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000);
  assert.deepEqual(remaining(t, now), { days: 2, hours: 3, minutes: 4, seconds: 5 });
  assert.deepEqual(remaining(now, t), { days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test("formatDateVi gives weekday + dd/mm/yyyy, empty for bad input", () => {
  assert.equal(formatDateVi("2026-11-08"), "Chủ nhật, 08/11/2026");
  assert.equal(formatDateVi("2026-11-09"), "Thứ hai, 09/11/2026");
  assert.equal(formatDateVi(""), "");
  assert.equal(formatDateVi("2026-02-31"), "");
});
```

`tests/ics.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { toIcs, googleCalendarUrl } from "../lib/ics.ts";

const ev = { title: "Tiệc cưới, Minh & An", date: "2026-11-08", time: "18:00", venue: "Nhà hàng Hoa Sen", address: "45 Lê Lợi, Quận 1" };
const NOW = new Date("2026-09-20T00:00:00Z");

test("toIcs converts +07:00 to UTC, defaults to 2 hours, escapes commas, uses CRLF", () => {
  const ics = toIcs(ev, "uid-1@moc", NOW)!;
  assert.match(ics, /DTSTART:20261108T110000Z\r\n/);
  assert.match(ics, /DTEND:20261108T130000Z\r\n/);
  assert.match(ics, /DTSTAMP:20260920T000000Z\r\n/);
  assert.match(ics, /SUMMARY:Tiệc cưới\\, Minh & An\r\n/);
  assert.match(ics, /LOCATION:Nhà hàng Hoa Sen\\, 45 Lê Lợi\\, Quận 1\r\n/);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
});

test("toIcs returns null without a date", () => {
  assert.equal(toIcs({ ...ev, date: "" }, "u", NOW), null);
});

test("long lines fold at 75 octets and unfold losslessly", () => {
  const long = { ...ev, title: "Lễ thành hôn của Nguyễn Văn Minh và Trần Thị Ánh ".repeat(4) };
  const ics = toIcs(long, "u", NOW)!;
  const enc = new TextEncoder();
  for (const line of ics.split("\r\n")) assert.ok(enc.encode(line).length <= 75, line);
  assert.ok(ics.replace(/\r\n /g, "").includes("SUMMARY:" + long.title));
});

test("googleCalendarUrl carries title, UTC range and location", () => {
  const url = new URL(googleCalendarUrl(ev)!);
  assert.equal(url.origin + url.pathname, "https://calendar.google.com/calendar/render");
  assert.equal(url.searchParams.get("action"), "TEMPLATE");
  assert.equal(url.searchParams.get("text"), ev.title);
  assert.equal(url.searchParams.get("dates"), "20261108T110000Z/20261108T130000Z");
  assert.equal(url.searchParams.get("location"), "Nhà hàng Hoa Sen, 45 Lê Lợi, Quận 1");
  assert.equal(googleCalendarUrl({ ...ev, date: "" }), null);
});
```

`tests/vietqr.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { vietQrUrl, isAccountComplete } from "../lib/vietqr.ts";

const acc = { holder: "groom", bankCode: "970436", accountNumber: "0123456789", accountName: "NGUYEN VAN MINH" } as const;

test("vietQrUrl builds the compact2 image URL", () => {
  assert.equal(vietQrUrl(acc), "https://img.vietqr.io/image/970436-0123456789-compact2.png?accountName=NGUYEN%20VAN%20MINH");
  assert.equal(
    vietQrUrl(acc, "Mung cuoi"),
    "https://img.vietqr.io/image/970436-0123456789-compact2.png?accountName=NGUYEN%20VAN%20MINH&addInfo=Mung%20cuoi",
  );
});

test("isAccountComplete needs bank, 6-20 digit number and holder name", () => {
  assert.equal(isAccountComplete(acc), true);
  assert.equal(isAccountComplete({ ...acc, bankCode: "" }), false);
  assert.equal(isAccountComplete({ ...acc, accountNumber: "123" }), false);
  assert.equal(isAccountComplete({ ...acc, accountName: "  " }), false);
});
```

`tests/banks.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { BANKS, bankName } from "../lib/banks.ts";

test("bank bins are unique 6-digit codes with names", () => {
  const bins = BANKS.map((b) => b.bin);
  assert.equal(new Set(bins).size, bins.length);
  for (const b of BANKS) { assert.match(b.bin, /^\d{6}$/); assert.ok(b.name.length > 0); }
});

test("bankName resolves a bin and falls back to the raw code", () => {
  assert.equal(bankName("970436"), "Vietcombank");
  assert.equal(bankName("999999"), "999999");
});
```

- [ ] **Step 2: Run to verify failure** — `npm test`. Expected: 4 files fail with "Cannot find module".

- [ ] **Step 3: Implement**

`lib/datetime.ts`:
```ts
export const TZ_OFFSET = "+07:00";
const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export function eventStart(ev: { date: string; time: string }): Date | null {
  if (!ev.date) return null;
  const d = new Date(`${ev.date}T${ev.time || "00:00"}:00${TZ_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function nextEvent<T extends { date: string; time: string }>(events: readonly T[], now: Date): T | null {
  let best: T | null = null;
  let bestTime = Infinity;
  for (const e of events) {
    const t = eventStart(e)?.getTime();
    if (t !== undefined && t > now.getTime() && t < bestTime) { best = e; bestTime = t; }
  }
  return best;
}

export function remaining(target: Date, now: Date) {
  const s = Math.floor(Math.max(0, target.getTime() - now.getTime()) / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export function formatDateVi(date: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return "";
  const utc = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (utc.getUTCMonth() !== Number(m[2]) - 1) return "";
  return `${WEEKDAYS[utc.getUTCDay()]}, ${m[3]}/${m[2]}/${m[1]}`;
}
```

`lib/ics.ts`:
```ts
import { eventStart } from "./datetime.ts";

export type CalendarEvent = { title: string; date: string; time: string; venue: string; address: string };

const DURATION_MS = 2 * 60 * 60 * 1000;
const utc = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const where = (ev: CalendarEvent) => [ev.venue, ev.address].filter(Boolean).join(", ");

function fold(line: string): string {
  const enc = new TextEncoder();
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const n = enc.encode(ch).length;
    if (bytes + n > 75) { out.push(cur); cur = " " + ch; bytes = 1 + n; }
    else { cur += ch; bytes += n; }
  }
  out.push(cur);
  return out.join("\r\n");
}

export function toIcs(ev: CalendarEvent, uid: string, now: Date = new Date()): string | null {
  const start = eventStart(ev);
  if (!start) return null;
  const end = new Date(start.getTime() + DURATION_MS);
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MOC Wedding//VI", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${utc(now)}`, `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`,
    `SUMMARY:${escapeText(ev.title)}`, `LOCATION:${escapeText(where(ev))}`,
    "END:VEVENT", "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(ev: CalendarEvent): string | null {
  const start = eventStart(ev);
  if (!start) return null;
  const end = new Date(start.getTime() + DURATION_MS);
  const q = new URLSearchParams({ action: "TEMPLATE", text: ev.title, dates: `${utc(start)}/${utc(end)}`, location: where(ev) });
  return `https://calendar.google.com/calendar/render?${q}`;
}
```

`lib/vietqr.ts`:
```ts
export type GiftAccount = { holder: "groom" | "bride"; bankCode: string; accountNumber: string; accountName: string };

export const isAccountComplete = (a: GiftAccount) =>
  a.bankCode !== "" && /^\d{6,20}$/.test(a.accountNumber) && a.accountName.trim() !== "";

export function vietQrUrl(a: GiftAccount, addInfo = ""): string {
  const enc = encodeURIComponent;
  const info = addInfo ? `&addInfo=${enc(addInfo)}` : "";
  return `https://img.vietqr.io/image/${enc(a.bankCode)}-${a.accountNumber}-compact2.png?accountName=${enc(a.accountName.trim())}${info}`;
}
```

`lib/banks.ts` (BINs from `https://api.vietqr.io/v2/banks`, transfer-supported only):
```ts
export type Bank = { bin: string; name: string };

export const BANKS: readonly Bank[] = [
  { bin: "970436", name: "Vietcombank" }, { bin: "970415", name: "VietinBank" }, { bin: "970418", name: "BIDV" },
  { bin: "970405", name: "Agribank" }, { bin: "970407", name: "Techcombank" }, { bin: "970422", name: "MB Bank" },
  { bin: "970416", name: "ACB" }, { bin: "970432", name: "VPBank" }, { bin: "970423", name: "TPBank" },
  { bin: "970403", name: "Sacombank" }, { bin: "970437", name: "HDBank" }, { bin: "970441", name: "VIB" },
  { bin: "970443", name: "SHB" }, { bin: "970448", name: "OCB" }, { bin: "970426", name: "MSB" },
  { bin: "970440", name: "SeABank" }, { bin: "970449", name: "LPBank" }, { bin: "970431", name: "Eximbank" },
  { bin: "970429", name: "SCB" }, { bin: "970428", name: "Nam A Bank" }, { bin: "970409", name: "Bac A Bank" },
  { bin: "970425", name: "ABBank" }, { bin: "970412", name: "PVcomBank" }, { bin: "970419", name: "NCB" },
  { bin: "970427", name: "VietABank" }, { bin: "970438", name: "BaoViet Bank" }, { bin: "970452", name: "KienlongBank" },
  { bin: "970454", name: "Bản Việt (VietCapitalBank)" }, { bin: "963388", name: "Timo" },
  { bin: "546034", name: "CAKE by VPBank" }, { bin: "546035", name: "Ubank by VPBank" },
];

export const bankName = (bin: string): string => BANKS.find((b) => b.bin === bin)?.name ?? bin;
```

- [ ] **Step 4: Verify** — `npm test && npm run typecheck`. Expected: all pass.
- [ ] **Step 5: Verify the VietQR URL shape against the live service**

Run: `curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "https://img.vietqr.io/image/970436-0123456789-compact2.png?accountName=NGUYEN%20VAN%20MINH"`
Expected: `200 image/png`.
- [ ] **Step 6: Checkpoint** — no commit unless asked.

### Task 4: Template registry + fonts

**Files:**
- Create: `lib/templates.ts`, `lib/fonts.ts`, `tests/templates.test.ts`
- Modify: `app/layout.tsx` (add `vietnamese` subset where Task 1 Step 8 says it is supported)

**Interfaces:**
- Produces: `archetypes`, `type Archetype`, `type FontKey = "playfair"|"cormorant"|"bevietnam"|"script"`, `type Palette`, `type Template`, `templates: readonly Template[]` (7), `getTemplate(id: string): Template | undefined`, `DEFAULT_TEMPLATE_ID`, `FONT_VARS: Record<FontKey, string>`; `invitationFontClasses: string` from `lib/fonts.ts` (className to put on the wrapper of `/invite`, `/studio`, `/templates/[id]`).

- [ ] **Step 1: Write the failing test** `tests/templates.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { templates, getTemplate, DEFAULT_TEMPLATE_ID, archetypes, FONT_VARS } from "../lib/templates.ts";

const channel = (v: number) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (hex: string) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255); };
const ratio = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

test("seven templates with unique ids and names", () => {
  assert.equal(templates.length, 7);
  assert.equal(new Set(templates.map((t) => t.id)).size, 7);
  assert.equal(new Set(templates.map((t) => t.name)).size, 7);
});

test("default template exists and getTemplate misses cleanly", () => {
  assert.ok(getTemplate(DEFAULT_TEMPLATE_ID));
  assert.equal(getTemplate("nope"), undefined);
});

test("every archetype is used at least once", () => {
  for (const a of archetypes) assert.ok(templates.some((t) => t.archetype === a), a);
});

test("palettes are hex and every text pair meets WCAG AA 4.5:1", () => {
  const pairs: [keyof (typeof templates)[number]["palette"], keyof (typeof templates)[number]["palette"]][] = [
    ["ink", "bg"], ["ink", "surface"], ["muted", "bg"], ["muted", "surface"], ["accent", "bg"], ["accentInk", "accent"],
  ];
  for (const t of templates) {
    for (const v of Object.values(t.palette)) assert.match(v, /^#[0-9a-f]{6}$/i, t.id);
    for (const [fg, bg] of pairs) assert.ok(ratio(t.palette[fg], t.palette[bg]) >= 4.5, `${t.id} ${fg}/${bg}`);
  }
});

test("fonts reference known keys", () => {
  for (const t of templates) for (const f of Object.values(t.fonts)) assert.ok(f in FONT_VARS, `${t.id} ${f}`);
});
```

- [ ] **Step 2: Run to verify failure** — `npm test`. Expected: cannot find `../lib/templates.ts`.

- [ ] **Step 3: Implement** `lib/templates.ts`

```ts
export const archetypes = ["editorial", "minimal", "classic", "botanical", "traditional"] as const;
export type Archetype = (typeof archetypes)[number];
export type FontKey = "playfair" | "cormorant" | "bevietnam" | "script";
export type Palette = { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string };
export type Template = {
  id: string;
  name: string;
  archetype: Archetype;
  blurb: string;
  palette: Palette;
  fonts: { display: FontKey; body: FontKey; script?: FontKey };
};

export const DEFAULT_TEMPLATE_ID = "gallery-noir";

// Palettes were tuned so every text pair passes WCAG AA (see tests/templates.test.ts).
export const templates: readonly Template[] = [
  { id: "gallery-noir", name: "Gallery Noir", archetype: "editorial", blurb: "Chữ lớn, nền tối, nhịp điệu như một trang tạp chí.",
    palette: { bg: "#152527", surface: "#1e3335", ink: "#f5eee2", muted: "#a9b5b0", accent: "#e08a7a", accentInk: "#152527" },
    fonts: { display: "playfair", body: "bevietnam" } },
  { id: "afterglow", name: "Afterglow", archetype: "editorial", blurb: "Sắc hoàng hôn ấm, dành cho lễ cưới chiều muộn.",
    palette: { bg: "#fbeee6", surface: "#fff8f3", ink: "#3b1f2b", muted: "#7a5a63", accent: "#b5432c", accentInk: "#fff8f3" },
    fonts: { display: "playfair", body: "bevietnam" } },
  { id: "soft-type", name: "Soft Type", archetype: "minimal", blurb: "Gần như chỉ có chữ. Thanh, thoáng, không thừa.",
    palette: { bg: "#f4efe6", surface: "#fbf8f2", ink: "#2b2a26", muted: "#6a655a", accent: "#7a5f3e", accentInk: "#fbf8f2" },
    fonts: { display: "bevietnam", body: "bevietnam" } },
  { id: "maison-blanc", name: "Maison Blanc", archetype: "classic", blurb: "Khung viền đôi, chữ nghiêng cổ điển, đối xứng trang nhã.",
    palette: { bg: "#fbfaf7", surface: "#ffffff", ink: "#1f2a3a", muted: "#5f6878", accent: "#8a6a35", accentInk: "#ffffff" },
    fonts: { display: "cormorant", body: "bevietnam" } },
  { id: "wild-garden", name: "Wild Garden", archetype: "botanical", blurb: "Khung vòm, cành lá vẽ tay, xanh dịu như vườn sớm.",
    palette: { bg: "#e6ecdf", surface: "#f3f6ee", ink: "#26382b", muted: "#566656", accent: "#456e50", accentInk: "#f3f6ee" },
    fonts: { display: "playfair", body: "bevietnam", script: "script" } },
  { id: "olive-story", name: "Olive Story", archetype: "botanical", blurb: "Tông ô liu và giấy da, ấm và chậm.",
    palette: { bg: "#f1ecdd", surface: "#faf6ea", ink: "#3a3a1f", muted: "#666648", accent: "#6b6a25", accentInk: "#faf6ea" },
    fonts: { display: "cormorant", body: "bevietnam", script: "script" } },
  { id: "lua-son", name: "Lụa Son", archetype: "traditional", blurb: "Đỏ son và vàng ánh, hoa văn sen, đậm chất lễ thành hôn.",
    palette: { bg: "#7d1417", surface: "#93191c", ink: "#f7e9c8", muted: "#e0c7a0", accent: "#e2b857", accentInk: "#5b0d10" },
    fonts: { display: "cormorant", body: "bevietnam" } },
];

export const getTemplate = (id: string): Template | undefined => templates.find((t) => t.id === id);

export const FONT_VARS: Record<FontKey, string> = {
  playfair: "var(--font-playfair)",
  cormorant: "var(--font-cormorant)",
  bevietnam: "var(--font-bevietnam)",
  script: "var(--font-script)",
};
```

- [ ] **Step 4: Implement** `lib/fonts.ts` (framework code, not unit-tested)

```ts
import { Playfair_Display, Cormorant_Garamond, Be_Vietnam_Pro, Dancing_Script } from "next/font/google";

const subsets = ["latin", "vietnamese"];
const playfair = Playfair_Display({ subsets, style: ["normal", "italic"], variable: "--font-playfair", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets, weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const bevietnam = Be_Vietnam_Pro({ subsets, weight: ["300", "400", "500", "600"], variable: "--font-bevietnam", display: "swap" });
const script = Dancing_Script({ subsets, variable: "--font-script", display: "swap" });

export const invitationFontClasses = [playfair, cormorant, bevietnam, script].map((f) => f.variable).join(" ");
```
If Task 1 Step 8 showed a family without `vietnamese`, swap that family here and in `FONT_VARS`/templates before continuing.

- [ ] **Step 5: Root layout Vietnamese subset** — in `app/layout.tsx` set `subsets: ["latin", "vietnamese"]` on `DM_Sans` and `Playfair_Display` if supported (else replace DM Sans with `Be_Vietnam_Pro` and keep the `--font-sans` variable name).

- [ ] **Step 6: Verify** — `npm test && npm run typecheck && npm run build`. Expected: pass.
- [ ] **Step 7: Checkpoint** — no commit unless asked.

### Task 5: API client + local store (FE `lib/`)

**Files:**
- Create: `lib/api.ts`, `lib/local-invitations.ts`, `tests/api.test.ts`, `tests/local-invitations.test.ts`

**Interfaces:**
- Consumes: `type Content` from `lib/content.ts` (`import type`, `.ts` extension).
- Produces (`lib/api.ts`):
  - `class ApiError extends Error { status: number }`
  - `type PublicWish = {id: string; name: string; message: string; createdAt: string}`
  - `type InvitationDto = {id: string; slug: string; templateId: string; content: Content; published: boolean; publishedAt: string | null; updatedAt: string}`
  - `type CreatedInvitation = {id: string; slug: string; key: string}`
  - `type PublicInvitationDto = {slug: string; templateId: string; content: Content; wishes: PublicWish[]}`
  - `type RsvpInput = {name: string; attending: boolean; guests: number; note: string; answers: Record<string, string>; guestLabel: string; website: string}` (`website` = honeypot, always `""` from real users)
  - `type WishInput = {name: string; message: string; website: string}`
  - `type RsvpRow = {id: string; name: string; attending: boolean; guests: number; note: string; answers: Record<string, string>; guestLabel: string; createdAt: string}`
  - `type WishRow = PublicWish & {hidden: boolean}`
  - `type ResponsesDto = {rsvps: RsvpRow[]; summary: {attending: number; declined: number; headcount: number}; wishes: WishRow[]}`
  - `createApi(baseUrl: string, fetchImpl?: typeof fetch)` returning `{createInvitation(templateId: string, content: Content): Promise<CreatedInvitation>; getInvitation(id, key): Promise<InvitationDto>; updateInvitation(id, key, patch: {templateId?: string; content?: Content; slug?: string; published?: boolean}): Promise<InvitationDto>; uploadMedia(id, key, kind: "image"|"audio", file: Blob, filename: string): Promise<{url: string}>; getResponses(id, key): Promise<ResponsesDto>; setWishHidden(id, key, wishId, hidden): Promise<void>; getPublicInvitation(slug): Promise<PublicInvitationDto | null>; submitRsvp(slug, input): Promise<void>; submitWish(slug, input): Promise<PublicWish>}`
  - `api = createApi(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080")`
- Produces (`lib/local-invitations.ts`): `type LocalInvitation = {id: string; slug: string; key: string; title: string; updatedAt: string}`, `createLocalStore(storage: Pick<Storage, "getItem"|"setItem">)` → `{list(): LocalInvitation[]; get(id): LocalInvitation | undefined; upsert(item): void; remove(id): void}` (newest `updatedAt` first).

- [ ] **Step 1: Write failing tests**

`tests/api.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { createApi, ApiError } from "../lib/api.ts";
import { defaultContent } from "../lib/content.ts";

type Call = { url: string; init: RequestInit };
function fake(status: number, body: unknown) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  }) as unknown as typeof fetch;
  return { calls, api: createApi("http://be", fetchImpl) };
}

test("createInvitation POSTs the template id and starting content as JSON", async () => {
  const { api, calls } = fake(201, { id: "i", slug: "s", key: "k" });
  const content = defaultContent(new Date("2026-09-20T00:00:00Z"));
  assert.deepEqual(await api.createInvitation("gallery-noir", content), { id: "i", slug: "s", key: "k" });
  assert.equal(calls[0].url, "http://be/api/invitations");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.body, JSON.stringify({ templateId: "gallery-noir", content }));
});

test("owner calls send X-Edit-Key", async () => {
  const { api, calls } = fake(200, { id: "i" });
  await api.getInvitation("i", "secret");
  const headers = new Headers(calls[0].init.headers);
  assert.equal(headers.get("x-edit-key"), "secret");
  assert.equal(calls[0].url, "http://be/api/invitations/i");
});

test("getPublicInvitation returns null on 404 and does not cache", async () => {
  const { api, calls } = fake(404, { title: "Not Found" });
  assert.equal(await api.getPublicInvitation("nope"), null);
  assert.equal(calls[0].url, "http://be/api/public/invitations/nope");
  assert.equal(calls[0].init.cache, "no-store");
});

test("errors surface the ProblemDetail text", async () => {
  const { api } = fake(409, { title: "Conflict", detail: "Slug đã được dùng" });
  await assert.rejects(api.updateInvitation("i", "k", { slug: "x" }), (e: unknown) => e instanceof ApiError && e.status === 409 && e.message === "Slug đã được dùng");
});

test("uploadMedia posts multipart with kind and file", async () => {
  const { api, calls } = fake(201, { url: "https://cdn/x.webp" });
  const out = await api.uploadMedia("i", "k", "image", new Blob(["x"], { type: "image/webp" }), "a.webp");
  assert.equal(out.url, "https://cdn/x.webp");
  const form = calls[0].init.body as FormData;
  assert.equal(form.get("kind"), "image");
  assert.ok(form.get("file") instanceof Blob);
  assert.equal(new Headers(calls[0].init.headers).get("content-type"), null); // fetch sets the multipart boundary itself
});
```

`tests/local-invitations.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { createLocalStore } from "../lib/local-invitations.ts";

const memory = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };
const item = (id: string, updatedAt: string) => ({ id, slug: `s-${id}`, key: `k-${id}`, title: id, updatedAt });

test("upsert replaces by id and lists newest first", () => {
  const s = createLocalStore(memory());
  s.upsert(item("a", "2026-01-01T00:00:00Z"));
  s.upsert(item("b", "2026-02-01T00:00:00Z"));
  s.upsert({ ...item("a", "2026-03-01T00:00:00Z"), title: "A2" });
  assert.deepEqual(s.list().map((i) => i.id), ["a", "b"]);
  assert.equal(s.get("a")?.title, "A2");
});

test("remove deletes and get misses cleanly", () => {
  const s = createLocalStore(memory());
  s.upsert(item("a", "2026-01-01T00:00:00Z"));
  s.remove("a");
  assert.deepEqual(s.list(), []);
  assert.equal(s.get("a"), undefined);
});

test("corrupt or hostile storage yields an empty list, never throws", () => {
  const bad = { getItem: () => "{not json", setItem: () => { throw new Error("quota"); } };
  const s = createLocalStore(bad);
  assert.deepEqual(s.list(), []);
  assert.doesNotThrow(() => s.upsert(item("a", "2026-01-01T00:00:00Z")));
  const wrongShape = createLocalStore({ getItem: () => JSON.stringify([{ id: 1 }, "x", null]), setItem: () => {} });
  assert.deepEqual(wrongShape.list(), []);
});
```

- [ ] **Step 2: Run to verify failure** — `npm test`. Expected: cannot find `../lib/api.ts`.

- [ ] **Step 3: Implement** `lib/api.ts`

```ts
import type { Content } from "./content.ts";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export type PublicWish = { id: string; name: string; message: string; createdAt: string };
export type InvitationDto = { id: string; slug: string; templateId: string; content: Content; published: boolean; publishedAt: string | null; updatedAt: string };
export type CreatedInvitation = { id: string; slug: string; key: string };
export type PublicInvitationDto = { slug: string; templateId: string; content: Content; wishes: PublicWish[] };
export type RsvpInput = { name: string; attending: boolean; guests: number; note: string; answers: Record<string, string>; guestLabel: string; website: string };
export type WishInput = { name: string; message: string; website: string };
export type RsvpRow = { id: string; name: string; attending: boolean; guests: number; note: string; answers: Record<string, string>; guestLabel: string; createdAt: string };
export type WishRow = PublicWish & { hidden: boolean };
export type ResponsesDto = { rsvps: RsvpRow[]; summary: { attending: number; declined: number; headcount: number }; wishes: WishRow[] };
type Patch = { templateId?: string; content?: Content; slug?: string; published?: boolean };

export function createApi(baseUrl: string, fetchImpl: typeof fetch = (...a) => fetch(...a)) {
  async function call<T>(path: string, init: RequestInit = {}, key?: string): Promise<T> {
    const headers = new Headers(init.headers);
    if (key) headers.set("X-Edit-Key", key);
    if (typeof init.body === "string") headers.set("Content-Type", "application/json");
    const res = await fetchImpl(`${baseUrl}${path}`, { ...init, headers });
    if (!res.ok) {
      let message = `Lỗi ${res.status}`;
      try { const p = await res.json(); message = p.detail ?? p.title ?? message; } catch { /* non-JSON error body */ }
      throw new ApiError(res.status, message);
    }
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }
  const json = (method: string, body: unknown): RequestInit => ({ method, body: JSON.stringify(body) });

  return {
    createInvitation: (templateId: string, content: Content) =>
      call<CreatedInvitation>("/api/invitations", json("POST", { templateId, content })),
    getInvitation: (id: string, key: string) => call<InvitationDto>(`/api/invitations/${id}`, {}, key),
    updateInvitation: (id: string, key: string, patch: Patch) => call<InvitationDto>(`/api/invitations/${id}`, json("PATCH", patch), key),
    uploadMedia(id: string, key: string, kind: "image" | "audio", file: Blob, filename: string) {
      const form = new FormData();
      form.set("kind", kind);
      form.set("file", file, filename);
      return call<{ url: string }>(`/api/invitations/${id}/media`, { method: "POST", body: form }, key);
    },
    getResponses: (id: string, key: string) => call<ResponsesDto>(`/api/invitations/${id}/responses`, {}, key),
    setWishHidden: (id: string, key: string, wishId: string, hidden: boolean) =>
      call<void>(`/api/invitations/${id}/wishes/${wishId}`, json("PATCH", { hidden }), key),
    async getPublicInvitation(slug: string): Promise<PublicInvitationDto | null> {
      try { return await call<PublicInvitationDto>(`/api/public/invitations/${slug}`, { cache: "no-store" }); }
      catch (e) { if (e instanceof ApiError && e.status === 404) return null; throw e; }
    },
    submitRsvp: (slug: string, input: RsvpInput) => call<void>(`/api/public/invitations/${slug}/rsvp`, json("POST", input)),
    submitWish: (slug: string, input: WishInput) => call<PublicWish>(`/api/public/invitations/${slug}/wishes`, json("POST", input)),
  };
}

export const api = createApi(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080");
```

- [ ] **Step 4: Implement** `lib/local-invitations.ts`

```ts
export type LocalInvitation = { id: string; slug: string; key: string; title: string; updatedAt: string };

const STORAGE_KEY = "moc.invitations.v1";
const isLocal = (v: unknown): v is LocalInvitation =>
  typeof v === "object" && v !== null &&
  ["id", "slug", "key", "title", "updatedAt"].every((k) => typeof (v as Record<string, unknown>)[k] === "string");

export function createLocalStore(storage: Pick<Storage, "getItem" | "setItem">) {
  const list = (): LocalInvitation[] => {
    try {
      const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter(isLocal).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
    } catch { return []; }
  };
  const write = (items: LocalInvitation[]) => {
    try { storage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* quota or private mode: the list is best-effort */ }
  };
  return {
    list,
    get: (id: string) => list().find((i) => i.id === id),
    upsert: (item: LocalInvitation) => write([item, ...list().filter((i) => i.id !== item.id)]),
    remove: (id: string) => write(list().filter((i) => i.id !== id)),
  };
}
```

- [ ] **Step 5: Verify** — `npm test && npm run typecheck`. Expected: pass. (In the `uploadMedia` test the `Content-Type` header must stay unset so `fetch` adds the multipart boundary; `call` only sets it for string bodies.)
- [ ] **Step 6: Checkpoint** — no commit unless asked.

---

## Milestone 1b — Visual layer (FE, no backend needed)

Visual tasks are verified by screenshots (390px and 1280px) via the browser MCP (`ray-qc-browser-verify` skill or Playwright MCP), console clean, plus `npm run build`. Each archetype task must end with the screenshots reviewed and any layout/contrast/overflow bug fixed at its root.

### Task 6: Renderer core + editorial archetype + `/templates/[id]` preview

**Files:**
- Create: `components/invitation/InvitationRenderer.tsx`, `components/invitation/invitation.css`, `components/invitation/ornaments.tsx`
- Create sections: `components/invitation/sections/{Cover,Couple,Family,Events,CountdownSection,Album,RsvpSection,WishesSection,Gift,Thanks}.tsx`
- Create client leaves: `components/invitation/client/{InvitationShell,CountdownClock,AddToCalendar,MapToggle,Lightbox,RsvpForm,WishForm,CopyButton,Reveal}.tsx`
- Create: `app/templates/[id]/layout.tsx`, `app/templates/[id]/page.tsx`, `public/sample/photo-1.svg` … `photo-6.svg`

**Interfaces:**
- Consumes: `Content`/`sampleContent` (Task 2), `nextEvent`/`formatDateVi`/`remaining` (Task 3), `toIcs`/`googleCalendarUrl` (Task 3), `vietQrUrl`/`isAccountComplete`/`bankName` (Task 3), `Template`/`getTemplate`/`FONT_VARS`/`invitationFontClasses` (Task 4), `api`/`PublicWish`/`RsvpInput`/`WishInput` (Task 5).
- Produces:
```ts
export type InvitationRendererProps = {
  content: Content;
  template: Template;
  mode: "live" | "preview";   // preview: forms shown but disabled ("Chế độ xem thử")
  slug?: string;              // required when mode === "live"; forms POST to /api/public/invitations/{slug}
  guestName?: string;         // from ?to=
  wishes?: PublicWish[];
  now?: Date;                 // deterministic tests / SSR
  gate?: boolean;             // envelope overlay; default = (mode === "live")
  only?: "cover";             // render just the wrapper + Cover (used by gallery thumbnails, Task 9)
};
export function InvitationRenderer(props: InvitationRendererProps): JSX.Element;
```

**Rendering contract**
- Wrapper: `<div class="inv-stage"><div class="inv" data-archetype="…" style="--inv-bg:…; --inv-surface:…; --inv-ink:…; --inv-muted:…; --inv-accent:…; --inv-accent-ink:…; --inv-font-display:…; --inv-font-body:…; --inv-font-script:…">`. Values come from `template.palette` and `FONT_VARS`; no color or font literal appears in section CSS.
- Layout: `.inv` is a centered column, `max-width: 480px`, `min-height: 100dvh`; on ≥ 640px `.inv-stage` shows a slightly darker backdrop of `--inv-bg`. No viewport media queries inside `.inv` (Studio embeds it in a phone frame); use `clamp()` and `container-type: inline-size`.
- Section order: Cover → Couple → Family → Events → Countdown → Album → Rsvp → Wishes → Gift → Thanks (+ footer "Tạo bằng MỘC" linking `/`). A section with no data renders nothing (no album, empty family, `!rsvp.enabled`, `!guestbook.enabled`, `!gift.enabled` or no complete account, no future event).
- `InvitationShell` (client): holds `open` state and the `<audio loop preload="none">`; when `gate`, shows an overlay "Trân trọng kính mời" + `guestName` + button "Mở thiệp"; on click it unlocks scroll, starts the music (user gesture), moves focus to the main content. Renders a floating play/pause button only if `content.music`. Children are always in the DOM.
- Events: per event card shows `formatDateVi(date)`, time, `lunar` (if set), venue, address, "Chỉ đường" link (`mapUrl` or `https://www.google.com/maps/dir/?api=1&destination=<encoded address>`, `rel="noopener"`, `target="_blank"`), and `MapToggle` that loads `<iframe loading="lazy" src="https://www.google.com/maps?q=<encoded address>&output=embed">` only after the click.
- Countdown: `nextEvent(events, now)`; `CountdownClock` updates every second; `AddToCalendar` = Google link + `.ics` download built with `Blob` + `URL.createObjectURL` (`uid = <event.id>@moc-wedding`).
- Album: grid; `Lightbox` traps focus, closes on ESC/backdrop, arrow keys navigate, restores focus, images have `alt` (fallback "Ảnh cưới n").
- RSVP: name (prefilled with `guestName`), radio Tham dự / Không tham dự, number of guests (1–20, hidden when declining), the configured questions, note, honeypot input `name="website"` (visually hidden, `tabIndex={-1}`, `aria-hidden`). Preview mode disables submit. On success shows a thank-you state.
- Gift: per complete account → holder label, `bankName(bankCode)`, number + `CopyButton`, QR `<img loading="lazy" alt="Mã QR chuyển khoản …">` from `vietQrUrl(acc, "Mung cuoi")`; always shows text details even if the image fails.
- `Reveal` (client): IntersectionObserver adds `.is-visible`; content is visible by default until mounted so no-JS is safe; `@media (prefers-reduced-motion: reduce)` disables transitions.
- A11y: one `h1` (the couple's names on the cover), sections are `<section aria-labelledby>`, contrast AA (palettes guarantee it), visible focus ring using `--inv-accent`.

**Editorial archetype brief (Gallery Noir, Afterglow)**
- Cover (100dvh): small-caps kicker "THE WEDDING OF" and a hairline; the two names stacked and huge (`clamp(56px, 18cqi, 96px)`), alternating roman/italic in `--inv-font-display`, the `&` in accent italic; the date as large numerals `08 · 11 · 2026` with the weekday, bottom-left; hero photo (if any) as a tall 3:4 rectangle overlapping the names, else a flat accent block carrying the initials.
- Section labels: `01 — LỜI MỜI` style, small caps, tracking `.18em`, accent color; 1px hairlines (`color-mix(in oklab, var(--inv-ink) 20%, transparent)`).
- Cards flat with hairline borders, no radius; buttons are solid rectangles with 12px uppercase tracking.
- Afterglow differs only by palette plus a soft vertical sunset gradient behind the cover (`linear-gradient` from `--inv-bg` to a 15% mix of `--inv-accent`).

**Sample photos:** six 800×1000 SVGs of abstract soft gradients with quiet shapes in neutral warm tones (readable on every palette); no text inside.

- [ ] **Step 1: Skeleton compiles.** Create the renderer with all sections stubbed to their real markup for the editorial archetype; add `app/templates/[id]`: `generateStaticParams` from `templates`, `revalidate = 86400`, `notFound()` for unknown id, `generateMetadata` (title `Mẫu <name>`, description = blurb, canonical), a slim top bar ("← Tất cả mẫu", template name, "Dùng mẫu này →" linking `/studio?template=<id>`), then `<InvitationRenderer mode="preview" gate={false} template content={sampleContent()} />`. Layout wraps children in `<div className={invitationFontClasses}>`.
  Run: `npm run typecheck && npm run build`. Expected: pass; `/templates/gallery-noir` and `/templates/afterglow` are prerendered.
- [ ] **Step 2: Implement the editorial styling** per the brief above in `invitation.css` under `[data-archetype="editorial"]`, shared structural rules under `.inv`.
- [ ] **Step 3: Visual QA.** `npm run dev`; open `/templates/gallery-noir` and `/templates/afterglow` at 390×844 and 1280×900. Check: sections in order, no horizontal scroll, Vietnamese diacritics render in Playfair/Be Vietnam Pro (`getComputedStyle(h1).fontFamily`), console clean, lightbox opens/closes with ESC, countdown ticks, map toggle loads the iframe only on click, focus ring visible, reduced-motion respected. Fix every defect at its root and re-check.
- [ ] **Step 4: Verify** — `npm test && npm run typecheck && npm run build`.
- [ ] **Step 5: Checkpoint** — no commit unless asked.

### Task 7: Minimal + classic archetypes (Soft Type, Maison Blanc)

**Files:**
- Modify: `components/invitation/invitation.css` (add `[data-archetype="minimal"]`, `[data-archetype="classic"]`), `components/invitation/sections/Cover.tsx`, `components/invitation/ornaments.tsx`

**Briefs**
- **minimal** (Soft Type): almost pure typography, maximum whitespace. Cover: names in light-weight Be Vietnam Pro, small caps with wide tracking, the date as oversized numerals in `--inv-muted`, one thin accent rule; hero photo (if any) as a small circle. No ornaments; `--inv-accent` only on rules and links; sections separated by space, not lines.
- **classic** (Maison Blanc): symmetric and centered. Cover has a double frame (2px + 1px gap) in `--inv-accent`, a monogram of the two initials inside a circle, Cormorant italic names, a small SVG flourish divider between sections (`ornaments.tsx: Flourish`). Cards are white with a hairline gold frame.

- [ ] **Step 1:** Add the two cover variants and the `Flourish` + `Monogram` ornaments.
- [ ] **Step 2:** Style both archetypes under their `data-archetype` selectors only.
- [ ] **Step 3: Visual QA** as in Task 6 Step 3 for `/templates/soft-type` and `/templates/maison-blanc`, and re-check `/templates/gallery-noir` did not regress.
- [ ] **Step 4: Verify** — `npm test && npm run typecheck && npm run build`.
- [ ] **Step 5: Checkpoint** — no commit unless asked.

### Task 8: Botanical + traditional archetypes (Wild Garden, Olive Story, Lụa Son)

**Files:**
- Modify: `components/invitation/invitation.css`, `components/invitation/sections/Cover.tsx`, `components/invitation/ornaments.tsx`

**Briefs**
- **botanical** (Wild Garden, Olive Story): arch-shaped photo frame (`border-radius: 999px 999px 0 0`), hand-drawn leaf sprigs (`ornaments.tsx: Sprig`) at the cover corners and as section dividers, the `&` and the kicker in `--inv-font-script`, soft paper depth via two low-opacity radial gradients. Without a hero photo the arch holds a tinted botanical illustration.
- **traditional** (Lụa Son): deep red ground with gold (`--inv-accent`) double border and lattice corners (`ornaments.tsx: LatticeCorner`), a lotus emblem (`Lotus`) above the names, the cover header "THƯ MỜI DỰ LỄ THÀNH HÔN", Cormorant bold names in `--inv-ink` cream, gold hairlines between sections. Original lotus/lattice artwork only; no reproduced trademarks or copied motifs.

- [ ] **Step 1:** Add `Sprig`, `Lotus`, `LatticeCorner` ornaments (inline SVG, `currentColor`/CSS-variable fills, `aria-hidden`).
- [ ] **Step 2:** Cover variants + styling for both archetypes.
- [ ] **Step 3: Visual QA** for `/templates/wild-garden`, `/templates/olive-story`, `/templates/lua-son` at 390px and 1280px; re-check the four earlier templates for regressions.
- [ ] **Step 4: Verify** — `npm test && npm run typecheck && npm run build`.
- [ ] **Step 5: Checkpoint** — no commit unless asked.

### Task 9: `/templates` gallery + sitemap

**Files:**
- Modify: `app/templates/page.tsx`, `app/sitemap.ts`
- Create: `components/templates/TemplateGallery.tsx` (client: archetype filter chips)

**Contract**
- `/templates` lists every template from the registry as a card: `<InvitationRenderer only="cover" mode="preview" gate={false} …/>` scaled into a 3:4 thumbnail, name, blurb, archetype tag (Vietnamese labels: Editorial, Tối giản, Cổ điển, Botanical, Truyền thống), linking to `/templates/[id]`. Chips filter by archetype (`useState`); "Tất cả" resets. Keep the existing site header/`brand` markup and metadata/canonical.
- `app/sitemap.ts` adds `/templates/${id}` for each template (priority `.7`).

- [ ] **Step 1:** Implement gallery + filter; keep the page a server component that passes `templates` to the client filter.
- [ ] **Step 2:** Update the sitemap.
- [ ] **Step 3: Visual QA** at 390px and 1280px; chips filter correctly; every card link opens its preview.
- [ ] **Step 4: Verify** — `npm test && npm run typecheck && npm run build`. **M1 done** when all seven previews look right and the build is green.
- [ ] **Step 5: Checkpoint** — no commit unless asked.

---

## Milestone 2 — Backend (repo `/Users/nguyenanhnhut/Desktop/Projects/Thiep-cuoi-online-backend`)

All paths in Tasks 10–18 are relative to the backend repo root. Base package `com.moc.wedding`. Follow `Ecomerce-Backend` conventions: `.properties` config with `${VAR:default}`, Lombok on entities, comments in Vietnamese with English identifiers (one class-level comment stating responsibility and place in the flow, per-endpoint comments, "why" comments only), 4-space indentation, JUnit 5 + AssertJ, Boot 4 imports (`tools.jackson.databind.ObjectMapper`, `org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc`, `org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest`). BE gate for every task: `./mvnw test` green.

The directory exists but is empty and is not a git repository; do not `git init` or commit unless the user asks.

### Task 10: Scaffold (Maven, Boot 4.1.1, config, Docker, CLAUDE.md)

**Files:**
- Create: `pom.xml`, `.mvn/` + `mvnw` + `mvnw.cmd` (copied), `src/main/java/com/moc/wedding/MocWeddingApplication.java`, `src/main/java/com/moc/wedding/config/AppProperties.java`, `src/main/resources/application.properties`, `src/test/resources/application.properties`, `src/test/java/com/moc/wedding/MocWeddingApplicationTests.java`, `docker-compose.yml`, `Dockerfile`, `.gitignore`, `.env.example`, `CLAUDE.md`

**Interfaces:**
- Produces: `AppProperties(Cors cors, Supabase supabase)` with `Cors(List<String> allowedOrigins)` and `Supabase(String url, String serviceRoleKey, String bucket)`, bound to prefix `app`.

- [ ] **Step 1: Copy the Maven wrapper**

Run from the backend root:
```bash
cp -R ../Ecomerce-Backend/.mvn . && cp ../Ecomerce-Backend/mvnw ../Ecomerce-Backend/mvnw.cmd . && chmod +x mvnw
```

- [ ] **Step 2: `pom.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- Cấu hình Maven của backend thiệp cưới MỘC: Java 17, Spring Boot 4.1.1, JPA + Flyway + Postgres. -->
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
        <relativePath/>
    </parent>
    <groupId>com.moc</groupId>
    <artifactId>wedding-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>wedding-backend</name>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-webmvc</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-validation</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-actuator</artifactId></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-flyway</artifactId></dependency>
        <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>
        <dependency><groupId>org.flywaydb</groupId><artifactId>flyway-database-postgresql</artifactId></dependency>
        <dependency><groupId>org.postgresql</groupId><artifactId>postgresql</artifactId><scope>runtime</scope></dependency>
        <dependency><groupId>org.springdoc</groupId><artifactId>springdoc-openapi-starter-webmvc-ui</artifactId><version>3.1.0</version></dependency>
        <dependency><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId><optional>true</optional></dependency>
        <dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><scope>test</scope></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-data-jpa-test</artifactId><scope>test</scope></dependency>
        <dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-webmvc-test</artifactId><scope>test</scope></dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration><image><name>moc-wedding-backend:latest</name></image></configuration>
            </plugin>
            <!-- Lombok chạy như annotation processor cho cả source chính lẫn source test. -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <executions>
                    <execution>
                        <id>default-compile</id><phase>compile</phase><goals><goal>compile</goal></goals>
                        <configuration><annotationProcessorPaths><path><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></path></annotationProcessorPaths></configuration>
                    </execution>
                    <execution>
                        <id>default-testCompile</id><phase>test-compile</phase><goals><goal>testCompile</goal></goals>
                        <configuration><annotationProcessorPaths><path><groupId>org.projectlombok</groupId><artifactId>lombok</artifactId></path></annotationProcessorPaths></configuration>
                    </execution>
                </executions>
            </plugin>
            <!-- Surefire chạy *Test, *Tests và *IT cùng trong phase test (không dùng failsafe). -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <configuration><includes><include>**/*Test.java</include><include>**/*Tests.java</include><include>**/*IT.java</include></includes></configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

- [ ] **Step 3: Write the failing test** `src/test/java/com/moc/wedding/MocWeddingApplicationTests.java`

```java
package com.moc.wedding;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Kiểm tra toàn bộ context Spring khởi động được trên H2 (không cần Postgres).
@SpringBootTest
class MocWeddingApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 4: Run to verify it fails** — `./mvnw test`. Expected: compile/context failure (no application class yet).

- [ ] **Step 5: Implement** the application class and config

`src/main/java/com/moc/wedding/MocWeddingApplication.java`:
```java
package com.moc.wedding;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

// Điểm khởi động của backend thiệp cưới MỘC; @ConfigurationPropertiesScan nạp AppProperties từ tiền tố "app".
@SpringBootApplication
@ConfigurationPropertiesScan
public class MocWeddingApplication {

    public static void main(String[] args) {
        SpringApplication.run(MocWeddingApplication.class, args);
    }
}
```

`src/main/java/com/moc/wedding/config/AppProperties.java`:
```java
package com.moc.wedding.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

// Cấu hình tuỳ biến của ứng dụng (tiền tố "app"): CorsConfig đọc cors, SupabaseMediaStorage đọc supabase.
@ConfigurationProperties(prefix = "app")
public record AppProperties(Cors cors, Supabase supabase) {

    // Các origin của frontend được gọi API từ trình duyệt.
    public record Cors(List<String> allowedOrigins) {
    }

    // Supabase Storage: url rỗng nghĩa là chưa cấu hình, MediaService khi đó trả 503 thay vì lỗi khó hiểu.
    public record Supabase(String url, String serviceRoleKey, String bucket) {
    }
}
```

`src/main/resources/application.properties`:
```properties
spring.application.name=moc-wedding-backend

# Postgres dev chạy bằng `docker compose up -d db` (cổng 5433 để không đụng DB của Ecomerce-Backend).
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5433/moc}
spring.datasource.username=${DB_USERNAME:moc}
spring.datasource.password=${DB_PASSWORD:moc}
spring.datasource.hikari.connection-init-sql=SET TIME ZONE 'UTC'
spring.jpa.properties.hibernate.jdbc.time_zone=UTC
# Schema do Flyway quản lý; Hibernate chỉ validate entity khớp schema.
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false

# Ảnh <= 2MB, nhạc <= 8MB (MediaRules kiểm lại theo từng loại).
spring.servlet.multipart.max-file-size=8MB
spring.servlet.multipart.max-request-size=9MB

# Origin FE được gọi API (phân tách bằng dấu phẩy). Không dùng cookie nên allowCredentials luôn false.
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:3000}

# Supabase Storage (chỉ cần khi upload ảnh/nhạc). URL dạng https://<project>.supabase.co
app.supabase.url=${SUPABASE_URL:}
app.supabase.service-role-key=${SUPABASE_SERVICE_ROLE_KEY:}
app.supabase.bucket=${SUPABASE_BUCKET:media}

# Sau reverse proxy (Docker/VPS) để lấy đúng IP client từ X-Forwarded-For cho throttle.
server.forward-headers-strategy=framework
spring.mvc.problemdetails.enabled=true

management.endpoints.web.exposure.include=health
management.server.port=8081
```

`src/test/resources/application.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false
# V1__init.sql viết bằng cú pháp Postgres (jsonb, timestamptz, ~) nên test không chạy Flyway; schema do ddl-auto tạo.
spring.flyway.enabled=false

app.cors.allowed-origins=http://localhost:3000
app.supabase.url=https://test.supabase.co
app.supabase.service-role-key=test-service-role-key
app.supabase.bucket=media
```

- [ ] **Step 6: Docker, ignore, env, CLAUDE.md**

`docker-compose.yml`:
```yaml
# Postgres cho môi trường dev: `docker compose up -d db`.
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: moc
      POSTGRES_USER: moc
      POSTGRES_PASSWORD: moc
    ports:
      - "5433:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U moc"]
      interval: 5s
      timeout: 5s
      retries: 10
volumes:
  db_data:
```
`Dockerfile`: copy `../Ecomerce-Backend/Dockerfile` unchanged (multi-stage JDK build → JRE run, `PORT` env).
`.gitignore`: copy `../Ecomerce-Backend/.gitignore` and add `.env`.
`.env.example`:
```
DB_URL=jdbc:postgresql://localhost:5433/moc
DB_USERNAME=moc
DB_PASSWORD=moc
CORS_ALLOWED_ORIGINS=http://localhost:3000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_BUCKET=media
```
`CLAUDE.md` (write these sections, concise): **Commands** (`./mvnw test`, `./mvnw test -Dtest=Class#method`, `docker compose up -d db`, `./mvnw spring-boot:run`, Swagger at `/swagger-ui.html`, actuator health on 8081); **Architecture** (package-by-layer under `com.moc.wedding`: controller/service/repository/entity/dto/config/storage; no Spring Security by design: owner routes authenticate with `X-Edit-Key` checked by `EditKeyService`, public routes are anonymous and throttled; no interface with a single implementation except `MediaStorage`); **API contract** (the source of truth is `../thiep-cuoi-online-project/docs/superpowers/specs/2026-09-20-invitation-core-phase1-design.md` section 6.4; the FE `lib/api.ts` must match); **Testing** (H2 in PostgreSQL mode, `ddl-auto=create-drop`, Flyway disabled; adding an entity means adding its `deleteAll()` to `support/TestDataCleaner` in FK order; `MediaStorage` is replaced by a fake in ITs); **Code rule** (same Vietnamese-comment convention as Ecomerce-Backend).

- [ ] **Step 7: Verify** — `./mvnw test`. Expected: `MocWeddingApplicationTests` passes.
  Then: `docker compose up -d db` and confirm `docker compose ps` shows `db` healthy (the app itself needs Task 11's migration before it can boot against Postgres).
- [ ] **Step 8: Checkpoint** — no commit unless asked.

### Task 11: Schema, entities, repositories (+ JSON column mapping proof)

**Files:**
- Create: `src/main/resources/db/migration/V1__init.sql`
- Create: `entity/Invitation.java`, `entity/Rsvp.java`, `entity/Wish.java`, `repository/InvitationRepository.java`, `repository/RsvpRepository.java`, `repository/WishRepository.java`
- Create: `src/test/java/com/moc/wedding/repository/InvitationRepositoryTest.java`, `src/test/java/com/moc/wedding/support/TestDataCleaner.java`

**Interfaces:**
- Produces: entities with Lombok `@Getter @Setter @NoArgsConstructor`; `Invitation{UUID id; String slug; String editKeyHash; String templateId; String content /*JSON text*/; boolean published; Instant publishedAt; Instant createdAt; Instant updatedAt}`; `Rsvp{UUID id; UUID invitationId; String name; boolean attending; int guests; String note; String answers /*JSON text*/; String guestLabel; Instant createdAt}`; `Wish{UUID id; UUID invitationId; String name; String message; boolean hidden; Instant createdAt}`.
  - `InvitationRepository`: `Optional<Invitation> findBySlug(String)`, `boolean existsBySlug(String)`.
  - `RsvpRepository`: `List<Rsvp> findByInvitationIdOrderByCreatedAtDesc(UUID)`.
  - `WishRepository`: `List<Wish> findTop50ByInvitationIdAndHiddenFalseOrderByCreatedAtDesc(UUID)`, `List<Wish> findByInvitationIdOrderByCreatedAtDesc(UUID)`, `Optional<Wish> findByIdAndInvitationId(UUID, UUID)`.
  - `TestDataCleaner.cleanAll()` deleting `wishes`, `rsvps`, `invitations` in FK order.

- [ ] **Step 1: Migration** `V1__init.sql`

```sql
-- Mỗi dòng invitations là một thiệp. content là JSON nguyên khối vì luôn đọc/ghi cả khối, không truy vấn bên trong.
create table invitations (
    id            uuid primary key,
    slug          varchar(40) not null unique
                  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) >= 3),
    edit_key_hash varchar(64) not null,
    template_id   varchar(40) not null,
    content       jsonb not null,
    published     boolean not null default false,
    published_at  timestamptz,
    created_at    timestamptz not null,
    updated_at    timestamptz not null
);

create table rsvps (
    id            uuid primary key,
    invitation_id uuid not null references invitations (id) on delete cascade,
    name          varchar(80) not null,
    attending     boolean not null,
    guests        int not null check (guests between 0 and 20),
    note          varchar(500) not null default '',
    answers       jsonb not null default '{}'::jsonb,
    guest_label   varchar(80) not null default '',
    created_at    timestamptz not null
);
create index rsvps_invitation_created_idx on rsvps (invitation_id, created_at desc);

create table wishes (
    id            uuid primary key,
    invitation_id uuid not null references invitations (id) on delete cascade,
    name          varchar(80) not null,
    message       varchar(500) not null,
    hidden        boolean not null default false,
    created_at    timestamptz not null
);
create index wishes_invitation_created_idx on wishes (invitation_id, created_at desc);

-- Nếu chạy trên Supabase Postgres: bật RLS và KHÔNG tạo policy để chặn truy cập trực tiếp bằng anon key
-- (backend nối JDBC bằng role riêng nên không bị ảnh hưởng).
```

- [ ] **Step 2: Write the failing test** `InvitationRepositoryTest`

```java
package com.moc.wedding.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.moc.wedding.entity.Invitation;
import com.moc.wedding.entity.Rsvp;
import com.moc.wedding.entity.Wish;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;
import tools.jackson.databind.ObjectMapper;

@DataJpaTest
class InvitationRepositoryTest {

    @Autowired private InvitationRepository invitations;
    @Autowired private RsvpRepository rsvps;
    @Autowired private WishRepository wishes;
    @Autowired private jakarta.persistence.EntityManager em;

    private final ObjectMapper json = new ObjectMapper();

    private Invitation invitation(String slug, String content) {
        Invitation i = new Invitation();
        i.setSlug(slug);
        i.setEditKeyHash("a".repeat(64));
        i.setTemplateId("gallery-noir");
        i.setContent(content);
        return i;
    }

    @Test
    void jsonContentRoundTripsAsJsonNotAsQuotedString() {
        String content = "{\"v\":1,\"couple\":{\"groom\":{\"name\":\"Minh\"}}}";
        invitations.saveAndFlush(invitation("minh-va-an", content));
        em.clear(); // ép đọc lại từ DB thay vì lấy từ persistence context

        Invitation loaded = invitations.findBySlug("minh-va-an").orElseThrow();
        assertThat(json.readTree(loaded.getContent()).at("/couple/groom/name").asString()).isEqualTo("Minh");
        assertThat(loaded.getCreatedAt()).isNotNull();
        assertThat(loaded.isPublished()).isFalse();
    }

    @Test
    void slugIsUnique() {
        invitations.saveAndFlush(invitation("dup-slug", "{}"));
        assertThat(invitations.existsBySlug("dup-slug")).isTrue();
        assertThatThrownBy(() -> invitations.saveAndFlush(invitation("dup-slug", "{}")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void wishesQueryHidesHiddenAndKeepsNewestFirst() {
        Invitation inv = invitations.saveAndFlush(invitation("wishes-slug", "{}"));
        Wish visible = wish(inv.getId(), "An", false);
        Wish hidden = wish(inv.getId(), "Spam", true);
        wishes.saveAllAndFlush(java.util.List.of(visible, hidden));

        assertThat(wishes.findTop50ByInvitationIdAndHiddenFalseOrderByCreatedAtDesc(inv.getId()))
                .extracting(Wish::getName).containsExactly("An");
        assertThat(wishes.findByInvitationIdOrderByCreatedAtDesc(inv.getId())).hasSize(2);
        assertThat(wishes.findByIdAndInvitationId(visible.getId(), UUID.randomUUID())).isEmpty();
    }

    @Test
    void rsvpsAreListedNewestFirstAndStoreAnswersAsJson() {
        Invitation inv = invitations.saveAndFlush(invitation("rsvp-slug", "{}"));
        Rsvp r = new Rsvp();
        r.setInvitationId(inv.getId());
        r.setName("Khách");
        r.setAttending(true);
        r.setGuests(2);
        r.setNote("");
        r.setAnswers("{\"q1\":\"có\"}");
        r.setGuestLabel("");
        rsvps.saveAndFlush(r);
        em.clear();

        Rsvp loaded = rsvps.findByInvitationIdOrderByCreatedAtDesc(inv.getId()).get(0);
        assertThat(json.readTree(loaded.getAnswers()).get("q1").asString()).isEqualTo("có");
    }

    private Wish wish(UUID invitationId, String name, boolean hidden) {
        Wish w = new Wish();
        w.setInvitationId(invitationId);
        w.setName(name);
        w.setMessage("Chúc mừng");
        w.setHidden(hidden);
        return w;
    }
}
```
(`ObjectMapper` here is Jackson 3 `tools.jackson.databind.ObjectMapper`; `readTree(...).at(...).asString()` per Jackson 3 API — if the method name differs, adjust to the compiler's suggestion, the assertion intent is unchanged.)

- [ ] **Step 3: Run to verify failure** — `./mvnw test -Dtest=InvitationRepositoryTest`. Expected: compile error, entities missing.

- [ ] **Step 4: Implement entities**

`entity/Invitation.java`:
```java
package com.moc.wedding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

// Một thiệp cưới. InvitationService tạo/sửa; PublicInvitationController đọc theo slug khi published = true.
@Entity
@Table(name = "invitations")
@Getter
@Setter
@NoArgsConstructor
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Đường dẫn công khai /invite/{slug}; đổi được đến lần xuất bản đầu (publishedAt == null).
    @Column(nullable = false, unique = true, length = 40)
    private String slug;

    // sha256(edit key) dạng hex; key gốc không bao giờ được lưu (EditKeyService).
    @Column(name = "edit_key_hash", nullable = false, length = 64)
    private String editKeyHash;

    @Column(name = "template_id", nullable = false, length = 40)
    private String templateId;

    // JSON của InvitationContent, lưu nguyên khối; service (de)serialize bằng ObjectMapper.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    private boolean published;

    // Đặt ở lần xuất bản đầu tiên và không bao giờ xoá: khác null nghĩa là slug đã bị khoá.
    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
```
`entity/Rsvp.java` (same imports; `@Table(name = "rsvps")`):
```java
// Một lần gửi RSVP của khách. Tổng hợp theo tên (lần mới nhất) nằm ở RsvpSummary, không nằm ở DB.
@Entity @Table(name = "rsvps") @Getter @Setter @NoArgsConstructor
public class Rsvp {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    // Lưu UUID thay vì @ManyToOne vì không cần nạp Invitation khi đọc/ghi RSVP; FK do DB cưỡng chế.
    @Column(name = "invitation_id", nullable = false) private UUID invitationId;
    @Column(nullable = false, length = 80) private String name;
    @Column(nullable = false) private boolean attending;
    @Column(nullable = false) private int guests;
    @Column(nullable = false, length = 500) private String note;
    // JSON {questionId: câu trả lời} theo các câu hỏi tuỳ chọn của thiệp.
    @JdbcTypeCode(SqlTypes.JSON) @Column(nullable = false) private String answers;
    // Giá trị ?to= trên link khách mở (không phải danh sách khách; Phase 3 mới có).
    @Column(name = "guest_label", nullable = false, length = 80) private String guestLabel;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @PrePersist void onCreate() { createdAt = Instant.now(); }
}
```
`entity/Wish.java`:
```java
// Một lời chúc trong sổ lưu bút. hidden = chủ thiệp đã ẩn; PublicInvitationController không trả các dòng hidden.
@Entity @Table(name = "wishes") @Getter @Setter @NoArgsConstructor
public class Wish {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "invitation_id", nullable = false) private UUID invitationId;
    @Column(nullable = false, length = 80) private String name;
    @Column(nullable = false, length = 500) private String message;
    @Column(nullable = false) private boolean hidden;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @PrePersist void onCreate() { createdAt = Instant.now(); }
}
```
Repositories:
```java
package com.moc.wedding.repository;
// (mỗi file: package + imports java.util.*, org.springframework.data.jpa.repository.JpaRepository, entity)

// Truy cập thiệp; findBySlug phục vụ trang công khai và kiểm tra slug trùng khi đổi slug.
public interface InvitationRepository extends JpaRepository<Invitation, UUID> {
    Optional<Invitation> findBySlug(String slug);
    boolean existsBySlug(String slug);
}

// RSVP mới nhất trước; RsvpSummary gộp theo tên ở tầng service.
public interface RsvpRepository extends JpaRepository<Rsvp, UUID> {
    List<Rsvp> findByInvitationIdOrderByCreatedAtDesc(UUID invitationId);
}

// Trang công khai chỉ lấy 50 lời chúc chưa ẩn mới nhất; trang chủ thiệp lấy tất cả kể cả đã ẩn.
public interface WishRepository extends JpaRepository<Wish, UUID> {
    List<Wish> findTop50ByInvitationIdAndHiddenFalseOrderByCreatedAtDesc(UUID invitationId);
    List<Wish> findByInvitationIdOrderByCreatedAtDesc(UUID invitationId);
    // Ràng buộc wish thuộc đúng thiệp để key của thiệp A không ẩn được lời chúc của thiệp B.
    Optional<Wish> findByIdAndInvitationId(UUID id, UUID invitationId);
}
```
`support/TestDataCleaner.java` (in `src/test/java/com/moc/wedding/support`):
```java
package com.moc.wedding.support;

import com.moc.wedding.repository.InvitationRepository;
import com.moc.wedding.repository.RsvpRepository;
import com.moc.wedding.repository.WishRepository;
import org.springframework.stereotype.Component;

// Dọn dữ liệu giữa các IT vì cả bộ test dùng chung một H2; xoá theo thứ tự FK (con trước cha).
@Component
public class TestDataCleaner {

    private final WishRepository wishes;
    private final RsvpRepository rsvps;
    private final InvitationRepository invitations;

    public TestDataCleaner(WishRepository wishes, RsvpRepository rsvps, InvitationRepository invitations) {
        this.wishes = wishes;
        this.rsvps = rsvps;
        this.invitations = invitations;
    }

    public void cleanAll() {
        wishes.deleteAllInBatch();
        rsvps.deleteAllInBatch();
        invitations.deleteAllInBatch();
    }
}
```
(`TestDataCleaner` is under `src/test` so `@DataJpaTest` does not pick it up as a component; ITs import it via component scan of the full context.)

- [ ] **Step 5: Run** — `./mvnw test -Dtest=InvitationRepositoryTest`. Expected: pass.
  **JSON mapping fallback:** if the round-trip test fails on H2 (value stored as a quoted string, or Hibernate reports no JSON `FormatMapper` under Jackson 3), switch BOTH `content` and `answers` to plain text: remove `@JdbcTypeCode`, change the Flyway columns to `text`, keep everything else. Record the outcome in `CLAUDE.md` ("content/answers stored as jsonb via @JdbcTypeCode" or "stored as text because …").

- [ ] **Step 6: Prove it against real Postgres**

Run: `docker compose up -d db && ./mvnw spring-boot:run` (Flyway applies `V1`, Hibernate `validate` must pass), stop it, then `docker compose exec db psql -U moc -d moc -c "\d invitations"`.
Expected: app boots with no schema-validation error; `content` shows as `jsonb`. A validation error here means the entity/column types disagree; fix the entity mapping, not the DB.
- [ ] **Step 7: Verify** — `./mvnw test`. Expected: all tests pass.
- [ ] **Step 8: Checkpoint** — no commit unless asked.

### Task 12: Error model, CORS, and pure services (edit key, throttle, media rules, RSVP summary)

**Files:**
- Create: `config/ApiException.java`, `config/ApiExceptionHandler.java`, `config/CorsConfig.java`
- Create: `service/EditKeyService.java`, `service/ThrottleService.java`, `service/MediaRules.java`, `service/RsvpSummary.java`
- Test: `service/EditKeyServiceTest`, `service/ThrottleServiceTest`, `service/MediaRulesTest`, `service/RsvpSummaryTest` (under `src/test/java/com/moc/wedding/`)

**Interfaces:**
- Produces:
  - `ApiException(HttpStatus status, String detail)` with `status()`; the handler renders every `ApiException` as an RFC 7807 `ProblemDetail` (`detail` = message) and `MethodArgumentNotValidException` as 400 with `errors: {field: message}`; registered `@Order(HIGHEST_PRECEDENCE)` so it wins over Boot's built-in problem-details advice.
  - `EditKeyService`: `String generate()` (32 random bytes, base64url, 43 chars), `String hash(String key)` (sha256 hex, 64 chars), `boolean matches(String key, String storedHash)` (null/blank → false, constant-time).
  - `ThrottleService`: `boolean tryAcquire(String key, int limit, Duration window)` sliding window; package-private constructor `ThrottleService(LongSupplier clockMillis)` for tests.
  - `MediaRules`: `enum Kind {IMAGE, AUDIO}`, `record Checked(String contentType, String extension)`, `static Checked check(Kind kind, byte[] data)` (throws `ApiException` 400 empty / 413 too large / 415 unknown type; type decided by magic bytes, never by the client header), `static boolean ownsUrl(String url, String publicBase, UUID invitationId)`.
  - `RsvpSummary(int attending, int declined, int headcount)` with `static RsvpSummary of(List<Rsvp> rows)` (latest submission per lowercase-trimmed name wins; `attending`/`declined` count names; `headcount` sums `guests` of attending names).

- [ ] **Step 1: Write failing tests**

`EditKeyServiceTest`:
```java
package com.moc.wedding.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class EditKeyServiceTest {

    private final EditKeyService service = new EditKeyService();

    @Test
    void generatesUniqueUrlSafeKeys() {
        String a = service.generate();
        String b = service.generate();
        assertThat(a).isNotEqualTo(b).matches("[A-Za-z0-9_-]{43}");
    }

    @Test
    void hashIsDeterministicSha256Hex() {
        assertThat(service.hash("abc")).isEqualTo("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    }

    @Test
    void matchesOnlyTheRightKey() {
        String key = service.generate();
        String hash = service.hash(key);
        assertThat(service.matches(key, hash)).isTrue();
        assertThat(service.matches("wrong", hash)).isFalse();
        assertThat(service.matches(null, hash)).isFalse();
        assertThat(service.matches("   ", hash)).isFalse();
    }
}
```
`ThrottleServiceTest`:
```java
package com.moc.wedding.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.Test;

class ThrottleServiceTest {

    @Test
    void allowsUpToTheLimitThenBlocksUntilTheWindowPasses() {
        AtomicLong now = new AtomicLong(0);
        ThrottleService throttle = new ThrottleService(now::get);
        Duration window = Duration.ofMinutes(10);

        for (int i = 0; i < 3; i++) {
            assertThat(throttle.tryAcquire("ip:rsvp", 3, window)).isTrue();
        }
        assertThat(throttle.tryAcquire("ip:rsvp", 3, window)).isFalse();
        assertThat(throttle.tryAcquire("other", 3, window)).isTrue(); // key khác không bị ảnh hưởng

        now.set(window.toMillis()); // hết cửa sổ
        assertThat(throttle.tryAcquire("ip:rsvp", 3, window)).isTrue();
    }
}
```
`MediaRulesTest`:
```java
package com.moc.wedding.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.moc.wedding.config.ApiException;
import com.moc.wedding.service.MediaRules.Kind;
import java.util.Arrays;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class MediaRulesTest {

    private static byte[] padded(int size, int... head) {
        byte[] data = new byte[size];
        for (int i = 0; i < head.length; i++) data[i] = (byte) head[i];
        return data;
    }

    private static final byte[] PNG = padded(64, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A);
    private static final byte[] JPEG = padded(64, 0xFF, 0xD8, 0xFF, 0xE0);
    private static final byte[] WEBP = padded(64, 'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P');
    private static final byte[] MP3_ID3 = padded(64, 'I', 'D', '3');
    private static final byte[] MP3_FRAME = padded(64, 0xFF, 0xFB);

    @Test
    void detectsTypeFromMagicBytes() {
        assertThat(MediaRules.check(Kind.IMAGE, PNG)).isEqualTo(new MediaRules.Checked("image/png", "png"));
        assertThat(MediaRules.check(Kind.IMAGE, JPEG)).isEqualTo(new MediaRules.Checked("image/jpeg", "jpg"));
        assertThat(MediaRules.check(Kind.IMAGE, WEBP)).isEqualTo(new MediaRules.Checked("image/webp", "webp"));
        assertThat(MediaRules.check(Kind.AUDIO, MP3_ID3)).isEqualTo(new MediaRules.Checked("audio/mpeg", "mp3"));
        assertThat(MediaRules.check(Kind.AUDIO, MP3_FRAME).extension()).isEqualTo("mp3");
    }

    @Test
    void rejectsWrongKindAndUnknownBytesWith415() {
        assertStatus(() -> MediaRules.check(Kind.AUDIO, PNG), HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        assertStatus(() -> MediaRules.check(Kind.IMAGE, MP3_ID3), HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        assertStatus(() -> MediaRules.check(Kind.IMAGE, padded(64, 'G', 'I', 'F', '8')), HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    @Test
    void rejectsEmptyWith400AndOversizedWith413() {
        assertStatus(() -> MediaRules.check(Kind.IMAGE, new byte[0]), HttpStatus.BAD_REQUEST);
        byte[] bigImage = Arrays.copyOf(PNG, 2 * 1024 * 1024 + 1);
        assertStatus(() -> MediaRules.check(Kind.IMAGE, bigImage), HttpStatus.PAYLOAD_TOO_LARGE);
        byte[] bigAudio = Arrays.copyOf(MP3_ID3, 8 * 1024 * 1024 + 1);
        assertStatus(() -> MediaRules.check(Kind.AUDIO, bigAudio), HttpStatus.PAYLOAD_TOO_LARGE);
        assertThat(MediaRules.check(Kind.IMAGE, Arrays.copyOf(PNG, 2 * 1024 * 1024)).extension()).isEqualTo("png");
    }

    @Test
    void ownsUrlOnlyWithinThePrefixOfThatInvitation() {
        UUID id = UUID.randomUUID();
        String base = "https://x.supabase.co/storage/v1/object/public/media";
        assertThat(MediaRules.ownsUrl(base + "/" + id + "/a.webp", base, id)).isTrue();
        assertThat(MediaRules.ownsUrl(base + "/" + UUID.randomUUID() + "/a.webp", base, id)).isFalse();
        assertThat(MediaRules.ownsUrl("https://evil.example/" + id + "/a.webp", base, id)).isFalse();
        assertThat(MediaRules.ownsUrl("https://x.supabase.co.evil.com/storage/v1/object/public/media/" + id + "/a.webp", base, id)).isFalse();
        assertThat(MediaRules.ownsUrl(base + "/" + id + "/../other/a.webp", base, id)).isFalse();
        assertThat(MediaRules.ownsUrl(base + "/" + id + "/%2e%2e/other/a.webp", base, id)).isFalse();
    }

    private static void assertStatus(Runnable call, HttpStatus expected) {
        assertThatThrownBy(call::run).isInstanceOfSatisfying(ApiException.class, e -> assertThat(e.status()).isEqualTo(expected));
    }
}
```
`RsvpSummaryTest`:
```java
package com.moc.wedding.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.moc.wedding.entity.Rsvp;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class RsvpSummaryTest {

    private static Rsvp rsvp(String name, boolean attending, int guests, String at) {
        Rsvp r = new Rsvp();
        r.setName(name);
        r.setAttending(attending);
        r.setGuests(guests);
        r.setCreatedAt(Instant.parse(at));
        return r;
    }

    @Test
    void latestSubmissionPerNormalizedNameWins() {
        List<Rsvp> rows = List.of(
                rsvp("An", true, 2, "2026-01-01T00:00:00Z"),
                rsvp("  an ", false, 0, "2026-01-02T00:00:00Z"), // cùng người, gửi lại sau: từ chối
                rsvp("Bình", true, 3, "2026-01-01T00:00:00Z"));

        RsvpSummary summary = RsvpSummary.of(rows);

        assertThat(summary).isEqualTo(new RsvpSummary(1, 1, 3));
    }

    @Test
    void emptyListIsAllZero() {
        assertThat(RsvpSummary.of(List.of())).isEqualTo(new RsvpSummary(0, 0, 0));
    }
}
```

- [ ] **Step 2: Run to verify failure** — `./mvnw test -Dtest='EditKeyServiceTest,ThrottleServiceTest,MediaRulesTest,RsvpSummaryTest'`. Expected: compile errors.

- [ ] **Step 3: Implement**

`config/ApiException.java`:
```java
package com.moc.wedding.config;

import org.springframework.http.HttpStatus;

// Lỗi nghiệp vụ có mã HTTP rõ ràng; ném ở service/controller, ApiExceptionHandler đổi thành ProblemDetail cho FE.
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String detail) {
        super(detail);
        this.status = status;
    }

    public HttpStatus status() {
        return status;
    }
}
```
`config/ApiExceptionHandler.java`:
```java
package com.moc.wedding.config;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Mọi lỗi API đều ra dạng RFC 7807 ProblemDetail; FE (lib/api.ts) đọc `detail`. HIGHEST_PRECEDENCE để thắng
// advice mặc định của Boot (spring.mvc.problemdetails) khi cùng bắt MethodArgumentNotValidException.
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class ApiExceptionHandler {

    @ExceptionHandler(ApiException.class)
    ProblemDetail onApiException(ApiException e) {
        return ProblemDetail.forStatusAndDetail(e.status(), e.getMessage());
    }

    // @Valid trên request body thất bại: trả 400 kèm map field -> thông báo đầu tiên của field đó.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ProblemDetail onInvalidBody(MethodArgumentNotValidException e) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ");
        Map<String, String> errors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(f -> errors.putIfAbsent(f.getField(), f.getDefaultMessage()));
        problem.setProperty("errors", errors);
        return problem;
    }
}
```
`config/CorsConfig.java`:
```java
package com.moc.wedding.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Cho phép trình duyệt ở origin của FE gọi /api/**. Không cookie nên allowCredentials(false); auth bằng header X-Edit-Key.
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final AppProperties props;

    public CorsConfig(AppProperties props) {
        this.props = props;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(props.cors().allowedOrigins().toArray(String[]::new))
                .allowedMethods("GET", "POST", "PATCH", "OPTIONS")
                .allowedHeaders("Content-Type", "X-Edit-Key")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
```
`service/EditKeyService.java`:
```java
package com.moc.wedding.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.stereotype.Component;

// Sinh, băm và so khớp edit key (quyền sửa thiệp, thay cho tài khoản). Chỉ lưu sha256; key gốc chỉ trả cho chủ thiệp một lần.
@Component
public class EditKeyService {

    private final SecureRandom random = new SecureRandom();

    public String generate() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hash(String key) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(key.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e); // SHA-256 luôn có trong JDK
        }
    }

    // So sánh hằng thời gian (MessageDigest.isEqual) để không lộ độ dài phần khớp qua thời gian phản hồi.
    public boolean matches(String key, String storedHash) {
        if (key == null || key.isBlank()) {
            return false;
        }
        return MessageDigest.isEqual(hash(key).getBytes(StandardCharsets.UTF_8), storedHash.getBytes(StandardCharsets.UTF_8));
    }
}
```
`service/ThrottleService.java`:
```java
package com.moc.wedding.service;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;
import org.springframework.stereotype.Component;

// Giới hạn tần suất theo key (IP + hành động) bằng cửa sổ trượt trong bộ nhớ.
// Giới hạn đã biết: chỉ đúng với 1 instance; chạy nhiều instance thì chuyển sang Redis (Ecomerce-Backend có mẫu).
@Component
public class ThrottleService {

    private static final int PURGE_THRESHOLD = 10_000;
    private static final long STALE_AFTER_MS = Duration.ofHours(2).toMillis();

    private final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();
    private final LongSupplier clockMillis;

    public ThrottleService() {
        this(System::currentTimeMillis);
    }

    ThrottleService(LongSupplier clockMillis) {
        this.clockMillis = clockMillis;
    }

    // true = cho qua và ghi nhận lượt này; false = vượt `limit` lượt trong `window`.
    public boolean tryAcquire(String key, int limit, Duration window) {
        long now = clockMillis.getAsLong();
        if (hits.size() > PURGE_THRESHOLD) {
            // Dọn key lâu không hoạt động để map không phình mãi khi bị quét IP.
            hits.values().removeIf(q -> q.isEmpty() || now - q.peekLast() > STALE_AFTER_MS);
        }
        Deque<Long> times = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (times) {
            while (!times.isEmpty() && now - times.peekFirst() >= window.toMillis()) {
                times.pollFirst();
            }
            if (times.size() >= limit) {
                return false;
            }
            times.addLast(now);
            return true;
        }
    }
}
```
`service/MediaRules.java`:
```java
package com.moc.wedding.service;

import com.moc.wedding.config.ApiException;
import java.util.UUID;
import org.springframework.http.HttpStatus;

// Luật cho ảnh/nhạc tải lên. Loại file quyết định bằng magic bytes (không tin Content-Type do client gửi);
// MediaService gọi check() trước khi đẩy lên Storage, InvitationService gọi ownsUrl() để chặn URL ảnh ngoài.
public final class MediaRules {

    public enum Kind { IMAGE, AUDIO }

    public record Checked(String contentType, String extension) {
    }

    private static final long IMAGE_MAX_BYTES = 2L * 1024 * 1024;
    private static final long AUDIO_MAX_BYTES = 8L * 1024 * 1024;

    private MediaRules() {
    }

    public static Checked check(Kind kind, byte[] data) {
        if (data == null || data.length == 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File rỗng");
        }
        long max = kind == Kind.IMAGE ? IMAGE_MAX_BYTES : AUDIO_MAX_BYTES;
        if (data.length > max) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "File quá lớn (tối đa " + (max / 1024 / 1024) + "MB)");
        }
        Checked detected = kind == Kind.IMAGE ? detectImage(data) : detectAudio(data);
        if (detected == null) {
            throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                    kind == Kind.IMAGE ? "Chỉ nhận ảnh WebP, JPEG hoặc PNG" : "Chỉ nhận nhạc MP3");
        }
        return detected;
    }

    private static Checked detectImage(byte[] d) {
        if (startsWith(d, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return new Checked("image/png", "png");
        }
        if (startsWith(d, 0xFF, 0xD8, 0xFF)) {
            return new Checked("image/jpeg", "jpg");
        }
        if (d.length >= 12 && startsWith(d, 'R', 'I', 'F', 'F') && d[8] == 'W' && d[9] == 'E' && d[10] == 'B' && d[11] == 'P') {
            return new Checked("image/webp", "webp");
        }
        return null;
    }

    private static Checked detectAudio(byte[] d) {
        boolean id3 = startsWith(d, 'I', 'D', '3');
        boolean frameSync = d.length >= 2 && (d[0] & 0xFF) == 0xFF && (d[1] & 0xE0) == 0xE0;
        return id3 || frameSync ? new Checked("audio/mpeg", "mp3") : null;
    }

    private static boolean startsWith(byte[] d, int... head) {
        if (d.length < head.length) {
            return false;
        }
        for (int i = 0; i < head.length; i++) {
            if ((d[i] & 0xFF) != head[i]) {
                return false;
            }
        }
        return true;
    }

    // URL ảnh chỉ hợp lệ khi nằm dưới thư mục của chính thiệp này; chặn cả `..` và `%2e` để không thoát thư mục.
    public static boolean ownsUrl(String url, String publicBase, UUID invitationId) {
        String lower = url.toLowerCase();
        return url.startsWith(publicBase + "/" + invitationId + "/") && !lower.contains("..") && !lower.contains("%2e");
    }
}
```
`service/RsvpSummary.java`:
```java
package com.moc.wedding.service;

import com.moc.wedding.entity.Rsvp;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// Tổng hợp RSVP cho chủ thiệp. Khách không có tài khoản nên "một người" = một tên (lowercase + trim);
// lần gửi mới nhất của mỗi tên thắng, để khách đổi ý bằng cách gửi lại. ResponsesController trả kèm danh sách thô.
public record RsvpSummary(int attending, int declined, int headcount) {

    public static RsvpSummary of(List<Rsvp> rows) {
        Map<String, Rsvp> latest = new HashMap<>();
        for (Rsvp r : rows) {
            latest.merge(r.getName().trim().toLowerCase(), r, (a, b) -> b.getCreatedAt().isAfter(a.getCreatedAt()) ? b : a);
        }
        int attending = 0;
        int declined = 0;
        int headcount = 0;
        for (Rsvp r : latest.values()) {
            if (r.isAttending()) {
                attending++;
                headcount += r.getGuests();
            } else {
                declined++;
            }
        }
        return new RsvpSummary(attending, declined, headcount);
    }
}
```

- [ ] **Step 4: Verify** — `./mvnw test`. Expected: all pass.
- [ ] **Step 5: Checkpoint** — no commit unless asked.

### Task 13: Content DTO with validation + FE contract fixture

**Files:**
- Create: `dto/InvitationContent.java`, `src/test/resources/fixtures/default-content.json` (generated from the FE), `src/test/java/com/moc/wedding/dto/InvitationContentTest.java`

**Interfaces:**
- Produces: `InvitationContent` record tree exactly mirroring FE `contentSchema` (field names and nesting identical; "empty" values are `""`), all validation via Jakarta annotations. Nested records: `Couple, Person, Family, Side, Event, Photo, Music, Rsvp, Question, Guestbook, Gift, Account, Thanks`. Regex constants `URL`, `OPT_URL`, `OPT_DATE`, `OPT_TIME`.

- [ ] **Step 1: Generate the FE fixture** (this is the cross-repo contract seed). From the FE repo:
```bash
cd /Users/nguyenanhnhut/Desktop/Projects/thiep-cuoi-online-project
mkdir -p ../Thiep-cuoi-online-backend/src/test/resources/fixtures
node -e "import('./lib/content.ts').then(m => console.log(JSON.stringify(m.defaultContent(new Date('2026-09-20T00:00:00Z')), null, 2)))" > ../Thiep-cuoi-online-backend/src/test/resources/fixtures/default-content.json
```
Expected: valid JSON with `"v": 1`, two events dated `2026-12-04`, empty `album`, `"music": null`. Regenerate whenever `lib/content.ts` changes shape.

- [ ] **Step 2: Write the failing test** `InvitationContentTest`

```java
package com.moc.wedding.dto;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.function.UnaryOperator;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

class InvitationContentTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
    private final ObjectMapper json = new ObjectMapper();

    private String fixture() throws IOException {
        try (InputStream in = getClass().getResourceAsStream("/fixtures/default-content.json")) {
            return new String(in.readAllBytes());
        }
    }

    private Set<?> violations(UnaryOperator<ObjectNode> edit) throws IOException {
        ObjectNode tree = (ObjectNode) json.readTree(fixture());
        InvitationContent content = json.treeToValue(edit.apply(tree), InvitationContent.class);
        return validator.validate(content);
    }

    @Test
    void feDefaultContentIsValidAndRoundTripsWithoutLosingFields() throws IOException {
        InvitationContent content = json.readValue(fixture(), InvitationContent.class);
        assertThat(validator.validate(content)).isEmpty();

        JsonNode original = json.readTree(fixture());
        JsonNode roundTripped = json.readTree(json.writeValueAsString(content));
        assertThat(roundTripped).isEqualTo(original);
    }

    @Test
    void rejectsNonHttpUrls() throws IOException {
        assertThat(violations(t -> { ((ObjectNode) t.get("couple")).put("heroPhoto", "javascript:alert(1)"); return t; })).isNotEmpty();
        assertThat(violations(t -> { ((ObjectNode) t.get("events").get(0)).put("mapUrl", "data:text/html,x"); return t; })).isNotEmpty();
        assertThat(violations(t -> { ((ObjectNode) t.get("events").get(0)).put("mapUrl", "https://maps.google.com/?q=x"); return t; })).isEmpty();
    }

    @Test
    void enforcesLimitsAndShapes() throws IOException {
        assertThat(violations(t -> { ((ObjectNode) t.get("couple")).put("message", "x".repeat(501)); return t; })).isNotEmpty();
        assertThat(violations(t -> { ((ObjectNode) t.get("events").get(0)).put("kind", "party"); return t; })).isNotEmpty();
        assertThat(violations(t -> { ((ObjectNode) t.get("events").get(0)).put("date", "08/11/2026"); return t; })).isNotEmpty();
        assertThat(violations(t -> { t.put("v", 2); return t; })).isNotEmpty();
        assertThat(violations(t -> {
            var events = t.putArray("events");
            for (int i = 0; i < 7; i++) events.addObject().put("id", "e" + i).put("kind", "custom").put("title", "").put("date", "").put("time", "")
                    .put("lunar", "").put("venue", "").put("address", "").put("mapUrl", "");
            return t;
        })).isNotEmpty();
        assertThat(violations(t -> {
            var accounts = ((ObjectNode) t.get("gift")).putArray("accounts");
            accounts.addObject().put("holder", "groom").put("bankCode", "970436").put("accountNumber", "12ab").put("accountName", "A");
            return t;
        })).isNotEmpty();
    }

    @Test
    void rejectsMissingSections() throws IOException {
        assertThat(violations(t -> { t.remove("couple"); return t; })).isNotEmpty();
        assertThat(violations(t -> { t.remove("events"); return t; })).isNotEmpty();
    }
}
```
(Jackson 3 method names can differ slightly from Jackson 2 — e.g. `treeToValue`, `putArray`, `addObject`; if the compiler complains, adopt the Jackson 3 name; assertions stay as written. `ObjectMapper` here is bare (`new ObjectMapper()`) which fails on unknown properties, which is what we want for the round-trip test.)

- [ ] **Step 3: Run to verify failure** — `./mvnw test -Dtest=InvitationContentTest`. Expected: cannot find `InvitationContent`.

- [ ] **Step 4: Implement** `dto/InvitationContent.java`

```java
package com.moc.wedding.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

// Nội dung thiệp (cột invitations.content). Phản chiếu 1:1 contentSchema (zod) của FE, xem spec mục 6.2.
// BE là nơi cưỡng chế: giá trị "trống" luôn là "" để bản nháp đang gõ vẫn hợp lệ; URL chỉ http(s).
// InvitationService (de)serialize record này thành JSON; các trường lạ do FE gửi bị bỏ khi ghi lại.
public record InvitationContent(
        @NotNull @Min(1) @Max(1) Integer v,
        @NotNull @Valid Couple couple,
        @NotNull @Valid Family family,
        @NotNull @Size(max = 6) List<@NotNull @Valid Event> events,
        @NotNull @Size(max = 24) List<@NotNull @Valid Photo> album,
        @Valid Music music,
        @NotNull @Valid Rsvp rsvp,
        @NotNull @Valid Guestbook guestbook,
        @NotNull @Valid Gift gift,
        @NotNull @Valid Thanks thanks) {

    static final String URL = "^https?://\\S+$";
    static final String OPT_URL = "^(https?://\\S+)?$";
    static final String OPT_DATE = "^(\\d{4}-\\d{2}-\\d{2})?$";
    static final String OPT_TIME = "^(\\d{2}:\\d{2})?$";

    public record Couple(
            @NotNull @Valid Person groom,
            @NotNull @Valid Person bride,
            @NotNull @Size(max = 500) String message,
            @NotNull @Size(max = 500) @Pattern(regexp = OPT_URL) String heroPhoto) {
    }

    public record Person(@NotNull @Size(max = 60) String name) {
    }

    public record Family(@NotNull @Valid Side groomSide, @NotNull @Valid Side brideSide) {
    }

    public record Side(
            @NotNull @Size(max = 60) String father,
            @NotNull @Size(max = 60) String mother,
            @NotNull @Size(max = 200) String address) {
    }

    public record Event(
            @NotBlank @Size(max = 40) String id,
            @NotNull @Pattern(regexp = "^(engagement|ceremony|reception|custom)$") String kind,
            @NotNull @Size(max = 80) String title,
            @NotNull @Pattern(regexp = OPT_DATE) String date,
            @NotNull @Pattern(regexp = OPT_TIME) String time,
            @NotNull @Size(max = 60) String lunar,
            @NotNull @Size(max = 120) String venue,
            @NotNull @Size(max = 200) String address,
            @NotNull @Size(max = 500) @Pattern(regexp = OPT_URL) String mapUrl) {
    }

    public record Photo(
            @NotNull @Size(max = 500) @Pattern(regexp = URL) String url,
            @NotNull @Size(max = 120) String alt) {
    }

    public record Music(
            @NotNull @Size(max = 500) @Pattern(regexp = URL) String url,
            @NotNull @Size(max = 80) String title) {
    }

    public record Rsvp(
            @NotNull Boolean enabled,
            @NotNull @Pattern(regexp = OPT_DATE) String deadline,
            @NotNull @Size(max = 3) List<@NotNull @Valid Question> questions) {
    }

    public record Question(
            @NotBlank @Size(max = 40) String id,
            @NotNull @Size(max = 120) String label,
            @NotNull @Pattern(regexp = "^(text|yesno)$") String type) {
    }

    public record Guestbook(@NotNull Boolean enabled) {
    }

    public record Gift(
            @NotNull Boolean enabled,
            @NotNull @Size(max = 300) String note,
            @NotNull @Size(max = 2) List<@NotNull @Valid Account> accounts) {
    }

    public record Account(
            @NotNull @Pattern(regexp = "^(groom|bride)$") String holder,
            @NotNull @Size(max = 20) String bankCode,
            @NotNull @Pattern(regexp = "^\\d{0,20}$") String accountNumber,
            @NotNull @Size(max = 80) String accountName) {
    }

    public record Thanks(@NotNull @Size(max = 500) String message) {
    }
}
```

- [ ] **Step 5: Verify** — `./mvnw test`. Expected: pass. If the round-trip assertion fails, the record shape and the FE shape disagree: fix the record (or the FE type) so the fixture round-trips byte-for-byte as JSON trees; never loosen the test.
- [ ] **Step 6: Checkpoint** — no commit unless asked.

### Task 14: Invitation API (create, get, update, publish)

**Files:**
- Create: `dto/CreateInvitationRequest.java`, `dto/CreatedInvitationResponse.java`, `dto/UpdateInvitationRequest.java`, `dto/InvitationResponse.java`
- Create: `service/InvitationService.java`, `controller/InvitationController.java`
- Test: `src/test/java/com/moc/wedding/controller/InvitationControllerIT.java`

**Interfaces:**
- Consumes: `EditKeyService`, `ThrottleService`, `MediaRules.ownsUrl`, `AppProperties`, repositories, `InvitationContent`, `ApiException` (Tasks 10–13).
- Produces:
  - `record CreateInvitationRequest(@NotBlank @Pattern("^[a-z0-9-]{1,40}$") String templateId, @NotNull @Valid InvitationContent content)`
  - `record CreatedInvitationResponse(UUID id, String slug, String key)`
  - `record UpdateInvitationRequest(@Pattern("^[a-z0-9-]{1,40}$") String templateId, @Valid InvitationContent content, String slug, Boolean published)` (every field optional)
  - `record InvitationResponse(UUID id, String slug, String templateId, InvitationContent content, boolean published, Instant publishedAt, Instant updatedAt)`
  - `InvitationService`: `CreatedInvitationResponse create(CreateInvitationRequest)`, `Invitation authorize(UUID id, String key)` (404 unknown id, 401 missing key, 403 wrong key), `InvitationResponse get(UUID id, String key)`, `InvitationResponse update(UUID id, String key, UpdateInvitationRequest)`, `InvitationContent readContent(Invitation)`, `InvitationResponse toResponse(Invitation)`.
  - Routes: `POST /api/invitations` (201; throttle 10/hour/IP → 429), `GET /api/invitations/{id}`, `PATCH /api/invitations/{id}`; owner routes read header `X-Edit-Key`.

**Behavior rules (each has an IT case below)**
- Create: content is validated; `heroPhoto` must be `""` and `album` empty (there is no media yet); slug is 8 random `[a-z0-9]` chars, regenerated while it exists; only `sha256(key)` is stored; the plain key is returned once.
- Update `content`: validated; every non-empty `heroPhoto` and every `album[].url` must satisfy `MediaRules.ownsUrl(url, publicBase, id)` where `publicBase = supabase.url + "/storage/v1/object/public/" + supabase.bucket`; if `supabase.url` is blank any image URL is rejected with 400 "Chưa cấu hình lưu trữ ảnh". Music URL only needs to be http(s).
- Update `slug`: 409 "Slug đã bị khoá sau lần xuất bản đầu" once `publishedAt != null`; 400 if not `^[a-z0-9]+(-[a-z0-9]+)*$` or length outside 3..40; 409 "Slug đã được dùng" if taken by another invitation.
- Update `published`: `true` requires both couple names non-blank (else 422 "Hãy nhập tên cả chú rể và cô dâu."), sets `publishedAt` only if null; `false` keeps `publishedAt`.
- Content JSON is stored with `ObjectMapper.writeValueAsString(record)` and read back with `readValue`.

- [ ] **Step 1: Write the failing IT** `InvitationControllerIT`

```java
package com.moc.wedding.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.moc.wedding.repository.InvitationRepository;
import com.moc.wedding.support.TestDataCleaner;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

@SpringBootTest
@AutoConfigureMockMvc
class InvitationControllerIT {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper json;
    @Autowired private InvitationRepository invitations;
    @Autowired private TestDataCleaner cleaner;

    @BeforeEach
    void clean() {
        cleaner.cleanAll();
    }

    private ObjectNode fixtureContent() throws Exception {
        try (var in = getClass().getResourceAsStream("/fixtures/default-content.json")) {
            return (ObjectNode) json.readTree(in.readAllBytes());
        }
    }

    private record Created(UUID id, String slug, String key) {
    }

    private Created create() throws Exception {
        ObjectNode body = json.createObjectNode().put("templateId", "gallery-noir");
        body.set("content", fixtureContent());
        MvcResult res = mvc.perform(post("/api/invitations").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isCreated()).andReturn();
        JsonNode out = json.readTree(res.getResponse().getContentAsString());
        return new Created(UUID.fromString(out.get("id").asString()), out.get("slug").asString(), out.get("key").asString());
    }

    private String patchBody(String field, Object value) throws Exception {
        ObjectNode body = json.createObjectNode();
        body.set(field, json.valueToTree(value));
        return body.toString();
    }

    @Test
    void createReturnsKeyOnceAndStoresOnlyItsHash() throws Exception {
        Created c = create();
        assertThat(c.slug()).matches("[a-z0-9]{8}");
        assertThat(c.key()).hasSize(43);
        var stored = invitations.findById(c.id()).orElseThrow();
        assertThat(stored.getEditKeyHash()).hasSize(64).isNotEqualTo(c.key());
        assertThat(stored.isPublished()).isFalse();
    }

    @Test
    void createRejectsInvalidContentAndPreExistingMedia() throws Exception {
        ObjectNode body = json.createObjectNode().put("templateId", "gallery-noir");
        ObjectNode content = fixtureContent();
        ((ObjectNode) content.get("couple")).put("heroPhoto", "https://evil.example/x.png");
        body.set("content", content);
        mvc.perform(post("/api/invitations").contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isBadRequest());

        ObjectNode broken = json.createObjectNode().put("templateId", "Bad Id!");
        broken.set("content", fixtureContent());
        mvc.perform(post("/api/invitations").contentType(MediaType.APPLICATION_JSON).content(broken.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.templateId").exists());
    }

    @Test
    void ownerRoutesNeedTheRightKey() throws Exception {
        Created c = create();
        mvc.perform(get("/api/invitations/" + c.id())).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/invitations/" + c.id()).header("X-Edit-Key", "wrong")).andExpect(status().isForbidden());
        mvc.perform(get("/api/invitations/" + UUID.randomUUID()).header("X-Edit-Key", c.key())).andExpect(status().isNotFound());
        mvc.perform(get("/api/invitations/" + c.id()).header("X-Edit-Key", c.key()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value(c.slug()))
                .andExpect(jsonPath("$.published").value(false))
                .andExpect(jsonPath("$.content.couple.groom.name").value("Minh"));
    }

    @Test
    void patchUpdatesContentAndTemplateAndRejectsForeignImages() throws Exception {
        Created c = create();
        ObjectNode content = fixtureContent();
        ((ObjectNode) content.get("couple").get("groom")).put("name", "Khoa");
        ObjectNode body = json.createObjectNode().put("templateId", "afterglow");
        body.set("content", content);
        mvc.perform(patch("/api/invitations/" + c.id()).header("X-Edit-Key", c.key()).contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.templateId").value("afterglow"))
                .andExpect(jsonPath("$.content.couple.groom.name").value("Khoa"));

        ((ObjectNode) content.get("couple")).put("heroPhoto", "https://evil.example/x.png");
        ObjectNode bad = json.createObjectNode();
        bad.set("content", content);
        mvc.perform(patch("/api/invitations/" + c.id()).header("X-Edit-Key", c.key()).contentType(MediaType.APPLICATION_JSON).content(bad.toString()))
                .andExpect(status().isBadRequest());

        String own = "https://test.supabase.co/storage/v1/object/public/media/" + c.id() + "/a.webp";
        ((ObjectNode) content.get("couple")).put("heroPhoto", own);
        ObjectNode ok = json.createObjectNode();
        ok.set("content", content);
        mvc.perform(patch("/api/invitations/" + c.id()).header("X-Edit-Key", c.key()).contentType(MediaType.APPLICATION_JSON).content(ok.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.couple.heroPhoto").value(own));
    }

    @Test
    void slugChangeChecksFormatAndUniquenessAndLocksAfterFirstPublish() throws Exception {
        Created a = create();
        Created b = create();
        mvc.perform(patch("/api/invitations/" + a.id()).header("X-Edit-Key", a.key()).contentType(MediaType.APPLICATION_JSON).content(patchBody("slug", "Bad Slug")))
                .andExpect(status().isBadRequest());
        mvc.perform(patch("/api/invitations/" + a.id()).header("X-Edit-Key", a.key()).contentType(MediaType.APPLICATION_JSON).content(patchBody("slug", b.slug())))
                .andExpect(status().isConflict());
        mvc.perform(patch("/api/invitations/" + a.id()).header("X-Edit-Key", a.key()).contentType(MediaType.APPLICATION_JSON).content(patchBody("slug", "khoa-va-lan")))
                .andExpect(status().isOk()).andExpect(jsonPath("$.slug").value("khoa-va-lan"));

        ObjectNode content = fixtureContent();
        ((ObjectNode) content.get("couple").get("groom")).put("name", "Khoa");
        ObjectNode publish = json.createObjectNode().put("published", true);
        publish.set("content", content);
        mvc.perform(patch("/api/invitations/" + a.id()).header("X-Edit-Key", a.key()).contentType(MediaType.APPLICATION_JSON).content(publish.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.published").value(true)).andExpect(jsonPath("$.publishedAt").isNotEmpty());

        mvc.perform(patch("/api/invitations/" + a.id()).header("X-Edit-Key", a.key()).contentType(MediaType.APPLICATION_JSON).content(patchBody("slug", "doi-slug-khac")))
                .andExpect(status().isConflict());
        mvc.perform(patch("/api/invitations/" + a.id()).header("X-Edit-Key", a.key()).contentType(MediaType.APPLICATION_JSON).content(patchBody("published", false)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.published").value(false)).andExpect(jsonPath("$.publishedAt").isNotEmpty());
    }

    @Test
    void publishNeedsBothNames() throws Exception {
        Created c = create();
        ObjectNode content = fixtureContent();
        ((ObjectNode) content.get("couple").get("bride")).put("name", "  ");
        ObjectNode body = json.createObjectNode().put("published", true);
        body.set("content", content);
        mvc.perform(patch("/api/invitations/" + c.id()).header("X-Edit-Key", c.key()).contentType(MediaType.APPLICATION_JSON).content(body.toString()))
                .andExpect(status().isUnprocessableEntity());
        assertThat(invitations.findById(c.id()).orElseThrow().isPublished()).isFalse();
    }

    @Test
    void creationIsThrottledPerIp() throws Exception {
        ObjectNode body = json.createObjectNode().put("templateId", "gallery-noir");
        body.set("content", fixtureContent());
        for (int i = 0; i < 10; i++) {
            mvc.perform(post("/api/invitations").with(r -> { r.setRemoteAddr("203.0.113.9"); return r; })
                    .contentType(MediaType.APPLICATION_JSON).content(body.toString())).andExpect(status().isCreated());
        }
        mvc.perform(post("/api/invitations").with(r -> { r.setRemoteAddr("203.0.113.9"); return r; })
                .contentType(MediaType.APPLICATION_JSON).content(body.toString())).andExpect(status().isTooManyRequests());
    }

    @Test
    void corsAllowsOnlyTheConfiguredOrigin() throws Exception {
        mvc.perform(options("/api/invitations").header("Origin", "http://localhost:3000")
                        .header("Access-Control-Request-Method", "POST").header("Access-Control-Request-Headers", "content-type,x-edit-key"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3000"));
        mvc.perform(options("/api/invitations").header("Origin", "http://evil.example").header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden());
    }
}
```
(`creationIsThrottledPerIp` uses its own IP so it never interferes with the other tests, which all come from MockMvc's default `127.0.0.1` and stay under the limit: no test creates more than 2 invitations. If the 10/hour limit ever collides with the per-class count, raise nothing: give those tests their own `remoteAddr`.)

- [ ] **Step 2: Run to verify failure** — `./mvnw test -Dtest=InvitationControllerIT`. Expected: compile errors.

- [ ] **Step 3: Implement DTOs**

```java
// dto/CreateInvitationRequest.java
package com.moc.wedding.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

// Body của POST /api/invitations. content do FE gửi (nội dung mẫu) để văn bản mẫu chỉ tồn tại ở FE.
public record CreateInvitationRequest(
        @NotBlank @Pattern(regexp = "^[a-z0-9-]{1,40}$") String templateId,
        @NotNull @Valid InvitationContent content) {
}
```
```java
// dto/CreatedInvitationResponse.java
package com.moc.wedding.dto;

import java.util.UUID;

// Kết quả tạo thiệp. key là edit key dạng gốc, CHỈ trả ở lần này (DB chỉ giữ hash), FE phải lưu lại.
public record CreatedInvitationResponse(UUID id, String slug, String key) {
}
```
```java
// dto/UpdateInvitationRequest.java
package com.moc.wedding.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;

// Body của PATCH: trường nào null thì giữ nguyên. Luật slug/publish nằm ở InvitationService, không ở annotation.
public record UpdateInvitationRequest(
        @Pattern(regexp = "^[a-z0-9-]{1,40}$") String templateId,
        @Valid InvitationContent content,
        String slug,
        Boolean published) {
}
```
```java
// dto/InvitationResponse.java
package com.moc.wedding.dto;

import java.time.Instant;
import java.util.UUID;

// Thiệp trả cho chủ thiệp. Cố ý KHÔNG có editKeyHash.
public record InvitationResponse(UUID id, String slug, String templateId, InvitationContent content,
        boolean published, Instant publishedAt, Instant updatedAt) {
}
```

- [ ] **Step 4: Implement** `service/InvitationService.java`

```java
package com.moc.wedding.service;

import com.moc.wedding.config.ApiException;
import com.moc.wedding.config.AppProperties;
import com.moc.wedding.dto.CreateInvitationRequest;
import com.moc.wedding.dto.CreatedInvitationResponse;
import com.moc.wedding.dto.InvitationContent;
import com.moc.wedding.dto.InvitationResponse;
import com.moc.wedding.dto.UpdateInvitationRequest;
import com.moc.wedding.entity.Invitation;
import com.moc.wedding.repository.InvitationRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

// Nghiệp vụ thiệp: tạo, xác thực edit key, sửa nội dung/slug/mẫu và xuất bản. InvitationController và
// ResponsesController gọi authorize() trước mọi thao tác của chủ thiệp; media do MediaService xử lý riêng.
@Service
public class InvitationService {

    private static final Pattern SLUG = Pattern.compile("^[a-z0-9]+(-[a-z0-9]+)*$");
    private static final String SLUG_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

    private final InvitationRepository invitations;
    private final EditKeyService editKeys;
    private final AppProperties props;
    private final ObjectMapper json;
    private final SecureRandom random = new SecureRandom();

    public InvitationService(InvitationRepository invitations, EditKeyService editKeys, AppProperties props, ObjectMapper json) {
        this.invitations = invitations;
        this.editKeys = editKeys;
        this.props = props;
        this.json = json;
    }

    @Transactional
    public CreatedInvitationResponse create(CreateInvitationRequest req) {
        InvitationContent content = req.content();
        // Thiệp mới chưa có file nào trong Storage, nên mọi URL ảnh ở lần tạo đều là URL ngoài, không hợp lệ.
        if (!content.couple().heroPhoto().isEmpty() || !content.album().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiệp mới không được có sẵn ảnh");
        }
        String key = editKeys.generate();
        Invitation inv = new Invitation();
        inv.setEditKeyHash(editKeys.hash(key));
        inv.setTemplateId(req.templateId());
        inv.setContent(write(content));
        inv.setSlug(freeRandomSlug());
        invitations.save(inv);
        return new CreatedInvitationResponse(inv.getId(), inv.getSlug(), key);
    }

    // 404 nếu không có thiệp, 401 nếu thiếu key, 403 nếu key sai. Chỉ chủ thiệp (giữ key) qua được.
    public Invitation authorize(UUID id, String key) {
        Invitation inv = invitations.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy thiệp"));
        if (key == null || key.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Thiếu edit key");
        }
        if (!editKeys.matches(key, inv.getEditKeyHash())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Edit key không đúng");
        }
        return inv;
    }

    public InvitationResponse get(UUID id, String key) {
        return toResponse(authorize(id, key));
    }

    @Transactional
    public InvitationResponse update(UUID id, String key, UpdateInvitationRequest req) {
        Invitation inv = authorize(id, key);
        if (req.templateId() != null) {
            inv.setTemplateId(req.templateId());
        }
        if (req.content() != null) {
            assertOwnMedia(inv.getId(), req.content());
            inv.setContent(write(req.content()));
        }
        if (req.slug() != null && !req.slug().equals(inv.getSlug())) {
            changeSlug(inv, req.slug());
        }
        if (req.published() != null) {
            setPublished(inv, req.published());
        }
        return toResponse(invitations.save(inv));
    }

    public InvitationContent readContent(Invitation inv) {
        return json.readValue(inv.getContent(), InvitationContent.class);
    }

    public InvitationResponse toResponse(Invitation inv) {
        return new InvitationResponse(inv.getId(), inv.getSlug(), inv.getTemplateId(), readContent(inv),
                inv.isPublished(), inv.getPublishedAt(), inv.getUpdatedAt());
    }

    private String write(InvitationContent content) {
        return json.writeValueAsString(content);
    }

    private String freeRandomSlug() {
        String slug;
        do {
            StringBuilder sb = new StringBuilder(8);
            for (int i = 0; i < 8; i++) {
                sb.append(SLUG_CHARS.charAt(random.nextInt(SLUG_CHARS.length())));
            }
            slug = sb.toString();
        } while (invitations.existsBySlug(slug));
        return slug;
    }

    // Slug đã chia sẻ ra ngoài thì không được đổi (link cũ sẽ chết), nên khoá từ lần xuất bản đầu.
    private void changeSlug(Invitation inv, String slug) {
        if (inv.getPublishedAt() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "Slug đã bị khoá sau lần xuất bản đầu");
        }
        if (slug.length() < 3 || slug.length() > 40 || !SLUG.matcher(slug).matches()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Slug chỉ gồm a-z, 0-9 và dấu gạch ngang, dài 3-40 ký tự");
        }
        if (invitations.existsBySlug(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "Slug đã được dùng");
        }
        inv.setSlug(slug);
    }

    private void setPublished(Invitation inv, boolean published) {
        if (published) {
            InvitationContent c = readContent(inv);
            if (c.couple().groom().name().isBlank() || c.couple().bride().name().isBlank()) {
                throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY, "Hãy nhập tên cả chú rể và cô dâu.");
            }
            if (inv.getPublishedAt() == null) {
                inv.setPublishedAt(Instant.now());
            }
        }
        inv.setPublished(published);
    }

    // Ảnh phải do chính thiệp này tải lên (nằm dưới thư mục {invitationId}/ của bucket) để không nhúng URL bên thứ ba
    // (theo dõi khách mở thiệp) và không trỏ sang ảnh của thiệp khác.
    private void assertOwnMedia(UUID invitationId, InvitationContent content) {
        var urls = new java.util.ArrayList<String>();
        if (!content.couple().heroPhoto().isEmpty()) {
            urls.add(content.couple().heroPhoto());
        }
        content.album().forEach(p -> urls.add(p.url()));
        if (urls.isEmpty()) {
            return;
        }
        AppProperties.Supabase s = props.supabase();
        if (s == null || s.url() == null || s.url().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Chưa cấu hình lưu trữ ảnh");
        }
        String base = s.url() + "/storage/v1/object/public/" + s.bucket();
        for (String url : urls) {
            if (!MediaRules.ownsUrl(url, base, invitationId)) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Ảnh phải được tải lên qua trang chỉnh sửa");
            }
        }
    }
}
```
(Jackson 3's `readValue`/`writeValueAsString` throw unchecked `JacksonException`, so no try/catch is needed; if the compiler disagrees, wrap in `IllegalStateException`.)

- [ ] **Step 5: Implement** `controller/InvitationController.java`

```java
package com.moc.wedding.controller;

import com.moc.wedding.config.ApiException;
import com.moc.wedding.dto.CreateInvitationRequest;
import com.moc.wedding.dto.CreatedInvitationResponse;
import com.moc.wedding.dto.InvitationResponse;
import com.moc.wedding.dto.UpdateInvitationRequest;
import com.moc.wedding.service.InvitationService;
import com.moc.wedding.service.ThrottleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// Cửa vào HTTP cho chủ thiệp: tạo/đọc/sửa thiệp. Nghiệp vụ nằm ở InvitationService; route sửa/đọc xác thực bằng header X-Edit-Key.
@RestController
@RequestMapping("/api/invitations")
public class InvitationController {

    private final InvitationService service;
    private final ThrottleService throttle;

    public InvitationController(InvitationService service, ThrottleService throttle) {
        this.service = service;
        this.throttle = throttle;
    }

    // POST /api/invitations: tạo bản nháp. Công khai (chưa có tài khoản) nên throttle 10 lượt/giờ/IP để chống tạo rác.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    CreatedInvitationResponse create(@Valid @RequestBody CreateInvitationRequest req, HttpServletRequest http) {
        if (!throttle.tryAcquire("create:" + http.getRemoteAddr(), 10, Duration.ofHours(1))) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Bạn tạo thiệp quá nhanh, hãy thử lại sau");
        }
        return service.create(req);
    }

    // GET /api/invitations/{id}: đọc thiệp để chỉnh sửa; cần X-Edit-Key.
    @GetMapping("/{id}")
    InvitationResponse get(@PathVariable UUID id, @RequestHeader(value = "X-Edit-Key", required = false) String key) {
        return service.get(id, key);
    }

    // PATCH /api/invitations/{id}: sửa mẫu/nội dung/slug hoặc xuất bản; cần X-Edit-Key.
    @PatchMapping("/{id}")
    InvitationResponse update(@PathVariable UUID id, @RequestHeader(value = "X-Edit-Key", required = false) String key,
            @Valid @RequestBody UpdateInvitationRequest req) {
        return service.update(id, key, req);
    }
}
```

- [ ] **Step 6: Verify** — `./mvnw test`. Expected: all pass. If `creationIsThrottledPerIp` interferes with other tests through the shared `ThrottleService` bean (context is cached across ITs), give every other `create()` call in the suite its own `remoteAddr` or clear the throttle via a test-only reset; do not raise the production limit.
- [ ] **Step 7: Checkpoint** — no commit unless asked.

### Task 15: Public API (read by slug, RSVP, guestbook)

**Files:**
- Create: `dto/PublicInvitationResponse.java`, `dto/PublicWishResponse.java`, `dto/RsvpRequest.java`, `dto/WishRequest.java`
- Create: `service/PublicInvitationService.java` (read + RSVP + wish submission), `controller/PublicInvitationController.java`
- Test: `controller/PublicInvitationControllerIT.java`

**Interfaces:**
- Consumes: repositories, `InvitationService.readContent`, `ThrottleService`, `ApiException`, `RsvpSummary` not needed here.
- Produces:
  - `record PublicWishResponse(UUID id, String name, String message, Instant createdAt)`
  - `record PublicInvitationResponse(String slug, String templateId, InvitationContent content, List<PublicWishResponse> wishes)`
  - `record RsvpRequest(@NotBlank @Size(max=80) String name, @NotNull Boolean attending, @NotNull @Min(0) @Max(20) Integer guests, @NotNull @Size(max=500) String note, @NotNull @Size(max=3) Map<String, @Size(max=300) String> answers, @NotNull @Size(max=80) String guestLabel, @NotNull @Size(max=200) String website)`
  - `record WishRequest(@NotBlank @Size(max=80) String name, @NotBlank @Size(max=500) String message, @NotNull @Size(max=200) String website)`
  - Routes: `GET /api/public/invitations/{slug}` (200, `Cache-Control: no-store`), `POST /api/public/invitations/{slug}/rsvp` (204), `POST /api/public/invitations/{slug}/wishes` (201, body `PublicWishResponse`). No auth.

**Behavior rules**
- Unknown slug or `published = false` → 404 on all three routes.
- Read returns at most 50 non-hidden wishes, newest first.
- Honeypot: `website` non-blank → RSVP returns 204 and saves nothing; wish returns 201 with a synthetic `PublicWishResponse` (random id, current time) and saves nothing.
- Throttle `5 / 10 minutes` per `ip + ":" + action + ":" + slug`, excess → 429 "Bạn gửi quá nhanh, hãy thử lại sau ít phút".
- RSVP requires `content.rsvp.enabled`, wish requires `content.guestbook.enabled`; otherwise 403 "Chủ thiệp đã tắt tính năng này".
- RSVP: `name` and `guestLabel` trimmed; when `attending = false` store `guests = 0`; `answers` keeps only keys equal to a configured question id (others dropped); stored as JSON via `ObjectMapper`.
- Wish: `name`/`message` trimmed; blank after trim → 400.

- [ ] **Step 1: Write the failing IT** covering: unpublished → 404 on all three; published read returns content + wishes and `Cache-Control: no-store`; hidden wish absent; RSVP saved (check row: guests forced to 0 when declining; unknown answer keys dropped; name trimmed); honeypot → nothing saved for both routes; RSVP disabled and guestbook disabled → 403; 6th submission from one IP in 10 minutes → 429 while another IP still passes; validation 400 (blank name, `guests` 21, message 501 chars). Reuse the `create()` + publish helpers from `InvitationControllerIT` by extracting them into `src/test/java/com/moc/wedding/support/InvitationTestSupport.java`.
- [ ] **Step 2: Run to verify failure** — `./mvnw test -Dtest=PublicInvitationControllerIT`.
- [ ] **Step 3: Implement** the DTOs, service and controller (Vietnamese comments per Task 10 convention; `GET` builds `PublicInvitationResponse` from `findBySlug(...).filter(Invitation::isPublished)`).
- [ ] **Step 4: Verify** — `./mvnw test`. Expected: all pass. Give each IT its own `remoteAddr` so shared `ThrottleService` state cannot cross-contaminate.
- [ ] **Step 5: Checkpoint** — no commit unless asked.

### Task 16: Owner responses API (RSVP list, summary, hide wishes)

**Files:**
- Create: `dto/ResponsesResponse.java` (with nested `RsvpRow`, `WishRow`), `dto/HideWishRequest.java`, `controller/ResponsesController.java`
- Test: `controller/ResponsesControllerIT.java`

**Interfaces:**
- Produces:
  - `record ResponsesResponse(List<RsvpRow> rsvps, RsvpSummary summary, List<WishRow> wishes)`; `record RsvpRow(UUID id, String name, boolean attending, int guests, String note, Map<String,String> answers, String guestLabel, Instant createdAt)`; `record WishRow(UUID id, String name, String message, Instant createdAt, boolean hidden)` (JSON names must match FE `RsvpRow`/`WishRow`/`ResponsesDto`).
  - `record HideWishRequest(@NotNull Boolean hidden)`
  - Routes: `GET /api/invitations/{id}/responses` (200), `PATCH /api/invitations/{id}/wishes/{wishId}` (204). Both need `X-Edit-Key` (`InvitationService.authorize`).

**Behavior rules**
- `rsvps` newest first (raw rows), `summary = RsvpSummary.of(rows)`, `wishes` newest first including hidden ones.
- `PATCH` on a wish that belongs to another invitation → 404 (`findByIdAndInvitationId`); key of invitation A can never touch invitation B's wishes.

- [ ] **Step 1: Write the failing IT**: wrong/missing key → 403/401; after two RSVPs from the same name (attend then decline) the summary counts the decline only; hide a wish → owner list shows `hidden = true`, public read no longer returns it; unhide restores it; foreign wish id → 404.
- [ ] **Step 2: Run to verify failure**, **Step 3: Implement** (answers JSON → `Map<String,String>` via `ObjectMapper`), **Step 4: Verify** — `./mvnw test`, **Step 5: Checkpoint**.

### Task 17: Media upload API (Supabase Storage)

**Files:**
- Create: `storage/MediaStorage.java`, `storage/SupabaseMediaStorage.java`, `service/MediaService.java`, `controller/MediaController.java`, `dto/MediaResponse.java`
- Test: `controller/MediaControllerIT.java`

**Interfaces:**
- Produces:
  - `interface MediaStorage { String upload(String path, byte[] data, String contentType); }` returns the public URL. It is the only interface with a second (test) implementation.
  - `SupabaseMediaStorage implements MediaStorage`: `POST {supabase.url}/storage/v1/object/{bucket}/{path}` with headers `Authorization: Bearer <service key>`, `apikey: <service key>`, `Content-Type`, `x-upsert: false`, using Spring `RestClient`; returns `{url}/storage/v1/object/public/{bucket}/{path}`. Throws `ApiException(503, "Chưa cấu hình Supabase Storage")` when url or key is blank, and `ApiException(502, …)` when Storage rejects the upload. **Before coding, confirm the endpoint and headers against the current Supabase Storage docs** (Context7 or the docs site).
  - `record MediaResponse(String url)`; `MediaService.upload(UUID id, String key, MediaRules.Kind kind, byte[] data)` → `authorize`, `MediaRules.check`, path `"{id}/{uuid}.{ext}"`, `storage.upload(path, data, checked.contentType())`.
  - Route: `POST /api/invitations/{id}/media`, multipart parts `kind` (`image`|`audio`, else 400) and `file`, header `X-Edit-Key`, returns 201 `MediaResponse`.

- [ ] **Step 1: Write the failing IT** with `@MockitoBean MediaStorage storage` (`org.springframework.test.context.bean.override.mockito.MockitoBean`): valid PNG bytes as `image` → 201 and the mock received `("<id>/<uuid>.png", bytes, "image/png")`; a `.png` with a lying `Content-Type: audio/mpeg` header is judged by magic bytes; MP3 as `image` → 415; 3 MB PNG → 413; empty file → 400; unknown `kind` → 400; missing/wrong key → 401/403; storage not configured → 503 (separate small unit test of `SupabaseMediaStorage` with blank properties).
- [ ] **Step 2: Run to verify failure**, **Step 3: Implement**, **Step 4: Verify** — `./mvnw test`.
- [ ] **Step 5: Live check (needs the user's Supabase project; skip and say so if credentials are absent):** set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, create public bucket `media` (8 MB, mime `image/webp,image/jpeg,image/png,audio/mpeg`), `curl -F kind=image -F file=@some.png -H "X-Edit-Key: …" http://localhost:8080/api/invitations/<id>/media`, open the returned URL in a browser. Expected: image loads; then `PATCH` the invitation with that URL as `heroPhoto` succeeds.
- [ ] **Step 6: Checkpoint** — no commit unless asked.

### Task 18: Backend finish (OpenAPI, Docker, docs)

**Files:**
- Modify: `CLAUDE.md`, `.env.example`
- Test: `config/OpenApiIT.java`

- [ ] **Step 1:** `OpenApiIT` (`@SpringBootTest @AutoConfigureMockMvc`): `GET /v3/api-docs` → 200 and paths include `/api/invitations`, `/api/invitations/{id}`, `/api/invitations/{id}/media`, `/api/invitations/{id}/responses`, `/api/invitations/{id}/wishes/{wishId}`, `/api/public/invitations/{slug}`, `/api/public/invitations/{slug}/rsvp`, `/api/public/invitations/{slug}/wishes`.
- [ ] **Step 2:** `docker build -t moc-wedding-backend .` succeeds (skip and say so if the Docker daemon is unavailable).
- [ ] **Step 3:** Update `CLAUDE.md` with the outcome of the JSON-mapping decision (Task 11), the final endpoint list, throttle limits and the contract-fixture regeneration command. Full `./mvnw test` green.
- [ ] **Step 4: Checkpoint** — no commit unless asked.

---

## Milestone 3 — Frontend ↔ backend (FE repo)

FE dev requires the BE running: `docker compose up -d db` + `./mvnw spring-boot:run` in the backend repo, `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`. CORS is already limited to `http://localhost:3000`.

### Task 19: Public invitation page `/invite/[slug]`

**Files:**
- Modify: `app/invite/[slug]/page.tsx` (replace the stub)
- Create: `app/invite/[slug]/layout.tsx` (wrap children in `<div className={invitationFontClasses}>`)

**Contract**
- Server component; `params` and `searchParams` are Promises in Next 16. `const dto = await api.getPublicInvitation(slug)`; `null` → `notFound()`. `template = getTemplate(dto.templateId) ?? getTemplate(DEFAULT_TEMPLATE_ID)`. `to` (first value, trimmed, ≤ 80 chars) becomes `guestName`. Render `<InvitationRenderer mode="live" slug template content wishes guestName />`. `export const dynamic = "force-dynamic"`.
- `generateMetadata`: title `Thiệp cưới {groom} & {bride}`, description with the first event date via `formatDateVi`, `openGraph.images` = `content.couple.heroPhoto` when non-empty, `robots: { index: false, follow: false }`.
- Backend unreachable → show a friendly error page (`error.tsx` with a retry button), never a raw stack.

- [ ] **Step 1:** implement; **Step 2:** with BE running create + publish an invitation via `curl`, open `/invite/<slug>?to=Chú%20Ba` at 390px: envelope shows the guest name, RSVP and wish submit succeed (row appears in the wish list), an unpublished slug → 404 page, BE stopped → error page.
- [ ] **Step 3: Verify** — `npm test && npm run typecheck && npm run build`.
- [ ] **Step 4: Checkpoint** — no commit unless asked.

### Task 20: Studio home `/studio` (list + choose template + create)

**Files:**
- Modify: `app/studio/page.tsx`; delete `components/studio/StudioShell.tsx`; remove the old `.studio-*` rules from `app/globals.css`
- Create: `app/studio/layout.tsx`, `components/studio/StudioHome.tsx`, `components/studio/studio.css`

**Contract**
- Client component. "Thiệp của tôi": entries from `createLocalStore(window.localStorage).list()` with title, last updated, "Chỉnh sửa" (→ `/studio/{id}#k={key}`), "Mở thiệp" (→ `/invite/{slug}`), "Xoá khỏi máy này" (removes only the local entry; say so in the confirm text: the invitation itself stays on the server).
- "Tạo thiệp mới": template grid from `templates` (cover thumbnails via `<InvitationRenderer only="cover" …/>`), preselected by `?template=<id>`. Choosing one calls `api.createInvitation(id, defaultContent())`, saves `{id, slug, key, title: "Thiệp mới", updatedAt}` locally, then `router.push('/studio/{id}#k={key}')`. Errors (429, network) shown inline.
- "Đã có link chỉnh sửa?": paste a link, parse `/studio/{id}#k={key}`, verify with `api.getInvitation`, save locally.
- Persistent notice: "Hãy lưu link chỉnh sửa. Mất link là mất quyền sửa thiệp."

- [ ] **Step 1:** implement; **Step 2:** manual check at 390px and 1280px (empty state, create flow lands in `/studio/{id}`, list survives reload, paste-link flow works, remove works); **Step 3: Verify** — `npm test && npm run typecheck && npm run build`; **Step 4: Checkpoint**.

### Task 21: Editor shell `/studio/[id]` (load, state, autosave, live preview)

**Files:**
- Create: `app/studio/[id]/page.tsx`, `components/studio/Editor.tsx`, `components/studio/PreviewFrame.tsx`, `components/studio/useAutosave.ts`

**Contract**
- Key resolution order: `location.hash` (`#k=…`) → local store entry for this id → "Cần link chỉnh sửa" screen (with a paste box). When the hash key is valid, upsert it into the local store.
- Load with `api.getInvitation(id, key)`; 401/403 → the "Cần link chỉnh sửa" screen; 404 → "Không tìm thấy thiệp".
- State: `{templateId, content, slug, published}`. `useAutosave(state, save)`: debounce 800 ms, serializes saves (never two PATCHes in flight), flushes on `pagehide`/`visibilitychange` (use `fetch(..., {keepalive: true})` via a dedicated `flush()`), exposes `status: "saved" | "saving" | "error"` and `retry()`. Only changed fields (`templateId`, `content`) are sent. Last-write-wins; on a save error keep local state and show the error with a retry button.
- Layout: two columns ≥ 900px (left: panels, right: `PreviewFrame`), tabs "Sửa | Xem" below. `PreviewFrame` = 390px-wide phone frame containing `<InvitationRenderer mode="preview" gate={false} …/>` fed by the draft state, scrollable inside the frame.
- Header: back to `/studio`, autosave status, "Xuất bản" button (wired in Task 23). Panel navigation is a tab list with the seven panels from spec section 8; panels themselves land in Task 22 (stubs render their title).

- [ ] **Step 1:** implement shell; **Step 2:** manual check: edit-link works from another browser profile, autosave status transitions, reload keeps edits, preview updates live, key-less visit shows the recovery screen, BE stopped shows the error state and recovers on retry; **Step 3: Verify**; **Step 4: Checkpoint**.

### Task 22: Editor panels

**Files:**
- Create: `components/studio/panels/{TemplatePanel,CouplePanel,EventsPanel,MediaPanel,RsvpPanel,GiftPanel}.tsx`, `components/studio/fields.tsx` (`TextField`, `TextAreaField`, `ToggleField`, `SelectField`, `ListEditor`), `lib/image-compress.ts`

**Contract (each panel is a controlled component `({content, onChange})`, `TemplatePanel` gets `{templateId, onTemplate}`)**
- **TemplatePanel**: grid of the 7 templates with palette swatches; selecting only changes `templateId`.
- **CouplePanel**: groom/bride names, invitation message (≤ 500 with counter), hero photo (upload via `MediaPanel`'s uploader), both families (father, mother, address).
- **EventsPanel**: add/remove up to 6, reorder (up/down buttons, keyboard accessible), fields kind/title/date/time/lunar/venue/address/mapUrl, inline validation hints.
- **MediaPanel**: album (≤ 24) with upload button + drag-drop, per-photo alt text, remove, reorder; music: upload mp3 (≤ 8 MB) or paste an audio URL, title. Images go through `compressImage(file)` then `api.uploadMedia(id, key, "image", blob, name)`; show per-file progress/error; never put a `blob:` URL in `content`.
- **RsvpPanel**: RSVP toggle, deadline date, up to 3 questions (label + type), guestbook toggle.
- **GiftPanel**: enable, note, up to 2 accounts (holder, bank select from `BANKS`, account number digits only, holder name upper-cased suggestion), live QR preview via `vietQrUrl` when `isAccountComplete`.
- A thanks message field sits at the bottom of CouplePanel.
- `lib/image-compress.ts`: `compressImage(file: File, maxEdge = 1600): Promise<Blob>` using `createImageBitmap` + canvas, output WebP at 0.82 (fallback JPEG when the browser cannot encode WebP), result must be ≤ 2 MB else retry at lower quality (0.7, 0.6) before failing with a Vietnamese message.
- All fields have visible labels, errors are announced (`aria-live`), controls are keyboard-operable.

- [ ] **Step 1:** implement fields + panels one at a time, checking the live preview after each; **Step 2:** manual check of every panel at 390px and 1280px including upload (needs Supabase creds; without them verify the client-side path up to the BE's 503/400 and say so); **Step 3: Verify** — `npm test && npm run typecheck && npm run build`; **Step 4: Checkpoint**.

### Task 23: Publish flow + Responses panel

**Files:**
- Create: `components/studio/PublishDialog.tsx`, `components/studio/ResponsesPanel.tsx`
- Modify: `components/studio/Editor.tsx`

**Contract**
- `PublishDialog` (accessible modal): slug input prefilled from `slugify(groom + "-" + bride)` when the invitation was never published, editable until first publish, locked after (`publishedAt !== null`, show why). Shows `publishIssues(content)` blockers (including the sample-names rule) and disables "Xuất bản" while any remain; BE 409 "Slug đã được dùng" shows inline. On success: public link `${location.origin}/invite/${slug}`, copy button, Web Share button (when `navigator.share` exists), QR of the link via `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=<encoded link>`. "Gỡ xuất bản" sends `published: false`. Reminder to keep the edit link with a "Sao chép link chỉnh sửa" button.
- `ResponsesPanel`: `api.getResponses`, refresh button; summary chips (`attending`, `declined`, `headcount`), RSVP table (name, attending, guests, note, answers, guest label, time), wishes list with hide/unhide (`api.setWishHidden`, optimistic with rollback on error); empty states.

- [ ] **Step 1:** implement; **Step 2:** manual check: publish with sample names is blocked, real names publish and the link opens the public page, slug locks after publish, unpublish makes the public link 404, hide a wish → public page no longer shows it; **Step 3: Verify**; **Step 4: Checkpoint**.

---

## Milestone 5 — End-to-end and wrap-up

### Task 24: E2E, polish, docs

- [ ] **Step 1:** Start Postgres, BE and FE. Drive the full flow in a real browser (browser MCP): create → edit every panel → publish → open `/invite/<slug>?to=…` at 390px and 1280px for **all 7 templates** (switch template in Studio, screenshot each) → RSVP + wish from a second browser context → see them in the Responses panel → hide the wish → public page no longer shows it → unpublish → 404.
- [ ] **Step 2:** Error paths: wrong key (403 screen), duplicate slug (409 inline), 429 after rapid RSVPs, oversized/wrong-type upload, BE down (friendly error), CORS from a foreign origin refused (`curl -H "Origin: http://evil.example" -X OPTIONS …` → 403).
- [ ] **Step 3:** Accessibility and performance pass on `/invite/<slug>` and `/studio/<id>` (keyboard-only run-through, Lighthouse a11y ≥ 90, no console errors, cover LCP reasonable on a throttled mobile profile); fix at the root cause.
- [ ] **Step 4:** Docs: FE `README.md` (run instructions, env, repo relationship, how to regenerate the BE contract fixture), BE `CLAUDE.md` confirmed. Update `app/sitemap.ts`/`robots.ts` only if routes changed.
- [ ] **Step 5:** Full gates: FE `npm test && npm run typecheck && npm run build`; BE `./mvnw test`. Report honestly what was verified live and what needs the user's Supabase credentials.
- [ ] **Step 6:** Ask the user whether to create a feature branch and commit (both repos), and whether to `git init` the backend.

---

## Self-review against the spec

| Spec item | Task |
|---|---|
| Template system (7 templates, 5 archetypes, data-driven) | 4, 6–9 |
| Content model + validation both sides + lunar field | 2, 13 |
| Public page: envelope/`?to=`, couple, family, events + maps, countdown + calendar, album + lightbox, RSVP, guestbook, gift QR, thanks, music, OG metadata | 6, 19 |
| Edit key model (hash only, `X-Edit-Key`, constant-time) | 12, 14 |
| Publish rules, slug lock, 404 when unpublished | 14, 15, 23 |
| RSVP latest-per-name summary, hide wishes | 12, 16, 23 |
| Spam control (honeypot, length caps, throttle) | 12, 15 |
| Media (client compression, BE validation by magic bytes, Supabase Storage, own-prefix rule) | 12, 14, 17, 22 |
| Studio (list, create, editor 2-col, live preview, autosave, publish, responses) | 20–23 |
| `/templates` from registry + `/templates/[id]` + sitemap | 6, 9 |
| CORS limited to FE origin, ProblemDetail errors, actuator health | 10, 12 |
| Toolchain, `.gitignore`, delete `dist/`, tests replace the dead smoke test | 1 |
| Verification (unit, IT, E2E, error paths) | every task, 24 |

Type/name consistency to re-check while building: FE `RsvpRow`/`WishRow`/`ResponsesDto` ↔ BE `ResponsesResponse`; FE `InvitationDto` ↔ BE `InvitationResponse`; FE `PublicInvitationDto` ↔ BE `PublicInvitationResponse`; FE `RsvpInput`/`WishInput` (including `website`) ↔ BE `RsvpRequest`/`WishRequest`; header name `X-Edit-Key`; paths `/api/invitations/**` and `/api/public/invitations/**`.
