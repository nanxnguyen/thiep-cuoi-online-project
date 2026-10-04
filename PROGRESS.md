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
**Gate:** `npm test` (257 test) + `npm run typecheck` + `npm run build:next`; e2e `npm run e2e -- --project=<tên>` (xem mục 5).

## ▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY

### ✅ Review + nâng cấp design 30 cover mới (2026-10-04, Claude Code)
Audit trùng: 9/30 family bị thay bằng mẫu mới từ `refs/` (`ink-wash`, `edge-invite`, `pennant`, `duotone-script`, `floral-monogram`, `octagon-frame`, `rose-cluster`, `overlap-rings`, `floating-card`); cả 30 cover viết lại (6 file CSS + 30 tsx, số SVG lượng giác làm tròn bằng `r2` để hết hydration mismatch). Kiểm chứng: typecheck sạch, 257/257 test, `build:next` xanh, sweep 60 trang (30 mẫu × 390/1280px) 0 lỗi console/tràn ngang/ảnh hỏng. Chưa chạy: e2e, Lighthouse. `process.md` đã khôi phục từ git (test `design-workflow-files` cần). Mẫu `nang-chieu`: ảnh có watermark, chủ dự án thay ảnh.

**Triển khai 30 mẫu mới XONG 12/12 + deep QA (catalog 50, chờ commit 1 lần):** lệnh commit duy nhất ở nhật ký Task 12 (chưa chạy). Gate cuối xanh (typecheck + 257 test + `build:next` + `git diff --check`); browser sweep + deep QA Studio/khách/zoom xanh. Chưa deploy; `CLAUDE.md` (mục One renderer) vẫn ghi kiến trúc cũ — chủ dự án quyết có sửa file hợp đồng này không (agent không tự sửa).

**Deep QA browser 2026-10-04 (ngoài sweep cuối phase):** Studio mở bằng edit key thật — outline 18 mục/BƯỚC n/18, toggle 4 section mới, StoryPanel thêm/xóa mốc (1↔2/6), VideoPanel báo lỗi link inline, DressCode color input `#1f3a5f` + nhãn, VenuePanel đọc đúng event tiệc; dialog Xuất bản liệt kê đúng video thiếu URL/poster; trang khách story-led render đủ 4 section VI + EN, zoom 200% 6/6 collection reps sạch. Phát hiện 1 lỗi hạ tầng: bucket `media` chặn MIME video + giới hạn 8 MiB → đã thêm migration `202610040001_media-video.sql` (chưa push, chung với các migration ở mục việc chờ). Thiệp QC (`5k2mb9cl`) đã unpublish (khách 404); còn 1 draft vô hình + 1 file poster rác — chủ dự án xoá tay trong Supabase dashboard khi rảnh.

**Git khác production.** Bản deploy 2026-10-04 build từ cây thư mục cũ; hiện có ~43 file thay đổi chưa commit, trong đó toàn bộ phase 30 mẫu mới (catalog 20→50, content v2, 4 section mới, video upload, 30 covers) vẫn nằm ở working tree. Lệnh commit duy nhất (không tách nhỏ): `git add lib components tests docs DESIGN.md Guide-convert-html-design-to-code.md PROGRESS.md && git commit -m "feat: complete fifty-template catalog with thirty new designs"` (loại `next-env.d.ts`, file này build tự sửa). Việc của chủ dự án: commit rồi mới build/deploy từ git, vì CI kéo từ git sẽ thiếu code mới.

