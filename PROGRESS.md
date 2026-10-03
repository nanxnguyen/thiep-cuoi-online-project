# PROGRESS: tiến độ MỘC Wedding

> **Cách dùng file này (mọi agent):** đọc mục ▶ trước khi động vào code. **Sau mỗi bước có ý nghĩa** (xong task/section/trang, sửa bug, đổi hướng, gặp blocker):
> 1. sửa bảng trạng thái;
> 2. thêm **1 dòng** vào Nhật ký, có ngày, việc đã làm và cách kiểm chứng;
> 3. sửa mục ▶ cho đúng việc tiếp theo.
>
> **Dòng nào lỗi thời thì xoá hoặc sửa, không viết chồng.** Nhật ký chỉ giữ ~15 dòng mới nhất; chi tiết cũ nằm ở git history và plan/spec trong `docs/superpowers/`. Không ghi "xong" nếu chưa kiểm chứng.

**Stack hiện tại:** một repo Next.js 16 + Supabase (Postgres/Auth/Storage/Realtime/Edge Function), không còn backend Java. Repo `../Thiep-cuoi-online-backend` là bản Spring Boot cũ, **không dùng và không phát triển thêm**.
**Production:** Cloudflare Workers, `https://taothiepcuoi.raystudio.com.vn` (bản gần nhất 2026-10-04, version `e0f3ebe1`; cách deploy ở `DEPLOY.md` mục 4c). Vercel và Netlify chỉ là đích dự phòng trong `DEPLOY.md`.
**Cổng:** `npm run dev` 3000; `next start` tay 3001; Playwright e2e tự dựng server ở 3100. Chạy local: `README.md`.
**Gate:** `npm test` (227 test) + `npm run typecheck` + `npm run build:next`; e2e `npm run e2e -- --project=<tên>` (xem mục 5).

## ▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY

**Đang chờ duyệt implementation plan 30 mẫu mới:** spec Hybrid đã được duyệt và `docs/superpowers/plans/2026-10-04-thirty-new-templates-plan.md` đã được viết lại thành 12 task. Chủ dự án chốt 20 mẫu hiện tại là baseline bất biến, chỉ thêm 30 mẫu mới để đạt 50. Sau khi chủ dự án xác nhận plan và chọn cách thực thi, bắt đầu Task 1 (asset gate + section-profile foundation); chưa triển khai code/template trước cổng duyệt này.

**Git khác production.** Bản deploy 2026-10-04 build từ cây thư mục hiện tại, còn ~61 file chưa commit (SEO metadata các trang, `lib/seo.ts`/`lib/jsonld.ts`, trang thiết kế riêng, nhạc có sẵn, hiện tên Google, script cào tham khảo, `wrangler.jsonc` thêm `NEXT_PUBLIC_CONTACT_ZALO`). Commit gần nhất: `4737863` (e2e), `c61368c` (blog). Việc của chủ dự án: rà `git status` và commit trước khi ai build từ git, vì `MarketingLayout` đã sửa mà `PageJsonLd.tsx`/`manifest.ts` còn untracked thì CI kéo từ git sẽ không build được.

**Việc đang chờ chủ dự án (theo mức rủi ro):**
1. **Bản quyền nhạc và ảnh.** 3 bài nhạc thương mại trong `music/` đã chép sang `public/music/` (chưa deploy, chưa commit). Ảnh `public/photos` nhiều tấm có logo studio/CapCut/Douyin; 6 bài blog (đã lên production) dùng nhóm ảnh không logo nhưng giấy phép chưa rõ. Quyết định: xin phép/mua license hoặc thay bằng nhạc/ảnh miễn phí bản quyền (nhạc: sửa `lib/music.ts` + file trong `public/music/`).
2. **Migration Supabase chưa chắc đã đẩy lên remote:** `202610030001_design-requests.sql` (chắc chắn chưa, nên form `/thiet-ke-thiep-rieng` đang lỗi khi gửi), `202609270001_account-analytics-donate.sql` (bảng `invitation_view_events`; ngày 2026-09-27 chưa đẩy, route `.../view` trả 500) và `202609280001_security-abuse-controls.sql` (chưa xác minh). Lệnh: `DEPLOY.md` mục 3 (`npx supabase db push --db-url ...`).
3. **Duyệt nội dung 6 bài blog** (`lib/blog/posts/*.ts`), đặc biệt phần phong tục và cách dùng tính năng.
4. **Google Search Console:** gửi lại sitemap, yêu cầu lập chỉ mục `/blog` và vài bài; các việc khác ở `docs/superpowers/plans/2026-10-01-seo-growth-plan.md`.
5. **Email liên hệ** (`NEXT_PUBLIC_CONTACT_EMAIL`, đang trống) và **rà soát pháp lý**: `/quyen-rieng-tu` còn dòng "Vì MỘC chưa có tài khoản…" trong khi đã có đăng nhập Google. Agent không tự sửa văn bản pháp lý.

