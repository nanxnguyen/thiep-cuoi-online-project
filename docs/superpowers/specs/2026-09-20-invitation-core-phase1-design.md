# MỘC Wedding — Phase 1: Lõi thiệp (Invitation Core)

Ngày: 2026-09-20 · Trạng thái: chờ duyệt spec

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
| D2 | Hosting: **Vercel + Supabase** (Postgres + Storage) | Cần Supabase project của người dùng |
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

## 6. Data & API

### 6.1 Schema (Postgres, `supabase/migrations/0001_init.sql`)

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
-- RLS bật trên cả 3 bảng, KHÔNG tạo policy: anon bị chặn hoàn toàn.
-- Bucket `media`: public-read, file_size_limit 8MB,
-- allowed_mime_types = image/webp,image/jpeg,image/png,audio/mpeg.
```

Index: `rsvps(invitation_id, created_at desc)`, `wishes(invitation_id, created_at desc)`.

### 6.2 `content` (jsonb, `v: 1`, validate bằng zod ở server)

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

Giới hạn độ dài từng chuỗi được định nghĩa trong schema zod (tên ≤ 80, lời nhắn ≤ 500…).

### 6.3 Quyền sửa: edit key

- Tạo thiệp: server sinh 32 byte ngẫu nhiên (base64url), lưu `sha256`, trả key **một lần** trong link `/studio/{id}#k={key}`. Fragment không đi vào server log.
- Trình duyệt lưu `{id, slug, key}` vào `localStorage` → danh sách "Thiệp của tôi". Request sửa gửi header `x-edit-key`; server so sánh hash bằng `timingSafeEqual`.
- **Đánh đổi:** mất link + xoá localStorage = mất quyền sửa. Studio hiển thị và nhắc lưu link chỉnh sửa. Phase 6 (tài khoản) giải quyết.

### 6.4 Route handlers

| Route | Quyền | Việc |
|---|---|---|
| `POST /api/invitations` | công khai (throttle) | tạo bản nháp từ `templateId` + nội dung mẫu, sinh slug ngẫu nhiên 8 ký tự, trả `{id, slug, key}` |
| `GET/PATCH /api/invitations/[id]` | edit key | đọc / cập nhật `{templateId?, content?, slug?, published?}` |
| `POST /api/invitations/[id]/media` | edit key | trả signed upload URL + public URL (whitelist mime/size) |
| `GET /api/invitations/[id]/responses` | edit key | RSVP + lời chúc (kể cả đã ẩn) |
| `PATCH /api/invitations/[id]/wishes/[wishId]` | edit key | ẩn / hiện lời chúc |
| `POST /api/invite/[slug]/rsvp` | công khai (throttle) | gửi RSVP |
| `POST /api/invite/[slug]/wishes` | công khai (throttle) | gửi lời chúc |

- Chỉ server dùng `SUPABASE_SERVICE_ROLE_KEY`. Client chỉ cần URL + anon key để `uploadToSignedUrl` (signed token bỏ qua policy nên không cần policy insert).
- **Publish**: yêu cầu tên cô dâu + chú rể và slug hợp lệ. Slug sửa được đến lần xuất bản đầu tiên, sau đó khoá. Thiệp chưa xuất bản → `/invite/[slug]` trả 404.
- **Chống spam** (RSVP/lời chúc/tạo thiệp): trường honeypot ẩn + giới hạn độ dài + throttle theo IP trong bộ nhớ. `// ponytail:` throttle in-memory là best-effort, không chia sẻ giữa các instance serverless; nâng cấp bằng bảng đếm trong DB hoặc Vercel Firewall khi cần.
- **Tổng hợp RSVP**: mỗi lần gửi là một dòng; tổng số tính theo lần gửi **mới nhất** của mỗi tên (chuẩn hoá lowercase + trim) khi đọc.
- Trang `/invite/[slug]` render động (không cache) để "khách luôn thấy bản mới nhất".

### 6.5 Ảnh & nhạc

Ảnh nén ở client (canvas → WebP, cạnh dài ≤ 1600px) rồi upload thẳng lên Storage qua signed URL (né giới hạn body 4.5MB của Vercel). Đường dẫn `{invitationId}/{uuid}.{ext}`. Mp3 ≤ 8MB, hoặc URL âm thanh trực tiếp. Giới hạn size/mime được **Storage bucket** cưỡng chế, không chỉ tin client.

## 7. Trải nghiệm thiệp public — `/invite/[slug]?to=Tên`

