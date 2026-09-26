# Next.js + Supabase Backend Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Spring Boot backend with secure Next.js Route Handlers backed by Supabase Auth, Postgres, Storage, Realtime, and an Edge Function while preserving the existing frontend API contract.

**Architecture:** Route Handlers are thin HTTP adapters; focused `lib/server/*` domain modules own validation, authorization, and Supabase queries. Anonymous, user-scoped, and admin Supabase clients are separate; admin access is limited to domain functions that have already authorized an edit key or trusted Edge request. SQL migrations are the source of truth for schema, RLS, indexes, Realtime, and atomic rate limiting.

**Tech Stack:** Next.js 16 App Router, TypeScript, Zod 4, `@supabase/supabase-js`, `@supabase/ssr`, Supabase CLI/migrations/Edge Functions, Node test runner, pgTAP, Netlify.

**Spec:** `docs/superpowers/specs/2026-09-26-supabase-migration-design.md`

## Global Constraints

- Use Supabase project `iehmucsshklgjmxqygqp`; start with fresh data and do not migrate Java/Postgres records.
- Deploy frontend and Route Handlers together on Netlify; Spring Boot is not part of production.
- Preserve all current `createApi()` method signatures and `/api/**` response DTOs; adding `logout()` is the only allowed API addition.
- Preserve `/invite/[slug]?to=`, `?g=`, `?lang=` and editor links `/studio/[id]#k=`.
- Keep service-role and Edge shared secrets server-only; the browser receives only `NEXT_PUBLIC_SUPABASE_URL` and anon key.
- Validate every trust boundary with Zod; do not weaken media validation, RLS, accessibility, or error handling.
- Do not introduce repositories, DI containers, classes, or interfaces with one implementation. Extract an adapter only when a second implementation exists.
- Follow Next.js 16 docs in `node_modules/next/dist/docs/` before coding Route Handlers, cookies, proxy, or cache behavior.
- Do not commit automatically. At each checkpoint, show the owner the suggested `git add`/`git commit` command.
- Update `PROGRESS.md` after each completed task with verification evidence and the next task.

## Backend File Map

```text
app/api/**/route.ts                 HTTP only: request -> domain call -> Response
lib/server/env.ts                   validated server environment
lib/server/http.ts                  Zod parsing and ProblemDetail responses
lib/server/supabase.ts              anon/user/admin client factories
lib/server/edit-key.ts              random key, SHA-256 hash, authorization
lib/server/invitations.ts           invitation/account/public invitation rules
lib/server/guests.ts                guest CRUD/import/token resolution
lib/server/responses.ts             RSVP/wishes/summary/moderation
lib/server/media.ts                 byte validation and Storage upload
supabase/migrations/*.sql           schema, indexes, RLS, RPC, Realtime
supabase/functions/public-write/    trusted RSVP/wish ingress + rate limit
```

Dependency direction is `route -> domain -> Supabase client`; domain modules never import `next/server`, and route files never contain database queries.

## Review Focus

- A leaked/wrong edit key must return 401/403 without revealing whether another invitation exists; Task 3 tests it.
- A valid user must not read or mutate another owner's invitation through either API or direct anon/user Supabase access; Tasks 1 and 3 test RLS.
- Concurrent RSVP/wish requests at the threshold must be counted atomically and return 429 without an extra insert; Task 6 tests it.
- Uploaded files with a false extension or `Content-Type` must be judged by bytes and never saved; Task 8 tests it.
- Expired account sessions must refresh through secure cookies or become a clean 401; Task 2 tests both paths.

---

