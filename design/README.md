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
6. **Quản lý:** nút Đăng nhập (Google) ở header → avatar → Thiệp của tôi: danh sách thiệp, nhận lại thiệp bằng link `#k=`.

## 4. Danh sách trang (25 trang đang dùng + 1 trang tạm ẩn + file dùng chung)

Menu (Site Header): Mẫu thiệp, Thiết kế riêng, Công cụ, Ủng hộ ♥ · nút Đăng nhập (popup Google) · Tạo thiệp. Sau khi đăng nhập: avatar + tên, bấm mở menu Thiệp của tôi / Đăng xuất. Trạng thái lưu ở `localStorage.moc_user`, đồng bộ qua sự kiện `moc-auth`; trang khác mở popup bằng `dispatchEvent(new Event('moc-open-login'))`.
Site Footer trỏ tới toàn bộ trang còn lại (Sản phẩm, Công cụ, Hỗ trợ, Pháp lý).

### File dùng chung
| File | Chức năng |
|---|---|
| `Site Header.dc.html` | Header mọi trang: logo, menu Mẫu thiệp / Thiết kế riêng / Công cụ / Ủng hộ ♥, nút Đăng nhập → popup Google, nút Tạo thiệp; khi đã đăng nhập hiện avatar + tên, menu Thiệp của tôi / Đăng xuất |
| `Site Footer.dc.html` | Footer: CTA tạo thiệp, 4 cột link, dòng bản quyền |
| `Thiep Preview.dc.html` | Render 1 mẫu thiệp (10 kiểu A–J). Mở riêng trên desktop: rộng 70% trang. Prop `fit` + `maxW` để co giãn theo khung (v3); prop `full` hiện đủ các phần nội dung |
| `Thiep Mau Day Du.dc.html` | Thiệp mẫu điền đủ 14 phần (Thu Hà & Quốc Bảo, 12/12/2026), mở sẵn chế độ Xem như khách; bấm "Chỉnh sửa" để sửa |
| `Wedding Design System.dc.html` | Trang trình bày design system Mộc (màu, font, cỡ chữ, spacing, bóng, component, animation, đối chiếu các trang) |
| `design.md` | Bản văn bản của design system, dành cho FE khi port sang codebase thật |
| `stock-tokens.css`, `stock-tokens.json` | Token của design system khác (tông xanh, ứng dụng chứng khoán) — **không dùng** cho site Mộc |
| `motion.js` | Lớp chuyển động dùng chung, nhúng trong `<helmet>` mọi trang: màn chuyển trang (logo MỘC), thanh tiến độ cuộn, hiện dần khi cuộn (tiêu đề mở từ dưới lên, ảnh mở khung, lưới xuất hiện so le), **hiệu ứng hoa rơi khi di chuyển chuột** (cánh hoa vàng/đỏ/hồng rơi nhẹ theo vệt chuột, chỉ trên máy tính), cánh hoa bung khi bấm nút đỏ, nút đỏ hút theo chuột, lời chào khi quay lại (từ lần ghé thứ 2). `data-lite` (Studio Editor v3) chỉ giữ chuyển trang + thanh tiến độ. Tắt hết khi `prefers-reduced-motion`. Thêm `data-no-reveal` để bỏ hiệu ứng cho 1 vùng |
| `assets/photos/` | 13 ảnh cưới mẫu (đã nén ≤1200px) dùng làm ảnh mặc định. Người dùng kéo/thả ảnh mới vào ô sẽ thay ảnh mặc định |
| `image-slot.js`, `support.js` | File hệ thống, không phải trang |

