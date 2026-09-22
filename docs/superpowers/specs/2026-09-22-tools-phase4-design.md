# MỘC Wedding — Phase 4: 8 công cụ miễn phí (thiết kế)

> Trạng thái sống nằm ở `PROGRESS.md` (mục 2d, mục 3 "Phase 4"). File này viết theo mẫu `2026-09-22-guest-manager-phase3-design.md`. Không có yêu cầu mới nào từ chủ dự án cho Phase 4 — đây là bước tiếp theo tự nhiên vì Phase 1-3 đã xong và Phase 4 là phần **duy nhất không bị chặn bởi quyết định của chủ dự án** (Phase 1 deploy cần Supabase/host/domain, Phase 5 cần chốt ngôn ngữ, Phase 6 cần pháp lý/thanh toán).

## 1. Bối cảnh

`PROGRESS.md` mục 3 mô tả Phase 4: "8 tool miễn phí (save-the-date, tin nhắn mời, QR, seating chart, guest list, nén ảnh/video), phần lớn chạy phía trình duyệt, không cần BE". Đây là các công cụ độc lập, không gắn với một thiệp cụ thể — người dùng chưa cần tạo thiệp hay có edit key vẫn dùng được, mục đích là kéo traffic SEO và cho người dùng nếm trước giá trị trước khi vào Studio.

**Đối chiếu tài liệu cũ:** `docs/superpowers/specs/2026-09-20-invitation-core-phase1-design.md` dòng 20 liệt kê: "save-the-date ảnh/trang, tin nhắn mời, QR, seating chart, guest list, nén ảnh/video" — đúng 7 khái niệm (nén ảnh và nén video tách thành 2 tool). Không tìm thấy khái niệm thứ 8 ở đâu trong lịch sử dự án. Mục 10 ghi rõ đây là điểm cần hỏi chủ dự án, không tự bịa ra một tool thứ 8.

**5 trang SEO cũ đã viết trước khi có Phase 4** (`M11`, Phase 2): `/cong-cu-dam-cuoi` (hub, hiện đang **nói thẳng là các tool này chưa có**), `/tin-nhan-moi-cuoi` (hiện viết "MỘC hiện chưa có thư viện mẫu tin nhắn để sao chép"), `/qr-tien-mung`, `/thiep-cuoi-online-mien-phi`, `/tao-thiep-cuoi`. Hai trang đầu có nội dung sẽ **lỗi thời ngay khi Phase 4 ra mắt** — phải sửa, không phải việc phụ.

## 2. Vị trí trong lộ trình

Phase 4 trong `PROGRESS.md` mục 1, trọng số 12% cả dự án. Không phụ thuộc Phase 3 (guest manager có BE, dữ liệu riêng theo thiệp; Phase 4 guest-list là công cụ rời, chạy trên trình duyệt, không có thiệp/edit key). Không đụng `content` schema, không đụng BE Spring Boot ở đợt 4a/4b — an toàn làm song song nếu sau này có người khác làm Phase 1 T28 (deploy).

## 3. Quyết định đã chốt

