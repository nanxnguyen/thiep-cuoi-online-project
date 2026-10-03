# 30 mẫu thiệp mới (20 → 50) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm 30 mẫu thiệp mới, mỗi mẫu một bố cục cover riêng, đưa catalog từ 20 lên 50 mẫu, giao theo 6 đợt × 5 mẫu.

**Architecture:** Mỗi bố cục mới (family) là một component thuần trong `components/templates/covers/<family>.tsx`, đăng ký qua `Record<NewCoverFamily, CoverRenderer>` (typecheck bắt buộc đủ renderer). Metadata thuần của family (nhãn, mô tả, ảnh mẫu, nền tối) ở `lib/covers.ts` để test Node chạy được. `ThiepPreview` thêm một nhánh dispatch, 15 family cũ không đổi. Thân thiệp (các section sau cover) dùng chung, đổi theo `archetype`.

**Tech Stack:** Next.js 16 / React 19, CSS container units (`cqw`), `node --test` với type-stripping, token `--tp-*` của `ThiepPreview`.

**Spec:** nằm nguyên văn ở Phần 1 của file này (và bản gốc `docs/superpowers/specs/2026-10-04-thirty-new-templates-design.md`).

## Global Constraints
- Không `git commit` bởi agent: quyền bị chặn; cuối mỗi task chỉ in lệnh commit cho chủ dự án chạy. Mọi `Commit` step trong plan nghĩa là "đưa lệnh cho chủ dự án".
- Không hex thô trong `components/` và `app/` ngoài `app/styles/tokens.css` (test `tests/design-system.test.ts` quét cả `.css` và `.tsx`; `components/invitation/` được miễn, `components/templates/` **không**). Màu cover chỉ dùng `var(--tp-deep|paper|gold|tint)`, `rgba(...)`, `currentColor`; trong data-URI SVG dùng `%23`.
- Palette mỗi mẫu: mọi cặp chữ đạt WCAG AA 4.5:1 (`tests/templates.test.ts`). Mẫu nào thêm vào `colors` bắt buộc `ColorKey` có sẵn, **không thêm key màu mới**.
- Font: chỉ `var(--display)` (Playfair), `var(--sans)`, `var(--script)` (Cormorant italic), `var(--hand)` (Great Vibes) và font mono hệ thống `ui-monospace, "SFMono-Regular", Menlo, monospace`. **Không thêm font mới.**
- Hoạ tiết tự vẽ bằng CSS/SVG. Không copy hoa, ảnh, ornament, font từ `refs/`.
- `lib/*.ts` được test import: dùng import tương đối có đuôi `.ts`, không enum, không parameter property, không `@/`.
- Mỗi `seo` duy nhất, 100–161 ký tự (`.length`). Mỗi tên mẫu và id duy nhất. Style trong `templateSamples` chỉ dùng nhãn lọc có sẵn của gallery: `Truyền thống`, `Tối giản`, `Hoa`, `Cổ điển`, `Lãng mạn`, `Hiện đại`.
- Cover phải co giãn theo `cqw`, không tràn ngang ở 390px và 1280px, tôn trọng `prefers-reduced-motion`.
- Quy ước tên: trong `ThiepPreview`, `a` = cô dâu, `b` = chú rể; cover hiển thị chú rể trước (`{b} & {a}`) trừ khi card nói khác.
- Gate mỗi đợt: `npm run typecheck && npm test && npm run build` xanh. Duyệt trình duyệt (Chrome DevTools MCP, 390px và 1280px) chỉ làm **một lần ở cuối mỗi đợt**, theo quy ước repo, không làm từng bước.

---

# Phần 1 — Spec (nguyên văn)

## 30 mẫu thiệp mới (20 → 50) — thiết kế

Ngày: 2026-10-04. Chủ dự án yêu cầu thêm 30 mẫu để catalog đạt 50, hiện đại và ấn tượng hơn, tham khảo `refs/` (51 trang của chungdoi.com và m-invite.com).

## Quyết định đã chốt
- **30 bố cục cover riêng**, mỗi mẫu một family mới (không tái dùng family cũ).
- **6 đợt × 5 mẫu**, chủ dự án duyệt từng đợt trước khi sang đợt sau. Catalog tăng 20 → 25 → … → 50.
- **Kiến trúc A:** mỗi family mới là một file `components/templates/covers/<Family>.tsx`.

## Phạm vi và ngoài phạm vi
Trong: 30 cover, 30 dòng catalog (palette, SEO riêng), CSS riêng từng cover, test, tài liệu.
Ngoài: đổi thân thiệp (các section sau cover) — vẫn dùng chung và đổi theo `archetype`; đổi 20 mẫu cũ; thêm ảnh mẫu mới khi chưa hỏi chủ dự án.

## Tham khảo, không sao chép
`refs/` chỉ cho ý tưởng bố cục, nhịp section, cặp font. Hoa màu nước, ảnh, ornament, font thương mại của các site đó có bản quyền: **không dùng**. Mọi hoạ tiết tự vẽ bằng CSS/SVG.

## Kiến trúc
- `CoverFamily` (lib/templates.ts) hiện là union 15 chữ cái A–O. Giữ nguyên, thêm `NewCoverFamily` là union 30 slug (ví dụ `"monogram"`), và `CoverFamily = LegacyFamily | NewCoverFamily`.
- `ThiepPreview.tsx` thêm một nhánh: nếu family thuộc `NewCoverFamily` thì render component trong `covers/` qua bảng `coverRenderers: Record<NewCoverFamily, (props) => ReactNode>` (`covers/index.ts`). Không động tới 15 family cũ.
- Props cover mới giống props `ThiepPreview` (tên, ngày, nơi, ảnh, palette `--tp-*`), dùng lại `Slot`. Một cover = một file TSX + một khối CSS trong `covers/covers.css` (prefix `cv-<family>-`).
- `familyLayout` (mô tả một dòng cho trang `/templates/[id]`) và `familyPhotos` (ảnh mẫu, tái dùng `public/photos`) thêm mục cho family mới. Bản đồ này vốn dùng cho mọi family, nên kiểu của chúng đổi thành `Record<CoverFamily, …>` đã bao gồm family mới.
- Font: nếu mẫu cần font ngoài bộ hiện có thì thêm vào `lib/fonts.ts` (nạp theo template, tối đa 2 font mỗi mẫu).

## Danh sách 30 mẫu (tên tạm, chốt khi làm từng đợt)
| Đợt | Chủ đề | Family (slug → tên mẫu) |
|---|---|---|
| 1 | Chữ làm nhân vật | monogram → Chữ Lồng · stack → Tên Xếp Chồng · outline → Nét Rỗng · split → Đôi Nửa · marquee → Băng Chữ |
| 2 | Ảnh là chính | bleed → Tràn Viền · window → Cửa Sổ Vòm · collage → Ảnh Dán · diagonal → Chéo Đôi · strip → Dải Dọc |
| 3 | Đồ vật đời thường | receipt → Biên Lai · passport → Hộ Chiếu · matchbox → Hộp Diêm · notebook → Sổ Tay · sticky → Giấy Nhắn |
| 4 | Truyền thống kiểu mới | lantern → Lồng Đèn · bamboo → Trúc Xanh · lotus → Sen Hồng · ceramic → Gốm Men · drum → Trống Đồng |
| 5 | Sang và tinh tế | velvet → Nhung Vàng · marble → Cẩm Thạch · aurora → Cực Quang · glass → Kính Mờ · leaf → Lá Mảnh |
| 6 | Vui và cá tính | chat → Khung Chat · sticker → Dán Sticker · y2k → Y2K · pixel → Điểm Ảnh · pin → Ghim Bản Đồ |

Mỗi mẫu có `archetype` (editorial/minimal/classic/botanical/traditional/korean) và 2–4 `colors` hợp tông; không ép đều mỗi archetype.

## Quy tắc chất lượng
- Không hex thô ngoài `app/styles/tokens.css` / `lib/templates.ts` (test `design-system` giữ nguyên); palette mọi cặp chữ đạt WCAG AA 4.5:1 (test `templates.test.ts`).
- Cover co giãn theo container như các family cũ, không tràn ngang ở 390px và 1280px; tôn trọng `prefers-reduced-motion`.
- Mỗi mẫu có `seo` riêng, duy nhất, 100–161 ký tự, không bịa tính năng.
- Chữ trong cover chỉ là tên, ngày, nơi, và nhãn tĩnh có nghĩa với mẫu (ví dụ "Vé", "Side A"); không số liệu bịa.

## Chỗ phụ thuộc số lượng mẫu (kiểm lại mỗi đợt)
- `tests/templates.test.ts`: số mẫu và số family (hiện cứng 20 và 15). Đổi sang đếm theo catalog thật và thêm kiểm: mỗi `NewCoverFamily` có renderer, `familyLayout`, `familyPhotos`.
- Sitemap, `generateStaticParams`, gallery `/templates`, `/templates/[id]`: đọc từ `templates`, kiểm lại sau mỗi đợt. SEO test độ dài title/description cho 30 trang mới.
- `PROGRESS.md`, `CLAUDE.md` (câu "16 templates"), `DESIGN.md` (family mới không có mockup trong `design/`, như K–O).

## Kiểm chứng mỗi đợt
1. `npm run typecheck && npm test && npm run build` xanh.
2. Một lượt Chrome DevTools MCP ở 390px và 1280px cho `/templates` và trang chi tiết các mẫu mới: 0 lỗi console, không tràn ngang, không ảnh hỏng, đúng font. Không mở trình duyệt từng bước.
3. Chủ dự án duyệt đợt trên `/templates`; chỉ sau đó mới sang đợt kế.

## Rủi ro
- Ảnh mẫu trong `public/photos` có logo studio (đã ghi trong PROGRESS): family mới tái dùng bộ này nên rủi ro bản quyền giữ nguyên, không tăng.
- Số family tăng làm bundle JS của ThiepPreview lớn hơn: mỗi cover là component thuần không state, kiểm kích thước route `/templates` sau đợt 2 và đợt 6.


---

# Phần 2 — File Structure

