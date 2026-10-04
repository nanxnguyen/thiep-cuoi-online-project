# Mộc — Design Tokens

Design system dùng cho toàn bộ site "Mộc — Thiệp cưới online". Mọi giá trị dưới đây được viết trực tiếp bằng inline style trong các file `.dc.html` (không có file CSS trung tâm) — dùng bảng này làm nguồn tham chiếu khi FE port sang React/Vue/Tailwind/CSS variables.

## 1. Màu sắc

### Nền & chữ chính
| Token | Hex | Dùng cho |
|---|---|---|
| `color-bg` | `#f8f4ee` | Nền chính toàn site (kem ngà) |
| `color-bg-alt` | `#efe6d9` / `#e9e2d6` | Nền section phụ, card sáng |
| `color-ink` | `#1a1412` | Chữ chính, nền tối phụ |
| `color-ink-soft` | `#5e534b` | Chữ phụ / mô tả |
| `color-ink-faint` | `#8a7d72` | Chữ chú thích, meta |
| `color-border` | `#e8dfd3` / `#ddd2c4` / `#e0d5c6` | Viền, đường kẻ |

### Thương hiệu
| Token | Hex | Dùng cho |
|---|---|---|
| `color-primary` | `#a3161c` | Đỏ chủ đạo — nút CTA, badge HOT, nhấn |
| `color-primary-hover` | `#7d0f14` | Hover của primary |
| `color-primary-deep` | `#8e1b1f` / `#6e1216` | Nền đỏ đậm (phong bì, section) |
| `color-gold` | `#c9a86a` / `#8a6425` | Chữ nhấn phụ, italic keyword, viền vàng |
| `color-dark` | `#1c1012` | Nền tối (dark section, footer) |

### Bảng màu mẫu thiệp (palette hệ `PAL`, dùng trong Thiep Preview / Mau Thiep v2 / Studio)
| Tên | deep | paper | gold |
|---|---|---|---|
| Đỏ (`do`) | `#8e1b1f` | `#f7efe3` | `#e0bb74` |
| Đỏ đậm (`dodam`) | `#5a1119` | `#f5ece2` | `#d4ac6a` |
| Nâu (`nau`) | `#6b4a33` | `#f3ece2` | `#b88a55` |
| Lam (`lam`) | `#1f3a5f` | `#eef1f4` | `#c9ab72` |
| Xanh rêu (`xanh`) | `#24493a` | `#eef1ea` | `#c9a86a` |
| Hồng (`hong`) | `#a4505f` | `#fbf1ef` | `#d8a977` |
| Vàng kim (`vang`) | `#7a5a22` | `#f7f0e0` | `#e3c27e` |
| Ô liu (`oliu`) | `#5a6636` | `#f2f1e6` | `#c8b07a` |
| Mực (`muc`) | `#1a1412` | `#f4f1ec` | `#c9a86a` |
| Tím (`tim`) | `#4b3566` | `#f2eff5` | `#c7a878` |

### Trạng thái
| Token | Hex | Dùng cho |
|---|---|---|
| `color-success-bg` / `-fg` | `#e7eee6` / `#24493a` | Badge "Tham dự", trạng thái xong |
| `color-warning-bg` / `-fg` | `#f5efe0` / `#7a5a22` | Badge "Chưa chắc" |
| `color-neutral-bg` / `-fg` | `#efe6d9` / `#8a7d72` | Badge "Chưa trả lời" |
| `color-danger-bg` / `-fg` | `#f5e3e1` / `#8e1b1f` | Trạng thái xoá/vắng mặt |

## 2. Font chữ

| Token | Font family | Dùng cho |
|---|---|---|
| `font-body` | `'Be Vietnam Pro', sans-serif` (300/400/500/600) | Toàn bộ body text, nút, form |
| `font-display` | `'Playfair Display', serif` (400/500/600, italic 400/500) | Heading, số thứ tự, logo "MỘC" |
| `font-script` | `'Cormorant Garamond', serif` (400/500, italic) | Trích dẫn, tên cô dâu chú rể trên thiệp, chữ trang trí |
| `font-hand` | `'Great Vibes', cursive` | Chữ ký tên trên thiệp (chỉ dùng cho tên riêng, cỡ lớn) |

Load qua Google Fonts trong mỗi `<helmet>`. Khi port sang codebase riêng: self-host hoặc `next/font` với đúng 4 family + trọng số trên.

## 3. Cỡ chữ (thang không chính thức, theo ngữ cảnh)

| Vai trò | Kích thước |
|---|---|
| Hero H1 | `clamp(38px, 5.6vw, 96px)` |
| H2 section | `clamp(32px, 4.4vw, 60px)` |
| H3 card | `19–30px` |
| Body | `14–17px` |
| Caption / eyebrow | `11–13px`, letter-spacing `0.14em–0.4em`, uppercase |

