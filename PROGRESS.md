# PROGRESS: tiến độ MỘC Wedding (cập nhật liên tục)

## Mốc 2026-09-26 — fix Netlify "Page not found" khi deploy

- **Nguyên nhân:** `npm run build` gốc chỉ build cho Cloudflare Workers (`next build` → `opennextjs-cloudflare build` → gom vào `dist/server`+`dist/client` qua `scripts/prepare-sites-worker.mjs`), không sinh `.next` chuẩn theo cách Netlify hiểu; repo chưa có `netlify.toml` hay `@netlify/plugin-nextjs` nên Netlify không dựng được route nào → 404 mặc định của Netlify cho mọi path. Chủ dự án xác nhận muốn deploy Netlify thật (không chuyển sang Cloudflare).
- **Đã sửa:** thêm `netlify.toml` (`command = "npm run build:next"`, `publish = ".next"`, plugin `@netlify/plugin-nextjs`) — dùng `build:next` (plain `next build`) riêng cho Netlify, không đụng script `build` gốc (vẫn dùng cho Cloudflare/CI). Thêm `@netlify/plugin-nextjs@^5.16.0` vào devDependencies, `npm install` đồng bộ lockfile.
- **Đã kiểm chứng:** `npm run typecheck` PASS; `npm run build:next` (đúng lệnh Netlify sẽ chạy) PASS, 57 route build ra `.next` bình thường (kèm cảnh báo `NEXT_PUBLIC_SITE_URL is not set` — cần set biến môi trường này trên Netlify dashboard trước khi deploy thật để sitemap/OG/canonical không trỏ localhost).
- **Chưa làm:** chưa deploy thật lên Netlify để xác nhận hết 404 trên production (không có quyền truy cập Netlify dashboard của chủ dự án); chưa set env var `NEXT_PUBLIC_SITE_URL` (và các biến backend liên quan) trên Netlify.

## Mốc 2026-09-26 — audit bộ design mới

- **Đã kiểm chứng:** đọc `design/README.md` và rà toàn bộ 21 file thiết kế + 2 file dùng chung; design mới định hướng ivory/paper, lacquer red, gold, Playfair/Be Vietnam Pro, header/footer dùng chung, gallery mẫu, studio, tài khoản, công cụ và các landing SEO.
- **Đã kiểm chứng:** repo hiện đã có route tương ứng cho các nhóm chính (`/`, `/templates`, `/tinh-nang`, `/cong-cu-dam-cuoi`, `/studio`, `/account`, `/blog`, `/tro-giup`, pháp lý, 7 công cụ và `/ung-ho`), cùng các component dùng chung `SiteHeader`, `SiteFooter`, `MarketingLayout`.
- **Đã hoàn tất trong phiên này:** áp design HTML vào UI Next.js ở shared tokens/header/footer, home/gallery/marketing; bổ sung rail xếp hạng, link riêng từng khách, 7 công cụ, pricing CTA, blog và FAQ cho Home/Template Gallery; bổ sung Bảng giá vào primary navigation; sửa bộ lọc archetype `korean`.
- **Lưu ý:** `.codegraph/` không tồn tại trong repo nên không dùng được CodeGraph cục bộ; tiếp tục bằng cấu trúc route và source hiện có. Trước khi viết code đã đọc hướng dẫn App Router/TypeScript trong `node_modules/next/dist/docs/`.

## Mốc 2026-09-26 — kiểm tra route, CHƯA nghiệm thu độ khớp design

- **Code:** cập nhật `app/globals.css`, `components/home/home.css`, `components/templates/gallery.css`, `components/marketing/marketing.css`, shared `SiteHeader`; thêm `lib/navigation.ts` để menu chính có `/bang-gia` và test `tests/navigation.test.ts`.
- **Gate:** `npm test` **104/104**, `npm run typecheck` **PASS**, `npm run build` **PASS** (Next/OpenNext, 51 route build), `git diff --check` **PASS**.
- **Playwright:** quét **46 route × 2 viewport = 92 lượt** (390px và 1280px), **0 HTTP lỗi, 0 console error, 0 page error, 0 tràn ngang**; kiểm tra 36 internal links mới từ Home/Gallery đều trả **200**. Đây chỉ là kiểm tra kỹ thuật/điều hướng, **không chứng minh UI khớp design**.
- **Bổ sung đã kiểm chứng:** active nav theo pathname, font `Be Vietnam Pro` + `Playfair Display`, showcase lacquer ranking rail, route inventory server-only (không kéo registry content vào client bundle), FAQ/blog/tool/template/invitation fallback checks đều pass; full gate cuối: 104/104 tests, typecheck/build/diff check pass.

## Mốc 2026-09-26 — baseline chuyển toàn bộ design (đang làm)

- Đã chụp Playwright bản design và app ở 390px/1280px cho Home, gallery, tính năng, công cụ, Studio, tài khoản (ảnh `.playwright-mcp/baseline-*`). Cả hai phục vụ HTTP 200, **nhưng giao diện chưa đạt 1:1**.
- Chênh lệch đã xác nhận: gallery design có **16 mẫu/tên mới, 10 kiểu cover A–J, bảng màu trên từng thẻ, bộ lọc màu và sắp xếp**; app mới có 10 mẫu cũ và cover dùng một bố cục. Footer design CTA đỏ sơn mài và 5 cột; app còn footer sáng 4 cột. Các màn khác cần đối chiếu theo section/trạng thái, chưa được đánh dấu hoàn tất.
- Ưu tiên tiếp theo: registry mẫu + màu lưu được ở BE/FE → cover/gallery/Studio/trang khách → marketing/shared → Playwright trực quan + E2E backend. Chỉ chuyển sang hoàn tất khi test lại đủ.

## Mốc 2026-09-26 — triển khai 16 mẫu + màu (đã kiểm, toàn bộ migration vẫn đang làm)

- Registry đã đổi sang 16 tên chính thức từ `Mau Thiep v2.dc.html`, 10 family A–J và palette từ design; 10 ID cũ ánh xạ sang family/tên mới. Gallery có bộ lọc phong cách/màu, sắp xếp, đổi màu trên thẻ; preview và Studio nhận màu đã chọn. Cover A–J dùng một renderer cho gallery, Studio, thiệp khách. Footer đã chuyển CTA tối + 5 cột.
- Backend `InvitationContent` nhận `paletteKey` trong JSON `v:1`, mặc định `""` cho thiệp cũ; frontend resolve màu đầu tiên khi key trống/sai. Test backend toàn bộ **PASS**; frontend **107/107**, typecheck **PASS**, production build **PASS**, `git diff --check` **PASS** tại mốc trước quét cuối.
- Playwright: sitemap **50 route × 2 viewport = 100 lượt**, **0 HTTP lỗi, 0 page error, 0 tràn ngang**. Gallery mobile: 16 mẫu; lọc Lam còn 6, lọc Truyền thống còn 5; đổi Song Hỷ sang xanh đưa `?color=xanh` vào link; 0 console error ở tương tác kiểm tra.
- E2E thật qua trình duyệt với backend Spring Boot + H2 tạm thời: tạo thiệp Song Hỷ màu xanh → sửa tên → đổi đỏ → tự lưu → tải lại vẫn đỏ → xuất bản → khách mở phong bì với `?to=` → RSVP thành công → gửi lời chúc thành công. Tạo bản nháp bằng ID cũ `lua-son` rồi mở Studio: hiện `song-hy`, family A và màu mặc định đỏ. **Chưa chạy E2E Postgres** vì Docker daemon local không chạy.
- **Chưa hoàn tất/không được báo 100%:** Home, Studio, account, marketing/SEO, trang chi tiết mẫu và bảy công cụ chưa được đối chiếu/chuyển đủ từng section và trạng thái với source; so sánh pixel toàn bộ màn chưa có; kiểm console/hydration/image/keyboard/reduced-motion toàn site chưa kết luận. Ảnh chụp baseline của 6 màn nằm trong `.playwright-mcp/baseline-*`; ảnh gallery mới `.playwright-mcp/current-gallery-*`.

## Mốc 2026-09-26 — Home, Studio, tài khoản, chi tiết mẫu, Tính năng (đang làm)

- Home đã chuyển hero thành phong bì đỏ và thẻ Song Hỷ nổi; Studio landing thành chọn mẫu/màu bên trái, xem trước và nhập tên/ngày bên phải. Account có màn đăng nhập/đăng ký theo bố cục 2 cột của design; dashboard lấy tên cô dâu/chú rể, ngày cưới, màu và tên mẫu thật từ backend thay vì hiện slug.
- Sửa lỗi thật ở backend: CORS preflight có `Authorization` của tài khoản bị Spring Security chặn 401. Đã bật CORS trong security filter chain và cho phép header; test `AuthControllerIT` đỏ→xanh, preflight thực 200, luồng đăng ký/nhận thiệp qua trình duyệt đã chạy. API danh sách thiệp bổ sung `groomName`, `brideName`, `weddingDate`, `paletteKey`; test `AccountInvitationControllerIT` đỏ→xanh.
- `/templates/[id]` hiện có bố cục hai cột cover + mô tả + màu + tính năng + CTA như `Mau Thiep Chi Tiet.dc.html`; link “Xem toàn bộ thiệp” mở preview cũ, giữ `?gate`, `?to`, màu và link Studio. `/tinh-nang` đã đổi từ card grid sang hero, thanh anchor và 8 section xen kẽ theo `Tinh Nang.dc.html`; nội dung dùng dữ liệu sản phẩm thật, không bê các lời hứa demo chưa hỗ trợ.
- Playwright mới: chi tiết Song Hỷ màu xanh tại 390/1280 đều 200, 2 màu và link full-preview đúng, 0 console/page error, 0 tràn ngang; trang Tính năng design/app ở 390/1280 đều 200 và 0 console/page error/tràn ngang. Ảnh `.playwright-mcp/detail-app-*`, `.playwright-mcp/features-{design,app}-*`; bản design Tính năng ẩn các section dưới fold bằng IntersectionObserver nên ảnh full-page ban đầu trống bên dưới, không dùng vùng đó để kết luận pixel.
- Gate sau thay đổi: frontend `npm test` **107/107**, `npm run build:next` **PASS**, `npm run typecheck` **PASS khi chạy riêng** (một lần chạy song song với build lỗi do `.next/types` bị build tái tạo; chạy lại độc lập 0 lỗi); backend `./mvnw -q test` **PASS**, 73 test XML, 0 failures/errors. Chưa chạy lại OpenNext full build và sweep Playwright toàn site sau các thay đổi mới.
- **Còn lại trước nghiệm thu:** đối chiếu section/trạng thái cho marketing còn lại, Studio Editor, thiệp khách và 7 công cụ; kiểm link toàn site, keyboard/reduced-motion/image/hydration; chạy lại E2E tạo→lưu→xuất bản→khách và account trên backend bản mới, production build đầy đủ. Mức khớp 100% và “không bug” **chưa được xác nhận**.
- Bổ sung đợt marketing: `/bang-gia` dùng hero **0đ**, thẻ 9 mục đang có + 1 mục video đang làm + thẻ ủng hộ; bỏ danh sách “sắp có” đã thực sự phát hành. `/tro-giup` dùng hero tối, tìm kiếm câu hỏi không dấu, lọc nhóm, FAQ mở/đóng, trạng thái không tìm thấy và link pháp lý. `/blog` dùng bài nổi bật + lọc chủ đề + lưới 4 bài. Nội dung Trợ giúp/Tính năng đã sửa các câu cũ sai về tài khoản và link khách.
- Playwright sau sửa: giá 390/1280 đều 200, hero 0đ, 9 mục, link Studio/Ủng hộ đúng, không lỗi console/tràn ngang; Trợ giúp 390/1280 tìm không ra→xóa→trả focus→lọc một nhóm đúng. **Đã phát hiện và sửa tràn ngang Trợ giúp ở 390px**: grid mobile dùng `1fr` tự nở theo thanh nhóm ngang; đổi `minmax(0,1fr)` và `min-width:0`, kiểm lại 320/390/1280 không tràn. Blog 390/1280 200, 1 bài nổi bật, 4 bài còn lại, lọc Mừng cưới còn 1, 0 lỗi console/tràn ngang. Chưa tính đây là nghiệm thu toàn site; gate build/test cần chạy lại sau các trang vừa sửa.

## Tạm dừng theo yêu cầu — 2026-09-26

- Đã chạy gate **sau** các sửa Giá/Trợ giúp/Blog: `npm test` **107/107**, `npm run typecheck` **PASS**, `npm run build` **PASS** (Next.js + OpenNext/Cloudflare), backend `./mvnw -q test` **PASS** (73 test, 0 lỗi), `git diff --check` ở cả hai repo **PASS**. Audit UI strict: **0 findings**. `DESIGN.md` lint: **0 errors, 11 warnings** về primary/orphaned tokens (chưa xử lý).
- Playwright quét lại **50 route sitemap × 390/1280 = 100 lượt tuần tự**, `reducedMotion: reduce`: **0 HTTP ≥400, 0 page/console error, 0 ảnh hỏng, 0 tràn ngang**. Đây là smoke test; **chưa** chứng minh độ khớp hình ảnh 100%, keyboard mọi trang, mọi link nội bộ hay E2E sau đợt sửa cuối.
- **Việc cần làm khi tiếp tục:** đối chiếu trực quan và hoàn thiện các trang/màn còn thiếu (feature detail, blog detail, pháp lý, SEO, donate, công cụ, Studio Editor, thiệp khách và trạng thái tương tác); kiểm tất cả link nội bộ; chạy E2E backend bản mới gồm account → nhận thiệp, tạo → lưu → xuất bản → RSVP/lời chúc và thiệp cũ; kiểm hydration/keyboard/reduced motion sâu hơn, test Postgres khi môi trường có Docker. Chỉ đánh dấu hoàn tất sau khi sửa và chạy lại lỗi còn lại.
- Theo yêu cầu tránh quá tải máy: các kiểm tra nặng đã chạy **tuần tự**; server thử nghiệm 3003 đã dừng. Không commit/push, không tắt máy tính; dự án vẫn ở trạng thái **đang làm, tạm dừng**.

## Route/design inventory — Task 1 của design system migration