1. **Cover/phong bì**: "Trân trọng kính mời {Tên}" (không có `?to` → lời mời chung). Chạm để mở → bật nhạc (autoplay bị chặn nên cần cú chạm).
2. Cuộn dọc mobile-first theo thứ tự: cặp đôi + lời mời → hai họ → lịch trình → đếm ngược → album → RSVP → lời chúc → mừng cưới → cảm ơn. Section không có dữ liệu thì tự ẩn.
3. **Bản đồ**: "Chỉ đường" = `https://www.google.com/maps/dir/?api=1&destination=<địa chỉ>` (hoặc `mapUrl` nếu có); embed `https://www.google.com/maps?q=<địa chỉ>&output=embed`. Không cần API key.
4. **Đếm ngược** tới `${date}T${time}:00+07:00` của sự kiện có thời điểm sớm nhất còn ở tương lai; qua hết rồi thì ẩn section. **Thêm vào lịch**: file `.ics` (quy về UTC, trừ 7h) + link Google Calendar `render?action=TEMPLATE`.
5. **Mừng cưới**: `https://img.vietqr.io/image/{bankCode}-{accountNumber}-compact2.png?accountName=…&addInfo=…` (đã kiểm chứng trả 200 PNG). Luôn hiển thị kèm tên ngân hàng, số tài khoản, nút copy — QR hỏng thì khách vẫn chuyển được. Danh sách ngân hàng hard-code trong `lib/banks.ts`.
6. **Metadata**: `noindex` (giữ), `og:title` "Thiệp cưới {A} & {B}", `og:image` = ảnh hero nếu có, không thì ảnh thương hiệu tĩnh. (Ảnh OG sinh riêng cho từng thiệp = việc sau.)
7. **A11y & chuyển động**: contrast AA, focus rõ, lightbox có focus trap + ESC + alt, reveal khi cuộn bằng IntersectionObserver, tôn trọng `prefers-reduced-motion`.

### Design language (MỘC, mở rộng)

Nền editorial ấm: paper `#f7f5f0`, ink `#152527`, terracotta `#d8695a`; Playfair Display cho tiêu đề, DM Sans cho UI, tiêu đề lớn, hairline, khoảng trắng rộng. Mỗi archetype đổi tính cách nhưng giữ cùng ngôn ngữ nền:

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

```
app/
  studio/page.tsx                     # danh sách + chọn mẫu
  studio/[id]/page.tsx                # editor
  invite/[slug]/page.tsx              # thiệp public (server component)
  templates/page.tsx                  # render từ registry
  api/invitations/route.ts            # POST
  api/invitations/[id]/route.ts       # GET/PATCH
  api/invitations/[id]/media/route.ts
  api/invitations/[id]/responses/route.ts
  api/invitations/[id]/wishes/[wishId]/route.ts
  api/invite/[slug]/rsvp/route.ts
  api/invite/[slug]/wishes/route.ts
components/invitation/                # InvitationRenderer, sections, archetypes, ornaments
components/studio/                    # panels, preview frame, upload, publish dialog
lib/                                  # templates.ts, content-schema.ts, edit-key.ts, supabase.ts,
                                      # ics.ts, vietqr.ts, banks.ts, slug.ts, throttle.ts
supabase/migrations/0001_init.sql
tests/*.test.ts
```

## 10. Kiểm chứng

- **Bước đầu tiên** của plan: thêm `.gitignore`, `npm install`, `npm run typecheck`, `npm run build` (repo chưa từng cài; Next 16 + React 19). Kiểm tra `npm run lint`: `next lint` có thể đã bị gỡ ở Next 16 → thay bằng eslint hoặc bỏ script.
- **Unit** (`node --test`, Node 22 tự strip TS; module được test không import `@/` alias hay framework): zod schema, hash/so sánh edit key, template registry hợp lệ, sinh `.ics`, URL VietQR, chuẩn hoá slug, gộp RSVP theo tên.
- Xoá `dist/`; viết lại `scripts/site-smoke.test.mjs` (hoặc thay bằng `tests/`) để kiểm route thật, không để test xanh giả.
- **E2E bằng trình duyệt thật**: tạo → sửa → xuất bản → mở thiệp 390px và 1280px cả 7 mẫu (chụp màn hình) → gửi RSVP + lời chúc → thấy trong Studio → ẩn lời chúc → thiệp public không còn hiện. Cần Supabase key thật.
- Kiểm tra đường lỗi: key sai → 401/403, slug trùng, upload sai mime/quá size bị Storage từ chối, thiệp chưa xuất bản → 404, honeypot bị chặn.

## 11. Thứ tự build (gợi ý cho plan)

M0 toolchain (+ `.gitignore`, xoá `dist/`) → **M1 template registry + renderer với nội dung mẫu, chưa cần DB** (duyệt visual 7 mẫu sớm, chạy được khi chưa có Supabase key) → M2 schema + API + trang public → M3 Studio → M4 RSVP/lời chúc/phản hồi → M5 E2E + đánh bóng.

## 12. Cần từ người dùng

1. Tạo Supabase project.
2. Chạy `supabase/migrations/0001_init.sql` trong SQL Editor (repo không có Supabase CLI).
3. Điền `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

M1 làm được khi chưa có các bước trên; M2 trở đi cần.

## 13. Rủi ro & giới hạn đã biết

- Next 16 + React 19 chưa từng cài trong repo → kiểm ngay ở M0.
- Subset `vietnamese` của từng font phải được xác nhận; đổi font nếu thiếu.
- API Supabase (`createSignedUploadUrl`, `uploadToSignedUrl`) phải đối chiếu docs hiện hành khi lập plan.
- `img.vietqr.io` và embed Maps không key là dịch vụ bên thứ ba; đã có fallback hiển thị số tài khoản / link mở Maps.
- Mất edit link = mất quyền sửa; media bị xoá khỏi thiệp vẫn nằm trên Storage; throttle in-memory chỉ best-effort; sửa nhiều tab là last-write-wins.
- Nhạc: không ship file có bản quyền; người dùng tự chịu trách nhiệm file họ upload.
