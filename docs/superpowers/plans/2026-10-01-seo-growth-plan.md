# Kế hoạch SEO lên top: taothiepcuoi.raystudio.com.vn

Viết lại: 2026-10-04. Bổ sung cho spec kỹ thuật `docs/superpowers/specs/2026-09-30-seo-optimization-design.md` và `2026-10-01-seo-pages-plan.md`. File này lo **keyword, nội dung, backlink, quảng cáo, đo lường**. Việc code SEO nằm ở hai file kia.

## 0. Hiện trạng (2026-10-04)

**Đã xong, đã deploy:**
- Canonical/domain, `lib/seo.ts` (title, description, lastmod mỗi trang), OG, `sitemap.ts`, `robots.ts`, `manifest.ts`, `tests/seo.test.ts`.
- JSON-LD (`lib/jsonld.ts`, `PageJsonLd`): BreadcrumbList, ItemList, WebApplication cho tool, FAQPage ở `/tro-giup` và `/templates`, BlogPosting cho bài viết.
- **Blog `/blog` + 6 bài** (thay quyết định "không blog" của 2026-10-01).
- Trang `/thiet-ke-thiep-rieng` (nhu cầu thiệp độc bản).
- Trang `/invite`, `/studio`, `/account` đã noindex.

**Chưa làm hoặc chưa đo được:**
- Search Console: sitemap từng báo "Không thể tìm nạp", chưa có dữ liệu truy vấn thực.
- Chưa yêu cầu lập chỉ mục `/blog` và 6 bài.
- Chưa có GA4, chưa có backlink, chưa có profile thương hiệu.
- 4 landing còn mỏng chữ (design không có khối copy dài).
- OG image riêng cho mỗi mẫu và mỗi bài chưa có; Rich Results Test trên domain thật chưa chạy; Lighthouse mobile còn 71–86.

**Kỳ vọng thực tế:** subdomain mới. Keyword đuôi dài vào top 10 sau 2–3 tháng. "Thiệp cưới online" (từ khóa gốc, đối thủ như ChungDoi, Canva, CinéLove, m-invite) cần 6–12 tháng cộng backlink. Không ai cam kết được top 1.

## 1. Hai đường lên Google (theo ảnh kết quả tìm kiếm)

| | Quảng cáo (khung "Được tài trợ") | SEO (kết quả tự nhiên) |
|---|---|---|
| Cách làm | Google Ads, chiến dịch Search, trả theo click | Nội dung, kỹ thuật, backlink |
| Tốc độ | Có ngay | 3–12 tháng |
| Chi phí | Mỗi click vài nghìn đến vài chục nghìn đồng với từ khóa cưới | Miễn phí, tốn công |
| Dừng chi tiền | Mất vị trí | Vẫn giữ |

Sản phẩm đang miễn phí và không có doanh thu, nên **SEO là đường chính**. Ads chỉ thử khi chủ dự án muốn có traffic sớm để đo (ngân sách nhỏ, từ khóa đuôi dài như "QR mừng cưới", "thiệp cưới có tên khách mời").

## 2. Chiến lược

1. **Đuôi dài trước, từ khóa gốc sau.** Đối thủ giữ từ khóa gốc. Ta thắng ở cụm họ làm mỏng.
2. **Công cụ miễn phí + blog là mỏ neo.** `/cong-cu/*` và `/blog/*` có nhu cầu tìm kiếm riêng, ít đối thủ, dễ có backlink tự nhiên.
3. **Mỗi trang một keyword chính** (mục 4), không để hai trang tranh nhau.
4. **Nội dung và backlink quyết định thứ hạng.** On-page chỉ là điều kiện cần.

## 3. Việc cần làm, theo thứ tự

### Giai đoạn 1: Cho Google biết site (tuần 1–2) — chủ yếu việc của chủ dự án

