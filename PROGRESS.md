# PROGRESS: tiến độ MỘC Wedding

> **Cách dùng file này (mọi agent):** đọc mục ▶ trước khi động vào code. **Sau mỗi bước có ý nghĩa** (xong task/section/trang, sửa bug, đổi hướng, gặp blocker):
> 1. sửa bảng trạng thái;
> 2. thêm **1 dòng** vào Nhật ký, có ngày, việc đã làm và cách kiểm chứng;
> 3. sửa mục ▶ cho đúng việc tiếp theo.
>
> **Dòng nào lỗi thời thì xoá hoặc sửa, không viết chồng.** Nhật ký chỉ giữ ~15 dòng mới nhất; chi tiết cũ nằm ở git history và plan/spec trong `docs/superpowers/`. Không ghi "xong" nếu chưa kiểm chứng.

Repo FE: thư mục này (`main`). Repo BE: `../Thiep-cuoi-online-backend`. Cổng: FE dev 3000, FE `next start` 3001, BE 8090, actuator 8081, Postgres 5433. Cách chạy: `README.md` → "Chạy local".

## ▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY

**Đang làm:** migration backend từ Spring Boot sang Next.js + Supabase.
- Spec đã duyệt: `docs/superpowers/specs/2026-09-26-supabase-migration-design.md`.
- Plan thực thi: `docs/superpowers/plans/2026-09-26-supabase-migration.md`.

**Trạng thái:** Task 1–9/10 XONG code; remote Supabase đủ (DB + Edge + Storage), E2E remote 16/16, gate xanh (test 153/153, typecheck 0). Swagger BE ở `/docs`. Thiệp demo `ho6my9vg` đã publish kèm ảnh/nhạc; link khách `?g=<token>` (tên resolve từ DB).

### Handoff cho agent tiếp theo (Codex hoặc khác): làm đúng thứ tự

**Bước A. P6 nghiệm thu design** (việc đang dở)

1. **Checklist đã viết:** `docs/superpowers/specs/2026-09-26-design-parity-checklist.md`.
   - Mỗi file `design/*.dc.html` là một dòng: trang design → route app → trạng thái `matched` / `deviated: <lý do>` / `blocked: Supabase`.
   - Bỏ qua `Stock*`, `stock-tokens.*` và `Mau Thiep.dc.html` (v1).
   - Lấy các deviation từ mục 2 và từ Nhật ký bên dưới. Những cái chính:
     - Màu đổi cho đạt AA.
     - Home: testimonial giả đổi thành dải "sự thật sản phẩm"; "10 mẫu" đổi thành số mẫu thật (16).
     - Copy "offline" / "tải ảnh QR" đã sửa cho đúng sự thật.
     - Giữ phần copy SEO + link liên quan trên 4 landing, giữ FAQ ở trang tính năng.
     - Giữ `/blog` (không có design).
     - Nhạc là nút nổi, không có thẻ section.
     - Bảng giá: "Miễn phí mọi mẫu".
   - `blocked: Supabase`: lời chào phong bì riêng, lịch trình trong ngày, thứ bậc gia đình, bật/tắt từng phần, bố cục album, giờ đón khách, ô tên khi đăng ký, số RSVP/lời chúc trên thẻ thiệp ở `/account`, duyệt lưu bút.
