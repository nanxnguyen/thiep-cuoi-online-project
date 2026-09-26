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

## Do's and Don'ts

- Dùng đúng tên 16 mẫu và palette trong design v2; ID cũ chỉ là alias dữ liệu.
- Giữ nội dung thiệp thật, RSVP, link riêng khách và autosave khi đổi UI.
- Không thêm thông điệp trial/thanh toán vì sản phẩm hiện miễn phí.
- Không thay khả năng đọc, focus hay lỗi form để đổi lấy ảnh giống design.
