# Cloudflare edge security runbook

Owner: project owner (Nguyễn Anh Nhựt)

## Current boundary

Production uses `https://thiep-cuoi-online.nguyenvtt18.workers.dev`. There is no custom domain, so zone WAF rules and disabling the public `workers.dev` route are not available. The Worker is the only public Next.js origin; Supabase service-role and shared-secret values stay server-side.

The application trusts only `CF-Connecting-IP` in production. A missing or invalid value is rejected. Route limits return `429` with `Retry-After`; JSON bodies default to 64 KiB and invitation/import payloads to 1 MiB.

RSVP and wish submissions have no CAPTCHA (Turnstile was removed on 2026-09-30 because it failed for real visitors). Abuse protection is the honeypot field, per-fingerprint rate limits in the Edge function, the same-origin check, and guestbook moderation.

When a custom domain is acquired, put it in a Cloudflare zone, attach the Worker route, add managed WAF/rate-limit rules, update `NEXT_PUBLIC_SITE_URL`, verify OAuth redirects, then disable `workers.dev`.

## Daily signals and alert thresholds

Check Cloudflare Workers Analytics and Supabase reports:

- Worker errors above 2% for 5 minutes, or CPU time above the plan limit.
- API `429` above 10% for 10 minutes on one route.
- API/public-write `5xx` above 2% for 5 minutes.
- Database size, `rate_limits`, or `api_request_logs` growing above 2× the prior seven-day daily peak.
- Storage egress above 2× the prior seven-day daily peak.
- Five webhook `401` responses in 10 minutes.
- Auth failures above 20 per IP fingerprint in 15 minutes.

Record the timestamp, route, status, request ID, and affected invitation; never copy cookies, tokens, edit keys, or request bodies into tickets.

## Bounded verification

Run against local or staging only, never as a load test against production:

```sh
npm test
npm run typecheck
npm run build:next
```

Send at most three requests per case: valid/missing `Origin`, an oversized body, and a repeated request that reaches `429`. Confirm `Retry-After`, request IDs, separate test IP buckets, expiry after the configured window, and that successful public views do not add log rows.

Database checks require the Supabase CLI and Docker:

```sh
supabase test db
```

## Rollback

Rollback the Worker to the previous known-good deployment. Do not roll back a Supabase migration destructively; ship a forward migration. If CSRF blocks legitimate traffic, first verify `NEXT_PUBLIC_SITE_URL`; if rate limiting is wrong, restore the previous application deployment while preserving the database rows for diagnosis.
