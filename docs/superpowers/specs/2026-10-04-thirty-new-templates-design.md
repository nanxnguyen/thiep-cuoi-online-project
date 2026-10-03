# 30 mẫu thiệp mới từ bộ tham khảo — Design Spec

**Ngày:** 2026-10-04

**Trạng thái:** Đã được chủ dự án duyệt; implementation plan đã viết lại theo spec.

**Mục tiêu:** Giữ nguyên 20 mẫu hiện tại và bổ sung đúng 30 visual identity hoàn toàn mới để nâng catalog MỘC Wedding từ 20 lên 50 mẫu, đồng thời bổ sung các phần còn thiếu so với 51 bộ tham khảo trong `refs/`.

## 1. Kết quả mong muốn

30 mẫu mới không chỉ là 30 bìa khác nhau. Mỗi mẫu phải tạo cảm giác là một bộ thiệp hoàn chỉnh nhờ ba lớp:

1. **Cover riêng:** một bố cục 9:16 có signature element rõ ràng.
2. **Section profile riêng:** thứ tự, nhịp, biến thể và ornament của toàn trang phù hợp concept.
3. **Nội dung đầy đủ:** dùng các section chung hiện có và bốn section mới rút ra từ `refs/`.

Thành công khi:

- Catalog có đúng 50 mẫu, không trùng id, tên hoặc cover family.
- Nhìn thumbnail vẫn phân biệt được 30 mẫu mới, không phải cùng bố cục đổi màu.
- Trang khách của mỗi mẫu giữ một ngôn ngữ hình ảnh nhất quán từ cover đến lời cảm ơn.
- 20 mẫu cũ được đóng băng: không đổi id, tên, metadata/SEO, family, archetype, palette, sample content, cover, thumbnail, thứ tự section hoặc giao diện mặc định.
- Người dùng cũ không mất dữ liệu; hạ tầng shared chỉ được mở rộng khi test hồi quy chứng minh đầu ra mặc định của 20 mẫu cũ không đổi.
- Tất cả mẫu chạy tốt ở 390px và 1280px, đạt WCAG 2.2 AA cho nội dung và thao tác chính.

## 2. Bối cảnh đã kiểm tra

### 2.1 Hệ thống hiện tại

- `lib/templates.ts` đang có 20 mẫu, 15 cover family A–O và 6 archetype: `editorial`, `minimal`, `classic`, `botanical`, `traditional`, `korean`.
- `components/templates/ThiepPreview.tsx` dựng cover; `components/invitation/InvitationRenderer.tsx` là renderer duy nhất cho gallery, Studio và trang khách.
- Nội dung hiện có: phong bì, cặp đôi, gia đình, lễ/tiệc, lịch trình, đếm ngược + thêm lịch, album, RSVP, sổ lưu bút, QR mừng cưới, cảm ơn và nhạc.
- `contentSchema` là hợp đồng persisted với Supabase; thay đổi schema phải tương thích dữ liệu v1 đang tồn tại.
- `DESIGN.md` và `app/styles/tokens.css` là nguồn chuẩn về nhận diện và token; không rải hex ngoài token.

### 2.2 Bộ tham khảo

`refs/` có 51 snapshot, gồm 20 mẫu Chung Đôi và 30 mẫu M-Invite cùng một trang catalog. Mỗi snapshot có HTML, token, ảnh cover/mobile/desktop và asset cục bộ khi tải được.

Các pattern xuất hiện ổn định:

- Ảnh cưới lớn, lịch tháng, thông tin lễ/tiệc, album, RSVP và mừng cưới.
- Thiệp truyền thống Việt dùng đỏ son, chữ Hỷ, long/phụng, sen, lịch âm và thông tin hai họ.
- Thiệp hiện đại dùng editorial typography, ảnh documentary, collage, calendar-led cover và khoảng trắng lớn.
- Một số trang có phần mà MỘC chưa có: chuyện tình yêu, video, dress code và venue/map giàu thông tin.

Những điểm không mang sang nguyên trạng:

- Thanh điều hướng/branding của website tham khảo.
- Copy, ảnh, ornament hoặc font thương mại chưa rõ giấy phép.
- Các pattern làm nội dung khó đọc, hiệu ứng liên tục hoặc section lặp lại chỉ để kéo dài trang.

