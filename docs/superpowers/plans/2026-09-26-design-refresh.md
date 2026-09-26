# MỘC design system migration Implementation Plan

> **Superseded (2026-09-26)** by `docs/superpowers/plans/2026-09-26-design-system-core.md`. The ticks below mean route health only, not visual parity.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate the complete `design/` reference set into the existing Next.js UI without changing product data flows, while proving every public route and primary navigation path works at desktop and mobile sizes.

**Architecture:** Treat the `.dc.html` files as visual source-of-truth, not as runtime pages. Extract their shared language into existing global tokens, `SiteHeader`, `SiteFooter`, marketing primitives, gallery primitives, Studio shell, and invitation shell; keep existing data and business logic behind those surfaces. Migrate in risk order: shared shell → marketing/gallery → Studio/account → guest invitation → tools → route/interaction QA.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS, existing `lucide-react`/Motion/Embla components, Node test runner, Playwright browser checks.

**Spec:** `design/README.md`, `design/Site Header.dc.html`, `design/Site Footer.dc.html`, `design/Trang Chu.dc.html`, `design/Mau Thiep v2.dc.html`, `design/Studio.dc.html`, `design/Studio Editor.dc.html`, `design/Thiep Khach.dc.html`, and the remaining `design/*.dc.html` references.

## What “100%” means for this migration

- Every route listed by `app/sitemap.ts` returns 200 in a production build at 390px and 1280px.
- Every internal `header a`, `footer a`, primary CTA, breadcrumb, card, and related-content link resolves to a real route; no guessed or stale route names remain.
- No `console.error`, `pageerror`, horizontal overflow, broken image, or hydration error appears during the route sweep.
- Mobile menu opens, navigates, and closes after navigation; filters, tabs, accordions, forms, downloads, and Studio navigation retain their existing behavior.
- `npm test`, `npm run typecheck`, `npm run build`, `git diff --check`, and the Playwright matrix all pass after the final change.
- “100%” is limited to the checked route/interaction matrix; external services such as backend production availability, Supabase, VietQR, Google Maps, and CDN uptime remain external risks.

## Global constraints

- Keep existing URLs, query parameters (`?to=`, `?g=`, `?lang=`, `?k=`), APIs, localStorage keys, and invitation content schema stable.
- Reuse existing components and dependencies; do not add a UI library for styling already covered by CSS/native elements.
- Preserve semantic links/buttons, visible keyboard focus, reduced-motion behavior, contrast, and mobile touch targets.
- Do not copy design-only `support.js`, `image-slot.js`, or placeholder content into the application runtime.
- Use the real route/data registries (`app/sitemap.ts`, `lib/templates.ts`, `lib/marketing/features.ts`, `lib/marketing/blog.ts`) as the route inventory.
- Before changing Next.js code, read the relevant local guide under `node_modules/next/dist/docs/`.

## Review focus and owning tests

- Stale links and duplicated labels → `tests/navigation.test.ts` plus Playwright link sweep.
- Korean template filter and other archetype filters → `tests/templates.test.ts` plus gallery interaction check.
- Mobile header/footer overflow → Playwright at 390px with `scrollWidth <= clientWidth`.
- Client/server boundaries and hydration → production build plus console/pageerror sweep.
- Studio/invitation query preservation → Playwright checks for `/studio`, `/invite/[slug]?to=...`, `?g=...`, `?lang=en`, and `#k=...` using existing fixtures or safe local demo data.

### Task 1: Freeze the route and design inventory

**Files:**
- Read: `design/README.md`, all `design/*.dc.html`
- Read: `app/sitemap.ts`, `app/**/page.tsx`, `lib/templates.ts`, `lib/marketing/features.ts`, `lib/marketing/blog.ts`
- Modify: `tests/navigation.test.ts`
- Modify: `PROGRESS.md`

- [x] Build one route table from the sitemap and registries; include the design source file, current Next route, page owner, and required query parameters.
- [x] Add assertions that every primary header/footer href is in the route inventory and that every template/feature/blog registry item has a corresponding route.
- [x] Run `npm test -- --test-name-pattern='navigation|route'`; confirm the test fails if a route is intentionally removed, then keep it green.
- [x] Record the inventory and any intentional design-only page with no runtime route in `PROGRESS.md`.