## 4. Spacing & bố cục

- Container chính: `max-width: 1280px` (marketing), `1080–1180px` (nội dung đọc), `720px` (bài viết/pháp lý).
- Padding section: `72–120px` theo chiều dọc, `32px` theo chiều ngang (mobile-safe).
- Gap chuẩn: `8 / 12 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 56px` (grid/flex `gap`, không dùng margin rời).
- Bo góc: `8px` (chip nhỏ), `10–16px` (card), `18–24px` (card lớn/section nổi bật), `999px` (pill button, badge).

## 5. Bóng đổ (shadow)

| Token | Value | Dùng cho |
|---|---|---|
| `shadow-card` | `0 12px 32px -14px rgba(26,20,18,.3)` | Card mẫu thiệp mặc định |
| `shadow-card-hover` | `0 30px 50px -24px rgba(26,20,18,.45)` | Card khi hover |
| `shadow-float` | `0 18px 36px -18px rgba(26,20,18,.35)` | Card nổi (feature icon, toast) |
| `shadow-deep` | `0 40px 80px -40px rgba(0,0,0,.8)` | Khối lớn trên nền tối |

## 6. Animation

### Thời lượng & easing chuẩn
- Micro-interaction (hover, nút): `200–350ms`, `ease` hoặc `cubic-bezier(.2,.7,.2,1)`.
- Reveal khi cuộn trang: `900ms`, `cubic-bezier(.2,.7,.2,1)`, dịch chuyển dọc `36–40px → 0`.
- Vòng lặp (float, marquee, đếm ngược): `4–12s`, `linear` hoặc `ease-in-out infinite`.

### Thư viện keyframes đang dùng (định nghĩa trong `<helmet><style>` mỗi trang)
`fadeUp`, `fadeIn`, `swapIn`, `popIn`, `bob`/`bobble`, `floaty`, `sway`, `fall`/`petFall`, `flapOpen`, `cardRise`, `marqueeL`/`marqueeR`, `eq` (equalizer), `scan` (QR), `pin`/`ripple` (bản đồ), `grow` (progress bar), `type`/`caret` (typewriter), `shimmer` (chữ ánh kim), `spinSlow`/`spin`, `heart`, `fanA`/`fanB`, `openA`, `toast`, `zeroIn`, `pulseSave`/`pulseDot`.

Quy tắc: mỗi trang tự khai báo lại các `@keyframes` nó dùng (không import chung) — khi port sang CSS thật, gom vào 1 file `animations.css` dùng chung.

### Nguyên tắc chuyển động
- Ưu tiên `IntersectionObserver` cho reveal-on-scroll (`data-reveal`, `data-delay`), không animate khi phần tử đã trong viewport lúc tải trang.
- Marquee/dải mẫu thiệp dừng khi hover (`animation-play-state: paused`).
- Đồng hồ đếm ngược, thanh tiến độ cuộn trang (`scrollPct`) chạy bằng state thật (interval/scroll listener), không phải CSS thuần.
- Chưa xử lý `prefers-reduced-motion` — **cần bổ sung** khi tích hợp thật: bọc toàn bộ animation-duration trong media query để tắt/giảm khi user bật giảm chuyển động.

## 7. Component pattern lặp lại

- **Nút chính (primary)**: nền `color-primary`, chữ trắng, bo `999px`, padding `14–18px 26–32px`, hover đổi nền `color-primary-hover` + có thể `translateY(-2px)`.
- **Nút phụ (outline)**: viền `1px solid color-ink`, nền trong suốt, hover đảo màu (nền đen chữ trắng).
- **Badge/pill**: nền nhạt theo trạng thái, chữ đậm màu tương phản, bo `999px`, cỡ chữ `10–12px`.
- **Card mẫu thiệp**: bo `8–14px`, `box-shadow: shadow-card`, hover nâng `translateY(-6px)` + đổi shadow.
- **Chip filter**: viền `#ddd2c4`, active = nền đen chữ kem.

## 8. Cách tích hợp cho FE

1. Copy bảng màu ở mục 1 thành CSS variables (`:root { --color-primary: #a3161c; ... }`) hoặc Tailwind `theme.extend.colors`.
2. Copy 4 font family ở mục 2 vào `next/font` hoặc `@font-face`.
3. Chuẩn hoá spacing/radius/shadow ở mục 3–5 thành token scale (Tailwind `spacing`/`borderRadius`/`boxShadow`).
4. Gom các `@keyframes` ở mục 6 vào 1 file animation dùng chung, thêm `@media (prefers-reduced-motion: reduce)` để tắt.
5. Palette mẫu thiệp (`PAL`) và danh sách mẫu (`TPL`) hiện là data hard-code trong từng file JS — nên tách thành 1 file dữ liệu chung (`templates.json`) khi có backend thật.
