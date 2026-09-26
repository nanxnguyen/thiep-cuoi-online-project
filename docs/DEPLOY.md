# Deploy MỘC Wedding

Hai phần: **Supabase** (Postgres + Auth + Storage + Edge Function) và **Netlify** (frontend + Route Handlers Next.js, deploy cùng nhau). Không còn backend Java riêng.

> Supabase project: `iehmucsshklgjmxqyggp`. Không in secret vào log hay tài liệu.

## 1. Supabase

1. Project đã có. Nếu tạo mới: chọn vùng gần người dùng (Singapore), lưu mật khẩu database.
2. **Database:** chạy migration trong `supabase/migrations/`:
   ```bash
   npx supabase link --project-ref iehmucsshklgjmxqyggp
   npx supabase db push
   ```
   Kiểm tra Dashboard → Table Editor có đủ 5 bảng: `invitations`, `guests`, `rsvps`, `wishes`, `rate_limits`.
3. **Storage:** bucket `media` đã có, **Public** (thiệp hiển thị ảnh/nhạc cho khách không đăng nhập). Upload chỉ qua server đã authorize; browser không có quyền ghi.
4. **Auth:** Dashboard → Authentication → Sign In/Up: tắt **Confirm email** (app cần session ngay sau đăng ký). Dùng email/mật khẩu.
5. **Edge Function `public-write`** (RSVP/lời chúc, rate limit, chống bot):
   ```bash
   npx supabase secrets set EDGE_SHARED_SECRET=<cùng-giá-trị-với-Netlify-và-.env.local>
   npx supabase functions deploy public-write
   ```
   Kiểm tra: `GET https://<ref>.supabase.co/functions/v1/public-write` không còn 404 `NOT_FOUND`.

## 2. Netlify (frontend + API)

1. Import repo, build `npm run build:next`, plugin `@netlify/plugin-nextjs` (đã có trong `netlify.toml`), Node 22.
2. Biến môi trường (Site → Settings → Environment variables) — lấy từ `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Dashboard → Project Settings → API; hệ key mới: `sb_publishable_...`)
   - `SUPABASE_SERVICE_ROLE_KEY` (`sb_secret_...`, chỉ server, không commit)
   - `EDGE_SHARED_SECRET`, `RATE_LIMIT_HMAC_SECRET` (tự tạo: `openssl rand -hex 32`)
   - `NEXT_PUBLIC_SITE_URL` = tên miền thật, vd `https://moc.vn`. **Bắt buộc ở production** (sitemap, canonical, Open Graph).
3. Deploy. Tài liệu API tương tác có sẵn ở `/docs` (spec JSON ở `/api/docs`).

## 3. Kiểm tra sau deploy (smoke test, làm tay)

1. Mở `/templates`: mẫu hiện ra, bấm vào từng mẫu xem được.
2. Đăng ký/đăng nhập ở `/account`.
3. `/studio` → chọn mẫu → sửa tên cô dâu chú rể → thấy "Đã lưu".
4. Thêm 1 ảnh ở tab Ảnh và 1 file mp3 (nhạc).
5. Xuất bản, thêm 2 khách ở tab Khách, mở link riêng `/invite/<slug>?g=<mã>` của từng hộ ở tab ẩn danh: phong bì ghi đúng tên hộ, ảnh hiện, nhạc phát.
6. Gửi RSVP và một lời chúc; quay lại Studio tab Phản hồi thấy cả hai; ẩn lời chúc rồi tải lại trang khách: lời chúc biến mất.
7. Thêm khách ở tab Khách, mở link `?g=<token>`: hiện đúng tên hộ.
8. `https://<domain>/sitemap.xml` và `/robots.txt` trỏ đúng tên miền.

## 4. Vận hành

- **Sao lưu:** gói Supabase trả phí có PITR; gói miễn phí tự `pg_dump` định kỳ bằng connection string (Database → Connection string, nhớ percent-encode mật khẩu).
- **Rollback:** Netlify giữ lịch sử deploy (bấm Publish lại bản cũ); Supabase chưa có down-migration — sửa bằng migration mới.
- **Xoay secret:** tạo key mới ở Dashboard (API Keys → New secret key), cập nhật `.env.local` + Netlify env + `supabase secrets set`, deploy lại cả hai.