**Tạo**
- `lib/covers.ts`: `NEW_FAMILIES`, `NewCoverFamily`, `familyMeta` (nhãn, mô tả, ảnh mẫu, nền tối), `isNewFamily`. Dữ liệu thuần, test chạy được.
- `components/templates/covers/types.ts`: `CoverProps`, `CoverRenderer`.
- `components/templates/covers/util.ts`: `initial`, `mrz`.
- `components/templates/covers/index.ts`: `coverRenderers: Record<NewCoverFamily, CoverRenderer>` và `import "./covers.css"`.
- `components/templates/covers/<family>.tsx` × 30 (mỗi file một cover).
- `components/templates/covers/covers.css`: mọi style `cv-<family>-*`, thêm dần theo đợt.
- `tests/covers.test.ts`: test metadata, catalog khớp family, SEO, mẫu.

**Sửa**
- `lib/templates.ts`: `CoverFamily` mở rộng; `familyLayout`/`familyPhotos` gộp metadata mới; `getPalette` nhận biết nền tối của family mới; thêm dòng catalog và `templateSamples` theo đợt.
- `components/templates/ThiepPreview.tsx`: nhánh dispatch `isNewFamily`.
- `components/templates/PreviewDemo.tsx`: `familyLabels` gồm family mới.
- `tests/templates.test.ts`, `tests/demo.test.ts`: bỏ số cứng 20/15.
- `lib/seo.ts` (đợt 6): "Hơn 20 mẫu" → "Hơn 50 mẫu".
- `PROGRESS.md`, `CLAUDE.md`, `DESIGN.md`, `Guide-convert-html-design-to-code.md` (đợt 6 + cuối mỗi đợt cho PROGRESS).

---

# Phần 3 — Tasks

### Task 1: Hạ tầng family mới + cover mẫu Chữ Lồng

Deliverable: catalog 21 mẫu (20 cũ + Chữ Lồng) chạy end-to-end: render ở gallery, trang chi tiết, Studio, demo; tất cả test xanh. Task này khoá mọi hợp đồng mà 29 cover còn lại dùng.

**Files:**
- Create: `lib/covers.ts`, `components/templates/covers/{types.ts,util.ts,index.ts,monogram.tsx,covers.css}`, `tests/covers.test.ts`
- Modify: `lib/templates.ts`, `components/templates/ThiepPreview.tsx`, `components/templates/PreviewDemo.tsx`, `tests/templates.test.ts`, `tests/demo.test.ts`

**Interfaces:**
- Produces:
  - `lib/covers.ts`: `NEW_FAMILIES: readonly [...]`, `type NewCoverFamily`, `type FamilyMeta = { label: string; layout: string; photos: string[]; dark: boolean }`, `familyMeta: Record<NewCoverFamily, FamilyMeta>`, `isNewFamily(f: string): f is NewCoverFamily`.
  - `components/templates/covers/types.ts`: `CoverProps = { a: string; b: string; date: string; dm: string; year: string; day: string; month: string; weekday: string; place: string; slot: (index: 0 | 1 | 2, caption: string, circle?: boolean) => ReactNode }`, `CoverRenderer = (p: CoverProps) => ReactNode`.
  - `components/templates/covers/util.ts`: `initial(s: string): string`, `mrz(s: string): string`.
  - `lib/templates.ts`: `type CoverFamily = LegacyFamily | NewCoverFamily`.

- [ ] **Step 1: Viết test thất bại cho metadata và catalog**

Tạo `tests/covers.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { NEW_FAMILIES, familyMeta, isNewFamily } from "../lib/covers.ts";
import { templates, templateSamples, familyLayout, familyPhotos, getPalette } from "../lib/templates.ts";

test("every new family has complete metadata", () => {
  for (const f of NEW_FAMILIES) {
    const m = familyMeta[f];
    assert.ok(m, f);
    assert.ok(m.label.length > 0 && m.layout.length > 20, f);
    assert.ok(m.photos.length >= 1 && m.photos.every((p) => /^\/photos\/[a-z0-9-]+\.jpg$/.test(p)), f);
  }
});

test("isNewFamily separates legacy letters from new slugs", () => {
  assert.equal(isNewFamily("A"), false);
  assert.equal(isNewFamily("monogram"), true);
  assert.equal(isNewFamily("nope"), false);
});

test("each new family is used by exactly one template, and legacy families by none of the new ones", () => {
  for (const f of NEW_FAMILIES) {
    const users = templates.filter((t) => t.family === f);
    assert.equal(users.length, 1, `${f} used by ${users.length} templates`);
  }
});

test("family tables cover every family a template uses", () => {
  for (const t of templates) {
    assert.ok(familyLayout[t.family], `${t.id}: familyLayout`);
    assert.ok(familyPhotos[t.family]?.length, `${t.id}: familyPhotos`);
    assert.ok(templateSamples[t.id], `${t.id}: templateSamples`);
  }
});

test("dark new families use the deep colour as background", async () => {
  const { colors } = await import("../lib/templates.ts");
  for (const t of templates.filter((x) => isNewFamily(x.family))) {
    const deep = colors[t.colors[0]];
    const p = getPalette(t);
    const dark = familyMeta[t.family as keyof typeof familyMeta].dark;
    assert.equal(p.bg, dark ? deep.deep : deep.paper, t.id);
  }
});
```

- [ ] **Step 2: Chạy test, xác nhận thất bại**

Run: `node --test tests/covers.test.ts`
Expected: FAIL — `Cannot find module '../lib/covers.ts'`.

- [ ] **Step 3: Tạo `lib/covers.ts` với đúng một family**

```ts
// Metadata of the cover layouts added after design/Thiep Preview.dc.html (families A–O). Pure data so node --test can
// import it; the matching React components live in components/templates/covers/.
export const NEW_FAMILIES = ["monogram"] as const;
export type NewCoverFamily = (typeof NEW_FAMILIES)[number];
export type FamilyMeta = { label: string; layout: string; photos: string[]; dark: boolean };

const ph = (...names: string[]) => names.map((n) => `/photos/${n}.jpg`);

export const familyMeta: Record<NewCoverFamily, FamilyMeta> = {
  monogram: { label: "Chữ lồng", layout: "Hai chữ cái đầu lồng nhau trong một vòng tròn lớn, không cần ảnh.", photos: ph("han-quoc-toi-gian"), dark: false },
};

export const isNewFamily = (f: string): f is NewCoverFamily => (NEW_FAMILIES as readonly string[]).includes(f);
```

(Các family còn lại thêm dần ở đợt 1–6.)

- [ ] **Step 4: Mở rộng `lib/templates.ts`**

Thêm import và sửa kiểu ở đầu file:

```ts
import { familyMeta, isNewFamily, NEW_FAMILIES, type NewCoverFamily } from "./covers.ts";
```

Đổi dòng `export type CoverFamily = ...` thành:

```ts
export type LegacyFamily = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O";
export type CoverFamily = LegacyFamily | NewCoverFamily;
```

Đổi `familyLayout` và `familyPhotos` để gộp metadata mới (giữ nguyên nội dung cũ làm `legacyLayout`/`legacyPhotos`):

```ts
const legacyLayout: Record<LegacyFamily, string> = { /* nội dung familyLayout cũ, A..O, không đổi */ };
export const familyLayout: Record<CoverFamily, string> = {
  ...legacyLayout,
  ...(Object.fromEntries(NEW_FAMILIES.map((f) => [f, familyMeta[f].layout])) as Record<NewCoverFamily, string>),
};

const legacyPhotos: Record<LegacyFamily, string[]> = { /* nội dung familyPhotos cũ, không đổi */ };
export const familyPhotos: Record<CoverFamily, string[]> = {
  ...legacyPhotos,
  ...(Object.fromEntries(NEW_FAMILIES.map((f) => [f, familyMeta[f].photos])) as Record<NewCoverFamily, string[]>),
};
```

Sửa `getPalette` dòng `const dark = ...`:

```ts
  const dark = ["A", "D", "F", "J", "L"].includes(template.family) || (isNewFamily(template.family) && familyMeta[template.family].dark);
```

Thêm dòng catalog đầu tiên vào mảng `catalog` (sau dòng `lich-bloc`):

```ts
  ["chu-long", "Chữ Lồng", "monogram", "minimal", "Chữ cái lồng · tối giản", ["muc", "dodam", "nau"], undefined, "Mẫu thiệp cưới Chữ Lồng với hai chữ cái đầu của cô dâu chú rể lồng vào nhau thật lớn, tối giản và sang. Tạo thiệp online miễn phí, không cần tài khoản."],
```

và mục vào `templateSamples`:

```ts
  "chu-long": { style: "Tối giản", motif: "Chữ lồng", badge: "MỚI", pop: 70, isNew: true, a: "Minh Anh", b: "Gia Bảo", date: "12 · 12 · 2026", place: "HÀ NỘI" },
```

- [ ] **Step 5: Tạo hợp đồng cover**

`components/templates/covers/types.ts`:

```ts
import type { ReactNode } from "react";

// Everything a cover needs, prepared by ThiepPreview. `slot` renders the family's sample/real photo n (0–2) in the
// shared Slot (empty drop-zone when the invitation has no photo). a = bride, b = groom.
export type CoverProps = {
  a: string;
  b: string;
  date: string;
  dm: string;
  year: string;
  day: string;
  month: string;
  weekday: string;
  place: string;
  slot: (index: 0 | 1 | 2, caption: string, circle?: boolean) => ReactNode;
};
export type CoverRenderer = (p: CoverProps) => ReactNode;
```

`components/templates/covers/util.ts`:

```ts
const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D");

/** First letter of a name, upper-cased with Vietnamese rules ("đức" → "Đ"). */
export const initial = (s: string): string => [...s.trim()][0]?.toLocaleUpperCase("vi") ?? "";

/** Passport-style machine-readable text: A–Z and "<" only, e.g. "Hạ Vy" → "HA<VY". */
export const mrz = (s: string): string => strip(s).toUpperCase().replace(/[^A-Z]+/g, "<").replace(/^<|<$/g, "");
```