2. **Gate FE đã chạy:** `npm test` 114/114, `npm run typecheck`, `npm run build`, `npm run build:next`, `git diff --check` đều exit 0. Warning còn lại: thiếu `NEXT_PUBLIC_SITE_URL` khi build local.
3. **Browser sweep FE đã chạy một phần:** 24 route public × 390/1280 = 48 lượt, tất cả 200 và không overflow; 0 console error. Còn chạy lại `/studio/[id]#k=` và `/invite/[slug]?g=` sau khi BE seed record thật. Pass bar còn warning preload CSS của Next.
   - Route: `/`, `/templates`, `/templates/song-hy`, `/studio`, `/tinh-nang`, `/tinh-nang/<slug>`, `/bang-gia`, `/ung-ho`, `/tro-giup`, `/blog`, `/dieu-khoan`, `/quyen-rieng-tu`, `/account`, 4 landing SEO, `/cong-cu-dam-cuoi`, 7 route `/cong-cu/*`, Editor `/studio/{id}#k=`, trang khách `/invite/{slug}?g=`.
   - Cách chạy BE không cần Docker (H2 trong RAM), trong `../Thiep-cuoi-online-backend`:
     ```
     ./mvnw -q spring-boot:test-run -Dspring-boot.run.arguments="--server.port=8090 --management.server.port=8091 --app.cors.allowed-origins=http://localhost:3000"
     ```
   - FE: `npm run build:next && npx next start -p 3000`.
   - **Bẫy đã gặp:** H2 mất dữ liệu mỗi khi BE khởi động lại. Thiệp cũ khi đó trả 404, làm Editor hiện 0 mục và trang khách thiếu nav (ngày 2026-09-26 đã nhầm tưởng đây là bug). **Seed lại trước khi test** bằng script `.ts` chạy `node`:
     - `createApi("http://localhost:8090")` từ `lib/api.ts`.
     - `api.createInvitation("song-hy", {...defaultContent(), couple:{...defaultContent().couple, groom:{name:"Minh Khôi"}, bride:{name:"Hạ Vy"}}})`: dùng `defaultContent`, không dùng `sampleContent` (bị 400 vì URL mẫu không hợp lệ).
     - Lấy `id`, `editKey` và `slug` từ kết quả.
     - `api.updateInvitation(id, key, {published:true})`.
   - Với Editor, **mở URL `#k=` ngay lần đầu**, vì navigate lại sẽ làm mất fragment.
   - Cần kiểm trên Editor:
     - Vòng % hiện.
     - Bấm một mục trong outline thì thiệp có `[data-editing]`.
     - Mục "Lịch trình" hiện ghi chú blocked.
     - "Xem như khách" hiện phong bì có tên khách.
     - Dưới 1024px có `.ed-mobilebar` và sheet.
   - Cần kiểm trên trang khách:
     - Phong bì có tên khách từ link `?g=`.
     - Sau khi mở phong bì có `.inv-nav` và các id `gia-dinh su-kien album tham-du loi-chuc mung-cuoi`.
     - Gửi RSVP xong có `.inv-done__tick`.
4. **Viết report cuối bằng tiếng Việt** cho chủ dự án. Nội dung:
   - Trạng thái từng trang (link tới checklist).
   - Danh sách deviation.
   - Danh sách blocked chờ Supabase.
   - Số liệu gate và kết quả quét.
   - Dependency thừa: `motion`, `embla-carousel-react`. Đề xuất `npm uninstall`, chưa làm.
   - Pháp lý lỗi thời: `/quyen-rieng-tu` vẫn ghi "Vì MỘC chưa có tài khoản". Chủ dự án tự rà, agent không sửa văn bản pháp lý.
5. Cập nhật bảng P6 và Nhật ký. Đưa lệnh `git add` / `git commit` cho chủ dự án (agent không tự commit). **Tắt `next start` và BE** khi xong.

**Bước B. Migration Next.js + Supabase** (**chủ dự án ưu tiên làm ngay từ 2026-09-26**). Chi tiết ở mục 0.

**Kiểm tra:** gate mỗi task là `npm test` + `npm run typecheck`; build chạy cuối phase. Trình duyệt chỉ mở khi xong 1 trang/section/tính năng, và phải gọn token:
- Claude Code dùng Chrome DevTools MCP.
- Codex dùng Playwright MCP (`npm run mcp:playwright`). Không chạy Playwright song song nặng cạnh `next start`.

Không tự `git commit`; đưa lệnh cho chủ dự án.

## 0. Quyết định stack (2026-09-26): chuyển sang Next.js + Supabase, bỏ backend Java

Chủ dự án chốt: **không viết thêm code BE Java**. Stack mới là Next.js + Supabase:
- **DB:** Postgres + RLS.
- **Auth:** dùng cho trang quản trị của cô dâu chú rể.
- **Storage:** ảnh cưới, nhạc.
- **Realtime:** lời chúc.

Không còn service riêng phải host, nên blocker "host BE" của T28 mất đi. Chi tiết quy tắc xem CLAUDE.md mục "Stack direction".