### 2.3 Xu hướng 2026 áp dụng có chọn lọc

Áp dụng: typography biên tập, ảnh giàu cảm xúc, chất liệu giấy/vải được mô phỏng tiết chế, màu bão hòa, chi tiết lấy từ địa điểm, minh họa cá nhân và motion nhỏ có chủ đích.

Không biến toàn bộ catalog thành một phong cách “trend”. Mỗi mẫu chỉ có một signature element; phần còn lại yên tĩnh để tên, ngày và địa điểm vẫn là nội dung chính.

## 3. Quyết định kiến trúc

Đã chọn **Hybrid** thay vì hai hướng còn lại:

- Không giữ hướng cover-only của plan cũ vì không đáp ứng yêu cầu bổ sung phần còn thiếu.
- Không tạo 30 full-page renderer độc lập vì sẽ nhân bản form, accessibility, logic RSVP và trạng thái lỗi.
- Tạo 30 cover family riêng, kết hợp shared section variants qua một `sectionProfile` có kiểu chặt chẽ.

Luồng render:

```text
Template registry
  ├─ coverFamily ──> coverRenderers[family]
  ├─ archetype ────> nhịp nền hiện có
  └─ sectionProfile
       ├─ order ───> thứ tự section
       ├─ variants -> biến thể shared component
       └─ ornaments -> CSS/SVG riêng của concept

Content v1/v2 ──normalizeContent──> InvitationRenderer ──> cùng markup và hành vi chuẩn
```

### 3.1 Registry cover

- Giữ `LegacyFamily = "A" | ... | "O"`.
- Thêm `NewCoverFamily` gồm 30 slug ở bảng mục 5.
- Mỗi family mới là một file trong `components/templates/covers/`.
- `coverRenderers: Record<NewCoverFamily, CoverRenderer>` bắt buộc đầy đủ ở typecheck.
- Metadata thuần để ở `lib/covers.ts`, không import React để `node --test` đọc trực tiếp.
- CSS chia theo sáu collection, không dồn cả 30 mẫu vào một file khổng lồ.

### 3.2 Section profile

Thêm `sectionProfile` vào metadata template, không lưu trong content của từng thiệp:

```ts
type InvitationSectionKey =
  | "cover" | "couple" | "family" | "events" | "venue"
  | "story" | "schedule" | "countdown" | "dressCode"
  | "album" | "video" | "rsvp" | "guestbook" | "gift" | "thanks";

type SectionProfile = {
  order: readonly InvitationSectionKey[];
  variants: Partial<Record<InvitationSectionKey, SectionVariant>>;
  density: "airy" | "balanced" | "ceremonial";
  ornament: OrnamentKey;
};
```

Nguyên tắc:

- Profile chỉ quyết định presentation; section bật/tắt vẫn thuộc `Content` và lựa chọn của chủ thiệp.
- Section bị tắt không được để lại khoảng trắng hoặc nav item.
- Không đổi semantics, validation, submit flow hoặc API theo từng template.
- 20 mẫu cũ dùng `DEFAULT_SECTION_PROFILE`; profile này phải tái tạo chính xác thứ tự và presentation hiện tại, không được dùng để redesign các mẫu cũ.
- Mọi profile/variant/ornament mới chỉ được gán cho 30 mẫu mới. Không đổi catalog row hoặc visual selector A–O của 20 mẫu cũ.

### 3.3 CSS và token

- `.inv-stage` thêm `data-profile`, `data-density`, `data-ornament`; không tạo selector dựa vào id template nếu một variant có thể đặt tên theo nghiệp vụ.
- Mỗi collection có một file, ví dụ `components/templates/covers/heritage.css`; class cover vẫn prefix `cv-<family>-`.
- Màu runtime đi qua `--c-*`/`--tp-*`; palette mới được khai báo tập trung trong `lib/templates.ts` và phải qua test tương phản.
- Texture tự tạo bằng CSS/SVG hoặc asset đã qua allowlist; không dùng base64 khổng lồ trong CSS.
- Motion chỉ dùng cho một khoảnh khắc chính, dừng khi `prefers-reduced-motion: reduce`.

