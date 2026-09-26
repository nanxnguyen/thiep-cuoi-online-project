# Mộc — Thiệp cưới online

Website tạo và gửi thiệp cưới online miễn phí cho người Việt. Cô dâu chú rể chọn mẫu, điền thông tin theo từng phần, xem trước trực tiếp rồi xuất bản thành 1 đường link riêng; mỗi khách mời nhận link có tên riêng (`?to=`), mở phong bì, xem thiệp, xác nhận tham dự, viết lưu bút và mừng cưới qua QR.

## Mục lục
1. Mục tiêu & phạm vi
2. Kiến trúc kỹ thuật
3. Luồng người dùng chính
4. Danh sách trang
5. Cấu trúc nội dung thiệp (14 phần)
6. Design system
7. Cách chạy
8. Nhật ký thay đổi
9. Ghi chú & việc còn lại

---

## 1. Mục tiêu & phạm vi

- **Người dùng:** cặp đôi sắp cưới (tạo thiệp) và khách mời (xem thiệp trên điện thoại).
- **Giá:** 0đ cho toàn bộ tính năng; có trang Ủng hộ tự nguyện.
- **Giọng thương hiệu:** ấm áp, trang trọng vừa phải, không sến. Nền kem ngà, đỏ truyền thống làm điểm nhấn, vàng kim cho chi tiết.
- **Phạm vi hiện tại:** prototype giao diện đầy đủ, dữ liệu lưu cục bộ (state / localStorage). Chưa có backend, đăng nhập thật, thanh toán hay lưu trữ ảnh.

## 2. Kiến trúc kỹ thuật

- Mỗi trang là 1 **Design Component** (`.dc.html`): mở trực tiếp bằng browser, không cần build.
- Style viết **inline** trên từng phần tử (không có stylesheet chung). `<helmet><style>` chỉ chứa `@font-face`/link font, `@keyframes`, reset body.
- Logic trong class `Component extends DCLogic` (state, handler, `renderVals()`).
- Component dùng lại qua `<dc-import name="...">`: `Site Header`, `Site Footer`, `Thiep Preview`.
- Ảnh là ô kéo/thả `<image-slot>` (`image-slot.js`); `support.js` là runtime hệ thống — không sửa.
- Tham số trang qua query string: `?slug=`, `?id=`, `?doc=`, `?to=`; khôi phục thiệp qua hash `#k=`.
- Dịch vụ ngoài: `api.qrserver.com` (tạo QR trong công cụ), Claude (gợi ý lời cảm ơn, có fallback).

## 3. Luồng người dùng chính

1. **Khám phá:** Trang chủ → Mẫu thiệp v2 → Chi tiết mẫu.
2. **Tạo thiệp:** Studio (chọn mẫu, tên, ngày) → Studio Editor v3 (điền 14 phần, xem trước live).
3. **Xuất bản:** cửa sổ Xuất bản liệt kê phần còn thiếu → đặt link → confetti → chia sẻ (Zalo, Messenger, sao chép link).
4. **Gửi khách:** mỗi khách 1 link có tên (`Thiep Khach?to=Tên`), dùng kèm công cụ Tin nhắn mời / Danh sách khách.
5. **Khách xem:** mở phong bì → thiệp → xác nhận tham dự → lưu bút → mừng cưới QR → lời cảm ơn.
6. **Quản lý:** Tài khoản → danh sách thiệp đã tạo, nhận lại thiệp bằng link `#k=`.

## 4. Danh sách trang (17 trang + file dùng chung)

Menu (Site Header): Mẫu thiệp, Tính năng, Công cụ, Trợ giúp, Tài khoản, Tạo thiệp.
Site Footer trỏ tới toàn bộ trang còn lại (Sản phẩm, Công cụ, Hỗ trợ, Pháp lý).

