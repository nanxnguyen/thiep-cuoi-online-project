# MỘC Wedding — Phase 3: Guest manager (thiết kế)

> Trạng thái sống nằm ở `PROGRESS.md` (mục 2c). File này là thiết kế chi tiết Phase 3, viết theo mẫu của `2026-09-20-invitation-core-phase1-design.md`. Chủ dự án đã yêu cầu Phase 3 sau khi Phase 2 xong (2026-09-21/22).

## 1. Bối cảnh

Hiện tại khách được mời qua một đường link chung `/invite/{slug}?to=Tên` — `to` là chuỗi tự do, không gắn với bản ghi nào, chỉ dùng để điền sẵn ô tên trong form RSVP/lời chúc (`guestLabel` lưu kèm mỗi lần gửi RSVP, xem `Rsvp.java`). Chủ thiệp không có cách quản lý ai đã được mời, mời theo hộ/nhóm, theo bàn, hay biết ai **chưa** phản hồi.

Phase 3 thêm một "sổ khách mời" thật: mỗi dòng là một **hộ/nhóm được mời** (ví dụ "Gia đình chú Ba", "Anh Nam & chị Lan"), có link riêng, có thể theo dõi trạng thái RSVP theo từng dòng, xuất/nhập CSV, thống kê theo nhóm/bàn.

## 2. Vị trí trong lộ trình

Phase 3 trong `PROGRESS.md` mục 3, trọng số 15% cả dự án, đứng sau Phase 1 (Lõi thiệp, ~93%) và Phase 2 (Marketing, ~92%). Không phụ thuộc Phase 2. Nếu làm Phase 5 (đa ngôn ngữ) sau này cần đổi schema `content` — nên tránh đụng `content` ở Phase 3 để hai việc không giẫm chân nhau (xem mục 3).

## 3. Quyết định đã chốt

1. **Một dòng = một hộ/nhóm**, không phải một cá nhân. Trường hiển thị chính gọi là `household` (tên hộ/nhóm).
2. **Bảng `guests` riêng, KHÔNG nhét vào `content` jsonb.** `content` là dữ liệu hiển thị thiệp (Cặp đôi, Sự kiện, Ảnh...), khách mời là dữ liệu vận hành — tách bảng để không phải re-validate cả `content` mỗi khi sửa một dòng khách, và để Phase 5 (song ngữ `content`) không đụng Phase 3.
3. **Link cá nhân theo token, không theo UUID thật.** `/invite/{slug}?g={token}` — token sinh bằng `SecureRandom`, lưu **plaintext** trong DB (khác với edit key: edit key là bí mật ghi, chỉ hiện một lần nên băm SHA-256 được; token khách cần hiện lại nhiều lần để "sao chép hàng loạt" nên không thể băm).
4. **`?to=` cũ vẫn chạy song song, không xoá.** Thiệp không dùng guest manager vẫn dùng `?to=Tên` như trước. `rsvps.guest_label` (cột đã có sẵn) giữ nguyên vai trò "tên tự do lúc gửi"; thêm cột mới `rsvps.guest_id` (nullable) chỉ điền khi RSVP đến từ một link `?g=token` hợp lệ.
5. **Xác thực bằng `X-Edit-Key` như mọi API chủ thiệp khác** — gọi `invitationService.authorize(id, key)` giống `ResponsesController`/`MediaController`, không thêm cơ chế auth mới.
6. **Chia 2 đợt** (Phase 3 cỡ XL — xem `PROGRESS.md` mục 2c):
   - **3a (spine):** migration, entity, API CRUD khách, sinh/giải token, `?g=` hoạt động, `rsvps.guest_id`, tab "Khách mời" trong Studio. Dùng được độc lập.
   - **3b:** CSV import/export, sao chép link hàng loạt, thống kê theo nhóm/bàn.

## 4. Phạm vi Phase 3

