# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

MỘC Wedding — Next.js 16 / React 19 frontend for a Vietnamese wedding-invitation product (guest page, no-account editor "Studio", template gallery, marketing/SEO pages, free standalone tools). Talk to the project owner in Vietnamese; code, commits, and PRs stay in English.

**Stack direction (owner decision, 2026-09-26): Next.js + Supabase. No more Java backend code.** The target is this repo plus Supabase: Postgres DB (with RLS), Supabase Auth for the couple's admin (Studio/dashboard), Storage for wedding photos and music, and Realtime for guestbook wishes. Server-side logic goes in Next.js (Route Handlers / Server Actions / server components) using `@supabase/ssr`. There is no separate service to host; deploy stays Netlify or Cloudflare.
- **Rules until the migration is done:**
  - Don't add features or endpoints to `../Thiep-cuoi-online-backend`.
  - New data work is designed for Supabase.
  - Anything that would change the backend contract (for example the Editor v3 content fields) waits for the migration spec.
  - Keep the service-role key server-only and never expose it to the client. The browser only uses the anon key, protected by RLS.
- **Migration is not started.**
  - It needs a spec first: `docs/superpowers/specs/<date>-supabase-migration-design.md`, done via brainstorming. Open questions are tracked in PROGRESS.md.
  - Keep `lib/api.ts` as the single seam: swap its internals, not its callers.
  - Keep the `contentSchema` shape, since it becomes a JSONB column.
  - Preserve the guest/share URLs (`/invite/[slug]?g=`, `?lang=`) and the existing data.

