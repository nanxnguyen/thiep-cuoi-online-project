# MỘC Wedding: thiệp cưới online

> Đang phát triển. Tiến độ và việc tiếp theo: xem [`PROGRESS.md`](./PROGRESS.md) (cập nhật liên tục). Đưa lên môi trường thật: [`docs/DEPLOY.md`](./docs/DEPLOY.md).

Frontend + backend Next.js 16 (React 19) của MỘC Wedding, backed by Supabase (Postgres + Auth + Storage + Realtime + Edge Functions). Không còn backend Java riêng.

- **Trang khách** `/invite/[slug]?g=mã-khách`: phong bì ghi tên hộ từ danh sách khách, lời mời, hai họ, lịch trình + bản đồ, đếm ngược + thêm vào lịch, album, RSVP, sổ lưu bút, hộp mừng cưới QR (VietQR), nhạc nền.
- **Studio** `/studio`: tạo thiệp từ mẫu, chỉnh sửa có xem trước trực tiếp, tự lưu, xuất bản, xem phản hồi và ẩn lời chúc. Không có tài khoản: **link chỉnh sửa** (`/studio/{id}#k=…`) là quyền sửa thiệp, hãy lưu lại.
- **Mẫu** `/templates`, `/templates/[id]` (thêm `?gate=1&to=Tên` để xem phong bì).
- Trang giới thiệu và các trang SEO.

## Chạy local

```bash
# 1) Supabase local (Docker) hoặc remote
npx supabase start              # Postgres local ở cổng 54322; Studio ở 54323
npx supabase db reset           # nạp migration + seed local

# 2) Env
cp .env.example .env.local      # điền URL/keys Supabase + 2 secret tự tạo (openssl rand -hex 32)
npm install
npm run dev                     # http://localhost:3000
```

Upload ảnh/nhạc cần bucket Storage `media` (migration tự tạo ở local; remote tạo sẵn). RSVP/lời chúc đi qua Edge Function `public-write`: chạy local bằng `npm run functions:serve`, remote xem `docs/DEPLOY.md`.

## Kiểm tra

```bash
npm test            # node --test, logic thuần trong lib/ (Node 22 tự bỏ kiểu TypeScript)
npm run typecheck
npm run build
```

Hợp đồng API của backend nằm ở `lib/api.ts` (giữ nguyên chữ ký, chỉ đổi ruột khi chuyển stack). Tài liệu API tương tác: `/docs` (Swagger UI), spec JSON: `/api/docs`.

## Cấu trúc

| Đường dẫn | Việc |
|---|---|
| `lib/` | logic thuần có test: `content` (schema), `templates` (registry), `datetime`, `ics`, `vietqr`, `banks`, `maps`, `slug`, `api` (client), `local-invitations` |
| `components/invitation/` | `InvitationRenderer` dùng chung cho trang khách, xem thử mẫu và Studio; mỗi *archetype* một file `arch-*.css` |
| `components/studio/` | Editor, panels, xuất bản, phản hồi |
| `components/home`, `components/site`, `components/templates` | trang chủ, header/footer, gallery |
| `docs/superpowers/` | spec và plan |

Thêm một mẫu thiệp = thêm một mục vào `lib/templates.ts` (bảng màu phải đạt WCAG AA, có test) và, nếu cần dáng riêng, một khối `[data-template="…"]` trong file archetype tương ứng.

## Thiết kế

Hiện đại, sáng sủa, sang trọng, chút cổ điển Trung Hoa: nền ngà, đỏ lacquer, vàng foil, lưới cửa sổ, con dấu, chữ 囍 (subset font Noto Serif SC, OFL, tự host ở `public/fonts/`). Mọi hoạ tiết vẽ riêng cho MỘC. Font đều có subset tiếng Việt, mỗi trang chỉ tải font của mẫu đang dùng.

Thư viện giao diện: `motion` (hiệu ứng cuộn/chuyển tab), `embla-carousel-react` (slider), `yet-another-react-lightbox` (xem ảnh), `canvas-confetti` (hoa giấy), `@formkit/auto-animate` (danh sách), `lucide-react` (icon).