**Việc kỹ thuật tiếp theo:**
- P7 mục g: quét 390px + gate cuối cho cả đợt design parity (chưa có ghi nhận kiểm chứng), rà nhanh `/templates/[id]`.
- Lighthouse mobile cho `/blog` và vài trang chính (Phase 2 còn 71–86 performance).
- SEO còn lại: copy/FAQ mở rộng ở 4 landing (cần chủ dự án duyệt), OG image mỗi mẫu, Rich Results Test trên domain thật.
- Dọn: gỡ dependency thừa `motion` và `embla-carousel-react` (không còn import); route auth mồ côi `register/login/forgot-password/resend-verification/reset-password` (không UI nào gọi); `docs/DEPLOY.md` còn nói Netlify; `design-parity-checklist.md` còn ghi các mục "blocked: Supabase" đã làm xong.
- **`CLAUDE.md` đã lỗi thời** (dòng "Migration is not started", "Legacy, still running today", gate có `./mvnw test`). Chủ dự án quyết định có sửa không; agent không tự sửa file hợp đồng này.

## Trạng thái các mảng gần đây

| Mảng | Trạng thái |
|---|---|
| Blog `/blog` + 6 bài | **XONG, đã deploy.** Nội dung là dữ liệu TS (`lib/blog/posts/*.ts`, không MDX), render bằng `components/blog/*`, link "Blog cưới" ở cột "Khám phá" của footer. Thêm bài = 1 file trong `lib/blog/posts/` + import ở `lib/blog/index.ts`. `design/` không có mockup blog nên dựng từ token + primitive `mk-*` (ghi ở `DESIGN.md`). Chưa Lighthouse. |
| Nhạc có sẵn | **Code xong, chưa deploy** (rủi ro bản quyền ở trên). `lib/music.ts` (`MUSIC_LIBRARY`), `contentSchema` nhận link https hoặc đúng đường dẫn `/music/<bài>.mp3`, Studio có mục "Nhạc có sẵn" trong `MediaPanel`. |
| Trang thiết kế riêng `/thiet-ke-thiep-rieng` | **Code đã deploy, backend chưa chạy được** (thiếu migration). Form → `POST /api/public/design-requests` → bảng `design_requests` (xem đơn ở Supabase dashboard). |
| Hiện tên Google thay email | **XONG, đã nằm trong bản deploy 2026-10-04** (chưa kiểm tra trên production vì cần đăng nhập Google thật): `lib/server/auth.ts` lấy `full_name`/`name`, header và `/account` hiện `name ?? email`; tài khoản không có tên vẫn hiện email. |
| E2E flow tạo thiệp | **XONG.** 14 test, API mock hoàn toàn (không chạm Supabase thật). Pass trên chrome, edge, mobile-chrome, coccoc-emulated, safari, mobile-safari, tablet-safari. Chưa chạy firefox và Cốc Cốc thật. |
| Script cào tham khảo | `scripts/scrape-invitation.mjs` (`npm run scrape:ref`, chụp/trích font-màu-section của trang thiệp mẫu vào `refs/`, tôn trọng robots.txt) và `scripts/scrape-couple-photos.mjs` (`npm run scrape:couples`, do chủ dự án thêm, chưa rà). `refs/` và ảnh cào nằm ngoài git; **chỉ để tham khảo, không copy ảnh/hoạ tiết** (bản quyền). |
| Bugfix ngày cưới trên iPhone | **XONG** (2026-10-03): tạo thiệp chuẩn hoá ngày sang ISO và chặn ngày rỗng/không tồn tại. |
| SEO | Bước 1–2 xong: `lib/seo.ts`, JSON-LD (`lib/jsonld.ts`), sitemap, manifest, `tests/seo.test.ts`. Phạm vi "không blog" ngày 2026-10-01 đã được chủ dự án thay bằng blog (2026-10-04). Plan: `docs/superpowers/plans/2026-10-01-seo-pages-plan.md`, `2026-10-01-seo-growth-plan.md`. |
| Turnstile | **Đã gỡ** (2026-09-30, lý do và cách bật lại ở `docs/security/incident-runbook.md`); code xoá trong commit `c61368c`. `.env.local` của chủ dự án còn biến `NEXT_PUBLIC_TURNSTILE_SITE_KEY` thừa, nên xoá khi build Cloudflare (env shell bị snapshot vào bundle). |

