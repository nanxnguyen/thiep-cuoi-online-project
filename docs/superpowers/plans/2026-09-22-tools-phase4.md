# MỘC Wedding Phase 4: 8 công cụ miễn phí

> Trạng thái sống nằm ở `PROGRESS.md` (mục 2d). File này là kế hoạch thực thi; thiết kế chi tiết ở `docs/superpowers/specs/2026-09-22-tools-phase4-design.md`. Đọc spec trước khi làm bất kỳ task nào — không lặp lại lý do quyết định ở đây.

## Nguyên tắc

- Theo quy ước dự án: **không Playwright/trình duyệt trong lúc code** — chỉ `npm test`, `npm run typecheck`, `npm run build`. QA trình duyệt một đợt sau khi xong mỗi đợt 4a/4b/4c (không dồn hết Phase 4 vào một lần — 7 mặt hàng độc lập, dồn lại dễ bỏ sót, xem spec mục 3.6).
- Không đụng backend Spring Boot ở bất kỳ task nào trong Phase 4.
- Tái dùng trước, viết mới sau: mọi task phải nêu rõ đang tái dùng gì (xem spec mục 3.4) trước khi viết code mới.

## Đợt 4a: Bốn tool rẻ, tái dùng nhiều (không phụ thuộc nhau, làm song song được)

| # | Việc | Xong khi |
|---|---|---|
| U1 | `components/tools/ToolPage.tsx` + `components/tools/tools.css` (khung trang dùng chung: header/footer + vùng nội dung tương tác) | `npm run build` OK với một trang thử dùng khung này |
| U2 | `lib/tools/qr.ts` (hàm dựng URL QR từ link + kích thước, validate bằng `isHttpUrl` có sẵn) + `app/cong-cu/tao-qr/page.tsx` | test đơn vị cho `lib/tools/qr.ts`; nhập link hợp lệ hiện ảnh QR, link rỗng/không hợp lệ hiện lỗi tiếng Việt, không gọi API nào ngoài dựng URL ảnh |
| U3 | `app/cong-cu/nen-anh/page.tsx` (gọi thẳng `compressImage()` từ `lib/image-compress.ts`, không thêm hàm nén mới) | `npm run typecheck`, `npm run build` OK; chọn nhiều ảnh nén được từng ảnh, lỗi 1 ảnh không chặn ảnh khác |
| U4 | `lib/tools/inviteMessage.ts` (ghép chuỗi theo giọng điệu, dùng `lib/datetime.ts` cho định dạng ngày) + `app/cong-cu/tin-nhan-moi/page.tsx` | test: đủ trường / thiếu link (bỏ hẳn câu nhắc link, không để khoảng trống) / thiếu tên người nhận (câu chào chung) cho cả 2 giọng điệu |
| U5 | `app/cong-cu/danh-sach-khach/page.tsx` (bảng CRUD dùng `GuestCsvRow` có sẵn ở `lib/csv.ts`, lưu `localStorage` khoá `moc:tools:guest-list`, nút Nhập/Xuất CSV dùng `parseGuestsCsv`/`guestsToCsv` có sẵn — không viết parser mới) | `npm run typecheck`, `npm run build` OK; thêm/sửa/xoá dòng, nhập CSV có dòng lỗi cố ý cô lập đúng dòng, xuất CSV tên file `danh-sach-khach.csv` |

**Checkpoint sau 4a:** `npm test`, `npm run typecheck`, `npm run build` xanh. QA trình duyệt 4a (xem spec mục 8): QR tải về được, nén ảnh thật (JPG lớn + PNG trong suốt), sinh tin nhắn cả 2 giọng điệu + sao chép, và quan trọng nhất — **xuất CSV từ `/cong-cu/danh-sach-khach` rồi nhập đúng file đó vào Studio → tab Khách mời → Nhập CSV**, xác nhận định dạng thật sự tương thích (không chỉ suy luận từ việc dùng chung hàm).

## Đợt 4b: Hai tool UI gốc (seating chart đọc chung dữ liệu với U5)

| # | Việc | Xong khi |
|---|---|---|
| U6 | `lib/tools/seating.ts` (gán/bỏ gán hộ vào bàn, kiểm sức chứa, đọc/ghi `localStorage` khoá `moc:tools:seating` — logic thuần, không đụng DOM) | test: gán hộ vào bàn còn chỗ thành công; bàn đầy từ chối; bỏ gán trả hộ về danh sách chưa xếp; đọc danh sách khách từ khoá `moc:tools:guest-list` (U5) đúng shape |
| U7 | `app/cong-cu/so-do-cho-ngoi/page.tsx` (kéo-thả bằng Pointer Events; đường thay thế bấm-chọn cho bàn phím/trợ năng; xuất CSV `ho_gia_dinh,ban`) | kéo một chip vào bàn còn chỗ gán đúng; bàn đầy từ chối kèm thông báo; đường bấm-chọn hoạt động không cần chuột; `npm run build` OK |
| U8 | `app/cong-cu/save-the-date/page.tsx` (canvas vẽ tên + ngày + ảnh nền tuỳ chọn qua `compressImage` trước khi vẽ, 1080×1350, tải PNG) | `npm run build` OK; có ảnh nền và không có ảnh nền đều vẽ đúng, không méo tỉ lệ; tải ảnh về mở được |