### Task 2: Extract the shared MỘC design system

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `components/site/SiteHeader.tsx`
- Modify: `components/site/MobileMenu.tsx`
- Modify: `components/site/SiteFooter.tsx`
- Modify: `components/marketing/MarketingLayout.tsx`
- Modify: `components/marketing/marketing.css`
- Test: `tests/navigation.test.ts`

- [x] Map the design palette to named tokens: paper `#f8f4ee`, ink `#1a1412`, muted `#5e534b`, lacquer `#a3161c`, gold `#c9a86a`, dark lacquer `#1c1012`, and line `#e8dfd3`.
- [x] Map the reference type roles to the existing Next font setup or a safe local fallback; do not load Google Fonts from runtime HTML.
- [x] Match header geometry: sticky translucent paper bar, MỘC seal mark, five/six primary destinations, account action, pill CTA, and mobile details menu.
- [x] Match footer geometry: CTA band, discovery/help/tools columns, legal links, and responsive one-column layout.
- [x] Add/repair active states, focus states, reduced-motion rules, touch target sizes, and long-label wrapping.
- [x] Run typecheck, unit tests, and a single production build before moving to page migrations.

### Task 3: Migrate the home, template gallery, and template detail

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/home/home.css`
- Modify: `components/home/Carousel.tsx`
- Modify: `app/templates/page.tsx`
- Modify: `app/templates/[id]/page.tsx`
- Modify: `components/templates/ArchetypeFilter.tsx`
- Modify: `components/templates/ScaledFrame.tsx`
- Modify: `components/templates/gallery.css`
- Test: `tests/templates.test.ts`

- [x] Implement the reference composition: editorial hero, lacquer ranking/featured rail, filter chip row, template grid, preview CTA, collection guidance, FAQ/CTA closing section.
- [x] Keep all previews backed by `InvitationRenderer` and `lib/templates.ts`; no duplicate template markup or fake design data.
- [x] Support every archetype, including `korean`, with filter state preserved in accessible button semantics.
- [x] Verify card links, preview links, CTA links, keyboard focus, reduced motion, and 390px/1280px layout.
- [x] Run the template unit tests and the focused Playwright gallery interaction test.

### Task 4: Migrate marketing, SEO, help, blog, legal, and donate surfaces

**Files:**
- Modify: `app/bang-gia/page.tsx`
- Modify: `app/tinh-nang/page.tsx`
- Modify: `app/tinh-nang/[slug]/page.tsx`
- Modify: `app/tro-giup/page.tsx`
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/dieu-khoan/page.tsx`
- Modify: `app/quyen-rieng-tu/page.tsx`
- Modify: `app/ung-ho/page.tsx`
- Modify: `components/seo/SeoLandingPage.tsx`
- Modify: `components/marketing/FaqList.tsx`
- Modify: `components/marketing/BlogBody.tsx`
- Modify: `components/marketing/LegalBody.tsx`
- Modify: `components/marketing/marketing.css`
- Test: `tests/marketing.test.ts`

- [x] Apply the design's editorial hero, quick navigation, feature cards, article layout, FAQ filtering/search, pricing card, legal tabs, and donate card while retaining the existing content registries and metadata.
- [x] Fix every related-content link from the real slug registries; no placeholder `#` or design-only filename hrefs.
- [x] Keep legal and donate copy/data unchanged unless explicitly required by the design; do not invent payment or legal behavior.
- [x] Verify breadcrumb semantics, metadata, JSON-LD, keyboard FAQ behavior, search clear behavior, and empty/no-result states.
- [x] Run marketing tests, typecheck, and focused Playwright checks.

### Task 5: Migrate Studio home, Editor, Account, and all tools

