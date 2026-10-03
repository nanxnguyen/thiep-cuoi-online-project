# Security incident runbook

Owner: project owner (Nguyễn Anh Nhựt)

## Triage

1. Confirm the alert in Cloudflare Workers Analytics and Supabase, then note the start time and affected route.
2. Use `x-request-id` to correlate sampled API logs. Do not query or export secrets or guest personal data.
3. Classify the event: request flood (`429`), application failure (`5xx`), storage/egress spike, webhook authentication (`401`), or credential exposure.
4. Preserve a small redacted evidence sample and record every mitigation and timestamp.

## Containment

- Flood: lower the affected application bucket temporarily and deploy. A zone-level block/challenge requires a future custom domain; `workers.dev` has no project WAF boundary.
- `5xx`: rollback the Worker to the previous known-good deployment and check Supabase health before restoring traffic.
- Storage abuse: disable the media upload route in the Worker deployment; do not delete user media during containment.
- Webhook `401`: pause the provider integration, verify its signing configuration, and reject unsigned requests.
- Exposed secret: rotate in this order—Supabase service-role key, `EDGE_SHARED_SECRET` in both Worker and Supabase Function, webhook secrets, then `RATE_LIMIT_HMAC_SECRET`. Redeploy all consumers and revoke the old value.

Rotating `RATE_LIMIT_HMAC_SECRET` resets effective client/actor buckets. Rotating `EDGE_SHARED_SECRET` on only one side causes all public RSVP/wish writes to fail.

## Recovery

Run unit tests, typecheck, production build, and `supabase test db` where the CLI is available. Perform only the bounded staging checks in the edge runbook. Restore disabled routes, watch the triggering signal for 30 minutes, and document root cause and follow-up.

Turnstile was removed from RSVP/wish on 2026-09-30. If spam returns, re-add a challenge only after keyboard testing, mobile completion measurement, and a retry path that preserves form input.