### 4.1 Trang chủ & marketing
| Trang | Trỏ đến | Chức năng chính |
|---|---|---|
| `Trang Chu.dc.html` | Studio, Mẫu thiệp, Công cụ, Bảng giá | Hero có animation phong bì mở (tilt theo chuột), dải mẫu thiệp cuộn ngang, dải trích dẫn khách, khối thống kê đếm số, 3 bước dùng, 8 tính năng minh hoạ động, demo link riêng khách, 7 công cụ, bảng giá, CTA cuối trang |
| `Bang Gia.dc.html` | Studio | Bảng giá 0đ, danh sách đã có/đang làm, khối "Thấy Mộc có ích?" (đã bỏ nút sang Ủng hộ) |
| `Tro Giup.dc.html` | Phap Ly | 25 câu hỏi, lọc theo 6 nhóm, tìm kiếm |
| `Phap Ly.dc.html` (?doc=) | — | Điều khoản sử dụng / Quyền riêng tư (2 tab) |
| `Tao Thiep Cuoi.dc.html` | Studio | Landing SEO: tạo thiệp trong 15 phút |
| `Thiep Cuoi Online Mien Phi.dc.html` | Studio | Landing SEO: miễn phí toàn bộ |
| `QR Tien Mung.dc.html` | Studio | Landing SEO: mừng cưới QR |
| `Tin Nhan Moi Cuoi.dc.html` | Cong Cu | Landing SEO: mẫu tin nhắn mời kèm link thiệp |
| `Thiet Ke Rieng.dc.html` | — | Hero tối với cụm thiệp mẫu riêng bay nghiêng + đốm sáng, số liệu cam kết, nút Chat qua Zalo, dải tuỳ biến màu, timeline 3 bước, form gửi yêu cầu (demo, chưa nối backend thật) |

### 4.2 Sản phẩm
| Trang | Trỏ đến | Chức năng chính |
|---|---|---|
| `Studio.dc.html` | Studio Editor v3 | Chọn 1 trong 10 mẫu, nhập tên & ngày cưới, xem trước trực tiếp |
| `Studio Editor v3.dc.html` | Thiep Khach, Cong Cu | **Bản chính thức.** 3 cột: danh sách phần → form → xem trước. Bật/tắt phần tuỳ chọn; vòng % hoàn thiện; bấm vào thiệp để nhảy tới phần tương ứng, chọn phần thì thiệp tự cuộn tới và gắn nhãn "ĐANG SỬA"; "Xem như khách" đổi tên khách; khung điện thoại/máy tính; cửa sổ Xuất bản. Màn hình < 1024px: xem trước toàn màn, danh sách & form mở dạng bottom-sheet |
| `Thiep Cua Toi.dc.html` **(mới)** | Studio, Studio Editor v3, Thiep Khach | Danh sách thiệp của tài khoản: lọc Tất cả/Đã xuất bản/Bản nháp, thẻ có ảnh thu nhỏ mẫu, số xác nhận/lời chúc/lượt xem hoặc % hoàn thiện, Chỉnh sửa/Xem/Sao chép link/Xoá (có Hoàn tác), nhận thiệp cũ bằng link `#k=`. Chưa đăng nhập: hiện lời mời đăng nhập |

### 4.3 Mẫu thiệp
| Trang | Trỏ đến | Chức năng chính |
|---|---|---|
| `Mau Thiep v2.dc.html` | Mau Thiep Chi Tiet, Studio | Bản chính thức: bảng xếp hạng cuộn ngang, lọc theo phong cách + màu, 20 mẫu, đổi màu ngay trên thẻ. Nút "Xem thử" mở popup demo: thiệp đầy đủ trong khung điện thoại, tự cuộn từ trên xuống rồi quay lại đầu; rê chuột (hoặc chạm) vào thiệp thì dừng và cuộn tay được; Esc/bấm nền để đóng |
| `Mau Thiep Chi Tiet.dc.html` (?id=) | Studio | 1 mẫu: đổi màu, mô tả, tính năng đi kèm |

### 4.4 Trang khách
| Trang | Chức năng chính |
|---|---|
| `Thiep Khach.dc.html` (?to=) | Phong bì mở (hiệu ứng nổ nhẹ), cover, gia đình, đếm ngược flip-clock, album, nhạc nền, xác nhận tham dự (tick vẽ dần), sổ lưu bút, mừng cưới QR, cảm ơn — các phần hiện dần so le khi cuộn |