### Task 1: Supabase foundation, schema, and RLS

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.env.example`
- Create: `supabase/config.toml`
- Create: `supabase/migrations/202609260001_backend.sql`
- Create: `supabase/tests/backend.sql`
- Create: `lib/server/env.ts`
- Create: `lib/server/supabase.ts`
- Create: `tests/server-env.test.ts`

**Interfaces:**
- Produces: `serverEnv(): ServerEnv`, `createAnonClient()`, `createRequestClient(cookieStore)`, `createAdminClient()`.
- Produces tables `invitations`, `guests`, `rsvps`, `wishes`, `rate_limits` and RPC `consume_rate_limit(...)`.
- Consumes: existing `Content` JSON shape from `lib/content.ts`.

- [ ] **Step 1: Add failing environment tests**

Test `serverEnv()` rejects missing URL/keys, never accepts a service key from a `NEXT_PUBLIC_*` name, and returns the six exact variables: public URL, anon key, service-role key, Edge URL, Edge shared secret, and rate-limit HMAC secret.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/server-env.test.ts`  
Expected: FAIL because `lib/server/env.ts` does not exist.

- [ ] **Step 3: Install only required Supabase packages and add scripts**

Add `@supabase/supabase-js`, `@supabase/ssr`, and dev dependency `supabase`. Add `db:start`, `db:reset`, `db:test`, and `functions:serve` scripts using the local CLI.

- [ ] **Step 4: Implement validated environment and three client factories**

`createAdminClient()` must use `auth: { persistSession: false, autoRefreshToken: false }`; never export a prebuilt admin singleton to client-importable code.

- [ ] **Step 5: Write the SQL migration**

Use UUID primary keys, `timestamptz`, cascading child FKs, unique `slug`, guest token hash, and scoped request key, `content jsonb`, `owner_id references auth.users`, edit-key hash, update timestamp trigger, indexes on all public/owner/list paths, and RLS on every table. Anon gets published invitation + visible/approved wish reads only; authenticated users get rows reachable through owned invitations; no browser role gets public write access.

- [ ] **Step 6: Add pgTAP policy and constraint tests**

Assert owner isolation, unpublished privacy, child cascade, unique slug/token hash, no anon inserts, published public reads, and atomic `consume_rate_limit` behavior at the configured boundary.

- [ ] **Step 7: Verify foundation**

Run: `npm run db:start && npm run db:reset && npm run db:test && npm test && npm run typecheck`  
Expected: all commands PASS.

- [ ] **Step 8: Owner checkpoint**

Suggested commit: `git add package*.json .env.example supabase lib/server tests/server-env.test.ts && git commit -m "feat: add Supabase backend foundation"`

### Task 2: Secure cookie authentication and account routes

**Files:**
- Create: `lib/server/http.ts`
- Create: `lib/server/auth.ts`
- Create: `app/api/auth/register/route.ts`
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/me/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/api/account/invitations/route.ts`
- Create: `tests/auth-routes.test.ts`
- Modify: `lib/api.ts`
- Modify: `components/account/AccountClient.tsx`

**Interfaces:**
- Produces: `parseJson<T>(request, schema)`, `problem(status, detail)`, `requireUser(request): Promise<User>`.
- Produces unchanged `AuthResponse`, `AccountUser`, and `AccountInvitation` DTOs plus `api.logout()`.
- Consumes: Task 1 user-scoped client and invitation table.

- [ ] **Step 1: Write failing auth contract tests**

Cover invalid email/password (400), duplicate registration (409), wrong login (401), successful register/login cookie flags, `me` (200), logout cookie deletion, expired refreshable cookie (200), and expired unrefreshable session (401).

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/auth-routes.test.ts`  
Expected: FAIL because auth routes do not exist.

- [ ] **Step 3: Implement HTTP helpers and cookie-backed auth**

Use `@supabase/ssr`; cookies are `HttpOnly`, `Secure` in production, `SameSite=Lax`, and path `/`. `requireUser` calls `auth.getUser()` rather than trusting decoded JWT claims.

- [ ] **Step 4: Implement account listing**

Return only invitations owned by `auth.uid()` and map JSON content into the existing card DTO fields without exposing edit-key hashes.

- [ ] **Step 5: Switch account client session behavior**

Keep existing public API signatures; make cookie session authoritative, add `api.logout()`, and update the logout button to call it before clearing local UI state.

- [ ] **Step 6: Verify auth**