| # | Việc | Ai | Xong khi |
|---|---|---|---|
| 1.1 | Search Console: sitemap về "Thành công". Nếu sau 3 ngày vẫn lỗi, thêm property Tiền tố URL `https://taothiepcuoi.raystudio.com.vn/` rồi gửi lại `sitemap.xml` | Chủ dự án | Sitemap "Thành công", số trang khám phá lớn hơn 0 |
| 1.2 | Kiểm tra URL → Yêu cầu lập chỉ mục: `/`, `/templates`, `/blog`, 6 bài blog, 4 landing, `/bang-gia`, `/cong-cu-dam-cuoi`, 2 tool chính (khoảng 20 trang, tối đa ~10 yêu cầu/ngày) | Chủ dự án | `site:taothiepcuoi.raystudio.com.vn` có kết quả |
| 1.3 | Cài GA4, nối với Search Console | Chủ dự án | Có dữ liệu sau 48 giờ |
| 1.4 | Rà `git status` và commit (còn ~61 file chưa commit, xem `PROGRESS.md`) | Chủ dự án | Build từ git ra đúng bản production |
| 1.5 | Chạy Rich Results Test trên 4 loại trang: bài blog, `/templates`, `/tro-giup`, 1 tool | Chủ dự án hoặc Claude | Không lỗi structured data |

### Giai đoạn 2: Làm dày nội dung trang hiện có (tuần 2–6) — việc của Claude, cần chủ dự án duyệt

- **4 landing** (`/thiep-cuoi-online-mien-phi`, `/tao-thiep-cuoi`, `/qr-tien-mung`, `/tin-nhan-moi-cuoi`): thêm khối copy 600–800 từ và FAQ ở dưới nếp gấp, **không đổi layout/màu**. Thêm FAQPage JSON-LD khi đã có FAQ hiển thị. Cần chủ dự án duyệt vì PROGRESS ghi "bỏ SEO copy ở landing".
- `/templates`: mô tả ngắn theo phong cách (tối giản, cổ điển, vườn xanh, đỏ son, thủy mặc, Hàn). OG image riêng cho `/templates/[id]`.
- Internal link: mỗi bài blog link tới 1 landing và 1 tool liên quan; mỗi landing link ngược về bài blog tương ứng.
- Lighthouse mobile ≥ 90 cho `/`, `/blog`, 4 landing (ảnh và font là chỗ nặng).

### Giai đoạn 3: Nội dung mới (từ tuần 4, đều đặn 2 bài/tháng)

Blog là nơi duy nhất thêm trang mới (1 file trong `lib/blog/posts/` + import ở `lib/blog/index.ts`). Mỗi bài nhắm một cụm đuôi dài, có ví dụ thật, link tới tool. Gợi ý, chọn theo dữ liệu Search Console sau 4 tuần:

- Mẫu lời mời cưới theo từng vùng và hình thức (bố mẹ mời, cô dâu chú rể mời).
- Cách ghi phong bì và QR mừng cưới cho khách ở xa.
- Timeline chuẩn bị đám cưới 6 tháng, ngân sách đám cưới.
- So sánh thiệp giấy và thiệp online (từ khóa so sánh, ít đối thủ).
- Mẫu lời cảm ơn sau đám cưới, mẫu caption ảnh cưới.

Mỗi bài: 1 từ khóa chính, 800–1500 từ, `updated` đúng ngày, có OG image.

### Giai đoạn 4: Backlink và phân phối (từ tuần 3, liên tục) — chủ dự án đăng, Claude soạn nội dung

1. Facebook group cưới hỏi: chia sẻ công cụ miễn phí và bài hướng dẫn. Đọc luật group, không spam.
2. TikTok, Reels, Shorts: video 30 giây "tạo thiệp cưới trong 5 phút", link ở mô tả.
3. Diễn đàn và wedding directory (Webtretho, các site cưới): giới thiệu công cụ.
4. Blogger cưới và studio ảnh cưới: gửi tool để họ nhúng link.
5. Profile thương hiệu: Facebook page, TikTok, YouTube, LinkedIn, link về site.
6. Dòng "Tạo bằng MỘC" trên thiệp khách: cần chủ dự án duyệt. `/invite` noindex nên chủ yếu kéo traffic, không truyền link juice.

Mục tiêu: 10 backlink chất lượng mỗi tháng, ưu tiên site cùng chủ đề. Không mua link, không spam (Google phạt).