### 4.4b Blog
| Trang | Chức năng chính |
|---|---|
| `Blog.dc.html` | Danh sách bài viết: ảnh, chuyên mục, tiêu đề, trích đoạn, ngày · thời gian đọc; khối "Công cụ hữu ích" trỏ tới Tin nhắn mời / Danh sách khách / Tạo QR |
| `Blog Bai Viet.dc.html` (?slug=) | 1 bài viết: breadcrumb, chuyên mục, ảnh bìa, nội dung (tiêu đề phụ, đoạn văn, danh sách, trích dẫn, bảng), mục lục bám lề, câu hỏi thường gặp, bài liên quan. 4 bài: hạn xác nhận tham dự, lập danh sách khách, thiệp online vs thiệp giấy, cách viết lời mời cưới |

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

### 4.6 Trang tạm ẩn (giữ file, không còn link nào trỏ tới)
| Trang | Lý do / thay thế |
|---|---|
| `Tai Khoan.dc.html` | Thay bằng popup đăng nhập Google trong header + trang `Thiep Cua Toi.dc.html` |

### 4.7 Trang đã xoá
| Trang | Thay bằng |
|---|---|
| `Studio Editor.dc.html` (v1) | `Studio Editor v3.dc.html` |
| `Studio Editor v2.dc.html` | `Studio Editor v3.dc.html` |
| `Tinh Nang.dc.html` | Khối 8 tính năng trên Trang chủ (thẻ trỏ về Studio) |
| `Tinh Nang Chi Tiet.dc.html` | — |
| `Mau Thiep.dc.html` (v1) | `Mau Thiep v2.dc.html` |
| `Stock Design System.dc.html` | — (không thuộc site Mộc) |
| Blog | — |

### 4.8 Ảnh mặc định theo mẫu (`Thiep Preview`, prop `photo`/`photo2` để ghi đè)
| Kiểu | Mẫu tiêu biểu | Ảnh | Lý do |
|---|---|---|---|
| A | Song Hỷ | `hy-phuc-do` | Hỷ phục đỏ, hợp mẫu truyền thống chữ Hỷ |
| B | Chữ số lớn | `han-quoc-toi-gian` | Nền trắng tối giản, hợp bố cục editorial |
| C | Khung tròn | `om-hem-nui` | Ảnh ôm cận mặt, cắt tròn vẫn rõ |
| D | Hoàng Gia | `lau-dai-trang` | Kiến trúc cổ điển, hợp khung vòm vàng |
| E | Save the date (polaroid) | `retro-pho-cho` | Ảnh film retro, hợp khung polaroid |
| F | Chung Nhà (ảnh tràn) | `vuon-xanh` | Ảnh dọc ngoài trời, phủ toàn thiệp |
| G | The Wedding Of (2 ảnh) | `o-hoa` + `vest-xanh-navy` | Cùng studio, 2 ảnh đồng bộ |
| H | Hai khung tròn 囍 | `retro-do-hoa-hong` + `ao-dai-do` | Tông đỏ, hợp nền đỏ |
| I | Song Phụng | `studio-hoa-trang` | (mẫu không có ô ảnh bìa) |
| J | Song Cửa | `ao-dai-do` | Áo dài đỏ thêu vàng, hợp đỏ đậm + vòm vàng |
| K | Tem Thư (mới) | `nang-chieu` | Con tem răng cưa + dấu bưu điện ghi ngày cưới, viền thư máy bay |
| L | Vé Hạnh Phúc (mới) | `cua-so-vom` | Vé tàu một chiều: Ga đi (chú rể) → Ga đến (cô dâu), toa/ghế, mã vạch, cuống vé |
| M | Đĩa Than (mới) | `khoi-hong` | Đĩa vinyl + bìa "Side A", nhãn đĩa là ảnh cưới, tracklist = lịch trình |
| N | Cuộn Phim (mới) | `voan-hoa-kho` + `vuon-bong-bong` + `nang-chieu` | Dải phim 3 khung, lỗ răng phim, dấu ngày màu cam kiểu máy film |
| O | Lịch Bloc (mới) | `han-phuc-co-trang` | Tờ lịch xé Việt Nam: số ngày lớn, thứ, "Ngày lành tháng tốt" |

Album dùng lần lượt các ảnh còn lại. Thiep Khach (ảnh bìa `studio-hoa-trang`), Thiep Mau Day Du / Studio Editor v3 (chú rể `vest-xanh-navy`, cô dâu `studio-hoa-trang`), Trang chủ (ô Album) cũng dùng ảnh mặc định.

