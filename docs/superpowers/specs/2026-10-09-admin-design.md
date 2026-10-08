# Admin khu quản trị — design spec

Ngày: 2026-10-09. Nguồn giao diện: `design/Admin.dc.html` (login + tổng quan),
`design/Admin Sidebar.dc.html`, `design/Admin Thiep Cuoi.dc.html`,
`design/Admin Mau Thiep.dc.html`, `design/Admin Nguoi Dung.dc.html`.

## 1. Mục tiêu & quyết định đã chốt

Xây khu quản trị riêng tách hẳn route public, bắt đầu từ `/admin/login`
(email + password, không Google). 4 trang sau login dùng chung sidebar:
Tổng quan (`/admin`), Người dùng (`/admin/users`), Thiệp cưới (`/admin/cards`),
Mẫu thiệp (`/admin/templates`).

Quyết định đã chốt với owner (không mở lại trong V1):

1. Admin = Supabase user có `app_metadata.is_admin === true`. Không bảng role mới.
2. Bảng `templates` mới, seed từ code. Trang `/templates` public V1 giữ nguyên
   đọc code — edits của admin (tên/phong cách/nhãn/Ẩn-Hiện) persist trong DB và
   chỉ có hiệu lực trong khu admin. Đồng bộ ra public là follow-up.
3. Thêm cột `invitations.is_flagged` cho trạng thái "Bị báo cáo". V1 chưa có nút
   report phía khách.
4. "Lời chúc cần duyệt" chỉ là con số trên dashboard (đếm `wishes` chưa
   approved). Không trang duyệt wishes ở V1.
5. Không audit log admin ở V1.
6. Responsive + dễ nhìn là yêu cầu bắt buộc cho cả 4 trang (desktop-first trong
   design, mobile phải dùng được).
7. Nút Xoá thật (user/thiệp) dùng confirm dialog, không toast "Hoàn tác" giả —
   vì xoá DB không hoàn tác được. Chỉ toggle đảo ngược được mới toast + undo.

## 2. Routes & layout

- `app/admin/login/page.tsx` — trang đứng riêng, không sidebar. Server check:
  đã là admin thì `redirect("/admin")`. Client form như design (email, password,
  link ← Về trang chủ). Submit → `POST /api/admin/login`, thành công
  `router.push("/admin")` + `router.refresh()`, lỗi hiện message chung.
- `app/admin/(panel)/layout.tsx` — route group nên URL giữ sạch. Async server
  component: đọc cookies qua `createRequestClient` + adapter `next/headers`
  `cookies()`, gọi `requireAdmin()`, fail → `redirect("/admin/login")`.
  Truyền `{ name, email }` xuống `<AdminShell>` (client) chứa sidebar + main.
- `app/admin/(panel)/page.tsx`, `users/page.tsx`, `cards/page.tsx`,
  `templates/page.tsx` — mỗi trang export `metadata` (title + robots noindex)
  và render client component fetch API (pattern như `AccountClient`).
- Toàn bộ `/admin/*`: `robots: { index: false, follow: false }`, không vào
  `sitemap.ts`, không link công khai ở đâu (đúng ghi chú design).
- Root `app/layout.tsx` hiện không chứa header/footer (chỉ font + Motion) nên
  trang admin mặc nhiên không dính chrome public — không cần sửa root layout.

## 3. Auth BE

`lib/server/auth.ts` thêm:

```ts
export type AdminUser = AccountUser & { isAdmin: true };
export async function requireAdmin(client: SupabaseClient): Promise<AdminUser>;
// 401 khi chưa đăng nhập, 403 khi đã login nhưng app_metadata.is_admin !== true.
// Check app_metadata, KHÔNG check user_metadata (user tự sửa được).
```

Endpoints mới (`routeResponse` + `createRouteClient`, pattern như route hiện có):

- `POST /api/admin/login` — body zod `{ email: z.email().max(254), password:
  z.string().min(1).max(128) }`. `enforceRateLimit(rpc, "admin-login:<ip>", 10,
  600)` với IP từ `x-forwarded-for` entry đầu (fallback `"unknown"`), cộng thêm
  key theo email để tránh 1 IP thử nhiều email? V1: key theo IP là đủ.
  `signInWithPassword` → `getUser()` → không phải admin thì `signOut()` ngay rồi
  trả lỗi chung `"Email hoặc mật khẩu chưa đúng."` (sai pass / không tồn tại /
  không phải admin đều cùng 1 message — chống enumerate). Trả
  `{ user: userDto(user) }` (reuse hàm sẵn có trong `lib/server/auth.ts`) +
  `applyCookies`.
