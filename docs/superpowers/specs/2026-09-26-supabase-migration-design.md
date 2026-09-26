# Thiết kế migration BE sang Next.js + Supabase

**Ngày:** 2026-09-26  
**Trạng thái:** Đã được chủ dự án duyệt

## Mục tiêu và quyết định

Thay Spring Boot bằng Route Handlers/Server Actions trong Next.js; dùng lại
Supabase project `iehmucsshklgjmxqygqp`. Dữ liệu cũ không migrate, hệ thống
bắt đầu với database mới. Netlify là nơi deploy duy nhất cho cả FE và BE.

Auth dùng email/mật khẩu. Cơ chế edit key `#k=` vẫn được giữ song song cho
người không đăng ký tài khoản. RSVP và lời chúc đi qua Route Handler để kiểm
tra payload, guest token và rate limit trước khi ghi; RLS là lớp bảo vệ cuối.

## Kiến trúc và dữ liệu

### Ranh giới module

Luồng phụ thuộc chỉ đi một chiều:

```text
UI / lib/api.ts
  -> app/api/**/route.ts        (HTTP: parse request, status, response)
  -> lib/server/<domain>.ts     (nghiệp vụ và phân quyền)
  -> lib/server/supabase.ts     (tạo client theo quyền)
  -> Supabase Auth/Postgres/Storage
```

Route Handler không chứa câu query hoặc luật nghiệp vụ. Module domain không
biết `Request`/`Response` và trả về DTO hoặc lỗi có kiểu. Supabase query nằm
trực tiếp trong module domain; chưa tạo repository interface vì hiện chỉ có
một database. Khi có database thứ hai hoặc test integration không đủ nhanh
mới tách adapter.

Các module server dự kiến:

- `env.ts`: đọc và kiểm tra biến môi trường server tại một chỗ.
- `supabase.ts`: tạo ba loại client: anonymous cho public read, user-scoped
  cho RLS theo Auth, admin chỉ cho thao tác đã được authorize trước.
- `http.ts`: parse Zod, ánh xạ lỗi sang `{ detail }`, không chứa nghiệp vụ.
- `edit-key.ts`: sinh key ngẫu nhiên 256-bit, SHA-256 và xác minh key.
- `invitations.ts`: create/read/update/publish/claim và public projection.
- `guests.ts`: CRUD/import guest và resolve token.
- `responses.ts`: RSVP, wishes, summary và moderation.
- `media.ts`: kiểm MIME bằng magic bytes, kích thước, object path và upload.

Không tạo class/service container, dependency injection framework hay generic
repository. Các hàm nhận Supabase client khi test cần thay dependency; production
dùng factory tập trung trong `supabase.ts`.

### Luồng quyền

| Luồng | Client DB | Quyền |
|---|---|---|
| Đọc thiệp public | anonymous | RLS chỉ cho `published = true` |
| Chủ tài khoản | user-scoped | RLS theo `owner_id = auth.uid()` |
| Link `#k=` | admin sau `requireEditKey()` | đúng một invitation |
| Tạo thiệp chưa đăng nhập | admin | tạo record owner rỗng + edit-key hash |
| RSVP/lời chúc | Edge Function | secret nội bộ + rate limit + thiệp published |
| Upload media | admin sau owner/edit-key auth | prefix đúng invitation |

Admin client không được export cho UI hoặc gọi trực tiếp từ Route Handler;
chỉ các domain function đã kiểm quyền mới dùng được. Public browser không có
policy ghi database.

- `invitations`: `id`, `slug`, `template_id`, `content jsonb`, `published`,
  `published_at`, nullable `owner_id`, `edit_key_hash`, timestamps. `content`
  phải hợp lệ theo `contentSchema` và giữ nguyên shape hiện tại.
- `guests`: invitation, household, group/table/phone, expected pax, note,
  token hash, timestamps.
- `rsvps`: invitation, nullable guest, name, attending, guests, note,
  answers jsonb, guest label, timestamps.
- `wishes`: invitation, name, message, `hidden`, `approved`, timestamps. Wish
  mới mặc định `approved = false`; chủ thiệp duyệt trước khi xuất hiện public.
- Khoá edit không lưu plaintext; Route Handler nhận `#k=`, hash và so sánh
  server-side. Fragment không tự gửi lên server nên client phải chuyển key vào
  header/body khi gọi API.

Database migration nằm trong `supabase/migrations/` và là nguồn sự thật cho
schema, index, trigger, RLS/policies, Realtime publication và RPC rate limit.
Foreign key dùng `on delete cascade` cho dữ liệu con; unique index áp dụng cho
`slug`, guest token hash và các idempotency key cần thiết.