### 4.9 Danh sách mẫu thiệp (Mẫu thiệp v2, 20 mẫu)
| # | Tên | Kiểu | Phong cách | Hoạ tiết | Màu | Nhãn |
|---|---|---|---|---|---|---|
| 1 | Song Hỷ | A | Truyền thống | Chữ Hỷ | Đỏ, Xanh rêu | HOT |
| 2 | Nét Mực | B | Tối giản | Typography | Đỏ đậm, Nâu, Lam, Tím | MỚI |
| 3 | Hoa Nhài | C | Hoa | Vòm hoa | Xanh rêu, Hồng, Nâu | — |
| 4 | Hoàng Gia | D | Cổ điển | Khung vàng | Vàng kim, Đỏ đậm, Lam | HOT |
| 5 | Phong Thư | E | Lãng mạn | Phong bì | Đỏ, Ô liu | MỚI |
| 6 | Bìa Báo | F | Hiện đại | Tạp chí | Mực, Hồng | — |
| 7 | Hỷ Sự | P | Truyền thống | Chữ Hỷ | Đỏ đậm, Lam | — |
| 9 | Vườn Ươm | Q | Hoa | Sân vườn | Ô liu, Cam đất | MỚI |
| 10 | Nhung Lam | R | Cổ điển | Nhung | Lam, Đỏ | — |
| 11 | Thư Tình | S | Lãng mạn | Sáp niêm | Hồng, Đỏ đậm | — |
| 12 | Chân Dung | T | Hiện đại | Ảnh lớn | Mực, Xanh rêu | HOT |
| 13 | Song Phụng | I | Truyền thống | Chữ Hỷ lớn | Đỏ, Đỏ đậm, Lam | HOT |
| 14 | Báo Hỷ | H | Truyền thống | Thông tin lễ | Đỏ, Lam | MỚI |
| 15 | Đôi Khung | G | Lãng mạn | Ảnh đôi | Xanh rêu, Hồng, Nâu | MỚI |
| 16 | Song Cửa | J | Truyền thống | Khung vòm | Đỏ đậm, Đỏ, Xanh rêu | HOT |
| 17 | Tem Thư | K | Lãng mạn | Tem & dấu bưu điện | Đỏ, Lam, Xanh rêu | MỚI |
| 18 | Vé Hạnh Phúc | L | Hiện đại | Vé tàu | Lam, Đỏ đậm, Xanh rêu | MỚI |
| 19 | Đĩa Than | M | Hiện đại | Vinyl | Mực, Đỏ đậm, Cam đất | MỚI |
| 20 | Cuộn Phim | N | Hiện đại | Phim nhựa | Mực, Nâu, Hồng | MỚI |
| 21 | Lịch Bloc | O | Truyền thống | Lịch xé | Đỏ, Xanh rêu, Lam | MỚI |

Không còn mẫu dùng chung bố cục — xem chi tiết đợt thiết kế lại 5 mẫu ở mục 8 (04/10/2026). Đã xoá: Giấy Dó (trùng Nét Mực).

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
- `prefers-reduced-motion`: đã xử lý trong `motion.js`.

### 6.8 Port sang codebase thật
Chuyển màu/font/spacing/radius/shadow thành CSS variables hoặc Tailwind theme; gom keyframes vào 1 file animation chung; tách `PAL` và danh sách mẫu `TPL` thành `templates.json`. Chi tiết ở `design.md` mục 8.

## 7. Cách chạy
Mở file `.dc.html` bằng browser (kéo thả) hoặc chạy local server tĩnh bất kỳ tại thư mục gốc. Các trang tham chiếu nhau bằng đường dẫn tương đối. Trang bắt đầu gợi ý: `Trang Chu.dc.html`; xem thiệp mẫu hoàn chỉnh: `Thiep Mau Day Du.dc.html`.

## 8. Nhật ký thay đổi