`components/templates/covers/monogram.tsx`:

```tsx
import type { CoverRenderer } from "./types";
import { initial } from "./util";

export const Monogram: CoverRenderer = ({ a, b, date, place }) => (
  <div className="cv-monogram">
    <span className="cv-monogram__kicker">SAVE THE DATE</span>
    <div className="cv-monogram__mark" aria-hidden="true">
      <span className="cv-monogram__a">{initial(b)}</span>
      <span className="cv-monogram__b">{initial(a)}</span>
    </div>
    <span className="cv-monogram__name">
      {b} &amp; {a}
    </span>
    <i className="cv-monogram__rule" />
    <span className="cv-monogram__date">{date}</span>
    <span className="cv-monogram__place">{place}</span>
  </div>
);
```

`components/templates/covers/index.ts`:

```ts
import type { NewCoverFamily } from "@/lib/covers";
import type { CoverRenderer } from "./types";
import { Monogram } from "./monogram";
import "./covers.css";

// Record<NewCoverFamily, …>: adding a family to NEW_FAMILIES without a renderer fails typecheck.
export const coverRenderers: Record<NewCoverFamily, CoverRenderer> = {
  monogram: Monogram,
};
```

`components/templates/covers/covers.css`:

```css
/* Covers added after design/Thiep Preview.dc.html. Same rules as thiep-preview.css: sizes in cqw (1% of the card
   width), colours only from --tp-*, no raw hex. */

/* monogram: two initials interlocked in a ring */
.cv-monogram { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5cqw; padding: 12cqw 10cqw; text-align: center; color: var(--tp-deep); }
.cv-monogram__kicker { font-size: 2.6cqw; letter-spacing: .4em; }
.cv-monogram__mark { position: relative; width: 62cqw; height: 62cqw; display: grid; place-items: center; border: 1px solid var(--tp-deep); border-radius: 50%; }
.cv-monogram__a, .cv-monogram__b { grid-area: 1 / 1; font-family: var(--display); font-size: 44cqw; line-height: 1; }
.cv-monogram__a { transform: translateX(-9cqw); }
.cv-monogram__b { transform: translateX(9cqw); color: var(--tp-gold); mix-blend-mode: multiply; }
.cv-monogram__name { font-family: var(--script); font-style: italic; font-size: 8cqw; line-height: 1.1; }
.cv-monogram__rule { width: 14cqw; height: 1px; background: var(--tp-deep); opacity: .4; }
.cv-monogram__date { font-family: var(--display); font-size: 6.5cqw; }
.cv-monogram__place { font-size: 2.4cqw; letter-spacing: .3em; opacity: .75; }
```

- [ ] **Step 6: Nối dispatch vào `ThiepPreview.tsx`**

Thêm import (đầu file):

```tsx
import { isNewFamily } from "@/lib/covers";
import { coverRenderers } from "./covers";
```

Đổi dòng `if (f === "A")` thành khối sau (đổi `if (f === "A")` thành `else if (f === "A")`, thêm nhánh mới ngay trước):

```tsx
  let body: ReactNode = null;
  if (isNewFamily(f))
    body = coverRenderers[f]({
      a,
      b,
      date,
      dm,
      year,
      day: pad(d || 1),
      month: pad(m || 1),
      weekday: Number.isNaN(when.getTime()) ? "" : WEEKDAYS[when.getDay()],
      place,
      slot: (i, caption, circle) => S([ph, ph2, ph3][i], caption, circle),
    });
  else if (f === "A")
```

- [ ] **Step 7: Sửa `PreviewDemo.tsx`**

Đổi khai báo `familyLabels` để gộp nhãn mới:

```tsx
import { NEW_FAMILIES, familyMeta, type NewCoverFamily } from "@/lib/covers";

const legacyLabels = { A: "Song hỷ", B: "Nét mực", /* … giữ nguyên A..O … */ O: "Lịch bloc" };
const familyLabels = {
  ...legacyLabels,
  ...(Object.fromEntries(NEW_FAMILIES.map((f) => [f, familyMeta[f].label])) as Record<NewCoverFamily, string>),
} as Record<CoverFamily, string>;
```

- [ ] **Step 8: Cập nhật hai test cũ không còn đúng**

`tests/templates.test.ts`, thay test đầu tiên:

```ts
test("design catalog has distinct ids and names, and one cover family per new template", () => {
  assert.equal(new Set(templates.map((t) => t.id)).size, templates.length);
  assert.equal(new Set(templates.map((t) => t.name)).size, templates.length);
  assert.deepEqual(templates.slice(0, 3).map((t) => t.name), ["Song Hỷ", "Nét Mực", "Hoa Nhài"]);
  assert.ok(templates.length >= 20);
});
```

`tests/demo.test.ts`, đổi test:

```ts
import { NEW_FAMILIES } from "../lib/covers.ts";

test("demo route is public and covers every invitation family", () => {
  assert.ok(PUBLIC_ROUTES.includes("/demo"));
  const legacy = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"];
  assert.deepEqual([...new Set(templates.map((template) => template.family))].sort(), [...legacy, ...NEW_FAMILIES].sort());
});
```

- [ ] **Step 9: Chạy gate**

Run: `npm run typecheck && npm test && npm run build`
Expected: PASS. Nếu `tests/design-system.test.ts` báo hex trong `covers.css` hoặc `*.tsx`, thay bằng `var(--tp-*)`/`rgba()`.

- [ ] **Step 10: Commit (đưa lệnh cho chủ dự án)**

```bash
git add lib/covers.ts lib/templates.ts components/templates tests
git commit -m "feat: add scaffold for new cover families with Chu Long monogram"
```

---

### Task 2–7: Đợt 1–6

Mỗi đợt dùng chung **quy trình Batch**:

- [ ] **B1. Thêm family vào `lib/covers.ts`**: bổ sung slug vào `NEW_FAMILIES` và các dòng vào `familyMeta` (khối "Metadata" của đợt). Chạy `npm run typecheck`: lỗi `coverRenderers` thiếu key là **mong đợi** (đây là bước đỏ của TDD).
- [ ] **B2. Viết cover**: với mỗi family, tạo `components/templates/covers/<family>.tsx` theo thẻ thiết kế của nó, theo đúng mẫu `monogram.tsx` (một component xuất ra `CoverRenderer`, class `cv-<family>__*`), thêm CSS vào `covers.css` dưới comment `/* <family>: … */`, thêm key vào `coverRenderers`.
- [ ] **B3. Thêm catalog và samples**: dán khối "Catalog" vào mảng `catalog` ở `lib/templates.ts` và khối "Samples" vào `templateSamples`.
- [ ] **B4. Gate**: `npm run typecheck && npm test && npm run build`. Sửa tới xanh (hex thô, seo sai độ dài, tương phản palette).
- [ ] **B5. Duyệt trình duyệt (một lần)**: `npm run build && npx next start -p 3100`, rồi Chrome DevTools MCP một lượt `evaluate_script` qua `/templates` và `/templates/<id>` của 5 mẫu mới ở 390px và 1280px: 0 lỗi console, `scrollWidth <= clientWidth`, không ảnh hỏng. Chụp một ảnh mỗi mẫu lưu vào `.playwright-mcp/` (không đưa vào context) rồi tắt `next start`.
- [ ] **B6. Cổng duyệt**: báo chủ dự án 5 mẫu mới (link `/templates`), **dừng chờ duyệt** trước khi sang đợt sau. Sửa theo góp ý rồi lặp B4–B5 cho phần đã đổi.
- [ ] **B7. Ghi PROGRESS.md**: cập nhật số mẫu, một dòng nhật ký có cách kiểm chứng, mục "▶ BẮT ĐẦU"; xoá dòng lỗi thời trong cùng lần sửa. Đưa lệnh commit cho chủ dự án.

### Task 2: Đợt 1 — Chữ làm nhân vật (catalog 20 → 25)

Chạy quy trình Batch (B1–B7) ở trên. Chữ Lồng (`monogram`) đã làm ở Task 1; đợt này làm 4 family còn lại. Family đợt này: `monogram` (Chữ Lồng), `stack` (Tên Xếp Chồng), `outline` (Nét Rỗng), `split` (Đôi Nửa), `marquee` (Băng Chữ).

**Files:** Create `components/templates/covers/{stack,outline,split,marquee}.tsx`; Modify `lib/covers.ts`, `lib/templates.ts`, `components/templates/covers/{index.ts,covers.css}`.

**B1 — Metadata** (dán vào `familyMeta`; thêm slug vào `NEW_FAMILIES`: "stack", "outline", "split", "marquee"):

```ts
  stack: { label: "Tên xếp chồng", layout: "Tên hai người xếp chồng thành khối chữ cực lớn, dấu & nhỏ ở giữa.", photos: ph("han-quoc-toi-gian"), dark: false },
  outline: { label: "Nét rỗng", layout: "Tên khổng lồ dạng chữ rỗng chỉ có nét viền, năm cưới đặc ở dưới.", photos: ph("han-quoc-toi-gian"), dark: false },
  split: { label: "Đôi nửa", layout: "Màn hình chia dọc: nửa ảnh cưới, nửa nền đậm với chữ xoay dọc.", photos: ph("vest-xanh-navy"), dark: false },
  marquee: { label: "Băng chữ", layout: "Ba dải chữ nghiêng lặp tên và ngày, ảnh tròn nằm ở giữa.", photos: ph("vuon-bong-bong"), dark: true },
```

**B2 — Thẻ thiết kế từng cover** (mỗi cover là một component `CoverRenderer` theo mẫu `monogram.tsx`, class `cv-<family>__*`):

#### `stack` — Tên Xếp Chồng
- DOM: `.cv-stack` (flex column, căn trái, padding `12cqw 9cqw`) → `__top` (năm, cỡ `2.6cqw`, tracking `.35em`, căn phải) → `__line` ×2 (tên chú rể rồi tên cô dâu: `font-family: var(--display)`, `font-size: 21cqw`, `line-height: .86`, `letter-spacing: -.03em`) với `__amp` giữa (`var(--script)` italic, `13cqw`, màu `--tp-gold`) → `__date` + `__place` ở đáy (`margin-top: auto`).
- Không ảnh. Nền `--tp-paper`, chữ `--tp-deep`.
- Tên dài: `.tp-root [class*="__name"]` đã có wrap-safety; đặt class `cv-stack__name` cho cả hai dòng tên.

