# Baseline 2026-10-04 (pre-optimization)

- `handler.mjs`: 15754007 bytes (15.5MB), 2026-10-04 14:53 build
- `.open-next`: 86M, `assets`: 18M
- Routes `force-dynamic`: `app/invite/[slug]/page.tsx:15`, `app/api/docs/route.ts:5`
- Homepage: `app/page.tsx:22-33` TPL hardcode 10, render ~40 `ThiepPreview` (2 track x2)
- Registry: 50 templates (`lib/templates.ts`)
- Server bundle leak: `grep -c "swagger-ui" handler.mjs` = 4 (CSS từ `app/docs/layout.tsx:2` bị inline do `experimental.inlineCss: true`)
- `@ffmpeg`: 1 match (dynamic string, OK), `yet-another-react-lightbox`: 0 (client-only, OK)
- Limits Free: CPU 10ms/req, RAM 128MB, startup 1s, worker 64MiB
- Error: 1102 exceeded CPU, Ray `a45515b78f9b6bc9`, sau commit `ff7f582` ~12 phút

## Budget mục tiêu

- `handler.mjs` <8MB trước, <5MB sau
- `Total Upload` dry-run <20MB, `startup_time_ms` <800ms
- `/` server HTML ≤8 previews đầy đủ, client 20 ngay + 50 khi scroll
- Lighthouse `/`: LCP ≤2.5s, CLS ≤0.1, Performance ≥90