**Trong phạm vi:**
- CRUD một dòng khách (hộ/nhóm, nhóm, bàn, số điện thoại, số khách dự kiến, ghi chú riêng của chủ thiệp).
- Link cá nhân `/invite/{slug}?g={token}`, mở ra điền sẵn tên hộ vào form RSVP/lời chúc (thay cho `?to=`).
- RSVP gửi qua link `?g=` được gắn `guest_id`, hiện trạng thái ngay trên dòng khách trong Studio (Chưa phản hồi / Đến · N người / Không đến).
- Nhập CSV (tạo hàng loạt), xuất CSV (kèm link từng dòng).
- Sao chép link một dòng, sao chép tất cả link (clipboard).
- Thống kê nhanh theo nhóm và theo bàn (số hộ, số khách dự kiến, số đã xác nhận) — tính ở FE từ dữ liệu đã tải, không cần API riêng.

**Ngoài phạm vi (ghi rõ để không hứa nhầm trong UI):**
- Gửi link qua SMS/Zalo/email thật — cần tích hợp ngoài, để hỏi chủ dự án (mục 12).
- Kéo thả sơ đồ bàn (đó là Phase 4 "seating chart", công cụ độc lập).
- Tài khoản/đăng nhập cho khách xem lại phản hồi của chính họ.
- Phân trang danh sách khách (số hộ một đám cưới thực tế hiếm khi vượt vài trăm; thêm khi thật sự cần).

## 5. Data & API (repo backend Spring Boot)

### 5.1 Schema — Flyway `V2__guests.sql`

```sql
-- Nếu chạy trên Supabase Postgres: bật RLS và KHÔNG tạo policy (backend nối JDBC bằng role riêng, xem V1).

create table guests (
    id            uuid primary key,
    invitation_id uuid not null references invitations (id) on delete cascade,
    token         varchar(16) not null,
    household     varchar(80) not null,
    group_name    varchar(60) not null default '',
    table_no      varchar(20) not null default '',
    phone         varchar(20) not null default '',
    expected_pax  int not null default 1 check (expected_pax between 0 and 20),
    note          varchar(300) not null default '',
    created_at    timestamptz not null,
    updated_at    timestamptz not null,
    unique (invitation_id, token)
);
create index guests_invitation_idx on guests (invitation_id, created_at desc);

alter table rsvps add column guest_id uuid references guests (id) on delete set null;
create index rsvps_guest_idx on rsvps (guest_id);
```

`guest_id` dùng `on delete set null`: xoá một dòng khách không xoá RSVP đã gửi, chỉ mất liên kết nhóm/bàn — chấp nhận được, còn hơn mất dữ liệu RSVP.

### 5.2 Entity

`entity/Guest.java` — theo đúng phong cách `Rsvp.java`/`Wish.java` hiện có: Lombok `@Getter @Setter @NoArgsConstructor`, `invitationId` là UUID thô (không `@ManyToOne`, FK do DB cưỡng chế), `@PrePersist` set `createdAt`/`updatedAt`, `@PreUpdate` set lại `updatedAt`.

`entity/Rsvp.java` — thêm field `guestId` (UUID, nullable, không `@ManyToOne`).

### 5.3 Token khách mời — sinh, không băm

```java
// service/GuestTokenService.java
private static final SecureRandom RANDOM = new SecureRandom();
private static final String ALPHABET =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
private static final int LENGTH = 10; // 62^10 ≈ 8.4×10^17 tổ hợp mỗi thiệp

public String generate() {
    StringBuilder sb = new StringBuilder(LENGTH);
    for (int i = 0; i < LENGTH; i++) {
        sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
    }
    return sb.toString();
}
```

Khi tạo khách: sinh token, thử insert; nếu vi phạm `unique (invitation_id, token)` (xác suất cực nhỏ) thì sinh lại, tối đa 5 lần rồi trả lỗi 500 (không cần retry-loop phức tạp hơn — tần suất va chạm thực tế là ~0).

`GuestTokenService.generate()` phải là một bean/method có thể mock được trong test (không gọi `SecureRandom` trực tiếp ngay trong `GuestService`) — nếu không thì nhánh retry-khi-trùng không bao giờ được test thật (chỉ test "sinh nhiều token không trùng" không chạy qua nhánh đó). Test G2 phải có ca: mock `generate()` trả cùng một token 2 lần rồi một token khác, xác nhận `GuestService` tự thử lại và tạo thành công ở lần thứ 2.

