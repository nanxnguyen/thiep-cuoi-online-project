# 30 mẫu thiệp mới từ bộ tham khảo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Giữ nguyên 20 mẫu hiện tại và bổ sung đúng 30 visual identity hoàn toàn mới để nâng catalog từ 20 lên 50, thêm section profile cho 30 mẫu mới và bổ sung Story, Video, Dress Code, Venue mà không làm hỏng thiệp v1.

**Architecture:** Đóng băng catalog và visual output của 20 mẫu cũ, đồng thời giữ một `InvitationRenderer` và một bộ shared section. Mỗi mẫu mới có cover component riêng và toàn trang được phối bằng `SectionProfile`; content v1 được nâng trong `normalizeContent()` sang content v2, còn asset chỉ được ship qua manifest đã audit.

**Tech Stack:** Next.js 16.3 App Router, React 19.1, TypeScript 5.8, Zod 4.6, Supabase Storage, CSS container units, Node 22 `node:test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-04-thirty-new-templates-design.md`

## Global Constraints

- Kết quả cuối có đúng 50 template: 20 cũ không đổi id, tên, metadata/SEO, family, archetype, palette, sample, cover, thumbnail, thứ tự section hoặc giao diện mặc định; 30 mới có family riêng.
- Profile/variant/ornament mới chỉ gán cho 30 mẫu mới; visual selector A–O và catalog row của 20 mẫu cũ là baseline bất biến.
- Giao theo 6 đợt × 5 mẫu; gate và chủ dự án duyệt xong một đợt mới sang đợt tiếp theo.
- Không tạo 30 full-page renderer. `InvitationRenderer` và shared sections là owner duy nhất của hành vi.
- Asset trong `refs/` mặc định là `reference-only`; chỉ `owned`, `licensed` hoặc `original` được chép vào `public/templates/`.
- Không import production trực tiếp từ `refs/`; không giữ tên file hash của scraper.
- Không thêm dependency frontend hoặc animation mới.
- Không hex thô ngoài `app/styles/tokens.css` và palette registry hiện có; mọi cặp chữ/nền phải đạt WCAG AA.
- Video chỉ nhận MP4/WebM, tối đa 50 MiB; không autoplay có âm thanh; poster đi qua pipeline ảnh.
- Ảnh, album và video dưới fold lazy-load; gallery 50 card chỉ mount `ThiepPreview`.
- Mọi motion trang trí phải có nhánh `prefers-reduced-motion: reduce`.
- Mọi thay đổi Next.js phải đọc guide liên quan trong `node_modules/next/dist/docs/` trước khi code; task video đọc `01-app/02-guides/videos.md`, task CSS đọc `01-app/01-getting-started/11-css.md`.
- `lib/*.ts` được test trực tiếp phải dùng TypeScript erasable và import tương đối có đuôi `.ts`.
- Gate tự động của mỗi task: test đích → `npm run typecheck` → `npm test`; `npm run build:next` ở cuối mỗi task lớn và cuối mỗi batch.
- Agent không chạy `git commit`; bước Commit chỉ đưa đúng lệnh cho chủ dự án.
- Sau mỗi task/batch, cập nhật bảng trạng thái, nhật ký và mục “▶ BẮT ĐẦU” trong `PROGRESS.md`.

## Review Focus

1. **Payload v1 đang tồn tại:** `normalizeContent()` phải trả content v2 đầy đủ, không đổi dữ liệu cặp đôi/sự kiện; Task 2 thêm test fixture v1.
2. **Profile có section bị tắt hoặc dữ liệu rỗng:** renderer không để khoảng trắng/nav item và không đổi thứ tự phần còn lại; Task 5 thêm test resolver.
3. **Video giả MIME, quá 50 MiB hoặc URL đang gõ dở:** client và server cùng từ chối, autosave không kẹt; Task 3 thêm test magic-byte/size/persistable.
4. **Asset chưa rõ quyền sử dụng:** build/test phải fail nếu asset production không có trạng thái hợp lệ; Task 1 thêm manifest audit test.
5. **Tên, địa chỉ, VI/EN dài và media thiếu:** cover/section không tràn ngang ở 390px, fallback vẫn đọc được; Tasks 5–11 dùng fixture stress và QA browser.

Baseline bắt buộc: trước Task 1, lưu registry snapshot và ảnh browser đại diện của 20 mẫu hiện tại; mọi batch phải chạy regression để chứng minh 20 mẫu cũ không đổi.

---

## File Structure

### Tạo

- `lib/covers.ts` — registry family mới đang active và metadata cover thuần.
- `lib/section-profiles.ts` — section key, variants, sáu profile và resolver thứ tự.
- `lib/template-assets.ts` — manifest asset production và kiểm tra trạng thái quyền sử dụng.
- `docs/design/template-asset-audit.md` — provenance/license của asset theo family.
- `components/templates/covers/types.ts` — `CoverProps`, `CoverRenderer`.
- `components/templates/covers/index.ts` — `coverRenderers` exhaustive theo family active.
- `components/templates/covers/{heritage,garden,editorial,quiet-luxury,story,expressive}.css` — CSS theo collection.
- `components/templates/covers/<family>.tsx` × 30 — một cover/một file.
- `components/invitation/section-renderer.tsx` — map profile order sang shared sections.
- `components/invitation/sections/{Story,Video,DressCode,Venue}.tsx` — bốn section mới.
- `components/studio/panels/{StoryPanel,VideoPanel,DressCodePanel,VenuePanel}.tsx` — editor riêng, `SectionForm` chỉ dispatch.
- `tests/{covers,section-profiles,template-assets}.test.ts` — invariant registry/profile/asset.

### Sửa

