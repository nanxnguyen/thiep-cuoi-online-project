# Todo: Workers Free optimization

## Task 1: Đo baseline CPU/bundle/routes

**Description:** Thu thập số liệu gốc để mọi fix sau so sánh được: handler bytes, dry-run upload + startup_time, danh sách route static/dynamic, TTFB 3 URL, log `wrangler tail` khi tái hiện 1102.

**Acceptance criteria:**
- [ ] Có `handler.mjs` bytes hiện tại và sau mỗi task để diff
- [ ] Có output `wrangler deploy --dry-run` (Total Upload + startup_time_ms)
- [ ] Có bảng routes nào `force-dynamic` / static (từ grep + build output)
- [ ] Có TTFB `curl -w` cho `/`, `/templates`, `/invite/<slug>` trên prod + preview (nếu có)

**Verification:**
- [ ] Lệnh chạy được: `ls -l .open-next/server-functions/default/handler.mjs && ./node_modules/.bin/opennextjs-cloudflare build --dry-run 2>&1 | head` (hoặc `npx wrangler deploy --dry-run --outdir bundled/`)
- [ ] Lệnh TTFB: `curl -s -o /dev/null -w "%{http_code} %{time_starttransfer}\n" "$B/"` với `B=https://taothiepcuoi.raystudio.com.vn`
- [ ] Log: `npx wrangler tail` ghi lại `outcome=exceededCpu|exceededMemory` khi lỗi

**Dependencies:** None

**Files likely touched:**
- (read-only, không sửa code)
- `tasks/baseline.md` (tạo mới để lưu số)

**Estimated scope:** S (1-2 files, chỉ đo)

---

## Task 2: Homepage marquee SSR 40 → ~6 previews + client defer

**Description:** `app/page.tsx` đang SSR ~40 `ThiepPreview` (2 track x2, mới chỉ từ 10 TPL hardcode). Yêu cầu mới: mặc định viewport thấy 20, scroll xuống hiện đủ 50 (full registry `templates`). Cách làm để qua Workers Free 10ms: server chỉ SSR 6-8 cards đầu, client hydrate xong render ngay 20 trong viewport từ data có sẵn (không fetch), scroll tới đâu `IntersectionObserver` mở dần tới 50. Reuse pattern `Defer` như `GalleryCatalog.tsx:24-40` (placeholder cùng class `tp-root`, không layout shift). Mở rộng nguồn data từ 10 TPL hardcode → 50 `templates`, tách marquee thành Client Component (`components/home/HomeMarquee.tsx`).

**Acceptance criteria:**
- [ ] Server HTML `/` chỉ chứa 6-8 `ThiepPreview` đầy đủ (để qua CPU 10ms), còn lại là placeholder `tp-root` cùng kích thước
- [ ] Client mở lên thấy ngay 20 cards trong viewport, scroll xuống load dần đủ 50 templates (không fetch thêm, data từ registry)
- [ ] Không CLS mới (placeholder cùng `maxWidth`/`borderRadius`/class, CLS ≤0.1)
- [ ] Link `/templates/<id>` và badge/style giữ nguyên, keyboard Tab được, `aria-hidden` cho cards lặp marquee

**Verification:**
- [ ] `npm run build` + đếm `ThiepPreview` trong HTML: `curl -s $B/ | grep -o "tp-root" | wc -l` — server ít, nhưng DOM sau hydrate đủ 20 rồi 50 khi scroll
- [ ] Tests: `npm test -- --grep "template|home|design-system"` (theo `package.json:19`)
- [ ] Manual: mở `/` ẩn danh, thấy 20 ngay, scroll xuống đủ 50 mượt, view-source chỉ vài preview đầu; check 320px/768px/1024px/1440px + Tab keyboard

**Dependencies:** Task 1

**Files likely touched:**
- `app/page.tsx`
- `components/home/HomeMarquee.tsx` (tạo mới, client)
- `components/templates/ThiepPreview.tsx` (nếu cần export placeholder)

**Estimated scope:** M (3-5 files)

---

## Task 3: Fonts + CSS runtime

**Description:** `app/layout.tsx:15-20` load 4 Google Fonts + `next.config.ts:8` bật `experimental.inlineCss`. Giữ `sans` + `display` preload, `script`/`hand` giữ `preload:false`; đánh giá tắt `inlineCss` trên Workers (giảm memory/CPU) và xác nhận không FOUC. Không đổi font-family/voice.