**Không băm token** (khác `EditKeyService`): token cần hiển thị lại nhiều lần để "sao chép tất cả link" — không thể tái tạo từ hash. Mức rủi ro thấp: token chỉ dùng để điền sẵn tên vào form công khai vốn đã public, không phải bí mật ghi/sửa. Cần nói rõ trong tài liệu nội bộ (không phải lời hứa bảo mật với người dùng) rằng token không phải cơ chế bảo mật cấp cao.

### 5.4 REST API mới

Chủ thiệp (`X-Edit-Key`, theo mẫu `ResponsesController`/`MediaController` — gọi `invitationService.authorize(id, key)`), tất cả dưới `controller/GuestController.java`:

| Method | Path | Việc | Ghi chú |
|---|---|---|---|
| `POST` | `/api/invitations/{id}/guests` | Tạo một khách | Body `GuestRequest` (household bắt buộc, còn lại optional) |
| `GET` | `/api/invitations/{id}/guests` | Danh sách khách + trạng thái RSVP | `LEFT JOIN` rsvps mới nhất theo `guest_id`; trả `GuestsResponse` (list of `GuestResponse` có `link`, `rsvpStatus`) |
| `PATCH` | `/api/invitations/{id}/guests/{guestId}` | Sửa một khách | Partial update như `UpdateInvitationRequest` |
| `DELETE` | `/api/invitations/{id}/guests/{guestId}` | Xoá một khách | Cần thêm `DELETE` vào `CorsConfig.allowedMethods` (hiện chỉ `GET, POST, PATCH, OPTIONS`) |
| `POST` | `/api/invitations/{id}/guests/import` | Nhập hàng loạt | Body JSON `GuestImportRequest` (mảng `GuestRequest` đã được `lib/csv.ts` parse sẵn ở FE — xem mục 8, BE không parse CSV); trả kết quả từng dòng theo index |

Không có endpoint xuất CSV ở BE — FE tự dựng CSV từ dữ liệu `GET .../guests` đã tải sẵn (đủ mọi cột kể cả `link`), dùng `lib/csv.ts` để stringify rồi tải xuống bằng Blob. Không cần thêm round-trip HTTP, không cần xử lý BOM ở phía Java.

`GET .../guests` ghép trạng thái RSVP theo `guest_id` bằng **hai truy vấn lắp ở `GuestService`** (không phải JPQL join) — đúng với style hiện có: repo này không dùng `@ManyToOne`/quan hệ JPA ở đâu cả (FK là UUID thô, DB cưỡng chế), `ResponsesController` cũng ghép rsvps + summary + wishes theo cách này. Với số lượng khách một đám cưới (vài trăm dòng), hai truy vấn rồi lắp ở service là đủ, không cần tối ưu N+1.

Công khai, không cần key, dưới `PublicInvitationController` (thêm một endpoint nhỏ, không tạo controller mới — theo đúng chỗ các endpoint public khác đang ở):

| Method | Path | Việc |
|---|---|---|
| `GET` | `/api/public/invitations/{slug}/guests/{token}` | Giải mã token → `{household}`. KHÔNG bao giờ trả cả danh sách. Throttle riêng qua `ThrottleService` với prefix khoá mới (ví dụ `guest-token:{ip}:{slug}`) — vì đoán token (enumeration) là hướng tấn công duy nhất đáng lo ở endpoint này |

Không thêm endpoint thống kê riêng — FE tính nhóm/bàn từ chính response của `GET .../guests` (đã có `groupName`/`tableNo`/`expectedPax`/`rsvpStatus` trong mỗi dòng).

### 5.5 Thay đổi ở API/entity hiện có

- `dto/RsvpRequest.java` — thêm field optional `String guestToken` (giống cách `website` honeypot đã có, không bắt buộc, mặc định rỗng).
- `service/PublicInvitationService.submitRsvp()` — nếu `guestToken` không rỗng: tra `guests` theo `(invitation_id, token)`; nếu khớp, set `rsvp.guestId`; nếu không khớp (token sai/hết hạn/thuộc thiệp khác) → **bỏ qua lặng lẽ, không lỗi cả RSVP** (giống cách `?to=` không hợp lệ hôm nay không chặn gửi RSVP — trải nghiệm khách không được phép vỡ vì lỗi liên kết nội bộ).
- `service/RsvpSummary.of()` — đổi khoá gộp (dedupe key): dùng `"g:" + guestId` khi có `guestId`, ngược lại giữ `"n:" + name.trim().toLowerCase()` như cũ (link thủ công `?to=` không có token vẫn gộp theo tên như hiện tại). Cần cập nhật test đi kèm.
- `config/CorsConfig.java` — thêm `DELETE` vào `allowedMethods`.