- `lib/content.ts` — content v2, upgrade v1, limits và defaults.
- `lib/templates.ts` — `CoverFamily`, profile key, 30 catalog rows/palettes/samples.
- `lib/editor-sections.ts` — outline, toggle, missing reason và progress cho section mới.
- `lib/i18n.ts` — nhãn VI/EN của bốn section.
- `lib/api.ts`, `lib/server/media.ts`, `app/api/invitations/[id]/media/route.ts` — media kind video và limit 50 MiB.
- `components/studio/panels/useUploader.ts`, `MediaPanel.tsx`, `SectionForm.tsx`, `panels.css` — upload/edit section mới.
- `components/templates/ThiepPreview.tsx`, `PreviewDemo.tsx`, `thiep-preview.css` — dispatch cover mới.
- `components/invitation/InvitationRenderer.tsx`, `invitation.css` — profile-driven render và style shared variants.
- `tests/{content,editor-sections,media-route,templates,demo,i18n,design-system}.test.ts` — hồi quy.
- `DESIGN.md`, `PROGRESS.md`, `CLAUDE.md`, `Guide-convert-html-design-to-code.md`, `lib/seo.ts` — tài liệu và số lượng cuối phase.

---

### Task 1: Asset gate và section-profile foundation

**Deliverable:** Hạ tầng profile/asset chạy với 20 mẫu cũ, chưa thêm template mới và registry/visual output của 20 mẫu vẫn khớp baseline.

**Files:**

- Create: `lib/section-profiles.ts`
- Create: `lib/template-assets.ts`
- Create: `docs/design/template-asset-audit.md`
- Create: `tests/section-profiles.test.ts`
- Create: `tests/template-assets.test.ts`
- Modify: `lib/templates.ts`
- Modify: `tests/templates.test.ts`

**Interfaces:**

- Produces: `InvitationSectionKey`, `SectionVariants`, `SectionProfileKey`, `SectionProfile`, `DEFAULT_SECTION_PROFILE`, `SECTION_PROFILES`, `resolveSectionOrder(profile, isEnabled)`.
- Produces: `AssetStatus = "owned" | "licensed" | "original" | "reference-only"`, `TemplateAsset`, `TEMPLATE_ASSETS`, `productionAssets()`.
- `Template` adds `profile: SectionProfileKey`; all 20 legacy entries use `"default"`.

```ts
type SectionVariants = {
  story: "timeline" | "cards" | "editorial";
  venue: "card" | "editorial" | "illustrated";
  album: "grid" | "masonry" | "filmstrip";
  dressCode: "swatches" | "text";
};
type SectionProfile = {
  order: readonly InvitationSectionKey[];
  variants: SectionVariants;
  density: "airy" | "balanced" | "ceremonial";
  ornament: "none" | "heritage" | "garden" | "editorial" | "luxury" | "story" | "expressive";
};
type TemplateAsset = {
  path: `/templates/${string}`;
  family: string;
  source: string;
  status: AssetStatus;
  licenseNote: string;
};
```

`productionAssets(): TemplateAsset[]` chỉ trả `owned|licensed|original` và throw nếu manifest có entry production không hợp lệ.

- [ ] **Step 0: Chốt baseline bất biến của 20 mẫu hiện tại**

Trong `tests/templates.test.ts`, lưu snapshot có chủ đích cho 20 catalog row hiện tại gồm id, name, family, archetype, palette, sample và SEO. Chụp browser baseline 390px/1280px cho ít nhất một mẫu thuộc mỗi archetype hiện có; không cập nhật baseline để hợp thức hóa diff trong phase này.

- [ ] **Step 1: Viết test thất bại cho profile mặc định**

`tests/section-profiles.test.ts` phải assert:

```ts
assert.deepEqual(DEFAULT_SECTION_PROFILE.order, [
  "cover", "couple", "family", "events", "venue", "schedule", "countdown",
  "dressCode", "story", "album", "video", "rsvp", "guestbook", "gift", "thanks",
]);
assert.equal(new Set(DEFAULT_SECTION_PROFILE.order).size, DEFAULT_SECTION_PROFILE.order.length);
for (const template of templates) assert.ok(SECTION_PROFILES[template.profile]);
```

- [ ] **Step 2: Viết test thất bại cho asset gate**

`tests/template-assets.test.ts` phải reject production path dưới `public/templates/` nếu status là `reference-only`, thiếu `source`, hoặc thiếu `licenseNote` với status `licensed`.

- [ ] **Step 3: Chạy test đỏ**

Run: `node --test tests/section-profiles.test.ts tests/template-assets.test.ts`

Expected: FAIL vì hai module chưa tồn tại.

- [ ] **Step 4: Tạo profile types và sáu profile đã chốt**

`SECTION_PROFILES` có đúng bảy key:

| Key | Density | Story | Venue | Album |
|---|---|---|---|---|
| `default` | balanced | timeline | card | grid |
| `heritage` | ceremonial | timeline | illustrated | grid |
| `garden` | airy | cards | illustrated | masonry |
| `editorial-photo` | balanced | editorial | editorial | masonry |
| `quiet-luxury` | airy | timeline | card | grid |
| `story-led` | balanced | cards | editorial | filmstrip |
| `expressive` | balanced | editorial | illustrated | masonry |

Mỗi order chứa mọi `InvitationSectionKey` đúng một lần; `resolveSectionOrder` loại section tắt nhưng giữ thứ tự ổn định.

Order chính xác:

