# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

MỘC Wedding — Next.js 16 / React 19 frontend for a Vietnamese wedding-invitation product (guest page, no-account editor "Studio", template gallery, marketing/SEO pages, free standalone tools). Talk to the project owner in Vietnamese; code, commits, and PRs stay in English.

Backend is a separate sibling repo, `../Thiep-cuoi-online-backend` (Spring Boot 4, Java 17, Postgres). This repo has no server-side data layer of its own — `lib/api.ts` is a typed client for it, and the two repos must be run together locally (see README.md's "Chạy local").

**Progress tracking is mandatory, not optional.** `PROGRESS.md` is the single source of truth for what phase is in flight, what's done, and open questions for the owner — read it before starting work, and update it (status table + a dated log line) after every meaningful step, per its own instructions at the top of the file. Phase plans/specs live in `docs/superpowers/plans/` and `docs/superpowers/specs/` (named `YYYY-MM-DD-<phase>.md` / `-design.md`).

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
- **Real browser QA, when that end-of-phase pass runs:** start both servers first (`README.md` → "Chạy local": backend on 8090 via the sibling repo, `npm run dev` on 3000). Use whichever real-browser tool the current harness actually has — don't assume Chrome DevTools MCP is available, it's Claude Code-specific:
  - **Playwright MCP** — the portable option, works in any MCP-capable agent (Codex included) and is what most of this project's QA was actually run with. This repo ships `@playwright/mcp` as a devDependency with `npm run mcp:playwright` (`playwright-mcp --browser chromium --allowed-hosts localhost:3000 localhost:8090`) — point the agent's MCP config at that command if it isn't already wired up.
  - **Chrome DevTools MCP** (`mcp__chrome-devtools__*`, Claude Code only), snapshot-first and token-lean: `take_snapshot` (a11y tree) over `take_screenshot` for locating/verifying elements, screenshot only for an actual visual check scoped to a single `uid`; route bulk output (`take_snapshot`, `take_screenshot`, `get_network_request`, `evaluate_script`, `performance_start_trace`/`stop_trace`, `lighthouse_audit`) to disk via their `filePath`/`outputDirPath` params instead of context, and only read the saved file if actually needed; pass `types`/`resourceTypes` + `pageSize` to `list_console_messages`/`list_network_requests` instead of dumping everything; use `fill_form` for multi-field forms and `wait_for(text)` instead of polling; `performance_*`/`take_heapsnapshot`/`lighthouse_audit` only during the real end-of-phase pass, never per-task.
  - **Neither MCP configured** — fall back to `npx playwright test`, or just open `http://localhost:3000` in a real browser and read devtools by hand. The pass bar below is the same regardless of tool.
  - **Gotchas learned on this project, tool-agnostic:** the browser session is shared and headed — call `page.bringToFront()` before every screenshot or it hangs; screenshots/output go under `.playwright-mcp/` (git-ignored) — never commit them; a full page navigation (`page.goto`, or a Chrome DevTools MCP `navigate`) on a Studio edit URL (`/studio/{id}#k=...`) drops the `#k=` fragment because it's client-only — click through the UI instead of re-navigating when the edit key matters.
  - **Pass bar:** 0 console errors/warnings, no horizontal overflow, no broken images, correct per-template fonts — checked at both 390px and 1280px. Run a mobile Lighthouse pass on any newly touched route.
- **Update `PROGRESS.md` after every meaningful step — not just at session end.** Task done, bug fixed, direction change, blocker: (1) the percentage/status table if it changed, (2) one dated log line with how it was verified, (3) the "▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY" section at the top so it names the real next task. This file is the only thing a *different* agent (or this same agent after running out of context) has to go on to pick up mid-phase — an unrecorded step is invisible to whoever continues next, and a stale "next task" pointer sends them to redo or skip work. Don't record something as done without a verification note.
- If `sysctl kern.num_files` is close to `kern.maxfiles`, a leaked `codegraph serve` process is likely the cause — ask the owner before killing anything (see memory `reference-codegraph-fd-leak`).

## Architecture

**One renderer, every template.** `components/invitation/InvitationRenderer.tsx` is the single component behind the public guest page (`app/invite/[slug]`), the template gallery preview (`app/templates/[id]`), and the Studio's live preview (`components/studio/PreviewFrame.tsx`). It takes `content: Content` + `template: Template` and a `mode: "live" | "preview"`; palette and fonts arrive as CSS variables on `.inv-stage`, and the template's `archetype` (editorial/minimal/classic/botanical/traditional/korean) selects cover/ornaments/rhythm purely via `data-archetype` CSS (one `arch-*.css` file per archetype) — section markup itself never forks per template. Adding a template means adding one entry to `lib/templates.ts` (palette must pass WCAG AA — enforced by `tests/templates.test.ts`) plus, only if it needs a new *look*, a new archetype CSS file.

**Content is a single Zod-validated blob.** `lib/content.ts`'s `contentSchema`/`Content` type mirrors the backend's `InvitationContent` record field-for-field (contract: `docs/superpowers/specs/2026-09-20-invitation-core-phase1-design.md` §6.4) — if you change the shape here, the backend record and the regenerated fixture (`README.md` has the exact `node -e` command) must move together. Drafts autosave while typing, so every field must stay valid even "empty" (`""`, not `undefined`). `persistable()` strips only-partially-typed URLs before a save is sent, so autosave never stalls on `mapUrl: "www.goo"`.

**No accounts — the edit key is the auth.** Creating an invitation returns an edit key; the only durable copy of it is the URL fragment in `/studio/{id}#k=...` (fragment, so it never hits server logs) plus a best-effort mirror in `localStorage` via `lib/local-invitations.ts` (`createLocalStore`, key `moc.invitations.v1`). Losing that link means losing edit access — this is a known, documented tradeoff, not a bug to "fix." `components/studio/Editor.tsx` is the owner's workspace: left-side panels mutate one `Draft` object, the right side renders that same draft live through `InvitationRenderer`, and `useAutosave` (`components/studio/useAutosave.ts`) pushes it to the backend shortly after each change (with `keepalive` on unload so the last save isn't dropped when the tab closes).

