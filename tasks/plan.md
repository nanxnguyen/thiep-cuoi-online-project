# Implementation Plan: Workers Free optimization (Error 1102)

## Overview

`taothiepcuoi.raystudio.com.vn` chạy trên Cloudflare Workers Free (CPU 10ms/req, RAM 128MB, startup 1s) qua `@opennextjs/cloudflare`. Bundle server hiện 15.5MB (`handler.mjs`), homepage SSR ~40 `ThiepPreview`, `app/docs` import `swagger-ui-react` tĩnh vào server bundle. Mục tiêu: chạy ổn định trên Free mà không lên Paid, bằng cách giảm CPU/request, giảm bundle/startup, và đưa marketing pages về static + cache. Không đổi hành vi sản phẩm.

Baseline đã đo (Oct 2026):
- `handler.mjs`: 15,754,355 bytes
- `.open-next` tổng: 86M, `assets`: 18M
- Error: 1102 = exceeded CPU (Free limit 10ms), sau commit `ff7f582` thêm marquee thứ 2.

## Architecture Decisions

- Giữ Next.js + OpenNext + Workers, không đổi platform. Netlify/Vercel vẫn là fallback (`DEPLOY.md`).
- Ưu tiên static/prerender + edge cache cho mọi trang marketing; chỉ `/invite/[slug]` và API mutations giữ `force-dynamic`.
- Homepage: server SSR 6-8 cards, client hiện ngay 20 trong viewport, scroll mở dần đủ 50 (reuse `Defer` + `IntersectionObserver`).
- Mọi lib nặng client-only (`swagger-ui-react`, `@ffmpeg`, `yet-another-react-lightbox`, `embla`, `motion`) không được lọt vào server bundle — dùng `next/dynamic ssr:false` hoặc route tách riêng.
- Fonts: giữ tối đa 2 fonts preload (`sans` + `display`), `script`/`hand` đã `preload:false` giữ nguyên; không fetch font runtime ngoài build.
- Đo trước–sau mọi thay đổi: `handler.mjs` bytes, `wrangler deploy --dry-run`, TTFB/`curl -w`, Lighthouse.

## Dependency Graph

```
Đo baseline (Task 1)
  │
  ├── Homepage CPU (Task 2: marquee SSR → client defer)
  │       │
  │       └── Fonts + CSS (Task 3) — song song được sau Task 1
  │
  ├── Server bundle (Task 4: /docs swagger dynamic, Task 5: audit ffmpeg/motion/lightbox)
  │       │
  │       └── Route configs (Task 6: static vs dynamic, generateStaticParams)
  │
  └── Cache + headers (Task 7: Cache-Control, Cloudflare cache rules)
          │
          └── Guard CI (Task 8: bundle budget + Lighthouse + wrangler check)
```

Thứ tự: Task 1 trước. Task 2–5 song song sau Task 1. Task 6–7 sau 2–5. Task 8 cuối.

## Task List

### Phase 1: Measure (bắt buộc trước mọi fix)

- [ ] Task 1: Đo baseline CPU/bundle/routes

### Checkpoint: Baseline
- [ ] Có số handler bytes, top chunks, danh sách routes static/dynamic, TTFB `/`, `/templates`, `/invite/<slug>`, ảnh `wrangler tail` khi lỗi

### Phase 2: Giảm CPU/request (win lớn nhất)

- [ ] Task 2: Homepage marquee SSR 40 → ~6 previews + client defer
- [ ] Task 3: Fonts + CSS runtime (giữ 2 fonts preload, kiểm tra `inlineCss`)

### Checkpoint: CPU
- [ ] `/` hết 1102 trên preview deploy, TTFB giảm, Lighthouse không rớt

### Phase 3: Giảm bundle/startup

- [ ] Task 4: Tách `swagger-ui-react` khỏi server bundle (`app/docs`)
- [ ] Task 5: Audit server imports nặng (ffmpeg/motion/lightbox/embla)

### Checkpoint: Bundle
- [ ] `handler.mjs` giảm rõ rệt, `wrangler --dry-run` + `startup_time_ms` OK

### Phase 4: Static + cache + guard

- [ ] Task 6: Route segment audit (static cho marketing, dynamic chỉ invite/API cần)
- [ ] Task 7: Cache headers + Cloudflare cache rules cho static/ISR
- [ ] Task 8: CI guard (bundle budget, Lighthouse, wrangler check)

### Checkpoint: Complete
- [ ] Preview Cloudflare hết 1102, prod verify theo `DEPLOY.md §5`, CI xanh

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Giảm SSR homepage làm SEO/Layout shift | Med | Giữ SSR 6 cards đầu + placeholder cùng class/kích thước như `GalleryCatalog:Defer`; test `?` + Lighthouse CLS |
| Tách `/docs` làm hỏng API docs nội bộ | Low | Giữ route, chỉ `dynamic(ssr:false)` + loading fallback; e2e `/docs` |
| `inlineCss:false` đổi FOUC | Low | So sánh visual trước–sau, giữ `tokens.css`/`globals.css` order |
| Cache sai làm lộ thiệp private `/invite` | High | `robots noindex` giữ nguyên, `Cache-Control: private,no-store` cho `/invite/*` + API; test ẩn danh `?g=` |
| OpenNext cache mặc định memory-only, cold start vẫn SSR | Med | Ưu tiên static prerender + Cloudflare CDN cache, không dựa vào ISR memory |

## Open Questions

- Có chấp nhận giảm số preview SSR homepage từ 40 → 6–8 không, hay muốn giữ 20?
- `/docs` (Swagger) có cần public trên Workers không, hay chỉ nội bộ (có thể bỏ khỏi Workers bundle)?
- Có cho bật Cloudflare Cache Rules / Tiered Cache cho `/_next/static/*` và pages static không?
