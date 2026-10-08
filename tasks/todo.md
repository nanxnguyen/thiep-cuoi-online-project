# Task list: Khu quản trị (/admin)

Spec: `docs/superpowers/specs/2026-10-09-admin-design.md`. Convention repo:
`node --test "tests/**/*.test.ts"`, `npm run typecheck`, e2e `playwright test`,
mọi API qua `routeResponse`, validate bằng `parseJson` + zod.

## Task 1: `requireAdmin()` + unit tests

**Description:** Thêm `requireAdmin()` vào `lib/server/auth.ts`: `getUser()`,
401 khi chưa login, 403 khi `app_metadata.is_admin !== true`, trả `AdminUser`
(reuse `userDto`).

**Acceptance criteria:**
- [ ] No session → 401; user thường → 403; `is_admin=true` → ok + DTO đúng shape
- [ ] Check đọc `app_metadata`, không đọc `user_metadata`

**Verification:**
- [ ] `node --test tests/admin-auth.test.ts` (mới, client mock như pattern `auth-routes.test.ts`)

**Dependencies:** None

**Files likely touched:**
- `lib/server/auth.ts`
- `tests/admin-auth.test.ts`

**Estimated scope:** S (1–2 files)

## Task 2: migration + seed + SQL tests

**Description:** Viết `supabase/migrations/202610090001_admin.sql` (bảng
`templates`, cột `invitations.is_flagged` + index, RLS theo spec §4) và script
`scripts/seed-templates.mjs` import `lib/templates.ts` để sinh `INSERT ... ON
CONFLICT DO NOTHING` (assert style thuộc 6 giá trị). Thêm
`supabase/tests/admin.sql` (RLS anon, default `is_flagged`, trigger
`updated_at`).

**Acceptance criteria:**
- [ ] Migration apply sạch; seed đủ rows = số key `templateSamples`
- [ ] Anon chỉ đọc được template `hidden=false`; service-role full

**Verification:**
- [ ] Review SQL + chạy `supabase test db` nếu có local stack (không bắt buộc CI)
- [ ] Test consistency trong `tests/admin-auth.test.ts` assert seed khớp code

**Dependencies:** None (song song Task 1 được)

**Files likely touched:**
- `supabase/migrations/202610090001_admin.sql`
- `scripts/seed-templates.mjs`
- `supabase/tests/admin.sql`

**Estimated scope:** M (3 files)

## Task 3: shared contracts (api client + zod + shell/UI kit)

**Description:** Dựng hạ tầng dùng chung để 5 slice code song song không dẫm
nhau: cụm `admin` trong `createApi` (`lib/api.ts`, append cuối object, kèm
types `AdminStats, AdminUserRow, AdminCardRow, AdminTemplateRow`);
`lib/server/admin-schemas.ts` (zod login, pagination, patch user/card/template);
`components/admin/` (`AdminShell` + `AdminSidebar` theo design Sidebar,
`StatCard`, `BarChart`, `Donut`, `FilterPills`, `SearchInput`, `Pagination`,
`Toast`, `ConfirmDialog`, `EmptyState/ErrorState`) + `components/admin/admin.css`
(tokens #1c1012/#f8f4ee/#a3161c, breakpoints 1024/768, table scroll pattern,
target chạm ≥44px).

**Acceptance criteria:**
- [ ] Mọi endpoint §5 spec đều có type + schema tương ứng, export từ 2 file trên
- [ ] Sidebar render 4 mục + tên admin + logout prop; drawer mobile hoạt động
- [ ] Không dependency mới trong `package.json`

**Verification:**
- [ ] `npm run typecheck`; render smoke test nếu có (ít nhất không vỡ build)

**Dependencies:** Task 1, Task 2

**Files likely touched:**
- `lib/api.ts`, `lib/server/admin-schemas.ts`
- `components/admin/*` (~10 files), `components/admin/admin.css`

**Estimated scope:** L (chia 2 sub-task nếu 1 agent: 3a contracts, 3b UI kit)

## Task 4: auth slice

**Description:** `POST /api/admin/login` (rate-limit IP 10/600s, message lỗi
chung duy nhất, non-admin sign-out ngay), `POST /api/admin/logout`
(assertSameOrigin), `GET /api/admin/me`. Trang `app/admin/login/page.tsx`
(server redirect khi đã admin + client form) và `(panel)/layout.tsx` (guard +
`AdminShell`, metadata noindex).

**Acceptance criteria:**
- [ ] Login đúng → cookie + redirect `/admin`; sai/pass thường dân → cùng 1 message lỗi
- [ ] `/admin` chưa login → redirect `/admin/login`; 10 sai liên tiếp → 429
- [ ] Ma trận 401/403 cho cả 3 endpoint

**Verification:**
- [ ] Unit login schema + requireAdmin path; manual login bằng user thật

**Dependencies:** Task 1, Task 2, Task 3

**Files likely touched:**
- `app/api/admin/login|logout|me/route.ts`, `app/admin/login/page.tsx`,
  `app/admin/(panel)/layout.tsx`, `tests/admin-auth.test.ts` (bổ sung)

**Estimated scope:** M (4–5 files)

## Task 5: users slice

**Description:** `GET /api/admin/users` (duyệt listUsers ≤10 pages, merge count
`group by owner_id`, search/sort/slice trong code, strip DTO),
`PATCH /api/admin/users/[id]` (ban/unban, chặn tự thao tác),
`DELETE` (chặn tự xoá). Trang `users/page.tsx`: bar tuần + 4 KPI, filter +
search, bảng + pagination + toast/confirm, responsive theo §7.

