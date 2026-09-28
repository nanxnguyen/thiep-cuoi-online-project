# Next.js + Supabase Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Protect the public Next.js/Supabase backend from volumetric traffic, credential bots, write spam, oversized requests, and database amplification without blocking legitimate wedding guests.

**Architecture:** Cloudflare is the outer DDoS/WAF layer and must reject abusive traffic before the Worker or Supabase is charged. Next.js keeps route-specific, privacy-preserving limits for business abuse; Supabase remains the atomic counter and authorization backstop. Existing Zod validation, RLS, edit keys, webhook authentication, and the private Next-to-Edge shared secret are retained.

**Tech Stack:** Next.js 16 App Router on OpenNext/Cloudflare Workers, TypeScript, Cloudflare WAF/Turnstile, Supabase Auth/Postgres/Edge Functions/Storage, Zod, Node test runner, pgTAP.

**Spec:** Current user request plus the source audit captured in this plan.

## Global Constraints

- Do not attempt to solve volumetric DDoS inside Next.js or Postgres; Cloudflare must drop it first.
- Do not trust arbitrary forwarding headers. Production identity comes from `CF-Connecting-IP` only when the public origin is a Cloudflare Worker/custom domain; local tests may use an explicit test header.
- Never store raw IP addresses; HMAC the normalized address with `RATE_LIMIT_HMAC_SECRET`.
- Rate-limit failures fail closed for public writes, auth email/login actions, uploads, webhooks, and analytics writes.
- Keep the Supabase service-role key and Turnstile secret server-only.
- Keep public invitation reads available during partial degradation; expensive writes may return `429` or `503`.
- Return `Retry-After` on every `429` response.
- Do not add a new rate-limit dependency; reuse the existing atomic `consume_rate_limit` RPC.
- Do not run load or DDoS tests against production. Use bounded local tests and Cloudflare analytics.

## Review Focus

- Missing/spoofed client-IP headers must not collapse all production users into one shared `unknown` bucket.
- Requests without `Content-Length` must still stop at the configured byte limit.
- Distributed bots must be challenged at Cloudflare before they create Worker invocations or Postgres writes.
- A bot varying cookies, slugs, or idempotency keys must not grow `rate_limits`, view events, or request logs without bounds.
- Trusted payment webhooks must continue working while forged, replayed, and oversized requests are rejected.

---

## Current-state findings that drive the plan

1. `lib/server/public-write.ts:18-21` reads Netlify's `x-nf-client-connection-ip`, but the active deployment config is `wrangler.jsonc`; on Cloudflare this can become `unknown`, creating a shared global bucket.
2. Database rate limiting is already atomic and service-role-only (`consume_rate_limit`), but each attempt reaches the Worker and Postgres first, so it is abuse protection, not DDoS protection.
3. Login, registration, password email, invitation creation, uploads, RSVP, and wishes have limits; public view tracking, guest-token lookup, webhooks, and most owner mutations do not.
4. `parseJson()` trusts `Content-Length` when present but calls `request.json()` without independently bounding a missing/chunked body. Public RSVP/wish handlers bypass `parseJson()`.
5. `routeResponse()` writes one Supabase log row for every API request. Attack traffic therefore amplifies into database writes.
6. `rate_limits` has no expiry job or `window_started` index; attacker-generated keys accumulate permanently.
7. Cookie-authenticated mutations have secure cookie attributes, but no shared same-origin check is visible in Route Handlers.
8. Existing positives: Zod schemas, upload magic-byte checks and size limits, timing-safe secrets, idempotency keys, RLS, service-role isolation, raw-body webhook verification, honeypots, and bounded auth cookies should be preserved.

### Task 1: Establish the Cloudflare edge boundary

**Files:**
- Modify: `wrangler.jsonc`
- Create: `docs/security/cloudflare-edge-runbook.md`
- Test: manual Cloudflare configuration checklist in the runbook

**Interfaces:**
- Produces: one canonical proxied custom domain; direct `workers.dev` access disabled after DNS verification; documented WAF settings.

- [ ] **Step 1: Record the current deployment boundary**

Document the production hostname, Cloudflare zone, whether `workers.dev` is reachable, and the rollback command. Do not copy API tokens or secrets.

- [ ] **Step 2: Bind the Worker to the custom domain**

Add the smallest Wrangler route/custom-domain configuration supported by the installed Wrangler version. Verify the custom domain serves the app before disabling `workers.dev`.

- [ ] **Step 3: Enable Cloudflare's included protections**