```ts
default: ["cover", "couple", "family", "events", "venue", "schedule", "countdown", "dressCode", "story", "album", "video", "rsvp", "guestbook", "gift", "thanks"];
heritage: ["cover", "family", "couple", "events", "venue", "countdown", "schedule", "dressCode", "story", "album", "video", "rsvp", "guestbook", "gift", "thanks"];
garden: ["cover", "couple", "family", "story", "events", "venue", "countdown", "album", "dressCode", "video", "rsvp", "gift", "guestbook", "thanks", "schedule"];
"editorial-photo": ["cover", "couple", "events", "countdown", "story", "album", "video", "venue", "dressCode", "family", "schedule", "rsvp", "gift", "guestbook", "thanks"];
"quiet-luxury": ["cover", "family", "couple", "events", "venue", "countdown", "dressCode", "album", "story", "video", "schedule", "rsvp", "gift", "guestbook", "thanks"];
"story-led": ["cover", "story", "couple", "family", "events", "venue", "countdown", "schedule", "album", "video", "dressCode", "rsvp", "guestbook", "gift", "thanks"];
expressive: ["cover", "couple", "story", "family", "events", "schedule", "countdown", "album", "video", "venue", "dressCode", "rsvp", "guestbook", "gift", "thanks"];
```

Signature resolver: `resolveSectionOrder(profile: SectionProfile, isEnabled: (key: InvitationSectionKey) => boolean): InvitationSectionKey[]`.

- [ ] **Step 5: Tạo manifest rỗng an toàn và audit doc**

`TEMPLATE_ASSETS` ban đầu là `[]`; audit doc ghi 51 snapshot là `reference-only` theo mặc định và mô tả ba trạng thái có thể ship.

- [ ] **Step 6: Thêm `profile: "default"` cho 20 template**

Giữ nguyên tuyệt đối id, name, family, archetype, palette, sample, SEO và visual selector của 20 mẫu; test snapshot ở Step 0 phải tiếp tục xanh.

- [ ] **Step 7: Chạy gate**

Run: `node --test tests/section-profiles.test.ts tests/template-assets.test.ts tests/templates.test.ts && npm run typecheck && npm test && npm run build:next`

Expected: PASS; catalog vẫn 20 và snapshot registry của 20 mẫu không đổi.

- [ ] **Step 8: Cập nhật PROGRESS và handoff commit**

```bash
git add lib/section-profiles.ts lib/template-assets.ts lib/templates.ts tests/section-profiles.test.ts tests/template-assets.test.ts tests/templates.test.ts docs/design/template-asset-audit.md PROGRESS.md
git commit -m "feat: add invitation profile and template asset contracts"
```

---

### Task 2: Content v2 và nâng cấp dữ liệu v1

**Deliverable:** Content v2 chứa Story, Video, Dress Code và Venue; mọi payload v1 hợp lệ được nâng tự động.

**Files:**

- Modify: `lib/content.ts`
- Modify: `tests/content.test.ts`
- Modify: fixtures trong tests đang chứa `v: 1`

**Interfaces:**

- Produces: `legacyContentV1Schema`, `contentV2Schema`, `contentSchema`, `Content`, `upgradeV1(input)`, `normalizeContent(input)`.
- Constants: `MAX_STORY_ITEMS = 6`, `MAX_DRESS_COLORS = 5`, `MAX_VIDEO_URL = 500`.
- `Content` output luôn có `v: 2`.

Content mới:

```ts
story: { enabled: boolean; items: { id: string; date: string; title: string; body: string; photo: string; alt: string }[] };
video: { enabled: boolean; url: string; posterUrl: string; title: string };
dressCode: { enabled: boolean; title: string; note: string; colors: { value: string; label: string }[] };
events[n]: EventV1 & { venuePhoto: string; directionsNote: string; parkingNote: string };
```

Giới hạn field: story `date 40`, `title 100`, `body 500`, `photo URL 500`, `alt 120`; video `url/posterUrl 500`, `title 120`; dress code `title 80`, `note 300`, mỗi label `40`; venue `venuePhoto URL 500`, `directionsNote 300`, `parkingNote 300`.

`sections` thêm `story`, `video`, `dressCode`, `venue`; defaults của cả bốn là `false`. `upgradeV1` giữ nguyên mọi field cũ và điền object/field mới rỗng.

- [ ] **Step 1: Chụp fixture v1 hồi quy trong test**

Assert tên, event, album, RSVP, gift và `sections` cũ giữ nguyên sau normalize; assert output `v === 2` và bốn section mới tắt.

- [ ] **Step 2: Viết test validation v2**

Cover các trường hợp: 7 story item, 6 dress color, màu không theo `^#[0-9a-fA-F]{6}$`, video URL không HTTPS/public storage, title/body vượt giới hạn và event note dài.

- [ ] **Step 3: Chạy test đỏ**

Run: `node --test tests/content.test.ts`

Expected: FAIL vì schema chỉ nhận `v: 1`.

- [ ] **Step 4: Tách schema v1 và định nghĩa schema v2**

Giữ schema v1 byte-compatible; `contentSchema` nhận v1/v2 nhưng transform về v2. `defaultContent()` và `sampleContent()` trả v2.

- [ ] **Step 5: Đồng bộ canonical toggle**

Trong normalize, `story.enabled`, `video.enabled`, `dressCode.enabled` được mirror sang `sections.*`; mọi mutation Studio về sau phải cập nhật cả hai trong cùng object update. `venue` chỉ dùng `sections.venue` vì dữ liệu nằm trong event.

- [ ] **Step 6: Kiểm tra persistable**

Thêm test URL video/poster/venuePhoto đang gõ dở bị xóa khỏi payload persistable nhưng draft gốc không bị mutate.

- [ ] **Step 7: Mở rộng publish validation**

`publishIssues()` báo lỗi khi section đang bật nhưng thiếu dữ liệu tối thiểu: Story chưa có item hoàn chỉnh; Video thiếu URL hoặc poster; Dress Code thiếu title hoặc label màu; Venue thiếu reception venue/address. Draft vẫn cho phép các field rỗng để autosave.

- [ ] **Step 8: Chạy gate**

Run: `node --test tests/content.test.ts && npm run typecheck && npm test && npm run build:next`