### Cập nhật 04/10/2026 (6)
Thiết kế lại trang `Thiet Ke Rieng.dc.html` ấn tượng hơn, tối ưu không gian trống ở hero:
- Thêm nút **Chat qua Zalo** (brand blue `#0068ff`) ở hero và cạnh form gửi yêu cầu — số điện thoại hiện là placeholder (`zalo.me/0900000000`), cần thay số thật.
- Hero: đổi cột phải từ 3 thẻ nhỏ cách xa nhau, nhiều khoảng trống → cụm 4 thẻ thiệp (gồm 2 mẫu mới P, Q, S, T) chồng lớp, kích thước lớn hơn, xoay lệch nhiều hơn, thêm nhãn "✦ VÍ DỤ ĐÃ PHÁC THẢO RIÊNG" và chip "Hoàn thiện trong 3 bước" lấp khoảng trống; thêm 8 đốm sáng vàng nhấp nháy (`rieTwinkle`) và 2 quầng sáng trôi nhẹ (`rieDrift`) phía sau cụm thẻ.
- Giảm padding hero (88px→64px trên, 60px→56px dưới), đổi lưới 2 cột từ chia đều sang `minmax(380px,1fr) minmax(420px,520px)` để cột phải không còn dư nhiều khoảng trống.
- Thêm dải số liệu (24 giờ phản hồi, không giới hạn góp ý, 0đ thử nghiệm), dải bảng màu tuỳ biến (8 tông), timeline 3 bước kiểu cột có đường kẻ phân cách.

### Cập nhật 04/10/2026 (5)
Header: trái tim cạnh "Ủng hộ" đổi màu đỏ (`#a3161c`) riêng, tách khỏi màu chữ của mục menu (chữ vẫn đổi đen/xám theo trạng thái active như các mục khác, trái tim luôn đỏ).

### Cập nhật 04/10/2026 (4)
Cập nhật menu header theo thiết kế mới: thêm mục **Thiết kế riêng** và đưa lại **Ủng hộ ♥** vào menu (trước đó đã tạm ẩn khỏi header). Thứ tự menu giờ là Mẫu thiệp, Thiết kế riêng, Công cụ, Ủng hộ ♥.
Tạo trang mới `Thiet Ke Rieng.dc.html`: giới thiệu dịch vụ thiết kế thiệp theo yêu cầu, 3 bước làm việc, form gửi yêu cầu (họ tên, email/Zalo, ngày cưới, mô tả phong cách) → trạng thái "Đã gửi yêu cầu" (demo, chưa nối backend thật).
`Ung Ho.dc.html` không còn là trang tạm ẩn (đã có link trỏ tới từ header).

### Cập nhật 04/10/2026 (3)
**Bỏ Replace/Edit trên thiệp xem trước, chọn mẫu.** Thêm prop `locked` cho `Thiep Preview.dc.html` (khi `true`, root có `pointer-events:none` nên các ô `<image-slot>` bên trong không còn hiện nút Replace/Edit khi hover; click vẫn xuyên qua tới phần tử cha để chọn mẫu). Gắn `locked="true"` ở mọi nơi Thiệp Preview chỉ dùng làm thumbnail chọn mẫu: `Studio.dc.html` (lưới mẫu + khung "ĐÃ CHỌN"), `Mau Thiep v2.dc.html` (dải Bảng xếp hạng, lưới mẫu chính, popup "Xem thử"). Các nơi thiệp thật sự cần sửa ảnh (Studio Editor v3, Thiệp khách…) không đổi.

**Thiết kế lại 5 mẫu từng trùng bố cục với mẫu khác, để không mẫu nào giống mẫu khác:**
- **Hỷ Sự** (trước trùng bố cục Song Hỷ, family A) → bố cục mới family **P**: nền đỏ đậm, hai viền vàng dọc hai bên, chữ 囍 lớn ở giữa, ảnh cưới khung chữ nhật bo nhẹ, tên và ngày phía dưới.
- **Vườn Ươm** (trước trùng Hoa Nhài, family C) → family **Q**: khung ảnh viền caro vàng kiểu giàn hoa (trellis), nhãn tên đặt lệch như thẻ cây trong vườn.
- **Nhung Lam** (trước trùng Hoàng Gia, family D) → family **R**: nền đậm, khung ảnh bo đỉnh vòm kiểu huy chương, nhãn "LỄ THÀNH HÔN" dạng ruy băng ở trên.
- **Thư Tình** (trước trùng Phong Thư, family E) → family **S**: ảnh đặt trong khung thư trắng, con dấu sáp tròn mang chữ lồng (initials) đè lên mép trên ảnh.
- **Chân Dung** (trước trùng Bìa Báo, family F) → family **T**: ảnh tràn viền tối giản, khung chỉ mỏng cách mép, tên/ngày trong thẻ chữ nhật góc dưới trái — bỏ tiêu đề tạp chí lớn.