- `POST /api/admin/logout` — `assertSameOrigin` + `logoutUser` (reuse).
- `GET /api/admin/me` — `requireAdmin` → 200 DTO admin; 401/403 tương ứng.
- Ops (ghi vào `DEPLOY.md` hoặc `docs/`): cấp quyền bằng service-role —
  `auth.admin.updateUserById(id, { app_metadata: { is_admin: true } })`.
  Không hardcode email admin trong code.

## 4. DB migrations — `supabase/migrations/202610090001_admin.sql`

1. Bảng `templates`:
   `id text pk (1..80)` — khớp id code (`song-hy`, …),
   `name text (1..120)`, `style text (1..40)`,
   `badge text default '' check (badge in ('', 'MỚI', 'HOT'))`,
   `hidden boolean default false`, `pop int 0..100 default 0`,
   `created_at/updated_at timestamptz default now()` + trigger `set_updated_at()`.
2. `alter table invitations add column is_flagged boolean not null default false`
   + `create index invitations_flagged_idx ... where is_flagged`.
3. RLS (theo convention `backend.sql`): enable RLS cả 2 bảng; policy duy nhất
   cho anon: `templates` select where `not hidden`; service_role full (mặc định
   bypass RLS). `is_flagged` không thêm policy (chỉ service-role chạm tới).
4. Seed `templates` từ code bằng script `scripts/seed-templates.mjs` (chạy bằng
   chính Node của repo — strip types nên import được `lib/templates.ts`):
   mỗi id trong `templateSamples` → 1 row `{ id, name (từ `templates` catalog),
   style, badge, pop }`; assert mọi `style` thuộc
   {Truyền thống, Tối giản, Hoa, Cổ điển, Lãng mạn, Hiện đại}. Output là các
   `INSERT ... ON CONFLICT (id) DO NOTHING` để nối vào migration.
   Strip màu card admin: resolve client-side từ `lib/templates.ts` theo id
   (fallback bộ 3 màu trung tính khi id lạ) — không lưu màu vào DB.

## 5. Admin APIs (tất cả sau `requireAdmin`, client `createAdminClient`)

Chuẩn chung: validate zod (`parseJson`), `assertSameOrigin` cho mọi mutation,
`Cache-Control: private, no-store`, `perPage` clamp ≤ 50, `q` trim 2..80 ký tự,
không bao giờ tin field từ client. Query budget ghi ở §8.

- `GET /api/admin/stats` → `{ users: { total, active, suspended },
  cards: { total, published, draft, flagged }, pendingWishes: number,
  usersWeekly: number[8], cardsWeekly: number[8],
  topTemplates: [{ templateId, name, count }], // group by template_id, limit 5
  recentUsers: [{ id, email, name, createdAt }] (5),
  recentCards: [{ id, slug, couple, templateId, status, confirmed, createdAt }] (5) }`.
  Users đếm qua Auth Admin API; còn lại SQL gộp (§8.1).
- `GET /api/admin/users?q&status=all|active|suspended&page&perPage` — duyệt
  `auth.admin.listUsers({ page, perPage: 100 })` tối đa 10 pages, map
  `banned_until != null → suspended`, search trong email + metadata name,
  sort `created_at` desc, slice page trong code. Merge số thiệp bằng 1 query
  `group by owner_id`. Trả `{ items: [{ id, email, name, avatarUrl?,
  createdAt, inviteCount, status }], page, pageCount, total }`.
  Strip DTO — không trả `app_metadata` hay field nhạy cảm của Auth.
- `PATCH /api/admin/users/[id]` `{ action: "ban" | "unban" }` —
  `updateUserById(id, { ban_duration: "876000h" })` / `{ ban_duration: "none" }`.
  Từ chối 400 khi `id` chính là admin đang thao tác.
- `DELETE /api/admin/users/[id]` — `deleteUserById`; thiệp của họ về
  `owner_id = null` theo FK `on delete set null` sẵn có. Từ chối xoá chính mình.