## P7 Design parity (chủ dự án yêu cầu 2026-09-27): trang phải giống `design/*.dc.html` 100%

- **Đã khớp (1280):** header/footer, token, font fallback, `ScrollReveal`, lớp motion (`components/site/Motion.tsx`), `/`, `/bang-gia`, `/ung-ho`, `/tro-giup`, `/dieu-khoan`, `/quyen-rieng-tu`, 4 landing SEO, `/cong-cu-dam-cuoi`, 6 `/cong-cu/*`, `/templates` (20 mẫu, kiểu bìa A–O, popup "Xem thử"), `/demo`, nhánh auth (popup đăng nhập Google, `/account`), renderer thiệp + cổng phong bì + bìa `ThiepPreview`, Editor v3 (outline 14 mục, "BƯỚC n / 14", công tắc bật/tắt từng phần, bottom sheet dưới 1024px).
- **Chưa ghi nhận kiểm chứng:** mục g ở trên và `/templates/[id]`.
- **Cách so:** serve `design/` (`python3 -m http.server 4100` trong `design/`) + `next dev` 3000; Chrome DevTools MCP chạy extractor computed style trên cả hai trang, lưu JSON vào `.playwright-mcp/parity/`, diff offline.
- **Giữ khác design có chủ đích:** link khách là `?g=<token>` (README design ghi `?to=`); auth Supabase Google; QR bằng `lib/tools/qr`; gợi ý lời cảm ơn xoay 3 mẫu (không gọi AI); Q&A trợ giúp, văn bản pháp lý và copy "offline"/"không rời máy" ở hub công cụ theo sự thật sản phẩm; header dưới 760px dùng menu; bỏ SEO copy/liên quan ở 4 landing vì design không có; `design/` chỉ đọc. Ảnh mẫu `public/photos` chỉ dùng ở trang giới thiệu/xem thử/blog; thiệp thật (trang khách + xem trước Editor) để khung trống.

## 0. Stack: Next.js + Supabase (chốt 2026-09-26, đã làm xong)

Spec `docs/superpowers/specs/2026-09-26-supabase-migration-design.md`, plan `docs/superpowers/plans/2026-09-26-supabase-migration.md` (Task 1–9 xong, remote cutover và E2E remote 16/16 xong 2026-09-26; thiệp demo `ho6my9vg`). Hardening bảo mật: `docs/superpowers/plans/2026-09-28-nextjs-supabase-security-hardening.md`, runbook ở `docs/security/`.

- **Quyết định đang áp dụng:** chỉ đăng nhập Google (bỏ email/mật khẩu 2026-09-27); giữ edit key `#k=` (không cần tài khoản để tạo/sửa thiệp); link khách `?g=<token>` (tên resolve từ DB, không gắn tên trên URL); public write đi qua Next Route Handler rồi Supabase Edge Function; RLS không cho browser ghi trực tiếp; service-role key chỉ ở server; `lib/api.ts` là seam duy nhất giữa UI và API.
- **Supabase:** project ref `iehmucsshklgjmxqyggp`. Key mới: `NEXT_PUBLIC_SUPABASE_ANON_KEY` = publishable (`sb_publishable_...`), `SUPABASE_SERVICE_ROLE_KEY` = secret (chỉ server). Secret tự tạo `EDGE_SHARED_SECRET` và `RATE_LIMIT_HMAC_SECRET`; tên `SUPABASE_EDGE_SHARED_SECRET` bị CLI từ chối vì tiền tố `SUPABASE_`. Không ghi giá trị secret vào file.
- **Migration có trong repo:** `202609260001_backend.sql` (5 bảng + RLS + Storage + Realtime + rate limit), `202609270001_account-analytics-donate.sql`, `202609280001_security-abuse-controls.sql`, `202610030001_design-requests.sql`. Supabase chưa có down-migration: sửa bằng migration mới.
- **Edge Function** `public-write`: `npx supabase functions deploy public-write`; bucket `media` public; Auth tắt confirm email (`mailer_autoconfirm: true`).
- **Donate:** `/ung-ho` có QR VietQR; webhook `app/api/webhooks/[provider]` (casso/sepay) đã có, cần `CASSO_WEBHOOK_SECRET`/`SEPAY_WEBHOOK_SECRET` nếu bật.
- **Còn lại:** xác minh migration trên remote (mục ▶); sau đó bỏ phần BE Java khỏi README/CLAUDE.md nếu còn.