Cập nhật family tương ứng trong `TPL` (Studio.dc.html) và `T` (Mau Thiep v2.dc.html); thêm 5 giá trị P–Q–R–S–T vào enum `family` của `Thiep Preview.dc.html`; gán ảnh mặc định mới cho 5 family này. Mục 4.9: cập nhật cột "Kiểu" của 5 mẫu trên, xoá ghi chú "mẫu dùng chung bố cục".

### Cập nhật 04/10/2026 (2)
Thiết kế lại `Studio.dc.html` (trang "Tạo thiệp mới"): chuyển sang bố cục split-screen — cột trái cố định (sticky) hiện khung xem trước thiệp lớn + form tên hai bạn/ngày cưới, nền đổi màu theo mẫu đang chọn; cột phải là tiêu đề, bộ lọc phong cách và lưới mẫu thiệp. Giữ nguyên toàn bộ chức năng cũ (lọc theo phong cách, chọn mẫu, ô "Chụp thiệp giấy để AI điền sẵn", nút Bắt đầu chỉnh sửa).

### Cập nhật 04/10/2026
Thêm trang `Blog.dc.html` (danh sách bài viết) và `Blog Bai Viet.dc.html` (?slug=, bài chi tiết: mục lục, bảng, trích dẫn, câu hỏi thường gặp, bài liên quan), tham khảo cấu trúc blog chungdoi.com. 4 bài viết SEO gốc bằng tiếng Việt: hạn xác nhận tham dự, lập danh sách khách mời, thiệp online vs thiệp giấy, cách viết lời mời cưới. Link "Blog" thêm vào cột HỖ TRỢ của Site Footer (không thêm vào header theo yêu cầu).

### Tóm tắt đợt cập nhật 26–27/09/2026
| Nhóm | Thay đổi |
|---|---|
| Trang mới | `Thiep Cua Toi.dc.html` (danh sách thiệp của tài khoản), `Thiep Mau Day Du.dc.html` (thiệp mẫu đủ 14 phần), `motion.js` (chuyển động dùng chung) |
| Quản lý thiệp | Trang mới Quan Ly Thiep.dc.html: RSVP, lời chúc & QR mừng cưới, QR để in, cập nhật thông tin + báo khách |
| Mẫu thiệp | Thêm 5 mẫu mới K–O (Tem Thư, Vé Hạnh Phúc, Đĩa Than, Cuộn Phim, Lịch Bloc); xoá Giấy Dó; "Xem thử" mở popup demo tự cuộn 15 phần, dừng khi rê chuột; thay "3 ngày dùng thử / Ưng mới trả" bằng "Đổi mẫu / Không giới hạn khách" |
| Ảnh | 21 ảnh cưới mẫu trong `assets/photos/`, gán theo kiểu mẫu (mục 4.8) |
| Trang đã xoá | `Studio Editor.dc.html` (v1), `Studio Editor v2.dc.html`, `Tinh Nang.dc.html`, `Tinh Nang Chi Tiet.dc.html`, `Mau Thiep.dc.html` (v1), `Stock Design System.dc.html` |
| Trang tạm ẩn (giữ file) | `Ung Ho.dc.html`, `Tai Khoan.dc.html` |
| Đăng nhập | Chỉ còn đăng nhập Google, dạng popup từ nút Đăng nhập trên header (demo). Sau khi đăng nhập: avatar + tên, menu Thiệp của tôi / Đăng xuất |
| Header / Footer | Bỏ mục Tính năng, Ủng hộ, Tài khoản. Header: Mẫu thiệp, Công cụ, Đăng nhập, Tạo thiệp. Footer: "Tài khoản" đổi thành "Thiệp của tôi" |
| Trang chủ | Bỏ link "Xem tất cả tính năng" và nút Ủng hộ; 8 thẻ tính năng trỏ về Studio |
| Bảng giá | Bỏ nút sang trang Ủng hộ |
| Chuyển động | `motion.js` nhúng vào 25 trang (Studio Editor v3 dùng bản nhẹ). Đã sửa lỗi nội dung bị ẩn khi cuộn. Di chuyển chuột có hiệu ứng hoa rơi |
| Sửa lỗi | Ô chọn thứ bậc/ngân hàng/tên khách hiển thị sai (đổi sang chip); lỗi console khi đổi phần trong v3; thanh "Đang xem với tên" bị header che; ảnh thu nhỏ trên Thiệp của tôi bị lệch bóng; popup demo không tự cuộn; Lịch Bloc chữ thứ đè số ngày; Đĩa Than chữ bìa bị đĩa che |