- `GET /api/admin/cards?q&status=all|published|draft|reported&page&perPage` —
  lọc SQL (`published`, `is_flagged`; reported = flagged bất kể published),
  search SQL `slug ILIKE | template_id ILIKE | content::text ILIKE`, order
  `updated_at` desc + count query. Owner email: batch `getUserById` theo
  distinct `owner_id` của trang hiện tại (null → `"Khách vãng lai"`). Số xác nhận:
  1 query duy nhất `LATERAL get_response_summary` cho các id trong trang.
  Item: `{ id, slug, couple (trích content, fallback "Thiệp chưa đặt tên"),
  templateId, templateName, ownerEmail, createdAt, status, confirmed: "96/180"
  | "—" (draft) }`. `couple`: trích tên từ `content.couple` (groom/bride name)
  theo shape `lib/content.ts`, fallback như trên.
- `PATCH /api/admin/cards/[id]` `{ published?: boolean, is_flagged?: boolean }`
  (zod refine: ít nhất 1 field) — "Ẩn xuất bản" = published false, "Bỏ báo cáo"
  = is_flagged false. `DELETE` — xoá (cascade guests/rsvps/wishes sẵn có).
  Nút Xem → `/invite/[slug]`.
- `GET /api/admin/templates?q&style&page&perPage` — đọc bảng `templates`,
  order `pop desc, id`, filter style + search name trong SQL.
  `PATCH /api/admin/templates/[id]` `{ name?, style?, badge?, hidden? }` —
  style thuộc 6 giá trị, badge thuộc `"" | "MỚI" | "HOT"`.
- `lib/api.ts`: thêm cụm `admin` vào `createApi` (fetch cùng origin, cookie tự
  gửi) + types `AdminStats, AdminUserRow, AdminCardRow, AdminTemplateRow`.

## 6. UI — `components/admin/` + `admin.css`

Components dùng chung (pixel theo design, token màu/border hiện có):
`AdminShell` (sidebar desktop + topbar/drawer mobile, nhận `active`, tên admin,
logout), `AdminSidebar`, `StatCard` (label, value serif, sub, delta badge,
sparkline SVG), `BarChart` (SVG/cột div theo design), `Donut` (conic-gradient
+ legend), `FilterPills`, `SearchInput` (debounce 300ms + abort request cũ),
`Pagination` ("Trang x/y · n mục"), `Toast` (tự tắt 4.5s, nút Hoàn tác khi đảo
ngược được), `ConfirmDialog` (cho Xoá user/thiệp), `EmptyState`, `ErrorState`.
Không thêm dependency FE mới.

Pages:

- Login: form design; demo hint "mật khẩu là admin" của design KHÔNG mang sang
  bản thật.
- Dashboard: greeting + ngày, 4 StatCards, bar 8 tuần + donut, 2 list gần đây
  (link "Xem tất cả →" sang trang tương ứng).
- Users: bar tuần + 4 KPI, filter + search, bảng (Người dùng, Ngày tham gia, Số
  thiệp, Trạng thái, Khoá/Mở + Xoá), pagination, toast/confirm.
- Cards: donut + top templates bars, filter + search, bảng (Thiệp, Chủ TK, Trạng
  thái, Xác nhận, Xem + Xuất bản/Ẩn + Bỏ báo cáo (khi flagged) + Xoá),
  pagination, toast/confirm.
- Templates: 4 KPI + style bars, filter + search, lưới card (dải màu palette,
  badge bấm để xoay Thường→MỚI→HOT, Ẩn/Hiện, Sửa mở modal tên + phong cách),
  pagination, toast + undo (re-PATCH giá trị cũ).

## 7. Responsive (bắt buộc, nghiệm thu từng trang)

Breakpoints `1024px / 768px`. Hành vi:

- Sidebar desktop sticky 240px → dưới 1024px thành topbar + hamburger mở drawer
  overlay (Esc/scrim đóng, focus vào drawer khi mở).
- Mọi grid KPI/chart/list → 1 cột dưới 768px; padding main `44px 48px` → `20px
  16px`; h1 dùng `clamp` như design.