## 1. Trạng thái các phase gốc

### Chuyển design → app (plan 2026-09-26-design-system-core)

| Phase | Nội dung | Trạng thái |
|---|---|---|
| P1 | Design system core: `app/styles/tokens.css`, `motion.css`, font script/hand, primitives, guard test | **XONG** (2026-09-26) |
| P2 | Hex rời → token | **XONG**: 0 hex ngoài `tokens.css` (test `tests/design-system.test.ts` giữ) |
| P3 | Port từng trang | **XONG port**; nghiệm thu theo P7 |
| P4 | Studio Editor v3 | **XONG** layout và các trường (`rank`, `arrivalTime`, bật/tắt phần, bố cục album, lịch trình, phong bì) trong `contentSchema` |
| P5 | Trang khách theo `Thiep Khach` | **XONG** |
| P6 | Nghiệm thu cuối | Checklist `docs/superpowers/specs/2026-09-26-design-parity-checklist.md` (một số dòng "blocked" đã lỗi thời) + e2e tạo thiệp; còn quét thủ công trang khách và editor trên Supabase thật |

### Sản phẩm

| Phase | Nội dung | Xong | Còn lại |
|---|---|---|---|
| 1 | Lõi thiệp: mẫu, Studio, trang khách, RSVP, lời chúc, QR mừng cưới, bản đồ, đếm ngược, nhạc, album | ~93%, **đã deploy production** (T28 xong) | Xác minh migration remote; e2e trang khách với dữ liệu thật |
| 2 | Marketing: home, templates, trợ giúp, blog, giá, pháp lý | ~92% | Lighthouse mobile (71–86); email liên hệ; rà soát pháp lý |
| 3 | Guest manager: nhóm/bàn, link `?g=`, thống kê RSVP | ~95% | Quyết định chủ dự án (gửi hàng loạt SMS/Zalo, giới hạn số khách) |
| 4 | 6 công cụ miễn phí `/cong-cu/*` (tạo QR, nén ảnh, nén video, tin nhắn mời, danh sách khách, save the date; sơ đồ chỗ ngồi đã gỡ) | ~100% | Câu hỏi mở ở spec mục 9 |
| 5 | Song ngữ vi/en (`?lang=`) | 100% | QA trên URL production |
| 6 | Tài khoản Google + claim thiệp + Donate | Xong | QA trình duyệt `/ung-ho` |

## 2. Quyết định mặc định đang áp dụng cho design (chủ dự án có thể đổi)

- Giữ `/blog`, chỉ dùng token và primitive DS.
- Duyệt lưu bút là phase riêng (đã có moderation approved/hidden ở tab Phản hồi).
- Nhạc: chọn bài có sẵn, tải MP3 (≤ 8 MB) hoặc dán link https; không nhận link YouTube.
- Gợi ý lời cảm ơn xoay vòng 3 mẫu có sẵn, không gọi AI.
- Dùng Great Vibes cho `--hand`.
- Không làm route riêng cho "Thiệp mẫu đầy đủ" (là Editor v3 ở chế độ "Xem như khách").
- Token dùng đúng hex design (`--faint #8a7d72`, `--on-dark-faint #7d7067`); không lệch màu để đạt AA.

## 3. Cần từ chủ dự án

Danh sách việc ưu tiên nằm ở mục ▶. Còn lại:
- **Quyết định sản phẩm:** gửi hàng loạt SMS/Zalo cho khách, giới hạn số khách, có bật dòng "Tạo bằng MỘC" trên thiệp khách hay không.
- **Ai đăng bài ngoài** (Facebook, TikTok, diễn đàn) theo `2026-10-01-seo-growth-plan.md`; agent chỉ soạn nội dung.
- **Repo Java cũ** `../Thiep-cuoi-online-backend` còn code Phase 6A chưa commit; chỉ cần nếu muốn giữ làm tham chiếu (`git -C ../Thiep-cuoi-online-backend add -A && git commit`).

