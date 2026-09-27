# Business: MỘC Wedding

## Mục tiêu sản phẩm

Giúp các cặp đôi Việt tự tạo, xuất bản và gửi thiệp cưới online đẹp trên điện thoại trong khoảng 15 phút, đồng thời nhận RSVP, lời chúc và quản lý khách mời tại một nơi.

## Khách hàng chính

- Cặp đôi Việt chuẩn bị cưới, ưu tiên trải nghiệm đơn giản và dùng tốt trên điện thoại.
- Khách mời mở thiệp từ link riêng, xem thông tin, xác nhận tham dự, viết lời chúc và mừng cưới.

## Giá trị khác biệt

- Miễn phí toàn bộ mẫu và tính năng; không giới hạn khách mời.
- Thiết kế mang bản sắc cưới Việt, không dùng giao diện SaaS chung chung.
- Một nội dung dùng được với nhiều mẫu, có link riêng cho từng khách và bộ công cụ cưới đi kèm.

## Mô hình vận hành

Sản phẩm hiện miễn phí, không có trial hoặc paywall. Doanh thu chưa phải ràng buộc của sản phẩm; trang Ủng hộ chỉ là đóng góp tự nguyện khi được bật lại theo quyết định của chủ dự án.

## KPI

- Người dùng có thể tạo và xuất bản một thiệp hoàn chỉnh mà không cần đăng nhập trước.
- Luồng chính hoạt động tốt trên mobile, không mất dữ liệu khi autosave và không lộ quyền chỉnh sửa.
- Mọi route public bị thay đổi đạt Lighthouse SEO 100 theo workflow dự án.
- Backend mới hoặc thay đổi phải qua security gate và abuse-case tests liên quan.

## Trong phạm vi

- Trang marketing, mẫu thiệp, Studio, trang khách, tài khoản tùy chọn và công cụ cưới.
- Supabase cho dữ liệu, auth Google, Storage, Realtime và Edge Functions.
- Netlify là nơi deploy frontend và Next.js server routes.

## Ngoài phạm vi

- Trial, gói trả phí hoặc giới hạn tính năng theo thanh toán.
- Đăng nhập email/mật khẩu trên UI.
- Gắn tên khách trực tiếp bằng `?to=`; danh tính khách chỉ đến từ token `?g=`.
- Port dữ liệu giả hoặc cơ chế backend của prototype trong `design/`.

## Nguyên tắc thương hiệu

Ấm áp, trang trọng vừa phải, rõ ràng và không sến. Nền giấy ngà, đỏ sơn mài và vàng foil là ngôn ngữ chính; khả dụng, bảo mật và sự thật sản phẩm không được hy sinh để chạy theo prototype.

## Điều không được làm

- Không đưa secret, edit key, service-role key hoặc dữ liệu khách vào client bundle, log hay tài liệu.
- Không thêm thông điệp trả phí/trial khi chưa có quyết định business mới.
- Không dùng ảnh cặp đôi mẫu trong thiệp thật khi người dùng chưa tải ảnh.
- Không tự sửa nguồn `design/`.