**Việc đang chờ chủ dự án (theo mức rủi ro):**
1. **Bản quyền nhạc và ảnh.** 3 bài nhạc thương mại trong `music/` đã chép sang `public/music/` (chưa deploy, chưa commit). Ảnh `public/photos` nhiều tấm có logo studio/CapCut/Douyin; 6 bài blog (đã lên production) dùng nhóm ảnh không logo nhưng giấy phép chưa rõ. Quyết định: xin phép/mua license hoặc thay bằng nhạc/ảnh miễn phí bản quyền (nhạc: sửa `lib/music.ts` + file trong `public/music/`).
2. **Migration Supabase chưa chắc đã đẩy lên remote:** `202610030001_design-requests.sql` (chắc chắn chưa, nên form `/thiet-ke-thiep-rieng` đang lỗi khi gửi), `202609270001_account-analytics-donate.sql` (bảng `invitation_view_events`; ngày 2026-09-27 chưa đẩy, route `.../view` trả 500), `202609280001_security-abuse-controls.sql` (chưa xác minh) và `202610040001_media-video.sql` + `202610040002_invitation-tiers.sql` (mới 2026-10-04: bucket nhận video 50 MiB; cột `tier`/`expires_at` + cron ngày xoá thiệp hết hạn). Lệnh: `DEPLOY.md` mục 3 (`npx supabase db push --db-url ...`). Đổi gói tay sau khi push: `update public.invitations set tier = 'premium' where slug = '<slug>';` (trigger tự tính lại `expires_at`; `pro` = vĩnh viễn).
3. **Duyệt nội dung 6 bài blog** (`lib/blog/posts/*.ts`), đặc biệt phần phong tục và cách dùng tính năng.
4. **Google Search Console:** gửi lại sitemap, yêu cầu lập chỉ mục `/blog` và vài bài; các việc khác ở `docs/superpowers/plans/2026-10-01-seo-growth-plan.md`.
5. **Email liên hệ** (`NEXT_PUBLIC_CONTACT_EMAIL`, đang trống) và **rà soát pháp lý**: `/quyen-rieng-tu` còn dòng "Vì MỘC chưa có tài khoản…" trong khi đã có đăng nhập Google. Agent không tự sửa văn bản pháp lý.

**Việc kỹ thuật tiếp theo:**
- P7 mục g: quét 390px + gate cuối cho cả đợt design parity (chưa có ghi nhận kiểm chứng), rà nhanh `/templates/[id]`. (Riêng đợt 50 mẫu đã có browser sweep cuối phase: xem mục ▶, không thay thế P7 parity với `design/`.)
- Lighthouse mobile cho `/blog` và vài trang chính (Phase 2 còn 71–86 performance).
- SEO còn lại: copy/FAQ mở rộng ở 4 landing (cần chủ dự án duyệt), OG image mỗi mẫu, Rich Results Test trên domain thật.
- Dọn: gỡ dependency thừa `motion` và `embla-carousel-react` (không còn import); route auth mồ côi `register/login/forgot-password/resend-verification/reset-password` (không UI nào gọi); `docs/DEPLOY.md` còn nói Netlify; `design-parity-checklist.md` còn ghi các mục "blocked: Supabase" đã làm xong.
- **`CLAUDE.md` đã lỗi thời** (dòng "Migration is not started", "Legacy, still running today", gate có `./mvnw test`). Chủ dự án quyết định có sửa không; agent không tự sửa file hợp đồng này.

## Trạng thái các mảng gần đây

