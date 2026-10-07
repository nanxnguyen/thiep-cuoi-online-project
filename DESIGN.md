---
version: alpha
name: "MỘC Wedding"
description: "Thiệp cưới Việt trên nền giấy ngà, mực sẫm và dấu son; editor rõ ràng như một xưởng in nhỏ."
colors:
  ink: "#1a1412"
  paper: "#f8f4ee"
  paperAlt: "#efe6d9"
  surface: "#ffffff"
  line: "#e8dfd3"
  lineStrong: "#ddd2c4"
  muted: "#5e534b"
  faint: "#6b5f57"
  accent: "#a3161c"
  accentHover: "#7d0f14"
  gold: "#c9a86a"
  goldDeep: "#8a6425"
  night: "#1c1012"
  onDark: "#f1e7d6"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 400
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
  script:
    fontFamily: "Cormorant Garamond, Georgia, serif"
  hand:
    fontFamily: "Great Vibes, cursive"
rounded:
  small: "8px"
  default: "14px"
  large: "24px"
  full: "999px"
spacing:
  pageMax: "1280px"
  readMax: "1180px"
  narrowMax: "720px"
components:
  header: {}
  footer: {}
  button: {}
  invitationCover: {}
  studioPanel: {}
---

# MỘC Wedding Design System

## Overview

MỘC dành cho cặp đôi Việt muốn tự làm và gửi thiệp trên điện thoại; công việc chính là chọn mẫu, chỉnh sửa, xuất bản và nhận phản hồi. Nguồn đối chiếu là `design/*.dc.html`, nhất là `Site Header`, `Site Footer`, `Mau Thiep v2` và `Thiep Preview`. Vật liệu hình ảnh là giấy ngà, dấu son và đường kẻ vàng; không dùng dashboard SaaS xanh/tím hoặc card gradient chung chung. Header/footer/marketing là brand register; Studio và trang khách ưu tiên khả dụng. Mười cover A–J là điểm nhấn duy nhất; form và điều hướng cần yên tĩnh.

Runtime `app/styles/tokens.css` là nguồn token duy nhất (thang `--red/--gold/--ink-50..950`, token ngữ nghĩa, trạng thái, radius, spacing, shadow, type, motion), được `tests/design-system.test.ts` khoá giá trị, kiểm AA và cấm hex rời ngoài file token. Keyframes dùng chung ở `app/styles/motion.css`; primitive (`.button-primary`, `.button-ghost`, `.chip`, `.badge`, `.card`, `.eyebrow`, `.input`, `.wrap*`) ở `app/globals.css`. Frontmatter này ghi lại giá trị đã chốt, không sinh CSS. Font tải ở `app/layout.tsx` (body, display; script và hand không preload); bảng màu của từng thiệp là `lib/templates.ts`, đi qua `InvitationRenderer` tới CSS variables `--inv-*` và `--cover-*`. Khi đổi giá trị hệ thống phải cập nhật CSS và tài liệu cùng lúc.

## Colors

`paper` là nền site, `surface` cho khối nổi, `ink` cho chữ, `muted` cho mô tả, `line` cho ngăn cách. `accent` đỏ sơn mài là hành động chính và focus; `gold` dùng trang trí, `goldDeep` cho chữ trên nền sáng. `night`/`onDark` dành cho ranking và footer. `faint` là chữ chú thích; `paperAlt`/`lineStrong` cho section phụ và viền input/chip. Trạng thái khách dùng cặp `--ok/--warn/--neutral/--danger`.

Lệch có chủ đích so với design (AA): chữ phụ `#8a7d72` → `faint #6b5f57`; chữ vàng `#c9a86a` trên nền sáng → `goldDeep`; chữ footer `#7d7067` → `#8f8277`. Màu thiệp do từng mẫu quyết định, không áp bảng màu site lên nội dung khách.

## Typography

Playfair Display (400, h3 500) dùng cho tiêu đề và tên mẫu; Be Vietnam Pro cho nội dung, form và menu; Cormorant Garamond (`.script`) cho trích dẫn/tên trang trọng; Great Vibes (`.hand`) chỉ cho chữ ký cỡ lớn. Chữ nghiêng chỉ nhấn một vế ngắn trong heading. Tên/địa chỉ tiếng Việt giữ đủ dấu và được xuống dòng; không viết hoa toàn bộ đoạn dài.