## 4. Bốn section mới

### 4.1 Chuyện tình yêu (`story`)

Mục đích: kể 2–6 cột mốc bằng ngày, tiêu đề, mô tả ngắn và ảnh tùy chọn.

Biến thể đầu tiên:

- `timeline`: đường thời gian dọc, phù hợp traditional/classic.
- `cards`: thẻ ảnh xen kẽ, phù hợp botanical/korean.
- `editorial`: số lớn + caption, phù hợp editorial/minimal.

Yêu cầu: thứ tự thời gian rõ, ảnh có alt, không tạo carousel bắt buộc, nội dung dài không tràn.

### 4.2 Video cưới (`video`)

Mục đích: phát một video do chủ thiệp tải lên hoặc URL HTTPS được hỗ trợ.

Yêu cầu:

- Poster bắt buộc khi có video; không autoplay có âm thanh.
- Native controls, caption/title dễ hiểu và fallback link nếu trình duyệt không phát được.
- Chỉ tải media khi gần viewport; preview Studio không tự phát.
- Upload nhận MP4 (`video/mp4`) hoặc WebM (`video/webm`), tối đa 50 MiB; poster đi qua pipeline nén ảnh hiện có.
- Mở rộng uploader hiện có bằng `UploadKind = "image" | "audio" | "video"`; không tạo pipeline upload thứ hai.

### 4.3 Trang phục (`dressCode`)

Mục đích: mô tả mức độ trang trọng, ghi chú và 1–5 swatch màu gợi ý.

Yêu cầu:

- Màu luôn đi cùng nhãn chữ; không truyền đạt dress code chỉ bằng swatch.
- Có thể tắt hoàn toàn.
- Copy mặc định trung tính, không áp đặt giới tính hay màu trang phục nếu chủ thiệp không nhập.

### 4.4 Địa điểm mở rộng (`venue`)

Mục đích: tách thông tin địa điểm khỏi card sự kiện để có ảnh venue, ghi chú di chuyển/đỗ xe và CTA chỉ đường rõ hơn.

Yêu cầu:

- Dữ liệu nguồn vẫn là event; không tạo địa chỉ thứ hai có thể lệch.
- Dùng URL bản đồ hợp lệ qua `lib/maps.ts`; không nhúng tracker bên thứ ba mặc định.
- Biến thể `card`, `editorial` và `illustrated` dùng chung semantics.

## 5. Danh sách 30 mẫu

Mỗi mẫu có một signature khác biệt, nhưng section body dùng shared variants. Tên và slug dưới đây là tên chốt cho implementation plan.

### Đợt 1 — Di sản Việt tái hiện

| Family | Tên mẫu | Signature | Cụm refs chính |
|---|---|---|---|
| `lacquer-seal` | Ấn Son | Mặt sơn mài, triện tròn và chữ tên dập chìm | Song Hỷ đỏ, Long Phụng V3 |
| `phoenix-fold` | Phụng Vũ | Hai cánh phụng tạo thành nếp gấp mở vào ảnh | Song Phụng, Long Phụng V2 |
| `lotus-scroll` | Liên Hoa | Cuộn giấy dọc với sen nét mảnh và lịch âm | Liên Hoa V2, Tơ Duyên |
| `porcelain-blue` | Lam Sứ | Khung men lam, họa tiết sứ tự vẽ và nền giấy sáng | Lâu Đài Lam, nhóm Regal Promise |
| `silk-knot` | Tơ Hồng | Dải lụa liên tục nối tên, ngày và địa điểm | Tơ Duyên đỏ/xanh |

### Đợt 2 — Vườn hoa và địa điểm

| Family | Tên mẫu | Signature | Cụm refs chính |
|---|---|---|---|
| `glasshouse` | Vườn Kính | Cửa kính hình vòm với lớp lá trong suốt | Vườn Kính Hồng |
| `white-orchid` | Mai Lan | Cành hoa trắng, khoảng thở lớn, tên nhỏ tinh tế | Mai Lan Trắng, Pure Elegance |
| `pressed-garden` | Vườn Ép Hoa | Herbarium bất đối xứng như hoa ép trên giấy | Hoa Mộc, Vườn Xuân |
| `venue-sketch` | Nơi Mình Hẹn | Minh họa line-art địa điểm làm hero | Venue-inspired refs, New Home |
| `midnight-bloom` | Dạ Hoa | Nền tối, hoa chạy viền và ảnh như cửa sổ đêm | Amber Noir, Starlit Garden |

