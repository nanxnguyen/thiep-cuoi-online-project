# PROGRESS: tiến độ MỘC Wedding (cập nhật liên tục)

> **Quy ước cho mọi agent/người tiếp tục dự án:** đọc file này trước, rồi `docs/superpowers/plans/2026-09-20-invitation-core-phase1.md` (mục "STATUS / HANDOFF") và spec cùng thư mục `specs/`. **Sau mỗi bước có ý nghĩa** (xong một task, sửa một lỗi, đổi hướng, gặp blocker) hãy: (1) sửa bảng % và bảng "Trạng thái" nếu đổi, (2) thêm một dòng vào "Nhật ký" (ngày, việc, kết quả kiểm chứng), (3) cập nhật "Lộ trình đến khi xong". Không ghi thứ chưa kiểm chứng như đã xong.

Repo FE: `/Users/nguyenanhnhut/Desktop/Projects/thiep-cuoi-online-project` (nhánh `feat/invitation-core-phase1`, **chưa có commit nào**, nhóm 1 đã stage: xem "Lệnh commit"). Repo BE: `/Users/nguyenanhnhut/Desktop/Projects/Thiep-cuoi-online-backend` (đã `git init -b main`, chưa commit). Cách chạy: `README.md` (FE) và `CLAUDE.md` (BE). Cổng: FE dev 3000, FE bản build `next start` 3001, BE 8090 (8080 bị stack Ecomerce chiếm), Postgres 5433, actuator 8081.

## ▶ BẮT ĐẦU PHIÊN MỚI Ở ĐÂY (đã dừng tạm 2026-09-21 khuya theo yêu cầu chủ dự án)

**Tình trạng:** Phase 1 (Lõi thiệp) code xong + QA trình duyệt đạt. Phase 2 (Marketing) code xong, QA trình duyệt xong một phần. Cả dự án ≈ **44%**. Không có việc dở nửa chừng trong code: `npm test` 66/66, `npm run typecheck` sạch, `npm run build` OK (42 trang tĩnh) ở lần kiểm cuối.

**Làm theo thứ tự khi mở phiên mới:**
1. Đọc mục 4b (môi trường máy: có tiến trình kẹt, cổng nào chạy gì, cách khởi động lại). Chạy `sysctl kern.num_files kern.maxfiles`: nếu số đầu gần số sau thì có `codegraph serve` rò rỉ (memory `reference-codegraph-fd-leak`), phải xin chủ dự án trước khi tắt.
2. Xác nhận xanh: `npm test`, `npm run typecheck`, `npm run build`; BE `./mvnw test` (52).
3. **Hoàn tất Phase 2** (mục 3, "Phase 2 còn lại"): Lighthouse cho `/tinh-nang`, `/blog`, `/dieu-khoan`, `/quyen-rieng-tu` (chưa chạy sau các sửa cuối), JSON-LD trang chủ, ảnh OG, viết lại 5 trang SEO cũ còn mỏng; sau đó ghi nhật ký và đánh dấu Phase 2 xong.
4. Hỏi chủ dự án các mục ở mục 4 (đang chặn T28/T29 và pháp lý), rồi làm Phase 3 (Guest manager) theo lựa chọn của chủ dự án (Phase 2 → Phase 3 là thứ tự khuyến nghị).
5. Quy ước bất biến: tiếng Việt với chủ dự án; không Playwright trong lúc code, chỉ QA trình duyệt sau khi xong cả phase; không tự `git commit` (bị chặn, đưa lệnh cho chủ dự án); cập nhật file này sau mỗi bước.

---

## 1. Hoàn thành được bao nhiêu %

**Cả dự án (clone đủ tính năng chungdoi.com): ≈ 44%. Phase 1 "Lõi thiệp": ≈ 93%. Phase 2 "Marketing": ≈ 70%.**

```
Cả dự án  [█████████░░░░░░░░░░░]  ~44%
Phase 1   [██████████████████░░]  ~93%   (code xong + QA cuối phase đạt; còn: deploy thật T28 và git T29, đều chờ chủ dự án)
Phase 2   [██████████████░░░░░░]  ~70%   (code xong; còn: Lighthouse các trang cuối, JSON-LD home, ảnh OG, viết lại 5 trang SEO mỏng, rà soát pháp lý)
```

Cách tính (ước lượng, sửa lại khi có số liệu tốt hơn): trọng số = công sức tương đối của từng phase.