1. **Không cần backend.** Toàn bộ 7 tool chạy trong trình duyệt: canvas, CSV, QR (qua ảnh của dịch vụ ngoài đã dùng sẵn), nén ảnh (canvas), nén video (WASM). Không gọi API Spring Boot nào. Lý do: đúng tinh thần "miễn phí, không cần tài khoản", và tránh phải thêm bảng/entity mới cho dữ liệu không cần lưu lâu dài.
2. **Dữ liệu chỉ ở `localStorage`, không đồng bộ máy chủ.** Danh sách khách và sơ đồ bàn của Phase 4 là bản nháp cá nhân trên một trình duyệt — khác hẳn "sổ khách mời" Phase 3 (có BE, gắn với một thiệp, dùng chung giữa nhiều thiết bị qua edit key). Không trộn hai khái niệm; không có API nào đọc/ghi bảng `guests` của Phase 3 từ trang công cụ.
3. **Route: `/cong-cu/<tool-slug>`, hub tại `/cong-cu-dam-cuoi` (giữ nguyên URL cũ).** `/cong-cu-dam-cuoi` đã có trong `SiteHeader.NAV_LINKS`, đã lên sitemap, đã có backlink — đổi URL sẽ mất equity SEO không cần thiết. Route tool con theo đúng gợi ý có sẵn ở `PROGRESS.md` dòng 141.
4. **Tái dùng tối đa, không thêm thư viện mới cho 6/7 tool:**
   - `lib/csv.ts` (Phase 3) → tool "Danh sách khách" dùng nguyên `GUEST_CSV_COLUMNS`/`parseGuestsCsv`/`guestsToCsv` — file CSV xuất ra từ công cụ này **mở lại được ở Studio → tab Khách mời → Nhập CSV** (cùng định dạng cột), không viết parser thứ hai.
   - `lib/image-compress.ts` (Phase 1) → tool "Nén ảnh" gọi thẳng `compressImage()`.
   - `api.qrserver.com` (đã dùng ở `PublishDialog.tsx`, đã khai trong `/quyen-rieng-tu`) → tool "Tạo mã QR" dùng cùng dịch vụ, không thêm thư viện sinh QR.
   - `components/studio/fields.tsx` + `panels.css` (`TextField`, `TextAreaField`, `SelectField`, `PanelSection`, `AddButton`, `IconButton`, `Glyph`, `useListFocus`) → dùng lại cho form của mọi tool thay vì viết bộ input mới; các class nền (`.input`, `.select`, `.textarea`, `.field`, `.button-primary`, `.button-ghost`) đã là global ở `app/globals.css`.
   - Kéo-thả sơ đồ bàn: dùng **Pointer Events** thuần (không thư viện dnd) — `onPointerDown`/`setPointerCapture`/`onPointerMove`/`onPointerUp` hoạt động thống nhất cho chuột lẫn cảm ứng; HTML5 Drag and Drop API bị loại vì không chạy trên cảm ứng, mà sản phẩm là mobile-first.
   - Riêng "Nén video" cần `@ffmpeg/ffmpeg` + `@ffmpeg/util` (không có thư viện WASM nào cài sẵn) — xem mục 6.7 và mục 10 (rủi ro).
5. **Không thêm route header COOP/COEP site-wide.** Đã kiểm tra: bản lõi **single-thread** của `@ffmpeg/core` không cần `SharedArrayBuffer`/cross-origin isolation, chỉ bản multi-thread mới cần. Dùng bản single-thread (chậm hơn nhưng không yêu cầu header) để không phá Google Maps embed và hai host ảnh QR bên ngoài đang dùng (COEP `require-corp` sẽ chặn mọi tài nguyên cross-origin thiếu `Cross-Origin-Resource-Policy`).
6. **Chia 2 đợt để QA không bỏ sót** (khác Phase 3 — ở đây là 7 mặt hàng độc lập, không phải 1 tính năng nhiều lớp, nên một đợt QA duy nhất dễ bỏ sót một canvas/WASM nào đó):
   - **4a (rẻ, tái dùng nhiều):** Tạo mã QR, Nén ảnh, Tin nhắn mời, Danh sách khách (CSV).
   - **4b (UI gốc, nhiều hơn):** Save-the-date (canvas), Sơ đồ chỗ ngồi (kéo-thả).
   - **4c (rủi ro kỹ thuật riêng, làm sau cùng, có thể hoãn):** Nén video (ffmpeg.wasm).

## 4. Phạm vi Phase 4

**Trong phạm vi:**
- 7 trang công cụ độc lập dưới `/cong-cu/<slug>`, mỗi trang chạy được không cần đăng nhập/thiệp.
- Viết lại `/cong-cu-dam-cuoi` (hub) thành trang liệt kê thật 7 công cụ, bỏ đoạn "chưa có sẵn trên MỘC".
- Sửa `/tin-nhan-moi-cuoi`: bỏ câu "chưa có thư viện mẫu tin nhắn", thêm liên kết tới `/cong-cu/tin-nhan-moi`.
- Thêm 7 URL công cụ + hub (đã có) vào `app/sitemap.ts`.
- Mỗi trang công cụ có nút/CTA dẫn sang `/studio` (đúng gợi ý PROGRESS dòng 141 "liên kết chéo sang Studio").
- Cập nhật `/quyen-rieng-tu` nếu có dịch vụ ngoài mới phát sinh (CDN tải `@ffmpeg/core` — chỉ khi làm tới 4c).