### Đợt 3 — Editorial ảnh cưới

| Family | Tên mẫu | Signature | Cụm refs chính |
|---|---|---|---|
| `cinema-bleed` | Khung Điện Ảnh | Ảnh full-bleed, credit line và crop điện ảnh | Modern Vow, One Journey |
| `mono-contact` | Phòng Tối | Contact sheet đen trắng và dấu ngày màu son | Café Beginning, Fated Chapter |
| `split-portrait` | Song Ảnh | Hai chân dung chia tỷ lệ 40/60, tên chạy dọc | Hearts Aligned, Memorable Vow |
| `gallery-notes` | Ghi Chú Bên Ảnh | Collage ảnh kèm caption viết tay ngắn | Tender Memories, Love Journey |
| `fashion-grid` | Tạp Chí Cưới | Lưới fashion editorial, headline serif tương phản | Modern Heirloom, Timeless Love |

### Đợt 4 — Quiet luxury

| Family | Tên mẫu | Signature | Cụm refs chính |
|---|---|---|---|
| `ivory-letterpress` | Dập Nổi Ngà | Chữ nổi mô phỏng letterpress, một dấu monogram | Pure Elegance, Graceful Date |
| `velvet-frame` | Nhung Đêm | Khung nhung tối, chỉ vàng mảnh và ảnh nhỏ | Golden Soirée, Amber Noir |
| `champagne-line` | Sâm Panh | Đường line vàng chạy xuyên toàn bộ composition | Radiant Love, Regal Promise |
| `pearl-arch` | Ngọc Trai | Chuỗi chấm ngọc tạo vòm, nền sáng gần đơn sắc | Beautiful Ending, Lovely Date |
| `stone-window` | Thạch Vân | Mảng đá loang tiết chế và ô ảnh hình học | Modern Heirloom, Found You |

### Đợt 5 — Kỷ vật và câu chuyện

| Family | Tên mẫu | Signature | Cụm refs chính |
|---|---|---|---|
| `story-journal` | Nhật Ký Đôi Mình | Trang nhật ký đánh dấu các cột mốc | Story Continues, Café Beginning |
| `route-map` | Chung Một Hành Trình | Đường tuyến nối nơi gặp, cầu hôn và ngày cưới | One Journey, Cherished Journey |
| `cafe-card` | Quán Quen | Menu/café card thanh lịch, không giả biên lai | Café Beginning |
| `calendar-mark` | Ngày Mình Chọn | Lịch tháng là hero, ngày cưới được khoanh tay | Special Days, Radiant Love |
| `heirloom-album` | Gia Bảo | Album gia đình với khung ảnh và chú thích | Modern Heirloom, Kindred Hearts |

### Đợt 6 — Đương đại giàu cá tính

| Family | Tên mẫu | Signature | Cụm refs chính |
|---|---|---|---|
| `kinetic-type` | Chữ Chuyển Nhịp | Typography cỡ lớn chuyển nhịp một lần khi mở | Trend typography 2026, Modern Vow |
| `color-block` | Khối Hỷ | Mảng màu bão hòa cắt giấy, không dùng gradient | Lovely Date, các cover coral |
| `chibi-story` | Chúng Mình | Minh họa đôi tự tạo/được cấp phép và bong bóng kể chuyện | Chibi Red |
| `paper-cut` | Cắt Giấy | Layer giấy cắt tạo chiều sâu quanh tên và ngày | nhóm botanical/illustrated |
| `constellation` | Duyên Tinh Tú | Chòm sao tùy ngày cưới, nối bằng line mảnh | Starlit Garden |

## 6. Asset pipeline

### 6.1 Nguyên tắc quyền sử dụng

Việc asset đã nằm trong `refs/` không tự động chứng minh quyền tái sử dụng. Mỗi asset muốn ship phải có một trong các trạng thái:

