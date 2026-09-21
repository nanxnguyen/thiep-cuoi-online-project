# Deploy MỘC Wedding

Ba phần: **Supabase** (Postgres + Storage), **backend** (Spring Boot, container Docker), **frontend** (Vercel). Làm theo thứ tự này vì mỗi phần cần địa chỉ của phần trước.

> Trạng thái: runbook viết sẵn, **chưa chạy thật** (chờ chủ dự án chọn nơi host backend, tạo Supabase, chốt tên miền). Sau khi làm xong, ghi kết quả vào `PROGRESS.md` (T28).

## 1. Supabase

1. Tạo project (chọn vùng gần người dùng, ví dụ Singapore). Lưu mật khẩu database.
2. **Database**: Project Settings → Database → Connection string → JDBC. Dùng `DB_URL=jdbc:postgresql://<host>:5432/postgres?sslmode=require`, `DB_USERNAME=postgres` (hoặc `postgres.<ref>` nếu dùng pooler), `DB_PASSWORD=<mật khẩu>`. Flyway tự tạo bảng ở lần chạy đầu (`V1__init.sql`).
3. **Storage**: tạo bucket tên `media`, đặt **Public** (thiệp cần hiển thị ảnh/nhạc cho khách không đăng nhập). Backend là nơi duy nhất ghi vào bucket.
4. **Khoá**: Project Settings → API. Lấy `Project URL` (`SUPABASE_URL`) và khoá `service_role` hoặc `sb_secret_…` (`SUPABASE_SERVICE_ROLE_KEY`). **Khoá này chỉ để trên backend, không bao giờ đưa vào frontend hay commit.**

## 2. Backend (repo `Thiep-cuoi-online-backend`)

Image Docker chạy một cổng (`$PORT`, mặc định 10000), health check ở `/actuator/health` cùng cổng, tài liệu API công khai đã tắt. Dùng được trên Render, Fly.io, Railway, Cloud Run (Vercel không chạy Java).

Biến môi trường:

| Biến | Giá trị |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | từ Supabase (mục 1.2) |
| `CORS_ALLOWED_ORIGINS` | origin của frontend, ví dụ `https://moc.vn` (nhiều origin: phân tách bằng dấu phẩy, không có dấu `/` cuối) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` | từ Supabase; bucket mặc định `media` |
| `JAVA_OPTS` | tuỳ chọn; mặc định `-XX:MaxRAMPercentage=75` |

Kiểm tra sau khi lên: `GET https://<be-host>/actuator/health` trả `{"status":"UP"}`.

Giới hạn cần biết:
- Bộ giới hạn tốc độ (RSVP, lời chúc, tạo thiệp) nằm trong bộ nhớ: **chạy đúng 1 instance**. Khi cần nhiều instance thì chuyển sang Redis/bảng DB.
- Máy chủ miễn phí "ngủ" khi không có lượt truy cập; lần mở đầu có thể chậm vài chục giây.

## 3. Frontend (Vercel)

1. Import repo frontend, framework Next.js (tự nhận), Node 22.
2. Biến môi trường:
   - `NEXT_PUBLIC_API_BASE_URL` = địa chỉ backend, ví dụ `https://moc-api.onrender.com` (không có `/` cuối).
   - `NEXT_PUBLIC_SITE_URL` = tên miền thật, ví dụ `https://moc.vn`. **Bắt buộc đặt khi lên production**: dùng cho sitemap, canonical, Open Graph. Nếu để trống, code chỉ còn dựa vào `VERCEL_PROJECT_PRODUCTION_URL`, mà biến đó chỉ có khi bật "Enable access to System Environment Variables" trong Settings → Environment Variables; thiếu cả hai thì mọi URL bị ghi là `http://localhost:3000` (build có in cảnh báo).
3. Deploy, rồi quay lại backend: đặt `CORS_ALLOWED_ORIGINS` đúng origin frontend và khởi động lại backend.

## 4. Kiểm tra sau deploy (smoke test, làm tay)

1. Mở `/templates`: 10 mẫu hiện ra, bấm vào từng mẫu xem được.
2. `/studio` → chọn mẫu → sửa tên cô dâu chú rể → thấy "Đã lưu".
3. Thêm 1 ảnh ở tab Ảnh (kiểm tra upload Supabase) và 1 file mp3 (nhạc).
4. Xuất bản, mở link `/invite/<slug>?to=Tên` ở tab ẩn danh: có phong bì, ảnh hiện, nhạc phát.
5. Gửi RSVP và một lời chúc; quay lại Studio tab Phản hồi thấy cả hai; ẩn lời chúc rồi tải lại trang khách: lời chúc biến mất.
6. `https://<domain>/sitemap.xml` và `/robots.txt` trỏ đúng tên miền.

## 5. Việc chưa làm (ghi nhận)

- Sao lưu database: dùng sao lưu của Supabase (gói trả phí có PITR); gói miễn phí nên tự `pg_dump` định kỳ.
- Giám sát/log: chưa có Sentry hay uptime check.
- Người dùng mất **link chỉnh sửa** thì không lấy lại được thiệp (không có tài khoản). Nội dung này đã nhắc trong Studio; sẽ giải quyết ở Phase 6 (tài khoản).