Expected: PASS.

- [ ] **Step 9: Cập nhật PROGRESS và handoff commit**

```bash
git add lib/content.ts tests PROGRESS.md
git commit -m "feat: add backward-compatible invitation content v2"
```

---

### Task 3: Video upload end-to-end

**Deliverable:** Studio/API/Storage nhận MP4 hoặc WebM tối đa 50 MiB và từ chối file giả MIME bằng magic bytes.

**Files:**

- Modify: `lib/server/media.ts`
- Modify: `lib/api.ts`
- Modify: `app/api/invitations/[id]/media/route.ts`
- Modify: `components/studio/panels/useUploader.ts`
- Modify: `tests/media-route.test.ts`
- Modify: `tests/api.test.ts`

**Interfaces:**

- `MediaKind = "image" | "audio" | "video"` ở server và client.
- `VIDEO_MAX_BYTES = 50 * 1024 * 1024`.
- `UPLOAD_REQUEST_MAX_BYTES = VIDEO_MAX_BYTES + 256 * 1024`.
- `detectMedia("video", bytes)` trả `{ extension: "mp4" | "webm"; contentType: "video/mp4" | "video/webm" }`.

- [ ] **Step 1: Đọc Next.js video guide hiện tại**

Read: `node_modules/next/dist/docs/01-app/02-guides/videos.md`.

- [ ] **Step 2: Viết test server thất bại**

Test MP4 có `ftyp`, WebM có EBML header, MIME giả, file rỗng, 50 MiB + 1 byte và request content-length vượt budget.

- [ ] **Step 3: Chạy test đỏ**

Run: `node --test tests/media-route.test.ts tests/api.test.ts`

Expected: FAIL vì `video` chưa thuộc `MediaKind`.

- [ ] **Step 4: Mở rộng media detection và route**

Không tin `File.type`; xác định MP4/WebM từ bytes như image/audio hiện tại. Giữ access check, rate limit và public URL flow hiện có.

- [ ] **Step 5: Mở rộng client uploader**

`useUploader.uploadFiles(files, "video", onUrl)` kiểm extension/MIME và 50 MiB trước khi gọi API; error copy nêu đúng định dạng/dung lượng.

- [ ] **Step 6: Chạy gate**

Run: `node --test tests/media-route.test.ts tests/api.test.ts && npm run typecheck && npm test && npm run build:next`

Expected: PASS.

- [ ] **Step 7: Cập nhật PROGRESS và handoff commit**

```bash
git add lib/server/media.ts lib/api.ts app/api/invitations/[id]/media/route.ts components/studio/panels/useUploader.ts tests/media-route.test.ts tests/api.test.ts PROGRESS.md
git commit -m "feat: support validated wedding video uploads"
```

---

### Task 4: Studio editors cho bốn section mới

**Deliverable:** Outline có bốn mục mới; người dùng thêm/sửa/xóa dữ liệu, toggle và upload media bằng bàn phím.

**Files:**

- Create: `components/studio/panels/StoryPanel.tsx`
- Create: `components/studio/panels/VideoPanel.tsx`
- Create: `components/studio/panels/DressCodePanel.tsx`
- Create: `components/studio/panels/VenuePanel.tsx`
- Modify: `components/studio/SectionForm.tsx`
- Modify: `components/studio/panels.css`
- Modify: `lib/editor-sections.ts`
- Modify: `tests/editor-sections.test.ts`
- Modify: `tests/design-system.test.ts`

**Interfaces:**

- Mỗi panel nhận `PanelProps`; panel có upload nhận thêm `media: MediaProps`.
- `StoryPanel`: add/move/remove tối đa 6 item, dùng `newId`, `move`, `removeAt`, `updateAt`.
- `VideoPanel`: một video + poster, URL HTTPS hoặc upload; không autoplay preview.
- `DressCodePanel`: tối đa 5 `{ value, label }`; color input luôn kèm text label.
- `VenuePanel`: sửa `venuePhoto`, `directionsNote`, `parkingNote` trên reception event duy nhất.

- [ ] **Step 1: Viết test outline/progress thất bại**