#### `outline` — Nét Rỗng
- DOM: `.cv-outline` (flex column, `justify-content: space-between`, padding `11cqw 8cqw`) → `__kicker` → `__name` ×2 → `__year` → `__place`.
- `__name`: `font-family: var(--display)`, `font-size: 19cqw`, `line-height: .9`, `color: transparent`, `-webkit-text-stroke: .35cqw var(--tp-deep)`. Văn bản thật vẫn nằm trong DOM nên đọc màn hình được.
- `__year`: `font-size: 30cqw`, chữ đặc `--tp-deep`, đè lên cạnh dưới (`margin-bottom: -4cqw`).

#### `split` — Đôi Nửa
- DOM: `.cv-split` (grid 2 cột `1fr 1fr`, `position:absolute; inset:0`) → `__photo` (slot 0, cột trái, `position:relative`) + `__panel` (cột phải, nền `--tp-deep`, chữ `--tp-paper`).
- `__panel` chứa `__name` ×2 với `writing-mode: vertical-rl; transform: rotate(180deg)`, `font-size: 9cqw`, và `__date` ngang ở đáy.
- Ảnh trống: `Slot` đã có khung rỗng, không cần xử lý riêng.

#### `marquee` — Băng Chữ
- DOM: `.cv-marquee` → `__photo` (slot 0, tròn 42cqw, căn giữa, `z-index: 2`) và ba `__band` (nghiêng `-8deg`, rộng `140%`, `font-size: 6cqw`, tracking `.2em`), xen kẽ nền `--tp-deep` / `--tp-gold`.
- Mỗi band lặp chuỗi `{b} · {date} · {a} ·` bốn lần, `white-space: nowrap`. Dải chuyển động bằng `@keyframes cv-marquee { to { transform: translateX(-25%) } }` 18s linear infinite, tắt trong `@media (prefers-reduced-motion: reduce)`.
- Chữ trên band gold dùng `--tp-deep` để đạt tương phản; chữ trên band deep dùng `--tp-paper`.

**B3 — Catalog** (dán vào mảng `catalog`, sau dòng cuối hiện có):

```ts
  ["ten-xep-chong", "Tên Xếp Chồng", "stack", "editorial", "Tên khổng lồ · đậm nét", ["do", "muc", "lam"], undefined, "Mẫu thiệp cưới Tên Xếp Chồng: tên cô dâu và chú rể xếp thành khối chữ lớn, nhìn là nhớ ngay. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
  ["net-rong", "Nét Rỗng", "outline", "editorial", "Chữ viền rỗng · gọn gàng", ["muc", "xanh", "hong"], undefined, "Mẫu thiệp cưới Nét Rỗng với chữ viền rỗng cỡ lớn trên nền phẳng, hiện đại và gọn gàng. Tạo thiệp cưới online miễn phí, chia sẻ bằng một đường link."],
  ["doi-nua", "Đôi Nửa", "split", "editorial", "Chia đôi · ảnh và chữ", ["lam", "nau", "dodam"], undefined, "Mẫu thiệp cưới Đôi Nửa chia đôi màn hình: một nửa ảnh cưới, một nửa chữ, cân đối và đương đại. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["bang-chu", "Băng Chữ", "marquee", "editorial", "Dải chữ chạy · trẻ trung", ["muc", "cam", "hong"], undefined, "Mẫu thiệp cưới Băng Chữ với dải chữ chạy ngang tên và ngày cưới, năng động và trẻ trung. Tạo thiệp cưới online miễn phí, gửi khách bằng link riêng."],
```

**B3 — Samples** (dán vào `templateSamples`):

```ts
  "ten-xep-chong": { style: "Hiện đại", motif: "Chữ xếp chồng", badge: "MỚI", pop: 77, isNew: true, a: "Thuỳ Dương", b: "Hoàng Việt", date: "05 · 12 · 2026", place: "SÀI GÒN" },
  "net-rong": { style: "Hiện đại", motif: "Chữ rỗng", badge: "MỚI", pop: 84, isNew: true, a: "Bích Ngọc", b: "Đăng Khoa", date: "19 · 12 · 2026", place: "ĐÀ NẴNG" },
  "doi-nua": { style: "Hiện đại", motif: "Chia đôi", badge: "MỚI", pop: 91, isNew: true, a: "Khánh Vy", b: "Tuấn Anh", date: "26 · 12 · 2026", place: "HẢI PHÒNG" },
  "bang-chu": { style: "Hiện đại", motif: "Dải chữ", badge: "MỚI", pop: 72, isNew: true, a: "Mai Chi", b: "Hải Đăng", date: "03 · 01 · 2027", place: "HUẾ" },
```

**B4–B7:** như quy trình Batch. Sau đợt này `templates.length` phải là 25.

### Task 3: Đợt 2 — Ảnh là chính (catalog 25 → 30)

Chạy quy trình Batch (B1–B7) ở trên. Family đợt này: `bleed` (Tràn Viền), `window` (Cửa Sổ Vòm), `collage` (Ảnh Dán), `diagonal` (Chéo Đôi), `strip` (Dải Dọc).

**Files:** Create `components/templates/covers/{bleed,window,collage,diagonal,strip}.tsx`; Modify `lib/covers.ts`, `lib/templates.ts`, `components/templates/covers/{index.ts,covers.css}`.

**B1 — Metadata** (dán vào `familyMeta`; thêm slug vào `NEW_FAMILIES`: "bleed", "window", "collage", "diagonal", "strip"):

```ts
  bleed: { label: "Tràn viền", layout: "Ảnh cưới phủ kín màn hình, chữ nổi trên lớp phủ tối phía dưới.", photos: ph("nang-chieu"), dark: true },
  window: { label: "Cửa sổ vòm", layout: "Ảnh cưới sau khung cửa sổ vòm có chấn song, bệ cửa và rèm hai bên.", photos: ph("cua-so-vom"), dark: false },
  collage: { label: "Ảnh dán", layout: "Ba ảnh nghiêng chồng nhau như dán trong album, có băng dính.", photos: ph("o-hoa", "sofa-han-quoc", "vuon-xanh"), dark: false },
  diagonal: { label: "Chéo đôi", layout: "Hai ảnh cắt theo đường chéo, mỗi bên một người, đường chéo vàng ở giữa.", photos: ph("vest-xanh-navy", "o-hoa"), dark: false },
  strip: { label: "Dải dọc", layout: "Dải ảnh cao bên trái, cột chữ bên phải với năm cưới xoay dọc.", photos: ph("vuon-xanh"), dark: false },
```

**B2 — Thẻ thiết kế từng cover** (mỗi cover là một component `CoverRenderer` theo mẫu `monogram.tsx`, class `cv-<family>__*`):

#### `bleed` — Tràn Viền
- DOM: `.cv-bleed` (nền `--tp-deep`) → `__photo` (slot 0, `position:absolute; inset:0`) → `__shade` (`linear-gradient(to top, rgba(0,0,0,.7), transparent 58%)`) → `__text` (đáy, padding `10cqw 8cqw`, chữ `--tp-paper`).
- `__text`: `__kicker` (WE ARE GETTING MARRIED, `2.6cqw`), `__name` (display `11cqw`), `__date`, `__place`.
- Khi ảnh trống, lớp nền `--tp-deep` giữ chữ đọc được.

#### `window` — Cửa Sổ Vòm
- DOM: `.cv-window` (nền `--tp-paper`) → `__frame` (`width: 62cqw; height: 88cqw; border-radius: 31cqw 31cqw 0 0; border: 1.6cqw solid var(--tp-deep)`) chứa `__photo` (slot 0) và `__bars` (hai đường mảnh thập tự bằng `linear-gradient` nền) → `__sill` (bệ cửa, thanh rộng `72cqw` cao `3cqw`) → hai `__curtain` SVG hai bên (path cong, `fill: var(--tp-tint)`, `stroke: var(--tp-deep)`).
- Tên bằng `var(--script)` italic `9cqw` dưới bệ, ngày bên dưới.

#### `collage` — Ảnh Dán
- DOM: `.cv-collage` → ba `__card` (slot 0/1/2) có viền paper `2.2cqw`, `box-shadow` nhẹ, xoay `-6deg`, `4deg`, `-2deg`, vị trí so le; hai `__tape` (hình chữ nhật mờ `rgba(255,255,255,.55)`, xoay) kẹp mép trên.
- Tên `var(--hand)` `13cqw` ở dưới, ngày và nơi nhỏ. Nền `--tp-tint`.
- Thiếu ảnh 2 hoặc 3: `ThiepPreview` đã truyền `ph2`/`ph3` mặc định bằng ảnh 1.

#### `diagonal` — Chéo Đôi
- DOM: `.cv-diagonal` → `__half--a` (slot 0, `clip-path: polygon(0 0, 100% 0, 0 100%)`) và `__half--b` (slot 1, `clip-path: polygon(100% 0, 100% 100%, 0 100%)`) cùng `position:absolute; inset:0` → `__line` (đường chéo gold bằng `linear-gradient` 1px) → `__nameA` góc dưới trái, `__nameB` góc trên phải (`display`, `8cqw`, chữ có `text-shadow` rgba) → `__date` giữa đáy.
- Ảnh trống: hai nửa dùng `--tp-tint` và `--tp-deep` để phân biệt.

#### `strip` — Dải Dọc
- DOM: `.cv-strip` (grid `38cqw 1fr`) → `__photo` (slot 0, full height) + `__col` (padding `12cqw 7cqw`, flex column, `justify-content: space-between`) chứa `__year` (`writing-mode: vertical-rl`, `22cqw`, display, `--tp-gold`), `__name` ×2 (`9cqw`), `__rule`, `__date`, `__place`.

