# Phase 5 — Đa ngôn ngữ (vi + en): spec

## 1. Mục tiêu

Khách quốc tế (không đọc được tiếng Việt) mở link thiệp vẫn hiểu được nội dung chính và tự RSVP được. Chủ dự án xác nhận (2026-09-23): chỉ vi + en, không cần ngôn ngữ khác. Studio (nơi CHỦ THIỆP làm việc) không cần dịch UI — chủ thiệp luôn là người Việt. Chỉ trang khách thật (`/invite/[slug]`) cần hiện được tiếng Anh — `/templates/[id]` (preview mẫu bằng dữ liệu mẫu, phục vụ chọn mẫu) và toàn bộ marketing giữ nguyên tiếng Việt, ngoài phạm vi. `InvitationRenderer` nhận `locale` là prop tuỳ chọn mặc định `"vi"` nên các nơi gọi khác (preview, Studio) không cần đổi gì.

## 2. Phạm vi — đọc hẹp, không dịch mọi trường

Theo đúng ràng buộc đã xác nhận trước khi viết spec này:

- **Không đổi routing.** Không dùng path prefix (`/en/...`) — nó vỡ `?to=`, `?g=<token>` (Phase 3) và `#k=` (edit key) vốn đang gắn vào các route hiện có. Dùng thêm 1 query param `?lang=vi|en` trên `/invite/[slug]` (giống mẫu `?to=`/`?g=` đã có), mặc định `vi` khi thiếu hoặc giá trị lạ. Không cookie, không middleware, không next-intl — chrome text chỉ ~40 chuỗi, tự viết `lib/i18n.ts` là đủ theo ladder (không dùng thư viện ngoài cho cỡ này).
- **Không bump `content.v`, không migration.** Chỉ THÊM trường tuỳ chọn (`*En`) vào 3 chỗ nội dung tường thuật khách thật sự đọc — không dịch tên người, địa chỉ, tên ngân hàng, ngày (không có "bản dịch"):
  1. `couple.message` → thêm `couple.messageEn`
  2. `thanks.message` → thêm `thanks.messageEn`
  3. `gift.note` → thêm `gift.noteEn`
  4. `rsvp.questions[].label` → thêm `rsvp.questions[].labelEn` (câu hỏi RSVP là nội dung khách phải hiểu để trả lời, không phải trang trí — tính là chức năng, không phải "tường thuật", nhưng vẫn nhỏ vì tối đa 3 câu)
  - Record chỉ khoanh 4 chỗ này. Sự kiện (`events[].title/venue/address/lunar`) KHÔNG có bản Anh riêng: `venue`/`address` là địa chỉ thật (không dịch), `title` cho 3 loại chuẩn (`engagement`/`ceremony`/`reception`) lấy nhãn tiếng Anh từ `lib/i18n.ts` theo `kind` (không cần chủ thiệp gõ gì thêm); loại `custom` giữ nguyên chữ chủ thiệp gõ ở cả 2 ngôn ngữ (biết trước, chấp nhận).
- **Tương thích ngược không cần version mới:** record Java dùng **compact constructor** để tự đổi `null` (JSON cũ thiếu key) thành `""` — validation `@NotNull` vẫn qua vì compact constructor chạy trước validation. Không cần đọc `v`, không cần hàm "upgrade", không cần sửa `InvitationService.readContent`. Thiệp cũ (`v:1`, thiếu 4 trường mới) đọc lên tự có `""` cho các trường `*En`, ghi lại là có đủ trường.
- **UI chrome (nhãn, nút, section heading, RSVP form, đếm ngược, câu hỏi mặc định) dịch qua `lib/i18n.ts`** — dictionary tĩnh `{ vi: {...}, en: {...} }`, không đụng nội dung `Content`.
- **`hreflang`**: `generateMetadata` của `/invite/[slug]` thêm `alternates.languages: { vi: ".../invite/{slug}?lang=vi", en: "...?lang=en" }` (giữ `?to=`/`?g=` nếu có trong URL gốc).
- **Studio**: `CouplePanel` thêm 2 ô nhập tuỳ chọn (Lời mời bản Anh, Lời cảm ơn bản Anh) ngay dưới ô tiếng Việt tương ứng, có thể để trống; `GiftPanel` thêm ô "Lời nhắn bản Anh"; `RsvpPanel` mỗi câu hỏi thêm 1 ô "Bản Anh (tuỳ chọn)". Không dịch UI Studio.
- **Khi thiếu bản Anh:** trang khách ở `?lang=en` hiện fallback về bản tiếng Việt cho 4 trường nội dung (không hiện trống) — khách vẫn đọc được gì đó, chỉ là chưa dịch; chrome text (nhãn UI) luôn có bản Anh đầy đủ vì đó là dictionary cố định, không phụ thuộc chủ thiệp gõ gì.