**Legacy, still running today:** the sibling repo `../Thiep-cuoi-online-backend` (Spring Boot 4, Java 17, Postgres) serves the current app. `lib/api.ts` is a typed client for it, and the two repos must be run together locally (see README.md's "Chạy local"). Its `./mvnw test` stays in the gate only while it is still in use.

**Progress tracking is mandatory, not optional.** `PROGRESS.md` is the single source of truth for what phase is in flight, what's done, and open questions for the owner — read it before starting work, and update it **often** (status table + a dated log line) after every meaningful step — a finished page, section, task or bug fix — per its own instructions at the top of the file. **Delete or rewrite anything in it that has gone stale** (done instructions, wrong file names, old environment notes, superseded percentages); don't append on top of it. Keep the log to ~15 recent lines, older detail lives in git history and `docs/superpowers/`. Phase plans/specs live in `docs/superpowers/plans/` and `docs/superpowers/specs/` (named `YYYY-MM-DD-<phase>.md` / `-design.md`).

## Commands

```bash
npm run dev        # http://localhost:3000, needs backend on 8090 (see .env.local / .env.example)
npm test           # node --test "tests/**/*.test.ts" — Node 22 strips TS types natively, no ts-node/jest
npm run typecheck  # tsc --noEmit
npm run build      # next build
```

Run a single test file directly: `node --test tests/content.test.ts`.

There is no lint script; `typecheck` + `test` + `build` are the full gate. All three (plus the backend's `./mvnw test`) must be green before considering a phase done.

## Non-negotiable workflow rules (from the owner, enforced in PROGRESS.md)

This section is the harness contract — it applies no matter which agent (Claude Code, Codex, or otherwise) is driving. It's durable conventions, not current task state.

- **Starting any session:** read `PROGRESS.md` first, top to bottom — its "▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY" section is the literal entry point and names the exact next task in flight, including for a mid-phase handoff between agents. Then read the phase plan/spec it links under `docs/superpowers/`. Only then touch code. Don't infer current status from this file — it doesn't change per-session, `PROGRESS.md` does.
- **No `git commit`** — the permission layer blocks it for this agent. Do the work, then hand the owner the exact commands to run.
- **No Playwright/browser QA while mid-feature.** Build with `npm test` / `typecheck` / `build` only (and the backend's `./mvnw test`). Browser QA (390px and 1280px viewports, console must be clean) happens once, at the end of a whole phase — not per task.
- **Browser checks are token-expensive — keep them rare and lean (!important).** Open the browser only after a whole page, a whole section, or one small feature is finished. Don't keep DevTools open to check after every edit.
  - In Claude Code, use **Chrome DevTools MCP**, not Playwright. A Playwright sweep running next to `next start` got VS Code SIGKILLed (2026-09-26).
  - Use one `evaluate_script` call that loops the routes in same-origin iframes and returns a compact text summary: status, `scrollWidth` vs `clientWidth`, broken images, and hooked `console.error`/`warn`.
  - An iframe adds a ~15px scrollbar, so size it at target+15 (405 → 390 viewport).
  - No `take_snapshot`/`take_screenshot` into context unless a visual check is really needed. If one is, save it with `filePath`.
  - Run heavy steps one after another, and kill `next start` afterwards.
- **Real browser QA, when that end-of-phase pass runs:** start both servers first (`README.md` → "Chạy local": backend on 8090 via the sibling repo, `npm run dev` on 3000). Use whichever real-browser tool the current harness actually has — don't assume Chrome DevTools MCP is available, it's Claude Code-specific:
  - **Playwright MCP** — the portable option, works in any MCP-capable agent (Codex included) and is what most of this project's QA was actually run with. This repo ships `@playwright/mcp` as a devDependency with `npm run mcp:playwright` (`playwright-mcp --browser chromium --allowed-hosts localhost:3000 localhost:8090`) — point the agent's MCP config at that command if it isn't already wired up.
  - **Chrome DevTools MCP** (`mcp__chrome-devtools__*`, Claude Code only), snapshot-first and token-lean: `take_snapshot` (a11y tree) over `take_screenshot` for locating/verifying elements, screenshot only for an actual visual check scoped to a single `uid`; route bulk output (`take_snapshot`, `take_screenshot`, `get_network_request`, `evaluate_script`, `performance_start_trace`/`stop_trace`, `lighthouse_audit`) to disk via their `filePath`/`outputDirPath` params instead of context, and only read the saved file if actually needed; pass `types`/`resourceTypes` + `pageSize` to `list_console_messages`/`list_network_requests` instead of dumping everything; use `fill_form` for multi-field forms and `wait_for(text)` instead of polling; `performance_*`/`take_heapsnapshot`/`lighthouse_audit` only during the real end-of-phase pass, never per-task.
  - **Neither MCP configured** — fall back to `npx playwright test`, or just open `http://localhost:3000` in a real browser and read devtools by hand. The pass bar below is the same regardless of tool.
  - **Gotchas learned on this project, tool-agnostic:** the browser session is shared and headed — call `page.bringToFront()` before every screenshot or it hangs; screenshots/output go under `.playwright-mcp/` (git-ignored) — never commit them; a full page navigation (`page.goto`, or a Chrome DevTools MCP `navigate`) on a Studio edit URL (`/studio/{id}#k=...`) drops the `#k=` fragment because it's client-only — click through the UI instead of re-navigating when the edit key matters.
  - **Pass bar:** 0 console errors/warnings, no horizontal overflow, no broken images, correct per-template fonts — checked at both 390px and 1280px. Run a mobile Lighthouse pass on any newly touched route.
- **Update `PROGRESS.md` after every meaningful step — not just at session end.** Task done, bug fixed, direction change, blocker: (1) the percentage/status table if it changed, (2) one dated log line with how it was verified, (3) the "▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY" section at the top so it names the real next task. This file is the only thing a *different* agent (or this same agent after running out of context) has to go on to pick up mid-phase — an unrecorded step is invisible to whoever continues next, and a stale "next task" pointer sends them to redo or skip work. Don't record something as done without a verification note. Remove outdated lines in the same edit instead of letting them pile up.
- If `sysctl kern.num_files` is close to `kern.maxfiles`, a leaked `codegraph serve` process is likely the cause — ask the owner before killing anything (see memory `reference-codegraph-fd-leak`).

## Architecture

**One renderer, every template.** `components/invitation/InvitationRenderer.tsx` is the single component behind the public guest page (`app/invite/[slug]`), the template gallery preview (`app/templates/[id]`), and the Studio's live preview (the phone/desktop frame inside `components/studio/Editor.tsx`). It takes `content: Content` + `template: Template` and a `mode: "live" | "preview"`; palette and fonts arrive as CSS variables on `.inv-stage`, the template's `family` (A–J, from `design/Thiep Preview.dc.html`) picks one of ten cover layouts in `sections/Cover.tsx` + `design-cover.css`, and its `archetype` (editorial/minimal/classic/botanical/traditional/korean) selects ornaments/rhythm purely via `data-archetype` CSS (one `arch-*.css` file per archetype) — section markup itself never forks per template. `lib/templates.ts` holds the 16 templates from `design/Mau Thiep v2.dc.html`, each with several palettes; the chosen one is stored as `content.paletteKey` (`""` = first palette), and old template IDs are aliases. Adding a template means one registry entry (palettes must pass WCAG AA — `tests/templates.test.ts`).

**Content is a single Zod-validated blob.** `lib/content.ts`'s `contentSchema`/`Content` type mirrors the backend's `InvitationContent` record field-for-field (contract: `docs/superpowers/specs/2026-09-20-invitation-core-phase1-design.md` §6.4) — if you change the shape here, the backend record and the regenerated fixture (`README.md` has the exact `node -e` command) must move together. Drafts autosave while typing, so every field must stay valid even "empty" (`""`, not `undefined`). `persistable()` strips only-partially-typed URLs before a save is sent, so autosave never stalls on `mapUrl: "www.goo"`.

**The edit key is the auth; accounts are optional.** Creating an invitation needs no account and returns an edit key; the only durable copy of it is the URL fragment in `/studio/{id}#k=...` (fragment, so it never hits server logs) plus a best-effort mirror in `localStorage` via `lib/local-invitations.ts` (`createLocalStore`, key `moc.invitations.v1`). Losing that link means losing edit access — this is a known, documented tradeoff, not a bug to "fix." An optional account (`/account`, JWT from the backend, `lib/account.ts`) can *claim* invitations by pasting their edit link, so they can be reopened later; it never replaces the key. `components/studio/Editor.tsx` is the owner's workspace: the section outline picks which panel/sub-section is shown, panels mutate one `Draft` object, the preview renders that same draft live through `InvitationRenderer` (clicking a block in the preview jumps to its section), and `useAutosave` (`components/studio/useAutosave.ts`) pushes it to the backend shortly after each change (with `keepalive` on unload so the last save isn't dropped when the tab closes).

**Guest identity on the public page** comes only from a per-guest `?g=<token>` link (danh sách khách trong DB) resolved server-side via domain `resolveGuestToken`; any failure (bad token, network) degrades to the default guest name rather than breaking the page — see `resolveGuest()` in `app/invite/[slug]/page.tsx`. Không dùng `?to=Tên` thủ công.

**`lib/` is pure logic, one file = one concern, each with a matching `tests/*.test.ts`.** This is where correctness-sensitive code belongs: `content` (schema), `templates` (registry), `datetime`, `ics`, `vietqr`/`banks`/`bank-name` (gift QR), `maps`, `slug`, `api` (backend client), `local-invitations`, `csv` (guest import/export), `i18n` (vi/en guest page, `?lang=`), `donate`, `navigation`/`route-inventory` (header/footer links), `tools/*` (standalone tool logic: `inviteMessage`, `qr`, `guestList`, `seating`). Because `npm test` runs on raw Node with type-stripping (not ts-node/tsx), `lib/api.ts` avoids TS parameter-properties and similar non-erasable syntax — see the comment on `ApiError`.

**Directory map:**

| Path | What's there |
|---|---|
| `app/styles/` | **Design system core:** `tokens.css` (the only place raw colours live — every other CSS/TSX uses `var(--*)`, guarded by `tests/design-system.test.ts`), `motion.css` (shared keyframes + reduced-motion). Primitives (`.button-primary`, `.button-ghost`, `.chip`, `.badge`, `.card`, `.eyebrow`, `.input`, `.wrap*`) live in `app/globals.css`. Spec: `DESIGN.md` |
| `app/` | Next.js App Router routes: guest page (`invite/[slug]`), Studio (`studio/`, `studio/[id]`), template gallery (`templates/`), marketing/SEO pages, standalone tools (`cong-cu/`, `cong-cu-dam-cuoi/`) |
| `components/invitation/` | `InvitationRenderer` + one section component per invitation block (`sections/`) + interactive leaves (`client/`) + archetype CSS |
| `components/studio/` | `Editor` (Editor v3 layout: section outline from `lib/editor-sections.ts` → form panels in `panels/` → live preview; bottom sheets under 1024px), publish/responses/guests dialogs |
| `components/tools/` | 7 standalone tools (QR, image/video compression, invite message, guest list, seating, save-the-date), sharing `ToolPage` shell |
| `components/account/` | optional account login/register + claimed-invitation dashboard |
| `components/home`, `components/site`, `components/marketing`, `components/templates` | homepage, header/footer/nav, marketing/blog/SEO chrome, template gallery grid |
| `docs/superpowers/` | phase specs and plans — read before starting or resuming a phase |
| `design/` | **read-only** visual source (`*.dc.html` mockups, `design.md`, `Wedding Design System.dc.html`); never edit, never ship. Ignore `Stock*`/`stock-tokens.*` and `Mau Thiep.dc.html` (v1) |

Design language: ivory paper, lacquer red, foil gold, lattice, 囍 — self-drawn ornaments only. Site fonts come from `next/font/google` in `app/layout.tsx` (Be Vietnam Pro body, Playfair Display headings, Cormorant Garamond `--script` and Great Vibes `--hand` not preloaded); invitation fonts load per template via `lib/fonts.ts`, never all at once; `public/fonts/` only holds the 囍 glyph. New UI must use tokens and primitives, never raw hex; if the design's value fails WCAG AA, legibility wins and the deviation goes in `DESIGN.md`.
