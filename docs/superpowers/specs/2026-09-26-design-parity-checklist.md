# MỘC design parity checklist

Phạm vi: các design component đã được port sang Next.js FE. `matched` nghĩa là cấu trúc và luồng chính đã có trong route app; `deviated` là khác có chủ đích; `blocked` là phần cần dữ liệu hoặc contract Supabase. `Stock*`, `stock-tokens.*` và `Mau Thiep.dc.html` (v1) không thuộc checklist.

| Design source | App route | Status | Evidence |
|---|---|---|---|
| `Wedding Design System.dc.html` | design reference only | `matched` | `app/styles/tokens.css`, `DESIGN.md` |
| `Site Header.dc.html` | shared shell | `matched` | `components/site/SiteHeader.tsx`, `components/site/MobileMenu.tsx` |
| `Site Footer.dc.html` | shared shell | `matched` | `components/site/SiteFooter.tsx` |
| `Trang Chu.dc.html` | `/` | `deviated: testimonial demo đổi thành dải sự thật sản phẩm; 10 mẫu đổi thành 16 mẫu thật` | `app/page.tsx` |
| `Tinh Nang.dc.html` | `/tinh-nang` | `matched` | `app/tinh-nang/page.tsx` |
| `Tinh Nang Chi Tiet.dc.html` | `/tinh-nang/[slug]` | `matched` | `app/tinh-nang/[slug]/page.tsx` |
| `Bang Gia.dc.html` | `/bang-gia` | `deviated: dùng copy “Miễn phí mọi mẫu”` | `app/bang-gia/page.tsx` |
| `Ung Ho.dc.html` | `/ung-ho` | `matched` | `app/ung-ho/page.tsx` |
| `Tro Giup.dc.html` | `/tro-giup` | `matched` | `app/tro-giup/page.tsx` |
| `Phap Ly.dc.html` | `/dieu-khoan`, `/quyen-rieng-tu` | `matched` | `components/marketing/LegalBody.tsx` |
| `Tao Thiep Cuoi.dc.html` | `/tao-thiep-cuoi` | `deviated: giữ copy SEO và link liên quan của sản phẩm` | `components/seo/SeoLandingPage.tsx` |
| `Thiep Cuoi Online Mien Phi.dc.html` | `/thiep-cuoi-online-mien-phi` | `deviated: giữ copy SEO và link liên quan của sản phẩm` | `components/seo/SeoLandingPage.tsx` |
| `QR Tien Mung.dc.html` | `/qr-tien-mung` | `deviated: copy “tải ảnh QR” sửa theo khả năng thật` | `components/seo/SeoLandingPage.tsx` |
| `Tin Nhan Moi Cuoi.dc.html` | `/tin-nhan-moi-cuoi` | `deviated: copy “offline” sửa theo khả năng thật` | `components/seo/SeoLandingPage.tsx` |
| `Cong Cu.dc.html` | `/cong-cu-dam-cuoi` | `matched` | `app/cong-cu-dam-cuoi/page.tsx` |
| `CC Tao QR.dc.html` | `/cong-cu/tao-qr` | `matched` | `components/tools/QrTool.tsx` |
| `CC Nen Anh.dc.html` | `/cong-cu/nen-anh` | `matched` | `components/tools/ImageCompressTool.tsx` |
| `CC Tin Nhan.dc.html` | `/cong-cu/tin-nhan-moi` | `matched` | `components/tools/InviteMessageTool.tsx` |
| `CC Danh Sach Khach.dc.html` | `/cong-cu/danh-sach-khach` | `matched` | `components/tools/GuestListTool.tsx` |
| `CC So Do Cho Ngoi.dc.html` | `/cong-cu/so-do-cho-ngoi` | `matched` | `components/tools/SeatingTool.tsx` |
| `CC Save The Date.dc.html` | `/cong-cu/save-the-date` | `matched` | `components/tools/SaveTheDateTool.tsx` |
| `Studio.dc.html` | `/studio` | `matched` | `components/studio/StudioHome.tsx` |
| `Studio Editor v3.dc.html` | `/studio/[id]` | `blocked: Supabase cho contract persist của phong bì, thứ bậc, lịch trình, toggle section và album layout` | `components/studio/Editor.tsx`, `lib/editor-sections.ts` |
| `Tai Khoan.dc.html` | `/account` | `blocked: Supabase cho ô tên khi đăng ký và số RSVP/lời chúc trên card` | `components/account/AccountClient.tsx` |
| `Mau Thiep v2.dc.html` | `/templates` | `matched` | `app/templates/page.tsx`, `components/templates/GalleryCatalog.tsx` |
| `Mau Thiep Chi Tiet.dc.html` | `/templates/[id]` | `matched` | `app/templates/[id]/page.tsx` |
| `Thiep Preview.dc.html` | `/demo` | `matched` | `app/demo/page.tsx`, `components/templates/PreviewDemo.tsx` |
| `Thiep Mau Day Du.dc.html` | `/studio/[id]` preview mode | `matched` | `components/studio/Editor.tsx` |
| `Thiep Khach.dc.html` | `/invite/[slug]` | `blocked: Supabase cho lời chào phong bì riêng, giờ đón khách và duyệt lưu bút` | `components/invitation/client/InvitationShell.tsx` |

## Accepted global deviations

- Màu chữ được đổi để đạt WCAG AA; chi tiết nằm trong `DESIGN.md`.
- Nhạc là nút nổi, không phải section riêng.
- FAQ vẫn giữ ở trang Tính năng vì cần cho SEO.
- `CC Nen Video.dc.html` không có trong design source; route `/cong-cu/nen-video` vẫn là FE surface riêng.

## Supabase blockers

Các blocker trên chỉ được gỡ sau migration Supabase và contract content v3: greeting phong bì, schedule, family rank, section toggles, album layout, reception time, guest name at RSVP, RSVP/wish counts on account cards, và wish moderation.

## P6 browser evidence (2026-09-26)

- Production FE: `next start -p 3001`, fallback Playwright MCP vì phiên này không có `node_repl` browser tool.
- Public route sweep: 24 routes × 2 viewport (`390` và `1280`) = 48 lượt, tất cả `HTTP 200`, không overflow ngang.
- Dynamic surface smoke: `/account` và `/studio` = `HTTP 200`, không overflow ở cả hai viewport.
- `/studio/demo#k=` trả `404` và `/invite/demo?to=` trả `500` vì không có record/BE seed trong môi trường này; không dùng làm lỗi parity FE.
- Console: 0 error trên public route sweep; Next production sinh cảnh báo preload CSS chunk. Dynamic invite có lỗi kết nối do BE chưa chạy.