Assert `SECTIONS` có `venue`, `story`, `dressCode`, `video`; optional toggle đúng; missing reason lần lượt là thiếu story item, video URL/poster, dress-code title/label và venue/address.

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test tests/editor-sections.test.ts`

Expected: FAIL vì key chưa tồn tại.

- [ ] **Step 3: Mở rộng outline**

Vị trí:

- “Thông tin chính”: `venue`, `dressCode` sau `countdown`.
- Đổi “Ảnh & âm nhạc” thành “Câu chuyện & media”: `story`, `album`, `video`, `music`.

`toggleOn()` cập nhật đồng thời object.enabled và `sections.*` cho story/video/dressCode.

- [ ] **Step 4: Tạo bốn panel tập trung**

Giữ `SectionForm` là dispatcher. Không nhét bốn form dài trực tiếp vào switch; mỗi case chỉ render panel tương ứng.

- [ ] **Step 5: Thêm trạng thái upload/validation accessible**

Video input `accept=".mp4,.webm,video/mp4,video/webm"`; poster dùng image uploader. Mỗi lỗi nằm inline và trong live region hiện có.

- [ ] **Step 6: Chạy gate**

Run: `node --test tests/editor-sections.test.ts tests/design-system.test.ts && npm run typecheck && npm test && npm run build:next`

Expected: PASS.

- [ ] **Step 7: Cập nhật PROGRESS và handoff commit**

```bash
git add components/studio lib/editor-sections.ts tests/editor-sections.test.ts tests/design-system.test.ts PROGRESS.md
git commit -m "feat: add story video dress code and venue editors"
```

---

### Task 5: Shared sections và profile-driven renderer

**Deliverable:** Bốn section mới render được và profile đổi thứ tự/variant cho 30 mẫu mới; 20 mẫu cũ giữ nguyên thứ tự, DOM và giao diện mặc định.

**Files:**

- Create: `components/invitation/section-renderer.tsx`
- Create: `components/invitation/sections/Story.tsx`
- Create: `components/invitation/sections/Video.tsx`
- Create: `components/invitation/sections/DressCode.tsx`
- Create: `components/invitation/sections/Venue.tsx`
- Modify: `components/invitation/InvitationRenderer.tsx`
- Modify: `components/invitation/invitation.css`
- Modify: `lib/i18n.ts`
- Modify: `tests/section-profiles.test.ts`
- Modify: `tests/i18n.test.ts`
- Modify: `tests/design-system.test.ts`

**Interfaces:**

- `SectionRenderContext = { content; template; mode; slug?; invitationId?; guestName; guestToken; wishes; now; locale; showcase }`.
- `renderInvitationSection(key: InvitationSectionKey, ctx: SectionRenderContext): ReactNode`.
- Bốn component mới nhận `{ content, variant, locale }`; Video nhận thêm `preview`.

- [ ] **Step 1: Viết test resolver cho disabled/empty profile**

Assert section tắt bị loại, order còn lại ổn định, default profile trả đúng thứ tự legacy và key không xác định không thể compile. Thêm fixture cho 20 mẫu cũ để khẳng định profile đều là `default` và không nhận variant/ornament mới.

- [ ] **Step 2: Viết test i18n thất bại**

Thêm VI/EN cho story, video, dress code, venue, directions, parking, video fallback và empty copy.

- [ ] **Step 3: Chạy test đỏ**

Run: `node --test tests/section-profiles.test.ts tests/i18n.test.ts`

Expected: FAIL vì resolver/render labels chưa đủ.

- [ ] **Step 4: Tạo shared sections**

Story render ba variant không carousel; Video dùng `<video controls preload="metadata" poster>` và fallback link; DressCode hiện label cạnh swatch; Venue lấy reception event và CTA map qua `lib/maps.ts`.

- [ ] **Step 5: Refactor renderer theo profile**

Envelope, view tracker, language toggle và shell giữ nguyên vị trí/hành vi. Bên trong `<main>`, map `resolveSectionOrder(SECTION_PROFILES[template.profile], content)` qua `renderInvitationSection`.

- [ ] **Step 6: Thêm data attributes và shared variant CSS**

`.inv-stage` nhận `data-profile`, `data-density`, `data-ornament`. CSS giữ layout ổn định khi media lỗi, nội dung dài hoặc section tắt.

- [ ] **Step 7: Chạy gate**

Run: `node --test tests/section-profiles.test.ts tests/i18n.test.ts tests/design-system.test.ts && npm run typecheck && npm test && npm run build:next`

Expected: PASS; 20 mẫu cũ render cùng order và registry snapshot vẫn khớp baseline.

- [ ] **Step 8: Browser smoke một lần cho hạ tầng**

Kiểm `/templates/song-hy`, `/templates/net-muc`, một mẫu đại diện cho mỗi archetype cũ và một preview Studio ở 390px/1280px: không overflow, không console error, section cũ đúng thứ tự và ảnh so sánh không có visual diff ngoài ngưỡng chống nhiễu đã chốt.

- [ ] **Step 9: Cập nhật PROGRESS và handoff commit**

```bash
git add components/invitation lib/i18n.ts lib/section-profiles.ts tests PROGRESS.md
git commit -m "feat: render invitation sections from template profiles"
```

---

### Task 6: Cover infrastructure và Đợt 1 — Di sản Việt tái hiện (20 → 25)

**Deliverable:** Registry cover mới hoạt động end-to-end; năm mẫu heritage được duyệt.

**Files:**

- Create: `lib/covers.ts`
- Create: `components/templates/covers/types.ts`
- Create: `components/templates/covers/index.ts`
- Create: `components/templates/covers/heritage.css`
- Create: `components/templates/covers/{ink-wash,phoenix-fold,lotus-scroll,porcelain-blue,silk-knot}.tsx`
- Create: `tests/covers.test.ts`
- Modify: `lib/templates.ts`, `lib/section-profiles.ts`, `lib/template-assets.ts`
- Modify: `components/templates/ThiepPreview.tsx`, `PreviewDemo.tsx`
- Modify: `tests/templates.test.ts`, `tests/demo.test.ts`

**Interfaces:**

- `NEW_FAMILIES` chứa các family đã active; sau task này có 5 key.
- `NewCoverFamily = (typeof NEW_FAMILIES)[number]`.
- `CoverProps` chứa `a`, `b`, `date`, `dm`, `year`, `day`, `month`, `weekday`, `place`, `slot`.
- `coverRenderers: Record<NewCoverFamily, CoverRenderer>`.
- `familyMeta: Record<NewCoverFamily, { label; layout; photos; dark; profile; ornament }>`.

```ts
type CoverProps = {
  a: string; b: string; date: string; dm: string; year: string;
  day: string; month: string; weekday: string; place: string;
  slot: (index: 0 | 1 | 2, caption: string, circle?: boolean) => ReactNode;
};
type CoverRenderer = (props: CoverProps) => ReactNode;
```

Catalog chính xác:

| id | name | family | archetype | profile | colors |
|---|---|---|---|---|---|
| `muc-loang` | Mực Loang | `ink-wash` | traditional | heritage | `muc,dodam,xanh` |
| `phung-vu` | Phụng Vũ | `phoenix-fold` | traditional | heritage | `do,dodam,lam` |
| `lien-hoa` | Liên Hoa | `lotus-scroll` | traditional | heritage | `xanh,hong,nau` |
| `lam-su` | Lam Sứ | `porcelain-blue` | classic | heritage | `lam,muc,xanh` |
| `to-hong` | Tơ Hồng | `silk-knot` | classic | heritage | `do,hong,dodam` |

- [ ] **Step 1: Viết test đỏ cho cover contract**

Assert mỗi family active có đúng một renderer, metadata, profile, sample, layout/photos và đúng một template; catalog sau task là 25.

- [ ] **Step 2: Chạy test đỏ**

Run: `node --test tests/covers.test.ts tests/templates.test.ts tests/demo.test.ts`

Expected: FAIL vì registry chưa tồn tại.

- [ ] **Step 3: Tạo registry và dispatch**

Nhánh `isNewFamily(f)` trong `ThiepPreview` render registry; A–O giữ nguyên. Import `heritage.css` từ covers index.

- [ ] **Step 4: Dựng năm cover theo signature spec**

Một risk có chủ đích mỗi mẫu:

- Mực Loang: vệt mực loang và vòng cọ quanh ảnh tròn, con dấu đỏ nhỏ; không dùng ảnh/hoạ tiết từ refs.
- Phụng Vũ: hai cánh gấp mở vào một ảnh; phoenix là SVG original.
- Liên Hoa: cuộn dọc + sen line-art, lịch âm là dữ liệu thật từ event.
- Lam Sứ: viền men lam tự vẽ, không copy pattern ref.
- Tơ Hồng: một dải lụa CSS/SVG nối tên-ngày-địa điểm.

- [ ] **Step 5: Thêm catalog/sample/SEO và asset audit**

SEO mỗi mẫu 100–161 ký tự, không bịa tính năng. Ornament original được ghi manifest; asset ref vẫn `reference-only`.

- [ ] **Step 6: Chạy gate batch**

Run: `node --test tests/covers.test.ts tests/templates.test.ts tests/demo.test.ts && npm run typecheck && npm test && npm run build:next`

Expected: PASS; 25 templates, 20 legacy + 5 new.

- [ ] **Step 7: Browser QA và cổng duyệt**

Kiểm `/templates` và năm route mới ở 390px/1280px, stress tên/địa chỉ dài, reduced motion, ảnh trống; lưu ảnh QA dưới `.playwright-mcp/`. Dừng chờ chủ dự án duyệt Đợt 1.

- [ ] **Step 8: Cập nhật PROGRESS và handoff commit**

```bash
git add lib/covers.ts lib/templates.ts lib/section-profiles.ts lib/template-assets.ts components/templates tests docs/design/template-asset-audit.md PROGRESS.md
git commit -m "feat: add five modern Vietnamese heritage templates"
```

---

### Task 7: Đợt 2 — Vườn hoa và địa điểm (25 → 30)

**Deliverable:** Năm mẫu garden active, không copy watercolor/ornament từ refs.

**Files:**

- Create: `components/templates/covers/garden.css`
- Create: `components/templates/covers/{glasshouse,white-orchid,pressed-garden,venue-sketch,midnight-bloom}.tsx`
- Modify: registries, catalog, tests, asset audit và `PROGRESS.md` như Task 6.

**Catalog:**

| id | name | family | archetype | profile | colors |
|---|---|---|---|---|---|
| `vuon-kinh` | Vườn Kính | `glasshouse` | botanical | garden | `hong,xanh,oliu` |
| `mai-lan` | Mai Lan | `white-orchid` | minimal | garden | `muc,xanh,nau` |
| `vuon-ep-hoa` | Vườn Ép Hoa | `pressed-garden` | botanical | garden | `xanh,cam,hong` |
| `noi-minh-hen` | Nơi Mình Hẹn | `venue-sketch` | classic | garden | `nau,lam,oliu` |
| `da-hoa` | Dạ Hoa | `midnight-bloom` | botanical | garden | `muc,dodam,tim` |

- [ ] **Step 1: Mở rộng test expected count lên 30 và thêm năm family**
- [ ] **Step 2: Chạy test đỏ; typecheck phải báo thiếu renderer**
- [ ] **Step 3: Dựng cover + CSS** — vòm kính; cành lan trắng; herbarium; venue line-art; hoa đêm. Mỗi mẫu chỉ có một signature.
- [ ] **Step 4: Thêm metadata/catalog/sample/SEO/asset provenance**
- [ ] **Step 5: Chạy `node --test tests/covers.test.ts tests/templates.test.ts && npm run typecheck && npm test && npm run build:next`**
- [ ] **Step 6: Browser QA 390/1280 + 200% zoom cho Mai Lan; dừng chờ duyệt Đợt 2**
- [ ] **Step 7: Cập nhật PROGRESS và handoff commit**

```bash
git add lib components/templates tests docs/design/template-asset-audit.md PROGRESS.md
git commit -m "feat: add five botanical and venue-led templates"
```

---

### Task 8: Đợt 3 — Editorial ảnh cưới (30 → 35)

**Deliverable:** Năm cover photo-led xử lý ảnh thiếu và crop khác tỷ lệ an toàn.

**Files:**

- Create: `components/templates/covers/editorial.css`
- Create: `components/templates/covers/{edge-invite,mono-contact,split-portrait,pennant,duotone-script}.tsx`
- Modify: registries, catalog, tests, asset audit và `PROGRESS.md`.

**Catalog:**

| id | name | family | archetype | profile | colors |
|---|---|---|---|---|---|
| `thu-doc` | Thư Dọc | `edge-invite` | editorial | editorial-photo | `muc,lam,xanh` |
| `phong-toi` | Phòng Tối | `mono-contact` | editorial | editorial-photo | `muc,do,nau` |
| `song-anh` | Song Ảnh | `split-portrait` | editorial | editorial-photo | `lam,muc,hong` |
| `co-hieu` | Cờ Hiệu | `pennant` | korean | editorial-photo | `hong,do,xanh` |
| `sac-doi` | Sắc Đôi | `duotone-script` | editorial | editorial-photo | `dodam,lam,nau` |

- [ ] **Step 1: Mở rộng test count lên 35; thêm fixture ảnh 1/2/3 bị thiếu**
- [ ] **Step 2: Chạy test đỏ**
- [ ] **Step 3: Dựng cover + CSS** — full bleed cinematic; contact sheet mono; split 40/60; collage caption; fashion grid.
- [ ] **Step 4: Thêm catalog/sample/SEO và không đưa ảnh ref vào manifest production**
- [ ] **Step 5: Chạy gate đầy đủ và ghi bundle size `/templates`, `/templates/[id]` làm baseline giữa phase**
- [ ] **Step 6: Browser QA + 200% zoom cho Sắc Đôi; dừng chờ duyệt Đợt 3**
- [ ] **Step 7: Cập nhật PROGRESS và handoff commit**

```bash
git add lib components/templates tests docs/design/template-asset-audit.md PROGRESS.md
git commit -m "feat: add five editorial photo wedding templates"
```

---

### Task 9: Đợt 4 — Quiet luxury (35 → 40)

**Deliverable:** Năm mẫu sang trọng nhờ type/spacing/material, không dựa vào gradient hoặc trang trí dày.

**Files:**

- Create: `components/templates/covers/quiet-luxury.css`
- Create: `components/templates/covers/{floral-monogram,octagon-frame,champagne-line,pearl-arch,rose-cluster}.tsx`
- Modify: registries, catalog, tests, asset audit và `PROGRESS.md`.

**Catalog:**

| id | name | family | archetype | profile | colors |
|---|---|---|---|---|---|
| `hoa-chu` | Hoa Chữ | `floral-monogram` | botanical | quiet-luxury | `nau,xanh,hong` |
| `bat-giac` | Bát Giác | `octagon-frame` | classic | quiet-luxury | `muc,dodam,lam` |
| `sam-panh` | Sâm Panh | `champagne-line` | classic | quiet-luxury | `vang,nau,hong` |
| `ngoc-trai` | Ngọc Trai | `pearl-arch` | minimal | quiet-luxury | `muc,hong,lam` |
| `hong-nhung` | Hồng Nhung | `rose-cluster` | botanical | quiet-luxury | `dodam,tim,muc` |

- [ ] **Step 1: Mở rộng test count lên 40 và contrast assertions cho năm palette**
- [ ] **Step 2: Chạy test đỏ**
- [ ] **Step 3: Dựng cover + CSS** — letterpress bằng shadow/border; velvet frame; line vàng; pearl dots; stone wash bằng CSS/SVG original.
- [ ] **Step 4: Thêm catalog/sample/SEO/asset audit**
- [ ] **Step 5: Chạy gate đầy đủ**
- [ ] **Step 6: Browser QA + 200% zoom cho Hoa Chữ; dừng chờ duyệt Đợt 4**
- [ ] **Step 7: Cập nhật PROGRESS và handoff commit**

```bash
git add lib components/templates tests docs/design/template-asset-audit.md PROGRESS.md
git commit -m "feat: add five quiet luxury wedding templates"
```

---

### Task 10: Đợt 5 — Kỷ vật và câu chuyện (40 → 45)

**Deliverable:** Năm mẫu story-led làm nổi bật section Story mới, không lặp Tem Thư/Vé Hạnh Phúc/Cuộn Phim hiện có.

**Files:**

- Create: `components/templates/covers/story.css`
- Create: `components/templates/covers/{story-journal,route-map,cafe-card,overlap-rings,floating-card}.tsx`
- Modify: registries, catalog, tests, asset audit và `PROGRESS.md`.

**Catalog:**

| id | name | family | archetype | profile | colors |
|---|---|---|---|---|---|
| `nhat-ky-doi-minh` | Nhật Ký Đôi Mình | `story-journal` | korean | story-led | `nau,hong,xanh` |
| `chung-mot-hanh-trinh` | Chung Một Hành Trình | `route-map` | editorial | story-led | `lam,oliu,do` |
| `quan-quen` | Quán Quen | `cafe-card` | classic | story-led | `nau,cam,muc` |
| `giao-diem` | Giao Điểm | `overlap-rings` | minimal | story-led | `xanh,hong,lam` |
| `the-noi` | Thẻ Nổi | `floating-card` | classic | story-led | `dodam,lam,xanh` |

- [ ] **Step 1: Mở rộng test count lên 45 và profile order assertions**
- [ ] **Step 2: Chạy test đỏ**
- [ ] **Step 3: Dựng cover + CSS** — journal; route line; café menu; calendar hero; heirloom album. Không dùng barcode/passport/receipt motif.
- [ ] **Step 4: Thêm catalog/sample/SEO/asset audit**
- [ ] **Step 5: Chạy gate đầy đủ**
- [ ] **Step 6: Browser QA Story rỗng/2/6 item + 200% zoom; dừng chờ duyệt Đợt 5**
- [ ] **Step 7: Cập nhật PROGRESS và handoff commit**

```bash
git add lib components/templates tests docs/design/template-asset-audit.md PROGRESS.md
git commit -m "feat: add five story-led wedding templates"
```

---

### Task 11: Đợt 6 — Đương đại giàu cá tính (45 → 50)

**Deliverable:** Năm mẫu expressive hoàn tất catalog; reduced motion và asset gate vẫn xanh.

**Files:**

- Create: `components/templates/covers/expressive.css`
- Create: `components/templates/covers/{kinetic-type,color-block,chibi-story,paper-cut,constellation}.tsx`
- Modify: registries, catalog, tests, asset audit và `PROGRESS.md`.

**Catalog:**

| id | name | family | archetype | profile | colors |
|---|---|---|---|---|---|
| `chu-chuyen-nhip` | Chữ Chuyển Nhịp | `kinetic-type` | editorial | expressive | `muc,do,lam` |
| `khoi-hy` | Khối Hỷ | `color-block` | editorial | expressive | `do,cam,hong` |
| `chung-minh` | Chúng Mình | `chibi-story` | korean | expressive | `hong,xanh,do` |
| `cat-giay` | Cắt Giấy | `paper-cut` | botanical | expressive | `xanh,hong,lam` |
| `duyen-tinh-tu` | Duyên Tinh Tú | `constellation` | classic | expressive | `muc,lam,tim` |

- [ ] **Step 1: Mở rộng invariant cuối: đúng 50 template, 30 family mới, 30 renderer**
- [ ] **Step 2: Chạy test đỏ**
- [ ] **Step 3: Dựng cover + CSS** — kinetic chạy một lần; color block không gradient; chibi dùng illustration original/licensed; paper-cut bằng layer SVG original; constellation tính từ ngày thật, không bịa sao khi ngày trống.
- [ ] **Step 4: Thêm catalog/sample/SEO/asset audit**
- [ ] **Step 5: Thêm test reduced-motion/static scan cho animation expressive**
- [ ] **Step 6: Chạy gate đầy đủ và so bundle với baseline Task 8**
- [ ] **Step 7: Browser QA + reduced motion + 200% zoom; dừng chờ duyệt Đợt 6**
- [ ] **Step 8: Cập nhật PROGRESS và handoff commit**

```bash
git add lib components/templates tests docs/design/template-asset-audit.md PROGRESS.md
git commit -m "feat: complete catalog with five expressive templates"
```

---

### Task 12: Final integration, documentation và release gate

**Deliverable:** Toàn phase sẵn sàng release; tài liệu/số lượng/SEO đúng 50, không asset mơ hồ, mọi route chính được QA.

**Files:**

- Modify: `DESIGN.md`
- Modify: `PROGRESS.md`
- Modify: `CLAUDE.md`
- Modify: `Guide-convert-html-design-to-code.md`
- Modify: `lib/seo.ts`
- Modify: `tests/seo.test.ts`
- Modify: `tests/design-system.test.ts`
- Modify: `tests/templates.test.ts`
- Modify: `docs/design/template-asset-audit.md`

**Interfaces:** Không thêm runtime interface; task này khóa contract và bằng chứng release.

- [ ] **Step 1: Quét literal count và copy lỗi thời**

Run: `rg -n '16 templates|20 mẫu|Hơn 20|20 templates|A–O' --glob '!docs/superpowers/plans/2026-10-04-thirty-new-templates-plan.md' --glob '!refs/**' .`

Phân loại từng match: lịch sử giữ nguyên; copy/runtime/tài liệu hiện hành đổi thành 50/45 family đúng ngữ cảnh.

- [ ] **Step 2: Cập nhật DESIGN.md và hướng dẫn**

Ghi sáu collection, section profile, asset ownership, token mapping và quy trình thêm family/profile mới. Không ghi refs là nguồn được phép sao chép.

- [ ] **Step 3: Khóa SEO và sitemap**

Assert 50 detail routes trong static params/sitemap, title/description duy nhất, copy marketing “50 mẫu” đúng sự thật.

- [ ] **Step 4: Audit asset cuối**

Mọi file dưới `public/templates/` phải có đúng một manifest entry ở trạng thái `owned|licensed|original`; xóa asset orphan hoặc đổi về implementation CSS/SVG original.

- [ ] **Step 5: Chạy static premium audit**

Read `frontend-design-premium/references/verification-checklist.md`, sau đó chạy:

```bash
python /Users/nguyenanhnhut/.codex/plugins/cache/openai-curated-remote/frontend-design-premium/1.4.0/skills/frontend-design-premium/scripts/audit_project.py . --mode strict
```

Fix mọi blocking finding thuộc phạm vi phase.

- [ ] **Step 6: Chạy full automated gate**

Run: `npm run typecheck && npm test && npm run build:next`

Expected: PASS; tests báo 50 templates/30 new families; build không warning mới.

- [ ] **Step 7: Chạy E2E**

Run tuần tự:

```bash
npm run e2e -- --project=chrome
npm run e2e -- --project=mobile-chrome
npm run e2e -- --project=mobile-safari
```

Expected: PASS.

- [ ] **Step 8: Browser release sweep**

Kiểm `/templates`, đại diện mỗi collection, Studio tạo/chỉnh đủ bốn section, public invitation, VI/EN, video lỗi, ảnh thiếu, section tắt, reduced motion, keyboard, 390px/1280px và Lighthouse mobile. Pass bar: 0 console error/warning, 0 ảnh hỏng, 0 overflow.

- [ ] **Step 9: Chốt PROGRESS và handoff commit**

```bash
git add DESIGN.md PROGRESS.md CLAUDE.md Guide-convert-html-design-to-code.md lib/seo.ts tests docs/design/template-asset-audit.md
git commit -m "docs: finalize fifty-template invitation catalog"
```

---

## Execution Notes

- Task 1–5 là nền tảng tuần tự; không chạy song song vì interface phụ thuộc trực tiếp.
- Task 6–11 cũng tuần tự do mỗi batch có cổng duyệt của chủ dự án và cùng sửa registry/CSS index.
- Trong một batch, năm cover component có thể chia cho năm worker sau khi metadata/profile và test đỏ đã được owner của task khóa.
- Nếu chủ dự án không duyệt một mẫu, chỉ sửa mẫu đó và chạy lại gate/browser QA của batch; không bắt đầu batch kế.
- Nếu asset được xác nhận quyền sử dụng giữa phase, cập nhật audit + manifest trong batch đang dùng; không chép hàng loạt asset chưa có consumer.