| Mảng | Trạng thái |
|---|---|
| Catalog 50 mẫu (30 mới) | **CODE XONG 12/12, CHƯA COMMIT, chưa deploy.** 20 mẫu A–O bất biến (snapshot khóa); 30 covers mới (`components/templates/covers/`, 6 collection) + content v2 (`upgradeV1`) + 4 section (Story/Video/DressCode/Venue) + video upload 50 MiB + Studio outline 18 mục. **Nguồn 30 mẫu mới:** ý tưởng rút ra từ việc phân tích 51 thư mục trong `refs/` — 21 thư mục `refs/chungdoi-com-vi-mau-thiep*` (1 trang catalog + 20 mẫu demo Chung Đôi) và 30 thư mục `refs/m-invite-com-template-preview-*` (30 mẫu M-Invite) — nhưng toàn bộ ornament/CSS do đội tự vẽ (`original`), ảnh mẫu tái dùng ảnh `public/photos/` có sẵn — không copy nguyên mẫu, branding, ảnh hay họa tiết nào từ website tham khảo (chi tiết từng family ở `docs/design/template-asset-audit.md`). Spec: `docs/superpowers/specs/2026-10-04-thirty-new-templates-design.md`, plan 12 task: `docs/superpowers/plans/2026-10-04-thirty-new-templates-plan.md`. Quy ước đang áp dụng: profile chỉ govern `<main>`; browser QA dồn 1 lần cuối phase (đã sweep xong, evidence `.playwright-mcp/qa-50-*.webp`). Việc tiếp theo: chạy lệnh commit ở mục ▶ rồi deploy theo `DEPLOY.md` mục 4c. |
| Blog `/blog` + 6 bài | **XONG, đã deploy.** Nội dung là dữ liệu TS (`lib/blog/posts/*.ts`, không MDX), render bằng `components/blog/*`, link "Blog cưới" ở cột "Khám phá" của footer. Thêm bài = 1 file trong `lib/blog/posts/` + import ở `lib/blog/index.ts`. `design/` không có mockup blog nên dựng từ token + primitive `mk-*` (ghi ở `DESIGN.md`). Chưa Lighthouse. |
| Nhạc có sẵn | **Code xong, chưa deploy** (rủi ro bản quyền ở trên). `lib/music.ts` (`MUSIC_LIBRARY`), `contentSchema` nhận link https hoặc đúng đường dẫn `/music/<bài>.mp3`, Studio có mục "Nhạc có sẵn" trong `MediaPanel`. |
| Trang thiết kế riêng `/thiet-ke-thiep-rieng` | **Code đã deploy, backend chưa chạy được** (thiếu migration). Form → `POST /api/public/design-requests` → bảng `design_requests` (xem đơn ở Supabase dashboard). |
| Hiện tên Google thay email | **XONG, đã nằm trong bản deploy 2026-10-04** (chưa kiểm tra trên production vì cần đăng nhập Google thật): `lib/server/auth.ts` lấy `full_name`/`name`, header và `/account` hiện `name ?? email`; tài khoản không có tên vẫn hiện email. |
| E2E flow tạo thiệp | **XONG.** 14 test, API mock hoàn toàn (không chạm Supabase thật). Pass trên chrome, edge, mobile-chrome, coccoc-emulated, safari, mobile-safari, tablet-safari. Chưa chạy firefox và Cốc Cốc thật. Sau phase 50 mẫu (2026-10-04): chrome 26 + mobile-chrome 25 + mobile-safari 24 pass (mỗi project 1 skip có sẵn). |
| Script cào tham khảo | `scripts/scrape-invitation.mjs` (`npm run scrape:ref`, chụp/trích font-màu-section của trang thiệp mẫu vào `refs/`, tôn trọng robots.txt) và `scripts/scrape-couple-photos.mjs` (`npm run scrape:couples`, do chủ dự án thêm, chưa rà). `refs/` và ảnh cào nằm ngoài git; **chỉ để tham khảo, không copy ảnh/hoạ tiết** (bản quyền). |
| Bugfix ngày cưới trên iPhone | **XONG** (2026-10-03): tạo thiệp chuẩn hoá ngày sang ISO và chặn ngày rỗng/không tồn tại. |
| SEO | Bước 1–2 xong: `lib/seo.ts`, JSON-LD (`lib/jsonld.ts`), sitemap, manifest, `tests/seo.test.ts`. Phạm vi "không blog" ngày 2026-10-01 đã được chủ dự án thay bằng blog (2026-10-04). Plan: `docs/superpowers/plans/2026-10-01-seo-pages-plan.md`, `2026-10-01-seo-growth-plan.md`. |
| Turnstile | **Đã gỡ** (2026-09-30, lý do và cách bật lại ở `docs/security/incident-runbook.md`); code xoá trong commit `c61368c`. `.env.local` của chủ dự án còn biến `NEXT_PUBLIC_TURNSTILE_SITE_KEY` thừa, nên xoá khi build Cloudflare (env shell bị snapshot vào bundle). |