- `owned`: do chủ dự án cung cấp và xác nhận sở hữu.
- `licensed`: có license cho phép dùng trong sản phẩm.
- `original`: do đội dự án tự vẽ/tạo.
- `reference-only`: chỉ dùng phân tích, tuyệt đối không copy sang `public/`.

Asset không có trạng thái hợp lệ mặc định là `reference-only`.

### 6.2 Manifest và thư mục

- Tạo `lib/template-assets.ts` chứa metadata runtime cần thiết.
- Tạo `docs/design/template-asset-audit.md` ghi nguồn, tác giả/license, trạng thái và mẫu sử dụng.
- Asset được duyệt đặt tại `public/templates/<family>/`, tên semantic và không giữ hash scraper.
- Ảnh raster chuyển WebP/AVIF phù hợp; SVG được rà script/external reference trước khi đưa vào repo.
- Không import trực tiếp từ `refs/` trong production code.

### 6.3 Fallback

Mỗi cover phải vẫn có composition hoàn chỉnh khi thiếu ảnh/illustration:

- Ảnh người dùng trống: hiện drop-zone chuẩn của Studio hoặc sample hợp lệ trong showcase.
- Ornament chưa được duyệt: dùng CSS/SVG nguyên bản tương đương, không chặn cả batch.
- Font tham khảo không có license: thay bằng font hiện có hoặc font mở đã audit.

## 7. Schema và tương thích dữ liệu

Thêm content version mới nhưng vẫn đọc được dữ liệu v1:

- `story: { enabled; items[] }` với tối đa 6 item.
- `video: { enabled; url; posterUrl; title }`.
- `dressCode: { enabled; title; note; colors[] }` với tối đa 5 màu.
- Event bổ sung tùy chọn `venuePhoto`, `directionsNote`, `parkingNote`; địa chỉ/map hiện có là nguồn chính.
- `sections` thêm `story`, `video`, `dressCode`, `venue`.

`normalizeContent()` chịu trách nhiệm điền mặc định cho payload v1. Không migration phá hủy, không yêu cầu người dùng cũ mở và lưu lại thiệp. `persistable()` tiếp tục loại URL đang gõ dở để autosave không bị chặn.

Thay đổi schema phải cập nhật đồng bộ:

- Zod schema, fixture/sample content và test.
- Studio outline, progress/missing reason và panel chỉnh sửa.
- Supabase JSON validation hoặc API contract liên quan nếu đang áp dụng.
- i18n VI/EN cho label, empty state và trang khách.

## 8. Studio và trải nghiệm chỉnh sửa

- Bốn section mới xuất hiện trong outline đúng nhóm: Story/Video ở “Ảnh & câu chuyện”, Dress code/Venue ở “Thông tin chính”.
- Mỗi section có toggle, trạng thái hoàn thành và preview anchor.
- Reorder không mở cho người dùng ở phase này; thứ tự đến từ template profile để giữ chất lượng thiết kế.
- Đổi template không làm mất nội dung section mới; chỉ thay profile/variant.
- Trường màu dress code dùng input màu có nhãn text; story item có nút thêm/xóa/reorder bằng keyboard.
- Video upload dùng chung primitive upload và trạng thái progress/error hiện có, không tạo uploader riêng trong panel.

## 9. Accessibility, responsive và motion

- Native section/heading hierarchy; không đặt chữ quan trọng trong `aria-hidden` ornament.
- Text contrast tối thiểu 4.5:1; chữ display lớn tối thiểu 3:1 nhưng ưu tiên 4.5:1 khi có thể.
- Keyboard focus rõ cho tất cả CTA, form, lightbox, video và reorder controls.
- Không dùng hover làm cách duy nhất để thấy hành động.
- Cover co giãn bằng container units nhưng phải có min/max để tên dài tiếng Việt không vỡ bố cục.
- 390px không tràn ngang; 200% zoom vẫn đọc và thao tác được.
- Reduced motion tắt kinetic text, parallax, marquee và entrance choreography; nội dung vẫn xuất hiện ngay.

## 10. Hiệu năng