### 5.6 Lỗi

Theo đúng mẫu có sẵn (`ApiException` → `ProblemDetail`, `detail` tiếng Việt): 404 "Không tìm thấy khách mời", 409 khi trùng gì đó bất thường, 400 "Dữ liệu không hợp lệ" (đã có sẵn từ `MethodArgumentNotValidException`). Không cần handler mới.

## 6. Trải nghiệm khách — `/invite/[slug]?g={token}`

`app/invite/[slug]/page.tsx` đọc thêm `g` từ `searchParams` (bên cạnh `to` cũ, giữ cả hai để không phá link cũ):

1. Nếu có `g`: gọi `api.resolveGuestToken(slug, g)` (endpoint public mới). Thành công → dùng `household` làm `guestName`, đồng thời truyền `guestToken={g}` xuống tới `RsvpForm`/`WishesPanel` để gửi kèm khi submit.
2. Token sai/hết hạn/không thuộc thiệp này → coi như không có `g`, rơi về `to` nếu có, hoặc rỗng — **không được lỗi cả trang**.
3. Nếu chỉ có `to` (không có `g`): giữ nguyên hành vi hiện tại, không có `guestToken`.

Prop plumbing (`InvitationRenderer` → `RsvpSection`/`WishesSection` → `RsvpForm`/`WishesPanel`) không đổi hình dạng — chỉ thêm một prop `guestToken?: string` đi kèm `guestName` đã có, đúng như Explore đã xác nhận không có tầng nào phải đổi cấu trúc.

`components/invitation/client/RsvpForm.tsx` — khi submit, gửi kèm `guestToken` (rỗng nếu không có) trong body `submitRsvp`.

## 7. Studio — tab "Khách mời"

Thêm vào `TABS` trong `Editor.tsx`: `{ id: "guests", label: "Khách mời" }`, đặt sau "Tham dự" trước "Mừng cưới" (gần với nơi chủ thiệp nghĩ về RSVP).

`components/studio/GuestsPanel.tsx` — theo đúng mẫu `ResponsesPanel.tsx` (**không** theo mẫu `PanelProps`/`panels/*`): khách là tài nguyên BE riêng (bảng riêng, API riêng, vòng đời tải/lưu riêng), không phải field trong `draft.content`, nên không đi qua `useAutosave`. Nhận `{ id, editKey, slug }` — `id`/`editKey` đã có sẵn trong scope của `Editor.tsx` (xem cách `media` được truyền ở dòng ~184), `slug` cần để build link `?g=`.

Giao diện (đợt 3a — CRUD thô):
- Bảng: Hộ/nhóm · Nhóm · Bàn · SĐT · Số khách dự kiến · Trạng thái RSVP · nút Sửa/Xoá.
- Nút "+ Thêm khách" mở form thêm nhanh.
- Nút "Sao chép link" trên từng dòng.

Giao diện (đợt 3b — thêm vào bảng trên):
- Bộ lọc theo Nhóm/Bàn (tính từ dữ liệu đã tải, không gọi API riêng).
- "Nhập CSV" (chọn file, hiện kết quả từng dòng: bao nhiêu thêm được, dòng nào lỗi và vì sao).
- "Xuất CSV".
- "Sao chép tất cả link" (mỗi dòng `Hộ/nhóm — URL`, ghép bằng `\n`, ghi vào clipboard).
- Thống kê đầu bảng: tổng số hộ, tổng khách dự kiến, số hộ đã xác nhận đến/không đến/chưa trả lời — theo Nhóm và theo Bàn. Cách tính rõ ràng mỗi hộ: **dự kiến** = `guests.expectedPax` (chủ thiệp tự ước lượng lúc thêm khách); **đã xác nhận** = `guests` của RSVP mới nhất gắn `guest_id` đó nếu `attending=true` (0 nếu không đến); **chưa trả lời** = hộ chưa có RSVP nào gắn `guest_id`. Đây là số tham khảo song song (dự kiến vs. đã xác nhận), không cộng dồn hai chiều thành một tổng duy nhất.