- **Trạng thái:** Task 1–9/10 XONG (thêm Editor v3 content contract: `rank`, `arrivalTime`, section visibility, album layout). Task 10 còn: deploy Netlify thật + commit ~140 files. Remote Supabase đã đủ (DB + Edge + Storage), E2E remote 16/16 PASS.
- **Chặn bởi quyết định này:** P4 Editor v3 (đổi contract nội dung) làm trên Supabase, không sửa record Java nữa.
- **Quyết định đã chốt:** email/mật khẩu + giữ edit key `#k=`; dữ liệu làm mới hoàn toàn; dùng project `iehmucsshklgjmxqyggp`; link mời khách dùng `?g=<token>` (tên resolve từ DB, không gắn tên trên URL); public write đi qua Next Route Handler rồi Supabase Edge Function; RLS không cho browser ghi trực tiếp; deploy FE + BE Next.js trên Netlify.
- **Cấu hình Supabase (đã áp dụng lên remote ngày 2026-09-26, không ghi giá trị secret vào file):**
  - Project ref `iehmucsshklgjmxqyggp`, URL `https://iehmucsshklgjmxqyggp.supabase.co`. Key mới: `NEXT_PUBLIC_SUPABASE_ANON_KEY` = publishable (`sb_publishable_...`), `SUPABASE_SERVICE_ROLE_KEY` = secret (`sb_secret_...`, chỉ server).
  - Secret tự tạo (`openssl rand -hex 32`): `EDGE_SHARED_SECRET` (đồng bộ `.env.local` + Netlify + `supabase secrets set`; tên cũ `SUPABASE_EDGE_SHARED_SECRET` bị CLI từ chối vì tiền tố `SUPABASE_`), `RATE_LIMIT_HMAC_SECRET`.
  - DB: `supabase db push` migration `202609260001_backend.sql` → 5 bảng (`invitations`, `guests`, `rsvps`, `wishes`, `rate_limits`).
  - Edge: `supabase functions deploy public-write`; bucket `media` public sẵn; Auth tắt confirm email (`mailer_autoconfirm: true`) để đăng ký có session ngay.
  - Local: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`; dev BE chạy cổng 3001; Swagger BE ở `/docs`, spec ở `/api/docs`.
- **Các bước migration (agent tiếp theo làm theo thứ tự, không nhảy bước):**
  1. **XONG:** brainstorm và chốt các quyết định kiến trúc.
  2. **XONG:** viết và duyệt spec `docs/superpowers/specs/2026-09-26-supabase-migration-design.md`. Spec gồm:
     - **Schema.** `invitations` với `content jsonb` giữ nguyên shape `contentSchema` trong `lib/content.ts`, cùng `slug`, `template_id`, `published`, `owner_id` (nullable) và hash của edit key. Thêm các bảng `guests` (token `?g=`), `rsvps`, `wishes` (cột ẩn/duyệt).
     - **RLS cho từng bảng.** Khách chưa đăng nhập chỉ đọc thiệp đã publish; browser không insert trực tiếp. RSVP/lời chúc qua Route Handler + Edge Function. Người sở hữu hoặc edit key được sửa đúng thiệp.
     - **Storage:** bucket `media` hiện có, upload chỉ qua server đã authorize.
     - **Realtime** cho `wishes`.
     - **Rate limit.**
     - **Route Handlers / Server Actions** thay từng endpoint của BE Java. Lấy danh sách endpoint từ `lib/api.ts`.
     - **Kế hoạch chuyển dữ liệu cũ**, nếu có.
     - **Contract mới cho Editor v3:** lời chào phong bì, lịch trình, thứ bậc gia đình, bật/tắt từng phần, bố cục album, giờ đón khách. Mỗi trường mới phải có giá trị mặc định hợp lệ, vì autosave cần mọi field hợp lệ kể cả khi rỗng.
  3. **XONG:** viết plan `docs/superpowers/plans/2026-09-26-supabase-migration.md`, 10 task theo TDD.
  4. **TIẾP THEO — cài đặt:**
     - Dùng `@supabase/ssr`. Service-role key chỉ dùng ở server; client chỉ dùng anon key.
     - **Chỉ đổi phần ruột của `lib/api.ts`**, giữ nguyên chữ ký hàm, để các nơi đang gọi không phải sửa.
     - Giữ nguyên URL `/invite/[slug]?g=`, `?lang=` (bỏ `?to=` thủ công: tên khách chỉ từ danh sách trong DB).
     - Xong thì bỏ BE Java khỏi gate, sửa README "Chạy local" và CLAUDE.md.
  5. **Sau migration:** làm các trường Editor v3 đang `blocked` (`lib/editor-sections.ts`, cờ `blocked`) và các mục blocked ở checklist P6.

## 1. Trạng thái

### Chuyển design → app (plan 2026-09-26-design-system-core)

| Phase | Nội dung | Trạng thái |
|---|---|---|
| P1 | Design system core: `app/styles/tokens.css`, `motion.css`, font script/hand, primitives, guard test | **XONG** (2026-09-26) |
| P2 | Hex rời → token | **XONG** (2026-09-26): 0 hex ngoài `tokens.css`; đã gỡ ratchet `PENDING` |
| P3 | Port từng trang (shell, Trang Chu, gallery/cover A–J, tính năng, giá/ủng hộ/trợ giúp/pháp lý/blog, 4 SEO, 7 công cụ, Studio landing, tài khoản) | **XONG port** (2026-09-26) toàn bộ trang có design; nghiệm thu ở P6 |
| P4 | Studio Editor v3 | **Layout XONG** (2026-09-26). Các trường mới (phong bì, thứ bậc, lịch trình, bật/tắt phần, bố cục album) **chờ spec Supabase** |
| P5 | Trang khách theo `Thiep Khach` | **XONG** (2026-09-26); lời chào phong bì riêng chờ Supabase |
| P6 | Nghiệm thu cuối | Checklist + gate + public sweep xong; dynamic BE smoke còn chờ record thật |

### Sản phẩm (các phase gốc)

| Phase | Nội dung | Xong | Còn lại |
|---|---|---|---|
| 1 | Lõi thiệp: mẫu, Studio, trang khách, RSVP, lời chúc, QR mừng cưới, bản đồ, đếm ngược, nhạc, album | ~93% | T28 deploy thật (chờ host BE + tên miền) |
| 2 | Marketing: home, templates, tính năng, trợ giúp, blog, giá, pháp lý | ~92% | Lighthouse performance mobile (71–86); email liên hệ; rà soát pháp lý |
| 3 | Guest manager: nhóm/bàn, link `?g=`, thống kê RSVP | ~95% | Quyết định chủ dự án (gửi hàng loạt SMS/Zalo, giới hạn số khách) |
| 4 | 7 công cụ miễn phí `/cong-cu/*` | ~100% | Câu hỏi mở ở spec mục 9 |
| 5 | Song ngữ vi/en (`?lang=`) | 100% | QA trên URL production |
| 6 | Tài khoản (JWT, claim thiệp) + Donate `/ung-ho` | Tài khoản 100%; Donate xong code | Chưa QA trình duyệt `/ung-ho` |

## 2. Quyết định mặc định đang áp dụng cho design (chủ dự án có thể đổi)

Chi tiết trong plan, mục "Owner decisions":
- Giữ `/blog` và chỉ dùng primitive DS.
- Duyệt lưu bút tách thành phase riêng.
- Nhạc vẫn nhập URL.
- Gợi ý lời cảm ơn xoay vòng 3 mẫu có sẵn, không gọi AI.
- Dùng Great Vibes cho `--hand`.
- Không làm route riêng cho "Thiệp mẫu đầy đủ".
- Lệch màu để đạt AA:
  - `#8a7d72` → `#6b5f57`
  - chữ vàng trên nền sáng → `#8a6425`
  - chữ nhỏ footer `#7d7067` → `#8f8277`

## 3. Cần từ chủ dự án (đang chặn)

1. **Tên miền thật.** Chặn T28 deploy; cần set `NEXT_PUBLIC_SITE_URL` trên Netlify. Việc host BE Java không cần nữa nhờ quyết định Supabase (mục 0). `netlify.toml` đã có, `build:next` PASS.
2. **Duyệt plan migration và chọn cách thực thi:** Native (nhanh hơn) hoặc Subagent-driven (review từng task).
3. **BE Java chưa commit code Phase 6A** (JWT, Account, `V3__accounts.sql`, test). Nên commit để giữ làm tham chiếu khi port sang Supabase. Chạy: `git -C ../Thiep-cuoi-online-backend add -A && git commit -m "feat: accounts + JWT" && git push`.
4. **Email liên hệ** (`NEXT_PUBLIC_CONTACT_EMAIL`) và **rà soát pháp lý** `/dieu-khoan`, `/quyen-rieng-tu`.
5. **FE: commit phần design** (lệnh ở cuối phiên gần nhất; `git status` liệt kê đủ file).

## 4. Nhật ký (mới nhất ở trên, giữ ~15 dòng)

- **2026-09-27** Pentest P0 trên local (Supabase local + env tách biệt, remote không bẩn): 23/23 PASS — IDOR cross-key/guests 401/403/404, mass-assignment bị chặn, RLS anon (insert + đọc unpublished), honeypot/idempotency/payload limits, spam concurrent 6→5×204+1×429 atomic không dư row, upload giả/trống/quá cỡ/sai key, token đoán mò 404. 1 fail giả do script viết sai filter PostgREST, verify lại RLS đúng. Env đã khôi phục remote, dev 3001 chạy lại bình thường.
- **2026-09-27** Bỏ `?to=Tên` thủ công: tên khách chỉ từ DB qua link riêng `?g=<token>` (Studio tab Khách đã có copy link). Sửa page khách + preview mẫu + Editor/PublishDialog/GuestListTool + copy marketing/trợ giúp/pháp lý + README/DEPLOY/CLAUDE. Sửa bug lộ khi verify: page dùng anon nên RLS chặn bảng guests → tra token bằng admin (giống route, key không ra browser). Kiểm chứng: browser `?g=` hiện đúng tên hộ, `?to=` cũ bị bỏ qua (Quý khách); test 153/153, typecheck 0, diff-check sạch.
- **2026-09-26** Session remote cutover XONG: config `.env.local` đủ 6 biến, `supabase db push` (5 bảng + RLS verify), deploy Edge `public-write`, tắt confirm email; E2E remote 16/16 (register→tạo→publish→RSVP/wish→moderation). Gate: test 153/153, typecheck 0, `build:next` + diff-check PASS.
- **2026-09-26** Task 9 XONG: thêm `rank`/`arrivalTime`/section visibility/album layout vào content; giữ field khi patch (CouplePanel, StudioHome, GalleryCatalog, blankEvent); cập nhật fixture test. Typecheck từ 12 lỗi về 0.
- **2026-09-26** Swagger BE: `lib/api-docs.ts` (19 paths khớp 18 Route Handlers) + `/api/docs` JSON + `/docs` UI (`swagger-ui-react` local vì CDN unpkg bị chặn). Kiểm chứng: test 2/2, curl 200.
- **2026-09-26** Demo flow thiệp `ho6my9vg` (Minh Khôi & Hạ Vy): tạo qua Studio UI → upload PNG + MP3 thật → publish → RSVP/wish qua Edge → responses đúng. Sửa 2 bug: invite page self-HTTP 500→200 (gọi domain trực tiếp thay vì fetch chính mình), nút MỞ THIỆP liệt do hydration mismatch (petals chỉ render sau mount). Link khách dùng `?g=<token>`, tên resolve từ DB.
- **2026-09-26** Đổi tên secret `SUPABASE_EDGE_SHARED_SECRET` → `EDGE_SHARED_SECRET` (CLI từ chối tiền tố `SUPABASE_`); đồng bộ `.env.local`/`.env.example`/Edge/test/docs. Còn lại: xoay secret đã lộ trong chat, deploy Netlify, commit ~140 files, verify link `?g=` trên trình duyệt.
- **2026-09-26** Supabase migration Task 8/10 XONG: upload media authorize trước, nhận dạng PNG/JPEG/WebP/MP3 bằng magic bytes, giới hạn 2/8MB, rate-limit RPC, path UUID theo invitation và browser roles không có quyền ghi Storage. Kiểm chứng: pgTAP 20/20, Node 149/149, typecheck/diff-check PASS.
- **2026-09-26** Supabase migration Task 7/10 XONG: response summary bằng SQL RPC theo RSVP mới nhất, moderation approved/hidden ràng buộc đúng thiệp, Realtime scoped + cleanup; wish pending không tự hiện public trước duyệt. Kiểm chứng: pgTAP 20/20, Node 148/148, typecheck/diff-check PASS.
- **2026-09-26** Supabase migration Task 6/10 XONG: RSVP/lời chúc qua Next adapter → Edge Function, shared secret constant-time, HMAC fingerprint, atomic rate limit, honeypot, idempotency và wish mặc định chờ duyệt. Kiểm chứng: pgTAP 18/18, Deno 5/5, Node 145/145, typecheck/build:next/diff-check PASS.
- **2026-09-26** Supabase migration Task 5/10 XONG: guest CRUD/import, owner/edit-key access, latest RSVP status, link guest dùng HMAC có thể tái tạo và DB chỉ giữ hash, public token lookup không lộ dữ liệu riêng. Kiểm chứng: Node 141/141, typecheck + diff-check PASS.
- **2026-09-26** Supabase migration Task 4/10 XONG: public invitation read dùng projection công khai, chỉ trả thiệp đã publish + lời chúc approved/visible, 404 đồng nhất và không cache. Kiểm chứng: Node 135/135, typecheck PASS.
- **2026-09-26** Supabase migration Task 3/10 XONG: invitation CRUD/autosave cùng-origin, edit key 256-bit + SHA-256, owner access và claim atomic qua SQL RPC. Kiểm chứng: pgTAP 18/18, Node 133/133, typecheck PASS.
- **2026-09-26** Supabase migration Task 2/10 XONG: auth email/password dùng cookie HttpOnly/SameSite, route register/login/me/logout, account list qua RLS; JWT không lưu phía client. Kiểm chứng: Node 126/126, typecheck PASS.
- **2026-09-26** Supabase migration Task 1/10 XONG: thêm Supabase CLI/dependencies, env validation, anon/request/admin client tách quyền, migration cho 5 bảng + RLS + Storage + Realtime + atomic rate limit. Kiểm chứng: pgTAP 15/15, Node 118/118, typecheck PASS.
- **2026-09-26** Migration Next.js + Supabase: chủ dự án duyệt spec và chốt kiến trúc mở rộng. Đã viết plan 10 task TDD, phân lớp route → domain → Supabase, cookie auth, RLS, Edge rate limit, Storage, Realtime và Editor v3. Kiểm chứng tài liệu: self-review + `git diff --check` PASS; code chưa bắt đầu.

- **2026-09-26** P6: tạo `docs/superpowers/specs/2026-09-26-design-parity-checklist.md` cho 29 design source, ghi các deviation đã chốt và blocker Supabase. Kiểm chứng tiếp theo: full FE gate và browser sweep.

- **2026-09-26** P6: gate FE đạt `114/114`, typecheck/build/build:next/diff-check exit 0. Playwright fallback sweep 24 route × 2 viewport = 48 lượt, 200 và không overflow; `/studio/demo` 404 và `/invite/demo` 500 do chưa có record/BE seed. Next có warning preload CSS; không có console error ở public routes.
- **2026-09-26** FE: convert `Thiep Preview.dc.html` thành `/demo` tương tác: chọn 10 cover family A–J, palette, cover/full preview và CTA sang Studio/template detail. Kiểm chứng `npm test` 133/133, browser 390/1280 không overflow, 0 console error sau khi mở full preview.
  - Lần test DevTools cho thấy Editor 0 mục và trang khách thiếu nav. Root cause: BE H2 đã khởi động lại nên mất thiệp seed, không phải bug code. Seed lại thì `/invite/z2ztssg1` trả 200.
  - Chưa chạy lại test sau khi seed, vì DevTools MCP bị kẹt profile do nhiều instance MCP chạy song song.

- **2026-09-26** Chủ dự án chốt stack Next.js + Supabase, bỏ BE Java. Đã ghi vào CLAUDE.md và mục 0. Chưa code migration.
- **2026-09-26** P3: Editor v3 và Thiệp khách XONG.
  - Editor v3:
    - 3 cột (danh sách 14 phần + nhóm Quản lý → form → xem trước); dữ liệu từ `lib/editor-sections.ts` (TDD, 4 test).
    - Có vòng % hoàn thiện, chọn phần thì form cuộn tới đúng mục và thiệp gắn nhãn "ĐANG SỬA", bấm thiệp để nhảy tới phần, công tắc bật/tắt RSVP/lưu bút/mừng cưới.
    - Có khung điện thoại/máy tính, chế độ "Xem như khách" với phong bì mang tên khách, bottom sheet dưới 1024px, checklist "còn thiếu" trong hộp Xuất bản.
    - Đã xoá `PreviewFrame` và CSS cũ.
  - Thiệp khách: thanh điều hướng section dính, cánh hoa và hiệu ứng nổ khi mở phong bì, đồng hồ lật, tick tự vẽ khi gửi RSVP.
  - Kiểm chứng:
    - test 114/114, typecheck OK.
    - DevTools trên BE thật (Spring `test-run` + H2, cổng 8090) và FE `next start` cổng 3002: Editor ở 1280 và cửa sổ hẹp đều đạt, 0 console. Trang khách mở phong bì → gửi RSVP thật → tick hiện, 0 console.
    - Cổng 3000 đang có `yarn start` của chủ dự án nên không đụng vào.
- **2026-09-26** P3: đã port trang Ủng hộ, Bảng giá, Gallery, Chi tiết mẫu và Tài khoản. Kiểm chứng: test 110/110, typecheck OK.
  - Ủng hộ: nền đỏ có tim bay, thẻ chuyển khoản có QR VietQR thật và nút sao chép.
  - Bảng giá: dùng đúng câu chữ của design.
  - Gallery: có badge HOT/MỚI, tên cặp đôi riêng cho từng mẫu, lớp hover "Xem thử / Dùng mẫu", trạng thái rỗng kèm "Xoá bộ lọc".
  - Chi tiết mẫu: mô tả bố cục cho 10 family (`familyLayout` trong `lib/templates.ts`, có test).
  - Tài khoản: footer ẩn CTA (`SiteFooter cta={false}`).
  - Guard hex bắt thêm dạng 4/8 chữ số; 13 màu có alpha đổi sang `color-mix`.
  - Blocked vì chờ Supabase: ô tên khi đăng ký, số xác nhận/lời chúc trên thẻ thiệp.
- **2026-09-26** P3/P2/P1 port design, Donate `/ung-ho`, fix Netlify 404: XONG code (chi tiết xem git history; checklist nghiệm thu ở Bước A).

- **2026-09-21→25** Phase 1–6A BE Java cũ (H2/JWT/Account): tham khảo git history, không phát triển thêm (đã chuyển Supabase).

## 5. Lưu ý kỹ thuật

- `next/font`: mỗi loader là `const` cấp module, option phải literal, biến font đặt trên `<html>`.
- `node --test` chỉ nhận TypeScript "erasable": không enum, không parameter properties.
- Build Cloudflare dùng `npm run build`; build Netlify dùng `npm run build:next`.
- `codegraph serve` rò rỉ có thể gây `ENFILE`. Kiểm `sysctl kern.num_files kern.maxfiles`, hỏi chủ dự án trước khi kill.
- Trang design dùng IntersectionObserver ẩn phần dưới màn hình. Khi chụp so sánh phải cuộn hết trang trước.
- Kiểm trong iframe có thêm scrollbar 15px: muốn viewport 390 thì đặt iframe rộng 405.

## 6. Ý tưởng tương lai (chưa chốt)

- Video thiệp.
- Khoá sửa danh sách khách sau khi publish.
- Giới hạn số khách (500–1000).
- Gửi link hàng loạt qua SMS/Zalo/email.
- Quên mật khẩu, xác minh email, OAuth.
- Xoá thiệp khỏi tài khoản.
- Thống kê "đã xem thiệp".
- Webhook xác nhận chuyển khoản Donate (Casso/SePay).
- Công cụ thứ 8 (widget đếm ngược hoặc lời cảm ơn sau cưới).
- Trang public cho save-the-date.
- Giới hạn video ≤200MB.
- `/lien-he`, RSS blog.