- Cover component không state; không thêm thư viện animation mới.
- Chỉ preload hero cần thiết; album, video và ảnh section dưới fold lazy-load.
- Mỗi batch đo bundle của `/templates` và `/templates/[id]`; batch 3 và 6 có budget review bắt buộc.
- Ornament SVG dùng sprite/component nhỏ hoặc file riêng cache được; không render hàng trăm node trang trí.
- Gallery vẫn render thumbnail bằng `ThiepPreview`, không mount toàn bộ `InvitationRenderer` cho 50 card.

## 11. Kiểm thử và nghiệm thu

### 11.1 Tự động

- Registry: đủ 50 mẫu, 30 family mới, renderer/profile/metadata/asset manifest khớp hoàn toàn.
- Schema: parse v1, normalize sang shape mới, giới hạn item và URL/MIME không hợp lệ.
- Profile: mọi order không trùng section, chứa `cover`, không chứa key lạ.
- SEO: id/name/description duy nhất và đúng giới hạn hiện có.
- Palette: tất cả cặp chữ/nền được dùng đạt ngưỡng tương phản.
- Rendering: mỗi shared section variant có state bật/tắt, rỗng, nội dung dài và media lỗi.
- Design-system guard: không có raw hex hoặc native dialog ngoài nơi được phép.

### 11.2 Browser QA mỗi batch

Chỉ chạy một lượt cuối batch theo quy ước repo:

- `/templates`, năm trang chi tiết mới, preview Studio và một trang khách fixture.
- Viewport 390px và 1280px; thêm kiểm 200% zoom cho ít nhất một mẫu mỗi collection.
- Không console error/warning, ảnh hỏng hoặc horizontal overflow.
- Keyboard đi được qua CTA, form, video, lightbox; reduced-motion không còn animation trang trí.
- So sánh một sibling cũ để xác nhận không regression.

### 11.3 Cổng duyệt

Triển khai 6 đợt × 5 mẫu. Sau mỗi đợt:

1. Gate `npm run typecheck && npm test && npm run build:next` xanh.
2. Browser QA xanh.
3. Chủ dự án duyệt năm mẫu trên `/templates`.
4. Chỉ sau khi duyệt mới sang đợt tiếp theo.

## 12. Ngoài phạm vi

- Không sửa hoặc redesign 20 mẫu cũ. Chúng là baseline bất biến của phase này.
- Không cho người dùng tự kéo thả thứ tự section trong phase này.
- Không thêm thanh toán, gói premium hoặc watermark.
- Không tự động tạo chibi/illustration bằng AI trong flow người dùng.
- Không copy nguyên bố cục, copywriting, branding hoặc asset chưa rõ license từ website tham khảo.
- Không triển khai gửi SMS/Zalo/email hàng loạt.

## 13. Rủi ro và giảm thiểu

- **Bản quyền asset:** manifest + audit gate; mặc định reference-only.
- **Phạm vi quá lớn:** shared variants, sáu batch và cổng duyệt; không tạo 30 body renderer.
- **Schema làm hỏng thiệp cũ:** normalize v1, fixture hồi quy và không destructive migration.
- **Bundle tăng:** CSS chia collection, media lazy, đo bundle ở batch 3/6.
- **30 mẫu vẫn giống nhau:** mỗi mẫu bắt buộc có signature test bằng visual review thumbnail và cover matrix.
- **Tên dài/dữ liệu thật phá layout:** fixture tên/địa chỉ dài, ảnh thiếu, section tắt và nội dung song ngữ.
- **Plan cũ chứa quyết định trái spec mới:** implementation plan phải được viết lại, không vá nối các task cover-only cũ.

## 14. Tiêu chí hoàn thành toàn bộ phase

- 50 mẫu production-ready; 30 mẫu mới chia đều sáu collection đã chốt.
- Bốn section mới chỉnh sửa được trong Studio, render được trên trang khách và có VI/EN.
- Mỗi template mới có cover, profile, metadata, SEO, palette, sample và asset audit đầy đủ.
- 20 mẫu cũ và invitation v1 không regression; registry snapshot, DOM order và browser visual smoke của các mẫu đại diện phải khớp baseline trước phase.
- Toàn bộ gate tự động và browser QA xanh; không còn asset production ở trạng thái chưa rõ quyền sử dụng.
- `DESIGN.md`, `PROGRESS.md`, tài liệu hướng dẫn thêm template và con số marketing được cập nhật theo catalog 50 mẫu.