Run: `npm test && npm run typecheck`  
Expected: auth tests and existing account/API tests PASS.

- [ ] **Step 7: Owner checkpoint**

Suggested commit: `git add app/api/auth app/api/account lib/server lib/api.ts components/account tests && git commit -m "feat: add Supabase authentication"`

### Task 3: Invitation creation, edit-key authorization, autosave, and claim

**Files:**
- Create: `lib/server/edit-key.ts`
- Create: `lib/server/invitations.ts`
- Create: `app/api/invitations/route.ts`
- Create: `app/api/invitations/[id]/route.ts`
- Create: `app/api/account/invitations/claim/route.ts`
- Create: `tests/edit-key.test.ts`
- Create: `tests/invitation-routes.test.ts`
- Modify: `lib/api.ts`

**Interfaces:**
- Produces: `createEditKey(): string`, `hashEditKey(key): Promise<string>`, `requireInvitationAccess({ id, editKey, userId? })`.
- Produces: `createInvitation`, `getInvitation`, `updateInvitation`, `claimInvitation` with existing DTOs/statuses.
- Consumes: Task 1 clients, Task 2 `requireUser`, `contentSchema`, `publishIssues`, and existing slug rules.

- [ ] **Step 1: Write failing edit-key tests**

Assert 32 random bytes encoded base64url, deterministic SHA-256 hex hash, no plaintext persistence, missing key 401, wrong key 403, owner access without key, and unrelated owner denial.

- [ ] **Step 2: Write failing invitation route tests**

Cover create round-trip, invalid content 400, slug collision retry, get/update by key, owner access, unpublished publish validation, unknown UUID 404, and `keepalive` PATCH compatibility.

- [ ] **Step 3: Run focused tests**

Run: `node --test tests/edit-key.test.ts tests/invitation-routes.test.ts`  
Expected: FAIL because domain functions/routes do not exist.

- [ ] **Step 4: Implement edit-key and invitation domain functions**

Admin queries are reachable only after `requireInvitationAccess`; key comparison uses the stored SHA-256 hash. Create returns plaintext key once. Update allows only `templateId`, `content`, `slug`, `published` and validates the complete merged state.

- [ ] **Step 5: Implement thin Route Handlers and claim transaction**

Claim requires both authenticated user and valid edit key; setting an already-different owner returns 409. A claimed invitation remains editable by its original edit key.

- [ ] **Step 6: Point the default API base URL at same-origin**

Keep `createApi(baseUrl, fetchImpl)` for tests; production `api` uses `NEXT_PUBLIC_API_BASE_URL ?? ""` so Netlify serves FE and API together.

- [ ] **Step 7: Verify invitation flow**

Run: `npm test && npm run typecheck`  
Expected: new route tests and existing autosave/API tests PASS.

- [ ] **Step 8: Owner checkpoint**

Suggested commit: `git add app/api/invitations app/api/account/invitations/claim lib/server lib/api.ts tests && git commit -m "feat: migrate invitation API to Supabase"`

### Task 4: Public invitation reads

**Files:**
- Create: `app/api/public/invitations/[slug]/route.ts`
- Create: `tests/public-invitation-routes.test.ts`
- Modify: `lib/server/invitations.ts`

**Interfaces:**
- Produces: `getPublicInvitation(slug): PublicInvitationDto | null`.
- Consumes: anonymous RLS client and existing public DTOs.

- [ ] **Step 1: Write failing public-read tests**