### File dùng chung
| File | Chức năng |
|---|---|
| `Site Header.dc.html` | Header mọi trang: logo, 4 menu, nút Tài khoản + Tạo thiệp |
| `Site Footer.dc.html` | Footer: CTA tạo thiệp, 4 cột link, dòng bản quyền |
| `Thiep Preview.dc.html` | Render 1 mẫu thiệp (10 kiểu A–J). Mở riêng trên desktop: rộng 70% trang. Prop `fit` + `maxW` để co giãn theo khung (v3); prop `full` hiện đủ các phần nội dung |
| `Thiep Mau Day Du.dc.html` | Thiệp mẫu điền đủ 14 phần (Thu Hà & Quốc Bảo, 12/12/2026), mở sẵn chế độ Xem như khách; bấm "Chỉnh sửa" để sửa |
| `Wedding Design System.dc.html` | Trang trình bày design system Mộc (màu, font, cỡ chữ, spacing, bóng, component, animation, đối chiếu các trang) |
| `design.md` | Bản văn bản của design system, dành cho FE khi port sang codebase thật |
| `Stock Design System.dc.html`, `stock-tokens.css`, `stock-tokens.json` | Design system khác (tông xanh, dùng cho ứng dụng chứng khoán) — **không dùng** cho site Mộc |
| `image-slot.js`, `support.js` | File hệ thống, không phải trang |

### 4.1 Trang chủ & marketing
| Trang | Trỏ đến | Chức năng chính |
|---|---|---|
| `Trang Chu.dc.html` | Studio, Mẫu thiệp, Tính năng, Công cụ, Bảng giá, Ủng hộ | Hero có animation phong bì mở (tilt theo chuột), dải mẫu thiệp cuộn ngang, dải trích dẫn khách, khối thống kê đếm số, 3 bước dùng, 8 tính năng minh hoạ động, demo link riêng khách, 7 công cụ, bảng giá, CTA cuối trang |
| `Tinh Nang.dc.html` | Tinh Nang Chi Tiet | 8 tính năng, thanh chuyển nhanh, mỗi mục có minh hoạ + "Tìm hiểu thêm" |
| `Tinh Nang Chi Tiet.dc.html` (?slug=) | Studio | Chi tiết 1 tính năng, điều hướng trước/sau |
| `Bang Gia.dc.html` | Studio, Ủng hộ | Bảng giá 0đ, danh sách đã có/đang làm, khối ủng hộ |
| `Ung Ho.dc.html` | — | Trang ủng hộ tự nguyện (thông tin ngân hàng để trống) |
| `Tro Giup.dc.html` | Phap Ly | 25 câu hỏi, lọc theo 6 nhóm, tìm kiếm |
| `Phap Ly.dc.html` (?doc=) | — | Điều khoản sử dụng / Quyền riêng tư (2 tab) |
| `Tao Thiep Cuoi.dc.html` | Studio | Landing SEO: tạo thiệp trong 15 phút |
| `Thiep Cuoi Online Mien Phi.dc.html` | Studio | Landing SEO: miễn phí toàn bộ |
| `QR Tien Mung.dc.html` | Studio | Landing SEO: mừng cưới QR |
| `Tin Nhan Moi Cuoi.dc.html` | Cong Cu | Landing SEO: mẫu tin nhắn mời kèm link thiệp |

### 4.2 Sản phẩm
| Trang | Trỏ đến | Chức năng chính |
|---|---|---|
| `Studio.dc.html` | Studio Editor v3 | Chọn 1 trong 10 mẫu, nhập tên & ngày cưới, xem trước trực tiếp |
| `Studio Editor v3.dc.html` | Thiep Khach, Cong Cu | **Bản chính thức.** 3 cột: danh sách phần → form → xem trước. Bật/tắt phần tuỳ chọn; vòng % hoàn thiện; bấm vào thiệp để nhảy tới phần tương ứng, chọn phần thì thiệp tự cuộn tới và gắn nhãn "ĐANG SỬA"; "Xem như khách" đổi tên khách; khung điện thoại/máy tính; cửa sổ Xuất bản. Màn hình < 1024px: xem trước toàn màn, danh sách & form mở dạng bottom-sheet |
| `Tai Khoan.dc.html` | Studio, Studio Editor v3, Thiep Khach | Đăng nhập/đăng ký (demo), dán link `#k=` để nhận thiệp cũ, danh sách thiệp đã tạo |