Enable the Free Managed Ruleset and Browser Integrity Check. Create the single Free-plan rate-limiting rule for `path starts_with /api/` at a conservative burst threshold (start at `60 requests / 10 seconds`, Managed Challenge), then tune from Security Analytics. Exclude verified bots and do not challenge static assets or invitation page GETs.

- [ ] **Step 4: Add route-specific custom rules**

Managed Challenge obvious automated traffic to `/api/auth/*`, `/api/public/invitations/*/(rsvp|wishes|view)`, and `/api/webhooks/*`; explicitly skip verified bots. If Free-plan expression fields cannot represent method-aware matching, document the limitation and keep method-specific enforcement in Next.js.

- [ ] **Step 5: Verify without load testing**

Use normal requests plus Cloudflare Security Events to confirm: static pages remain accessible, one deliberately repeated API request receives a challenge/limit, and direct `workers.dev` access no longer bypasses zone policy.

- [ ] **Step 6: Commit**

`git add wrangler.jsonc docs/security/cloudflare-edge-runbook.md && git commit -m "security: establish Cloudflare edge protections"`

### Task 2: Correct trusted client identity and standardize `429`

**Files:**
- Modify: `lib/server/public-write.ts`
- Modify: `lib/server/rate-limit.ts`
- Modify: `tests/public-write-routes.test.ts`
- Modify: `tests/security.test.ts`

**Interfaces:**
- Produces: `requestFingerprint(headers: Headers, production?: boolean): string`
- Produces: `enforceRateLimit(client, key, limit, windowSeconds): Promise<void>` that throws `HttpError(429)` with retry metadata supported by the response layer.

- [ ] **Step 1: Write failing identity tests**

Assert production prefers a valid single `cf-connecting-ip`, ignores spoofable `x-forwarded-for`, normalizes IPv4/IPv6, never returns raw addresses, and creates a per-request fallback bucket rather than global `unknown` when the trusted header is absent. Assert development fallback behavior explicitly.

- [ ] **Step 2: Run the focused tests and observe the current Cloudflare case fail**

Run: `node --test tests/public-write-routes.test.ts tests/security.test.ts`

- [ ] **Step 3: Implement the minimum trusted-header fix**

Use `CF-Connecting-IP` in production, HMAC the normalized value, and reject malformed values. Keep Netlify compatibility only behind an explicit deployment setting if Netlify remains supported; do not silently trust both providers.

- [ ] **Step 4: Add one shared enforcement helper**

Wrap the existing `consumeRateLimit` call so all routes return the same `429` behavior and `Retry-After`. Do not replace the Postgres RPC or add Redis yet.

- [ ] **Step 5: Run focused and full tests**

Run: `node --test tests/public-write-routes.test.ts tests/security.test.ts && npm test`

- [ ] **Step 6: Commit**

`git add lib/server/public-write.ts lib/server/rate-limit.ts tests/public-write-routes.test.ts tests/security.test.ts && git commit -m "security: trust Cloudflare client identity"`

### Task 3: Bound every request body before parsing

**Files:**
- Modify: `lib/server/http.ts`
- Modify: `app/api/public/invitations/[slug]/rsvp/route.ts`
- Modify: `app/api/public/invitations/[slug]/wishes/route.ts`
- Modify: `app/api/webhooks/[provider]/route.ts`
- Modify: `tests/auth-routes.test.ts`
- Modify: `tests/public-write-routes.test.ts`
- Modify: `tests/donate.test.ts`

**Interfaces:**
- Produces: `readBody(request: Request, maxBytes: number): Promise<Uint8Array>`
- Produces: `parseJson(request, schema, maxBytes)` backed by `readBody`, not `request.json()`.

- [ ] **Step 1: Write failing body-limit tests**