## P7 Design parity (chủ dự án yêu cầu 2026-09-27): trang phải giống `design/*.dc.html` 100%

- **Đã khớp (1280):** header/footer, token, font fallback, `ScrollReveal`, lớp motion (`components/site/Motion.tsx`), `/`, `/bang-gia`, `/ung-ho`, `/tro-giup`, `/dieu-khoan`, `/quyen-rieng-tu`, 4 landing SEO, `/cong-cu-dam-cuoi`, 6 `/cong-cu/*`, `/templates` (50 mẫu: 20 cũ A–O bất biến + 30 mới, popup "Xem thử"), `/demo`, nhánh auth (popup đăng nhập Google, `/account`), renderer thiệp + cổng phong bì + bìa `ThiepPreview`, Editor v3 (outline 18 mục, "BƯỚC n / 18", công tắc bật/tắt từng phần, bottom sheet dưới 1024px).
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

- **2026-10-04 Hydration overlay (không phải bug code, đã xác minh 2 lần):** SSR <html> class font byte-identical qua 2 lần restart dev (trùng luôn hash phía server trong ảnh user); SaveTheDateTool chỉ đọc biến font, không tạo loader thứ hai. Kết luận: tab browser giữ JS/CSS cũ từ trước đợt Claude Code viết lại covers (overlay ghi (stale)). Đã xoá disk cache .next/dev, verify 7 route sạch — user chỉ cần hard reload tab (Cmd+Shift+R). Kèm fix 4 input thiếu name (q, brideName/groomName/editLink). Kiểm chứng: 257/257 test, typecheck sạch, build:next xanh.
- **2026-10-04 Gói thiệp + cron xoá hết hạn (chưa push):** migration `202610040002_invitation-tiers.sql` — cột `tier` (free 7 ngày / plus 30 ngày mặc định / premium 1 năm / pro vĩnh viễn) + `expires_at` (trigger tự tính khi tạo/đổi gói; thiệp cũ được grace 30 ngày từ lúc push) + cron pg_cron hằng ngày `purge-expired-invitations` xoá cứng row quá hạn và unlink file `media/<id>/*` (file vật lý cần vacuum tay, xem comment trong migration). pgTAP `supabase/tests/backend.sql` lên plan(44) với 8 test tier/purge. Kiểm chứng: node suite 257/257 + typecheck sạch (DB test chưa chạy được local vì không có Docker — chạy `npm run db:test` hoặc CI sau khi push).
- **2026-10-04 Task 12/12 (catalog 50, DONE):** final integration — rà literal count (seo `/templates` → 50 mẫu; marketing còn lại đã dynamic), `DESIGN.md` + Guide map + PROGRESS cập nhật 50 mẫu/18 mục, sitemap/route-inventory dynamic đủ 50 route, audit cuối (không file nào dưới `public/templates/`, manifest rỗng hợp lệ), premium audit strict 2 lỗi ngoài phạm vi (form `/templates`, scrollbar `tro-giup`, cả hai có sẵn trước phase), gate cuối + e2e 3 project + browser sweep xanh, evidence `.playwright-mcp/qa-50-*.webp`. Lệnh commit duy nhất:
  `git add lib components tests docs DESIGN.md Guide-convert-html-design-to-code.md PROGRESS.md && git commit -m "feat: complete fifty-template catalog with thirty new designs"`
