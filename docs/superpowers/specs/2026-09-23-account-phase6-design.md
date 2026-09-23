# Phase 6A — Tài khoản và nhận thiệp cũ

## Mục tiêu

Cho phép chủ thiệp tạo tài khoản, đăng nhập, xem các thiệp đã nhận vào tài khoản và tiếp tục chỉnh sửa chúng mà không phải phụ thuộc duy nhất vào localStorage/edit key.

Donate và thanh toán không thuộc phạm vi tài liệu này.

## Quyết định

- Dùng email + mật khẩu; không thêm OAuth ở đợt đầu.
- Backend Spring Security + JWT access token.
- FE lưu token trong `sessionStorage` ở đợt đầu để không thêm cookie/domain phức tạp; không lưu mật khẩu.
- Mật khẩu được băm bằng BCrypt/PasswordEncoder, không lưu plaintext.
- API tài khoản trả lỗi tiếng Việt theo kiểu `ProblemDetail` hiện có.
- Thiệp cũ được nhận bằng `invitation id + edit key`; backend xác minh edit key trước khi gắn `owner_id`.
- Một thiệp chỉ có một chủ tài khoản; nhận lại thiệp đã thuộc tài khoản trả 409.
- Không xoá hoặc vô hiệu hoá edit key hiện tại trong đợt đầu để giữ tương thích với Studio hiện có.
- Dữ liệu RSVP, wishes, guests vẫn đi theo invitation và không đổi schema ngoài `owner_id`.

## Luồng chính

1. Người dùng mở `/account`, đăng ký hoặc đăng nhập.
2. FE nhận access token, gọi `/api/account/invitations` để hiển thị thiệp của tài khoản.
3. Người dùng dán link Studio có `#k=...`; FE phân tích bằng helper hiện có, gửi id + key tới `/api/account/invitations/claim`.
4. Backend xác minh key, gắn owner, trả thiệp đã nhận.
5. Người dùng bấm một thiệp để mở Studio; FE vẫn có thể dùng edit key hiện tại, còn dashboard là nơi khôi phục link.

## API dự kiến

- `POST /api/auth/register` → `{ accessToken, user: { id, email } }`
- `POST /api/auth/login` → cùng response
- `GET /api/auth/me` → user hiện tại
- `GET /api/account/invitations` → danh sách `{ id, slug, templateId, published, updatedAt, title }`
- `POST /api/account/invitations/claim` body `{ id, key }` → invitation summary; 401 nếu token sai, 404 nếu thiệp không tồn tại, 409 nếu đã có chủ.

Mọi endpoint account yêu cầu `Authorization: Bearer <token>`. RSVP/public invitation và các endpoint edit-key cũ giữ nguyên.

## Bảo mật và giới hạn

- Email normalize lowercase và unique.
- Mật khẩu tối thiểu 8 ký tự; giới hạn request đăng nhập/đăng ký bằng throttle hiện có hoặc giới hạn đơn giản theo IP ở controller/service.
- JWT secret lấy từ biến môi trường, không có fallback production an toàn giả.
- Không đưa edit key hoặc password vào response/log.
- Token hết hạn trả 401; FE xoá token và đưa người dùng về màn đăng nhập.

## Không làm trong Phase 6A

- Thanh toán, trial, subscription.
- OAuth, quên mật khẩu qua email, xác minh email.
- Donate: chờ 4 thông tin ngân hàng thật của chủ dự án.
- Chuyển quyền sở hữu hoặc nhiều chủ tài khoản.