Assert published 200 with only visible/approved wishes, draft/unknown 404 with identical bodies, `Cache-Control: no-store`, and no owner/hash/token fields in JSON.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/public-invitation-routes.test.ts`  
Expected: FAIL because public routes do not exist.

- [ ] **Step 3: Implement public projections**

Use anonymous client + RLS, explicit selected columns, stable `createdAt` ordering, and constant public 404 behavior.

- [ ] **Step 4: Verify public reads**

Run: `npm test && npm run typecheck`  
Expected: public routes and existing invite page tests PASS.

- [ ] **Step 5: Owner checkpoint**

Suggested commit: `git add app/api/public lib/server tests && git commit -m "feat: add Supabase public invitation API"`

### Task 5: Guest manager CRUD and import

**Files:**
- Create: `lib/server/guests.ts`
- Create: `app/api/invitations/[id]/guests/route.ts`
- Create: `app/api/invitations/[id]/guests/[guestId]/route.ts`
- Create: `app/api/invitations/[id]/guests/import/route.ts`
- Create: `app/api/public/invitations/[slug]/guests/[token]/route.ts`
- Create: `tests/guest-routes.test.ts`

**Interfaces:**
- Produces: `listGuests`, `createGuest`, `updateGuest`, `deleteGuest`, `importGuests`, `resolveGuestToken` matching `GuestDto`/`GuestImportResult`.
- Consumes: Task 3 `requireInvitationAccess`; produces token hashes used by Task 6.

- [ ] **Step 1: Write failing guest route tests**

Cover CRUD, owner/edit-key access, cross-invitation guest IDs, 1–100 expected pax validation, token uniqueness, URL construction, per-row import errors, maximum import size, deletion, latest linked RSVP status mapping, valid public token resolution, and invalid token 404.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/guest-routes.test.ts`  
Expected: FAIL because guest routes do not exist.

- [ ] **Step 3: Implement guest domain and routes**

Generate random guest tokens and store only hashes. Import validates each row, inserts valid rows in one operation, and returns indexed errors without rolling back valid rows, preserving the existing contract.

- [ ] **Step 4: Verify guest manager**

Run: `npm test && npm run typecheck`  
Expected: guest tests and existing CSV/GuestsPanel-dependent types PASS.

- [ ] **Step 5: Owner checkpoint**

Suggested commit: `git add app/api/invitations lib/server/guests.ts tests/guest-routes.test.ts && git commit -m "feat: migrate guest manager to Supabase"`

### Task 6: Edge-protected RSVP and wishes

**Files:**
- Create: `supabase/functions/_shared/public-write.ts`
- Create: `supabase/functions/public-write/index.ts`
- Create: `supabase/functions/tests/public-write.test.ts`
- Create: `lib/server/public-write.ts`
- Create: `app/api/public/invitations/[slug]/rsvp/route.ts`
- Create: `app/api/public/invitations/[slug]/wishes/route.ts`
- Create: `tests/public-write-routes.test.ts`

**Interfaces:**
- Produces Edge request `{ action, slug, payload, fingerprint }` and existing RSVP/wish HTTP responses.
- Consumes: Task 1 `consume_rate_limit`, Task 5 guest token hash, `RsvpInput`/`WishInput` Zod schemas.

- [ ] **Step 1: Write failing pure Edge tests**

Cover missing/wrong shared secret, malformed payload, honeypot silent success without insert, unpublished slug 404, valid RSVP/wish, guest-token linkage, and duplicate `Idempotency-Key` returning the original result without a second insert.

- [ ] **Step 2: Write failing concurrency/rate-limit tests**

At the exact threshold all allowed writes succeed; concurrent threshold+1 produces exactly one 429 and no extra row. Fingerprints store HMAC output only, never raw IP.

- [ ] **Step 3: Run focused tests**

Run: `deno test --allow-env supabase/functions/tests/public-write.test.ts && node --test tests/public-write-routes.test.ts`  
Expected: FAIL because Edge/Route handlers do not exist.

- [ ] **Step 4: Implement Edge Function trust boundary**

Validate the shared secret with constant-time comparison, parse action-specific schemas, verify published invitation, atomically consume rate limit, and insert using service role. Return only contract-safe errors.

- [ ] **Step 5: Implement Next public-write adapter and routes**

Derive a fingerprint from trusted Netlify forwarding headers plus server-side HMAC salt; validate payload before forwarding. `lib/api.ts` generates an `Idempotency-Key` per submit call without changing method signatures. Never forward arbitrary browser headers or expose the Edge shared secret.