**Acceptance criteria:**
- [ ] Chỉ 2 fonts preload trên `/`, 2 fonts còn lại lazy theo route dùng `var(--script)`/`var(--hand)`
- [ ] Quyết định `inlineCss: true/false` có số TTFB + visual diff kèm theo
- [ ] Không đổi token trong `app/styles/tokens.css`, `app/globals.css`

**Verification:**
- [ ] Network tab: số font requests trên `/` giảm, `document.fonts` OK
- [ ] `npx tsc --noEmit` + `npm run build` pass
- [ ] So sánh screenshot trước–sau (symbol ♥ ✓ ✉ cao độ dòng không đổi)

**Dependencies:** Task 1 (song song với Task 2 được)

**Files likely touched:**
- `app/layout.tsx`
- `next.config.ts`
- `app/globals.css` (chỉ đọc/kiểm tra, tránh sửa)

**Estimated scope:** S (1-2 files)

---

## Task 4: Tách swagger-ui-react khỏi server bundle

**Description:** `app/docs/page.tsx:3` + `app/docs/layout.tsx:2` import `swagger-ui-react` tĩnh nên chui vào `handler.mjs` 15MB. Chuyển sang `next/dynamic(() => import(...), { ssr:false })` + loading fallback, CSS chỉ load client. Route `/docs` và `/api/docs` giữ nguyên contract.

**Acceptance criteria:**
- [ ] `handler.mjs` giảm kích thước đo được (ghi số trước–sau vào `tasks/baseline.md`)
- [ ] `/docs` vẫn mở được, Swagger UI render client-side
- [ ] Không import `swagger-ui-react` trong server bundle (grep build output)

**Verification:**
- [ ] `ls -l .open-next/server-functions/default/handler.mjs` trước–sau
- [ ] Manual: mở `/docs` + `/api/docs` (theo `DEPLOY.md §5`)
- [ ] `npm test` + `npx tsc --noEmit` pass

**Dependencies:** Task 1

**Files likely touched:**
- `app/docs/page.tsx`
- `app/docs/layout.tsx`

**Estimated scope:** S (1-2 files)

---

## Task 5: Audit server imports nặng

**Description:** Rà soát server components/API có vô tình import `motion`, `@ffmpeg/*`, `yet-another-react-lightbox`, `embla-carousel-react` hay không. `lib/celebrate.ts:6` đã dynamic tốt — giữ pattern đó. FFmpeg/VideoCompress chỉ chạy browser; Lightbox/embla chỉ client. Chuyển mọi import tĩnh còn sót sang `dynamic ssr:false` hoặc move vào client leaf.

**Acceptance criteria:**
- [ ] `grep` server files (`app/**/page.tsx`, `app/api/**`, `lib/server/**`) không còn import tĩnh 4 lib trên
- [ ] `handler.mjs` tiếp tục giảm hoặc không tăng
- [ ] Tính năng nén video/album/embla vẫn chạy client như cũ

**Verification:**
- [ ] Lệnh: `grep -rn "from \"@ffmpeg\|yet-another-react-lightbox\|embla-carousel\|from \"motion" app lib --include="*.ts" --include="*.tsx"` chỉ còn file client/`"use client"`
- [ ] `npm test` + manual `/cong-cu/nen-video`, album lightbox

**Dependencies:** Task 1 (song song với Task 4 được)

**Files likely touched:**
- `components/tools/VideoCompressTool.tsx` (xác nhận client-only)
- `components/invitation/client/AlbumGallery.tsx` (xác nhận)
- Bất kỳ server file nào grep ra

**Estimated scope:** S-M (2-4 files)

---

## Task 6: Route segment audit (static-first)

**Description:** Marketing giữ static/prerender (`/`, `/templates` đã static tốt, `/templates/[id]` đã có `generateStaticParams`), chỉ `/invite/[slug]` (`app/invite/[slug]/page.tsx:15`) và API mutations giữ `force-dynamic`. `app/api/docs/route.ts:5` đang `force-dynamic` → chuyển static/cache. Thêm `revalidate` hợp lý cho sitemap/blog nếu chưa có, không cache nhầm trang private.

**Acceptance criteria:**
- [ ] Bảng routes cuối cùng: static cho marketing, dynamic chỉ invite/API cần fresh
- [ ] `/invite/*` giữ `Cache-Control: private,no-store` + `robots noindex` (đã có trong `generateMetadata`)
- [ ] `/templates/[id]?preview=1&gate=1` không bị cache chéo màu/khách khác