**Guest identity on the public page** comes from either a manual `?to=Name` query param or a per-guest `?g=<token>` link (Guest manager, Phase 3) resolved server-side via `api.resolveGuestToken`; `?g=` wins when both are present, and any failure (bad token, network) degrades to "no guest name" rather than breaking the page — see `resolveGuest()` in `app/invite/[slug]/page.tsx`.

**`lib/` is pure logic, one file = one concern, each with a matching `tests/*.test.ts`.** This is where correctness-sensitive code belongs: `content` (schema), `templates` (registry), `datetime`, `ics`, `vietqr`/`banks`/`bank-name` (gift QR), `maps`, `slug`, `api` (backend client), `local-invitations`, `csv` (guest import/export), `tools/*` (standalone tool logic, e.g. `inviteMessage`, `qr`). Because `npm test` runs on raw Node with type-stripping (not ts-node/tsx), `lib/api.ts` avoids TS parameter-properties and similar non-erasable syntax — see the comment on `ApiError`.

**Directory map:**

| Path | What's there |
|---|---|
| `app/` | Next.js App Router routes: guest page (`invite/[slug]`), Studio (`studio/`, `studio/[id]`), template gallery (`templates/`), marketing/SEO pages, standalone tools (`cong-cu/`, `cong-cu-dam-cuoi/`) |
| `components/invitation/` | `InvitationRenderer` + one section component per invitation block (`sections/`) + interactive leaves (`client/`) + archetype CSS |
| `components/studio/` | `Editor`, per-tab `panels/`, `PreviewFrame`, publish/responses/guests dialogs |
| `components/tools/` | Phase 4 standalone tools (guest list, image compression, invite message, QR), sharing `ToolPage` shell |
| `components/home`, `components/site`, `components/marketing`, `components/templates` | homepage, header/footer/nav, marketing/blog/SEO chrome, template gallery grid |
| `docs/superpowers/` | phase specs and plans — read before starting or resuming a phase |

Design language: modern, bright, a touch of classical Chinese motif (ivory ground, lacquer red, foil gold, lattice, 囍) — self-drawn ornaments only, Vietnamese-subset self-hosted fonts (`public/fonts/`, loaded per-template via `lib/fonts.ts`, never all at once).