## Layout

Nội dung site tối đa `--wrap: 1280px` (đọc `--wrap-read: 1180px`, pháp lý `--wrap-narrow: 720px`); gallery desktop bốn cột, Studio chọn mẫu ba cột bên cạnh preview và form. Mobile hai cột mẫu, không tràn ngang; form và hành động chính vẫn truy cập được. Thiệp khách có frame 390–480px, cover tỷ lệ 9:16; mọi ảnh có khung trước khi tải.

## Elevation & Depth

Giấy và đường kẻ là lớp nền. Shadow chỉ dùng cho card thiệp có thể chọn và panel Studio; không đổ bóng lên mọi section. Footer tối tạo điểm dừng thị giác, không thay nội dung chính.

## Shapes

Button CTA dạng pill (`--radius-full`); chip/input bo `--radius-s` 8px, card `--radius` 14px, card lớn `--radius-l` 24px; cover giữ tỷ lệ và góc riêng theo mẫu. Viền vàng mảnh là trang trí, không thay viền focus hoặc trạng thái chọn.

## Components

Header/footer là shared component. `GalleryCatalog` và Studio đọc chung registry mẫu/màu; preview và thiệp khách dùng chung `InvitationRenderer`. Chọn mẫu/màu phải có trạng thái pressed/selected và điều khiển bàn phím; lưu, xuất bản, lỗi mạng và form phản hồi giữ thông báo bằng chữ. Chuyển động ngắn cho phong bì và hover; `prefers-reduced-motion` vô hiệu hóa chuyển động trang trí.

Mọi vùng cuộn của ứng dụng kế thừa scrollbar toàn cục từ `app/globals.css`: track giấy ngà, thumb dùng token đường kẻ, có hover/active và trả quyền hiển thị về hệ thống trong forced-colors. Không ẩn scrollbar ở vùng cuộn do ứng dụng sở hữu; component chỉ được thay đổi hình học khi có lý do bố cục rõ ràng.

## 30 mẫu thiệp mới (2026-10-04, catalog 50)

Sáu collection mới, mỗi mẫu một cover family riêng dưới `components/templates/covers/` (một file một family, CSS theo collection), dispatch exhaustive qua `coverRenderers`:

- **Di sản Việt** (`heritage.css`): Ấn Son, Phụng Vũ, Liên Hoa, Lam Sứ, Tơ Hồng — profile `heritage`, ornament `heritage`.
- **Vườn hoa và địa điểm** (`garden.css`): Vườn Kính, Mai Lan, Vườn Ép Hoa, Nơi Mình Hẹn, Dạ Hoa — profile `garden`.
- **Editorial ảnh cưới** (`editorial.css`): Khung Điện Ảnh, Phòng Tối, Song Ảnh, Ghi Chú Bên Ảnh, Tạp Chí Cưới — profile `editorial-photo`.
- **Quiet luxury** (`quiet-luxury.css`): Dập Nổi Ngà, Nhung Đêm, Sâm Panh, Ngọc Trai, Thạch Vân — profile `quiet-luxury`.
- **Kỷ vật và câu chuyện** (`story.css`): Nhật Ký Đôi Mình, Chung Một Hành Trình, Quán Quen, Ngày Mình Chọn, Gia Bảo — profile `story-led`.
- **Đương đại** (`expressive.css`): Chữ Chuyển Nhịp, Khối Hỷ, Chúng Mình, Cắt Giấy, Duyên Tinh Tú — profile `expressive`.

Section profile (`lib/section-profiles.ts`) chỉ sắp xếp các section trong `<main>`; phong bì, nhạc và nút thêm-lịch giữ nguyên shell. 20 mẫu gốc A–T dùng profile `default`; ID, tên, SEO, palette, sample và thứ tự section giữ ổn định. Theo xác nhận của chủ dự án ngày 2026-10-04, 5 mẫu Hỷ Sự, Vườn Ươm, Nhung Lam, Thư Tình và Chân Dung dùng cover P–T của design hiện hành (snapshot trong `tests/templates.test.ts`).