- **2026-10-04 Task 11/12 (catalog 45→50):** Đợt 6 Đương đại — 5 covers expressive (kinetic-type 1 lần, color-block phẳng, chibi vẽ riêng, paper-cut 3 lớp, constellation từ ngày thật) + test reduced-motion scan, `expressive.css`. Kiểm chứng: full suite 257/257, typecheck sạch, `build:next` xanh.
- **2026-10-04 Task 10/12 (catalog 40→45):** Đợt 5 Kỷ vật — 5 covers story-led (journal, route 3 điểm, menu quán, lịch tháng thật, album nghiêng), `story.css`. Kiểm chứng: full suite 256/256, typecheck sạch, `build:next` xanh.
- **2026-10-04 Task 9/12 (catalog 35→40):** Đợt 4 Quiet luxury — 5 covers (letterpress + monogram, khung nhung, line vàng, vòm ngọc, vân đá), `quiet-luxury.css`, không gradient/trang trí dày. Kiểm chứng: full suite 256/256, typecheck sạch, `build:next` xanh.
- **2026-10-04 Task 8/12 (catalog 30→35):** Đợt 3 Editorial — 5 covers photo-led (full-bleed, contact sheet mono, split 40/60, collage chữ tay, fashion grid), ảnh thiếu fallback slot trống, `editorial.css`. Kiểm chứng: full suite 256/256, typecheck sạch, `build:next` xanh.
- **2026-10-04 Task 7/12 (catalog 25→30):** Đợt 2 Vườn hoa — 5 covers theo brief (vòm kính, cành lan, herbarium, line-art venue, hoa đêm nền tối), `garden.css`, meta + registry + samples + SEO. Kiểm chứng: full suite 256/256, typecheck sạch, `build:next` xanh.
- **2026-10-04 Task 6/12 (catalog 20→25):** cover infra + Đợt 1 Di sản Việt — `lib/covers.ts` (meta thuần, `splitCoverDate`), `covers/{types,slot,index}` + `heritage.css`, 5 covers theo brief (mỗi mẫu 1 signature, ornaments original inline, reduced-motion, tên dài wrap). Kiểm chứng: test đích 22/22, full suite 256/256, typecheck sạch, `build:next` xanh.
- **2026-10-04 Task 5/12 (30 mẫu mới):** shared sections (Story 3 variant, Video native controls + fallback link, DressCode swatch kèm nhãn, Venue từ event tiệc qua `lib/maps`) + profile-driven renderer (envelope/shell giữ nguyên, `<main>` map theo profile). Kiểm chứng: test đích 16/16, full suite 252/252, typecheck sạch, `build:next` xanh.
- **2026-10-04 Task 4/12 (30 mẫu mới):** Studio editors — StoryPanel (6 mốc, add/move/remove + upload ảnh, keyboard), VideoPanel (upload/link MP4-WebM + poster, không autoplay), DressCodePanel (5 swatch kèm nhãn), VenuePanel (ảnh/đường đi/đỗ xe trên event tiệc). Kiểm chứng: test đích 7/7, full suite 250/250, typecheck sạch, `build:next` xanh.
- **2026-10-04 Task 3/12 (30 mẫu mới):** video upload — MP4/WebM qua magic bytes (không tin `File.type`), tối đa 50 MiB cả server/client/route, uploader dùng chung primitive. Kiểm chứng: test đích 22/22, full suite 249/249, typecheck sạch, `build:next` xanh.
- **2026-10-04 Task 2/12 (30 mẫu mới):** content v2 tương thích v1 — story (≤6 item), video (URL/poster https ≤500 ký tự), dressCode (≤5 màu hex), event thêm venuePhoto/directionsNote/parkingNote, sections thêm 4 toggle (mặc định tắt), `normalizeContent` mirror toggle, publishIssues và persistable mở rộng. Kiểm chứng: test đích 16/16, full suite 247/247, typecheck sạch.
- **2026-10-04 Task 1/12 (30 mẫu mới):** profile/asset foundation — 7 profile + resolver, manifest rỗng an toàn, audit doc, snapshot khóa 20 hàng registry, `profile: "default"` cho 20 mẫu. Kiểm chứng: test đích 21/21, full suite 242/242, typecheck sạch, `build:next` xanh, catalog vẫn 20.
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