## 4. Nhật ký (mới nhất ở trên, giữ ~15 dòng)

- **2026-10-04 Chốt phạm vi 20 → 50:** 20 mẫu hiện tại không sửa; spec/plan bổ sung invariant đóng băng registry, cover/thumbnail, thứ tự section và visual mặc định, cùng baseline regression trước khi thêm 30 mẫu mới.
- **2026-10-04 Plan 30 mẫu mới:** viết lại plan cover-only thành 12 task TDD: asset/profile foundation, content v2, video upload, bốn Studio/editor section, profile-driven renderer, 6 batch × 5 mẫu và release gate. Kiểm chứng: đủ 30 family trùng spec, 12 task, không placeholder, `git diff --check` sạch.
- **2026-10-04 Spec 30 mẫu mới:** kiểm kê 51 snapshot trong `refs/` và 20 mẫu hiện có; thay thiết kế cover-only bằng kiến trúc Hybrid, chốt 30 concept/6 collection, section profile, bốn section mới và asset audit. Kiểm chứng: 30 family slug duy nhất, không placeholder, `git diff --check` sạch sau khi sửa.
- **2026-10-04 Rà soát PROGRESS.md:** bỏ handoff "Bước A/B" (BE Java + H2, `/tinh-nang`, số test cũ), các blocker Netlify/tên miền (đã chạy Cloudflare + domain thật), mục migration "TIẾP THEO" (đã làm); thêm production, git≠production, migration chưa xác minh, Turnstile đã gỡ, scraper, hiện tên Google, `CLAUDE.md` lỗi thời. Kiểm chứng: đối chiếu với `git log/status`, `app/`, `supabase/migrations`, `package.json`, `wrangler.jsonc`, docs.
- **2026-10-04 Deploy Cloudflare Workers** (`e0f3ebe1`): gate xanh (test 224/224, tsc, diff-check), build với `NEXT_PUBLIC_SITE_URL` chính thức, smoke test trên workers.dev và domain chính (`/`, `/blog`, bài, sitemap 7 URL blog, 404 slug sai, ảnh `/_next/image`). Bản chứa trang thiết kế riêng nhưng form lỗi do thiếu migration.
- **2026-10-04 E2E tạo thiệp:** `playwright.config.ts`, `e2e/create-invitation.spec.ts` (14 test), `e2e/support/mock-api.ts`. 14/14 trên 7 project; WebKit desktop trên macOS tự abort khi gõ trong editor (NSTextInputContext), test dùng `setText` qua DOM cho nhánh đó.
- **2026-10-04 Nhạc có sẵn (code, chưa deploy):** `lib/music.ts`, `public/music/*`, schema + `MediaPanel`; test 227/227 (file tồn tại, header MP3, ≤ 8 MB, schema từ chối `/music/../x`). Chưa kiểm tra trên trình duyệt vì Studio cần tạo thiệp thật.
- **2026-10-04 Hiện tên Google:** `AccountUser.name`, `userDto`, header và `/account`; test `auth-routes` cập nhật (đã vào bản deploy cùng ngày, chưa thử trên production).
- **2026-10-04 Blog (code + deploy):** 6 bài, `blogPosting` JSON-LD, sitemap, route-inventory, footer. Kiểm chứng: test 224/224, `next build` sạch, curl (1 h1, title ≤ 60, canonical, JSON-LD, sitemap, 404), DevTools 1280 + 390 không tràn ngang, 0 ảnh hỏng, 0 lỗi console.
- **2026-10-04 Script cào tham khảo:** `scripts/scrape-invitation.mjs` (`--crawl`, `--suffix`, `--limit`; tự bấm "Mở thiệp"; bỏ qua mẫu đã chụp); thử trên 3 trang, ra cover/mobile/desktop/page.html/tokens.json.
- **2026-10-03 Trang thiết kế riêng (code):** `app/thiet-ke-thiep-rieng/`, `DesignRequestForm`, `lib/design-request.ts`, route + migration `design_requests`; 214 test, build OK, 390px không tràn ngang.
- **2026-10-03 Fix ngày không hợp lệ trên iPhone 14:** `StudioHome` chuẩn hoá `DD/MM/YYYY`/`YYYY-MM-DD` thành ISO, chặn ngày không tồn tại; test hồi quy.
- **2026-10-01 SEO bước 2 (JSON-LD):** `lib/jsonld.ts` + `PageJsonLd` (BreadcrumbList 15 trang, ItemList, WebApplication cho tool, FAQPage ở `/tro-giup` và `/templates`). Không thêm FAQPage cho 4 landing vì chưa có FAQ hiển thị.
- **2026-10-01 SEO bước 1:** `lib/seo.ts` (title/description/lastmod), canonical + OG, sitemap `lastModified` cố định, `manifest.ts`, `tests/seo.test.ts`.
- **2026-09-30 Gỡ Turnstile** khỏi RSVP/lời chúc (làm hỏng khách thật); bảo vệ còn lại: honeypot, rate limit theo fingerprint, kiểm tra same-origin, duyệt lưu bút.
- **2026-09-27 P7 parity:** registry 20 mẫu + kiểu K–O, renderer thiệp và cổng phong bì viết lại theo `Studio Editor v3`/`Thiep Khach`, `/templates` + popup "Xem thử", header/footer, lớp motion, nhánh auth Google-only; bỏ `?to=` thủ công; pentest P0 local 23/23.
- **2026-09-26→27 Migration Supabase:** Task 1–9 xong (auth cookie, invitation CRUD + edit key, public read, guests, RSVP/wish qua Edge, moderation, Storage, Editor v3 contract), remote cutover và E2E remote 16/16, Swagger `/docs`. Chi tiết: git history và plan.
- **2026-09-21→25** Phase 1–6A trên BE Java cũ: tham khảo git history, không phát triển thêm.