**Ngoài phạm vi (ghi rõ để không hứa nhầm trong UI):**
- Không có tài khoản/lưu công cụ trên nhiều thiết bị — dữ liệu chỉ ở `localStorage` trình duyệt hiện tại, mất khi xoá dữ liệu trình duyệt.
- Không đồng bộ danh sách khách/sơ đồ bàn của Phase 4 vào sổ khách mời Phase 3 (BE) — người dùng tự xuất CSV rồi nhập lại ở Studio nếu muốn.
- Save-the-date không tạo "trang" public riêng (khác gợi ý "ảnh canvas + trang" trong PROGRESS) — chỉ tạo **ảnh** để tải về/chia sẻ; một "trang" public riêng cần BE (slug, host, moderation) và trùng lặp với việc thiệp đã làm. Ghi vào mục 10 để hỏi chủ dự án có cần thật không.
- Nén video (4c) có thể hoãn nếu kiểm tra kỹ thuật sâu hơn phát hiện vấn đề bundle-size/hiệu năng nghiêm trọng trên máy yếu — không đánh đổi lấy một trải nghiệm tệ chỉ để đủ "8 tool".

## 5. Kiến trúc chung

### 5.1 Layout dùng chung

`components/tools/ToolPage.tsx` (mới) — khung trang: `SiteHeader` + `main` + `SiteFooter` (giống `SeoLandingPage` nhưng có vùng nội dung tương tác thay vì chỉ văn bản tĩnh). Props: `eyebrow`, `title`, `description`, `children` (nội dung công cụ), `related` (liên kết chéo, tái dùng đúng shape của `SeoLandingPage.related`).

`components/tools/tools.css` (mới) — style riêng cho khu vực tương tác (canvas, bảng khách, sơ đồ bàn), dùng lại token màu/khoảng cách có sẵn (`--lilac`, `--peach`, `--mint`, `--surface`, `--line`, `--radius`, `--wrap`, `--display`, `--accent`, `--muted`) để nhất quán với marketing/seo, không tạo bảng màu mới.

### 5.2 Metadata & SEO

Mỗi `app/cong-cu/<slug>/page.tsx`: `export const metadata` với `title`/`description`/`alternates.canonical` như các trang SEO khác — các trang này **được index** (khác Studio/`/invite`), vì mục đích là kéo traffic.

### 5.3 Kiểm thử

Logic thuần (không đụng DOM) tách ra `lib/tools/*.ts`, test bằng `node --test` theo đúng quy ước dự án (không `@/` alias, không enum/parameter property). Phần chạm DOM/canvas/clipboard chỉ kiểm bằng QA trình duyệt thật sau khi xong từng đợt (4a rồi 4b rồi 4c), đúng quy ước "không Playwright trong lúc code".

## 6. Từng công cụ

### 6.1 Tạo mã QR — `/cong-cu/tao-qr` (đợt 4a)

Input: một ô nhập link (placeholder "Dán link thiệp của bạn, ví dụ https://moc.wedding/invite/..."), validate bằng `isHttpUrl` đã có ở `fields.tsx`. Khi hợp lệ, hiện ảnh `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=8&data=<encodeURIComponent(link)>` (cùng dịch vụ, cỡ lớn hơn bản trong `PublishDialog` vì đây dùng để tải về in). Nút "Tải mã QR" (`<a download>` trỏ thẳng vào URL ảnh — không cần fetch-blob vì ảnh không same-origin, trình duyệt vẫn tải được qua thuộc tính `download` trên phần lớn trình duyệt hiện đại; nếu không, mở ảnh ở tab mới để người dùng tự lưu — ghi rõ trong hint). Không lưu link đã nhập ở đâu cả (không cần localStorage, việc quá nhẹ).

Logic thuần cần test: hàm dựng URL QR từ link + kích thước → `lib/tools/qr.ts`.

### 6.2 Nén ảnh — `/cong-cu/nen-anh` (đợt 4a)

Input: `<input type=file multiple accept=image/*>` (theo đúng mẫu `MediaPanel.tsx`). Với mỗi file: gọi `compressImage(file)` (từ `lib/image-compress.ts`, đã có sẵn, đã test), hiện thẻ trước/sau (dung lượng gốc → dung lượng sau nén, tỉ lệ giảm), nút tải ảnh đã nén (`URL.createObjectURL(blob)` + `<a download>`). Nút "Tải tất cả" khi có ≥ 2 ảnh (lặp tải từng ảnh, không zip — không thêm thư viện nén zip cho một việc phụ). Lỗi từng ảnh (định dạng không đọc được) hiện ngay dưới ảnh đó, không chặn các ảnh khác — cùng triết lý cô lập lỗi theo dòng như CSV import Phase 3.

