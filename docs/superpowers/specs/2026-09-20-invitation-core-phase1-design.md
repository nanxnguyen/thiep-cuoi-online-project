# MỘC Wedding — Phase 1: Lõi thiệp (Invitation Core)

Ngày: 2026-09-20 · Trạng thái: đã duyệt, đang triển khai (xem mục "STATUS / HANDOFF" đầu file plan `docs/superpowers/plans/2026-09-20-invitation-core-phase1.md`) · Cập nhật: backend tách repo Spring Boot; hướng thiết kế hiện đại, sáng sủa, sang trọng, chút cổ điển Trung Hoa (mục 7); tích hợp motion, embla, yet-another-react-lightbox, canvas-confetti, auto-animate, lucide-react

## 1. Bối cảnh

Yêu cầu gốc: "clone hết tính năng của chungdoi.com, nhưng **không lấy design** của họ — tự thiết kế lại cho dự án này".

Diễn giải: **feature parity, không phải copy parity.** Giữ cấu trúc thông tin và tính năng; toàn bộ visual, tên mẫu, copy marketing là của MỘC. Không dùng lại chữ, tên mẫu ("Double Happiness", "Dragon Phoenix"…) hay layout của chungdoi.

Hiện trạng repo: Next.js 16 App Router, ~350 dòng stub, chỉ có `next`/`react`/`react-dom`, **chưa từng `npm install`**, không DB/auth/storage. `dist/` là prototype tĩnh đã chết (chỉ `scripts/site-smoke.test.mjs` còn trỏ vào nó).

## 2. Lộ trình (cả dự án)