### Giai đoạn 5: Đo lường (hàng tuần và hàng tháng)

- Hàng tuần: Search Console → Hiệu suất. Trang nhiều hiển thị nhưng CTR thấp thì sửa title/description.
- Hàng tháng: cập nhật bảng keyword. Bài lên trang 2 thì thêm nội dung và link nội bộ.
- Sau 4 tuần có dữ liệu: đổi keyword chính từng trang theo truy vấn thực tế.

## 4. Bảng keyword (nháp, xác nhận bằng Search Console và Keyword Planner)

| Trang | Keyword chính | Keyword phụ |
|---|---|---|
| `/` | thiệp cưới online | tạo thiệp cưới online, thiệp mời cưới online |
| `/thiep-cuoi-online-mien-phi` | thiệp cưới online miễn phí | làm thiệp cưới online free |
| `/tao-thiep-cuoi` | tạo thiệp cưới online | cách làm thiệp cưới online |
| `/templates`, `/templates/[id]` | mẫu thiệp cưới online | mẫu thiệp cưới đẹp |
| `/qr-tien-mung` | QR mừng cưới | mã QR nhận tiền mừng cưới |
| `/tin-nhan-moi-cuoi` | lời mời cưới hay | tin nhắn mời cưới |
| `/cong-cu-dam-cuoi` | công cụ đám cưới | lên kế hoạch đám cưới |
| `/cong-cu/tao-qr` | tạo QR thiệp cưới | |
| `/cong-cu/nen-anh` | nén ảnh cưới | giảm dung lượng ảnh |
| `/bang-gia` | giá thiệp cưới online | |
| `/thiet-ke-thiep-rieng` | thiết kế thiệp cưới riêng | thiệp cưới online theo yêu cầu |
| `/blog/cach-lam-thiep-cuoi-online` | cách làm thiệp cưới online | |
| `/blog/cach-viet-loi-moi-cuoi` | cách viết lời mời cưới | |
| `/blog/checklist-chuan-bi-dam-cuoi` | checklist chuẩn bị đám cưới | |
| `/blog/gui-thiep-cuoi-truoc-bao-lau` | gửi thiệp cưới trước bao lâu | |
| `/blog/lap-danh-sach-khach-moi-cuoi` | danh sách khách mời đám cưới | |

## 5. KPI

| Mốc | Chỉ số |
|---|---|
| Tuần 2 | Sitemap thành công; ít nhất 10 trang được lập chỉ mục; GA4 có dữ liệu |
| Tháng 1 | Mọi trang trong sitemap được lập chỉ mục; Rich Results Test sạch; có dữ liệu truy vấn |
| Tháng 2 | Ít nhất 20 backlink; vài keyword đuôi dài vào top 30; 4 bài blog mới |
| Tháng 3 | Ít nhất 500 lượt hiển thị mỗi ngày; vài keyword đuôi dài top 10 |
| Tháng 6 | Ít nhất 3.000 lượt truy cập organic mỗi tháng; "tạo thiệp cưới online miễn phí" top 10 |

## 6. Rủi ro

- Nội dung mỏng hoặc trùng giữa các landing và bài blog: giữ 1 keyword chính mỗi trang.
- Animation che chữ với crawler: kiểm bằng view-source và URL Inspection → "Xem trang đã thu thập".
- Landing theo design 100%: thêm copy SEO phải được chủ dự án duyệt.
- Ảnh trong blog và `public/photos` chưa rõ bản quyền, nhiều tấm có logo: xử lý trước khi đẩy traffic về (xem `PROGRESS.md`).
- Backlink spam bị Google phạt: chỉ làm link tự nhiên, đúng chủ đề.

## 7. Quyết định cần chủ dự án

1. Cho thêm khối copy SEO và FAQ dưới nếp gấp ở 4 landing không.
2. Dòng "Tạo bằng MỘC" trên thiệp khách: bật hay không.
3. Có chạy Google Ads thử không, ngân sách tối đa bao nhiêu mỗi tháng.
4. Ai đăng bài ngoài (Facebook, TikTok, diễn đàn): chủ dự án đăng, Claude soạn.