**B3 — Catalog** (dán vào mảng `catalog`, sau dòng cuối hiện có):

```ts
  ["tran-vien", "Tràn Viền", "bleed", "editorial", "Ảnh tràn màn hình", ["muc", "dodam", "xanh"], undefined, "Mẫu thiệp cưới Tràn Viền dùng ảnh cưới phủ kín màn hình, chữ trắng nổi bật phía dưới. Tạo thiệp cưới online miễn phí, không cần tài khoản, sửa ảnh dễ dàng."],
  ["cua-so-vom", "Cửa Sổ Vòm", "window", "classic", "Cửa sổ vòm · thanh lịch", ["nau", "lam", "oliu"], undefined, "Mẫu thiệp cưới Cửa Sổ Vòm đặt ảnh cưới trong khung cửa sổ vòm như nhìn ra một ngày đẹp. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
  ["anh-dan", "Ảnh Dán", "collage", "korean", "Album dán · ấm áp", ["hong", "nau", "xanh"], undefined, "Mẫu thiệp cưới Ảnh Dán xếp nhiều ảnh nghiêng như dán trong cuốn album, ấm áp và gần gũi. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["cheo-doi", "Chéo Đôi", "diagonal", "editorial", "Cắt chéo · cô dâu chú rể", ["muc", "lam", "do"], undefined, "Mẫu thiệp cưới Chéo Đôi cắt ảnh theo đường chéo, một bên cô dâu một bên chú rể, mạnh và hiện đại. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["dai-doc", "Dải Dọc", "strip", "minimal", "Dải ảnh dọc · tạp chí", ["muc", "oliu", "hong"], undefined, "Mẫu thiệp cưới Dải Dọc với dải ảnh dài chạy dọc cạnh tên và ngày cưới, gọn như trang tạp chí. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
```

**B3 — Samples** (dán vào `templateSamples`):

```ts
  "tran-vien": { style: "Hiện đại", motif: "Ảnh tràn viền", badge: "MỚI", pop: 79, isNew: true, a: "Hà My", b: "Quốc Bảo", date: "10 · 01 · 2027", place: "VŨNG TÀU" },
  "cua-so-vom": { style: "Cổ điển", motif: "Cửa sổ", badge: "MỚI", pop: 86, isNew: true, a: "Diễm Quỳnh", b: "Anh Tú", date: "17 · 01 · 2027", place: "ĐÀ LẠT" },
  "anh-dan": { style: "Lãng mạn", motif: "Ảnh dán", badge: "MỚI", pop: 93, isNew: true, a: "Phương Linh", b: "Nhật Minh", date: "24 · 01 · 2027", place: "HỘI AN" },
  "cheo-doi": { style: "Hiện đại", motif: "Cắt chéo", badge: "MỚI", pop: 74, isNew: true, a: "Ngọc Trâm", b: "Đức Thịnh", date: "31 · 01 · 2027", place: "NHA TRANG" },
  "dai-doc": { style: "Tối giản", motif: "Dải ảnh", badge: "MỚI", pop: 81, isNew: true, a: "Thanh Thảo", b: "Việt Hoàng", date: "07 · 02 · 2027", place: "CẦN THƠ" },
```

**B4–B7:** như quy trình Batch. Sau đợt này `templates.length` phải là 30.

### Task 4: Đợt 3 — Đồ vật đời thường (catalog 30 → 35)

Chạy quy trình Batch (B1–B7) ở trên. Family đợt này: `receipt` (Biên Lai), `passport` (Hộ Chiếu), `matchbox` (Hộp Diêm), `notebook` (Sổ Tay), `sticky` (Giấy Nhắn).

**Files:** Create `components/templates/covers/{receipt,passport,matchbox,notebook,sticky}.tsx`; Modify `lib/covers.ts`, `lib/templates.ts`, `components/templates/covers/{index.ts,covers.css}`.

**B1 — Metadata** (dán vào `familyMeta`; thêm slug vào `NEW_FAMILIES`: "receipt", "passport", "matchbox", "notebook", "sticky"):

```ts
  receipt: { label: "Biên lai", layout: "Tờ biên lai in nhiệt răng cưa ghi khách, ngày, địa điểm và mã vạch.", photos: ph("han-quoc-toi-gian"), dark: true },
  passport: { label: "Hộ chiếu", layout: "Trang hộ chiếu với ảnh, dòng MRZ và con dấu tròn ghi ngày cưới.", photos: ph("cua-so-vom"), dark: false },
  matchbox: { label: "Hộp diêm", layout: "Hộp diêm cổ có nhãn tên, que diêm xếp hàng và dải ráp đỏ.", photos: ph("retro-pho-cho"), dark: false },
  notebook: { label: "Sổ tay", layout: "Trang sổ kẻ dòng có gáy lò xo, lề đỏ và ảnh dán băng dính.", photos: ph("sofa-han-quoc"), dark: false },
  sticky: { label: "Giấy nhắn", layout: "Ba tờ giấy nhớ lệch nhau ghi lời mời, ảnh kẹp bằng kẹp giấy.", photos: ph("vuon-bong-bong"), dark: false },
```

**B2 — Thẻ thiết kế từng cover** (mỗi cover là một component `CoverRenderer` theo mẫu `monogram.tsx`, class `cv-<family>__*`):

#### `receipt` — Biên Lai
- DOM: `.cv-receipt` (nền `--tp-deep`, padding `10cqw`) → `__slip` (`background: var(--tp-paper); color: var(--tp-deep); font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; padding: 8cqw 7cqw`) với mép răng cưa trên/dưới bằng `mask` (`radial-gradient` lặp).
- Dòng: `KHÁCH MỜI: ...`, `NGÀY: {date}`, `ĐỊA ĐIỂM: {place}`, vạch `- - -`, `TỔNG: MỘT ĐỜI`, `__barcode` (`repeating-linear-gradient(90deg, currentColor 0 .6cqw, transparent .6cqw 1.4cqw)`, cao `10cqw`).
- Không dùng số liệu bịa: mọi dòng là nhãn tĩnh hoặc dữ liệu cặp đôi.

#### `passport` — Hộ Chiếu
- DOM: `.cv-passport` (nền `--tp-deep`) → `__page` (thẻ `--tp-paper`, bo `3cqw`) chứa `__head` (PASSPORT · WEDDING), `__photo` (slot 0, vuông `34cqw`), `__fields` (Tên, Ngày, Nơi: nhãn nhỏ + giá trị), `__mrz` (hai dòng mono `P<WED<<{TÊN}<<<<` viết hoa, bỏ dấu bằng `normalize("NFD")`) và `__stamp` (vòng tròn viền kép xoay `-12deg`, chứa ngày, `opacity: .8`).
- Hàm `mrz(s)` nằm trong `covers/util.ts`, trả chuỗi A–Z và `<`.

#### `matchbox` — Hộp Diêm
- DOM: `.cv-matchbox` (nền `--tp-tint`) → `__box` (hộp `70cqw × 96cqw`, nền `--tp-deep`, viền `--tp-gold` mảnh) → `__strike` (dải ráp, `linear-gradient` đỏ nhám cạnh dưới) → `__label` (nhãn paper ở giữa, viền kép, chứa `__photo` tròn 26cqw (slot 0), tên `var(--hand)`, ngày) → hàng `__stick` ×7 (que diêm: thân `--tp-gold`, đầu `--tp-deep`) cuối hộp.

#### `notebook` — Sổ Tay
- DOM: `.cv-notebook` (nền `--tp-paper`) → `__rings` (cột trái: hàng chấm tròn `radial-gradient`) → `__sheet` (`background-image: repeating-linear-gradient(transparent 0 7cqw, rgba(0,0,0,.12) 7cqw 7.3cqw)`, lề đỏ dọc `border-left: .5cqw solid var(--tp-deep)` ở `14cqw`) chứa `__photo` (slot 0, nghiêng `3deg`, `__tape`), tên `var(--hand)` `12cqw`, ngày, nơi.

#### `sticky` — Giấy Nhắn
- DOM: `.cv-sticky` (nền `--tp-tint`) → ba `__note` (`background: var(--tp-gold)`/`var(--tp-paper)`, bóng nhẹ, xoay `-4deg`, `3deg`, `-1deg`): "Nhớ nhé!", tên hai người, ngày + nơi. Ghim đỏ `__pin` (chấm tròn `--tp-deep` có highlight) và `__clip` (SVG kẹp giấy) giữ `__photo` (slot 0).
- Chữ trên giấy: `--tp-deep` trên `--tp-paper` để đạt AA; tờ nền gold chỉ chứa chữ đậm cỡ lớn `>= 5cqw`.

**B3 — Catalog** (dán vào mảng `catalog`, sau dòng cuối hiện có):

```ts
  ["bien-lai", "Biên Lai", "receipt", "editorial", "Biên lai · vui mắt", ["muc", "do", "lam"], undefined, "Mẫu thiệp cưới Biên Lai trình bày ngày giờ và địa điểm như một tờ biên lai in nhiệt, vui mắt và độc đáo. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["ho-chieu", "Hộ Chiếu", "passport", "editorial", "Hộ chiếu · cùng đi", ["lam", "dodam", "xanh"], undefined, "Mẫu thiệp cưới Hộ Chiếu như trang hộ chiếu cho chuyến đi chung của hai người, có dấu mộc ngày cưới. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["hop-diem", "Hộp Diêm", "matchbox", "traditional", "Hộp diêm · hoài niệm", ["do", "nau", "cam"], undefined, "Mẫu thiệp cưới Hộp Diêm mang dáng hộp diêm cổ với nhãn tên và ngày cưới, hoài niệm và ấm áp. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
  ["so-tay", "Sổ Tay", "notebook", "korean", "Sổ kẻ dòng · thân mật", ["nau", "hong", "oliu"], undefined, "Mẫu thiệp cưới Sổ Tay như trang sổ kẻ dòng với nét chữ viết tay và ảnh dán, thân mật. Tạo thiệp cưới online miễn phí, không cần tài khoản, chia sẻ bằng link."],
  ["giay-nhan", "Giấy Nhắn", "sticky", "minimal", "Giấy nhớ · dí dỏm", ["cam", "hong", "muc"], undefined, "Mẫu thiệp cưới Giấy Nhắn như tờ giấy nhớ dán lời mời ngày cưới, nhẹ nhàng và dí dỏm. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
```