- Bảng users/cards: bọc `overflow-x: auto`, `min-width: 720px`, cột đầu sticky
  trái; nút hành động wrap được, target chạm ≥ 44px.
- Bar/donut co giãn theo container (fluid width, SVG viewBox hoặc %).
- Không scroll ngang ở 360px; không vỡ layout ở 360 / 768 / 1280.
- E2E chạy lại toàn bộ flow admin trên viewport mobile (dùng project
  mobile/tablet sẵn có của playwright config).

## 8. Performance budgets

1. `GET /api/admin/stats` ≤ ~6 query: counts gộp 1 query
   (`count(*) filter (where ...)`), series tuần 1 query
   (`generate_series` 8 tuần left join), breakdown + top templates 1–2 query,
   recents 2 query limit 5, pending wishes 1 count. Users đếm qua Auth API.
2. Cards: search + filter trong SQL, offset pagination, perPage ≤ 50 (mặc định
   8); xác nhận RSVP 1 query LATERAL cho cả trang — cấm N+1.
3. Users: duyệt tối đa 10 pages Auth API (100/page); vượt ngưỡng → follow-up
   bảng profiles denormalized (ghi rõ trong code comment, không làm V1).
4. Admin API `no-store`; không cache CDN cho `/api/admin/*`. (Public chưa đọc
   DB nên không cần revalidate ở V1.)
5. Client: không lib chart, DOM ≤ perPage rows, debounce + abort, avatar chữ
   CSS.
6. Nghiệm thu: unit assert mọi list API có limit + clamp perPage; e2e dashboard
   < 3s trên data seed; mục tiêu prod `stats` p95 < 800ms (verify thủ công sau
   deploy).

## 9. Security checklist (test được)

- Ma trận 401/403 cho MỌI `/api/admin/*` với anon / user thường / admin.
- Login: 10 sai liên tiếp cùng IP → 429; message lỗi duy nhất cho mọi case.
- Fuzz: uuid sai, enum lạ, page âm/khổng lồ, q 10KB, body rỗng → 400/413, không 500.
- RLS: anon đọc template `hidden=true` → 0 rows; anon không chạm được gì khác.
- Không service-role key, không email admin, không `app_metadata` nào lọt ra client.
- `/admin/*` noindex, không sitemap, không link public.

## 10. Tests

- `tests/admin-auth.test.ts` — `requireAdmin` với client mock (no session →
  401, non-admin → 403, admin → ok + DTO); schema login (email xấu, pass rỗng);
  seed consistency (số row == số key `templateSamples`, style/badge hợp lệ).
- `tests/admin-*.test.ts` theo slice — clamp perPage, validation schemas,
  mapping DTO (couple fallback, confirmed "—" cho draft).
- `supabase/tests/admin.sql` — RLS templates (anon chỉ thấy `hidden=false`),
  `is_flagged` default false, trigger `updated_at` bảng mới.
- `e2e/admin.spec.ts` (mở rộng `e2e/support/mock-api.ts` thêm `**/api/admin/**`):
  guard redirect `/admin → /admin/login`; login sai hiện lỗi; login đúng hiện
  dashboard; users ban/unban + xoá (confirm); cards publish/ẩn + bỏ báo cáo +
  xoá; templates đổi nhãn + ẩn/hiện + sửa modal; pagination + search; chạy lại
  trên mobile viewport; `unmocked` phải rỗng.

## 11. Chia slice cho subagent song song

- **P0 foundation (1 agent, đi trước):** `requireAdmin` + tests, migration
  `templates` + `is_flagged` + seed script + SQL tests, zod schemas dùng chung,
  `lib/api.ts` cụm admin + types. Định nghĩa hợp đồng API (§5) để các slice
  sau code độc lập.
- **P1→P5 song song (5 agents, sau P0):** auth (API login/logout/me + trang
  login), users (API + trang), cards (API + trang), templates (API + trang),
  dashboard (stats API + trang). Mỗi agent: API + UI + unit tests của slice,
  theo đúng §5/§6/§7 của slice mình.
- **P6 verification (sau P1–P5):** e2e `admin.spec.ts` + responsive sweep +
  `typecheck` + full `npm test` + review chéo các slice.

Không làm ở V1: audit log, duyệt wishes, nút report phía khách, đồng bộ
templates ra public, denormalized profiles.