Không cần `lib/tools/*.ts` riêng — logic nén đã có test ở `tests/image-compress.test.ts` (Phase 1); trang chỉ là lớp UI gọi hàm đã kiểm chứng.

### 6.3 Tin nhắn mời — `/cong-cu/tin-nhan-moi` (đợt 4a)

Form: tên cô dâu, tên chú rể, ngày cưới (date), link thiệp (optional), tên người nhận (optional), giọng điệu (`SelectField`: "Gần gũi" | "Trang trọng"). Sinh ra 2-3 phương án tin nhắn bằng ghép chuỗi mẫu có sẵn (không gọi AI, không cần BE) — ví dụ gần gũi: "{Tên người nhận ơi/Cả nhà ơi}, {chú rể} và {cô dâu} tổ chức lễ cưới vào {ngày}. Bạn xem thiệp và gửi lời chúc tại: {link}. Rất mong được đón tiếp!"; trang trọng: câu đầy đủ chủ ngữ hơn, không viết tắt. Mỗi phương án có nút "Sao chép" (`navigator.clipboard.writeText`, có fallback `document.execCommand` cũ nếu Clipboard API không có — nhưng không cần thiết vì Clipboard API đã hỗ trợ rộng; chỉ bọc try/catch và hiện thông báo lỗi tiếng Việt nếu bị chặn quyền, không để trang vỡ — bài học từ Phase 3 QA: `navigator.clipboard` có thể treo/từ chối trong một số ngữ cảnh).

Logic thuần (ghép chuỗi theo giọng điệu, format ngày kiểu Việt bằng `lib/datetime.ts` đã có) tách ra `lib/tools/inviteMessage.ts`, test round-trip: input đủ trường / thiếu trường tuỳ chọn (link rỗng thì bỏ hẳn câu "xem thiệp tại", không để lại chỗ trống).

### 6.4 Danh sách khách (CSV) — `/cong-cu/danh-sach-khach` (đợt 4a)

Bảng có thể sửa trực tiếp: Hộ/nhóm, Nhóm, Bàn, SĐT, Số khách dự kiến, Ghi chú — **đúng schema `GuestCsvRow` trong `lib/csv.ts`** (không tạo type mới). Nút "+ Thêm khách", sửa/xoá theo dòng (tái dùng `useListFocus`/`IconButton` như `GuestsPanel.tsx` Phase 3 đã làm). Lưu tự động vào `localStorage` (khoá `moc:tools:guest-list`, JSON `GuestCsvRow[]`) sau mỗi thay đổi, đọc lại khi mở trang — không mất việc khi lỡ đóng tab, không cần nút "Lưu".

Nút "Nhập CSV" (dùng `parseGuestsCsv` — lỗi từng dòng hiện đúng số dòng file, giống Phase 3), "Xuất CSV" (dùng `guestsToCsv`, tên file `danh-sach-khach.csv`, kèm BOM). CTA cuối trang: "Đã có thiệp? Vào Studio → tab Khách mời → Nhập CSV để dùng danh sách này" (link `/studio`, không thể tự động điền vì Studio cần biết `id`/`editKey` của một thiệp cụ thể — công cụ đứng rời không có ngữ cảnh đó).

Thống kê nhỏ đầu trang: tổng số hộ, tổng số khách dự kiến (cộng `expectedPax`) — tái dùng logic `bucketBy` kiểu đã viết trong `GuestsPanel.tsx` nếu hợp, hoặc một hàm gộp đơn giản hơn (không cần trạng thái RSVP vì công cụ này không có BE/RSVP).

### 6.5 Sơ đồ chỗ ngồi (kéo-thả) — `/cong-cu/so-do-cho-ngoi` (đợt 4b)