**B3 — Samples** (dán vào `templateSamples`):

```ts
  "bien-lai": { style: "Hiện đại", motif: "Biên lai", badge: "MỚI", pop: 88, isNew: true, a: "Cẩm Tú", b: "Thành Đạt", date: "14 · 02 · 2027", place: "SÀI GÒN" },
  "ho-chieu": { style: "Hiện đại", motif: "Hộ chiếu", badge: "MỚI", pop: 95, isNew: true, a: "Hồng Nhung", b: "Gia Huy", date: "21 · 02 · 2027", place: "PHÚ QUỐC" },
  "hop-diem": { style: "Truyền thống", motif: "Hộp diêm", badge: "MỚI", pop: 76, isNew: true, a: "Lan Hương", b: "Văn Toàn", date: "28 · 02 · 2027", place: "HÀ NỘI" },
  "so-tay": { style: "Lãng mạn", motif: "Sổ tay", badge: "MỚI", pop: 83, isNew: true, a: "Thu Trang", b: "Hữu Phước", date: "07 · 03 · 2027", place: "ĐÀ LẠT" },
  "giay-nhan": { style: "Hiện đại", motif: "Giấy nhớ", badge: "MỚI", pop: 90, isNew: true, a: "Gia Hân", b: "Bảo Long", date: "14 · 03 · 2027", place: "SÀI GÒN" },
```

**B4–B7:** như quy trình Batch. Sau đợt này `templates.length` phải là 35.

### Task 5: Đợt 4 — Truyền thống kiểu mới (catalog 35 → 40)

Chạy quy trình Batch (B1–B7) ở trên. Family đợt này: `lantern` (Lồng Đèn), `bamboo` (Trúc Xanh), `lotus` (Sen Hồng), `ceramic` (Gốm Men), `drum` (Trống Đồng).

**Files:** Create `components/templates/covers/{lantern,bamboo,lotus,ceramic,drum}.tsx`; Modify `lib/covers.ts`, `lib/templates.ts`, `components/templates/covers/{index.ts,covers.css}`.

**B1 — Metadata** (dán vào `familyMeta`; thêm slug vào `NEW_FAMILIES`: "lantern", "bamboo", "lotus", "ceramic", "drum"):

```ts
  lantern: { label: "Lồng đèn", layout: "Chùm lồng đèn vẽ tay treo trên nền đậm, ảnh tròn nhỏ ở dưới.", photos: ph("ao-dai-do"), dark: true },
  bamboo: { label: "Trúc xanh", layout: "Hai thân trúc đốt mảnh hai bên, tên xếp dọc, ảnh ở giữa.", photos: ph("vuon-xanh"), dark: false },
  lotus: { label: "Sen hồng", layout: "Đoá sen nhiều cánh nổi trên mặt nước, ảnh tròn phía trên.", photos: ph("khoi-hong"), dark: false },
  ceramic: { label: "Gốm men", layout: "Ảnh trong đĩa gốm tròn có vành đôi, viền hoa văn lam lặp quanh thiệp.", photos: ph("lau-dai-trang"), dark: false },
  drum: { label: "Trống đồng", layout: "Vòng hoa văn đồng tâm kiểu trống đồng quanh ảnh tròn ở tâm.", photos: ph("hy-phuc-do"), dark: true },
```

**B2 — Thẻ thiết kế từng cover** (mỗi cover là một component `CoverRenderer` theo mẫu `monogram.tsx`, class `cv-<family>__*`):

#### `lantern` — Lồng Đèn
- DOM: `.cv-lantern` (nền `--tp-deep`) → `__string` (đường ngang gold mảnh) → ba `__lamp` SVG (`viewBox 0 0 60 90`: thân elip, hai nắp, tua; `fill: var(--tp-paper)` pha `opacity`, nét gold) treo ở các độ cao khác nhau → tên `var(--script)` gold `10cqw` → `__photo` (slot 0, tròn `32cqw`) → ngày + nơi.
- Đung đưa nhẹ `@keyframes cv-sway` ±2deg, tắt khi reduced-motion.

#### `bamboo` — Trúc Xanh
- DOM: `.cv-bamboo` (nền `--tp-paper`) → hai `__stalk` SVG dọc (`rect` đốt xếp chồng, `stroke: var(--tp-deep)`, lá `path` nhọn) trái/phải → `__center` (căn giữa): `__photo` (slot 0, `46cqw × 58cqw`, bo `2cqw`), tên đứng thẳng, ngày.
- Chỉ nét mảnh, không tô nặng; lá dùng `fill: var(--tp-tint)`.

#### `lotus` — Sen Hồng
- DOM: `.cv-lotus` (nền `--tp-paper`) → `__photo` (slot 0, tròn `40cqw`, ở trên) → tên `var(--hand)` → `__water` (ba đường sóng SVG `stroke: var(--tp-deep)`, `opacity: .35`) → `__flower` SVG (`viewBox 0 0 120 80`, 9 cánh `path` đối xứng quanh tâm, `fill: var(--tp-tint)`, `stroke: var(--tp-deep)`) ở đáy.
- Cánh sen tạo bằng một `path` cánh `<use>` xoay `-60…60deg` (một định nghĩa, nhiều lần dùng).

#### `ceramic` — Gốm Men
- DOM: `.cv-ceramic` (nền `--tp-paper`) → `__border` (viền hoa văn lặp: `background` dùng SVG pattern nhúng `data:` URI **không dùng ký tự `#`**, mã hoá `%23` hoặc dùng `currentColor`) → `__plate` (đĩa tròn `60cqw`, viền đôi `--tp-deep`, bóng trong) chứa `__photo` (slot 0, tròn) → tên `display` `8cqw` → ngày.
- Test hex chặn `#rrggbb` trong CSS; dùng `%23` hoặc `currentColor`/`var()`.

#### `drum` — Trống Đồng
- DOM: `.cv-drum` (nền `--tp-deep`) → `__rings` (một `div` vuông `92cqw` với `repeating-radial-gradient(circle, transparent 0 4cqw, var(--tp-gold) 4cqw 4.4cqw)` mờ `.6`) + `__star` SVG (ngôi sao 12 cánh, `fill: none; stroke: var(--tp-gold)`) → `__photo` (slot 0, tròn `34cqw`, căn giữa tâm vòng) → tên `display` `8cqw` paper ở đáy → ngày, nơi.

**B3 — Catalog** (dán vào mảng `catalog`, sau dòng cuối hiện có):

```ts
  ["long-den", "Lồng Đèn", "lantern", "traditional", "Lồng đèn · rộn ràng", ["dodam", "do", "vang"], undefined, "Mẫu thiệp cưới Lồng Đèn với chùm lồng đèn đỏ vẽ tay treo trên nền đậm, rộn ràng và trang trọng. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["truc-xanh", "Trúc Xanh", "bamboo", "botanical", "Nét trúc · thanh nhã", ["xanh", "oliu", "muc"], undefined, "Mẫu thiệp cưới Trúc Xanh với nét trúc mảnh vẽ tay, thanh nhã và yên tĩnh, hợp lễ cưới giản dị. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
  ["sen-hong", "Sen Hồng", "lotus", "botanical", "Đoá sen · thuần Việt", ["hong", "xanh", "tim"], undefined, "Mẫu thiệp cưới Sen Hồng với đoá sen vẽ nét mảnh trên nền dịu, thanh khiết và thuần Việt. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["gom-men", "Gốm Men", "ceramic", "classic", "Men gốm · tinh tế", ["lam", "nau", "xanh"], undefined, "Mẫu thiệp cưới Gốm Men gợi men gốm với hoa văn lam trên nền trắng ngà, tinh tế và truyền thống. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
  ["trong-dong", "Trống Đồng", "drum", "traditional", "Trống đồng · đậm chất Việt", ["dodam", "muc", "vang"], undefined, "Mẫu thiệp cưới Trống Đồng với vòng hoa văn trống đồng đồng tâm quanh ảnh cưới, đậm chất Việt. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
```

**B3 — Samples** (dán vào `templateSamples`):

```ts
  "long-den": { style: "Truyền thống", motif: "Lồng đèn", badge: "MỚI", pop: 71, isNew: true, a: "Kim Ngân", b: "Trọng Nghĩa", date: "21 · 03 · 2027", place: "HỘI AN" },
  "truc-xanh": { style: "Hoa", motif: "Trúc", badge: "MỚI", pop: 78, isNew: true, a: "Bảo Châu", b: "Minh Triết", date: "28 · 03 · 2027", place: "HUẾ" },
  "sen-hong": { style: "Hoa", motif: "Hoa sen", badge: "MỚI", pop: 85, isNew: true, a: "Ngọc Lan", b: "Quang Vinh", date: "04 · 04 · 2027", place: "NINH BÌNH" },
  "gom-men": { style: "Cổ điển", motif: "Gốm men", badge: "MỚI", pop: 92, isNew: true, a: "Thanh Mai", b: "Đình Phong", date: "11 · 04 · 2027", place: "BÁT TRÀNG" },
  "trong-dong": { style: "Truyền thống", motif: "Trống đồng", badge: "MỚI", pop: 73, isNew: true, a: "Yến Nhi", b: "Mạnh Cường", date: "18 · 04 · 2027", place: "THANH HOÁ" },
```

**B4–B7:** như quy trình Batch. Sau đợt này `templates.length` phải là 40.

### Task 6: Đợt 5 — Sang và tinh tế (catalog 40 → 45)

Chạy quy trình Batch (B1–B7) ở trên. Family đợt này: `velvet` (Nhung Vàng), `marble` (Cẩm Thạch), `aurora` (Cực Quang), `glass` (Kính Mờ), `leaf` (Lá Mảnh).

