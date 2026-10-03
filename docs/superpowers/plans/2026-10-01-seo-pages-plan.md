# Kế hoạch SEO theo từng trang + trang SEO "ẩn khỏi menu"

Ngày: 2026-10-01. Domain: `https://taothiepcuoi.raystudio.com.vn`. Bổ sung cho `2026-10-01-seo-growth-plan.md` (chiến lược, backlink, KPI) và spec `2026-09-30-seo-optimization-design.md` (Phase 1–5 kỹ thuật).

## A. Phạm vi (chủ dự án chốt 2026-10-01)

**Chỉ SEO các trang hiện có. Không tạo trang mới, không làm trang SEO ẩn.** (Cập nhật 2026-10-04: chủ dự án đã yêu cầu thêm blog, xem `PROGRESS.md`.) Mọi nội dung thêm vào nằm trong trang đã có, không đổi layout/màu.

## B. Việc cho từng trang hiện có

Hiện: `layout.tsx` đặt title mặc định + template `%s | MỘC Wedding`. Nhiều trang có title/description rất ngắn hoặc chung chung, và chưa có JSON-LD/`h1` được kiểm soát.

| Trang | Keyword chính | Title đề xuất (≤ 60) | Việc cần làm |
|---|---|---|---|
| `/` | thiệp cưới online | MỘC: Tạo thiệp cưới online đẹp, miễn phí | JSON-LD Organization + WebSite; `h1` chứa keyword; link xuống 4 landing + công cụ |
| `/thiep-cuoi-online-mien-phi` | thiệp cưới online miễn phí | Thiệp cưới online miễn phí, không cần tài khoản | Mở rộng copy (miễn phí gồm gì, so với thiệp giấy), FAQ + FAQPage |
| `/tao-thiep-cuoi` | tạo thiệp cưới online | Cách tạo thiệp cưới online trong 10 phút | Hướng dẫn từng bước (HowTo), ảnh/mô tả, FAQ |
| `/templates` | mẫu thiệp cưới online | Mẫu thiệp cưới online đẹp, 20 phong cách | ItemList; mô tả theo phong cách; link tới từng mẫu |
| `/templates/[id]` | mẫu thiệp cưới + tên mẫu | `Mẫu thiệp cưới ${tên}: ${phong cách}` | OG image riêng, copy `template.seo` dài hơn, mẫu liên quan, Breadcrumb |
| `/qr-tien-mung` | QR mừng cưới | QR mừng cưới: cách làm và thêm vào thiệp | Copy mở rộng (VietQR, ngân hàng hỗ trợ), FAQ, link `/cong-cu/tao-qr` |
| `/tin-nhan-moi-cuoi` | lời mời cưới hay | 20+ lời mời cưới hay, gửi Zalo, Messenger | Thêm mẫu tin nhắn thật theo ngữ cảnh (bạn bè, đồng nghiệp, người lớn tuổi) |
| `/cong-cu-dam-cuoi` | công cụ đám cưới | Công cụ đám cưới miễn phí: QR, ảnh, khách mời | ItemList công cụ; link 6 tool |
| `/cong-cu/tao-qr` | tạo QR thiệp cưới | giữ title hiện tại | SoftwareApplication, đoạn "Cách dùng" + FAQ ngắn dưới tool |
| `/cong-cu/nen-anh` | nén ảnh cưới | giữ | như trên |
| `/cong-cu/nen-video` | nén video cưới | Nén video cưới miễn phí trên trình duyệt | như trên |
| `/cong-cu/tin-nhan-moi` | tin nhắn mời cưới | giữ | như trên |
| `/cong-cu/danh-sach-khach` | danh sách khách mời cưới | giữ | như trên |
| `/cong-cu/save-the-date` | save the date | giữ | như trên |
| `/bang-gia` | giá thiệp cưới online | Giá thiệp cưới online: miễn phí giai đoạn ra mắt | FAQ giá, so sánh gói |
| `/demo` | xem thử thiệp cưới online | Xem thử thiệp cưới online MỘC | Mô tả rõ, link `/templates` |
| `/tro-giup` | hướng dẫn làm thiệp cưới online | Trợ giúp làm thiệp cưới online | FAQPage từ Q&A hiện có |
| `/ung-ho`, `/dieu-khoan`, `/quyen-rieng-tu` | brand | giữ | chỉ cần canonical + title không trùng |

Kỹ thuật chung (một lần): helper JSON-LD trong `lib/` có test; `BreadcrumbList` mọi trang con; `generateMetadata` có `alternates.canonical`; `noindex` meta cho `/invite`, `/studio`, `/account`; sitemap `lastModified` cố định theo từng trang.

Ràng buộc: không đổi màu/layout (design parity 100%). Copy dài đặt dưới nếp gấp, dùng token/primitive sẵn có. Cần chủ dự án duyệt vì PROGRESS ghi "bỏ SEO copy ở landing".

## C. Thứ tự thực hiện và kiểm chứng

| Bước | Nội dung | Kiểm chứng |
|---|---|---|
| 1 | Phase 1–2 spec: sitemap, manifest, `noindex`, metadata mọi trang (bảng B), `tests/seo.test.ts` | `npm test`, `typecheck`, `build` xanh |
| 2 | Helper JSON-LD + Breadcrumb + FAQPage/ItemList/SoftwareApplication | test helper; Rich Results Test trên domain thật |
| 3 | Mở rộng copy các landing + trang tool (sau khi chủ dự án duyệt) | view-source có chữ; Lighthouse mobile SEO ≥ 95 |
| 4 | Thêm khối "Xem thêm" (link nội bộ) giữa các trang hiện có | test link không chết |
| 5 | Triển khai, gửi sitemap, Request Indexing | GSC thấy trang được lập chỉ mục |

Mỗi bước xong cập nhật `PROGRESS.md` (bảng trạng thái, 1 dòng nhật ký có cách kiểm chứng, mục ▶).

## D. Cần chủ dự án quyết

1. Duyệt thêm copy dài + FAQ cho landing và trang tool (bước 3).
2. Domain sitemap GSC còn lỗi: chờ hoặc thêm property Tiền tố URL.