Đọc **cùng danh sách khách** ở `localStorage` khoá `moc:tools:guest-list` (mục 6.4) — nếu người dùng đã nhập danh sách khách trước, sơ đồ bàn hiện sẵn danh sách hộ để xếp; nếu chưa, cho thêm nhanh ngay tại trang sơ đồ (ghi lại cùng khoá, hai trang chia sẻ một nguồn dữ liệu).

Giao diện: cột trái danh sách hộ chưa xếp bàn (chip), khu vực phải là các "bàn" (thêm bàn mới: tên + sức chứa). Kéo một chip hộ thả vào một bàn để gán; bàn đầy (số khách đã gán ≥ sức chứa) không nhận thêm, chip bật lại vị trí cũ kèm thông báo ngắn. Kéo bằng Pointer Events (mục 3.4): `onPointerDown` trên chip → `setPointerCapture`, tạo một bản sao "đang kéo" theo dõi con trỏ bằng `transform: translate(...)`; `onPointerUp` dùng `document.elementFromPoint(x, y)` tìm bàn gần nhất có `data-table-id`, gán nếu còn chỗ. Có đường thay thế không cần kéo (bấm chọn hộ → bấm bàn để gán) cho người dùng bàn phím/trợ năng — kéo-thả không bao giờ là cách *duy nhất* để hoàn thành thao tác.

Xuất: ảnh canvas đơn giản (tên bàn + danh sách hộ trong bàn, dạng lưới) để in, và/hoặc CSV (`ho_gia_dinh,ban`) — ưu tiên CSV trước (rẻ, dùng lại `guestsToCsv`-kiểu ghép), ảnh canvas nếu còn thời gian ở đợt 4b.

Lưu trạng thái gán bàn ở `localStorage` khoá riêng `moc:tools:seating` (map `guestKey -> tableId`), tách khỏi khoá danh sách khách để xoá/nhập lại danh sách khách không tự xoá luôn cách xếp bàn.

### 6.6 Save-the-date — `/cong-cu/save-the-date` (đợt 4b)

Form: tên cô dâu, tên chú rể, ngày cưới, một ảnh nền tuỳ chọn (nén qua `compressImage` trước khi vẽ lên canvas, không upload đi đâu), chọn 1 trong vài bố cục màu sẵn (dùng token màu hiện có: `--lilac`/`--peach`/`--mint`, giữ đúng phong cách sáng/sang của sản phẩm). `<canvas>` vẽ trực tiếp trong trình duyệt (không SSR, không server render ảnh) theo kích thước cố định phù hợp chia sẻ mạng xã hội (1080×1350 — tỉ lệ dọc phổ biến Instagram/Zalo). Nút "Tải ảnh" xuất `canvas.toBlob("image/png")`.

Không tạo trang public riêng cho save-the-date (xem mục 4, ngoài phạm vi) — chỉ tải ảnh về máy, người dùng tự đăng lên nơi họ muốn.

### 6.7 Nén video — `/cong-cu/nen-video` (đợt 4c, có thể hoãn)

Thêm dependency mới: `@ffmpeg/ffmpeg` + `@ffmpeg/util` (client-only, `dynamic(() => import(...), { ssr: false })`). Tải **lõi single-thread** của `@ffmpeg/core` từ CDN (unpkg hoặc jsdelivr — đã dùng cho mọi thư viện npm khác qua bundler, nhưng ở đây tải lúc chạy bằng `toBlobURL`, không bundle vào build) — chỉ khi người dùng thật sự bấm "Nén video" trên đúng trang này, không tải trước, không nằm trong bundle chính (giữ FE nhẹ cho mọi trang khác).

Input: 1 video (`<input type=file accept=video/*>`), chọn mức nén (thấp/vừa/cao qua CRF), chạy `ffmpeg.exec([...])` nén H.264, thanh tiến trình từ sự kiện `progress` của `FFmpeg`, xuất blob tải về. Vì dùng lõi single-thread (không có `SharedArrayBuffer`), thời gian xử lý chậm hơn bản đa luồng — phải nói rõ trong UI ("có thể mất vài phút với video dài, video xử lý ngay trên máy bạn, không tải lên máy chủ") để người dùng không tưởng bị treo.

**Trước khi code:** thêm CDN tải `@ffmpeg/core` vào danh sách "dịch vụ ngoài" ở `/quyen-rieng-tu` (đang liệt kê `img.vietqr.io`, `api.qrserver.com`, Google Maps — mẫu có sẵn, chỉ thêm một dòng).