Mọi trường mới của Editor v3 (lời chào phong bì, lịch trình, thứ bậc gia đình,
bật/tắt section, bố cục album, giờ đón khách) có default hợp lệ và cho phép
giá trị rỗng để autosave không bị lỗi.

## RLS, Auth và API

- Người chưa đăng nhập chỉ đọc invitation đã publish.
- Client không insert trực tiếp RSVP/lời chúc. Route Handler kiểm contract rồi
  gọi Edge Function bằng shared secret. Edge Function kiểm tra lại payload,
  honeypot, invitation published và gọi RPC rate-limit + insert trong cùng
  trust boundary.
- Chủ sở hữu qua Supabase Auth được CRUD invitation, guests, responses và
  duyệt/ẩn wishes.
- Edit-key route chỉ cho phép thao tác trên đúng invitation sau khi hash khớp.
- RLS bật trên mọi bảng; service-role key chỉ dùng server, anon key dùng client.
- Giữ chữ ký các hàm trong `lib/api.ts`, chỉ thay phần triển khai từ gọi BE
  Java sang route nội bộ `/api/**`.

Auth session dùng cookie `HttpOnly`, `Secure`, `SameSite=Lax` do
`@supabase/ssr` quản lý; JWT không còn là nguồn sự thật trong localStorage.
Login/register vẫn trả DTO hiện tại để giảm blast radius, nhưng account routes
xác thực bằng cookie. Thêm logout route để xoá session đúng cách. Email confirm,
reset password và OAuth để phase sau.

Các route giữ nguyên contract hiện tại: auth, invitations, media, responses,
guests, public invitation, guest-token resolve, RSVP và wishes. Media dùng
bucket `media` hiện có, giới hạn MIME/kích thước và prefix theo
`invitation_id`. Bucket public-read để giữ URL trong `content` tương thích;
tên object dùng UUID không đoán được. Nếu sau này cần thiệp riêng tư thật sự,
đổi sang lưu object path + signed URL ở một migration riêng.

## Luồng request quan trọng

1. Tạo thiệp: validate `contentSchema` -> sinh slug/key -> lưu hash -> trả
   plaintext key đúng một lần.
2. Autosave: `X-Edit-Key` -> hash -> authorize invitation -> validate patch ->
   update có `updated_at`.
3. Claim: cookie user + edit key -> cập nhật `owner_id`; owner và edit key đều
   tiếp tục dùng được.
4. Public read: slug -> anonymous client -> projection chỉ gồm content và wish
   được duyệt/không ẩn; không lộ owner/hash/token.
5. RSVP/wish: browser -> Next Route Handler -> Edge Function -> rate-limit RPC
   -> insert; lỗi giữ status/message contract cũ.
6. Media: owner hoặc edit key -> kiểm bytes thực -> upload path
   `<invitation-id>/<uuid>.<ext>` -> trả public URL.

## Realtime, rate limit và kiểm thử

Bật Realtime cho `wishes`; trang khách subscribe các wish đã duyệt/không ẩn,
Studio subscribe bằng user session. Rate limit đặt ở Edge Function, định danh
bằng HMAC của IP + action + invitation (không lưu IP thô), cửa sổ và ngưỡng
cấu hình qua env; trả 429 theo contract cũ. Upload được giới hạn tại Next Route
Handler vì body file không chuyển qua Edge Function.

Kiểm thử bằng Node test hiện có cho API/schema, thêm test Route Handler cho
401/403/404/429, edit-key, RLS boundary, payload lỗi và RSVP/wish round-trip.
Gate mỗi task: `npm test`, `npm run typecheck`; cuối migration chạy thêm
`npm run build`, `git diff --check` và QA các route khách/Studio trên mobile,
desktop.

## Quy tắc mở rộng

- Thêm endpoint: route mỏng + hàm trong domain hiện hữu + test contract.
- Thêm bảng thuộc invitation: FK + RLS owner/public rõ ràng trước khi thêm UI.
- Thêm provider lưu trữ/database chỉ khi có implementation thứ hai; lúc đó mới
  trích interface từ các hàm đang chạy.
- Không gọi admin client ngoài domain module; mọi bypass RLS phải có test chứng
  minh bước authorize xảy ra trước query ghi.
- API version mới chỉ tạo khi DTO hiện tại không thể mở rộng tương thích.

## Phạm vi không làm

Không migrate dữ liệu PostgreSQL cũ, không giữ Spring Boot trong production,
không thêm OAuth, không cho phép ghi RSVP/lời chúc trực tiếp từ browser, và
không tạo abstraction mới nếu route/helper hiện có đáp ứng được.
