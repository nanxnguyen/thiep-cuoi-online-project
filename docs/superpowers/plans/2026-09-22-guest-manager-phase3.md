# MỘC Wedding Phase 3: Guest manager

> Trạng thái sống nằm ở `PROGRESS.md` (mục 2c). File này là kế hoạch thực thi; thiết kế chi tiết ở `docs/superpowers/specs/2026-09-22-guest-manager-phase3-design.md`. Đọc spec trước khi làm bất kỳ task nào — không lặp lại lý do quyết định ở đây.

## Nguyên tắc

- Theo quy ước dự án: **không Playwright/trình duyệt trong lúc code** — chỉ `npm test`, `npm run typecheck`, `npm run build`, `./mvnw test`. QA trình duyệt một đợt sau khi xong cả 3a+3b.
- Đổi giới hạn/hành vi ở BE thì cập nhật cả FE cùng lúc (đặc biệt: `RsvpSummary` khoá gộp, `CorsConfig` thêm `DELETE`).
- Backward-compatible bắt buộc: `?to=` cũ, `guest_label` cũ không được vỡ ở bất kỳ task nào.

## Đợt 3a: Xương sống (migration → API → tab Studio, dùng được độc lập)

| # | Việc | Xong khi |
|---|---|---|
| G1 | `V2__guests.sql` (bảng `guests` + cột `rsvps.guest_id`); `entity/Guest.java`; thêm `guestId` vào `entity/Rsvp.java` | `./mvnw test` xanh (migration chạy được trên Postgres dev đã có dữ liệu thử) |
| G2 | `GuestTokenService` (sinh token, mock được trong test); `repository/GuestRepository`; `service/GuestService` (CRUD, retry khi trùng token, không gồm CSV) | test đơn vị: sinh nhiều token không trùng (độ dài/charset đúng) **và** một ca mock `generate()` trả trùng 2 lần rồi khác → `GuestService` tự thử lại và tạo thành công (nhánh retry thật sự chạy qua, không chỉ suy luận từ xác suất) |
| G3 | `dto/{GuestRequest,GuestResponse,GuestsResponse}`; `controller/GuestController` — `POST/GET/PATCH/DELETE /api/invitations/{id}/guests[...]` qua `authorize()` | test: 401/403 khi thiếu/sai key; CRUD round-trip; `CorsConfig` đã thêm `DELETE` |
| G4 | `dto/ResolveGuestResponse`; thêm `GET /api/public/invitations/{slug}/guests/{token}` vào `PublicInvitationController`, throttle riêng qua `ThrottleService` (prefix mới) | test: token đúng trả `household`; token sai trả 404; vượt throttle trả 429 |
| G5 | `dto/RsvpRequest` thêm `guestToken`; `PublicInvitationService.submitRsvp` resolve token → `guest_id` (bỏ qua lặng lẽ nếu sai); `RsvpSummary` đổi khoá gộp (`guest_id` ưu tiên, fallback tên) | test: RSVP có token đúng → `guest_id` được gắn; token sai → RSVP vẫn thành công, `guest_id` null; `RsvpSummaryTest` cập nhật và xanh |
| G6 | `lib/api.ts` thêm `listGuests/createGuest/updateGuest/deleteGuest/resolveGuestToken` | `tests/api.test.ts` mở rộng, `npm run typecheck` sạch |
| G7 | `app/invite/[slug]/page.tsx` đọc `g`, gọi `resolveGuestToken`, truyền `guestToken` xuống `RsvpForm`; `RsvpForm.tsx` gửi kèm `guestToken` | `npm run build` OK; `?to=` cũ vẫn hoạt động không đổi hành vi |
| G8 | `components/studio/GuestsPanel.tsx` (bảng CRUD thô: thêm/sửa/xoá/sao chép 1 link) + tab "Khách mời" trong `Editor.tsx` | `npm run typecheck`, `npm run build` OK; thao tác CRUD gọi đúng API mới (kiểm bằng test hoặc chạy dev thủ công, chưa cần Playwright) |

**Checkpoint sau 3a:** `npm test`, `npm run typecheck`, `npm run build`, `./mvnw test` đều xanh. Tạo thử 1 khách qua Studio (dev server), mở link `?g=`, gửi RSVP, xác nhận trạng thái hiện đúng trên dòng khách — kiểm thủ công nhanh, chưa phải QA trình duyệt đầy đủ.

## Đợt 3b: CSV, sao chép hàng loạt, thống kê

| # | Việc | Xong khi |
|---|---|---|
| G9 | `lib/csv.ts` (parse dò dấu phân cách + bỏ BOM; stringify kèm BOM) + `tests/csv.test.ts` (round-trip, dấu tiếng Việt, dòng lỗi không chặn cả file) | `npm test` xanh, có ca kiểm dấu phân cách `,`/`;`/`\t` |
| G10 | `dto/{GuestImportRequest,GuestImportResult}`; `POST /api/invitations/{id}/guests/import` (nhận mảng `GuestRequest[]` đã parse sẵn ở FE dạng JSON — không parse CSV ở BE, xem spec mục 8; validate + insert hàng loạt, trả kết quả từng dòng theo index) | test: 1 dòng lỗi không chặn các dòng còn lại; trả đúng lý do lỗi |
| G11 | `GuestsPanel.tsx` thêm: nút Nhập CSV (đọc file bằng `lib/csv.ts`, gửi JSON qua `importGuests`, hiện kết quả từng dòng), nút Xuất CSV (dựng CSV bằng `lib/csv.ts` từ dữ liệu `listGuests` đã tải — không gọi BE), nút "Sao chép tất cả link", bộ lọc Nhóm/Bàn, dòng thống kê đầu bảng (dự kiến vs. đã xác nhận theo Nhóm/Bàn — công thức ở spec mục 7, tính ở FE) | `npm run typecheck`, `npm run build` OK |

**Checkpoint sau 3b (QA trình duyệt cả phase, theo quy ước):** Playwright 390/1280 trên tab Khách mời: thêm/sửa/xoá thủ công, nhập CSV có 1 dòng lỗi cố ý, xuất CSV rồi mở lại kiểm dấu tiếng Việt, sao chép 1 link mở ẩn danh gửi RSVP rồi quay lại xem trạng thái cập nhật, sao chép tất cả link. Lighthouse tab Khách mời (mobile). Ghi kết quả vào `PROGRESS.md` mục 2c + nhật ký.

## Rủi ro cần theo dõi khi làm (đã nêu trong spec, nhắc lại để không quên)

- G5 đổi `RsvpSummary` — chạy lại toàn bộ test RSVP hiện có trước khi coi là xong, không chỉ test mới.
- G3 cần `CorsConfig` thêm `DELETE` — dễ quên vì nó nằm ngoài `GuestController`.
- G7/G8: `?to=` và `?g=` phải chạy song song không xung đột — thêm một ca thủ công "mở bằng `?to=` sau khi đã có `?g=` ở thiệp khác" trước khi coi 3a xong.