**Acceptance criteria:**
- [ ] List/search/filter/pagination đúng; ban → suspended, unban ngược lại
- [ ] Không ban/xoá chính mình; DTO không lọt `app_metadata`

**Verification:**
- [ ] `tests/admin-users.test.ts`; manual trên user thật

**Dependencies:** Task 1, Task 2, Task 3

**Files likely touched:**
- `app/api/admin/users/route.ts`, `app/api/admin/users/[id]/route.ts`,
  `app/admin/(panel)/users/page.tsx`, `components/admin/UsersClient.tsx`,
  `tests/admin-users.test.ts`

**Estimated scope:** M (5 files)

## Task 6: cards slice

**Description:** `GET /api/admin/cards` (lọc SQL, search SQL, count + page query,
batch owner email, 1 query LATERAL xác nhận, couple fallback),
`PATCH` (published/is_flagged, refine ≥1 field), `DELETE`.
Trang `cards/page.tsx`: donut + top templates, filter + search, bảng 5 cột
(Xem → `/invite/[slug]`, Xuất bản/Ẩn, Bỏ báo cáo khi flagged, Xoá) +
pagination + toast/confirm, responsive.

**Acceptance criteria:**
- [ ] Filter 4 trạng thái + search slug/template/tên đúng; draft hiện "—"
- [ ] Không query N+1 (1 LATERAL cho cả trang); perPage clamp ≤ 50

**Verification:**
- [ ] `tests/admin-cards.test.ts` (mapping, validation, clamp)

**Dependencies:** Task 1, Task 2, Task 3

**Files likely touched:**
- `app/api/admin/cards/route.ts`, `app/api/admin/cards/[id]/route.ts`,
  `app/admin/(panel)/cards/page.tsx`, `components/admin/CardsClient.tsx`,
  `tests/admin-cards.test.ts`

**Estimated scope:** M (5 files)

## Task 7: templates slice

**Description:** `GET /api/admin/templates` (filter style + search SQL, order
`pop desc`), `PATCH /[id]` (name/style/badge/hidden + enum checks). Trang
`templates/page.tsx`: 4 KPI + style bars, filter + search, lưới card (dải màu
resolve từ code theo id, badge xoay Thường→MỚI→HOT, Ẩn/Hiện, modal Sửa) +
pagination + toast/undo (re-PATCH), responsive.

**Acceptance criteria:**
- [ ] Mọi mutation persist trong DB và hiện lại sau reload
- [ ] Style/badge lạ → 400; id lạ → 404

**Verification:**
- [ ] `tests/admin-templates.test.ts`; manual reload kiểm tra persist

**Dependencies:** Task 1, Task 2, Task 3

**Files likely touched:**
- `app/api/admin/templates/route.ts`, `app/api/admin/templates/[id]/route.ts`,
  `app/admin/(panel)/templates/page.tsx`,
  `components/admin/TemplatesClient.tsx`, `tests/admin-templates.test.ts`

**Estimated scope:** M (5 files)

## Task 8: dashboard slice

**Description:** `GET /api/admin/stats` (≤ ~6 query gộp theo §8.1 + đếm users
qua Auth API, `no-store`). Trang `(panel)/page.tsx`: greeting + ngày, 4
StatCards (sparkline + delta), bar 8 tuần + donut, 2 list gần đây + link "Xem
tất cả →", responsive.

**Acceptance criteria:**
- [ ] Mọi con số từ DB/Auth thật, khớp với trang chi tiết (tổng users,
      published...)
- [ ] Stats handler ≤ 6 round-trip DB (đếm bằng review code)

**Verification:**
- [ ] `tests/admin-stats.test.ts` (shape DTO); manual đối chiếu số liệu

**Dependencies:** Task 1, Task 2, Task 3

**Files likely touched:**
- `app/api/admin/stats/route.ts`, `app/admin/(panel)/page.tsx`,
  `components/admin/DashboardClient.tsx`, `tests/admin-stats.test.ts`

**Estimated scope:** M (4 files)

## Task 9: e2e admin + mock-api

**Description:** Mở rộng `e2e/support/mock-api.ts` mock `**/api/admin/**`
(login/me/stats/users/cards/templates + mutations). Viết `e2e/admin.spec.ts`:
guard redirect, login sai/đúng, CRUD mỗi trang, pagination + search,
`unmocked` rỗng; chạy lại trên mobile viewport (project sẵn có).

**Acceptance criteria:**
- [ ] Xanh trên cả desktop + mobile projects; console/page errors rỗng

**Verification:**
- [ ] `npx playwright test e2e/admin.spec.ts` (sau khi slices xong)

**Dependencies:** Task 4, 5, 6, 7, 8

**Files likely touched:**
- `e2e/support/mock-api.ts`, `e2e/admin.spec.ts`

**Estimated scope:** M (2 files)

## Task 10: responsive sweep + final verification

**Description:** Đối chiếu 4 trang với 4 file `.dc.html` (bố cục + copy tiếng
Việt), sweep 360/768/1280 (không scroll ngang, drawer/charts/tables đúng §7),
chạy `npm test` + `typecheck` + e2e full, review chéo conflict (đặc biệt
`lib/api.ts`), cập nhật `DEPLOY.md`/docs (cách cấp `is_admin`).

**Acceptance criteria:**
- [ ] Checklist §7 + §9 spec pass hết; docs ops có SQL cấp quyền

**Verification:**
- [ ] `npm test`, `npm run typecheck`, `playwright test` xanh

**Dependencies:** Task 9

**Files likely touched:** `components/admin/*`, `DEPLOY.md`/`docs/*`, fix lẻ các slice

**Estimated scope:** M