## 8. CSV import/export

Không có thư viện CSV nào trong FE hiện tại (đã kiểm bằng `grep`) — tự viết, không thêm dependency (danh sách khách một đám cưới thực tế nhỏ, không cần thư viện streaming).

`lib/csv.ts` (logic thuần, có `tests/csv.test.ts` theo đúng quy ước dự án cho `lib/`):

- **Xuất**: cột `ho_gia_dinh,nhom,ban,dien_thoai,so_khach_du_kien,ghi_chu,link`. Ghi **UTF-8 kèm BOM** (`﻿` ở đầu file) — bắt buộc để Excel trên Windows không làm hỏng dấu tiếng Việt khi mở file xuất ra.
- **Nhập**: dò dấu phân cách (`,` / `;` / `\t` — vì người dùng dán từ Google Sheets hoặc Excel theo vùng khác nhau), bỏ BOM nếu có ở đầu file, dòng đầu là header (khớp tên cột xuất ra, không phân biệt hoa/thường), mỗi dòng sau là một khách. Trả kết quả theo từng dòng (thành công/lỗi + lý do) — không chặn cả file vì một dòng sai, để chủ thiệp sửa đúng dòng lỗi thay vì tải lại từ đầu.

**Parse và stringify CSV chỉ viết một lần, ở FE** (`lib/csv.ts`) — không viết lại logic đó bằng Java. Nhập: FE parse file thành `GuestRequest[]`, gửi JSON qua `POST .../guests/import`; BE chỉ validate + insert hàng loạt, trả kết quả từng dòng theo index. Xuất: FE tự dựng CSV (kèm BOM) từ dữ liệu đã có trong tay (`GET .../guests`), không gọi BE thêm lần nào.

**Validate từng dòng nhập bằng thông báo tiếng Việt viết tay** (`GuestService.importRowProblem`), **không** dùng `jakarta.validation.Validator.validate()` trực tiếp — thông báo mặc định của Bean Validation là tiếng Anh (ví dụ `"size must be between 0 and 80"`), phát hiện lúc QA bằng trình duyệt thật 2026-09-22. `GuestRequest`'s `@Size`/`@Min`/`@Max` vẫn giữ để `@Valid` bảo vệ endpoint tạo/sửa đơn lẻ (`POST`/`PATCH` một khách), nhưng đường nhập hàng loạt validate thủ công để mỗi dòng có lý do bằng tiếng Việt.

## 9. Cấu trúc file

**Backend (mới):**
```
src/main/resources/db/migration/V2__guests.sql
src/main/java/com/moc/wedding/entity/Guest.java
src/main/java/com/moc/wedding/dto/GuestRequest.java
src/main/java/com/moc/wedding/dto/GuestResponse.java
src/main/java/com/moc/wedding/dto/GuestsResponse.java
src/main/java/com/moc/wedding/dto/GuestImportRequest.java
src/main/java/com/moc/wedding/dto/GuestImportResult.java
src/main/java/com/moc/wedding/dto/ResolveGuestResponse.java
src/main/java/com/moc/wedding/repository/GuestRepository.java
src/main/java/com/moc/wedding/service/GuestService.java
src/main/java/com/moc/wedding/service/GuestTokenService.java
src/main/java/com/moc/wedding/controller/GuestController.java
```

**Backend (sửa):** `entity/Rsvp.java` (+`guestId`), `dto/RsvpRequest.java` (+`guestToken`), `service/PublicInvitationService.java` (resolve token trong `submitRsvp`), `service/RsvpSummary.java` (khoá gộp mới), `controller/PublicInvitationController.java` (+1 endpoint), `config/CorsConfig.java` (+`DELETE`).

**Frontend (mới):**
```
lib/csv.ts
tests/csv.test.ts
components/studio/GuestsPanel.tsx
```