**Files:** Create `components/templates/covers/{velvet,marble,aurora,glass,leaf}.tsx`; Modify `lib/covers.ts`, `lib/templates.ts`, `components/templates/covers/{index.ts,covers.css}`.

**B1 — Metadata** (dán vào `familyMeta`; thêm slug vào `NEW_FAMILIES`: "velvet", "marble", "aurora", "glass", "leaf"):

```ts
  velvet: { label: "Nhung vàng", layout: "Nền nhung tối, khung và chữ vàng foil, ảnh vòm nhỏ ở giữa.", photos: ph("lau-dai-trang"), dark: true },
  marble: { label: "Cẩm thạch", layout: "Nền vân đá sáng, đường chỉ vàng mảnh, tên display ở giữa.", photos: ph("studio-hoa-trang"), dark: false },
  aurora: { label: "Cực quang", layout: "Những vệt sáng loang chuyển động chậm trên nền đêm, tên lớn ở giữa.", photos: ph("khoi-hong"), dark: true },
  glass: { label: "Kính mờ", layout: "Ảnh cưới phủ kín, tấm kính mờ đặt chữ ở giữa.", photos: ph("om-hem-nui"), dark: false },
  leaf: { label: "Lá mảnh", layout: "Hai nhành lá vẽ nét mảnh ôm tên, ảnh bầu dục nhỏ phía trên.", photos: ph("voan-hoa-kho"), dark: false },
```

**B2 — Thẻ thiết kế từng cover** (mỗi cover là một component `CoverRenderer` theo mẫu `monogram.tsx`, class `cv-<family>__*`):

#### `velvet` — Nhung Vàng
- DOM: `.cv-velvet` (nền `--tp-deep` + `radial-gradient(ellipse at 50% 20%, rgba(255,255,255,.08), transparent 60%)`) → `__frame` (viền `1px` gold ba lớp lồng nhau, inset `5cqw/7cqw/9cqw`) → `__photo` (slot 0, vòm `38cqw × 50cqw`, viền gold) → tên `var(--script)` italic `11cqw` có `background: linear-gradient(90deg, var(--tp-gold), var(--tp-paper), var(--tp-gold)); -webkit-background-clip: text; color: transparent;` (hiệu ứng foil) → ngày.
- Nếu `-webkit-background-clip: text` không có: khai báo `color: var(--tp-gold)` trước, gradient sau trong `@supports`.

#### `marble` — Cẩm Thạch
- DOM: `.cv-marble` (nền `--tp-paper`) → `__veins` (SVG `feTurbulence` baseFrequency `.012`, `numOctaves 3`, tô bằng `feColorMatrix` xám nhạt, `opacity: .35`, `position:absolute; inset:0`) → `__line` (hai đường vàng mảnh ngang trên/dưới) → `__kicker`, `__name` ×2 (display `12cqw`, căn giữa), `&` script gold, `__date`, `__place`.
- Không ảnh.

#### `aurora` — Cực Quang
- DOM: `.cv-aurora` (nền `--tp-deep`) → ba `__blob` (`position:absolute; width:90cqw; height:90cqw; border-radius:50%; filter: blur(14cqw); opacity:.5` với `background: var(--tp-gold)` / `var(--tp-paper)` / `var(--tp-tint)`, mỗi blob animation `cv-drift` 16–24s `ease-in-out infinite alternate`, tắt khi reduced-motion) → `__text` (tên `display` `13cqw`, `--tp-paper`, căn giữa, `z-index: 1`), ngày, nơi.
- Giữ tương phản: chữ paper trên nền deep, blob chỉ làm nền mờ.

#### `glass` — Kính Mờ
- DOM: `.cv-glass` → `__photo` (slot 0, phủ kín) → `__pane` (`position:absolute; left:8cqw; right:8cqw; bottom:12cqw; padding: 8cqw; background: rgba(255,255,255,.22); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.45); border-radius: 5cqw`) chứa kicker, tên display `10cqw`, ngày.
- `@supports not (backdrop-filter: blur(1px))`: `__pane` nền `--tp-deep` đặc, chữ paper. Chữ trong pane phải là `--tp-paper` trên lớp tối `rgba(0,0,0,.3)` thêm để đạt tương phản trên ảnh sáng.

#### `leaf` — Lá Mảnh
- DOM: `.cv-leaf` (nền `--tp-paper`) → hai `__branch` SVG (`viewBox 0 0 60 120`, thân `path` cong + 7 lá `ellipse` xoay, `fill: none; stroke: var(--tp-deep); stroke-width: .8`) trái và phản chiếu phải bằng `scaleX(-1)` → `__photo` (slot 0, bầu dục `34cqw × 44cqw`, `border-radius: 50%`) → tên `var(--script)` italic `10cqw` → ngày, nơi.

**B3 — Catalog** (dán vào mảng `catalog`, sau dòng cuối hiện có):

```ts
  ["nhung-vang", "Nhung Vàng", "velvet", "classic", "Nhung tối · chữ vàng", ["dodam", "muc", "tim"], undefined, "Mẫu thiệp cưới Nhung Vàng với nền nhung tối và chữ vàng foil, sang trọng cho tiệc tối. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
  ["cam-thach", "Cẩm Thạch", "marble", "classic", "Đá cẩm thạch · thanh lịch", ["muc", "lam", "hong"], undefined, "Mẫu thiệp cưới Cẩm Thạch với vân đá cẩm thạch sáng và đường chỉ vàng mảnh, thanh lịch và tinh tế. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["cuc-quang", "Cực Quang", "aurora", "minimal", "Cực quang · mơ màng", ["muc", "tim", "lam"], undefined, "Mẫu thiệp cưới Cực Quang với dải màu loang như cực quang trên nền đêm, mơ màng và hiện đại. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
  ["kinh-mo", "Kính Mờ", "glass", "minimal", "Kính mờ · nhẹ nhàng", ["hong", "lam", "xanh"], undefined, "Mẫu thiệp cưới Kính Mờ đặt chữ trên tấm kính mờ phủ lên ảnh cưới, nhẹ và hiện đại. Tạo thiệp cưới online miễn phí, không cần tài khoản, chia sẻ bằng một link."],
  ["la-manh", "Lá Mảnh", "leaf", "botanical", "Lá line-art · nhẹ", ["oliu", "xanh", "nau"], undefined, "Mẫu thiệp cưới Lá Mảnh với những nhành lá line-art vẽ tay quanh tên cô dâu chú rể, nhẹ nhàng và sang. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
```

**B3 — Samples** (dán vào `templateSamples`):

```ts
  "nhung-vang": { style: "Cổ điển", motif: "Nhung", badge: "MỚI", pop: 80, isNew: true, a: "Bảo Anh", b: "Hoài Nam", date: "25 · 04 · 2027", place: "SÀI GÒN" },
  "cam-thach": { style: "Cổ điển", motif: "Cẩm thạch", badge: "MỚI", pop: 87, isNew: true, a: "Thảo Vy", b: "Anh Quân", date: "02 · 05 · 2027", place: "HÀ NỘI" },
  "cuc-quang": { style: "Hiện đại", motif: "Cực quang", badge: "MỚI", pop: 94, isNew: true, a: "Hải Yến", b: "Đức Minh", date: "09 · 05 · 2027", place: "ĐÀ NẴNG" },
  "kinh-mo": { style: "Hiện đại", motif: "Kính mờ", badge: "MỚI", pop: 75, isNew: true, a: "Tâm Như", b: "Hùng Dũng", date: "16 · 05 · 2027", place: "NHA TRANG" },
  "la-manh": { style: "Hoa", motif: "Lá line-art", badge: "MỚI", pop: 82, isNew: true, a: "Diệu Hiền", b: "Công Danh", date: "23 · 05 · 2027", place: "ĐÀ LẠT" },
```

**B4–B7:** như quy trình Batch. Sau đợt này `templates.length` phải là 45.

### Task 7: Đợt 6 — Vui và cá tính (catalog 45 → 50)

Chạy quy trình Batch (B1–B7) ở trên. Family đợt này: `chat` (Khung Chat), `sticker` (Dán Sticker), `y2k` (Y2K), `pixel` (Điểm Ảnh), `pin` (Ghim Bản Đồ).

**Files:** Create `components/templates/covers/{chat,sticker,y2k,pixel,pin}.tsx`; Modify `lib/covers.ts`, `lib/templates.ts`, `components/templates/covers/{index.ts,covers.css}`.

**B1 — Metadata** (dán vào `familyMeta`; thêm slug vào `NEW_FAMILIES`: "chat", "sticker", "y2k", "pixel", "pin"):

```ts
  chat: { label: "Khung chat", layout: "Lời mời trong khung chat, hai bong bóng và dòng Đã xem, ảnh là ảnh đại diện.", photos: ph("sofa-han-quoc"), dark: false },
  sticker: { label: "Dán sticker", layout: "Ảnh bo góc dán nhiều sticker vẽ tay xoay lệch, viền trắng dày.", photos: ph("vuon-bong-bong"), dark: false },
  y2k: { label: "Y2K", layout: "Nền gradient pastel, chữ bóng nhiều lớp, ảnh trong cửa sổ phần mềm cũ.", photos: ph("retro-do-hoa-hong"), dark: false },
  pixel: { label: "Điểm ảnh", layout: "Khung bậc thang kiểu game 8-bit, thanh LOADING và trái tim pixel.", photos: ph("han-quoc-toi-gian"), dark: true },
  pin: { label: "Ghim bản đồ", layout: "Tờ bản đồ giấy có đường và dòng sông, ghim đỏ đánh dấu địa điểm tiệc.", photos: ph("nang-chieu"), dark: false },
```

**B2 — Thẻ thiết kế từng cover** (mỗi cover là một component `CoverRenderer` theo mẫu `monogram.tsx`, class `cv-<family>__*`):