## 3. Thay đổi cụ thể

### 3.1 Backend (`Thiep-cuoi-online-backend`)

`InvitationContent.java`:
```java
public record Couple(
        @NotNull @Valid Person groom,
        @NotNull @Valid Person bride,
        @NotNull @Size(max = 500) String message,
        @NotNull @Size(max = 500) String messageEn,
        @NotNull @Size(max = 500) @Pattern(regexp = OPT_URL) String heroPhoto) {
    public Couple {
        messageEn = messageEn == null ? "" : messageEn;
    }
}
```
Cùng khuôn cho `Thanks.messageEn`, `Gift.noteEn`, `Question.labelEn` (mỗi record thêm 1 trường + compact constructor tự thay `null` → `""`).

### 3.2 FE schema (`lib/content.ts`)

Thêm `messageEn: text(500)` vào `couple`, `messageEn: text(500)` vào `thanks`, `noteEn: text(300)` vào `gift`, `labelEn: text(120)` vào câu hỏi RSVP — cùng khuôn `text()` như trường gốc (không `.optional()`, luôn có mặt, "" hợp lệ, khớp quy ước "trống luôn là ''"). `defaultContent()`/`sampleContent()` thêm `""` cho các trường mới. **Fixture BE phải regenerate lại** (README có lệnh `node -e`) vì record Java đổi shape.

### 3.3 `lib/i18n.ts` (mới, thuần, có test)

```ts
export type Locale = "vi" | "en";
export function resolveLocale(v: string | undefined): Locale { return v === "en" ? "en" : "vi"; }
export const t = (locale: Locale, key: ChromeKey): string => DICT[locale][key];
```
Dictionary tĩnh cho: nhãn section (Nhà trai/Groom's family, Nhà gái/Bride's family, Chương trình/Schedule, Album ảnh/Photo gallery, Lời chúc/Guestbook, Mừng cưới/Gift, Đếm ngược/Countdown + đơn vị ngày-giờ-phút-giây), RSVP (nút Xác nhận tham dự/Confirm attendance, Có/đến-Không đến, nhãn ô tên/số lượng, thông báo lỗi/thành công), nhãn loại sự kiện chuẩn (`engagement`→Engagement, `ceremony`→Wedding Ceremony, `reception`→Reception), toggle ngôn ngữ (VI/EN).

### 3.4 Trang khách + renderer

`app/invite/[slug]/page.tsx`: đọc `sp.lang` → `resolveLocale()`, truyền `locale` xuống `InvitationRenderer`. Renderer + mọi section nhận `locale` qua prop (không Context — khớp cách `mode`/`template` đang được truyền hiện tại), dùng `t(locale, key)` cho chrome text, và một hàm nhỏ `pick(locale, vi, en)` (`en && locale==="en" ? en : vi`) cho 4 trường nội dung có bản Anh. Toggle ngôn ngữ: `<Link href={...?lang=en}>` giữ nguyên `to`/`g` hiện có trong URL (không phải nút client-side phức tạp).

## 4. Không làm trong Phase 5 này (nói rõ để không hiểu lầm)

- Không dịch marketing/SEO site (`/`, `/tinh-nang`, `/blog`...) — ngoài phạm vi đã chốt (chỉ trang khách).
- Không dịch Studio UI.
- Không thêm thư viện i18n (next-intl) — dictionary tay đủ cho ~40 chuỗi.
- Không đổi cách khách chọn ngôn ngữ thành tự động theo `Accept-Language` — chỉ thủ công qua toggle, giữ đơn giản, dễ kiểm.

## 5. Kiểm chứng

`tests/i18n.test.ts` (mới): `resolveLocale` mọi input, `t()` cả 2 locale có đủ key (không thiếu chuỗi). `tests/content.test.ts` mở rộng: default content có đủ 4 trường mới = "". BE: test compact constructor nhận JSON thiếu trường mới (mô phỏng thiệp `v:1` cũ) vẫn đọc ra `""`, không lỗi validation. QA cuối phase (theo quy ước, sau khi code xong): mở `/invite/<slug>?lang=en`, xác nhận chrome đổi tiếng Anh, nội dung có bản Anh hiện bản Anh, nội dung không có bản Anh fallback tiếng Việt, RSVP gửi được ở cả 2 ngôn ngữ.