### 4.3 Mẫu thiệp
| Trang | Trỏ đến | Chức năng chính |
|---|---|---|
| `Mau Thiep.dc.html` | — | v1, giữ lại để so sánh |
| `Mau Thiep v2.dc.html` | Mau Thiep Chi Tiet, Studio | Bản chính thức: bảng xếp hạng cuộn ngang, lọc theo phong cách + màu, 16 mẫu, đổi màu ngay trên thẻ |
| `Mau Thiep Chi Tiet.dc.html` (?id=) | Studio | 1 mẫu: đổi màu, mô tả, tính năng đi kèm |

### 4.4 Trang khách
| Trang | Chức năng chính |
|---|---|
| `Thiep Khach.dc.html` (?to=) | Phong bì mở (hiệu ứng nổ nhẹ), cover, gia đình, đếm ngược flip-clock, album, nhạc nền, xác nhận tham dự (tick vẽ dần), sổ lưu bút, mừng cưới QR, cảm ơn — các phần hiện dần so le khi cuộn |

### 4.5 Công cụ miễn phí
| Trang | Chức năng chính |
|---|---|
| `Cong Cu.dc.html` | Hub công cụ, mỗi ô có icon + mô tả |
| `CC Tao QR.dc.html` | Nhập link → mã QR thật, kiểm tra định dạng link, tải PNG |
| `CC Nen Anh.dc.html` | Kéo/thả nhiều ảnh, nén bằng canvas (tối đa 1600px), tải ảnh đã nén |
| `CC Tin Nhan.dc.html` | Sinh tin nhắn mời 2 giọng (trang trọng/thân mật), sao chép |
| `CC Danh Sach Khach.dc.html` | Thêm/xoá/đổi trạng thái khách, xuất/nhập CSV, lưu localStorage |
| `CC So Do Cho Ngoi.dc.html` | Xếp khách vào bàn (giới hạn số ghế/bàn) |
| `CC Save The Date.dc.html` | Vẽ ảnh báo ngày cưới bằng canvas, tải PNG |
| `CC Nen Video.dc.html` | **Chưa tạo**: hub có trỏ tới nhưng trang chưa thiết kế |

## 5. Cấu trúc nội dung thiệp (Studio Editor v3)

14 phần chia 4 nhóm. Phần có dấu * là tuỳ chọn (bật/tắt được).

| Nhóm | Phần | Trường chính |
|---|---|---|
| Mở đầu | Phong bì | Lời mời, tên khách hiển thị trên phong bì |
| | Mẫu & kiểu chữ | Mẫu A–J, bảng màu, font tên |
| Thông tin chính | Cô dâu & chú rể | Họ tên, thứ bậc trong gia đình (chip chọn) |
| | Gia đình hai bên | Tên bố mẹ, địa chỉ nhà trai / nhà gái |
| | Lễ cưới | Loại lễ (vu quy/thành hôn), ngày dương + âm, giờ, địa điểm |
| | Tiệc cưới | Giờ đón khách, giờ khai tiệc, địa điểm, link bản đồ |
| | Lịch trình* | Danh sách mốc giờ, thêm/xoá/sắp xếp |
| | Đếm ngược* | Hiển thị đếm ngược, nút thêm vào lịch |
| Ảnh & âm nhạc | Album* | Bố cục 3/6/9 ảnh |
| | Nhạc nền* | Chọn bài, tự phát |
| Tương tác với khách | Xác nhận tham dự* | Hạn trả lời, câu hỏi thêm |
| | Sổ lưu bút* | Duyệt lời chúc trước khi hiện |
| | Hộp mừng cưới* | 2 tài khoản (nhà trai, nhà gái): ngân hàng, số TK, chủ TK, QR |
| | Lời cảm ơn | Nội dung, nút gợi ý bằng AI |

## 6. Design system

Nguồn: `design.md` (bản văn bản chi tiết) và `Wedding Design System.dc.html` (bản trình bày trực quan). Giá trị được viết trực tiếp bằng inline style trong từng trang, không có file token CSS trung tâm.