| Phase | Nội dung | Spec |
|---|---|---|
| **1** | **Lõi thiệp**: hệ template, editor, trang thiệp public, RSVP, lời chúc, QR mừng cưới, Maps, đếm ngược, nhạc, album | **tài liệu này** |
| 2 | Marketing site: home mới, /templates, pricing, features/*, help, blog, trang pháp lý | sau |
| 3 | Guest manager: nhóm/bàn, link cá nhân theo khách, thống kê RSVP, thao tác hàng loạt | sau |
| 4 | 8 tool miễn phí: save-the-date ảnh/trang, tin nhắn mời, QR, seating chart, guest list, nén ảnh/video | sau |
| 5 | Đa ngôn ngữ (vi + en trước), thiệp song ngữ | sau |
| 6 | Video thiệp, tài khoản, trial 3 ngày + thanh toán | sau |

## 3. Quyết định đã chốt

| # | Quyết định | Ghi chú |
|---|---|---|
| D1 | Persistence: **DB thật, không tài khoản**; quyền sửa qua edit key bí mật | Phương án "C" |
| D2 | Hosting: FE **Vercel**; BE Docker; DB **Supabase Postgres** (prod, JDBC) / Postgres local (dev); media ở **Supabase Storage** do BE đẩy lên | Supabase chỉ bắt buộc cho media + prod |
| D7 | **Backend tách repo**: `../Thiep-cuoi-online-backend`, Spring Boot 4.1.1 / Java 17, JPA + Flyway, không Spring Security | Theo quy ước `Ecomerce-Backend`; FE gọi qua `NEXT_PUBLIC_API_BASE_URL` |
| D3 | Template system: **archetype + token** | Mẫu = data, không phải component riêng |
| D4 | Brand: giữ **MỘC**, mở rộng hệ design hiện có | ink/paper/terracotta, Playfair + DM Sans |
| D5 | Ngôn ngữ Phase 1: **chỉ tiếng Việt**, múi giờ cố định `Asia/Ho_Chi_Minh` (+07:00, không DST) | i18n để Phase 5 |
| D6 | Giữ route công khai `/invite/[slug]` | đã có trong repo |

## 4. Phạm vi Phase 1

**Trong phạm vi**
- 7 mẫu thiệp / 5 archetype, đổi mẫu giữ nguyên nội dung.
- Studio: danh sách thiệp, tạo từ mẫu, editor 2 cột với preview live, xuất bản.
- Thiệp public: cover phong bì + chào tên khách (`?to=`), cặp đôi, hai họ, lịch trình + bản đồ, đếm ngược + thêm vào lịch, album + lightbox, RSVP, lời chúc, hộp mừng cưới (QR VietQR), cảm ơn, nhạc nền.
- Xem RSVP + lời chúc trong Studio, ẩn lời chúc.
- `/templates` render từ registry mẫu (thay danh sách stub), link vào Studio.

**Ngoài phạm vi (không làm ở Phase 1)**
Tài khoản/đăng nhập · billing/trial · guest manager (chỉ có `?to=` để chào tên và gắn nhãn `guest_label` vào RSVP; không có danh sách khách) · i18n · video/xuất ảnh thiệp · 8 tool · làm lại marketing · thư viện nhạc (Phase 1: tự upload mp3 hoặc để trống; **không ship nhạc có bản quyền**) · 60+ mẫu · dọn ảnh mồ côi trên Storage · sửa đồng thời nhiều tab (last-write-wins).

## 5. Hệ template

- **Section component dùng chung**, thuần trình bày (không hook) để render được cả server lẫn client: `Cover`, `Couple`, `Family`, `Events`, `Countdown`, `Album`, `Rsvp`, `Wishes`, `Gift`, `Thanks`. Chỉ các leaf tương tác mới `"use client"`: phong bì, countdown, lightbox, audio, form RSVP/lời chúc.
- **Archetype** cấp: biến thể cover, bộ ornament SVG, type scale, spacing, kiểu tiêu đề. **Template** = 1 entry data:

```ts
type Template = {
  id: string;            // "gallery-noir"
  name: string;          // "Gallery Noir"
  archetype: "editorial" | "minimal" | "classic" | "botanical" | "traditional";
  blurb: string;
  palette: { bg: string; surface: string; ink: string; muted: string; accent: string; accentInk: string };
  fonts: { display: string; body: string };   // CSS var names đã load
};
```

- Palette áp dụng bằng CSS variables trên wrapper (`--inv-bg`, `--inv-ink`, …). Đổi mẫu = đổi `template_id`.
- **7 mẫu ship**: editorial (Gallery Noir, Afterglow) · minimal (Soft Type) · classic (Maison Blanc) · botanical (Wild Garden, Olive Story) · traditional đỏ-vàng (**Lụa Son**). Tên gốc; 6 tên đầu đã có trong repo.
- Thêm mẫu = thêm 1 entry vào `lib/templates.ts`. Test bắt buộc: mọi entry đủ token và đúng archetype.
- Font: chỉ load trong layout của `/invite` và `/studio` (không load ở trang marketing). Tối đa 4 family, **mỗi family phải có subset `vietnamese`**. Hiện `app/layout.tsx` chỉ load `latin` → kiểm chứng ngay khi build, vì thiếu subset thì dấu tiếng Việt rơi sang font fallback.

## 6. Data & API (repo backend Spring Boot)

> Toàn bộ mục này nằm ở repo `Thiep-cuoi-online-backend`, không phải Next route handlers. Frontend chỉ có API client (`lib/api.ts`). Java records mirror schema `content` ở 6.2 (validate bằng Jakarta Validation); zod ở FE chỉ để validate form và sinh type. Bổ sung so với bản trước: cột `invitations.published_at` (đặt ở lần publish đầu, không xoá; khác null = khoá slug), `content.events[].lunar` (text ≤ 60, ngày âm lịch do người dùng nhập), `heroPhoto` là chuỗi (`""` = không có).

### 6.1 Schema (Postgres, Flyway `V1__init.sql`)

```sql
create table invitations (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null check (slug ~ '^[a-z0-9][a-z0-9-]{2,39}$'),
  edit_key_hash text not null,                 -- sha256(edit key), không lưu key
  template_id   text not null,
  content       jsonb not null,                -- xem 6.2
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create table rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  name text not null, attending boolean not null, guests int not null default 1,
  note text, answers jsonb not null default '{}', guest_label text,
  created_at timestamptz not null default now()
);
create table wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references invitations(id) on delete cascade,
  name text not null, message text not null, hidden boolean not null default false,
  created_at timestamptz not null default now()
);
-- BE kết nối JDBC bằng role riêng, không dùng PostgREST/anon. Nếu chạy trên Supabase: bật RLS cả 3 bảng, KHÔNG tạo policy
-- (chặn truy cập trực tiếp bằng anon key). Thêm cột invitations.published_at timestamptz.
-- Bucket `media` (tạo tay trên Supabase): public-read, file_size_limit 8MB,
-- allowed_mime_types = image/webp,image/jpeg,image/png,audio/mpeg.
```

Index: `rsvps(invitation_id, created_at desc)`, `wishes(invitation_id, created_at desc)`.

### 6.2 `content` (jsonb, `v: 1`, validate bằng Jakarta Validation ở BE)

```
couple:  { groom:{name}, bride:{name}, message, heroPhoto? }
family:  { groomSide:{father,mother,address}, brideSide:{father,mother,address} }
events:  [{ id, kind:"engagement"|"ceremony"|"reception"|"custom", title,
            date:"YYYY-MM-DD", time:"HH:mm", venue, address, mapUrl? }]   // tối đa 6
album:   [{ url, alt? }]                                                    // tối đa 24
music:   { url, title } | null
rsvp:    { enabled, deadline?, questions:[{ id, label, type:"text"|"yesno" }] }  // tối đa 3
guestbook: { enabled }
gift:    { enabled, note?, accounts:[{ holder:"groom"|"bride", bankCode, accountNumber, accountName }] } // tối đa 2
thanks:  { message }
```

Giới hạn độ dài từng chuỗi được định nghĩa ở DTO của BE và zod của FE (tên ≤ 60, lời nhắn ≤ 500…); giá trị "trống" luôn là `""` để bản nháp đang gõ vẫn hợp lệ.

### 6.3 Quyền sửa: edit key

- Tạo thiệp: server sinh 32 byte ngẫu nhiên (base64url), lưu `sha256`, trả key **một lần** trong link `/studio/{id}#k={key}`. Fragment không đi vào server log.
- Trình duyệt lưu `{id, slug, key}` vào `localStorage` → danh sách "Thiệp của tôi". Request sửa gửi header `X-Edit-Key`; BE so sánh hash bằng `MessageDigest.isEqual` (constant-time).
- **Đánh đổi:** mất link + xoá localStorage = mất quyền sửa. Studio hiển thị và nhắc lưu link chỉnh sửa. Phase 6 (tài khoản) giải quyết.

### 6.4 REST API (Spring controllers)

| Route | Quyền | Việc |
|---|---|---|
| `POST /api/invitations` | công khai (throttle) | body `{templateId, content}` (FE gửi nội dung mẫu để văn bản mẫu chỉ có một nơi), BE validate rồi tạo bản nháp, sinh slug ngẫu nhiên 8 ký tự, trả `{id, slug, key}`. Luật "tên vẫn là tên mẫu" chỉ do FE cảnh báo; BE chỉ chặn tên rỗng khi publish |
| `GET/PATCH /api/invitations/{id}` | `X-Edit-Key` | đọc / cập nhật `{templateId?, content?, slug?, published?}` |
| `POST /api/invitations/{id}/media` | `X-Edit-Key` | multipart `kind` + `file`; BE kiểm mime/size rồi đẩy lên Supabase Storage, trả public URL |
| `GET /api/invitations/{id}/responses` | `X-Edit-Key` | RSVP (kèm tổng hợp) + lời chúc (kể cả đã ẩn) |
| `PATCH /api/invitations/{id}/wishes/{wishId}` | `X-Edit-Key` | ẩn / hiện lời chúc |
| `GET /api/public/invitations/{slug}` | công khai | thiệp đã xuất bản + lời chúc chưa ẩn (50 mới nhất); chưa xuất bản → 404 |
| `POST /api/public/invitations/{slug}/rsvp` | công khai (throttle) | gửi RSVP |
| `POST /api/public/invitations/{slug}/wishes` | công khai (throttle) | gửi lời chúc |

- BE giữ mọi secret (mật khẩu DB, `SUPABASE_SERVICE_ROLE_KEY` cho Storage). CORS chỉ cho origin của FE (`APP_CORS_ALLOWED_ORIGINS`). Không cookie, không CSRF. Lỗi trả `ProblemDetail`.
- BE là nơi cưỡng chế: schema `content`, URL http(s), ảnh phải nằm dưới prefix media của chính thiệp, giới hạn độ dài.
- **Publish**: yêu cầu tên cô dâu + chú rể và slug hợp lệ. Slug sửa được đến lần xuất bản đầu tiên, sau đó khoá. Thiệp chưa xuất bản → `/invite/[slug]` trả 404.
- **Chống spam** (RSVP/lời chúc/tạo thiệp): trường honeypot ẩn + giới hạn độ dài + throttle theo IP trong bộ nhớ BE. Ceiling: throttle in-memory chỉ đúng với 1 instance; nâng cấp bằng Redis (Ecomerce-Backend đã có mẫu) khi chạy nhiều instance.
- **Tổng hợp RSVP**: mỗi lần gửi là một dòng; tổng số tính theo lần gửi **mới nhất** của mỗi tên (chuẩn hoá lowercase + trim) khi đọc.
- Trang `/invite/[slug]` là server component của FE, fetch `GET /api/public/invitations/{slug}` với `cache: "no-store"` để "khách luôn thấy bản mới nhất".

### 6.5 Ảnh & nhạc

Ảnh nén ở client (canvas → WebP, cạnh dài ≤ 1600px, ≤ 2MB) rồi POST multipart lên BE (BE là server thường nên không dính giới hạn body 4.5MB của Vercel, không cần signed URL). BE kiểm mime + size (ảnh ≤ 2MB, mp3 ≤ 8MB), đẩy lên Supabase Storage bucket `media` bằng REST + service-role key, đường dẫn `{invitationId}/{uuid}.{ext}`, trả public URL. Mp3 hoặc URL âm thanh trực tiếp đều được. Bucket cũng cưỡng chế size/mime (lớp thứ hai). Test dùng `MediaStorage` giả.

## 7. Trải nghiệm thiệp public — `/invite/[slug]?to=Tên`

1. **Cover/phong bì**: "Trân trọng kính mời {Tên}" (không có `?to` → lời mời chung). Chạm để mở → bật nhạc (autoplay bị chặn nên cần cú chạm).
2. Cuộn dọc mobile-first theo thứ tự: cặp đôi + lời mời → hai họ → lịch trình → đếm ngược → album → RSVP → lời chúc → mừng cưới → cảm ơn. Section không có dữ liệu thì tự ẩn.
3. **Bản đồ**: "Chỉ đường" = `https://www.google.com/maps/dir/?api=1&destination=<địa chỉ>` (hoặc `mapUrl` nếu có); embed `https://www.google.com/maps?q=<địa chỉ>&output=embed`. Không cần API key.
4. **Đếm ngược** tới `${date}T${time}:00+07:00` của sự kiện có thời điểm sớm nhất còn ở tương lai; qua hết rồi thì ẩn section. **Thêm vào lịch**: file `.ics` (quy về UTC, trừ 7h) + link Google Calendar `render?action=TEMPLATE`.
5. **Mừng cưới**: `https://img.vietqr.io/image/{bankCode}-{accountNumber}-compact2.png?accountName=…&addInfo=…` (đã kiểm chứng trả 200 PNG). Luôn hiển thị kèm tên ngân hàng, số tài khoản, nút copy — QR hỏng thì khách vẫn chuyển được. Danh sách ngân hàng hard-code trong `lib/banks.ts`.
6. **Metadata**: `noindex` (giữ), `og:title` "Thiệp cưới {A} & {B}", `og:image` = ảnh hero nếu có, không thì ảnh thương hiệu tĩnh. (Ảnh OG sinh riêng cho từng thiệp = việc sau.)
7. **A11y & chuyển động**: contrast AA, focus rõ, lightbox có focus trap + ESC + alt, reveal khi cuộn bằng IntersectionObserver, tôn trọng `prefers-reduced-motion`.

### Design language (MỘC, mở rộng)

**Cập nhật theo chỉ đạo của chủ dự án (2026-09-20): hiện đại, sáng sủa, sang trọng, ấn tượng, chút cổ điển Trung Hoa** (tâm trạng đỏ son + vàng, cửa nguyệt, lưới cửa sổ, ấn đỏ, 囍; toàn bộ hoạ tiết vẽ lại, không sao chép). Giao diện sản phẩm (site + Studio): nền ngà `#faf6ef`, ink ấm `#17100e`, đỏ lacquer `#a3181f`, vàng foil `#d9b45f` (chữ trên nền sáng dùng `#8a6420`), ngọc bích `#2d5b4e`; tiêu đề Noto Serif Display (roman + nghiêng vàng foil cho cụm nhấn), thân bài Plus Jakarta Sans, lưới kim cương vàng mờ, con dấu "M" đỏ làm logo, chữ 囍 là font subset tự host (OFL, 1KB). Các mẫu thiệp có bảng màu riêng (7 mẫu ban đầu, thêm "Thanh Ngọc" và "Thủy Mặc" thuộc họ traditional). Font mẫu thiệp (đều có subset `vietnamese`, chọn bằng cách render thử chữ nhiều dấu): Playfair Display, Fraunces, Cormorant Garamond, Newsreader, Noto Serif Display, Plus Jakarta Sans, Allura; mỗi trang chỉ tải font của mẫu đang dùng. Mỗi archetype đổi tính cách nhưng giữ cùng ngôn ngữ nền:

- **editorial**: chữ khổng lồ, hairline, khối màu phẳng.
- **minimal**: gần như chỉ typography, khoảng trắng tối đa.
- **classic**: khung viền đôi, serif nghiêng, đối xứng.
- **botanical**: khung vòm, lá SVG vẽ tay, xanh sage/olive.
- **traditional**: đỏ son + vàng, hoa văn lưới/sen, cover kiểu thư mời.

## 8. Studio

- `/studio`: "Thiệp của tôi" (từ localStorage) + lưới chọn mẫu → `POST /api/invitations` → `/studio/{id}#k=…`.
- `/studio/[id]`: 2 cột. Trái: panel **Mẫu & màu · Cặp đôi & gia đình · Sự kiện & bản đồ · Ảnh & nhạc · RSVP & lời chúc · Mừng cưới · Phản hồi**. Phải: khung điện thoại chạy **đúng** `InvitationRenderer` với draft state (chế độ xem thử: form RSVP/lời chúc hiển thị nhưng không gửi). Mobile: tab Sửa / Xem.
- Autosave debounce ~800ms qua `PATCH`, flush khi rời trang, hiển thị trạng thái "Đã lưu / Đang lưu / Lỗi". Last-write-wins.
- **Xuất bản**: chọn slug (kiểm tra trùng) → link public + QR của link + Web Share/copy.
- Không có key hợp lệ (fragment hoặc localStorage) → màn hình "Cần link chỉnh sửa".
- Thay `components/studio/StudioShell.tsx` (stub).

## 9. Cấu trúc file

**Frontend** (`thiep-cuoi-online-project`, không có route handler nào):

```
app/
  studio/page.tsx                     # danh sách + chọn mẫu
  studio/[id]/page.tsx                # editor
  invite/[slug]/page.tsx              # thiệp public (server component, fetch BE)
  templates/page.tsx                  # render từ registry
  templates/[id]/page.tsx             # xem thử mẫu với nội dung mẫu
components/invitation/                # InvitationRenderer, sections, archetypes, ornaments
components/studio/                    # panels, preview frame, publish dialog
lib/                                  # templates.ts, content.ts, api.ts, local-invitations.ts, ics.ts,
                                      # vietqr.ts, banks.ts, datetime.ts, slug.ts, image-compress.ts
tests/*.test.ts                       # node --test
```

**Backend** (`Thiep-cuoi-online-backend`, package-by-layer như `Ecomerce-Backend`, `com.moc.wedding`):

```
pom.xml  Dockerfile  docker-compose.yml (Postgres dev)  CLAUDE.md  .env.example
src/main/java/com/moc/wedding/
  controller/   InvitationController  PublicInvitationController  ResponsesController  MediaController
  service/      InvitationService  RsvpService  WishService  MediaService  EditKeyService  ThrottleService
  repository/   InvitationRepository  RsvpRepository  WishRepository
  entity/       Invitation  Rsvp  Wish
  dto/          InvitationContent (records, Jakarta Validation)  request/response records
  config/       CorsConfig  AppProperties  ApiExceptionHandler
  storage/      MediaStorage (test seam)  SupabaseMediaStorage
src/main/resources/  application.yml  db/migration/V1__init.sql
src/test/java/...    *Test / *IT (H2, MockMvc)
```

## 10. Kiểm chứng

- **Bước đầu tiên** của plan: thêm `.gitignore`, `npm install`, `npm run typecheck`, `npm run build` (repo chưa từng cài; Next 16 + React 19). Kiểm tra `npm run lint`: `next lint` có thể đã bị gỡ ở Next 16 → thay bằng eslint hoặc bỏ script.
- **FE unit** (`node --test`, Node 22 tự strip TS; module được test không import `@/` alias hay framework): zod schema, template registry hợp lệ, sinh `.ics`, URL VietQR, chuẩn hoá slug, ngày giờ/đếm ngược, local store, API client.
- **BE** (`./mvnw test`, H2, không cần Postgres/Redis, giống `Ecomerce-Backend`): unit cho hash/so sánh edit key, throttle, validate media, tổng hợp RSVP; `*IT` với MockMvc cho toàn bộ route ở 6.4 (`MediaStorage` giả).
- Xoá `dist/` và `scripts/site-smoke.test.mjs` (test cũ chỉ kiểm prototype đã chết).
- **E2E bằng trình duyệt thật** (FE `npm run dev` + BE `./mvnw spring-boot:run` + Postgres docker): tạo → sửa → xuất bản → mở thiệp 390px và 1280px cả 7 mẫu (chụp màn hình) → gửi RSVP + lời chúc → thấy trong Studio → ẩn lời chúc → thiệp public không còn hiện. Upload ảnh/nhạc cần Supabase Storage thật.
- Kiểm tra đường lỗi: key sai → 401/403, slug trùng → 409, upload sai mime/quá size → 4xx, thiệp chưa xuất bản → 404, honeypot bị chặn, CORS từ origin lạ bị từ chối.

## 11. Thứ tự build (gợi ý cho plan)

M0 toolchain FE (+ `.gitignore`, xoá `dist/`) → **M1 (FE) template registry + renderer với nội dung mẫu, chưa cần BE** (duyệt visual 7 mẫu sớm) → **M2 (BE) Spring Boot: scaffold, schema, API công khai/chủ thiệp, media** → M3 (FE) API client + trang public + RSVP/lời chúc → M4 (FE) Studio + Xuất bản + Phản hồi → M5 E2E + đánh bóng.

## 12. Cần từ người dùng

1. Dev: Docker chạy được (`docker compose up -d db` trong repo BE). Đã có Docker 27, Java 17, Maven 3.9 trên máy.
2. Media + prod: tạo Supabase project, tạo bucket `media` (public), điền `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` vào biến môi trường BE; prod thì thêm JDBC URL của Supabase Postgres.
3. FE `.env.local`: `NEXT_PUBLIC_API_BASE_URL` (mặc định `http://localhost:8080`).

M1 và toàn bộ CRUD/RSVP/lời chúc chạy được khi chưa có Supabase; chỉ upload ảnh/nhạc cần bước 2.

## 13. Rủi ro & giới hạn đã biết

- Next 16 + React 19 chưa từng cài trong repo → kiểm ngay ở M0.
- Subset `vietnamese` của từng font phải được xác nhận; đổi font nếu thiếu.
- Spring Boot 4 / Jackson 3: cách Hibernate map cột `jsonb` (`content`) phải kiểm chứng khi làm; phương án dự phòng là lưu `String` + tự (de)serialize bằng `tools.jackson.databind`. Flyway SQL dùng cho Postgres; test H2 dùng `ddl-auto`, không chạy Flyway (giống `Ecomerce-Backend`).
- API Supabase Storage REST (upload object bằng service-role key) phải đối chiếu docs hiện hành khi làm task media.
- FE và BE là hai repo: hợp đồng API và schema `content` phải giữ đồng bộ bằng tay (Java records ↔ zod/TS type); thêm test hợp đồng ở E2E.
- `img.vietqr.io` và embed Maps không key là dịch vụ bên thứ ba; đã có fallback hiển thị số tài khoản / link mở Maps.
- Mất edit link = mất quyền sửa; media bị xoá khỏi thiệp vẫn nằm trên Storage; throttle in-memory chỉ best-effort; sửa nhiều tab là last-write-wins.
- Nhạc: không ship file có bản quyền; người dùng tự chịu trách nhiệm file họ upload.
