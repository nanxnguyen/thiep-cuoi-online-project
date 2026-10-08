# Implementation Plan: Khu quản trị (/admin)

## Overview

Xây khu quản trị riêng tách hẳn route public theo spec
`docs/superpowers/specs/2026-10-09-admin-design.md`: login email+password tại
`/admin/login` (Supabase user + `app_metadata.is_admin`), 4 trang sau login
(Tổng quan, Người dùng, Thiệp cưới, Mẫu thiệp) dùng chung sidebar, APIs
`/api/admin/*` guard bởi `requireAdmin()`, migrations (`templates` + seed,
`invitations.is_flagged`), responsive bắt buộc 360/768/1280. Không audit log,
không trang duyệt wishes, public `/templates` V1 giữ nguyên đọc code.

## Architecture Decisions

- Tái dùng session cookie Supabase hiện có; không hệ auth thứ hai. Cờ admin
  trong `app_metadata` (không phải `user_metadata`).
- Mọi `/api/admin/*` gọi `requireAdmin()` độc lập — layout guard chỉ lo UX.
  Admin query dùng `createAdminClient` (service-role) sau guard.
- Route group `app/admin/(panel)/` giữ URL sạch; `/admin/*` noindex, không
  sitemap, không link public.
- `templates` là bảng mới duy nhất public-liên quan: RLS anon chỉ đọc
  `hidden=false` (dọn đường follow-up), V1 public chưa đọc bảng này.
- Xoá thật → confirm dialog; toggle đảo ngược được → toast + hoàn tác.
- Không dependency FE mới; chart = SVG/div inline.

## Dependency Graph

```
Task 1 requireAdmin + tests
  │
Task 2 migration + seed + SQL tests ──┐ (độc lập với Task 1, gộp chung P0)
  │                                    │
Task 3 shared contracts (api client + zod + shell/sidebar/css)
  │  ▲ cả 3 task P0 xong mới tới slices
  ├── Task 4 auth (login API + trang login)
  ├── Task 5 users (API + trang)
  ├── Task 6 cards (API + trang)        } song song (5 agents)
  ├── Task 7 templates (API + trang)  }
  └── Task 8 dashboard (stats API + trang)
          │
  Task 9 e2e admin.spec.ts + mock-api
          │
  Task 10 responsive sweep + final verification
```

## Task List

### Phase 0: Foundation (1 agent, tuần tự T1→T3)

- [ ] Task 1: `requireAdmin()` + unit tests
- [ ] Task 2: migration `templates` + `is_flagged` + seed script + SQL tests
- [ ] Task 3: shared contracts — admin api client, zod schemas, shell/sidebar/UI kit

### Checkpoint: Foundation

- [ ] `node --test tests/admin-auth.test.ts` xanh; migration apply được trên DB
      local (`supabase db reset` hoặc review SQL); seed sinh đủ rows
- [ ] Các slice P1–P5 có hợp đồng API để code độc lập

### Phase 1: Slices (5 agents song song, sau Checkpoint Foundation)

- [ ] Task 4: auth slice — login/logout/me + trang `/admin/login`
- [ ] Task 5: users slice — API + trang Người dùng
- [ ] Task 6: cards slice — API + trang Thiệp cưới
- [ ] Task 7: templates slice — API + trang Mẫu thiệp
- [ ] Task 8: dashboard slice — stats API + trang Tổng quan

### Checkpoint: Slices

- [ ] `npm test` toàn xanh, `npm run typecheck` sạch
- [ ] Mỗi slice demo được bằng tay (login bằng user `is_admin` thật)

### Phase 2: Verification (1–2 agents)

- [ ] Task 9: e2e `admin.spec.ts` + mở rộng mock-api (desktop + mobile viewport)
- [ ] Task 10: responsive sweep 360/768/1280 + full verification + review chéo

### Checkpoint: Complete

- [ ] `npm test`, `typecheck`, `e2e` xanh; không scroll ngang mobile
- [ ] Human review trước khi merge/deploy

Chi tiết từng task (acceptance + verification + files) xem `tasks/todo.md`.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| 5 agents sửa chung file (`lib/api.ts`, css) gây conflict | Med | Task 3 chia sẵn vùng sở hữu: mỗi slice chỉ append section của mình; merge theo thứ tự P6 review |
| `listUsers` chậm khi users nhiều | Low | Budget ≤10 pages trong code + comment ngưỡng follow-up; V1 users ít |
| Seed templates lệch với `lib/templates.ts` sau này | Low | Test consistency số lượng + style/badge hợp lệ chạy mỗi `npm test` |
| Schema `content.couple` đổi làm vỡ trích tên | Low | Fallback `"Thiệp chưa đặt tên"` + test mapping |
| Hiểu sai design pixel | Med | P6 đối chiếu từng trang với file `.dc.html` tương ứng |

## Open Questions

- Không còn câu hỏi mở — mọi quyết định đã chốt trong spec §1.