**Files:**
- Modify: `app/studio/page.tsx`
- Modify: `app/studio/[id]/page.tsx`
- Modify: `app/studio/layout.tsx`
- Modify: `components/studio/StudioHome.tsx`
- Modify: `components/studio/Editor.tsx`
- Modify: `components/studio/studio.css`
- Modify: `components/studio/panels.css`
- Modify: `app/account/page.tsx`
- Modify: `components/account/AccountClient.tsx`
- Modify: `components/account/account.css`
- Modify: `app/cong-cu-dam-cuoi/page.tsx`
- Modify: `components/tools/ToolPage.tsx`
- Modify: `components/tools/tools.css`
- Modify: `components/tools/*.tsx`

- [x] Match the Studio reference: template chooser, couple/date setup, persistent preview, editor tabs, save/publish feedback, and return links without changing API calls or autosave behavior.
- [x] Match Account reference: sign-in/demo state, existing invitation list, claim flow, and links back to Studio/editor/guest invitation.
- [x] Match the tool hub and seven tool pages using their existing working interaction components; preserve downloads, CSV, canvas, drag/drop alternative, and video compression states.
- [x] Add explicit loading, error, empty, disabled, and success visual states where the reference requires them, without replacing existing error handling.
- [x] Run tool/unit tests and focused browser checks for each tool's primary action.

### Task 6: Migrate the public guest invitation shell

**Files:**
- Modify: `app/invite/[slug]/page.tsx`
- Modify: `app/invite/[slug]/error.tsx`
- Modify: `components/invitation/InvitationRenderer.tsx`
- Modify: `components/invitation/client/InvitationShell.tsx`
- Modify: `components/invitation/*.css`
- Modify: `components/invitation/sections/*.tsx`

- [x] Match the reference guest flow: envelope/cover open, couple/family/events/countdown/album, RSVP, wishes, gift QR, thanks, and sticky/section navigation.
- [x] Preserve `?to=`, `?g=`, `?lang=`, `#k=`, RSVP/wishes submissions, calendar/maps/QR actions, and locale metadata.
- [x] Verify the envelope can be opened with keyboard/touch, all sections render without console errors, and the English toggle preserves other query parameters.
- [x] Verify all seven archetype CSS variants at 390px and a representative desktop viewport.

### Task 7: Full production verification and hardening

**Files:**
- Create: `scripts/playwright-ui-smoke.mjs` only if the existing browser harness cannot express the final matrix
- Modify: `PROGRESS.md`
- Modify: `docs/superpowers/plans/2026-09-26-design-refresh.md`

- [x] Run `npm test`, `npm run typecheck`, `npm run build`, and `git diff --check`.
- [x] Start the production server from the built output.
- [x] Playwright sweep every route from `app/sitemap.ts` plus every generated feature/blog/template route at 390px and 1280px.
- [x] Capture status, console errors, page errors, failed requests, hydration errors, broken images, and horizontal overflow.
- [x] Exercise desktop/header links, mobile menu navigation, template filters, FAQ/search, tool hub, template preview, and invitation offline fallback.
- [x] Repeat the full sweep after every fix; only then mark the plan complete and record exact counts/evidence in `PROGRESS.md`.

### Task 8: Complete the remaining Home and Gallery composition

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/home/Icons.tsx`
- Modify: `components/home/home.css`
- Modify: `app/templates/page.tsx`
- Modify: `components/templates/gallery.css`
- Modify: `lib/route-inventory.ts`
- Modify: `PROGRESS.md`

- [x] Match the remaining Home source composition: named guest preview, seven browser tools, pricing CTA, blog row, and expanded feature tiles.
- [x] Match the remaining Template Gallery composition: ranking rail, catalog/filter, collections, suggestion CTA, and FAQ.
- [x] Keep all new cards linked to existing runtime routes and registries; add the missing guest-list tool route to the route inventory.
- [x] Run the full unit/typecheck/build gate and Playwright route matrix after the additions.

## Handoff

This plan is intentionally staged so a failed UI migration cannot hide a broken product flow. Review the route inventory and scope before implementation. Recommended execution is **Native**: the tasks share the same CSS/component contracts and the existing repo has no isolated UI package boundary; one implementer can keep the visual system coherent while running the same verification gates after each task.