- [ ] **Step 6: Verify public writes**

Run: `npm run db:test && deno test --allow-env supabase/functions/tests/public-write.test.ts && npm test && npm run typecheck`  
Expected: rate limit, RSVP, wish, and contract tests PASS.

- [ ] **Step 7: Owner checkpoint**

Suggested commit: `git add supabase app/api/public lib/server/public-write.ts tests && git commit -m "feat: add rate-limited RSVP and wishes"`

### Task 7: Owner responses, moderation, and Realtime

**Files:**
- Create: `lib/server/responses.ts`
- Create: `app/api/invitations/[id]/responses/route.ts`
- Create: `app/api/invitations/[id]/wishes/[wishId]/route.ts`
- Create: `lib/supabase-browser.ts`
- Create: `tests/response-routes.test.ts`
- Modify: `components/studio/ResponsesPanel.tsx`
- Modify: `components/invitation/client/WishesPanel.tsx`
- Modify: `supabase/migrations/202609260001_backend.sql`

**Interfaces:**
- Produces backward-compatible `ResponsesDto` with `WishRow.approved`, `setWishModeration`, and browser `subscribeToWishes(invitationId, onChange)`.
- Consumes: Task 3 authorization, Task 1 Realtime publication/RLS, Task 6 rows.

- [ ] **Step 1: Write failing response tests**