#### `chat` — Khung Chat
- DOM: `.cv-chat` (nền `--tp-tint`) → `__bar` (thanh trên: avatar `__photo` tròn `9cqw` (slot 0) + tên) → `__thread`: bong bóng trái `__bubble--in` (nền `--tp-paper`, chữ `--tp-deep`, bo `4cqw 4cqw 4cqw 1cqw`) "Mình cưới nhé!", `__bubble--out` (nền `--tp-deep`, chữ `--tp-paper`, bo ngược) với ngày + nơi, bong bóng `in` thứ ba "Nhất định rồi!", dòng `__seen` "Đã xem" nhỏ → `__input` (ô nhập giả cuối thẻ, không focus được, `aria-hidden`).
- Không icon emoji; mọi chữ tiếng Việt cố định.

#### `sticker` — Dán Sticker
- DOM: `.cv-sticker` (nền `--tp-paper`) → `__photo` (slot 0, `66cqw × 82cqw`, `border-radius: 8cqw`, viền paper `2cqw`, bóng) → bốn `__sticker` SVG `position:absolute` xoay lệch: ngôi sao, trái tim, vòng cười, nhãn `YES!`; mỗi sticker có `stroke: var(--tp-paper)` dày `1.5cqw` làm viền trắng, `fill` dùng `--tp-deep`/`--tp-gold` → tên `var(--hand)` `12cqw`.

#### `y2k` — Y2K
- DOM: `.cv-y2k` (nền `linear-gradient(160deg, var(--tp-tint), var(--tp-paper) 55%, var(--tp-gold))`) → `__win` (cửa sổ phần mềm cũ: thanh tiêu đề `--tp-deep` có ba nút tròn và chữ `wedding.exe`, thân chứa `__photo` slot 0) → tên `display` `13cqw` với `text-shadow: .5cqw .5cqw 0 var(--tp-gold), 1cqw 1cqw 0 var(--tp-deep)` → hai ngôi sao bốn cánh SVG xoay.

#### `pixel` — Điểm Ảnh
- DOM: `.cv-pixel` (nền `--tp-deep`, `font-family: ui-monospace, Menlo, monospace`, `image-rendering: pixelated`) → `__window` (khung bậc thang bằng `box-shadow: 0 -1cqw 0 0 var(--tp-gold), 0 1cqw 0 0 var(--tp-gold), -1cqw 0 0 0 var(--tp-gold), 1cqw 0 0 0 var(--tp-gold)`) chứa `__photo` (slot 0, `image-rendering: pixelated`), tên mono hoa `7cqw`, `__bar` (LOADING: nền gold chạy `width: 100%`), `__heart` (trái tim pixel dựng bằng `box-shadow` nhiều ô `1.6cqw`), dòng `PRESS START: {date}`.
- Không font pixel mới: dùng font mono hệ thống (quyết định giữ 0 font mới ở mọi đợt).

#### `pin` — Ghim Bản Đồ
- DOM: `.cv-pin` (nền `--tp-paper`) → `__map` (lưới kẻ `repeating-linear-gradient` hai hướng `rgba(0,0,0,.08)`, một `path` SVG dòng sông `stroke: var(--tp-tint)` rộng `4cqw`, vài khối `__block` hình chữ nhật mờ) → `__pin` SVG lớn (`viewBox 0 0 40 56`, giọt nước `fill: var(--tp-deep)`, chấm tròn paper) ở giữa kèm bóng elip → `__tag` (thẻ nhãn paper chứa `{place}`, viền deep) → tên và ngày ở đáy; `__photo` (slot 0, tròn `20cqw`) góc trên phải như ảnh đại diện địa điểm.

**B3 — Catalog** (dán vào mảng `catalog`, sau dòng cuối hiện có):

```ts
  ["khung-chat", "Khung Chat", "chat", "korean", "Trò chuyện · gần gũi", ["lam", "hong", "xanh"], undefined, "Mẫu thiệp cưới Khung Chat trình bày lời mời như một cuộc trò chuyện, gần gũi và hài hước. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
  ["dan-sticker", "Dán Sticker", "sticker", "korean", "Sticker · trẻ trung", ["hong", "cam", "lam"], undefined, "Mẫu thiệp cưới Dán Sticker với ảnh cưới và những miếng sticker vẽ tay vui mắt, trẻ trung. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["y2k", "Y2K", "y2k", "editorial", "Y2K · pastel bóng", ["hong", "tim", "lam"], undefined, "Mẫu thiệp cưới Y2K gợi không khí những năm 2000 với chữ bóng và màu pastel, cá tính. Tạo thiệp cưới online miễn phí, không cần đăng ký tài khoản."],
  ["diem-anh", "Điểm Ảnh", "pixel", "editorial", "Pixel · game cổ điển", ["muc", "xanh", "tim"], undefined, "Mẫu thiệp cưới Điểm Ảnh theo phong cách pixel của game cổ điển, vui nhộn cho cặp đôi mê game. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
  ["ghim-ban-do", "Ghim Bản Đồ", "pin", "editorial", "Bản đồ · rõ ràng", ["xanh", "do", "lam"], undefined, "Mẫu thiệp cưới Ghim Bản Đồ đánh dấu địa điểm tiệc bằng ghim đỏ trên tờ bản đồ, rõ ràng và dễ nhớ. Tạo thiệp cưới online miễn phí, không cần tài khoản."],
```

**B3 — Samples** (dán vào `templateSamples`):

```ts
  "khung-chat": { style: "Hiện đại", motif: "Khung chat", badge: "MỚI", pop: 89, isNew: true, a: "Mỹ Duyên", b: "Tiến Đạt", date: "30 · 05 · 2027", place: "SÀI GÒN" },
  "dan-sticker": { style: "Hiện đại", motif: "Sticker", badge: "MỚI", pop: 70, isNew: true, a: "Nhã Phương", b: "Tuấn Kiệt", date: "06 · 06 · 2027", place: "VŨNG TÀU" },
  "y2k": { style: "Hiện đại", motif: "Y2K", badge: "MỚI", pop: 77, isNew: true, a: "Khả Hân", b: "Gia Khải", date: "13 · 06 · 2027", place: "HÀ NỘI" },
  "diem-anh": { style: "Hiện đại", motif: "Pixel", badge: "MỚI", pop: 84, isNew: true, a: "Minh Thư", b: "Hoàng Sơn", date: "20 · 06 · 2027", place: "SÀI GÒN" },
  "ghim-ban-do": { style: "Hiện đại", motif: "Bản đồ", badge: "MỚI", pop: 91, isNew: true, a: "Ánh Tuyết", b: "Văn Hiếu", date: "27 · 06 · 2027", place: "ĐÀ NẴNG" },
```

**B4–B7:** như quy trình Batch. Sau đợt này `templates.length` phải là 50.



---

### Task 8: Hoàn tất 50 mẫu (tài liệu và rà soát cuối)

**Files:**
- Modify: `lib/seo.ts`, `tests/seo.test.ts` (nếu có số cứng), `PROGRESS.md`, `CLAUDE.md`, `DESIGN.md`, `Guide-convert-html-design-to-code.md`

- [ ] **Step 1: Sửa mô tả SEO trang `/templates`**

`lib/seo.ts` dòng `"/templates": page(...)`: đổi "Hơn 20 mẫu thiệp cưới online" thành "Hơn 50 mẫu thiệp cưới online" (giữ description 70–160 ký tự; kiểm bằng `node --test tests/seo.test.ts`).

- [ ] **Step 2: Cập nhật tài liệu**
  - `CLAUDE.md`: câu "`lib/templates.ts` holds the 16 templates…" → "50 templates: 20 from `design/` (families A–O) and 30 added later (families in `lib/covers.ts`, components in `components/templates/covers/`, no mockup in `design/`)".
  - `DESIGN.md` dòng 83 ("Dùng đúng tên 16 mẫu…"): ghi 20 mẫu có mockup + 30 mẫu không có mockup, dựng từ token và primitive; ngoại lệ fidelity giống K–O.
  - `Guide-convert-html-design-to-code.md` dòng 164: `Mau Thiep v2 (20 mẫu…)` giữ nguyên, thêm một dòng nói 30 mẫu sau không có file mockup.
  - `PROGRESS.md`: dòng trạng thái 50 mẫu, nhật ký, mục ▶.

- [ ] **Step 3: Rà soát cuối**

Run: `npm run typecheck && npm test && npm run build`
Expected: PASS. Rồi `grep -rn "20 mẫu\|16 mẫu\|16 templates" app components lib docs/*.md *.md` và sửa chỗ còn lại không thuộc lịch sử.

- [ ] **Step 4: Lighthouse mobile**

Chrome DevTools MCP `lighthouse_audit` mobile cho `/templates` và một `/templates/<id>` mẫu mới (lưu kết quả bằng `outputDirPath`). Ghi điểm Performance/SEO/Accessibility vào PROGRESS.md; nếu Performance của `/templates` tụt rõ so với trước (đo trước khi bắt đầu đợt 1), xử lý riêng (lazy-load cover ngoài viewport).

- [ ] **Step 5: Commit (đưa lệnh cho chủ dự án)**

```bash
git add lib/seo.ts PROGRESS.md CLAUDE.md DESIGN.md Guide-convert-html-design-to-code.md
git commit -m "docs: record 50-template catalog"
```

---

# Phần 4 — Self-review (đã chạy)

- **Spec coverage:** 30 family riêng (Task 1 + đợt 1–6), 6 đợt × 5 mẫu có cổng duyệt (B6), kiến trúc A (Phần 2, Task 1), ngoài phạm vi giữ nguyên, quy tắc chất lượng (Global Constraints), chỗ phụ thuộc số lượng mẫu (Task 1 Step 8, Task 8), kiểm chứng mỗi đợt (B4–B5), rủi ro bundle (Task 8 Step 4).
- **Placeholder scan:** card của từng family đủ DOM, class, kích thước; catalog, samples, metadata đầy đủ chuỗi. Phần `Task 1 Step 4` ghi "nội dung cũ không đổi" vì đó là di chuyển nguyên văn, không phải nội dung mới.
- **Type consistency:** `NewCoverFamily`/`NEW_FAMILIES`/`familyMeta`/`isNewFamily` (lib/covers.ts), `CoverProps`/`CoverRenderer` (covers/types.ts), `coverRenderers` (covers/index.ts) dùng thống nhất ở mọi task.