| Design source | Runtime route | Owner / query contract |
|---|---|---|
| `Trang Chu.dc.html` | `/` | Home; CTA tới Studio/templates/features/tools |
| `Site Header.dc.html` + `Site Footer.dc.html` | shared shell | Header/footer links phải nằm trong `lib/navigation.ts` |
| `Mau Thiep v2.dc.html` + `Mau Thiep Chi Tiet.dc.html` | `/templates`, `/templates/[id]` | `lib/templates.ts`; template `id` |
| `Tinh Nang.dc.html` + `Tinh Nang Chi Tiet.dc.html` | `/tinh-nang`, `/tinh-nang/[slug]` | `lib/marketing/features.ts`; feature `slug` |
| `Bang Gia.dc.html` | `/bang-gia` | Marketing/pricing; CTA `/studio` |
| `Tro Giup.dc.html` | `/tro-giup` | FAQ groups/search; legal links |
| `Blog.dc.html` + `Blog Bai Viet.dc.html` | `/blog`, `/blog/[slug]` | `lib/marketing/blog.ts`; post `slug` |
| `Phap Ly.dc.html` | `/dieu-khoan`, `/quyen-rieng-tu` | Legal pages; no data-flow changes |
| `Tao Thiep Cuoi.dc.html` + `Thiep Cuoi Online Mien Phi.dc.html` | `/tao-thiep-cuoi`, `/thiep-cuoi-online-mien-phi` | SEO landing; CTA `/studio` |
| `QR Tien Mung.dc.html` + `Tin Nhan Moi Cuoi.dc.html` | `/qr-tien-mung`, `/tin-nhan-moi-cuoi` | SEO landing; related tool links |
| `Cong Cu.dc.html` | `/cong-cu-dam-cuoi` | Tool hub; 7 tool routes |
| `Studio.dc.html` + `Studio Editor.dc.html` | `/studio`, `/studio/[id]` | local draft/API/edit key; preserve `#k=` |
| `Tai Khoan.dc.html` | `/account` | account/claim flow; preserve invitation links |
| `Thiep Khach.dc.html` | `/invite/[slug]` | preserve `?to=`, `?g=`, `?lang=` |
| `Ung Ho.dc.html` | `/ung-ho` | Donate data from `lib/donate.ts` |

Design-only missing pages noted by the source README: the seven `CC *.dc.html` tool mockups are not present, so the runtime seven tool pages remain the source of truth until those designs are supplied.

> **Quy ước cho mọi agent/người tiếp tục dự án:** đọc file này trước, rồi `docs/superpowers/plans/2026-09-20-invitation-core-phase1.md` (mục "STATUS / HANDOFF") và spec cùng thư mục `specs/`. **Sau mỗi bước có ý nghĩa** (xong một task, sửa một lỗi, đổi hướng, gặp blocker) hãy: (1) sửa bảng % và bảng "Trạng thái" nếu đổi, (2) thêm một dòng vào "Nhật ký" (ngày, việc, kết quả kiểm chứng), (3) cập nhật "Lộ trình đến khi xong". Không ghi thứ chưa kiểm chứng như đã xong.