Cover oversized `Content-Length`, missing `Content-Length` with an oversized stream, invalid JSON, public RSVP/wish limits, and webhook bodies over 64 KiB. The read must stop as soon as the limit is crossed.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/auth-routes.test.ts tests/public-write-routes.test.ts tests/donate.test.ts`

- [ ] **Step 3: Implement one bounded reader**

Read the request stream incrementally, cancel it after `maxBytes`, and parse UTF-8 JSON only after the bounded read. Use 64 KiB for auth/public writes/webhooks, 1 MiB for invitation JSON, and keep the existing upload path at `UPLOAD_REQUEST_MAX_BYTES` with required `Content-Length`.

- [ ] **Step 4: Route all JSON/raw-body paths through it**

Preserve webhook signature verification against the exact raw bytes. Do not deserialize before authentication.

- [ ] **Step 5: Verify GREEN and regression suite**

Run: `node --test tests/auth-routes.test.ts tests/public-write-routes.test.ts tests/donate.test.ts && npm test`

- [ ] **Step 6: Commit**

`git add lib/server/http.ts app/api/public app/api/webhooks tests && git commit -m "security: bound API request bodies"`

### Task 4: Close route-level abuse gaps

**Files:**
- Modify: `app/api/public/invitations/[slug]/view/route.ts`
- Modify: `app/api/public/invitations/[slug]/guests/[token]/route.ts`
- Modify: `app/api/webhooks/[provider]/route.ts`
- Modify: `app/api/invitations/[id]/route.ts`
- Modify: `app/api/invitations/[id]/guests/route.ts`
- Modify: `app/api/invitations/[id]/guests/import/route.ts`
- Modify: `app/api/invitations/[id]/guests/[guestId]/route.ts`
- Modify: `app/api/invitations/[id]/wishes/[wishId]/route.ts`
- Modify: relevant route tests under `tests/`

**Interfaces:**
- Consumes: `requestFingerprint()` and `enforceRateLimit()` from Task 2.
- Produces: route-specific keys using action + fingerprint + resource ID/slug; authenticated/edit-key routes also include actor/resource identity.

- [ ] **Step 1: Write failing coverage tests**

Assert limits for view writes (`30/min/IP/slug`), guest-token lookup (`30/min/IP/slug`), invalid webhooks (`20/min/IP/provider` before expensive parsing), uploads (`30/hour/invitation` plus `60/hour/IP`), invitation creation (`10/hour/IP`), and owner/edit-key writes (`120/min/actor/invitation`). Assert one actor cannot consume another actor's bucket.

- [ ] **Step 2: Verify RED route by route**

Run only each owning test file while adding its assertion; do not change production code until the new assertion fails for missing enforcement.

- [ ] **Step 3: Add the minimum route calls**

Place limits after cheap syntax/authenticity checks but before database writes, storage uploads, email sends, or large response queries. Keep the existing stricter auth/public-write limits.

- [ ] **Step 4: Prevent view-event row flooding**

Rate-limit before generating/storing a new visitor cookie. Keep the existing unique bucket as the second defense.

- [ ] **Step 5: Run full tests**

Run: `npm test`

- [ ] **Step 6: Commit**

`git add app/api tests && git commit -m "security: cover abuse-prone API routes"`

### Task 5: Prevent CSRF on cookie-authenticated mutations

**Files:**
- Modify: `lib/server/security.ts`
- Modify: cookie-authenticated POST/PATCH/DELETE handlers under `app/api/auth`, `app/api/account`, and `app/api/invitations`
- Modify: `tests/security.test.ts`
- Modify: relevant route tests

**Interfaces:**
- Produces: `assertSameOrigin(request: NextRequest): void`

- [ ] **Step 1: Write failing origin tests**

Accept the configured canonical origin and local development origin; reject missing/mismatched `Origin` for browser cookie mutations. Exempt signed payment webhooks and anonymous public RSVP/wish routes because they use separate authenticity/abuse controls.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/security.test.ts tests/auth-routes.test.ts tests/invitation-routes.test.ts`

- [ ] **Step 3: Implement and apply the guard**

Compare parsed origins, never raw prefix strings. Use the configured canonical site URL; do not build trust from `Host` or `X-Forwarded-Host`.

- [ ] **Step 4: Verify GREEN and full tests**

Run: `npm test`

- [ ] **Step 5: Commit**

`git add lib/server/security.ts app/api tests && git commit -m "security: enforce same-origin mutations"`

### Task 6: Bound Postgres amplification and retention

**Files:**
- Create: `supabase/migrations/202609280001_security-abuse-controls.sql`
- Modify: `lib/server/logging.ts`
- Modify: `supabase/functions/public-write/index.ts`
- Modify: `supabase/tests/backend.sql`
- Modify: `tests/logging.test.ts`

**Interfaces:**
- Produces: indexed expiry/purge for `rate_limits`.
- Produces: bounded logging policy: all `5xx`, security-relevant `4xx`, and a small deterministic sample of successes; no public view/read success-body logging.

- [ ] **Step 1: Write failing pgTAP and logging tests**

Assert expired rate-limit rows are purged, current windows remain, purge execution is service-role-only, and high-volume successful public reads/views do not create request-body log writes.

- [ ] **Step 2: Verify RED**

Run: `supabase test db` and `node --test tests/logging.test.ts`.

- [ ] **Step 3: Add rate-limit retention**

Index `rate_limits(window_started)` and schedule a daily purge of rows older than 24 hours. Keep the atomic counter function unchanged.