## 7. Cấu trúc file

**Frontend (mới):**
```
components/tools/ToolPage.tsx
components/tools/tools.css
lib/tools/qr.ts                 (+ tests/tools-qr.test.ts)
lib/tools/inviteMessage.ts      (+ tests/tools-invite-message.test.ts)
lib/tools/seating.ts            (gán bàn thuần, localStorage key ở đây; + tests/tools-seating.test.ts)
app/cong-cu/tao-qr/page.tsx
app/cong-cu/nen-anh/page.tsx
app/cong-cu/tin-nhan-moi/page.tsx
app/cong-cu/danh-sach-khach/page.tsx
app/cong-cu/so-do-cho-ngoi/page.tsx
app/cong-cu/save-the-date/page.tsx
app/cong-cu/nen-video/page.tsx   (đợt 4c)
```

**Frontend (sửa):**
```
app/cong-cu-dam-cuoi/page.tsx    (viết lại hub — bỏ "chưa có sẵn")
app/tin-nhan-moi-cuoi/page.tsx   (bỏ câu lỗi thời, thêm related tới /cong-cu/tin-nhan-moi)
app/sitemap.ts                   (+7 URL công cụ)
app/quyen-rieng-tu/page.tsx      (chỉ đợt 4c: +1 dòng CDN ffmpeg)
package.json                     (chỉ đợt 4c: +@ffmpeg/ffmpeg, +@ffmpeg/util)
```

Không sửa gì ở backend Spring Boot trong toàn bộ Phase 4.

## 8. Kiểm chứng

- **Mỗi đợt (4a, 4b, 4c) riêng:** `npm test`, `npm run typecheck`, `npm run build` xanh trước khi coi đợt đó xong — đúng quy ước "không Playwright trong lúc code".
- **QA trình duyệt sau mỗi đợt** (không dồn cả 7 tool vào một lần, xem mục 3.6):
  - 4a: nhập link hợp lệ/không hợp lệ ở tool QR, tải ảnh QR; nén 2-3 ảnh thật (JPG lớn, PNG có trong suốt) xem tỉ lệ giảm và ảnh tải về mở được; sinh tin nhắn cả 2 giọng điệu, sao chép thử; thêm/sửa/xoá vài dòng khách, nhập CSV có dòng lỗi cố ý, xuất CSV rồi **nhập lại đúng file đó ở Studio → Khách mời → Nhập CSV** để xác nhận định dạng tương thích thật (không chỉ suy luận từ code).
  - 4b: kéo-thả một hộ vào bàn trên desktop (chuột) và trên giả lập cảm ứng (chrome-devtools `emulate`), bàn đầy từ chối đúng; xuất CSV/ảnh sơ đồ; save-the-date sinh ảnh đúng tên/ngày, có ảnh nền lẫn không có ảnh nền, tải về mở được bằng trình xem ảnh.
  - 4c (nếu làm): nén một video ngắn thật, xác nhận file kết quả nhỏ hơn và phát được; kiểm tra Google Maps + QR ảnh (2 dịch vụ ngoài hiện có) vẫn hoạt động bình thường sau khi thêm ffmpeg (đúng lo ngại về COEP ở mục 3.5) trên cả trang `/invite/*` và trang nén video.
  - Cả 3 đợt: Lighthouse (mode phù hợp) cho ít nhất 1 trang công cụ đại diện mỗi đợt; hub `/cong-cu-dam-cuoi` sau khi viết lại.
- **Đồng bộ nội dung** (mục 7 "sửa"): xác nhận hub và `/tin-nhan-moi-cuoi` không còn câu nào nói các tool "chưa có"/"chưa phát hành" sau khi tool tương ứng đã lên.

## 9. Cần từ chủ dự án (Open questions)