Repo FE: `/Users/nguyenanhnhut/Desktop/Projects/thiep-cuoi-online-project` (nhánh `feat/invitation-core-phase1` đã mở PR #1 và **merge vào `main`** (2026-09-22 tối) — đang đứng trên `main`, đồng bộ `origin/main`. **GitHub Actions CI (`.github/workflows/ci.yml`) đã chạy thật và PASS 4 lần** (push nhánh, pull_request, 2 lần push `main`) + 1 lần Copilot Code Review pass — xác nhận bằng `gh run list`, không phải suy đoán. Working tree chỉ còn vài file agent vừa sửa/khôi phục chưa commit, xem mục 3 "Lệnh commit"). Repo BE: `/Users/nguyenanhnhut/Desktop/Projects/Thiep-cuoi-online-backend` (đã `git init -b main`, **vẫn 0 commit**). Cách chạy: `README.md` (FE) và `CLAUDE.md` (BE). Cổng: FE dev 3000, FE bản build `next start` 3001, BE 8090 (8080 bị stack Ecomerce chiếm), Postgres 5433, actuator 8081.

## ▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY

**Tình trạng:** Phase 1-5 và Phase 6A XONG về code; cả dự án ≈ **81%**. QA local bằng Playwright đã quét 43 URL trong sitemap và luồng tạo → xuất bản → mở thiệp Anh → RSVP → lời chúc. Còn: deploy thật, QA URL production, rà soát pháp lý, và Donate (chờ 4 thông tin ngân hàng thật). BE account đã có JWT + claim invitation; chưa tự commit theo quy ước.
- **Phase 5:** chỉ vi+en (không thêm ngôn ngữ khác).
- **Phase 6:** bỏ hẳn thanh toán thật — chỉ tài khoản (đăng nhập, gom thiệp cũ, KHÔNG trial vì không có gói trả phí) + tính năng **Donate**. **Donate ĐÃ CÓ CODE (2026-09-26):** trang `/ung-ho` + `lib/donate.ts`, dùng 4 thông tin thật chủ dự án cung cấp (TPBank, STK `04123513201`, chủ TK Nguyễn Anh Nhựt, lời nhắn "Ủng hộ MỘC Wedding"). Gate xanh (test/typecheck/build), **CHƯA QA trình duyệt thật** trang này. Chủ dự án đã tự `git commit`+`push` (`e4cbb20 v1`), CI lại xanh.

**🔴 PHASE 5 ĐANG LÀM DỞ — đọc kỹ trước khi động vào bất cứ file nào của trang khách:**

Spec: `docs/superpowers/specs/2026-09-23-i18n-phase5-design.md` (đọc trước, có toàn bộ quyết định thiết kế + lý do). Plan + trạng thái từng task: `docs/superpowers/plans/2026-09-23-i18n-phase5.md` (task I1-I10).

- **Đã xong, đã kiểm chứng xanh** (checkpoint 2026-09-23, ngay trước khi hết token phiên trước): I1 (BE `InvitationContent.java` — `Couple.messageEn`/`Thanks.messageEn`/`Gift.noteEn`/`Question.labelEn`, mỗi record có compact constructor tự đổi `null`→`""`, KHÔNG bump `content.v`, KHÔNG cần migration — xem lý do trong spec mục 2), I2 (FE `lib/content.ts` schema + `defaultContent`/`sampleContent`), I3 (fixture BE đã regenerate bằng đúng lệnh trong README), I4 (`lib/i18n.ts` mới — `Locale`, `resolveLocale()`, `pick()`, `t()` với dictionary ~60 key; `lib/datetime.ts` thêm `formatDateEn()`), phần lớn I6+I7 (đã thread `locale` prop xuyên suốt **toàn bộ** `InvitationRenderer` + 10 section (`Cover`/`Couple`/`Family`/`Events`/`CountdownSection`/`Album`/`RsvpSection`/`WishesSection`/`Gift`/`Thanks`) + **toàn bộ** client leaf (`RsvpForm`/`WishesPanel`/`CountdownClock`/`EventActions`/`AddToCalendar`/`AlbumGallery`/`CopyButton`/`InvitationShell` — kể cả màn phong bì "Trân trọng kính mời"/"Mở thiệp", dễ quên nhất), I9 (Studio `CouplePanel`/`GiftPanel`/`RsvpPanel` đã có ô nhập bản Anh tuỳ chọn). **Xác nhận xanh tại checkpoint:** `npm test` 101/101, `npm run typecheck` sạch, `npm run build` OK (49 trang, không đổi vì chưa thêm route); BE `./mvnw test` 67/67 (kiểm trước khi làm phần FE-only ở trên, không có lý do gì để đổi vì không đụng BE thêm).
- **CHƯA LÀM — làm tiếp theo đúng thứ tự này:**
  1. **I5** `app/invite/[slug]/page.tsx`: **hoàn toàn chưa đụng tới.** Cần: (a) thêm `lang?: string` vào type `Props.searchParams`; (b) `import { resolveLocale } from "@/lib/i18n"`; (c) `const locale = resolveLocale(sp.lang)`; (d) truyền `locale={locale}` vào `<InvitationRenderer>` (prop đã tồn tại sẵn, chỉ chưa được gọi từ đây); (e) `generateMetadata` thêm `alternates.languages` trỏ về chính URL đó với `?lang=vi`/`?lang=en` (giữ nguyên `to`/`g` nếu URL gốc có) — dùng `SITE_URL` từ `lib/site.ts`.
  2. **I8** Toggle chọn ngôn ngữ: **chưa có component nào cả** — hiện tại cách DUY NHẤT để xem tiếng Anh là tự gõ `?lang=en` vào URL. Cần 1 link nhỏ (`<a href="?lang=en">EN</a>` kiểu) đặt ở đâu đó luôn thấy được trên trang khách (gợi ý: render trong `InvitationRenderer`, phía trên `InvitationShell`, để không bị đè bởi màn phong bì) — phải giữ nguyên `to`/`g` đang có trong URL khi đổi `lang`. Component này cần biết search params hiện tại → truyền từ `page.tsx` xuống (`InvitationRenderer` hiện KHÔNG nhận raw searchParams, phải thêm hoặc tính prop `toggleHref`/tương tự ở `page.tsx` rồi truyền xuống).
  3. **I10** Sau khi I5+I8 xong: chạy lại `npm test`/`typecheck`/`build` + BE `./mvnw test`, QA trình duyệt thật (mở `/invite/<slug-thật>?lang=en`, bấm toggle, gửi RSVP cả 2 ngôn ngữ, Lighthouse) — **chỉ làm QA trình duyệt sau khi I5+I8 xong**, đúng quy ước "QA cuối phase". Rồi cập nhật mục 1 (bảng %, thêm dòng Phase 5), mục "2e. Trạng thái Phase 5" (mới), và dòng "Tình trạng" ở đầu file này.
- **Quyết định thiết kế đã chốt, ĐỪNG làm lại/tranh luận lại (có lý do trong spec):** không dùng `next-intl` (dictionary tay đủ, ~60 chuỗi); không path-prefix `/en/...` (vỡ `?to=`/`?g=`/`#k=`) — chỉ `?lang=`; không đổi `content.v` (v vẫn `1`); chỉ 4 trường nội dung có bản Anh (`couple.messageEn`, `thanks.messageEn`, `gift.noteEn`, `rsvp.questions[].labelEn`) — không dịch tên/địa chỉ/ngày; sự kiện chuẩn (`engagement`/`ceremony`/`reception`) ở locale `en` LUÔN hiện nhãn tiếng Anh cố định từ dictionary (bỏ qua `title` chủ thiệp gõ), chỉ `kind:"custom"` giữ nguyên chữ gốc; Studio KHÔNG dịch UI, chỉ trang khách `/invite/[slug]` có `locale`.

**Làm theo thứ tự khi mở phiên mới (sau khi đã đọc phần Phase 5 ở trên):**
1. Đọc mục 4b (môi trường máy). Chạy `sysctl kern.num_files kern.maxfiles`: gần `kern.maxfiles` thì nghi `codegraph serve` rò rỉ, hỏi chủ dự án trước khi tắt.
2. Xác nhận xanh: `npm test`, `npm run typecheck`, `npm run build`; BE `./mvnw test`.
3. Làm tiếp I5 → I8 → I10 của Phase 5 (chi tiết ở trên). Sau khi Phase 5 xong, sang Phase 6 (spec mới, xem quyết định chủ dự án ở trên — cần hỏi 4 thông tin ngân hàng trước khi làm Donate).
4. Performance Lighthouse Phase 2 (71–86 mobile), rà soát pháp lý/email, T28 (deploy) vẫn chờ chủ dự án, không chặn Phase 5/6.
5. Quy ước bất biến: tiếng Việt với chủ dự án; không Playwright/chrome-devtools trong lúc code, chỉ QA trình duyệt sau khi xong cả phase; không tự `git commit` (bị chặn thật — đã test bằng cách thử commit, bị permission layer deny — đưa lệnh cho chủ dự án); cập nhật file này sau mỗi bước.

---

## 1. Hoàn thành được bao nhiêu %

**Cả dự án: ≈ 81%. Phase 1: ≈ 93%. Phase 2: ≈ 92%. Phase 3: ≈ 95%. Phase 4: ~100%. Phase 5: 100%. Phase 6A tài khoản: 100%.**

```
Cả dự án  [███████████████░░░░░]  ~73%
Phase 1   [██████████████████░░]  ~93%   (code xong + QA cuối phase đạt; còn deploy thật)
Phase 2   [██████████████████░░]  ~92%   (M1-M7, M9-M11 xong; Lighthouse cuối đạt a11y/SEO, còn rà soát hiệu năng, pháp lý và việc chủ dự án)
Phase 3   [███████████████████░]  ~95%   (G1-G11 code xong, test xanh, QA trình duyệt đạt; còn: quyết định của chủ dự án về gửi link hàng loạt thật, giới hạn số khách)
Phase 4   [████████████████████]  ~100%  (7/7 tool xong + QA đạt — xem mục 2d)
Phase 5   [████████████████████]  ~100%  (vi/en, toggle, metadata, FE/BE gate xanh)
Phase 6A  [████████████████████]  ~100%  (tài khoản, JWT, claim/list thiệp, dashboard, gate xanh)
```

Cách tính (ước lượng, sửa lại khi có số liệu tốt hơn): trọng số = công sức tương đối của từng phase.

| Phase | Nội dung | Trọng số | Xong | Đóng góp |
|---|---|---|---|---|
| **1** | Lõi thiệp: mẫu, Studio, trang khách, RSVP, lời chúc, QR mừng cưới, Maps, đếm ngược, nhạc, album | 40% | ~93% | 37.2 |
| 2 | Marketing site: home, /templates, pricing, features/*, help, blog, pháp lý | 10% | ~92% (xem mục 2b) | 9.2 |
| 3 | Guest manager: nhóm/bàn, link cá nhân theo khách, thống kê RSVP, thao tác hàng loạt | 15% | ~95% (xem mục 2c) | 14.25 |
| 4 | 8 tool miễn phí (save-the-date, tin nhắn mời, QR, seating chart, guest list, nén ảnh/video) | 12% | ~100% (xem mục 2d) | 12 |
| 5 | Đa ngôn ngữ (vi + en), thiệp song ngữ | 8% | 100% | 8 |
| 6 | Tài khoản + Donate (không trial/thanh toán) | 15% | ~55% | 8.25 |
| | | 100% | | **≈ 80.65** |

Phase 2 tính theo task: 11 việc kỹ thuật (M1-M8 trong `docs/superpowers/plans/2026-09-21-marketing-phase2.md` + M9 JSON-LD home, M10 ảnh OG, M11 viết lại trang SEO cũ); đã xong 7.7 (M1-M7 xong, M8 ≈ 0.7). Việc của chủ dự án (email liên hệ, rà soát pháp lý) không tính vào %.

Phase 1 tính theo task: 24 task trong plan + 5 task bổ sung (T25-T29 bên dưới) = 29; đã xong ≈ 26.9 (T1-T26 xong, riêng T17 chỉ 0.8 vì chưa kiểm upload Supabase thật; T24 0.9; T27 0.9; T28 0.3 vì mới có runbook và image Docker đã chạy thử; T29 chưa làm).

Phase 3 tính theo task: G1-G11 (`docs/superpowers/plans/2026-09-22-guest-manager-phase3.md`) đều xong + đã QA trình duyệt; 95% chứ không phải 100% vì còn 3 câu hỏi mở cho chủ dự án ở spec mục 11 (gửi link hàng loạt qua SMS/Zalo/email thật, giới hạn số khách tối đa, khoá "chỉ đọc" sau publish) chưa có quyết định — không chặn dùng được, chỉ là mở rộng tuỳ chọn.

**Quy ước kiểm thử (chủ dự án chốt 2026-09-21):** trong lúc làm tính năng KHÔNG chạy Playwright/trình duyệt; kiểm bằng `npm test`, `npm run typecheck`, `npm run build`, `./mvnw test`. Chỉ chạy một đợt QA trình duyệt (390 và 1280, console sạch) sau khi xong cả một phase, rồi ghi vào nhật ký.

**Mốc có ích hơn tổng %:** sau Phase 1 + deploy (khoảng 40% công sức cả dự án) là đã có sản phẩm **dùng được thật** (làm thiệp, chia sẻ link, khách RSVP/chúc/mừng cưới). Phase 2-6 là mở rộng.

## 2. Trạng thái Phase 1 (chi tiết)

| Hạng mục | Trạng thái | Ghi chú kiểm chứng |
|---|---|---|
| Toolchain, logic thuần `lib/` | XONG | `npm test` 66/66 (sau Phase 2), `npm run typecheck` sạch, `npm run build` OK (42 trang) |
| Renderer thiệp + section + client leaf | XONG | Trang khách chạy thật với BE; lightbox YARL kiểm chứng (2/6 → 3/6, ESC trả focus) |
| 7 mẫu đầu / 5 archetype (CSS, ornament) | XONG (QA đợt 1 đạt) | 2026-09-21 xem bằng mắt cả 7 mẫu: cover, phong bì `?gate=1&to=`, toàn trang 390px, phần đầu 1280px. 0 lỗi console, không tràn ngang, không ảnh vỡ, font đúng từng mẫu; section hiện đủ khi cuộn (Reveal chạy đúng, vùng trống lúc chụp là do cuộn quá nhanh). Chưa kiểm: cover không có ảnh chính (để QA cuối phase) |
| 3 mẫu mới `thanh-ngoc`, `thuy-mac` (archetype `traditional`), `so-xuan` "Sơ Xuân" (archetype mới `korean`, `arch-korean.css`) | XONG (QA cuối phase đạt) | 10 mẫu trong registry; `npm test` mọi cặp màu ≥ 4.5 AA. 2026-09-21 xem bằng mắt ở 390px: cover, phong bì, toàn trang; cover không ảnh (qua Studio) hiện cung tên/hoa sen đúng; 0 lỗi/cảnh báo console, không tràn ngang, font đúng. Lighthouse mobile (dev): Thanh Ngọc/Lụa Son/Sơ Xuân đều 100/100/100 |
| Backend Spring Boot (T10-18) | XONG | `./mvnw test` 52/52; smoke thật trên Postgres qua Docker; **upload Supabase thật CHƯA kiểm** (thiếu credentials, BE trả 503, UI báo lỗi thân thiện) |
| Studio: home, editor, tự lưu, panel, xuất bản, phản hồi | XONG | E2E thật: tạo → sửa → tự lưu → xuất bản → khách mở `?to=` → RSVP + lời chúc → chủ thiệp thấy tổng hợp → ẩn lời chúc → trang public không còn hiện. QA cuối phase: Lighthouse mobile mọi tab (Cặp đôi, Sự kiện, Ảnh và nhạc, Tham dự, Mừng cưới, Mẫu) 100/100/100/100; sửa nút quay lại bị trống trên mobile, `<main>` cho editor, nút "Xem thiệp" bị xuống dòng, nền panel `--paper` |
| Thiết kế sản phẩm (trang chủ, /templates, SEO, Studio) | XONG (v1) | Sáng, sang, chút cổ điển Trung Hoa (ngà, đỏ lacquer, vàng foil, lưới, con dấu, 囍) |
| Thư viện UI: motion, embla, YARL, confetti, auto-animate, lucide | XONG | Home dùng Motion + Embla; lightbox YARL; confetti khi xuất bản và khi khách báo "sẽ đến"; auto-animate cho danh sách |
| Quét đường lỗi (403, 409, 429, 413), a11y, polish panel Studio | XONG | `lib/api.ts` gom mọi lỗi về tiếng Việt (mất mạng → `ApiError(0)`, lỗi không có JSON, 429/413/5xx); BE đổi câu "slug"/"edit key" thành lời thường (đã kiểm bằng curl: 403 "Link chỉnh sửa không đúng hoặc đã cũ", 401, 404). Màn hình lỗi đã xem bằng trình duyệt: thiếu/sai link chỉnh sửa, thiệp không tồn tại, `/invite/<slug>` 404 đều tiếng Việt. Lighthouse: trang chủ 100 (sửa thứ tự heading footer, tên link thương hiệu), `/studio` a11y 100 (SEO thấp là do `noindex` có chủ đích). Đã kiểm bằng UI thật (sau lời nhắc của advisor): **409** trùng đường dẫn hiện khung báo đỏ trong hộp thoại xuất bản ("Đường dẫn này đã có người dùng, hãy chọn tên khác"); **429** form RSVP hiện `role=alert` "Bạn gửi quá nhanh, hãy thử lại sau ít phút" (giới hạn: 5 lượt thành công, lượt thứ 6 bị chặn); **413** mp3 9MB ở tab Ảnh và nhạc hiện "File nhạc nặng hơn 8 MB…" (FE chặn trước khi gửi); BE trả 413 "File quá lớn (tối đa 8MB)" (kiểm bằng curl). Ảnh quá nặng luôn được FE nén trước nên không có đường UI tới 413 của ảnh |
| Deploy (FE Vercel, BE container, Supabase) | CHUẨN BỊ XONG, CHƯA DEPLOY | `docs/DEPLOY.md` (runbook + smoke test). Image Docker BE build và chạy thử được: health `/actuator/health` chung cổng `$PORT`, Swagger/api-docs tắt, CORS đúng origin, boot 2.4s trên Postgres. FE: tên miền không còn ghi cứng, đọc `NEXT_PUBLIC_SITE_URL` (hoặc URL production của Vercel) qua `lib/site.ts` cho sitemap/robots/canonical. Chờ chủ dự án: host BE, Supabase, tên miền |
| Git: commit/branch, `git init` BE, xoá `dist/` + `scripts/site-smoke.test.mjs` | **FE: ĐÃ COMMIT + PUSH + PR #1 MERGE VÀO `main`, CI PASS THẬT. BE: CHƯA COMMIT.** | 2026-09-22/23 xác nhận: FE `git log` trên `main` có `6a18590 phase 1` → `d9d0a00` → `b9674b4 update code` (toàn bộ Phase 2/3/4) → PR #1 merge (`21d041f`) → `93282e2 comment` → `9d42ac2` (merge origin/main); `dist/` không tồn tại (đã sạch từ trước, không cần xoá); `scripts/site-smoke.test.mjs` không còn trong repo. CI (`.github/workflows/ci.yml`) chạy thật qua `gh run list`: 4/4 PASS. BE đã `git init -b main` nhưng **vẫn 0 commit, chưa có remote** — chủ dự án tự chạy `cd ../Thiep-cuoi-online-backend && git remote add origin <url> && git add -A && git commit -m "feat: Spring Boot backend for invitations, RSVP, guestbook and media"`, hoặc cho phép `git commit`/`git remote` trong permissions để agent tự làm |

## 2b. Trạng thái Phase 2 (Marketing)

Kế hoạch và nguyên tắc nội dung: `docs/superpowers/plans/2026-09-21-marketing-phase2.md`. Nguyên tắc chính: chỉ nói điều sản phẩm làm được thật (số liệu lấy từ `lib/content.ts` và backend), không bịa giá, không bịa thông tin liên hệ.

| Việc | Trạng thái | Ghi chú kiểm chứng |
|---|---|---|
| M1 Nội dung dạng dữ liệu `lib/marketing/{features,help,blog}.ts` + `tests/marketing.test.ts` | XONG | 8 tính năng, 6 nhóm / 25 câu trợ giúp, 5 bài blog. Mọi khẳng định đã đối chiếu với code (múi giờ +07:00, đếm ngược tự ẩn sau khi hết sự kiện, phong bì mỗi lần mở, ảnh nén ≤ 1600px và 2MB, JPEG/PNG/WebP, mp3 ≤ 8MB, hạn trả lời chỉ để hiển thị, `?to=` điền sẵn tên và ghi vào RSVP). Test: slug duy nhất, `related` hợp lệ, độ dài meta description, ngày |
| M2 Component `components/marketing/*` + `marketing.css` | XONG | `MarketingLayout`, `PageHero`, `Breadcrumb` (+JSON-LD), `CtaBand`, `FaqList` (`<details>`, +FAQPage), `JsonLd`, `BlogBody`, `LegalBody`, `featureIcons`; class tiền tố `mk-` |
| M3 `/tinh-nang`, `/tinh-nang/[slug]` | XONG | SSG 8 trang; hero, cách hoạt động, đáng biết, FAQ, liên quan |
| M4 `/tro-giup` | XONG | 6 nhóm, chip nhảy tới nhóm, một FAQPage JSON-LD duy nhất; email liên hệ chỉ hiện khi có `NEXT_PUBLIC_CONTACT_EMAIL` |
| M5 `/blog`, `/blog/[slug]` | XONG | 5 bài (lời mời, lịch gửi thiệp, mừng cưới QR, ảnh album, online vs giấy); JSON-LD `Article` |
| M6 `/bang-gia`, `/dieu-khoan`, `/quyen-rieng-tu` | XONG (nội dung CẦN CHỦ DỰ ÁN RÀ SOÁT PHÁP LÝ) | Giá: "0đ, hiện miễn phí" + "đang lên kế hoạch" không giá, số liệu lấy từ hằng số trong code. Điều khoản/riêng tư viết theo luồng dữ liệu thật (băm SHA-256 khoá, localStorage, không cookie/analytics, dịch vụ ngoài: img.vietqr.io, api.qrserver.com, Google Maps chỉ khi bấm, bucket ảnh/nhạc công khai) |
| M7 Điều hướng, sitemap | XONG | Header: Mẫu thiệp, Tính năng, Công cụ, Trợ giúp, Blog + **menu di động** (`MobileMenu`, `<details>`, tự đóng khi chuyển trang; trước đây nav bị ẩn hẳn trên điện thoại); footer thêm Bảng giá/Trợ giúp/Blog + dòng pháp lý; sitemap 36 URL (kiểm bằng curl); link "Xem chi tiết từng tính năng" ở trang chủ |
| M8 QA trình duyệt cuối phase | **XONG** | Playwright trên production build: 26 route marketing/SEO × 390/1280px, tất cả HTTP 200; không lỗi console/JS, ảnh hỏng, tràn ngang; đúng 1 `h1` hiển thị trong nội dung trợ năng. Tiêu đề phụ trong preview thiệp nằm dưới `aria-hidden`. Menu mobile mở/đóng đúng. Lighthouse mobile: `/tinh-nang`, `/blog`, `/dieu-khoan`, `/quyen-rieng-tu` đều 100 a11y/SEO/Best Practices; Performance 71/86/86/86, cần theo dõi. Sau build, server cũ ở 3001 trả 404 cho CSS chính; restart `next start` đã khôi phục style, xác nhận header/footer/font trên `/templates`. |
| M9 JSON-LD `Organization` + `WebSite` cho trang chủ | XONG | Dùng `components/marketing/JsonLd` và `SITE_URL`; build ra graph Organization/WebSite. |
| M10 Ảnh Open Graph mặc định cho trang marketing | XONG | Ảnh tĩnh `public/og.png` (1200×630), `openGraph.images` và Twitter `summary_large_image` ở metadata gốc. |
| M11 Viết lại 5 trang SEO cũ | XONG | Nội dung theo tính năng hiện có, liên kết chéo tới blog/tính năng; bỏ lời hứa thư viện tin nhắn có sẵn và làm rõ các công cụ riêng chưa phát hành. |
| M12 Việc của chủ dự án | CHỜ | Email liên hệ (`NEXT_PUBLIC_CONTACT_EMAIL`), rà soát điều khoản + quyền riêng tư, quyết định mô hình giá |

## 2c. Trạng thái Phase 3 (Guest manager)

Spec: `docs/superpowers/specs/2026-09-22-guest-manager-phase3-design.md`. Plan: `docs/superpowers/plans/2026-09-22-guest-manager-phase3.md` (task G1-G11). Chia 2 đợt: **3a (spine, G1-G8)** — migration V2, entity `Guest`, API CRUD khách, sinh/giải mã token, `?g=token`, `rsvps.guest_id`, tab "Khách mời" trong Studio (đủ dùng độc lập). **3b (G9-G11)** — CSV import/export (parse/stringify ở FE bằng `lib/csv.ts`, BE chỉ nhận JSON đã sạch), copy hàng loạt, thống kê theo nhóm/bàn.

**Trạng thái (2026-09-22): ĐỢT 3a (G1-G8) XONG**, cả BE lẫn FE, đã kiểm bằng test + build (chưa QA trình duyệt, theo quy ước chờ xong cả phase).

- **BE (G1-G5):** `V2__guests.sql` áp lên Postgres dev thật OK, entity `Guest` + `Rsvp.guestId`, `GuestTokenService`/`GuestRepository`/`GuestService` (CRUD + retry token khi trùng, test mock giả lập va chạm), `GuestController` (`POST/GET/PATCH/DELETE/import` dưới `/api/invitations/{id}/guests`, qua `authorize()`), endpoint công khai `GET /api/public/invitations/{slug}/guests/{token}` (throttle riêng 20/10 phút), `RsvpRequest.guestToken` + `PublicInvitationService.submitRsvp` gắn `guest_id` (token sai bị bỏ qua lặng lẽ), `RsvpSummary` gộp theo `guest_id` khi có, CORS thêm `DELETE`. `./mvnw test` 65/65 xanh (11 test mới). Smoke test E2E thật qua curl trên BE thật (không chỉ H2 test profile): tạo → publish → tạo khách → giải token → RSVP → `rsvpStatus` "attending" đúng, `confirmedPax` đúng.
- **FE (G6-G8):** `lib/api.ts` thêm `listGuests/createGuest/updateGuest/deleteGuest/importGuests/resolveGuestToken` + type `GuestDto`/`GuestInput`; `RsvpInput` thêm `guestToken`. `app/invite/[slug]/page.tsx` đọc `?g=` (ưu tiên hơn `?to=` thủ công khi cả hai có), gọi `resolveGuestToken`, lỗi/token sai không làm vỡ trang (rơi về không có tên khách). `InvitationRenderer`/`RsvpSection`/`RsvpForm` nối thêm prop `guestToken` (không đụng `WishesPanel`, đúng quyết định trong spec). `components/studio/GuestsPanel.tsx` (mới, theo mẫu `ResponsesPanel` — tài nguyên BE riêng, không qua `draft.content`/autosave): CRUD thô (thêm/sửa/xoá/sao chép link), tab "Khách mời" trong `Editor.tsx`. `npm test` 72/72 xanh (6 test mới trong `tests/api.test.ts`), `npm run typecheck` sạch, `npm run build` OK (42 trang).

**Đợt 3b (G9-G11) cũng đã XONG (2026-09-22):** `lib/csv.ts` (parse RFC4180 thủ công tự dò dấu phân cách `,`/`;`/`\t`, bỏ dòng trắng, báo lỗi theo `line` = số dòng thật trong file; `guestsToCsv` xuất kèm BOM) + `tests/csv.test.ts` (9 test: round-trip, BOM, 3 kiểu dấu phân cách, dòng lỗi không chặn dòng khác, thiếu cột bắt buộc, không phân biệt hoa/thường). Import BE (`POST .../guests/import`) thực ra đã làm sẵn từ lúc dựng G3 (dùng chung `GuestController`/`GuestService`), đã có test riêng. `GuestsPanel.tsx` thêm: nút Nhập CSV (input file ẩn theo đúng mẫu `MediaPanel`, gộp lỗi đọc file + lỗi BE thành một danh sách "Dòng N: …"), Xuất CSV (dựng CSV ở FE từ dữ liệu đã tải, không gọi BE), Sao chép tất cả link, bộ lọc Nhóm/Bàn (`SelectField` có sẵn), thống kê tổng + theo nhóm + theo bàn (đúng công thức dự kiến/đã xác nhận ở spec mục 7). `npm test` 81/81 xanh (9 test mới), `npm run typecheck` sạch, `npm run build` OK.

**QA trình duyệt cả phase: ĐẠT (2026-09-22).** Test thật bằng chrome-devtools MCP trên FE dev (3000) + BE thật (8090), không phải mock: tạo khách qua Studio, nhập CSV 2 đợt (7 dòng, có dòng lỗi cố ý), sửa, xoá, xuất bản thiệp, mở link `?g=` ẩn danh (kể cả qua màn phong bì), gửi RSVP, quay lại Studio thấy trạng thái "Đến · N người" cập nhật đúng theo thời gian thực; `?to=` vẫn hoạt động khi `?g=` sai (không vỡ trang); DELETE qua trình duyệt thật 204 (xác nhận CORS `DELETE` hoạt động, không chỉ qua MockMvc); chuyển tab giữa lúc "Sao chép link" đang chờ không vỡ trang (không warning). Lighthouse: tab Khách mời (Studio, mode snapshot vì URL có `#k=`) 100/100/100/100; `/invite/nam-lan` (mode navigation) Accessibility/Best Practices/Agentic Browsing 100, SEO 58 — **không phải lỗi Phase 3**: do `robots: noindex` cố ý (giống `/studio`) và thiếu `rel=canonical` vốn đã thế từ trước (xác nhận bằng `git diff`, `generateMetadata` không bị đụng tới).

**1 lỗi thật phát hiện lúc QA, đã sửa:** nhập CSV báo lỗi bằng tiếng Anh thô ("size must be between 0 and 80") thay vì tiếng Việt — do `GuestService.importGuests` dùng `Validator.validate()` của Jakarta trực tiếp, message mặc định không phải tiếng Việt (khác mọi chỗ khác trong BE, nơi luật nghiệp vụ có thông báo tiếng Việt viết tay). Đã sửa: bỏ `Validator`, viết `importRowProblem()` thủ công trả tiếng Việt, thêm test `importReportsLengthProblemsInVietnamese`. `./mvnw test` 66/66, `npm test` 81/81 sau khi sửa.

**Giới hạn đã biết (không phải bug, ghi lại để không bịa số liệu):** không sao chép/kiểm được nút "Sao chép link"/"Sao chép tất cả link" bằng chrome-devtools tự động (`navigator.clipboard` treo chờ quyền trong môi trường automation) — đã xác minh logic đúng bằng cách khác (Xuất CSV dùng chung công thức link, đã kiểm byte-level có BOM `EF BB BF` thật). Chưa mở file CSV xuất ra bằng Excel thật (chỉ xác nhận đúng byte BOM, chưa xác nhận Excel hiển thị đúng).

**3 điểm polish sau khi rà lại (advisor), đã sửa và kiểm lại xanh:**
1. `app/invite/[slug]/page.tsx` gọi `load()` (đọc thiệp) rồi mới gọi `resolveGuest()` (giải token) — 2 lượt round-trip nối tiếp thay vì song song, đúng ngay trên loại link mà khách mở trên điện thoại qua `?g=`. Đổi sang `Promise.all([load(slug), resolveGuest(slug, sp.g)])` (cả hai chỉ cần `slug` từ URL, không cần đợi nhau); test lại bằng curl: `?g=` đúng vẫn ra tên hộ, `?g=` sai vẫn rơi về `?to=`.
2. Spec mục 8 chưa ghi quy tắc "nhập CSV validate bằng thông báo tiếng Việt viết tay, không dùng `Validator` của Jakarta trực tiếp" — đã thêm để agent sau không lặp lại lỗi tương tự ở chỗ khác.
3. `GuestService.MAX_IMPORT_ROWS` không bao giờ chạy tới được vì `@Size(max=1000)` trên `GuestImportRequest.guests()` (qua `@Valid` ở `GuestController`) đã chặn trước — code chết, hai nguồn sự thật cho cùng một giới hạn. Đã xoá, giữ giới hạn duy nhất ở DTO. `./mvnw test` 66/66, `npm test` 81/81 sau cả 3 chỗ sửa.

**Phase 3 (Guest manager) HOÀN THÀNH — code + test + QA trình duyệt.** Việc còn lại là của chủ dự án (mục 4), không phải việc kỹ thuật. Bước tiếp theo đề xuất: hỏi chủ dự án có làm Phase 4 (8 công cụ miễn phí) hay tiếp tục việc bị chặn của Phase 1 (T28 deploy, cần Supabase + host BE).

## 2d. Trạng thái Phase 4 (8 công cụ miễn phí)

Spec: `docs/superpowers/specs/2026-09-22-tools-phase4-design.md`. Plan: `docs/superpowers/plans/2026-09-22-tools-phase4.md` (task U1-U13). Không tìm thấy khái niệm tool thứ 8 ở bất kỳ tài liệu nào trong dự án — spec mục 9 hỏi chủ dự án, chưa chặn việc làm 7 tool đã biết. Toàn bộ Phase 4 **không đụng backend Spring Boot** — chạy hoàn toàn phía trình duyệt, dữ liệu (danh sách khách, sơ đồ bàn) chỉ ở `localStorage`, không đồng bộ máy chủ, không liên quan tới sổ khách mời Phase 3 (BE).

**Đợt 4a (2026-09-22): XONG — 4/7 tool, đã QA trình duyệt.**
- `components/tools/ToolPage.tsx` + `tools.css`: khung trang dùng chung (header/footer, tái dùng `.seo-hero`/`.related-grid` có sẵn từ `app/seo.css`).
- `/cong-cu/tao-qr` (`lib/tools/qr.ts` + `QrTool.tsx`): dựng URL ảnh QR qua `api.qrserver.com` (dịch vụ đã dùng ở `PublishDialog`, đã khai trong `/quyen-rieng-tu`), không thêm thư viện QR.
- `/cong-cu/nen-anh` (`ImageCompressTool.tsx`): gọi thẳng `compressImage()` có sẵn từ Phase 1, không viết lại logic nén.
- `/cong-cu/tin-nhan-moi` (`lib/tools/inviteMessage.ts` + `InviteMessageTool.tsx`): ghép chuỗi 2 giọng điệu (gần gũi/trang trọng), dùng `formatDateVi` có sẵn.
- `/cong-cu/danh-sach-khach` (`GuestListTool.tsx`): CRUD khách lưu `localStorage`, Nhập/Xuất CSV dùng nguyên `parseGuestsCsv`/`guestsToCsv`/`GUEST_CSV_COLUMNS` từ `lib/csv.ts` (Phase 3) — **đã xác nhận round-trip thật**: xuất CSV từ công cụ này rồi nhập đúng file đó vào Studio → tab Khách mời → Nhập CSV, cả 3 dòng (kể cả dòng trùng tên với khách có sẵn) vào đúng, cột `link` thừa bị bỏ qua như dự kiến, không lỗi.
- Đồng bộ nội dung: viết lại hub `/cong-cu-dam-cuoi` (bỏ đoạn "chưa có sẵn trên MỘC", liệt kê 4 tool đã lên + mục "Sắp có"); sửa `/tin-nhan-moi-cuoi` (bỏ câu "MỘC hiện chưa có thư viện mẫu tin nhắn", thêm liên kết); `app/sitemap.ts` thêm 4 URL.
- `npm test` 81→88 (7 test mới: `tests/tools-qr.test.ts`, `tests/tools-invite-message.test.ts`), `npm run typecheck` sạch, `npm run build` OK (46 trang, +4).

**QA trình duyệt đợt 4a: ĐẠT (2026-09-22)**, chrome-devtools MCP trên FE dev thật: nén ảnh thật (PNG nhiễu 9004KB → 1120KB, giảm 87%), tạo QR từ link thật, sinh tin nhắn cả 2 giọng điệu đúng nội dung theo dữ liệu nhập, CRUD + nhập CSV (có 1 dòng lỗi cố ý bị cô lập đúng) + xuất CSV ở công cụ danh sách khách, và round-trip CSV thật vào Studio (mục trên). Lighthouse mobile cả 4 trang tool + hub: **100/100/100/100** sau khi sửa lỗi (dưới).

**2 lỗi thật phát hiện lúc QA, đã sửa:**
1. `related` của trang Nén ảnh và Danh sách khách trỏ tới `/cong-cu/save-the-date` và `/cong-cu/so-do-cho-ngoi` — hai route thuộc đợt 4b, **chưa tồn tại lúc đó** (404 nếu bấm). Sửa: trỏ tạm về `/cong-cu-dam-cuoi` cho tới khi 4b xong.
2. Lighthouse phát hiện `heading-order` lỗi (accessibility 98, không phải 100): các trang tool đi thẳng từ `<h1>` (tiêu đề trang) xuống `<h3>`/`<h4>` (tiêu đề kết quả) mà không qua `<h2>`, vì `ToolPage` không có heading trung gian như `SeoLandingPage` có. Sửa: thêm `<h2 className="tool-sr">` ẩn bằng CSS (visually-hidden, không đổi giao diện) ngay trước nội dung mỗi tool trong `ToolPage`; đổi tiêu đề kết quả ở `ImageCompressTool`/`InviteMessageTool` từ `h4` xuống `h3` cho đúng thứ bậc (GuestListTool dùng `PanelSection` sẵn `h3` nên không cần đổi). Kiểm lại: accessibility 98→100 ở cả 4 trang.

**1 điểm không phải bug, chỉ là dữ liệu QA của tôi:** lần đo Lighthouse đầu tiên ở `/cong-cu/danh-sach-khach` báo `cumulative-layout-shift` 0.89 (rất tệ) — hoá ra do chính tôi đã nhồi dữ liệu thử (3 khách + banner "đã nhập") vào `localStorage` của cùng trình duyệt dùng để đo, nên lúc tải trang có một cú nhảy bố cục lớn từ rỗng sang đầy. Xoá `localStorage` (mô phỏng khách ghé lần đầu, đúng thực tế vì mỗi người dùng có `localStorage` riêng) rồi đo lại: CLS về bình thường, **0 audit lỗi**. Không sửa code gì cho việc này — không phải bug.

**Giới hạn đã biết (môi trường test, không phải bug):** khi dùng chrome-devtools MCP tự động điền `<input type="date">` bằng tool `fill`, DOM value đổi đúng nhưng React không nhận được sự kiện `input` thật (cùng loại giới hạn với `navigator.clipboard` treo ở Phase 3) — xác minh logic đúng bằng cách tự dispatch sự kiện `input` qua `evaluate_script`, thấy tin nhắn cập nhật đúng ngày tiếng Việt ngay. Người dùng thật gõ/chọn ngày qua bàn phím hoặc lịch không gặp vấn đề này.

**Đợt 4b (2026-09-22): XONG — 2/7 tool còn lại, đã QA trình duyệt.**
- `lib/tools/guestList.ts` (mới, tách từ `GuestListTool.tsx`): khoá `localStorage` + type `LocalGuest` dùng chung giữa Danh sách khách và Sơ đồ chỗ ngồi — một nguồn sự thật, tránh lệch khoá giữa 2 tool (bài học rút ra trong lúc code, không đợi tới lúc có bug).
- `/cong-cu/so-do-cho-ngoi` (`lib/tools/seating.ts` thuần + `SeatingTool.tsx`): đọc chung danh sách khách; xếp bàn bằng **Pointer Events tự viết** (không thư viện dnd) — kéo thật bằng chuột/cảm ứng, **và** đường thay thế chạm-để-chọn-rồi-chạm-vào-bàn cho bàn phím/trợ năng. Xuất CSV (`ho_gia_dinh,ban`).
- `/cong-cu/save-the-date` (`SaveTheDateTool.tsx`): canvas 1080×1350 vẽ trực tiếp trong trình duyệt, 3 màu nền lấy đúng token màu sản phẩm (`--accent`/`--jade`/`--paper`), ảnh nền tuỳ chọn qua `compressImage()` có sẵn, tải PNG.
- `npm test` 88→95 (7 test mới cho `lib/tools/seating.ts`), `npm run typecheck` sạch, `npm run build` OK (46→48 trang). Khôi phục 2 liên kết `related` đã tạm trỏ về hub ở đợt 4a (nay route thật đã có) + thêm 2 URL vào sitemap + cập nhật hub liệt kê đủ 6 tool.

**QA trình duyệt đợt 4b: ĐẠT (2026-09-22).** Sơ đồ chỗ ngồi: thêm khách/bàn nhanh, chạm-chọn-rồi-chạm-bàn xếp đúng, **bàn đầy từ chối đúng kèm thông báo**, **kéo-thả thật bằng chuỗi PointerEvent thật (không phải suy luận từ code)** — kéo một hộ ra khỏi bàn về khu chưa xếp, xác nhận bàn giảm đúng số lượng; xuất CSV đúng cột `ho_gia_dinh,ban`. Save-the-date: canvas vẽ đúng tên/ngày (định dạng tiếng Việt qua `formatDateVi`) ở cả chế độ màu nền và ảnh nền thật (test bằng ảnh gradient tự tạo, xác nhận phủ kín + lớp gradient tối để chữ đọc được), đổi màu nền, bỏ ảnh nền quay lại đúng preset, tải PNG xác nhận đúng chữ ký PNG (`89 50 4E 47...`) ở mức byte. Lighthouse mobile cả 2 trang: 100/100/100/100 sau khi sửa 1 lỗi (dưới).

**1 lỗi thật phát hiện lúc QA, đã sửa:** `SeatingTool` dùng cùng khuôn "state null → hiện 'Đang tải…' → useEffect nạp xong mới hiện nội dung thật" như `GuestListTool`, nhưng ở đây "Đang tải…" thay **toàn bộ** `PanelSection` (kể cả tiêu đề) thay vì chỉ nội dung bên trong — Lighthouse bắt được `cumulative-layout-shift` 0.57 dù đã xoá sạch `localStorage` trước khi đo (khác lần trước ở đợt 4a, lần này là bug thật, không phải dữ liệu QA của tôi). Sửa: bỏ trạng thái `null`, khởi tạo `guests` là mảng rỗng ngay từ đầu (khớp hệt bản SSR, không có màn chờ) — `useEffect` chỉ nạp dữ liệu thật vào chỗ đã có sẵn khung. CLS về sạch, Lighthouse 100/100/100/100.

**Đợt 4c (2026-09-22): XONG — tool cuối cùng, đã QA trình duyệt. Phase 4 hoàn thành 7/7 tool.**
- Thêm `@ffmpeg/ffmpeg@0.12.15` + `@ffmpeg/util@0.12.2` vào `package.json` (chỉ gói bọc JS, ~224KB local; lõi WASM ~30MB tải từ CDN unpkg lúc chạy, không nằm trong bundle — đã xác nhận bằng cách soi chunk build, xem dưới). `/cong-cu/nen-video` (`VideoCompressTool.tsx`): chọn video, 3 mức nén (CRF 20/28/35 qua `libx264`), thanh tiến trình từ sự kiện `progress` của FFmpeg, giới hạn 200MB đầu vào (từ chối kèm thông báo trước khi thử nén). Thêm 1 dòng dịch vụ ngoài mới (`unpkg.com`) vào `/quyen-rieng-tu`.
- **Sự cố kỹ thuật thật gặp phải (không nằm trong rủi ro đã liệt kê ở spec gốc):** Turbopack không bundle được worker mặc định của thư viện — lỗi bundler đã biết giữa Turbopack và `@ffmpeg/ffmpeg` (worker tự `import()` động một biến runtime, Turbopack cố phân tích tĩnh rồi vỡ). Khắc phục bằng cách chép 3 file (`worker.js`, `const.js`, `errors.js`) từ `node_modules/@ffmpeg/ffmpeg/dist/esm` vào `public/ffmpeg-worker/` làm asset tĩnh + truyền `classWorkerURL` là **URL tuyệt đối có origin** (`${window.location.origin}/ffmpeg-worker/worker.js`) — thử URL tương đối trước, ra lỗi khác (`file:///ffmpeg-worker/worker.js` — `import.meta.url` trong chunk Turbopack không phải origin trang thật) mới hiểu cần URL tuyệt đối. Chi tiết đầy đủ ở spec mục 9.3 (đã cập nhật) và comment trong code. **Việc cần nhớ nếu nâng cấp `@ffmpeg/ffmpeg` sau này: phải chép lại 3 file này.**
- `npm run typecheck` sạch (phải sửa 1 lỗi kiểu `Uint8Array<ArrayBufferLike>` không gán được vào `BlobPart` khi đọc file ra từ FFmpeg — bọc lại bằng `new Uint8Array(data)`), `npm run build` OK (48→49 trang). Soi `.next/static/chunks`: mã `@ffmpeg/ffmpeg` nằm trong 1 chunk riêng ~28KB (nhỏ hơn nhiều chunk khác đã có sẵn, ví dụ 408KB/224KB), tách riêng theo route — xác nhận không phình bundle chính, không ảnh hưởng trang khác.
- **QA trình duyệt: ĐẠT.** Nén thật một video test (tạo bằng `ffmpeg` CLI cục bộ, 3 giây 640×360, ~60KB) qua chrome-devtools MCP: tải công cụ từ CDN, chạy nén thành công, video kết quả nhỏ hơn và phát được (xác nhận qua `<video>` thật — `duration`, `videoWidth/Height` đúng khớp gốc). Giới hạn 200MB đầu vào từ chối đúng kèm thông báo. Xác nhận `next.config.ts` không hề đổi (không thêm header COOP/COEP nào) — mở lại một trang `/invite/*` có Maps/QR, console sạch, không lỗi tải tài nguyên chéo nguồn gốc. Lighthouse mobile: 100/100/100/100.

Phase 4 (8 công cụ miễn phí) **HOÀN THÀNH** — 7 tool, việc còn lại chỉ là 4 câu hỏi mở cho chủ dự án ở spec mục 9 (không chặn dùng).

## 3. Lộ trình đến khi xong (theo thứ tự làm)

Cỡ việc: S < 1 giờ, M 1-3 giờ, L nửa đến 1 ngày, XL nhiều ngày. "Xong khi" là tiêu chí nghiệm thu.

### Phase 1: đưa Lõi thiệp tới mức ra mắt được

| # | Việc | Cỡ | Xong khi |
|---|---|---|---|
| T25 | ~~QA thị giác 7 mẫu~~ **XONG** (2026-09-21) | S | |
| T26 | ~~3 mẫu mới~~ **XONG** (2026-09-21) | S | |
| T27 | ~~Hardening~~ **XONG** (2026-09-21): lỗi tiếng Việt, a11y (Lighthouse), polish Studio | M-L | |
| T28 | **Upload thật + deploy**: tạo Supabase project + bucket, test upload ảnh/mp3 thật; host BE (Dockerfile có sẵn), FE lên Vercel, env, CORS đúng domain, domain thật, `sitemap`/OG dùng domain thật | M-L | Link công khai chạy end-to-end: tạo → xuất bản → khách RSVP; upload ảnh hiển thị |
| T29 | **Git + bàn giao**: ~~commit FE~~ **XONG** (PR #1 merge vào `main`, 2026-09-22), ~~`dist/`+`site-smoke.test.mjs`~~ **đã sạch từ trước** (không tồn tại), ~~AGENTS.md/CLAUDE.md tự sinh~~ **XONG** (2026-09-23, xem nhật ký — `next dev` đã từng ghi đè mất nội dung CLAUDE.md thật, đã khôi phục từ git history + chặn tái diễn). Còn: `git init` + commit + remote cho BE | S | FE: `git status` sạch, CI chạy được từ repo sạch — **đã xác nhận thật qua `gh run list` (4 PASS)**. BE: còn thiếu, chờ chủ dự án |

### Phase 2: Marketing site (còn lại ~8%, chi tiết ở mục 2b)
Đã xong: tính năng (8 trang), trợ giúp, blog (5 bài), bảng giá, điều khoản, quyền riêng tư, menu di động, footer, sitemap, M8-M11. **Còn lại:**
1. Theo dõi Performance Lighthouse (71–86 mobile trên bốn trang vừa đo); chỉ tối ưu sau khi xác định phần nghẽn ổn định.
2. Sau khi chủ dự án cung cấp email và rà soát pháp lý: đặt `NEXT_PUBLIC_CONTACT_EMAIL`, sửa điều khoản/riêng tư theo góp ý. Khi chốt mô hình giá: cập nhật `/bang-gia` và câu "Dùng MỘC có mất phí không?" trong `lib/marketing/help.ts`.
3. Tuỳ chọn: `/lien-he`, RSS blog, `lastModified` cho trang tính năng.

**Quy tắc khi sửa nội dung:** đổi giới hạn trong `lib/content.ts` hoặc backend thì phải cập nhật `lib/marketing/*.ts`, `app/bang-gia/page.tsx` (đã lấy hằng số từ code) và `app/quyen-rieng-tu/page.tsx`. Thêm nút xoá thiệp ở Studio thì cập nhật mục "Studio có nút xoá thiệp không?" trong `help.ts` và mục "Quyền của bạn" trong trang riêng tư.

### Phase 3: Guest manager (~95%, XONG code + test + QA — xem mục 2c)

Đã làm: bảng `guests` (nhóm, bàn, số điện thoại, token cá nhân), link cá nhân `/invite/{slug}?g=token` chạy song song `?to=`, RSVP gắn vào khách qua `guest_id`, thống kê theo nhóm/bàn, nhập/xuất CSV, sao chép link (đơn + hàng loạt). Spec: `docs/superpowers/specs/2026-09-22-guest-manager-phase3-design.md`. Plan + nhật ký task: `docs/superpowers/plans/2026-09-22-guest-manager-phase3.md`.

**Còn lại (không chặn dùng, chờ quyết định chủ dự án — spec mục 11):** gửi link hàng loạt qua SMS/Zalo/email thật (hiện chỉ copy/CSV); giới hạn số khách tối đa (đang mặc định 1000 dòng/lần nhập); khoá "chỉ đọc" sau khi publish hay luôn sửa được (đang luôn sửa được). Khi Phase 6 có tài khoản: cần luồng "nhận thiệp về tài khoản" đi kèm cả nội dung thiệp lẫn sổ khách mời.

### Phase 4: 8 tool miễn phí (~100%, XONG — xem mục 2d)
7/7 tool xong tại `/cong-cu/<tool>`, đã QA trình duyệt, Lighthouse 100/100/100/100 mọi trang: tạo QR, nén ảnh, tin nhắn mời, danh sách khách (CSV), sơ đồ chỗ ngồi (kéo-thả bằng Pointer Events + đường thay thế chạm-chọn), save-the-date (canvas), nén video (`@ffmpeg/ffmpeg` lõi single-thread — gặp và vượt qua một sự cố Turbopack không lường trước, xem mục 2d). Spec: `docs/superpowers/specs/2026-09-22-tools-phase4-design.md`. Plan: `docs/superpowers/plans/2026-09-22-tools-phase4.md`. Còn lại chỉ 4 câu hỏi mở cho chủ dự án (spec mục 9), không chặn dùng.

### Phase 5: Đa ngôn ngữ (100%, XONG)
vi + en, 4 trường nội dung song ngữ, trang khách chọn `?lang=`, toggle giữ query, metadata alternates; FE/BE gate xanh. QA production còn chờ URL thật.

### Phase 6: Tài khoản + Donate (~55%, tài khoản XONG code)
Phase 6A tài khoản đã xong: email/password, JWT, claim thiệp cũ bằng edit key, dashboard. Không làm trial/thanh toán theo quyết định chủ dự án. Còn Donate QR ngân hàng và QA/deploy production; Donate cần tên ngân hàng, số tài khoản, tên chủ tài khoản, lời nhắn cạnh QR.

### Lệnh commit (chạy trong terminal)

**FE: đã xong hết đợt lớn** — Phase 2/3/4 đã commit (`b9674b4 update code`), PR #1 mở từ `feat/invitation-core-phase1` và merge vào `main` (`21d041f`), CI đã chạy thật và PASS (xác nhận qua `gh run list`, không phải suy đoán). 4 lệnh commit theo nhóm mà agent từng đưa (SEO/JSON-LD, content rewrite, guest manager, 7 tool) **không cần chạy nữa** — nội dung của chúng đã nằm trong `b9674b4`/PR #1 rồi, chạy lại sẽ báo "nothing to commit".

Việc còn lại trong working tree hiện tại (2026-09-23, agent vừa sửa, đứng trên `main`):

```bash
git add .github/workflows/ci.yml && git commit -m "ci: pin Node version in workflow to match local (avoid float regressions)"
git add CLAUDE.md AGENTS.md && git commit -m "fix: restore CLAUDE.md content wiped by next dev's agent-file scaffolder

next dev overwrote AGENTS.md (lost the @CLAUDE import) and, when neither
file existed at scaffold time, wrote CLAUDE.md down to a bare @AGENTS.md
— losing all real project docs (already committed as 93282e2 comment).
Restored CLAUDE.md's full content from git history (b9674b4) and made
AGENTS.md host the Next.js block permanently (@CLAUDE + the managed
block) so next dev's own hasCurrentAgentRules() check short-circuits and
never touches either file again — see generate-agent-files.js."
git add PROGRESS.md && git commit -m "docs: progress notes"
git push
```

(3 lệnh commit riêng vì nội dung khác nhau; gộp lại cũng được nếu muốn 1 commit.)

BE (`Thiep-cuoi-online-backend`, đã `git init -b main`, vẫn 0 commit, **chưa có remote**): `cd ../Thiep-cuoi-online-backend && git remote add origin <url thật> && git add -A && git commit -m "feat: Spring Boot backend for invitations, RSVP, guestbook, media and guest manager" && git push -u origin main`

Cách khác: cho phép `git commit`/`git remote` trong permissions của Claude Code để agent tự làm (memory `feedback-git-commit-blocked`).

## 4. Cần từ chủ dự án (đang chặn việc)

1. ~~Credentials Supabase~~ **XONG** — `.env` BE có `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` thật (project `iehmucsshklgjmxqygqp`), upload ảnh+nhạc thật đã trả 201 (nhật ký 2026-09-25).
2. **Nơi host backend**: chủ dự án trả lời "chưa quyết" (2026-09-21). Vercel không chạy Java. Gợi ý Render (dễ nhất, dùng `Dockerfile` có sẵn) / Fly.io / Railway / Cloud Run. Cần chọn 1 trước T28.
3. **Tên miền thật** (CORS, sitemap, OG, link chia sẻ, `NEXT_PUBLIC_SITE_URL` bắt buộc khi build production).
4. **FE:** đã commit + push, CI xanh (commit `e4cbb20 v1`, chủ dự án tự chạy). **BE:** đã có remote + 2 commit (`ef1b081`, `ecda5f9`), nhưng **toàn bộ code Phase 6A** (JWT `SecurityConfig`/`JwtService`, `AuthController`, `Account`/`AccountRepository`/`AccountService`, `V3__accounts.sql`, test đi kèm) **vẫn chưa commit** — rủi ro mất việc cao nhất hiện tại. Cần chủ dự án tự `git -C ../Thiep-cuoi-online-backend add -A && git commit -m "..." && git push`, hoặc cho phép `git commit` trong permissions để agent tự làm.
5. **Email liên hệ** (đặt `NEXT_PUBLIC_CONTACT_EMAIL`): trợ giúp và trang riêng tư đang ghi "kênh liên hệ sẽ được công bố khi ra mắt".
6. **Rà soát pháp lý** `/dieu-khoan` và `/quyen-rieng-tu` (bản nháp viết theo luồng dữ liệu thật, chưa qua luật sư).
7. ~~Trước Phase 6: mô hình giá + cổng thanh toán~~ **chốt: bỏ thanh toán thật, chỉ tài khoản + Donate**. ~~Trước Phase 5: ngôn ngữ ngoài vi/en~~ **chốt: chỉ vi+en**.
8. ~~4 thông tin ngân hàng cho Donate~~ **XONG (2026-09-26):** TPBank, STK `04123513201`, chủ TK Nguyễn Anh Nhựt, lời nhắn "Ủng hộ MỘC Wedding" — đã code vào `/ung-ho`, chưa QA trình duyệt.
9. **Còn chặn thật sự (2026-09-26):** host BE (mục 2) + tên miền thật (mục 3) — cả hai chặn T28 deploy. Ngoài ra: rà soát pháp lý (mục 6), email liên hệ (mục 5). Không còn quyết định lớn nào treo — Phase 1-6A code xong, Donate code xong, chỉ còn hạ tầng/deploy và QA production.

## 4b. Môi trường máy khi dừng phiên (2026-09-22, phiên hiện tại) và cách khởi động lại

| Thành phần | Trạng thái lúc dừng | Khởi động lại |
|---|---|---|
| Docker Desktop + Postgres (`thiep-cuoi-online-backend-db-1`, cổng 5433) | đầu phiên ĐANG TẮT (Docker Desktop không chạy); đã `open -a Docker` + `docker compose up -d db` → đang chạy, healthy | `open -a Docker`; `cd ../Thiep-cuoi-online-backend && docker compose up -d db` |
| Backend Spring Boot (cổng 8090, actuator 8081) | **ĐANG CHẠY** cuối phiên (khởi động lại 2 lần: lần đầu sau khi tắt, lần hai sau khi sửa lỗi thông báo tiếng Anh ở nhập CSV), log ở `/tmp/be.log`, **CORS cho cả `http://localhost:3000` và `http://localhost:3001`, đã thêm `DELETE`** | `cd ../Thiep-cuoi-online-backend && CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001 nohup ./mvnw -q spring-boot:run -Dspring-boot.run.arguments=--server.port=8090 > /tmp/be.log 2>&1 &` (tắt cũ: `lsof -ti :8090 \| xargs kill`). `./mvnw test` cuối phiên: **66/66 xanh** |
| FE dev server (cổng 3000) | **ĐANG CHẠY** cuối phiên (`npm run dev`, log `/tmp/fe-dev.log`), dùng để QA trình duyệt Phase 3 | `npm run dev` (tắt cũ: `lsof -ti :3000 \| xargs kill`) |
| FE bản build (`next start`, cổng 3001) | không chạy cuối phiên | `npm run build && npx next start -p 3001` |
| `.env.local` (gitignored) | chỉ có `NEXT_PUBLIC_API_BASE_URL=http://localhost:8090` | thêm `NEXT_PUBLIC_SITE_URL=http://localhost:3001` nếu muốn canonical/sitemap của bản build đúng cổng |
| `codegraph` MCP | mất kết nối đầu phiên (`CONNECT_TIMEOUT`), không phải rò rỉ fd lần này; `kern.num_files` 22643/184320 (bình thường) | nếu cần, thử kết nối lại; không phải sự cố rò rỉ fd như trước (memory `reference-codegraph-fd-leak` vẫn còn giá trị tham khảo nếu tái diễn) |
| Trình duyệt | Dùng chrome-devtools MCP để QA Phase 3 (không phải Playwright lần này), đã đóng tab cuối phiên | mở lại bằng `new_page` khi cần QA |
| Git FE | working tree còn nhiều file chưa commit (M9-M11/OG-image + toàn bộ Phase 3 FE); commit nền `6a18590 phase 1` đã có (chủ dự án tự chạy) | mục 3, "Lệnh commit" |
| Git BE | `git init -b main` đã làm, **0 commit** (kể cả Phase 3 BE) | mục 3, "Lệnh commit" |
| Dữ liệu thử trong Postgres dev | thêm dữ liệu QA Phase 3: thiệp "Nam & Lan" (slug `nam-lan`, trước đó `yah1twys`) với 4 khách mời thử, 1 đã RSVP "Đến" | vô hại; xoá bằng cách `docker compose down -v` ở repo BE nếu muốn sạch |

## 2e. Trạng thái Phase 5 (ĐÃ XONG)

I5/I8/I10 hoàn tất. Trang khách đọc `?lang=vi|en`, truyền locale xuyên renderer, toggle giữ `to/g`, metadata có `alternates.languages`. Full gate 2026-09-24: FE `npm test` 101/101, `npm run typecheck` sạch, `npm run build` thành công; BE `./mvnw test` 70/70. Playwright QA local: 43 URL trong sitemap đều HTTP 200, không page error/tràn ngang; test tương tác QR, tin nhắn mời, Save-the-Date, danh sách khách, sơ đồ chỗ ngồi, account validation, menu mobile; E2E tạo → sửa → xuất bản → mở `?lang=en` → RSVP → lời chúc đạt. Đã sửa lỗi console `/favicon.ico` 404 bằng metadata icon `/icon.svg`. QA production vẫn chờ URL thật.

## 5. Nhật ký (mới nhất ở trên)

- **2026-09-26 (hoàn tất đợt chuyển đổi UI từ `design/`):** cập nhật Home theo `Trang Chu.dc.html` (hero, rail mẫu, 8 feature cards, link riêng từng khách, 7 công cụ, pricing, blog), cập nhật `/templates` theo `Mau Thiep v2.dc.html` (ranking rail, catalog/filter, collections, FAQ), mở rộng icon và route inventory. Gate: `npm test` 104/104, typecheck/build/diff check pass; Playwright quét **46 route × 2 viewport = 92 lượt**, 0 HTTP/console/page/overflow failure; 36 internal links từ Home/Gallery trả 200; bộ lọc Hàn hiển thị đúng 1 mẫu và FAQ hoạt động. Chưa commit theo quy ước của repo.
- **2026-09-26 (Donate xong code + roadmap thiết kế):** Chủ dự án cung cấp 4 thông tin Donate (TPBank/bin `970423`, STK `04123513201`, chủ TK Nguyễn Anh Nhựt, lời nhắn "Ủng hộ MỘC Wedding"). Brainstorm ngắn (bounded) xác nhận vị trí: trang riêng `/ung-ho`, công khai + index (chủ dự án đồng ý dù hiện đúng STK cá nhân). Xây: `lib/donate.ts` (hằng số), nới kiểu `vietQrUrl` trong `lib/vietqr.ts` từ `GiftAccount` xuống `Pick<GiftAccount, "bankCode"|"accountNumber"|"accountName">` (hàm vốn không đọc `holder`, tránh phải giả `holder: "groom"`), `app/ung-ho/page.tsx` (theo khuôn `MarketingLayout`/`PageHero`/`mk-card` như `/bang-gia`), thêm link footer "Ủng hộ dự án" và `/ung-ho` vào `app/sitemap.ts`. Gate: `npm test` 101/101 (không đổi số vì `lib/donate.ts` là hằng số tĩnh, không cần test riêng), `npm run typecheck` sạch, `npm run build` OK (51/51 trang, kể cả OpenNext/Cloudflare bundle). **Chưa QA trình duyệt trang `/ung-ho` thật.** Trong lúc đó phát hiện CI trên `main` đang **FAIL** (2 lần gần nhất, lỗi `npm ci`: `package-lock.json` thiếu entry `@opennextjs/cloudflare`/esbuild vì commit `6b1854f` thêm dependency mà không đồng bộ lock) — cùng lúc, chủ dự án tự `git commit` (`e4cbb20 v1`, gồm cả Donate + `package-lock.json` mới generate lại đủ) và `push`; xác nhận qua `gh run list`: **CI đã xanh trở lại**. Viết thêm mục 7 (định hướng thiết kế/tính năng tương lai theo từng trang) theo yêu cầu chủ dự án, đối chiếu với thư mục `design/` (21 trang `.dc.html` mockup tĩnh, đã có sẵn từ trước, không phải do phiên này tạo) để không lặp lại việc đã thiết kế.
- **2026-09-25 (retest upload media):** Playwright tạo thiệp mới `1b9405e1-61e0-4601-9b9a-72f4e67f6c61`, upload `public/og.png` và MP3 test. Cả hai request `POST /api/invitations/{id}/media` trả **201**; ảnh trả URL `.webp`, nhạc trả URL `.mp3` trên Supabase bucket `media`. Reload Studio xác nhận lại được 2 ảnh preview và 2 audio source, không còn lỗi `Kho lưu trữ chưa sẵn sàng`.

- **2026-09-25 (fix cấu hình Supabase Storage):** Root cause của `503 Chưa cấu hình Supabase Storage` là backend được chạy bằng `./mvnw` nhưng `.env` không được export vào process Spring; khi export toàn bộ `.env`, `DB_URL` lại trỏ database Supabase nên local migration fail. Chạy đúng cấu hình: source/export `.env` cho Supabase, đồng thời override `DB_URL/DB_USERNAME/DB_PASSWORD` về Postgres local. Playwright upload lại ảnh + MP3: cả hai request trả **201**, URL public trong bucket `media`, reload Studio vẫn thấy lại ảnh và audio. Không cần đổi logic upload.

- **2026-09-25 (E2E upload media):** Playwright tạo thiệp Studio mới `47778a6b-93dc-4c3e-9988-212c63c3da27`, chọn tab Ảnh và nhạc, chọn `public/og.png` và MP3 test 1 giây; cả hai request đã đi tới `POST /api/invitations/{id}/media`. Case chưa pass vì backend trả `503 Chưa cấu hình Supabase Storage`; lần khởi động lại với `.env` làm backend fail ở bước kết nối/migration database local. Không sửa credentials hay dữ liệu thật.

- **2026-09-24 (Playwright full local QA):** Cài bổ sung dependency `@opennextjs/cloudflare` bị thiếu trong lock/node_modules; typecheck và OpenNext build xanh. Playwright quét 43 URL trong sitemap ở cả route marketing, tool, blog, feature, template và pháp lý: tất cả 200, không page error/tràn ngang. Test thật các tool QR, tin nhắn mời, Save-the-Date, danh sách khách, sơ đồ chỗ ngồi, account validation, menu mobile; E2E Studio tạo bản nháp, đổi tên, xuất bản, mở thiệp `?lang=en` giữ `to/g`, gửi RSVP và lời chúc đều đạt. Phát hiện `/favicon.ico` 404 trong console, sửa bằng `metadata.icons` → `/icon.svg`; reload xác nhận link icon đúng. Còn blocker ngoài code: Postgres cần Docker khi khởi động backend, deploy production và QA URL thật.

- **2026-09-23 (Phase 6A tiếp tục):** Thêm Spring Security resource server + JWT HS256, BCrypt password hashing, auth DTO/service/controller (`register/login/me`), migration owner và API account list/claim, cùng trang `/account` FE và API/session helpers. FE `npm test` 101/101, typecheck/build xanh; BE full test chạy qua sau khi thêm JWT config cho test profile. Claim UI/dashboard còn cần polish và test controller riêng trước khi đánh dấu Phase 6A hoàn tất.
- **2026-09-23 (Phase 6A tiếp tục):** Hoàn thiện luồng dashboard: dán edit link → claim invitation → lưu key trong session → mở lại `/studio/{id}#k=...`; FE test 101/101, typecheck/build xanh. Còn bổ sung test riêng cho auth/claim và gate cuối phase.
- **2026-09-23 (Phase 6A hoàn tất code):** Thêm test integration auth cho đăng ký/đăng nhập/me, duplicate email và mật khẩu sai; sửa JWT encoder dùng secret key HS256. Full gate xanh: FE `npm test` 101/101, `npm run typecheck`, `npm run build`; BE `./mvnw test` pass (bao gồm `AuthControllerIT`). Phase 6A hoàn tất; Donate vẫn chờ 4 thông tin ngân hàng thật.
- **2026-09-23 (tiếp tục tới 100%):** Dọn lại bảng %/roadmap cho đúng Phase 5 + 6A đã làm, thêm link Tài khoản vào site header, chạy lại FE typecheck + test 101/101 + build xanh. Việc còn lại: Donate bằng dữ liệu ngân hàng thật, deploy/QA production và rà soát pháp lý.
- **2026-09-23 (demo local):** Dừng backend cũ PID 7470 trên port 8080, restart backend code mới ở 8090 (PID 20033). Xác nhận đăng ký demo `/api/auth/register` trả 200 + JWT, `/account` FE trả 200, port 8080 đã trống.
- **2026-09-23 (demo Phase 6A local):** Login demo nhận JWT → `/api/auth/me` trả đúng user → tạo thiệp demo slug `zathzgsh` → claim bằng edit key → `/api/account/invitations` trả đúng thiệp. FE `/account` HTTP 200. Backend đang chạy ở 8090.
- **2026-09-23 (Playwright MCP):** Cài `@playwright/mcp@0.0.82`, cập nhật `package-lock.json`, thêm script `npm run mcp:playwright` với Chromium và allowlist `localhost:3000/8090`; xác nhận `--help` khởi động bình thường.

- **2026-09-23 (Phase 6A bắt đầu):** Chủ dự án duyệt spec tài khoản + plan. Hoàn tất Task 1: backend migration `V3__accounts.sql`, `Account`/repository và nullable `Invitation.owner`; test bắt đầu đỏ rồi xanh với `./mvnw -q -Dtest=AccountRepositoryTest test`. Chưa làm Donate vì còn thiếu 4 thông tin ngân hàng thật.

- **2026-09-23 (Codex tiếp tục):** Hoàn tất I5/I8: nối `lang` từ URL, metadata alternates giữ `to/g`, thêm toggle VI/EN giữ `to/g`; full gate FE 101/101 + typecheck + build xanh, BE 67/67 xanh. Không commit theo quy ước.

- **2026-09-23 (tiếp, bắt đầu Phase 5 — PHIÊN BỊ NGẮT GIỮA CHỪNG, hết token).** Chủ dự án chốt: Phase 5 chỉ vi+en; Phase 6 bỏ thanh toán, chỉ tài khoản (không trial) + Donate (QR ngân hàng thật của chủ dự án, chưa có thông tin). Advisor review trước khi code: xác nhận approach hẹp (chrome UI tay + 4 trường nội dung song ngữ, `?lang=` không path-prefix, không bump `content.v`) đúng hướng, cảnh báo BE lúc đó chưa có commit (đã xử lý: chủ dự án tự commit BE `ef1b081`+`ecda5f9`, thêm remote `thiep-cuoi-online-project-be`, `./mvnw test` baseline 66/66 xanh trước khi sửa code). Viết spec (`docs/superpowers/specs/2026-09-23-i18n-phase5-design.md`) + plan (`docs/superpowers/plans/2026-09-23-i18n-phase5.md`, task I1-I10). Implement I1-I4, I6, I7, I9 theo TDD (chi tiết đầy đủ, chính xác việc còn lại I5/I8/I10 và các quyết định không được đổi, đã ghi ở khối "🔴 PHASE 5 ĐANG LÀM DỞ" ngay đầu file này — đọc đó trước khi tiếp tục, không lặp lại ở đây). Checkpoint cuối phiên: `npm test` 101/101, `npm run typecheck` sạch, `npm run build` OK (49 trang), BE `./mvnw test` 67/67 (+1 test compact-constructor null→""). **Chưa commit gì của Phase 5** (working tree đang dở, đúng theo quy ước không tự git commit). Phiên bị dừng giữa chừng vì hết ngân sách token — bàn giao cho agent khác (Codex) tiếp tục từ khối hướng dẫn đầu file.
- **2026-09-23 (tiếp)** Chủ dự án đã tự chạy toàn bộ lệnh commit (Phase 2/3/4 gộp thành `b9674b4 update code`), mở PR #1, merge vào `main`, còn thêm 1 commit `93282e2 comment` (thêm `.gitignore`, `.idea/*`, và vô tình chạm `AGENTS.md`/`CLAUDE.md`). Xác nhận qua `gh run list`: **CI đã chạy thật 4 lần, PASS cả 4** (push nhánh, `pull_request`, 2 lần push `main`) + 1 lần Copilot Code Review PASS — không còn là "gate xanh local, chưa chạy thật" nữa. Đứng trên `main`, đồng bộ `origin/main`.
  **Phát hiện sự cố thật khi rà T29:** `CLAUDE.md` bị `next dev` ghi đè chỉ còn `@AGENTS.md` (mất sạch 64 dòng nội dung thật — kiến trúc, quy tắc, directory map), `AGENTS.md` bị ghi đè thành khối "This is NOT the Next.js you know" của Next.js, mất dòng `@CLAUDE`. Cả hai đã bị commit vào `main` qua `93282e2`. Đọc source `node_modules/next/dist/server/lib/generate-agent-files.js`: hàm `ensureAgentRulesForDev` chỉ ghi lại khi `hasCurrentAgentRules()` trả `false`; khi cả 2 file không tồn tại tại thời điểm scaffold, nó ghi `AGENTS.md` = khối Next.js, `CLAUDE.md` = `"@AGENTS.md\n"` — khớp chính xác với những gì thấy trên đĩa, nên nhiều khả năng cả 2 file đã bị xoá đâu đó giữa phiên rồi `next dev` (đang chạy nền suốt phiên, cổng 3000) tái tạo lại từ đầu. **Khôi phục:** lấy lại `CLAUDE.md` nguyên văn từ `git show b9674b4:CLAUDE.md` (khớp đúng nội dung đã thấy ở đầu phiên này); `AGENTS.md` đặt lại thành `@CLAUDE` + khối Next.js nối sau — theo đúng logic `writeAgentFiles`, một khi `AGENTS.md` đã host đúng khối hiện hành thì `CLAUDE.md` không bao giờ bị đụng tới nữa (nhánh code chỉ ghi `CLAUDE.md` khi `AGENTS.md` không tồn tại hoặc không host khối), nên coi như đã chặn tái diễn vĩnh viễn trừ khi Next.js nâng cấp đổi nội dung khối. Đây chính là việc T29 "xử lý AGENTS.md/CLAUDE.md tự sinh" đã lường trước từ lúc lập kế hoạch Phase 1 — giờ mới thật sự xảy ra và đã xử lý xong.
  Cũng sửa `.github/workflows/ci.yml` (pin `node-version: "22.22.3"` thay vì float `"22"`, dù 4 lần CI chạy thật với `"22"` đều pass — pin vẫn đúng để tránh runner tương lai resolve về bản 22.x cũ hơn không tự strip type TS). Viết lại toàn bộ mục 3 "Lệnh commit" (4 lệnh cũ đã lỗi thời, nội dung đã nằm trong PR #1 rồi) và cập nhật T29, mục 2 (Git), mục 4 item 4 cho khớp thực tế. Cả dự án vẫn ≈73% (không phải việc tính năng, là dọn hạ tầng git/docs). BE vẫn 0 commit, chưa có remote — chưa đổi.
- **2026-09-23** Thêm `.github/workflows/ci.yml` (FE only — BE `Thiep-cuoi-online-backend` vẫn 0 commit nên không có pipeline nào chạy `./mvnw test`): job `build` trên `ubuntu-latest`, `node-version: "22.22.3"` (pin cứng khớp máy local, không float `"22"` — `node --test` phụ thuộc TS type-stripping mặc định của đúng bản 22.x này), `npm ci` → `typecheck` → `test` → `build`; trigger `push` nhánh `main`/`feat/**` và `pull_request` vào `main`. Xác nhận cả 3 lệnh xanh trên máy trước khi viết workflow (typecheck sạch, test 95/95, build 49 trang, chỉ warn thiếu `NEXT_PUBLIC_SITE_URL` chứ không fail). Advisor bắt lỗi thứ tự commit tôi đưa sai: nếu commit `ci.yml` tách riêng trước 4 lệnh Phase 2/3/4 ở mục 3, CI chạy sẽ kiểm tra nhầm cây Phase 1 (lockfile cũ, thiếu `@ffmpeg/*`) chứ không phải cây đã build — đã sửa lại đúng thứ tự trong mục 3. `git commit` vẫn bị chặn bởi permission layer (thử thật, bị deny) — chưa có lần chạy Actions thật nào, "workflow đã viết, gate đã xanh local" chứ chưa phải "CI đã pass". Chủ dự án hỏi làm trang GitHub Pages — đã giải thích Pages chỉ serve tĩnh, không chạy được các route `ƒ` (SSR) của app này; chủ dự án xác nhận chỉ muốn hiểu khái niệm, không deploy thật — T28 (host BE/FE/domain) vẫn treo, không đổi.
- **2026-09-22 (tiếp, Phase 4 đợt 4c, tool cuối — Phase 4 hoàn thành 7/7)** `@ffmpeg/ffmpeg@0.12.15`+`@ffmpeg/util@0.12.2`, `/cong-cu/nen-video` (`VideoCompressTool.tsx`): 3 mức nén CRF 20/28/35, giới hạn 200MB. Gặp lỗi bundler thật: Turbopack không phân tích tĩnh được worker mặc định của thư viện (`import()` động runtime bên trong `worker.js`) — sửa bằng chép `worker.js`/`const.js`/`errors.js` vào `public/ffmpeg-worker/` làm asset tĩnh + `classWorkerURL` phải là URL tuyệt đối kèm origin (URL tương đối ra nhầm `file:///...` vì `import.meta.url` trong chunk Turbopack không phải origin trang thật). 1 lỗi kiểu đã sửa (`Uint8Array<ArrayBufferLike>` → `BlobPart`). `npm test` 95/95, build 48→49 trang, chunk riêng ~28KB không phình bundle chính. QA trình duyệt thật: nén 1 video test 640×360/3s qua chrome-devtools MCP, phát lại đúng kích thước/thời lượng; không đụng `next.config.ts` (0 header COOP/COEP mới, xác nhận trang khác vẫn tải Maps/QR cross-origin bình thường). Lighthouse mobile 100/100/100/100. Cả dự án ≈73%. Chi tiết đầy đủ ở mục 2d.
- **2026-09-22 (tiếp, Phase 4 đợt 4b)** Tách `lib/tools/guestList.ts` (khoá localStorage + type dùng chung) khỏi `GuestListTool.tsx` trước khi viết Sơ đồ chỗ ngồi, để hai tool không lệch khoá. Xây `lib/tools/seating.ts` (thuần, 7 test) + `SeatingTool.tsx` (kéo-thả bằng Pointer Events tự viết, có đường thay thế chạm-chọn cho bàn phím/trợ năng) và `SaveTheDateTool.tsx` (canvas 1080×1350, 3 màu nền theo token sản phẩm, ảnh nền qua `compressImage` có sẵn). Test 88→95, build 46→48 trang. QA trình duyệt thật: kéo-thả xác nhận bằng chuỗi PointerEvent thật (không phải suy luận), bàn đầy từ chối đúng, xuất CSV đúng cột; save-the-date vẽ đúng cả 2 chế độ màu/ảnh nền, tải PNG xác nhận đúng chữ ký byte. Phát hiện + sửa 1 lỗi CLS thật (0.57) ở `SeatingTool` — không phải dữ liệu QA lần này, mà do khuôn "null → Đang tải…" thay nguyên `PanelSection`; bỏ trạng thái null, khởi tạo mảng rỗng khớp SSR. Lighthouse cả 2 trang sau sửa: 100/100/100/100. Cả dự án ≈71%, Phase 4 ≈85% (còn 4c nén video, có thể hoãn). Người dùng thử kết nối lại Playwright MCP giữa chừng — CLI báo connected nhưng phiên agent đang chạy không tự nạp tool mới (cần khởi động lại phiên); đã đo thật token của `take_snapshot` bằng chrome-devtools MCP để so sánh sau này (1 lần gọi trang tool đơn giản ≈5246 ký tự/~1300 token, 52% là header/footer lặp lại) — chưa so được với Playwright MCP vì chưa nối lại được trong phiên.
- **2026-09-22 (tiếp, Phase 4 đợt 4a)** Chủ dự án yêu cầu tiếp tục tới khi xong dự án; không có quyết định nào chặn Phase 4 (khác Phase 1 T28/Phase 5/Phase 6) nên bắt đầu ngay. Thiết kế spec+plan Phase 4 (7 tool, không thấy tool thứ 8 ở đâu trong lịch sử dự án — hỏi ở spec mục 9). Xây đợt 4a: `components/tools/ToolPage.tsx`+`tools.css` (khung dùng chung), `lib/tools/qr.ts`, `lib/tools/inviteMessage.ts`, 4 trang `/cong-cu/{tao-qr,nen-anh,tin-nhan-moi,danh-sach-khach}`, viết lại hub `/cong-cu-dam-cuoi` + sửa `/tin-nhan-moi-cuoi`, thêm sitemap. Test 81→88, build 42→46 trang. QA trình duyệt thật (chrome-devtools MCP): nén ảnh thật, tạo QR, sinh tin nhắn, và **round-trip CSV thật** (xuất từ công cụ rời → nhập vào Studio tab Khách mời, không lỗi). Phát hiện + sửa 2 lỗi thật: link `related` trỏ tới 2 route đợt 4b chưa tồn tại (404), và `heading-order` a11y (98→100, thêm `h2` ẩn + hạ `h4`→`h3` ở 2 tool). Một lần đo Lighthouse CLS xấu (0.89) hoá ra do `localStorage` tôi tự nhồi dữ liệu QA — xoá rồi đo lại thì sạch, không phải bug. Lighthouse cuối: cả 4 trang tool + hub đều 100/100/100/100. Cả dự án ≈65%.
- **2026-09-22 (tiếp, xây + QA Phase 3)** Xây xong toàn bộ G1-G11 trong một phiên (không dừng giữa 3a/3b như plan dự kiến). BE: migration `V2__guests.sql`, entity `Guest` + `Rsvp.guestId`, `GuestTokenService`/`GuestRepository`/`GuestService`/`GuestController`, endpoint công khai giải token, `RsvpSummary` gộp theo `guest_id`, CORS `DELETE`. FE: `lib/api.ts` (+7 hàm), `lib/csv.ts` (mới, tự viết RFC4180), `app/invite/[slug]/page.tsx` đọc `?g=`, `GuestsPanel.tsx` (mới) + tab Studio. Test: BE 65→66 (thêm 1 sau khi sửa lỗi), FE 66→81. QA trình duyệt thật bằng chrome-devtools MCP (không phải mock): CRUD khách, nhập CSV 7 dòng qua 2 đợt (có dòng cố ý lỗi ở cả hai tầng: FE parse và BE validate), xuất CSV (xác nhận BOM đúng ở mức byte `EF BB BF`), xuất bản thiệp thật, mở link `?g=` ẩn danh từ màn phong bì tới RSVP, xác nhận trạng thái cập nhật real-time trong Studio, `?to=` vẫn hoạt động khi `?g=` sai, DELETE qua trình duyệt thật (không chỉ MockMvc) 204 xác nhận CORS đúng, chuyển tab giữa lúc copy-link đang chờ không vỡ trang. **Phát hiện và sửa 1 lỗi thật lúc QA:** `GuestService.importGuests` dùng `Validator.validate()` trực tiếp nên báo lỗi tiếng Anh ("size must be between 0 and 80") thay vì tiếng Việt — sửa bằng `importRowProblem()` viết tay, thêm test `importReportsLengthProblemsInVietnamese`. Lighthouse: tab Khách mời (Studio) 100/100/100/100 (mode snapshot vì `#k=`); `/invite` 100/100/-/100, SEO 58 do `noindex` cố ý + thiếu canonical (xác nhận có từ trước Phase 3, không phải lỗi mới). Cả dự án ≈61%. Việc còn lại của Phase 3 chỉ là quyết định của chủ dự án (spec mục 11), không phải kỹ thuật.

- **2026-09-22** Mở phiên mới: khởi động lại Docker/Postgres và BE (đều đã tắt), xác nhận `npm test` 66/66, `npm run typecheck` sạch, `npm run build` 42 trang, BE `./mvnw test` exit 0. Xác nhận FE đã có commit nền (`6a18590 phase 1`, chủ dự án tự chạy) — BE repo vẫn 0 commit. Bắt đầu thiết kế Phase 3 (Guest manager): dùng Explore map đầy đủ schema/API/Studio hiện có (V1 migration, entity `Invitation`/`Rsvp`/`Wish`, xác thực `X-Edit-Key` qua `InvitationService.authorize()`, throttle 5 lần/10 phút qua IP, `RsvpSummary` dedup theo tên thường hoá). Quyết định thiết kế: thêm cột `guests.token` (plaintext, base62, unique theo từng thiệp — KHÔNG băm như edit key vì cần hiện lại để copy hàng loạt), `rsvps.guest_id` (nullable FK) song song giữ `guest_label` cũ, thêm `DELETE` vào CORS `allowedMethods`, CSV tự viết (không thêm thư viện) xuất kèm BOM UTF-8 cho Excel, `?g=token` phân giải qua endpoint public riêng có throttle riêng (không lộ danh sách khách). Xem mục 2c, spec `docs/superpowers/specs/2026-09-22-guest-manager-phase3-design.md`, plan `docs/superpowers/plans/2026-09-22-guest-manager-phase3.md`.
- **2026-09-21** QA Playwright Phase 2 trên production build: 26 route marketing/SEO tại 390px và 1280px; 0 HTTP lỗi, lỗi console/JS, ảnh hỏng hoặc tràn ngang; mỗi route có đúng 1 `h1` hiển thị với trợ năng; menu mobile mở/đóng đạt. Các heading của bản xem trước thiệp được bọc `aria-hidden` nên không tính vào nội dung trợ năng. Phase 3 được chủ dự án yêu cầu; chưa viết code, đang chuyển sang thiết kế.
- **2026-09-21** Sửa lỗi trang `/templates` không có style trên `localhost:3001`: HTML 200 nhưng CSS chính 404 do tiến trình `next start` cũ giữ manifest trước build. Khởi động lại server; Playwright xác nhận CSS tải, font/header/footer có style, trang trả 200. Không cần sửa mã nguồn.

- **2026-09-21** Tiếp tục Phase 2: M9 thêm JSON-LD Organization/WebSite vào trang chủ; M10 thêm `public/og.png` (1200×630) và OG/Twitter metadata; M11 viết lại 5 trang SEO cũ, bỏ nội dung hứa tính năng chưa có. Lighthouse mobile trên build mới (cổng 3100): `/tinh-nang`, `/blog`, `/dieu-khoan`, `/quyen-rieng-tu` đều Accessibility/Best Practices/SEO 100; Performance lần lượt 71/86/86/86. `npm test` 66/66, `npm run typecheck`, `npm run build` (42 trang) đạt. Build cảnh báo `NEXT_PUBLIC_SITE_URL` chưa cấu hình, URL production hiện fallback localhost.

- **2026-09-21 (khuya, chốt phiên) TẠM DỪNG THEO YÊU CẦU CHỦ DỰ ÁN.** Phase 2 (Marketing) code xong: 8 trang tính năng, trợ giúp (25 câu), blog (5 bài), bảng giá, điều khoản, quyền riêng tư, menu di động, footer/sitemap (36 URL). Kiểm chứng: `npm test` 66/66, typecheck sạch, `npm run build` OK 42 trang, Playwright 390/1280 (0 lỗi console), tràn ngang 37px ở 390 đã sửa, Lighthouse 100 ở 4 trang (tính năng chi tiết, trợ giúp, bài blog, bảng giá), `/tinh-nang` 98 → đã sửa heading nhưng chưa đo lại. Chưa làm: M9-M11 (JSON-LD home, ảnh OG, viết lại 5 trang SEO mỏng), Lighthouse `/blog` `/dieu-khoan` `/quyen-rieng-tu`. Chủ dự án trả lời: commit FE + git init BE (đồng ý, nhưng `git commit` bị chặn bởi quyền hạn môi trường → đưa lệnh), làm Phase 2 tiếp, host BE "chưa quyết".
- **2026-09-21 (khuya) SỰ CỐ MÔI TRƯỜNG.** `npm run build` báo `ENFILE`/"Too many open files in system": 3 tiến trình `codegraph serve` giữ ~170k file mở, bảng file macOS 184.267/184.320. Được chủ dự án cho phép, đã kill 3 tiến trình (còn ~9k file mở). Dev server cũ (pid 11155) kẹt ở trạng thái `UE`, không tắt được; chạy bản build ở cổng 3001 thay thế, BE mở CORS thêm cổng 3001. Ghi memory `reference-codegraph-fd-leak`. Xem mục 4b.
- **2026-09-21 (khuya, sau advisor)** Kiểm bổ sung trước khi chốt Phase 1: 409/429/413 bằng UI thật (chi tiết ở bảng trạng thái); `robots.txt` và `sitemap.xml` chạy thật (17 URL = 7 trang + 10 mẫu, dòng Sitemap khớp base); tên biến Vercel `VERCEL_PROJECT_PRODUCTION_URL` có thật nhưng chỉ có khi bật "Enable access to System Environment Variables" → `NEXT_PUBLIC_SITE_URL` đổi thành BẮT BUỘC trong `docs/DEPLOY.md` và `lib/site.ts` in cảnh báo khi build production mà thiếu; trang khách bổ sung `description` cho Open Graph (xem trước Zalo/Facebook). Dữ liệu thử `qa-conflict-a`, `qa-b-429` nằm trong Postgres dev (vô hại). Chưa commit.
- **2026-09-21 (khuya) QA TRÌNH DUYỆT CUỐI PHASE 1: ĐẠT.** Playwright: 3 mẫu mới (cover, phong bì, toàn trang 390px), Studio tạo thiệp mới (cover không ảnh của Sơ Xuân/Thủy Mặc/Thanh Ngọc), tab Mẫu (10 mẫu), 4 màn lỗi (thiếu key, sai key, thiệp không tồn tại, `/invite/<slug>` 404): đều đúng, tiếng Việt, console sạch. Lighthouse mobile (dev server): trang mẫu 100/100/100, trang chủ 98 → 100 sau khi sửa (heading footer `h4` → `p`, bỏ `aria-label` thừa ở link thương hiệu), `/studio` a11y 100 (bỏ `aria-label` lệch nhãn ở nút chọn mẫu), editor a11y 100 ở 6 tab sau khi sửa: nút quay lại bị trống trên mobile (CSS ẩn cả mũi tên), thêm `<main>`. Sửa nút "Xem thiệp" bị xuống dòng. Chưa đo: hiệu năng (Lighthouse performance), Studio ở 1280 cho tab Phản hồi. Việc còn lại của Phase 1: T28 (Supabase + host BE + tên miền) và T29 (git), chờ chủ dự án.
- **2026-09-21 (đêm)** T27/T28 phần code: `lib/api.ts` (thông báo lỗi tiếng Việt theo status, mất mạng), BE đổi câu lỗi jargon (52 test xanh), `studio.css` nền panel `--paper`, `lib/site.ts` + `tests/site.test.ts` (bỏ domain `moc-wedding.chatgpt.site` ghi cứng ở sitemap/robots/layout), `.env.example`, `docs/DEPLOY.md`, Dockerfile BE (health chung cổng, tắt Swagger; đã build và chạy thử container). FE `npm test` 61/61, typecheck sạch. BE chạy lại tách rời tiến trình (nohup) vì lần chạy nền trước bị tắt lúc 20:52.
- **2026-09-21 (tối, muộn)** T25 xong đợt 1 (xem bằng mắt 7 mẫu). T26: đăng ký `thanh-ngoc`, `thuy-mac`, `so-xuan` vào `lib/templates.ts` (10 mẫu), thêm archetype `korean` (`KICKER`, `LABEL`, `CoverOrnament`, `arch-korean.css`, import trong renderer), trang `/templates` đếm mẫu theo `templates.length`; `npm test` 58/58, typecheck sạch, build OK (23 trang). Chủ dự án yêu cầu: không Playwright trong lúc làm tính năng (ghi ở mục 1). BE + Postgres đã khởi động lại (health UP, cổng 8090; Docker Desktop đã mở).
- **2026-09-21 (tối)** Viết lại PROGRESS: thêm % hoàn thành (cả dự án ≈ 34%, Phase 1 ≈ 79%), lộ trình đầy đủ tới hết Phase 6, danh sách việc cần chủ dự án. Chạy kiểm tự động 7 mẫu ở 390×844 (cover + phong bì `?gate=1&to=Chú Ba`): 0 lỗi console, không tràn ngang, font đúng từng mẫu; ảnh lưu ở `.playwright-mcp/qa-*.jpg`, chưa xem bằng mắt. FE dev đã khởi động lại (3000); **BE đang tắt** (8090/8081 không phản hồi), cần chạy lại theo README.
- **2026-09-21 00:50** Tạo `PROGRESS.md`. Ghi khối STATUS/HANDOFF vào plan. Đã thêm: vá `persistable()` (không gửi link bản đồ gõ dở), giữ panel Studio luôn mounted (upload không mất khi đổi tab), 404 + favicon, README, việt hoá eyebrow SEO. BE thêm handler 413 cho upload quá lớn (52 test xanh).
- **2026-09-21 00:20** Tích hợp thư viện: motion, embla, YARL, confetti, auto-animate, lucide. `npm run build` xanh (20 route).
- **2026-09-21 00:05** E2E thật FE↔BE: tạo, sửa, tự lưu, xuất bản, RSVP, lời chúc, ẩn lời chúc: đều đúng.
- **2026-09-20 ~23:50** Agent panel Studio xong (57 test). Agent backend xong (51 test). Agent style archetype dừng vì hết hạn mức chi tiêu API (không có báo cáo).
- **2026-09-20 đêm** Đổi hướng thiết kế theo chủ dự án: sáng sủa, sang trọng, chút cổ điển Trung Hoa; từ chối dùng ảnh cưới thật của nghệ sĩ (bản quyền/quyền hình ảnh), thay bằng mẫu K-wedding hoạ tiết gốc.
- **2026-09-20** Tách backend sang repo Spring Boot; dựng logic thuần `lib/` bằng TDD; renderer + 5 archetype; trang chủ, gallery, SEO.

## 6. Lưu ý kỹ thuật ngắn (chi tiết ở plan)

`next/font`: mỗi loader là `const` cấp module, option literal; biến font đặt trên `<html>`. `node --test` chỉ nhận TypeScript "erasable" (không enum/parameter property). Trình duyệt Playwright dùng chung và hiện cửa sổ: gọi `page.bringToFront()` trước khi chụp; lưu ảnh ở `.playwright-mcp/` (đã gitignore). Dịch vụ ngoài mà UI dùng: `img.vietqr.io` (QR mừng cưới), `api.qrserver.com` (QR link thiệp), Google Maps embed. Hạn mức API từng cạn giữa chừng: khi giao việc cho subagent, yêu cầu nó ghi trạng thái vào file trước khi làm phần lớn. Nội dung marketing là dữ liệu TS thuần (`lib/marketing/`), không MDX. `lib/site.ts` giữ `SITE_URL` và `CONTACT_EMAIL`. Menu di động dùng `<details>` + `usePathname` làm `key` để tự đóng. Hero dùng `overflow-x: clip` (không dùng `hidden`) để glow `::before` không gây tràn ngang mà cũng không tạo scroll container. Lighthouse chạy qua chrome-devtools MCP: `navigation` reload trang và mất `#k=` của link chỉnh sửa, dùng `snapshot` cho trang có khoá trong hash.

## 7. Định hướng tính năng tương lai theo từng trang (roadmap ý tưởng, CHƯA CHỐT — để chủ dự án dùng khi thiết kế)

Viết theo yêu cầu chủ dự án ngày 2026-09-26, để tham chiếu khi làm việc trong `design/` (21 trang mockup tĩnh `.dc.html`, xem `design/README.md`). Đối chiếu 2 nguồn: (a) `.dc.html` đã có sẵn nhưng nội dung placeholder/thiếu (từ `design/README.md` mục "Ghi chú"), (b) câu hỏi mở ghi sẵn trong spec/PROGRESS (không phải bịa mới). Đánh dấu 🔵 = đã có trong spec/PROGRESS, chờ chủ dự án quyết; 🟡 = gợi ý mới, chưa có tài liệu nào nhắc tới.

**Việc thiết kế còn thiếu ngay trong `design/` (ưu tiên trước khi nghĩ tính năng mới):**
- 7 trang công cụ (`CC Tao QR`, `CC Nen Anh`, `CC Nen Video`, `CC Tin Nhan`, `CC Danh Sach Khach`, `CC So Do Cho Ngoi`, `CC Save The Date`) — `Cong Cu.dc.html` đã trỏ tới nhưng **chưa được thiết kế** (ghi rõ trong `design/README.md` mục 5).
- `Ung Ho.dc.html` đã có khung nhưng thông tin ngân hàng để trống — **giờ đã có số thật** (mục 4 file này): TPBank, STK `04123513201`, chủ TK Nguyễn Anh Nhựt, lời nhắn "Ủng hộ MỘC Wedding" — điền vào mock khi cần, khớp với `/ung-ho` đã code thật trong app.
- Toàn bộ `<image-slot>` trong mock vẫn là ô trống, nội dung mẫu (tên khách, blog, FAQ) chưa phải nội dung thật — theo đúng ghi chú sẵn trong `design/README.md`.

**Studio / Editor / Tài khoản:**
| Ý tưởng | Trạng thái |
|---|---|
| Video thiệp | 🔵 Đã hứa ở `/bang-gia` mục "đang lên kế hoạch" từ đầu dự án, chưa làm. Cần quyết định nơi lưu (bucket, giới hạn dung lượng/thời lượng), có nén như `/cong-cu/nen-video` không |
| Khoá "chỉ đọc" khách mời sau khi publish | 🔵 Phase 3 spec mục 11.3 — hiện luôn sửa được |
| Giới hạn số khách tối đa/thiệp | 🔵 Phase 3 spec mục 11.2 — đề xuất 500-1000 dòng, chưa chốt số |
| Gửi link mời hàng loạt qua SMS/Zalo/email thật | 🔵 Phase 3 spec mục 11.1 — hiện chỉ copy/CSV thủ công, cần chọn nhà cung cấp (SMS: eSMS/Speed SMS; email: Resend/SES) |
| Quên mật khẩu, xác minh email, OAuth, nhiều chủ tài khoản | 🔵 Phase 6 spec ghi rõ "không làm trong 6A" — vẫn treo |
| Xoá thiệp khỏi tài khoản | 🟡 Dashboard `/account` hiện chỉ liệt kê + mở, chưa có nút xoá hẳn |

**Trang khách `/invite/[slug]`:**
| Ý tưởng | Trạng thái |
|---|---|
| Ngôn ngữ ngoài vi/en | 🔵 Đã chốt "chỉ vi+en", nhưng `lib/i18n.ts` (dictionary key-value) đủ mở nếu sau này đổi ý |
| Thống kê "đã xem thiệp" (bao nhiêu người mở, khi nào) | 🟡 Gợi ý — giúp chủ thiệp biết ai chưa xem |

**`/ung-ho` (Donate):**
| Ý tưởng | Trạng thái |
|---|---|
| Xác nhận đã chuyển khoản qua webhook (Casso/SePay đọc biến động số dư) | 🟡 Hiện chỉ là ảnh QR tĩnh, không biết ai đã ủng hộ |
| Lời cảm ơn / ghi nhận người ủng hộ công khai | 🟡 Cần có webhook ở trên trước mới làm được |

**Công cụ miễn phí `/cong-cu/*`:**
| Ý tưởng | Trạng thái |
|---|---|
| Tool thứ 8 | 🔵 Phase 4 spec mục 9.1 — chưa xác định. Spec có sẵn 2 gợi ý: "đếm ngược ngày cưới dạng widget nhúng" hoặc "tạo lời cảm ơn sau cưới" |
| Trang public riêng cho Save-the-date (thay vì chỉ tải ảnh) | 🔵 Phase 4 spec mục 9.2 — cần backend mới (slug, lưu trữ), dễ trùng vai trò với thiệp chính |
| Giới hạn kích thước video đầu vào cho tool nén video | 🔵 Phase 4 spec mục 9.4 — đề xuất ≤200MB, chưa chốt số |

**Marketing/SEO:**
| Ý tưởng | Trạng thái |
|---|---|
| **`/bang-gia` đang nói sai** — mục "đang lên kế hoạch" liệt kê 4 thứ, 3 thứ (guest link riêng, tài khoản, song ngữ) **đã xong thật**, chỉ "video thiệp" còn thật sự chưa | 🔵 Lỗi nội dung cần sửa khi động vào trang này, không phải feature mới |
| `/lien-he` (trang liên hệ riêng), RSS blog, `lastModified` cho trang tính năng | 🔵 Phase 2 roadmap ghi "tuỳ chọn" |

**Mẫu thiệp `/templates`:**
| Ý tưởng | Trạng thái |
|---|---|
| Thêm mẫu/archetype mới | 🟡 Kiến trúc đã sẵn cho việc này (1 entry `lib/templates.ts` + CSS archetype nếu cần look mới) — mở rộng liên tục, không phải feature mới |
