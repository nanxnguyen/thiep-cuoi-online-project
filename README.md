# MỘC Wedding: thiệp cưới online

> Đang phát triển. Tiến độ và việc tiếp theo: xem [`PROGRESS.md`](./PROGRESS.md) (cập nhật liên tục). Đưa lên môi trường thật: [`docs/DEPLOY.md`](./docs/DEPLOY.md).

Frontend (Next.js 16, React 19) của MỘC Wedding. Backend là repo riêng `../Thiep-cuoi-online-backend` (Spring Boot 4, Java 17, Postgres).

- **Trang khách** `/invite/[slug]?to=Tên`: phong bì, lời mời, hai họ, lịch trình + bản đồ, đếm ngược + thêm vào lịch, album, RSVP, sổ lưu bút, hộp mừng cưới QR (VietQR), nhạc nền.
- **Studio** `/studio`: tạo thiệp từ mẫu, chỉnh sửa có xem trước trực tiếp, tự lưu, xuất bản, xem phản hồi và ẩn lời chúc. Không có tài khoản: **link chỉnh sửa** (`/studio/{id}#k=…`) là quyền sửa thiệp, hãy lưu lại.
- **Mẫu** `/templates`, `/templates/[id]` (thêm `?gate=1&to=Tên` để xem phong bì).
- Trang giới thiệu và các trang SEO.

## Chạy local

```bash
# 1) Backend (repo ../Thiep-cuoi-online-backend)
cd ../Thiep-cuoi-online-backend
docker compose up -d db                    # Postgres 16 ở cổng 5433
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8090

# 2) Frontend
cd ../thiep-cuoi-online-project
cp .env.example .env.local                 # NEXT_PUBLIC_API_BASE_URL=http://localhost:8090
npm install
npm run dev                                # http://localhost:3000
```

Cổng 8080 mặc định của backend hay trùng với stack khác trên máy; đổi cổng thì sửa `NEXT_PUBLIC_API_BASE_URL` cho khớp. Upload ảnh/nhạc cần Supabase Storage (xem `../Thiep-cuoi-online-backend/CLAUDE.md`); mọi phần còn lại chạy với Postgres local.

## Kiểm tra

```bash
npm test            # node --test, logic thuần trong lib/ (Node 22 tự bỏ kiểu TypeScript)
npm run typecheck
npm run build
```

Hợp đồng API giữa hai repo nằm ở `docs/superpowers/specs/2026-09-20-invitation-core-phase1-design.md` (mục 6.4). `lib/api.ts` phải khớp các record của backend. Khi đổi cấu trúc `lib/content.ts`, sinh lại fixture cho backend:

```bash
node -e "import('./lib/content.ts').then(m => console.log(JSON.stringify(m.defaultContent(new Date('2026-09-20T00:00:00Z')), null, 2)))" \
  > ../Thiep-cuoi-online-backend/src/test/resources/fixtures/default-content.json
```

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
