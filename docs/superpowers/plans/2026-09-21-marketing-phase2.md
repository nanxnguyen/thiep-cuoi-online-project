# MỘC Wedding Phase 2: Marketing site

> Trạng thái sống nằm ở `PROGRESS.md` (mục 1 và 3). File này là kế hoạch chi tiết của Phase 2. Chủ dự án chọn làm Phase 2 sau Phase 1 (2026-09-21).

**Mục tiêu:** đủ trang giới thiệu để người lạ hiểu sản phẩm, tin tưởng và bắt đầu tạo thiệp: tính năng, trợ giúp, blog, bảng giá (giai đoạn miễn phí), điều khoản, quyền riêng tư. Thiết kế cùng ngôn ngữ với trang chủ (ngà, đỏ lacquer, vàng foil, chữ serif).

## Nguyên tắc nội dung (bắt buộc)

- **Chỉ nói điều sản phẩm làm được thật.** Mọi con số (tối đa 6 sự kiện, 24 ảnh, 3 câu hỏi RSVP, 2 tài khoản mừng cưới, ảnh tự nén, mp3 ≤ 8MB, đường dẫn bị khoá sau lần xuất bản đầu) lấy từ code (`lib/content.ts`, backend). Đổi code thì đổi nội dung.
- **Không bịa giá, không bịa thông tin liên hệ, không bịa số liệu người dùng.** Trang giá chỉ nói giai đoạn miễn phí hiện tại và liệt kê "sắp có" không kèm giá.
- Không sao chép chữ hay bố cục của chungdoi.com; toàn bộ là chữ viết riêng cho MỘC.
- Điều khoản và quyền riêng tư viết đúng theo luồng dữ liệu thật; **cần chủ dự án rà soát pháp lý trước khi ra mắt** (ghi ở PROGRESS).
- Liên hệ: chỉ hiện email khi có `NEXT_PUBLIC_CONTACT_EMAIL` (chủ dự án cung cấp), không để chỗ trống hay email giả.

## Kiến trúc

- Nội dung là **dữ liệu TypeScript thuần** trong `lib/marketing/` (không MDX, không thêm phụ thuộc), có test: `features.ts`, `help.ts`, `blog.ts`.
- UI dùng chung ở `components/marketing/` (`PageHero`, `FaqList` dùng `<details>` gốc, `JsonLd`, `Prose`) + `marketing.css`. Trang dùng `SiteHeader`/`SiteFooter` hiện có.
- Route (tiếng Việt, không dấu): `/tinh-nang`, `/tinh-nang/[slug]`, `/tro-giup`, `/blog`, `/blog/[slug]`, `/bang-gia`, `/dieu-khoan`, `/quyen-rieng-tu`. Trang động dùng `generateStaticParams` (SSG).
- SEO: `generateMetadata` + canonical từng trang, JSON-LD (`FAQPage` ở trợ giúp, `Article` ở blog, `BreadcrumbList` ở tính năng), sitemap gồm mọi trang mới.

## Task

| # | Việc | Xong khi |
|---|---|---|
| M1 | `lib/marketing/{features,help,blog}.ts` + `tests/marketing.test.ts` (slug duy nhất, tham chiếu `related` hợp lệ, ngày hợp lệ, không trống) | `npm test` xanh |
| M2 | `components/marketing/*` + `marketing.css` | typecheck sạch |
| M3 | `/tinh-nang` + `/tinh-nang/[slug]` (8 tính năng) | build ra đủ trang tĩnh |
| M4 | `/tro-giup` (FAQ theo nhóm + JSON-LD) | |
| M5 | `/blog` + `/blog/[slug]` (5 bài) | |
| M6 | `/bang-gia`, `/dieu-khoan`, `/quyen-rieng-tu` | |
| M7 | Nav header/footer, sitemap, liên kết chéo từ trang chủ và trang SEO cũ | sitemap có đủ URL |
| M8 | QA cuối phase (Playwright 390 và 1280, Lighthouse a11y/SEO), ghi PROGRESS | theo quy ước "test sau khi xong phase" |

## Trạng thái (cập nhật 2026-09-21 khuya)

Nguồn sự thật là `PROGRESS.md` mục 2b. Tóm tắt: **M1-M7 XONG** (nội dung + component + 8 trang tính năng + trợ giúp + 5 bài blog + giá + điều khoản + riêng tư + menu di động/footer/sitemap 36 URL). **M8 xong một phần** (Playwright 390/1280 đạt, Lighthouse 100 ở 4 trang; còn `/tinh-nang` sau sửa heading, `/blog`, `/dieu-khoan`, `/quyen-rieng-tu`). **Thêm mới, chưa làm:** M9 JSON-LD `Organization`+`WebSite` cho trang chủ, M10 ảnh OG mặc định, M11 viết lại 5 trang SEO cũ (có câu hứa chưa có thật ở `/tin-nhan-moi-cuoi` và `/cong-cu-dam-cuoi`). **Chờ chủ dự án:** email liên hệ, rà soát pháp lý, mô hình giá.