### Chi tiết theo ngày
- **27/09/2026 — v1.1.0** — Chốt bản **v1.0.0** (bản sao đầy đủ trong thư mục `v1.0.0/`, gồm ảnh). Thêm tính năng theo báo cáo nghiên cứu:
  - **Trang mới `Quan Ly Thiep.dc.html`** (mở từ thẻ thiệp trong "Thiệp của tôi" → "Quản lý khách, lời chúc & QR"), 4 tab: *Khách mời* (thống kê RSVP, thanh tỉ lệ, lọc/tìm, nhắc khách chưa trả lời, xuất Excel) · *Lời chúc & mừng cưới* (ghim/ẩn lời chúc, cài QR ngân hàng, bật/tắt trên thiệp) · *QR để in* (thẻ bàn tiệc / mặt sau thiệp / nhãn dán, màu theo mẫu, tải PNG/PDF) · *Cập nhật thông tin* (đổi ngày/giờ/địa điểm, chọn báo khách qua banner/Zalo/SMS, lịch sử thay đổi).
  - **Thiệp khách**: banner "Thông tin tiệc vừa cập nhật" (đọc từ `localStorage.moc_update` khi chủ thiệp lưu thay đổi).
  - **Tạo thiệp (Studio)**: ô "Đã có thiệp giấy? Chụp để AI điền sẵn" — chọn ảnh, hiệu ứng quét, tự điền tên & ngày (bản thử dùng dữ liệu mô phỏng).