### 6.1 Màu giao diện
| Token | Hex | Dùng cho |
|---|---|---|
| `color-bg` | `#f8f4ee` | Nền chính (kem ngà) |
| `color-bg-alt` | `#efe6d9` / `#e9e2d6` | Nền section phụ, card sáng |
| `color-ink` | `#1a1412` | Chữ chính |
| `color-ink-soft` | `#5e534b` | Chữ phụ, mô tả |
| `color-ink-faint` | `#8a7d72` | Chú thích, meta |
| `color-border` | `#e8dfd3` / `#ddd2c4` / `#e0d5c6` | Viền, đường kẻ |
| `color-primary` | `#a3161c` | Đỏ chủ đạo: nút CTA, badge, nhấn |
| `color-primary-hover` | `#7d0f14` | Hover của primary |
| `color-primary-deep` | `#8e1b1f` / `#6e1216` | Nền đỏ đậm (phong bì, section) |
| `color-gold` | `#c9a86a` / `#8a6425` | Chữ nhấn phụ, italic, viền vàng |
| `color-dark` | `#1c1012` | Section tối, footer |
| `text-on-dark` / `-soft` | `#f1e7d6` / `#a8998c` | Chữ trên nền tối |
| `border-on-dark` | `#4a3a36` | Viền trên nền tối |

Trạng thái (badge khách mời): Tham dự `#e7eee6`/`#24493a` · Chưa chắc `#f5efe0`/`#7a5a22` · Chưa trả lời `#efe6d9`/`#8a7d72` · Vắng/xoá `#f5e3e1`/`#8e1b1f`.

### 6.2 Bảng màu mẫu thiệp (`PAL`)
| Tên | deep | paper | gold |
|---|---|---|---|
| Đỏ `do` | `#8e1b1f` | `#f7efe3` | `#e0bb74` |
| Đỏ đậm `dodam` | `#5a1119` | `#f5ece2` | `#d4ac6a` |
| Nâu `nau` | `#6b4a33` | `#f3ece2` | `#b88a55` |
| Lam `lam` | `#1f3a5f` | `#eef1f4` | `#c9ab72` |
| Xanh rêu `xanh` | `#24493a` | `#eef1ea` | `#c9a86a` |
| Hồng `hong` | `#a4505f` | `#fbf1ef` | `#d8a977` |
| Vàng kim `vang` | `#7a5a22` | `#f7f0e0` | `#e3c27e` |
| Ô liu `oliu` | `#5a6636` | `#f2f1e6` | `#c8b07a` |
| Mực `muc` | `#1a1412` | `#f4f1ec` | `#c9a86a` |
| Tím `tim` | `#4b3566` | `#f2eff5` | `#c7a878` |

### 6.3 Font (Google Fonts, load trong `<helmet>` từng trang)
| Vai trò | Font | Dùng cho |
|---|---|---|
| `font-body` | Be Vietnam Pro 300/400/500/600 | Body, nút, form |
| `font-display` | Playfair Display 400/500/600 + italic | Heading, số thứ tự, logo "MỘC" |
| `font-script` | Cormorant Garamond 400/500 + italic | Trích dẫn, tên trên thiệp |
| `font-hand` | Great Vibes | Chữ ký tên riêng, chỉ dùng cỡ lớn |

### 6.4 Cỡ chữ
Hero H1 `clamp(38px, 5.6vw, 96px)` · H2 `clamp(32px, 4.4vw, 60px)` · H3 card `19–30px` · Body `14–17px` · Eyebrow/caption `11–13px`, uppercase, letter-spacing `0.14–0.4em`.

### 6.5 Spacing, bo góc, bóng
- Container: `1280px` (marketing), `1080–1180px` (nội dung), `720px` (pháp lý).
- Padding section: `72–120px` dọc, `32px` ngang.
- Gap: `8 / 12 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 56px`, luôn dùng flex/grid `gap`.
- Bo góc: `8px` chip · `10–16px` card · `18–24px` card lớn · `999px` pill/badge.
- Bóng: card `0 12px 32px -14px rgba(26,20,18,.3)` · hover `0 30px 50px -24px rgba(26,20,18,.45)` · nổi `0 18px 36px -18px rgba(26,20,18,.35)` · trên nền tối `0 40px 80px -40px rgba(0,0,0,.8)`.

### 6.6 Component lặp lại
- **Nút chính:** nền `#a3161c`, chữ trắng, bo 999px, padding `14–18px 26–32px`; hover `#7d0f14` + nâng 2px.
- **Nút phụ:** viền 1px `#1a1412`, nền trong; hover đảo màu.
- **Chip chọn/lọc:** viền `#ddd2c4`; active nền đen chữ kem. Dùng thay dropdown cho thứ bậc, ngân hàng, tên khách.
- **Badge:** nền nhạt theo trạng thái, chữ đậm, `10–12px`.
- **Card mẫu thiệp:** bo `8–14px`, bóng card; hover nâng 6px.