Assert latest RSVP semantics, attending/declined/headcount summary, deterministic ordering, owner/edit-key access, cross-invitation wish denial, new wishes default unapproved, hidden/approved filtering, approve/reject, and hide/show updates.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/response-routes.test.ts`  
Expected: FAIL because response routes do not exist.

- [ ] **Step 3: Implement response domain and routes**

Keep summary calculation in one query/RPC to avoid client drift. Wish updates accept only `hidden`/`approved` and constrain both `wish_id` and authorized `invitation_id`.

- [ ] **Step 4: Enable scoped Realtime subscriptions**

Add only `wishes` to the publication. Public subscriptions can select approved/non-hidden rows for published invitations; owner sessions can select all rows for owned invitations. Always unsubscribe on component cleanup.

- [ ] **Step 5: Verify responses and Realtime lifecycle**

Run: `npm run db:test && npm test && npm run typecheck`  
Expected: response tests PASS; component tests prove subscribe/unsubscribe and visible-wish filtering.

- [ ] **Step 6: Owner checkpoint**

Suggested commit: `git add app/api/invitations lib/server/responses.ts lib/supabase-browser.ts components supabase tests && git commit -m "feat: add response moderation and realtime wishes"`

### Task 8: Secure Supabase Storage uploads

**Files:**
- Create: `lib/server/media.ts`
- Create: `app/api/invitations/[id]/media/route.ts`
- Create: `tests/media-route.test.ts`
- Modify: `supabase/migrations/202609260001_backend.sql`

**Interfaces:**
- Produces `uploadMedia({ invitationId, access, kind, file }): Promise<{ url: string }>`.
- Consumes: Task 3 authorization and existing image/audio size/MIME contract.

- [ ] **Step 1: Write failing media tests**

Cover empty file 400, image/audio magic-byte detection, lying MIME/extension, unsupported 415, oversize 413, wrong key/owner, randomized object path under invitation prefix, Storage failure mapping, and successful public URL.

- [ ] **Step 2: Run the focused test**

Run: `node --test tests/media-route.test.ts`  
Expected: FAIL because media route does not exist.

- [ ] **Step 3: Implement byte validation and upload**

Do not trust filename or browser MIME. Consume an authenticated upload limit through the Task 1 RPC, use existing limits from the Java contract, generate `<invitation-id>/<uuid>.<validated-ext>`, set exact validated content type, and disallow upsert.

- [ ] **Step 4: Add bucket/storage policies**

Use existing public-read `media` bucket. Browser roles cannot insert/update/delete; server upload follows domain authorization.

- [ ] **Step 5: Verify media**

Run: `npm run db:test && npm test && npm run typecheck`  
Expected: media and existing image-compression tests PASS.

- [ ] **Step 6: Owner checkpoint**

Suggested commit: `git add app/api/invitations lib/server/media.ts supabase tests/media-route.test.ts && git commit -m "feat: migrate media uploads to Supabase"`

### Task 9: Editor v3 persisted contract

**Files:**
- Modify: `lib/content.ts`
- Modify: `lib/editor-sections.ts`
- Modify: relevant files under `components/studio/panels/`
- Modify: `components/invitation/InvitationRenderer.tsx`
- Modify: relevant files under `components/invitation/sections/`
- Modify: `tests/content.test.ts`
- Modify: `tests/editor-sections.test.ts`

**Interfaces:**
- Produces backward-safe defaults for envelope greeting, day schedule, family hierarchy, section visibility, album layout, and guest arrival time.
- Consumes: Task 3 content persistence; no database column changes because content remains JSONB.

- [ ] **Step 1: Add failing schema/default tests**

Assert `defaultContent()` includes every field with autosave-valid empty/default values; legacy v1 content is normalized before render/edit; limits and IDs remain bounded.

- [ ] **Step 2: Run focused tests**

Run: `node --test tests/content.test.ts tests/editor-sections.test.ts`  
Expected: FAIL for missing persisted fields/blocked sections.

- [ ] **Step 3: Extend the content contract minimally**

Add fields to the existing schema/default object rather than parallel configuration tables. Keep one normalization function for old/sample content.

- [ ] **Step 4: Unblock editor panels and renderer**

Remove only `blocked: Supabase` flags whose fields now persist; wire existing controls and render paths without introducing a second editor state model.

- [ ] **Step 5: Verify Editor v3**

Run: `npm test && npm run typecheck`  
Expected: content/editor tests PASS and no existing invitation render test regresses.

- [ ] **Step 6: Owner checkpoint**

Suggested commit: `git add lib/content.ts lib/editor-sections.ts components tests && git commit -m "feat: persist Editor v3 invitation fields"`

### Task 10: Cutover, documentation, and production gates

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Modify: `docs/DEPLOY.md`
- Modify: `PROGRESS.md`
- Modify: `netlify.toml` if environment/build settings require it
- Modify: `lib/api.ts`

**Interfaces:**
- Produces one documented Netlify + Supabase deployment path and removes Java runtime assumptions.
- Consumes every previous task.

- [ ] **Step 1: Remove the Java API default and stale runbooks**

Document Supabase project setup, migrations, Edge deploy/secrets, Storage bucket, Netlify env vars, local stack commands, rollback, and backup. Do not delete the separate Java repository.

- [ ] **Step 2: Run all automated gates**

Run: `npm run db:test && deno test --allow-env supabase/functions/tests/public-write.test.ts && npm test && npm run typecheck && npm run build && npm run build:next && git diff --check`  
Expected: every command PASS; no Java command is required.

- [ ] **Step 3: Run end-to-end smoke flow against local Supabase**

Verify register/login/logout, create -> autosave -> publish, claim by account, image/audio upload, guest CRUD/import, `?g=` resolution, public read, RSVP, wish Realtime, hide/show wish, wrong-key denial, and 429 behavior.

- [ ] **Step 4: Run browser acceptance at 390px and 1280px**

Check `/account`, `/studio`, `/studio/[id]#k=`, `/invite/[slug]?to=`, and `/invite/[slug]?g=` with zero console error/warn, no horizontal overflow, no broken media, and the existing P6 visual checklist.

- [ ] **Step 5: Deploy Supabase then Netlify**

Apply migrations, deploy `public-write`, set secrets, deploy Netlify preview, repeat smoke checks, then promote. Never print secret values in logs or documentation.

- [ ] **Step 6: Update progress and handoff**

Record exact test counts, deployed migration/function versions, known deviations, rollback commands, and next task. Suggested final commit: `git add -A && git commit -m "docs: complete Next.js Supabase backend migration"`.