**Frontend (sửa):** `lib/api.ts` (+6 hàm: `listGuests`, `createGuest`, `updateGuest`, `deleteGuest`, `importGuests`, `resolveGuestToken` — không có `exportGuestsCsv` gọi BE, xuất CSV dựng thẳng từ dữ liệu đã tải bằng `lib/csv.ts`), `components/studio/Editor.tsx` (+tab), `app/invite/[slug]/page.tsx` (+đọc `g`), `components/invitation/client/RsvpForm.tsx` (+prop `guestToken`), `tests/api.test.ts` (mở rộng). `WishesPanel.tsx` **không đổi** — lời chúc không gắn `guest_id` trong thiết kế này, chỉ cần `guestName` để điền sẵn tên, prop đó đã có sẵn.

## 10. Kiểm chứng

- **BE:** `./mvnw test` — thêm test cho `GuestController` (CRUD, 404/403 khi sai key, token sinh không trùng trong 1 thiệp), `RsvpSummary` (gộp theo `guest_id` khi có), `PublicInvitationService.submitRsvp` (gắn `guest_id` khi token đúng, bỏ qua lặng lẽ khi token sai), CORS cho phép `DELETE`.
- **FE:** `npm test` — `tests/csv.test.ts` (round-trip xuất rồi nhập lại ra đúng dữ liệu, có dấu tiếng Việt, có BOM, dò đúng dấu phân cách `,`/`;`/`\t`, dòng lỗi không làm hỏng các dòng khác), `tests/api.test.ts` mở rộng cho các hàm mới. `npm run typecheck`, `npm run build`.
- **QA trình duyệt** (chỉ sau khi 3a+3b xong, theo quy ước "test sau khi xong phase"): thêm khách → sửa → xoá; nhập CSV có một dòng lỗi (thiếu `ho_gia_dinh`) → thấy đúng dòng lỗi, các dòng khác vẫn thêm được; xuất CSV rồi mở bằng trình đọc kiểm dấu tiếng Việt còn nguyên; sao chép link một dòng → mở link ẩn danh → thấy tên hộ điền sẵn → gửi RSVP → quay lại Studio thấy trạng thái dòng đó cập nhật; token sai/link cũ `?to=` vẫn hoạt động như trước (không vỡ tương thích ngược).

## 11. Cần từ chủ dự án (Open questions)

1. **Gửi link hàng loạt qua SMS/Zalo/email thật** hay chỉ dừng ở sao chép + xuất CSV? Mặc định Phase 3 chỉ làm sao chép/CSV (không cần tích hợp ngoài, không phát sinh chi phí). Gửi thật là việc riêng, cần chọn nhà cung cấp (SMS: eSMS/Speed SMS; email: Resend/SES) — để quyết định sau, không chặn 3a/3b.
2. **Giới hạn số khách tối đa mỗi thiệp?** Chưa có trong yêu cầu ban đầu; đề xuất một giới hạn hợp lý (ví dụ 500-1000 dòng) để tránh nhập CSV khổng lồ làm chậm, có thể chỉnh sau nếu cần.
3. Có cần khoá "chỉ đọc" danh sách khách sau khi thiệp đã publish không, hay luôn sửa được như hiện tại (đề xuất: luôn sửa được, giống mọi tab khác trong Studio).

## 12. Rủi ro & giới hạn đã biết

- Token khách **không phải cơ chế bảo mật cấp cao** (không băm, 10 ký tự base62 theo từng thiệp) — đủ để chống đoán ngẫu nhiên nhưng không phải bí mật ghi/sửa. Nếu chủ thiệp cần riêng tư danh sách khách ở mức cao hơn, đây là giới hạn cần biết trước, không phải lỗi.
- Xoá một dòng khách không xoá RSVP đã gửi (`on delete set null`) — RSVP cũ mất liên kết nhóm/bàn nhưng vẫn còn trong "Phản hồi". Chấp nhận được, tránh mất dữ liệu.
- `RsvpSummary` đổi khoá gộp là thay đổi hành vi thống kê — cần chạy lại test hiện có để chắc không vỡ trường hợp gộp theo tên cũ (link `?to=` thủ công, không có token).
- Nhập CSV ở MVP không giới hạn kích thước file rõ ràng — nên áp cùng kiểu giới hạn như upload ảnh/nhạc (ví dụ giới hạn số dòng ở FE trước khi gửi) để tránh một file khổng lồ làm chậm hoặc lỗi request.