1. **Có đúng 8 tool không, hay 7 là đủ?** Không tìm thấy khái niệm tool thứ 8 ở bất kỳ tài liệu nào (mục 1). Nếu chủ dự án có ý tưởng cụ thể (ví dụ: "đếm ngược ngày cưới dạng widget nhúng", "tạo lời cảm ơn sau cưới"), bổ sung sau — không chặn 4a/4b.
2. **Save-the-date có cần một "trang" public riêng** (như PROGRESS gợi ý "ảnh canvas + trang") hay chỉ cần ảnh tải về là đủ? Thiết kế hiện tại (mục 4, 6.6) chỉ làm ảnh — làm trang public riêng cần BE mới (slug, lưu trữ, có thể trùng vai trò với thiệp chính).
3. ~~Nén video (4c) có ưu tiên bằng 6 tool còn lại không?~~ **Đã làm (2026-09-22), chủ dự án chọn làm ngay.** Gặp một sự cố kỹ thuật ngoài dự kiến khi code thật (không phải rủi ro đã liệt kê ở bản spec gốc): Turbopack không bundle được worker mặc định của `@ffmpeg/ffmpeg` (`new Worker(new URL("./worker.js", import.meta.url))`) vì worker đó tự `import()` động một biến runtime bên trong, Turbopack cố phân tích tĩnh và vỡ với lỗi "Cannot find module as expression is too dynamic" — lỗi bundler đã biết (xem GitHub `looksawful/sophisticate` PR #24), không phải lỗi ở code của MỘC. Khắc phục: chép 3 file `worker.js`/`const.js`/`errors.js` từ `node_modules/@ffmpeg/ffmpeg/dist/esm` (bản 0.12.15) vào `public/ffmpeg-worker/` làm asset tĩnh, truyền `classWorkerURL` là **URL tuyệt đối có origin** (không phải đường dẫn tương đối) khi gọi `ffmpeg.load()` — `@ffmpeg/ffmpeg` bọc `classWorkerURL` trong `new URL(classWorkerURL, import.meta.url)`, mà `import.meta.url` trong chunk Turbopack ra `file://` chứ không phải origin trang thật, nên phải tự cung cấp URL tuyệt đối để bỏ qua base sai đó. Xem chi tiết trong `components/tools/VideoCompressTool.tsx`. **Rủi ro cần nhớ nếu nâng cấp `@ffmpeg/ffmpeg` sau này:** phải chép lại 3 file trong `public/ffmpeg-worker/` cho khớp phiên bản mới.
4. **Có cần giới hạn kích thước video đầu vào** cho tool nén video (ví dụ ≤ 200MB) để tránh trình duyệt treo trên máy yếu? Đề xuất có, con số cụ thể để quyết sau khi thử thật.

## 10. Rủi ro & giới hạn đã biết

- **Dữ liệu Phase 4 (danh sách khách, sơ đồ bàn) chỉ ở `localStorage`** — mất khi xoá dữ liệu trình duyệt, không đồng bộ đa thiết bị, không phải chỗ lưu trữ lâu dài. Phải nói rõ trong UI (không phải lỗi, là giới hạn đã biết trước).
- **QR qua `api.qrserver.com` là dịch vụ ngoài miễn phí** (đã dùng, đã khai báo) — không có SLA, có thể chậm/lỗi ngoài tầm kiểm soát của MỘC; UI cần thông báo lỗi tiếng Việt khi ảnh không tải được, không để khoảng trống vô nghĩa.
- **Kéo-thả bằng Pointer Events tự viết** thay vì thư viện dnd trưởng thành (dnd-kit, react-dnd) — đổi lấy 0 dependency mới nhưng phải tự xử các ca biên (huỷ kéo giữa chừng bằng phím Esc, cuộn trang trong lúc kéo trên di động). Chấp nhận được cho MVP; nếu sau này cần kéo phức tạp hơn (nhiều bàn, animation mượt), có thể cân nhắc thư viện lúc đó.
- **Nén video (4c) là hạng mục rủi ro kỹ thuật cao nhất Phase 4** — bundle WASM nặng (tải runtime, không vào bundle chính, nhưng vẫn là vài chục MB người dùng phải tải khi dùng tool này), lõi single-thread chậm hơn multi-thread, video dài/nặng có thể khiến tab trình duyệt trên máy yếu bị treo hoặc hết bộ nhớ — không có cách phía FE ngăn hoàn toàn, chỉ giảm thiểu bằng giới hạn kích thước đầu vào (mục 9.4) và thông báo rõ ràng.
- **Excel thật chưa được xác nhận mở đúng CSV xuất ra** (kế thừa giới hạn đã ghi ở Phase 3 — cùng `lib/csv.ts`, cùng cách kiểm bằng byte BOM chứ chưa mở bằng Excel thật).