- **27/09/2026** — Bỏ tính năng "Ảnh từ khách" (khách gửi ảnh) khỏi Quan Ly Thiep.dc.html và Thiep Khach.dc.html — tránh tốn dung lượng lưu trữ.
- **27/09/2026** — Tạo thiệp (Studio): thay 10 mẫu cũ (Gallery Noir, Afterglow…) bằng đúng 20 mẫu của trang Mẫu thiệp v2 (cùng tên, kiểu, màu mặc định); thêm bộ lọc theo phong cách kèm số lượng; mặc định chọn Song Hỷ.
- **27/09/2026** — Sửa Lịch Bloc (chữ thứ đè số ngày) và Đĩa Than (chữ bìa bị che). README: thêm mục 4.9 danh sách toàn bộ mẫu thiệp và các cặp trùng bố cục; cập nhật bảng tóm tắt.
- **27/09/2026** — Mẫu thiệp v2: xoá mẫu "Giấy Dó" (id 8) vì trùng bố cục kiểu B với "Nét Mực". Còn 20 mẫu.
- **27/09/2026** — Ghi chú README: di chuyển chuột sẽ có hiệu ứng hoa rơi (từ `motion.js`, chạy trên mọi trang trừ Studio Editor v3; tắt khi bật giảm chuyển động).
- **27/09/2026** — Thêm 5 mẫu thiệp mới (kiểu K–O trong `Thiep Preview`, id 17–21 trong Mẫu thiệp v2, gắn nhãn MỚI): Tem Thư, Vé Hạnh Phúc, Đĩa Than, Cuộn Phim, Lịch Bloc. Ý tưởng tự thiết kế, không trùng các chủ đề đã có trên thị trường (Long Phụng, Song Hỷ, Baroque, Vườn, Hoa…).
- **27/09/2026** — Mẫu thiệp v2: thay "3 ngày dùng thử" và "Ưng mới trả" bằng "Đổi mẫu – bất cứ lúc nào" và "Không giới hạn – số khách mời"; sửa câu hỏi thường gặp về dùng thử cho khớp (miễn phí hoàn toàn).
- **27/09/2026** — `Thiep Preview` chế độ `full` mở rộng 15 phần: lời mời, hai gia đình, chú rể & cô dâu (ảnh riêng), lễ thành hôn (thứ/ngày/tháng), tiệc cưới, lịch trình, đếm ngược, album 9 ảnh, chuyện tình yêu, trang phục gợi ý, xác nhận tham dự, sổ lưu bút, hộp mừng cưới 2 bên, ảnh cảm ơn. Thêm 8 ảnh vào `assets/photos/` (han-phuc-co-trang, quan-phuc-studio, khoi-hong, nang-chieu, vuon-bong-bong, voan-hoa-kho, bieu-thu-canh-hoa, cua-so-vom).
- **27/09/2026** — Mẫu thiệp v2: "Xem thử" mở popup demo tự cuộn toàn bộ nội dung thiệp mẫu, dừng khi rê chuột vào.
- **27/09/2026** — Thêm 13 ảnh cưới mẫu vào `assets/photos/`, gán làm ảnh mặc định cho từng kiểu mẫu (A–J), album, thiệp khách, thiệp mẫu, Studio Editor v3, Trang chủ.
- **27/09/2026** — Header: nút Đăng nhập thiết kế lại cùng dáng với chip avatar (vòng tròn icon người + chữ); hover viền đậm, vòng tròn chuyển đỏ, nút nâng nhẹ.
- **27/09/2026** — Thiệp của tôi: bỏ nút "+ Tạo thiệp mới" ở đầu trang (đã có nút Tạo thiệp ở header và ô tạo mới trong lưới).
- **27/09/2026** — Cập nhật README: thêm mục 4.6 Trang tạm ẩn, 4.7 Trang đã xoá; sửa mô tả Site Header, luồng Quản lý, số trang; bỏ các dòng trỏ tới file không còn tồn tại (`Mau Thiep.dc.html`, `Stock Design System.dc.html`).
- **27/09/2026** — Tạm ẩn `Tai Khoan.dc.html`. Header: nút Đăng nhập → popup "Tiếp tục với Google" (demo) → avatar + tên, menu Thiệp của tôi / Đăng xuất. Thêm trang `Thiep Cua Toi.dc.html`. Footer trỏ sang Thiệp của tôi.
- **27/09/2026** — Tạm ẩn `Ung Ho.dc.html` (không xoá): bỏ link ở header, Trang chủ, Bảng giá. `Tai Khoan`: bỏ form email/mật khẩu và tab Đăng ký, chỉ còn nút "Tiếp tục với Google".
- **27/09/2026** — Xoá `Tinh Nang.dc.html` và `Tinh Nang Chi Tiet.dc.html`. Bỏ mục "Tính năng" khỏi header/footer; trên Trang chủ bỏ link "Xem tất cả tính năng", 8 thẻ tính năng trỏ về Studio.
- **27/09/2026** — Thiệp của tôi: sửa ảnh thu nhỏ (dùng `fit`/`max-w` để lấp đầy khung, bóng đổ theo hình thiệp).
- **27/09/2026** — `motion.js`: sửa lỗi tiêu đề/khối nội dung không hiện khi cuộn (bỏ IntersectionObserver, kiểm tra vị trí khi cuộn + dự phòng mỗi 600ms).
- **27/09/2026** — Thêm `motion.js` và nhúng vào 26 trang: chuyển trang, thanh tiến độ, hiện dần khi cuộn, cánh hoa theo chuột và khi bấm, nút hút theo chuột, lời chào khách quay lại. Hỗ trợ `prefers-reduced-motion`.
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
- Chưa có: `CC Nen Video.dc.html`, backend lưu thiệp, đăng nhập thật.