Bốn section mới (Story, Video, DressCode, Venue) dùng shared component và biến thể theo profile; content v2 đọc được dữ liệu v1 qua `upgradeV1` (`lib/content.ts`).

Asset: mọi ornament của 30 mẫu mới là CSS/SVG vẽ riêng (`original`), ảnh mẫu tái dùng ảnh `public/photos/` có sẵn; `refs/` mặc định `reference-only`, không copy sang production. Manifest: `lib/template-assets.ts`, audit: `docs/design/template-asset-audit.md`.

Màu cover mới chạy qua biến `--cv-deep/--cv-paper/--cv-gold` do `ThiepPreview` truyền từ palette registry (`lib/templates.ts`); không hex rời ngoài token và registry. Thêm family mới: thêm slug vào `NEW_FAMILIES` + meta trong `lib/covers.ts`, thêm renderer vào `coverRenderers` (typecheck bắt exhaustive), thêm catalog row + sample + SEO trong `lib/templates.ts`.

## Mobile (≤767px): độ lệch có chủ đích so với design/

`design/` chỉ có mockup desktop (spec 2026-10-07, D4), nên giao diện điện thoại do MỘC tự thiết kế và chỉ cộng thêm: mọi rule nằm trong block `@media (max-width: 767px)` (thêm 479/359px khi cần) ở cuối file CSS sở hữu selector, không dòng CSS cũ nào bị sửa. Desktop không đổi: snapshot layout 768/1024/1280/1440px trước và sau phase cho 0 khác biệt (`scripts/layout-probe.js`, `scripts/layout-diff.ts`).

- Token: `--m-*` trong `app/styles/tokens.css` (gutter 20px, section 56px, h1 hero `clamp(34px, 10vw, 42px)`, nút cao 44px chữ 14px, vùng chạm 44px, input 16px). `--fs-h1/h2/h3` được ghi đè dưới 768px.
- Mẫu: hero gọn với cặp CTA đứng cạnh nhau; danh sách dài thành hàng vuốt ngang (thẻ tính năng Trang chủ, bảng xếp hạng, họ bìa ở /demo); menu thành sheet toàn chiều ngang có nền tối; hộp thoại đăng nhập/xuất bản thành bottom sheet; lưới mẫu 2 cột với nút dưới ảnh; `/studio` đặt chọn mẫu lên trước kèm thanh "Tiếp tục" dính đáy; cặp nút ở `/templates/[id]` dính đáy màn hình.
- Trang khách chỉ đổi khi `data-mode="live"` (input 16px để iOS không zoom, vùng chạm 44px). Preview trong Studio và `/templates/[id]?preview=1` giữ đúng giá trị design vì dùng chung renderer.
- Vùng chạm nhóm chấm màu ≥24px (WCAG 2.5.8), phần còn lại ≥44px.
- Không `viewport-fit=cover` và không safe-area: site chạy `display: "browser"`. `viewport` export chỉ thêm `themeColor` (ivory) và `interactiveWidget: "resizes-content"`.
- Spec: `docs/superpowers/specs/2026-10-07-mobile-first-design.md`.

## Do's and Don'ts

- Dùng đúng tên 16 mẫu và palette trong design v2; ID cũ chỉ là alias dữ liệu.
- Giữ nội dung thiệp thật, RSVP, link riêng khách và autosave khi đổi UI.
- Không thêm thông điệp trial/thanh toán vì sản phẩm hiện miễn phí.
- Blog (`/blog`) không có mockup trong `design/` (đã gỡ ở đợt 26–27/09), nên là ngoại lệ có chủ đích: chỉ dùng token, primitive `mk-*` và Playfair/Be Vietnam Pro; mục lục, khối mẹo, thẻ liên kết và ảnh bìa là phần bổ sung riêng của blog (`components/blog/blog.css`).
- Không thay khả năng đọc, focus hay lỗi form để đổi lấy ảnh giống design.