- [ ] **Step 4: Remove logging as an attack multiplier**

Skip routine successful public GET/view logs, retain errors, and deterministically sample at most 1% of other successes. Keep header/body redaction and seven-day retention.

- [ ] **Step 5: Verify GREEN**

Run: `supabase test db && node --test tests/logging.test.ts && npm test`

- [ ] **Step 6: Commit**

`git add supabase lib/server/logging.ts tests/logging.test.ts && git commit -m "security: bound abuse telemetry storage"`

### Task 7: Add targeted bot verification for auth and public writes

**Files:**
- Modify: `lib/server/env.ts`
- Create: `lib/server/turnstile.ts`
- Modify: auth forms/routes and RSVP/wish forms/routes that own the affected requests
- Modify: `supabase/functions/_shared/public-write.ts`
- Modify: `supabase/functions/tests/public-write.test.ts`
- Create or modify focused Turnstile tests under `tests/`

**Interfaces:**
- Produces: `verifyTurnstile(token, expectedAction, remoteIpHashContext): Promise<void>` with hostname/action checks and timeout.
- Consumes: public site key in the browser; secret key only in Next.js/Supabase secrets.

- [ ] **Step 1: Configure Supabase Auth CAPTCHA in monitor/test mode**

Enable Cloudflare Turnstile in Supabase Auth for signup, sign-in, and password reset. Store keys in deployment secret stores, never `wrangler.jsonc`.

- [ ] **Step 2: Write failing verification tests**

Cover missing token, invalid token, wrong hostname/action, expired token, verification timeout, and valid token. Mock only Cloudflare's verification response, not application policy.

- [ ] **Step 3: Implement the verifier and auth token pass-through**

Use a short outbound timeout and fail closed on auth/email endpoints. Pass `captchaToken` to Supabase Auth's supported option instead of inventing a parallel auth protocol.

- [ ] **Step 4: Protect RSVP/wish only after measuring false positives**

Start with Turnstile on suspicious/retried submissions while retaining honeypot + rate limit. Move to every public write only if sampled production metrics show acceptable completion rates for mobile guests.

- [ ] **Step 5: Verify accessibility and failure recovery**

The challenge must be keyboard usable, announce failures, preserve form input, and offer retry. Do not block invitation viewing.

- [ ] **Step 6: Run tests and typecheck**

Run: `deno test --allow-env supabase/functions/tests/public-write.test.ts && npm test && npm run typecheck`

- [ ] **Step 7: Commit**

`git add lib app components supabase tests && git commit -m "security: verify bots on sensitive writes"`

### Task 8: Operational verification and alerting

**Files:**
- Create: `docs/security/incident-runbook.md`
- Modify: `docs/security/cloudflare-edge-runbook.md`

**Interfaces:**
- Produces: thresholds, dashboards, rollback, secret-rotation, and incident steps owned by a named operator.

- [ ] **Step 1: Define observable signals**

Track Cloudflare challenged/blocked requests, Worker errors and CPU, Supabase database/storage/egress, `429` by route, auth failures, rate-limit row count, webhook `401`, and public-write `5xx`.

- [ ] **Step 2: Define alerts and response**

Alert on a sustained `429`/`5xx` increase, sudden database/log growth, storage egress spikes, or webhook authentication failures. Document temporary edge-block and secret-rotation procedures.

- [ ] **Step 3: Perform bounded staging checks**

Use a local/staging script capped to a small request count to verify per-IP separation, expiry, `Retry-After`, body cutoffs, and no database/log amplification. Never stress production.

- [ ] **Step 4: Final verification**

Run: `npm test && npm run typecheck && npm run build:next && supabase test db`

- [ ] **Step 5: Commit**

`git add docs/security && git commit -m "docs: add security operations runbook"`

## Rollout order

1. Task 1 and Task 2 first: they stop edge bypass and fix the broken production identity assumption.
2. Tasks 3, 4, and 6 next: they remove direct resource-amplification paths.
3. Task 5 after canonical origin is confirmed.
4. Task 7 in monitor mode, then enforce after mobile completion metrics are reviewed.
5. Task 8 before declaring the controls production-ready.

## Deliberately skipped

- Redis/Upstash: existing Postgres RPC is sufficient for business-level limits; add a distributed counter only if database contention is measured.
- Custom bot scoring or fingerprinting: Cloudflare/Turnstile already provides this and avoids collecting extra personal data.
- Kubernetes/nginx: deployment is Cloudflare Workers, so another proxy layer adds no useful boundary.
- Blanket CAPTCHA on invitation reads: it would harm guests and SEO; protect writes and suspicious bursts instead.
