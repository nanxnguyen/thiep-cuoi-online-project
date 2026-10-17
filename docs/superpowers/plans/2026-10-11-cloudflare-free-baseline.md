# Cloudflare Free baseline (CPU per route)

Measured with `node scripts/cf-cpu-probe.mjs https://taothiepcuoimienphi.raystudio.com.vn 5` (5 sequential requests per route, `wrangler tail` `cpuTime` in ms). Plan: `2026-10-11-cloudflare-free-performance.md`.

## Before (version `b39c789c`, 2026-10-11)

| route | p50 ms | max ms | exceeded |
|---|---|---|---|
| `/` | 11 | 176 | 0 |
| `/templates` | 12 | 39 | 0 |
| `/templates/song-hy` | **22** | 146 | 0 |
| `/studio` | **54** | 100 | 0 |
| `/ung-ho` | 6 | 9 | 0 |
| `/bang-gia` | 6 | 10 | 0 |
| `/blog` | 5 | 9 | 0 |
| `/cong-cu/tao-qr` | 6 | 6 | 0 |
| `/admin/login` | 15 | 35 | 0 |
| `/api/auth/me` | 8 | 64 | 0 |
| `/api/admin/me` | 6 | 9 | 0 |
| `/invite/<slug>` | not measured (needs a published slug) | | |

Reading: a small prerendered page costs ~5-6 ms (worker boot + cache lookup). `/studio` and `/templates/[id]` are server-rendered per request (they read `searchParams`) and cost 4-9x more, so Task 1 targets them. `/` and `/templates` are static but carry large payloads (11-12 ms); `max` values are cold starts (bundle parse). `/admin/login` is dynamic (reads cookies to redirect admins).

Decision: Task 1 (static `/studio`, `/templates/[id]`) first; Task 2 stays gated on a real `/invite/<slug>` measurement; Tasks 3-5 as planned.

## Worker bundle (Task 3), 2026-10-11

`npm run build` now prints and enforces the size: 7.86 MiB raw, 1.83 MiB gzip (budget 2.40, Free limit 3.00).

Top contributors in `handler.mjs` (KB in output):

| KB | what |
|---|---|
| 733 | Next app-page runtime |
| 523 | `components/invitation` chunk (renderer + 40 sections) |
| 478 + 478 | **zod v4, bundled twice** (SSR chunk and route chunk) |
| 298 / 240 / 235 / 219 | app SSR chunks |
| 214 | `load-manifest` |
| 202 | react-dom server |
| 123 | jsonwebtoken (Next-internal) |

Finding for a follow-up task (not done here, risk of touching validation everywhere): zod is ~0.95 MB raw (12% of the worker) because two chunk graphs each carry a copy; unifying the import path or moving server-only schemas out of SSR page chunks would cut cold-start parse time. Do it only if cold-start `max` values stay above 100 ms after Tasks 1-5.