**Verification:**
- [ ] `npm run build` log routes (○ static, ƒ dynamic) đúng kỳ vọng
- [ ] Header check: `curl -sI "$B/templates" | grep -i cache`, `curl -sI "$B/invite/<slug>" | grep -i cache`
- [ ] Manual ẩn danh `?g=<token>` đúng tên hộ (theo `DEPLOY.md §5`)

**Dependencies:** Task 2, 4, 5

**Files likely touched:**
- `app/api/docs/route.ts`
- `app/sitemap.ts` (nếu thêm revalidate)
- `app/blog/[slug]/page.tsx` tương tự (nếu có)
- `lib/server/security.ts` (headers cache, nếu cần)

**Estimated scope:** S (2-3 files)

---

## Task 7: Cache headers + Cloudflare cache rules

**Description:** Thêm `Cache-Control` đúng cho từng loại (`/_next/static/*` immutable 1y, pages static `s-maxage` + `stale-while-revalidate`, API/invite `no-store`), rồi cấu hình Cloudflare Cache Rules/Tiered Cache cho assets + pages static. Không phụ thuộc ISR memory của OpenNext.

**Acceptance criteria:**
- [ ] `/_next/static/*` trả `immutable,max-age=31536000`
- [ ] `/`, `/templates*`, `/blog*` có `s-maxage` + SWR, hit cache lần 2 (`cf-cache-status: HIT`)
- [ ] `/invite/*`, `/api/*` (trừ `/api/docs`) `no-store/private`, không HIT nhầm

**Verification:**
- [ ] `curl -sI` từng nhóm URL kiểm tra `cache-control` + `cf-cache-status` 2 lần liên tiếp
- [ ] `npm run build && npx wrangler deploy` lên preview, verify theo `DEPLOY.md §5` (home/invite/api-docs)

**Dependencies:** Task 6

**Files likely touched:**
- `next.config.ts` (headers)
- `wrangler.jsonc` (assets/cache nếu cần)
- Cloudflare dashboard (Cache Rules, ghi lại rule vào `tasks/baseline.md`)

**Estimated scope:** S (1-2 files + dashboard)

---

## Task 8: CI guard (bundle budget + Lighthouse + wrangler check)

**Description:** Chặn tái phát 1102: check `handler.mjs` size + `wrangler deploy --dry-run` (Total Upload + `startup_time_ms`), Lighthouse Performance ≥90, không tăng bundle quá ngưỡng. Ghi vào CI hiện có (`.github/`).

**Acceptance criteria:**
- [ ] CI fail khi `handler.mjs` vượt budget (đề xuất khởi điểm: <8MB, thắt dần về <5MB)
- [ ] CI chạy Lighthouse cho `/` + `/templates` (LCP ≤2.5s, CLS ≤0.1)
- [ ] Có `wrangler check startup` hoặc dry-run startup_time trong log CI

**Verification:**
- [ ] `git push` thử vượt budget → CI đỏ; giảm xuống → CI xanh
- [ ] `npm test && npx tsc --noEmit && git diff --check` vẫn xanh (theo `DEPLOY.md §4`)

**Dependencies:** Task 2-7

**Files likely touched:**
- `.github/workflows/*`
- `scripts/check-bundle.mjs` (tạo mới)
- `tasks/baseline.md` (ngưỡng budget)

**Estimated scope:** M (3-5 files)

---

## Checkpoint log

### Checkpoint: Baseline (sau Task 1)
- [ ] handler bytes + dry-run + startup_time đã lưu
- [ ] Bảng static/dynamic routes đã lưu
- [ ] TTFB 3 URL đã lưu

### Checkpoint: CPU (sau Task 2-3)
- [ ] `/` hết 1102 trên preview
- [ ] TTFB giảm vs baseline
- [ ] Lighthouse CLS không rớt

### Checkpoint: Bundle (sau Task 4-5)
- [ ] handler.mjs giảm (ghi số)
- [ ] dry-run + startup_time OK
- [ ] `/docs` + tools client vẫn chạy

### Checkpoint: Complete (sau Task 6-8)
- [ ] Prod verify `DEPLOY.md §5` (home/invite/api-docs 200)
- [ ] `?g=` ẩn danh đúng tên
- [ ] CI xanh, plan được review trước khi merge