### 6.7 Animation
- Micro-interaction `200–350ms`, `cubic-bezier(.2,.7,.2,1)`.
- Reveal khi cuộn `900ms`, dịch dọc `36–40px → 0`, dùng IntersectionObserver.
- Vòng lặp `4–12s` (float, marquee, đếm ngược); marquee dừng khi hover.
- Keyframes đang dùng: `fadeUp`, `fadeIn`, `popIn`, `floaty`, `sway`, `petFall`, `flapOpen`, `cardRise`, `marqueeL/R`, `eq`, `scan`, `ripple`, `shimmer`, `heart`, `toast`, `pulseDot`… (mỗi trang tự khai báo).
- Chưa hỗ trợ `prefers-reduced-motion`, cần bổ sung khi tích hợp.

### 6.8 Port sang codebase thật
Chuyển màu/font/spacing/radius/shadow thành CSS variables hoặc Tailwind theme; gom keyframes vào 1 file animation chung; tách `PAL` và danh sách mẫu `TPL` thành `templates.json`. Chi tiết ở `design.md` mục 8.

## 7. Cách chạy
Mở file `.dc.html` bằng browser (kéo thả) hoặc chạy local server tĩnh bất kỳ tại thư mục gốc. Các trang tham chiếu nhau bằng đường dẫn tương đối. Trang bắt đầu gợi ý: `Trang Chu.dc.html`; xem thiệp mẫu hoàn chỉnh: `Thiep Mau Day Du.dc.html`.

## 8. Nhật ký thay đổi
- **26/09/2026** — Xoá `Studio Editor.dc.html` (v1) và `Studio Editor v2.dc.html`; chỉ giữ v3. Link "Bắt đầu chỉnh sửa" ở Studio và nút "Sửa" ở Tài khoản chuyển sang v3.
- **26/09/2026** — Viết lại README chi tiết: mục tiêu, kiến trúc, luồng người dùng, cấu trúc 14 phần thiệp, toàn bộ design system (màu, palette mẫu, font, cỡ chữ, spacing, bóng, component, animation). Ghi rõ `Stock Design System` / `stock-tokens.*` không thuộc site Mộc.
- **26/09/2026** — Thêm `Thiep Mau Day Du.dc.html`: thiệp mẫu đầy đủ thông tin để xem trước. Sửa lỗi thanh "Đang xem với tên" bị header che khi màn hình thấp (v3 + thiệp mẫu).
- **26/09/2026** — Thêm `Studio Editor v3.dc.html` (3 cột, 14 phần: gia đình, lễ/tiệc tách riêng, lịch trình, đếm ngược, sổ lưu bút, hộp mừng cưới 2 bên, lời cảm ơn AI, phong bì cá nhân hoá). `Thiep Preview` thêm prop `fit`/`maxW`. Sửa lỗi ô chọn thứ bậc/ngân hàng/tên khách hiển thị sai → đổi thành chip; sửa lỗi console khi đổi phần.
- Trước đó — v2 editor (stepper, Desktop/Mobile, bước Hoàn tất); `Thiep Preview` chế độ `full`, rộng 70% trên desktop. Gỡ trang Blog và phần blog trên trang chủ.

## 9. Ghi chú & việc còn lại
- Mọi thay đổi phải ghi vào mục "Nhật ký thay đổi" (theo `CLAUDE.md`).
- Mã VietQR trong Studio Editor v3 là ô giữ chỗ, cần nối API VietQR thật.
- "Gợi ý bằng AI" dùng Claude; nếu không khả dụng thì xoay vòng 3 mẫu có sẵn.
- Ảnh trong thiệp là ô trống `<image-slot>`, cần kéo/thả ảnh thật.
- Số liệu, tên khách, câu hỏi thường gặp là nội dung mẫu, cần thay trước khi phát hành.
- Thông tin ngân hàng ở `Ung Ho.dc.html` đang để trống.
- Chưa có: `CC Nen Video.dc.html`, backend lưu thiệp, đăng nhập thật, `prefers-reduced-motion`.