**Checkpoint sau 4b:** `npm test`, `npm run typecheck`, `npm run build` xanh. QA trình duyệt 4b: kéo-thả trên chuột thật và trên giả lập cảm ứng (`chrome-devtools emulate`), đường bấm-chọn thay thế, bàn đầy từ chối đúng; save-the-date sinh ảnh đúng nội dung ở cả 2 trường hợp có/không ảnh nền.

## Đợt 4c: Nén video — làm sau cùng, có thể hoãn (xem spec mục 9.3, 10)

| # | Việc | Xong khi |
|---|---|---|
| U9 | Thêm `@ffmpeg/ffmpeg` + `@ffmpeg/util` vào `package.json`; thêm dòng CDN `@ffmpeg/core` vào danh sách dịch vụ ngoài ở `/quyen-rieng-tu` | `npm install` sạch, `npm run build` OK (không tăng bundle chính — import động, `ssr:false`) |
| U10 | `app/cong-cu/nen-video/page.tsx` (chọn video, chọn mức nén, chạy lõi single-thread, thanh tiến trình, tải kết quả) | nén 1 video ngắn thật thành công, file kết quả nhỏ hơn và phát được; giới hạn kích thước đầu vào (spec mục 9.4) chặn file quá lớn với thông báo tiếng Việt trước khi thử nén |

**Checkpoint sau 4c:** QA trình duyệt: nén video thật; xác nhận Google Maps (trang `/invite/*`) và ảnh QR (`api.qrserver.com`, `img.vietqr.io`) vẫn hoạt động bình thường sau khi thêm ffmpeg (lo ngại COEP ở spec mục 3.5) — mở một trang `/invite/*` có bản đồ và một trang có QR mừng cưới, xác nhận không vỡ.

## Đồng bộ nội dung (làm cùng lúc với 4a, không phải task riêng để cuối)

| # | Việc | Xong khi |
|---|---|---|
| U11 | Viết lại `app/cong-cu-dam-cuoi/page.tsx` (hub) — bỏ đoạn "chưa có sẵn trên MỘC", liệt kê 7 (hoặc N) công cụ đã lên | Không còn câu nào nói công cụ đã hoàn thành là "chưa có"/"đang phát triển" |
| U12 | Sửa `app/tin-nhan-moi-cuoi/page.tsx` — bỏ câu "MỘC hiện chưa có thư viện mẫu tin nhắn để sao chép", thêm `related` trỏ `/cong-cu/tin-nhan-moi` | Nội dung khớp thực tế sau khi U4 xong |
| U13 | `app/sitemap.ts` — thêm URL các trang công cụ đã lên (mảng `pages` hoặc mảng riêng `tools`) | `curl` sitemap thấy đủ URL mới sau mỗi đợt |

U11/U12 làm ngay sau khi tool tương ứng của đợt đó xong (không dồn tất cả về cuối Phase 4) — nội dung sai sự thật dù chỉ tạm thời vẫn là nội dung sai. U13 cập nhật theo từng đợt.

## Rủi ro cần theo dõi khi làm (đã nêu trong spec, nhắc lại để không quên)

- U5/U6/U7: `localStorage` là nguồn dữ liệu chia sẻ giữa 2 trang (danh sách khách + sơ đồ bàn) — đổi shape của `GuestCsvRow` ở một nơi thì phải kiểm cả hai trang đọc đúng, không giả định type khớp mà không chạy thử.
- U2/U7 (tải ảnh QR / ảnh sơ đồ bàn qua thẻ `<a download>` trỏ ảnh cross-origin): một số trình duyệt (đặc biệt Safari) có thể mở tab mới thay vì tải trực tiếp với ảnh cross-origin — kiểm thật, không giả định `download` luôn hoạt động; nếu không tải trực tiếp được, hướng dẫn "giữ để lưu ảnh" thay vì im lặng.
- U9/U10: đây là task duy nhất thêm dependency mới trong Phase 4 — nếu bundle/hiệu năng thực tế tệ hơn dự kiến sau khi thử, được phép dừng ở "sắp ra mắt" thay vì ép hoàn thành (spec mục 4 đã ghi rõ đây không phải đánh đổi được).