## 5. Lưu ý kỹ thuật

- `next/font`: mỗi loader là `const` cấp module, option phải literal, biến font đặt trên `<html>`.
- `node --test` chỉ nhận TypeScript "erasable": không enum, không parameter properties; file trong `lib/` mà test import phải dùng import tương đối có đuôi `.ts` (không `@/`).
- **Deploy Cloudflare:** `NEXT_PUBLIC_SITE_URL=https://taothiepcuoi.raystudio.com.vn npm run build` rồi `npx wrangler deploy`. Build snapshot toàn bộ env vào `.open-next/cloudflare/next-env.mjs` (có service-role key, chạy server-side; kiểm tra không lọt biến lạ như `VERCEL_*`). `rm -rf` bị hook chặn: bản build tự dọn `.open-next`, không cần xoá tay. Netlify dùng `npm run build:next`.
- **E2E:** `npm run build:next && npm run e2e -- --project=chrome` (project: chrome, edge, safari, firefox, coccoc, mobile-safari, mobile-chrome, tablet-safari). WebKit cài bằng `npx playwright install webkit` (đã cài), Firefox chưa. Chạy từng project một, `workers: 1`. Test mock mọi `/api/**` và fail nếu có call chưa mock, vì build trỏ vào Supabase thật.
- **Trang bị header `X-Frame-Options`:** không nhúng iframe cùng origin để quét nhiều route trong DevTools (`contentDocument` rỗng); điều hướng từng route. Chụp màn hình trong Chrome DevTools MCP cần `select_page` với `bringToFront` trước, nếu không sẽ timeout; `emulate` mới đổi được viewport (resize cửa sổ không đổi `innerWidth`).
- Trang có `Motion.tsx`/`ScrollReveal` ẩn phần dưới màn hình tới khi cuộn: khi chụp so sánh phải cuộn chậm hết trang (cuộn quá nhanh bỏ sót reveal). Nội dung vẫn có trong view-source cho crawler.
- `next start` báo không hợp với `output: standalone` nhưng vẫn chạy cho mục đích test cục bộ.
- Kiểm tra mobile bằng `emulate` viewport `390x844x2,mobile,touch`.
- `codegraph serve` rò rỉ có thể gây `ENFILE`. Kiểm `sysctl kern.num_files kern.maxfiles`, hỏi chủ dự án trước khi kill.
- Agent không tự `git commit` (hook chặn): đưa lệnh cho chủ dự án.

## 6. Ý tưởng tương lai (chưa chốt)

- Video thiệp; giới hạn video ≤ 200MB.
- Khoá sửa danh sách khách sau khi publish; giới hạn số khách (500–1000).
- Gửi link hàng loạt qua SMS/Zalo/email.
- Nút xoá thiệp trong Studio (API `DELETE /api/invitations/:id` đã có).
- Công cụ thứ 7 (widget đếm ngược hoặc lời cảm ơn sau cưới).
- Trang public cho save-the-date.
- `/lien-he`, RSS blog.
- Thêm bài blog; OG image mỗi bài/mẫu.