| Phase | Nội dung | Trọng số | Xong | Đóng góp |
|---|---|---|---|---|
| **1** | Lõi thiệp: mẫu, Studio, trang khách, RSVP, lời chúc, QR mừng cưới, Maps, đếm ngược, nhạc, album | 40% | ~93% | 37.2 |
| 2 | Marketing site: home, /templates, pricing, features/*, help, blog, pháp lý | 10% | ~70% (xem mục 2b) | 7.0 |
| 3 | Guest manager: nhóm/bàn, link cá nhân theo khách, thống kê RSVP, thao tác hàng loạt | 15% | 0% | 0 |
| 4 | 8 tool miễn phí (save-the-date, tin nhắn mời, QR, seating chart, guest list, nén ảnh/video) | 12% | 0% | 0 |
| 5 | Đa ngôn ngữ (vi + en), thiệp song ngữ | 8% | 0% | 0 |
| 6 | Video thiệp, tài khoản, trial 3 ngày + thanh toán | 15% | 0% | 0 |
| | | 100% | | **≈ 44** |

Phase 2 tính theo task: 11 việc kỹ thuật (M1-M8 trong `docs/superpowers/plans/2026-09-21-marketing-phase2.md` + M9 JSON-LD home, M10 ảnh OG, M11 viết lại trang SEO cũ); đã xong 7.7 (M1-M7 xong, M8 ≈ 0.7). Việc của chủ dự án (email liên hệ, rà soát pháp lý) không tính vào %.

Phase 1 tính theo task: 24 task trong plan + 5 task bổ sung (T25-T29 bên dưới) = 29; đã xong ≈ 26.9 (T1-T26 xong, riêng T17 chỉ 0.8 vì chưa kiểm upload Supabase thật; T24 0.9; T27 0.9; T28 0.3 vì mới có runbook và image Docker đã chạy thử; T29 chưa làm).

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
| Git: commit/branch, `git init` BE, xoá `dist/` + `scripts/site-smoke.test.mjs` | **DỞ: `git commit` BỊ CHẶN bởi quyền hạn môi trường** | Chủ dự án đã đồng ý commit (2026-09-21) nhưng lệnh `git commit` bị từ chối bởi lớp quyền của Claude Code (không phải lỗi git). Đã làm: `git rm -r dist scripts/site-smoke.test.mjs` (đã stage), `git add` nhóm 1 (tooling + docs, 22 file, đã stage), BE `git init -b main` (chưa commit). **Chủ dự án tự chạy các lệnh ở mục "Lệnh commit" bên dưới**, hoặc cho phép `git commit` trong permissions để agent tự làm |

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
| M8 QA trình duyệt cuối phase | **XONG MỘT PHẦN** | Playwright trên bản build (`next start` 3001), 8 trang mới ở 390 và 1280: 0 lỗi/cảnh báo console, không ảnh vỡ, 1 `h1`/trang, xem bằng mắt đạt. Bắt được lỗi tràn ngang 37px ở 390 (glow `::before` của hero) → sửa `overflow-x: clip` (cả `.seo-hero` cũ); đã đo lại 11 trang: `scrollWidth = clientWidth`. Menu di động mở/đóng đúng. Lighthouse mobile: `/tinh-nang/album-anh`, `/tro-giup`, `/blog/mung-cuoi-bang-qr-luu-y`, `/bang-gia` = 100/100/100/100; `/tinh-nang` a11y 98 vì heading nhảy h1→h3, **đã sửa (h2 ẩn `mk-sr`) và build lại nhưng chưa đo lại**. **Chưa chạy Lighthouse:** `/blog` (list), `/dieu-khoan`, `/quyen-rieng-tu`; chưa đo hiệu năng |
| M9 JSON-LD `Organization` + `WebSite` cho trang chủ | CHƯA LÀM | |
| M10 Ảnh Open Graph mặc định cho trang marketing | CHƯA LÀM | Trang khách `/invite/<slug>` đã dùng ảnh bìa. Marketing chưa có `og:image`. `next/og` `ImageResponse` không có glyph tiếng Việt mặc định: dùng ảnh tĩnh `public/og.png` hoặc nạp font TTF hỗ trợ tiếng Việt |
| M11 Viết lại 5 trang SEO cũ | CHƯA LÀM | `/tao-thiep-cuoi`, `/thiep-cuoi-online-mien-phi`, `/qr-tien-mung`, `/tin-nhan-moi-cuoi`, `/cong-cu-dam-cuoi` dùng `SeoLandingPage` chỉ với 3 ý ngắn. **Có câu hứa chưa có thật:** `/tin-nhan-moi-cuoi` ("Mẫu lời mời thân mật", "Dễ copy...") và `/cong-cu-dam-cuoi` (nav "Công cụ" trỏ vào đây, nhưng 8 công cụ miễn phí thuộc Phase 4 chưa làm). Nên viết lại thành trang có nội dung thật, liên kết sang blog/tính năng, hoặc gộp/chuyển hướng |
| M12 Việc của chủ dự án | CHỜ | Email liên hệ (`NEXT_PUBLIC_CONTACT_EMAIL`), rà soát điều khoản + quyền riêng tư, quyết định mô hình giá |

## 3. Lộ trình đến khi xong (theo thứ tự làm)

Cỡ việc: S < 1 giờ, M 1-3 giờ, L nửa đến 1 ngày, XL nhiều ngày. "Xong khi" là tiêu chí nghiệm thu.

### Phase 1: đưa Lõi thiệp tới mức ra mắt được

| # | Việc | Cỡ | Xong khi |
|---|---|---|---|
| T25 | ~~QA thị giác 7 mẫu~~ **XONG** (2026-09-21) | S | |
| T26 | ~~3 mẫu mới~~ **XONG** (2026-09-21) | S | |
| T27 | ~~Hardening~~ **XONG** (2026-09-21): lỗi tiếng Việt, a11y (Lighthouse), polish Studio | M-L | |
| T28 | **Upload thật + deploy**: tạo Supabase project + bucket, test upload ảnh/mp3 thật; host BE (Dockerfile có sẵn), FE lên Vercel, env, CORS đúng domain, domain thật, `sitemap`/OG dùng domain thật | M-L | Link công khai chạy end-to-end: tạo → xuất bản → khách RSVP; upload ảnh hiển thị |
| T29 | **Git + bàn giao**: commit theo nhóm hợp lý (FE), `git init` + commit BE, xoá `dist/` và `scripts/site-smoke.test.mjs`, xử lý `AGENTS.md`/`CLAUDE.md` tự sinh, mở PR | S | `git status` sạch, README đúng, CI/test chạy được từ repo sạch |

### Phase 2: Marketing site (còn lại ~30%, chi tiết ở mục 2b)
Đã xong: tính năng (8 trang), trợ giúp, blog (5 bài), bảng giá (giai đoạn miễn phí), điều khoản, quyền riêng tư, menu di động, footer, sitemap. **Còn lại, theo thứ tự:**
1. Build lại rồi chạy Lighthouse (mobile, `next start` 3001) cho `/tinh-nang`, `/blog`, `/dieu-khoan`, `/quyen-rieng-tu`; sửa lỗi nếu có; ghi kết quả vào nhật ký. (S)
2. M9 JSON-LD `Organization` + `WebSite` ở `app/page.tsx` bằng `components/marketing/JsonLd`. (S)
3. M10 ảnh OG mặc định (static `public/og.png` là cách rẻ nhất; nhớ `openGraph.images` ở `app/layout.tsx`). (S-M)
4. M11 viết lại 5 trang SEO cũ (bỏ câu hứa chưa có thật; liên kết `/blog/loi-moi-cuoi-hay-cho-thiep-online`, `/tinh-nang/mung-cuoi-qr`; xử lý nav "Công cụ" cho tới Phase 4). (M)
5. Sau khi chủ dự án cung cấp email và rà soát pháp lý: đặt `NEXT_PUBLIC_CONTACT_EMAIL`, sửa điều khoản/riêng tư theo góp ý. Khi chốt mô hình giá: cập nhật `/bang-gia` và câu "Dùng MỘC có mất phí không?" trong `lib/marketing/help.ts`.
6. Tuỳ chọn: `/lien-he`, RSS blog, `lastModified` cho trang tính năng.

**Quy tắc khi sửa nội dung:** đổi giới hạn trong `lib/content.ts` hoặc backend thì phải cập nhật `lib/marketing/*.ts`, `app/bang-gia/page.tsx` (đã lấy hằng số từ code) và `app/quyen-rieng-tu/page.tsx`. Thêm nút xoá thiệp ở Studio thì cập nhật mục "Studio có nút xoá thiệp không?" trong `help.ts` và mục "Quyền của bạn" trong trang riêng tư.

### Phase 3: Guest manager (0%)
Bảng `guests` (nhóm, bàn, số điện thoại, token cá nhân), link cá nhân `/invite/{slug}?g=token` thay `?to=`, RSVP gắn vào khách, thống kê theo nhóm/bàn, nhập CSV, sao chép/gửi link hàng loạt, xuất CSV. Cần: migration Flyway `V2`, API mới (chủ thiệp qua `X-Edit-Key`), tab "Khách mời" trong Studio. Cỡ XL. Không cần tài khoản (vẫn dùng edit key), nhưng khi có Phase 6 phải có luồng "nhận thiệp về tài khoản".

### Phase 4: 8 tool miễn phí (0%)
Phần lớn chạy phía trình duyệt, không cần BE, làm song song được: save-the-date (ảnh canvas + trang), tạo tin nhắn mời, tạo QR, seating chart (kéo thả), guest list (CSV), nén ảnh (đã có `lib/image-compress.ts`), nén video (ffmpeg.wasm). Mỗi tool cỡ M, tổng XL. Nên có trang `/cong-cu/<tool>` + liên kết chéo sang Studio.

### Phase 5: Đa ngôn ngữ (0%)
vi + en trước: khung i18n cho FE (next-intl hoặc tương đương), tách chuỗi, `content` phiên bản 2 có trường song ngữ (cập nhật zod + Jakarta Validation + fixture), Studio chỉnh song ngữ, trang khách chọn ngôn ngữ, `hreflang`. Cỡ L-XL. Đổi schema nên làm cùng lúc Phase 3 nếu được (một lần migrate).

### Phase 6: Video thiệp, tài khoản, thanh toán (0%)
Tài khoản (Supabase Auth hoặc Spring Security + JWT) + luồng "nhận thiệp cũ bằng edit key về tài khoản"; trial 3 ngày và giới hạn tính năng theo gói; thanh toán (VN: PayOS/VNPay/MoMo; hoặc Stripe); video thiệp (dựng phía server hoặc canvas + MediaRecorder). Cần pháp lý (điều khoản, riêng tư) trước khi thu tiền. Cỡ XL, rủi ro cao nhất, để sau cùng.

### Lệnh commit (chạy trong terminal, mỗi repo một lần)

FE (`thiep-cuoi-online-project`, nhánh `feat/invitation-core-phase1`). Nhóm 1 (tooling + docs + xoá `dist/`) **đã stage sẵn**; nếu `git status` cho thấy đã trống thì bỏ dòng đầu. Thứ tự dưới đây tách riêng phần marketing (Phase 2) trước khi gom phần còn lại:

```bash
git commit -m "chore: project tooling, docs and removal of the legacy static site"
git add lib/marketing tests/marketing.test.ts components/marketing app/tinh-nang app/tro-giup app/blog app/bang-gia app/dieu-khoan app/quyen-rieng-tu docs/superpowers/plans/2026-09-21-marketing-phase2.md && git commit -m "feat(marketing): features, help centre, blog, pricing and legal pages"
git add lib tests && git commit -m "feat(lib): pure invitation logic with tests"
git add components/invitation public && git commit -m "feat(invitation): renderer, 10 templates and archetype styles"
git add components/studio app/studio && git commit -m "feat(studio): editor, panels, publish flow and responses"
git add -A && git commit -m "feat(site): home, template gallery, guest page, header/footer, SEO pages and metadata"
```

BE (`Thiep-cuoi-online-backend`, đã `git init -b main`): `git add -A && git commit -m "feat: Spring Boot backend for invitations, RSVP, guestbook and media"`

Cách khác: cho phép `git commit` trong permissions của Claude Code để agent tự làm (memory `feedback-git-commit-blocked`).

## 4. Cần từ chủ dự án (đang chặn việc)

1. **Credentials Supabase** (project URL, service-role key, tên bucket) → test upload thật (T28).
2. **Nơi host backend**: chủ dự án trả lời "chưa quyết" (2026-09-21). Vercel không chạy Java. Gợi ý Render (dễ nhất, dùng `Dockerfile` có sẵn) / Fly.io / Railway / Cloud Run. Cần chọn 1 trước T28.
3. **Tên miền thật** (CORS, sitemap, OG, link chia sẻ, `NEXT_PUBLIC_SITE_URL` bắt buộc khi build production).
4. **Chạy các lệnh commit** ở mục 3 (hoặc cho phép `git commit` trong permissions).
5. **Email liên hệ** (đặt `NEXT_PUBLIC_CONTACT_EMAIL`): trợ giúp và trang riêng tư đang ghi "kênh liên hệ sẽ được công bố khi ra mắt".
6. **Rà soát pháp lý** `/dieu-khoan` và `/quyen-rieng-tu` (bản nháp viết theo luồng dữ liệu thật, chưa qua luật sư).
7. Trước Phase 6: mô hình giá + cổng thanh toán. Trước Phase 5: có cần ngôn ngữ ngoài vi/en không.
8. Đã chốt: làm Phase 2 (đang làm) trước; sau đó khuyến nghị Phase 3 (Guest manager).

## 4b. Môi trường máy khi dừng phiên (2026-09-21 khuya) và cách khởi động lại

| Thành phần | Trạng thái lúc dừng | Khởi động lại |
|---|---|---|
| Docker Desktop + Postgres (`thiep-cuoi-online-backend-db-1`, cổng 5433) | đang chạy, healthy | `open -a Docker`; `cd ../Thiep-cuoi-online-backend && docker compose up -d db` |
| Backend Spring Boot (cổng 8090, actuator 8081) | đang chạy, tách rời bằng `nohup`, log ở scratchpad `be.log`, **CORS cho cả `http://localhost:3000` và `http://localhost:3001`** | `cd ../Thiep-cuoi-online-backend && CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001 nohup ./mvnw -q spring-boot:run -Dspring-boot.run.arguments=--server.port=8090 > be.log 2>&1 &` (tắt cũ: `lsof -ti :8090 \| xargs kill`). Không đặt `CORS_ALLOWED_ORIGINS` thì chỉ cho phép 3000 |
| FE dev server cũ (pid 11155, cổng 3000) | **KẸT ở trạng thái `UE`**, không tắt được kể cả `kill -9` (hệ quả của lúc hết bảng file). Vì nó còn "giữ" thư mục, Next từ chối chạy `next dev` lần hai (báo "existing server"). Cổng 3000 vẫn bị chiếm nhưng không trả lời | Chờ nó thoát hoặc khởi động lại máy, sau đó `npm run dev`. Kiểm: `ps -p 11155 -o stat`, `lsof -ti :3000` |
| FE bản build (`next start`, cổng 3001) | đang chạy, phục vụ bản build MỚI NHẤT (42 trang). Đây là chỗ QA hiện tại | `npm run build && npx next start -p 3001`. Sau mỗi lần sửa code phải build lại và khởi động lại lệnh này (tắt cũ: `pkill -f "next start -p 3001"`) |
| `.env.local` (gitignored) | chỉ có `NEXT_PUBLIC_API_BASE_URL=http://localhost:8090` | thêm `NEXT_PUBLIC_SITE_URL=http://localhost:3001` nếu muốn canonical/sitemap của bản build đúng cổng (hiện là `localhost:3000`, build có in cảnh báo) |
| `codegraph serve` | 3 tiến trình rò rỉ ~170.000 file mở (làm đầy bảng file macOS, gây `ENFILE`) đã được TẮT với sự đồng ý của chủ dự án | nếu lặp lại: xem memory `reference-codegraph-fd-leak`, xin phép rồi mới tắt |
| Trình duyệt | Playwright đã đóng; chrome-devtools còn 1 tab (id 3, trỏ `http://localhost:3001/bang-gia`; là tab cuối nên không đóng được, để nguyên) | `browser_close`/`close_page` khi không dùng: mỗi trình duyệt giữ vài trăm đến hơn nghìn file mở |
| Git FE | 22 file đã stage (nhóm 1); phần còn lại chưa stage; `git commit` bị chặn | mục 3, "Lệnh commit" |
| Dữ liệu thử trong Postgres dev | vài thiệp thử (`qa-conflict-a`, `qa-b-429`, `so-xuan`/`thuy-mac` thử) | vô hại; xoá bằng cách `docker compose down -v` ở repo BE nếu muốn sạch |
| Scratchpad | `/private/tmp/claude-501/-Users-nguyenanhnhut-Desktop-Projects-thiep-cuoi-online-project/ec62f28b-68aa-4699-a1e2-eca13445df0e/scratchpad` (log be/dev, `qa.json`, `big.mp3`) | có thể xoá |

## 5. Nhật ký (mới nhất ở trên)

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
