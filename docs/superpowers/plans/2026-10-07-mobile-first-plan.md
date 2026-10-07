# Giao diện mobile-first — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thiết kế lại toàn bộ site cho điện thoại (320–767px) để dùng tự nhiên như một app, trong khi desktop (≥1024px) giữ nguyên từng pixel.

**Architecture:** Chỉ cộng thêm. Mỗi file CSS nhận một block `@media (max-width: 767px)` (thêm `479px`/`359px` khi cần) ở **cuối file**. Block này dùng token `--m-*` khai báo trong `tokens.css`. Không dòng CSS cũ nào bị sửa hay xoá. Một script đo (`scripts/layout-probe.js` + `lib/layout-audit.ts`) chụp layout desktop trước khi sửa, rồi so lại ở cuối phase (phải ra 0 khác biệt) và chấm các tiêu chí mobile.

**Tech Stack:** Next.js 16 App Router, CSS thuần (không Tailwind), Node 22 `node --test` (type-stripping), Chrome DevTools MCP cho đo trên browser.

**Spec:** `docs/superpowers/specs/2026-10-07-mobile-first-design.md` (đọc trước, đặc biệt §2 và §2.1).

## Global Constraints

- Desktop ≥1024px không đổi: `node scripts/layout-diff.ts diff` giữa baseline và bản cuối ở 1024/1280/1440 phải in `0 change(s)`.
- Chỉ cộng thêm: `git diff -U0 -- '*.css' | grep -E '^-[^-]'` phải rỗng.
- Rule mobile nằm trong block `@media (max-width: 767px)` / `(max-width: 479px)` / `(max-width: 359px)` **ở cuối file sở hữu selector**. Selector trong block chép **y hệt** selector gốc (cùng specificity), để thắng nhờ đứng sau.
- Không dùng `@media (pointer: …)`, `(any-pointer: …)` hay `(hover: none)`.
- Mọi selector trong block mobile của `components/invitation/invitation.css` bắt đầu bằng `.inv-stage[data-mode="live"]`. Không thêm `container-type` vào `.inv-col`/`.inv-stage`.
- Không có mã màu hex ngoài `tokens.css` (`tests/design-system.test.ts`); dùng `var(--*)` hoặc `rgb()` như code hiện có.
- `app/tro-giup/help.css` không được chứa `scrollbar-width: none` (`tests/design-system.test.ts`).
- Ở ≤767px: vùng chạm ≥44×44px (nhóm chấm màu ≥24×24px), chữ input/select/textarea ≥16px.
- Không `git commit` (permission chặn). Mỗi task kết thúc bằng lệnh commit để chủ dự án chạy.
- Không mở browser giữa phase. Browser chỉ dùng ở Task 2 (baseline) và Task 14 (sweep cuối), qua **Chrome DevTools MCP**, không dùng Playwright (đã từng làm VS Code bị SIGKILL).
- Sau mỗi task: cập nhật `PROGRESS.md` (bảng trạng thái, 1 dòng nhật ký có ngày + cách kiểm chứng, mục ▶).
- Gate mỗi task: `npm test` và `npm run typecheck` xanh. `npm run build:next` chạy ở Task 2 và Task 14.

## File Structure

| File | Trách nhiệm | Task |
|---|---|---|
| `lib/layout-audit.ts` (mới) | Logic thuần: diff hai snapshot, chấm snapshot điện thoại theo tiêu chí spec §6.2 | 1 |
| `tests/layout-audit.test.ts` (mới) | Test cho trên, cộng kiểm script đo có đủ route tĩnh | 1 |
| `scripts/layout-probe.js` (mới) | Hàm chạy trong browser qua `evaluate_script`, trả `Snapshot` | 1 |
| `scripts/layout-diff.ts` (mới) | CLI: `diff <a> <b>` / `audit <file>` | 1 |
| `lib/site.ts` | Thêm `THEME_COLOR` | 3 |
| `app/layout.tsx` | Thêm `export const viewport` | 3 |
| `tests/site.test.ts` | Test viewport + màu | 3 |
| `tests/mobile-css.test.ts` (mới) | Guard: block mobile nằm cuối file, không có pointer/hover-none, invitation chỉ đụng live | 4 (mỗi task CSS sau thêm 1 file vào danh sách) |
| `app/styles/tokens.css` | Token `--m-*` | 4 |
| `app/globals.css`, `components/site/MobileMenu.tsx` | Header, menu sheet, footer, primitive | 5 |
| `components/invitation/invitation.css` | Trang khách live | 6 |
| `components/studio/studio.css`, `components/studio/panels.css`, `components/studio/StudioHome.tsx` | `/studio`, Editor, dialog | 7 |
| `components/account/account.css` | `/account`, popup đăng nhập | 8 |
| `components/home/home.css` | `/` | 9 |
| `components/templates/gallery.css`, `app/templates/[id]/detail.css`, `app/demo/demo.css` | Gallery, chi tiết mẫu, xem thử | 10 |
| `components/marketing/marketing.css`, `app/seo.css`, `app/bang-gia/pricing.css`, `app/ung-ho/donate.css`, `app/thiet-ke-thiep-rieng/custom.css`, `app/tro-giup/help.css` | Trang marketing | 11 |
| `components/tools/tools.css` | Công cụ | 12 |
| `components/blog/blog.css` | Blog | 13 |
| `DESIGN.md`, `PROGRESS.md` | Ghi độ lệch mobile, trạng thái | 14 |

## Trước khi bắt đầu (chủ dự án)

Working tree đang có nhiều thay đổi chưa commit (xem `PROGRESS.md`). Chạy lệnh commit đang chờ trong `PROGRESS.md` trước Task 1, để `git diff` của phase này chỉ còn thay đổi mobile và quy tắc "không xoá dòng CSS" kiểm được bằng `git diff -U0`.

---

### Task 1: Công cụ đo layout (probe + diff + audit)

**Files:**
- Create: `lib/layout-audit.ts`
- Create: `tests/layout-audit.test.ts`
- Create: `scripts/layout-probe.js`
- Create: `scripts/layout-diff.ts`

**Interfaces:**
- Produces:
  - `type Snapshot = { vw: number; vh: number; props: string[]; routes: RouteSnapshot[] }`
  - `type RouteSnapshot = { route: string; clientWidth: number; scrollWidth: number; broken: string[]; h1Lines: number | null; els: ElementRecord[]; taps: TapRecord[]; inputs: InputRecord[] }`
  - `diffSnapshots(before: Snapshot, after: Snapshot): Change[]`
  - `auditMobile(snap: Snapshot): Finding[]`
  - Hằng `DYNAMIC`, `SWATCH`, `TAP` (44), `TAP_SWATCH` (24)
  - CLI `node scripts/layout-diff.ts diff <before.json> <after.json>` và `node scripts/layout-diff.ts audit <phone.json>`: in từng dòng, dòng cuối là `N change(s)` / `N finding(s)`, exit 1 nếu N > 0.

- [ ] **Step 1: Viết test fail**

`tests/layout-audit.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { auditMobile, diffSnapshots, type RouteSnapshot, type Snapshot } from "../lib/layout-audit.ts";
import { PUBLIC_ROUTES } from "../lib/route-inventory.ts";

const route = (over: Partial<RouteSnapshot> = {}): RouteSnapshot => ({
  route: "/", clientWidth: 375, scrollWidth: 375, broken: [], h1Lines: 4, els: [], taps: [], inputs: [], ...over,
});
const snap = (routes: RouteSnapshot[], vw = 375): Snapshot => ({ vw, vh: 844, props: ["font-size", "padding"], routes });

test("identical snapshots have no changes", () => {
  const s = snap([route({ els: [{ p: "main>h1", o: [0, 0, 300, 40], s: ["40px", "0px"] }] })], 1280);
  assert.deepEqual(diffSnapshots(s, structuredClone(s)), []);
});

test("a moved box and a changed style are reported with the property name", () => {
  const a = snap([route({ els: [{ p: "main>h1", o: [0, 0, 300, 40], s: ["40px", "0px"] }] })], 1280);
  const b = snap([route({ els: [{ p: "main>h1", o: [0, 0, 300, 52], s: ["44px", "0px"] }] })], 1280);
  assert.deepEqual(diffSnapshots(a, b).map((c) => c.what), ["box 0,0,300,40 → 0,0,300,52", "font-size: 40px → 44px"]);
});

test("added and removed elements count, dynamic content does not", () => {
  const a = snap([route({ els: [{ p: "main>p", o: [0, 0, 1, 1], s: ["1", "1"] }, { p: "div.hm-chip--days>span", o: [0, 0, 9, 9], s: ["1", "1"] }] })], 1280);
  const b = snap([route({ els: [{ p: "main>a", o: [0, 0, 1, 1], s: ["1", "1"] }, { p: "div.hm-chip--days>span", o: [0, 0, 20, 9], s: ["1", "1"] }] })], 1280);
  assert.deepEqual(diffSnapshots(a, b).map((c) => `${c.path} ${c.what}`), ["main>p removed", "main>a added"]);
});

test("a route missing from the second snapshot is a change", () => {
  assert.deepEqual(diffSnapshots(snap([route()]), snap([])).map((c) => c.what), ["route missing"]);
});

test("snapshots taken with different property lists cannot be compared", () => {
  const b = { ...snap([route()]), props: ["color"] };
  assert.throws(() => diffSnapshots(snap([route()]), b), /props/);
});

test("audit flags overflow, broken images, small taps, small inputs and a tall hero", () => {
  const findings = auditMobile(snap([route({
    scrollWidth: 390, broken: ["/x.jpg"], h1Lines: 6,
    taps: [{ p: "a.hm-btn-red", w: 150, h: 40, inText: false }],
    inputs: [{ p: "input.edf-input", fs: 14 }],
  })]));
  assert.deepEqual(findings.map((f) => f.rule), ["overflow", "broken-image", "tap-target", "input-font", "hero-lines"]);
});

test("audit lets inline text links pass and holds colour swatches to 24px", () => {
  const findings = auditMobile(snap([route({
    taps: [
      { p: "p>a", w: 40, h: 18, inText: true },
      { p: "div.gal-swatches>button:1", w: 26, h: 26, inText: false },
      { p: "div.gal-swatches>button:2", w: 18, h: 18, inText: false },
    ],
  })]));
  assert.deepEqual(findings.map((f) => f.detail), ["div.gal-swatches>button:2 18×18"]);
});

test("the hero line budget is 5 below 375px and 4 from 375px", () => {
  assert.equal(auditMobile(snap([route({ h1Lines: 5 })], 320)).length, 0);
  assert.equal(auditMobile(snap([route({ h1Lines: 5 })], 375)).length, 1);
});

test("the browser probe covers every static public route", () => {
  const probe = readFileSync("scripts/layout-probe.js", "utf8");
  const statics = PUBLIC_ROUTES.filter((r) => !/^\/(templates|blog)\/./.test(r));
  assert.deepEqual(statics.filter((r) => !probe.includes(`"${r}"`)), []);
});
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `node --test tests/layout-audit.test.ts`
Expected: FAIL, `Cannot find module '.../lib/layout-audit.ts'`.

- [ ] **Step 3: Viết `lib/layout-audit.ts`**

```ts
// Pure logic for the layout probe (scripts/layout-probe.js): diff two snapshots (desktop must not move) and audit a
// phone snapshot against the mobile-first criteria (docs/superpowers/specs/2026-10-07-mobile-first-design.md §6).

export type ElementRecord = { p: string; o: number[]; s: string[] };
export type TapRecord = { p: string; w: number; h: number; inText: boolean };
export type InputRecord = { p: string; fs: number };
export type RouteSnapshot = {
  route: string;
  clientWidth: number;
  scrollWidth: number;
  broken: string[];
  h1Lines: number | null;
  els: ElementRecord[];
  taps: TapRecord[];
  inputs: InputRecord[];
};
export type Snapshot = { vw: number; vh: number; props: string[]; routes: RouteSnapshot[] };
export type Change = { route: string; path: string; what: string };
export type Finding = { route: string; rule: "overflow" | "broken-image" | "tap-target" | "input-font" | "hero-lines"; detail: string };

// Content that moves on its own (countdown clock, marquee mounting in batches, typing and rotating text): never a
// layout regression, so the diff skips it.
export const DYNAMIC = /hm-marquee__track|hm-chip--days|hm-cd|hm-rsvp__bar|hm-wish|hm-invite__name|moc-|gal-rank__bar/;
// Colour-swatch groups only need WCAG 2.5.8 AA (24×24): a row of 44px dots does not fit a two-column card.
export const SWATCH = /gal-swatches|gal-dots|tdt__colors|demo-color|pn-color-options|pq__swatches|edf-swatch/;
export const TAP = 44;
export const TAP_SWATCH = 24;

export function diffSnapshots(before: Snapshot, after: Snapshot): Change[] {
  if (before.props.join() !== after.props.join()) throw new Error("snapshots were taken with different props");
  const changes: Change[] = [];
  const afterRoutes = new Map(after.routes.map((r) => [r.route, r]));
  for (const a of before.routes) {
    const b = afterRoutes.get(a.route);
    if (!b) {
      changes.push({ route: a.route, path: "", what: "route missing" });
      continue;
    }
    const bEls = new Map(b.els.map((e) => [e.p, e]));
    const seen = new Set<string>();
    for (const ea of a.els) {
      if (DYNAMIC.test(ea.p)) continue;
      seen.add(ea.p);
      const eb = bEls.get(ea.p);
      if (!eb) {
        changes.push({ route: a.route, path: ea.p, what: "removed" });
        continue;
      }
      if (ea.o.join() !== eb.o.join()) changes.push({ route: a.route, path: ea.p, what: `box ${ea.o.join(",")} → ${eb.o.join(",")}` });
      ea.s.forEach((v, i) => {
        if (v !== eb.s[i]) changes.push({ route: a.route, path: ea.p, what: `${before.props[i]}: ${v} → ${eb.s[i]}` });
      });
    }
    for (const eb of b.els) if (!seen.has(eb.p) && !DYNAMIC.test(eb.p)) changes.push({ route: a.route, path: eb.p, what: "added" });
  }
  return changes;
}

export function auditMobile(snap: Snapshot): Finding[] {
  const out: Finding[] = [];
  for (const r of snap.routes) {
    if (r.scrollWidth > r.clientWidth) out.push({ route: r.route, rule: "overflow", detail: `${r.scrollWidth} > ${r.clientWidth}` });
    for (const src of r.broken) out.push({ route: r.route, rule: "broken-image", detail: src });
    for (const t of r.taps) {
      if (t.inText) continue;
      const min = SWATCH.test(t.p) ? TAP_SWATCH : TAP;
      if (t.w < min || t.h < min) out.push({ route: r.route, rule: "tap-target", detail: `${t.p} ${t.w}×${t.h}` });
    }
    for (const i of r.inputs) if (i.fs < 16) out.push({ route: r.route, rule: "input-font", detail: `${i.p} ${i.fs}px` });
    const budget = snap.vw < 375 ? 5 : 4;
    if (r.route === "/" && r.h1Lines !== null && r.h1Lines > budget) out.push({ route: r.route, rule: "hero-lines", detail: `${r.h1Lines} lines > ${budget}` });
  }
  return out;
}
```

- [ ] **Step 4: Viết `scripts/layout-probe.js`**

```js
// Layout probe for the mobile-first phase (docs/superpowers/specs/2026-10-07-mobile-first-design.md §6.1).
// Run with Chrome DevTools MCP on any page of the app's own origin (the routes load in same-origin iframes):
//   1. evaluate_script  () => { window.PROBE = { vw: 1280, vh: 900 } }      (optional: routes: [...] to narrow)
//   2. evaluate_script  with this whole file as `function` and `filePath` = where the JSON should be saved
// Output: a lib/layout-audit.ts `Snapshot`. Compare/audit it with `node scripts/layout-diff.ts`.
// Static routes mirror lib/route-inventory.ts (tests/layout-audit.test.ts keeps them in sync).
async () => {
  const ROUTES = [
    "/", "/account", "/bang-gia", "/blog", "/cong-cu-dam-cuoi", "/demo", "/dieu-khoan",
    "/qr-tien-mung", "/quyen-rieng-tu", "/studio", "/tao-thiep-cuoi",
    "/templates", "/thiep-cuoi-online-mien-phi", "/tin-nhan-moi-cuoi",
    "/tro-giup", "/ung-ho", "/thiet-ke-thiep-rieng", "/cong-cu/tao-qr", "/cong-cu/nen-anh", "/cong-cu/nen-video",
    "/cong-cu/save-the-date", "/cong-cu/tin-nhan-moi", "/cong-cu/danh-sach-khach",
    "/templates/song-hy", "/templates/song-hy?preview=1", "/blog/cach-lam-thiep-cuoi-online", "/khong-co-trang-nay",
  ];
  const PROPS = ["font-size", "line-height", "font-family", "font-weight", "letter-spacing", "color", "background-color", "padding", "margin", "gap", "display", "grid-template-columns", "flex-direction", "border-radius"];
  const cfg = { vw: 1280, vh: 900, routes: ROUTES, settle: 1500, ...(window.PROBE || {}) };
  const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "LINK", "META"]);
  const TAPPABLE = "a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [tabindex]:not([tabindex='-1'])";
  const TEXT_INPUT = "input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]):not([type=range]):not([type=color]), select, textarea";
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const pathOf = (el) => {
    const parts = [];
    for (let n = el; n && n.tagName !== "BODY"; n = n.parentElement) {
      const cls = [...n.classList].join(".");
      const same = n.parentElement ? [...n.parentElement.children].filter((c) => c.tagName === n.tagName) : [n];
      parts.unshift(`${n.tagName.toLowerCase()}${cls ? "." + cls : ""}${same.length > 1 ? ":" + (same.indexOf(n) + 1) : ""}`);
    }
    return parts.join(">");
  };

  const load = (src) =>
    new Promise((resolve) => {
      const f = document.createElement("iframe");
      f.style.cssText = `position:fixed;left:0;top:0;width:${cfg.vw}px;height:${cfg.vh}px;border:0;opacity:0;pointer-events:none;z-index:-1`;
      f.onload = () => resolve(f);
      f.src = src;
      document.body.appendChild(f);
    });

  async function measure(route) {
    const f = await load(route);
    const win = f.contentWindow;
    const doc = f.contentDocument;
    // A classic scrollbar eats into the layout width: widen the frame so the page lays out at exactly cfg.vw.
    const gutter = cfg.vw - doc.documentElement.clientWidth;
    if (gutter > 0) {
      f.style.width = `${cfg.vw + gutter}px`;
      await wait(300);
    }
    await doc.fonts.ready;
    await wait(cfg.settle);
    const els = [];
    const taps = [];
    const inputs = [];
    for (const el of doc.body.querySelectorAll("*")) {
      if (SKIP.has(el.tagName) || el.ownerSVGElement) continue;
      const cs = win.getComputedStyle(el);
      if (cs.display === "none") continue;
      const p = pathOf(el);
      els.push({ p, o: [el.offsetLeft ?? 0, el.offsetTop ?? 0, el.offsetWidth ?? 0, el.offsetHeight ?? 0], s: PROPS.map((k) => cs.getPropertyValue(k)) });
      const r = el.getBoundingClientRect();
      const shown = cs.visibility !== "hidden" && r.width >= 2 && r.height >= 2 && !el.closest("[hidden], [inert], [aria-hidden='true']");
      if (shown && el.matches(TAPPABLE)) {
        // A hit area grown with ::after { position: absolute; inset: -Npx } counts towards the target size.
        const after = win.getComputedStyle(el, "::after");
        const grow = (side) => (after.content !== "none" && after.position === "absolute" ? Math.max(0, -parseFloat(after[side]) || 0) : 0);
        taps.push({
          p,
          w: Math.round(r.width + grow("left") + grow("right")),
          h: Math.round(r.height + grow("top") + grow("bottom")),
          inText: el.tagName === "A" && !!el.parentElement && !!el.parentElement.closest("p"),
        });
      }
      if (shown && el.matches(TEXT_INPUT)) inputs.push({ p, fs: parseFloat(cs.fontSize) });
    }
    const broken = [...doc.images].filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc).map((i) => i.currentSrc);
    const h1 = doc.querySelector("h1");
    let h1Lines = null;
    if (h1 && h1.offsetHeight) {
      const hs = win.getComputedStyle(h1);
      h1Lines = Math.round(h1.offsetHeight / (parseFloat(hs.lineHeight) || parseFloat(hs.fontSize) * 1.2));
    }
    const out = { route, clientWidth: doc.documentElement.clientWidth, scrollWidth: doc.documentElement.scrollWidth, broken, h1Lines, els, taps, inputs };
    f.remove();
    return out;
  }

  const routes = [];
  for (const r of cfg.routes) routes.push(await measure(r));
  return { vw: cfg.vw, vh: cfg.vh, props: PROPS, routes };
}
```

- [ ] **Step 5: Viết `scripts/layout-diff.ts`**

```ts
// Usage: node scripts/layout-diff.ts diff <before.json> <after.json>   desktop guard, must print "0 change(s)"
//        node scripts/layout-diff.ts audit <phone.json>                 mobile criteria (spec §6.2), "0 finding(s)"
import { readFileSync } from "node:fs";
import { auditMobile, diffSnapshots, type Snapshot } from "../lib/layout-audit.ts";

// evaluate_script may save the bare return value or wrap it; accept both.
const read = (file: string): Snapshot => {
  const json = JSON.parse(readFileSync(file, "utf8"));
  return json.routes ? json : (json.result ?? json.value);
};

const [mode, a, b] = process.argv.slice(2);
const rows =
  mode === "diff" && a && b ? diffSnapshots(read(a), read(b)).map((c) => `${c.route}  ${c.path}  ${c.what}`)
  : mode === "audit" && a ? auditMobile(read(a)).map((f) => `${f.route}  [${f.rule}]  ${f.detail}`)
  : null;
if (!rows) {
  console.error("usage: node scripts/layout-diff.ts diff <before.json> <after.json> | audit <phone.json>");
  process.exit(2);
}
console.log(rows.slice(0, 200).join("\n"));
console.log(`${rows.length} ${mode === "diff" ? "change(s)" : "finding(s)"}`);
process.exit(rows.length ? 1 : 0);
```

- [ ] **Step 6: Chạy test, xác nhận pass**

Run: `node --test tests/layout-audit.test.ts && npm run typecheck`
Expected: 9 test pass, typecheck không lỗi.

- [ ] **Step 7: Ghi PROGRESS.md và đưa lệnh commit**

Thêm dòng nhật ký: `2026-10-07 · Mobile-first Task 1: lib/layout-audit.ts + scripts/layout-probe.js + scripts/layout-diff.ts; kiểm chứng: node --test tests/layout-audit.test.ts (9 pass), typecheck.` Sửa mục ▶ thành Task 2.

```bash
git add lib/layout-audit.ts tests/layout-audit.test.ts scripts/layout-probe.js scripts/layout-diff.ts PROGRESS.md
git commit -m "test(layout): add layout probe, snapshot diff and mobile audit"
```

---

### Task 2: Chụp baseline desktop và hiện trạng mobile

Lần mở browser duy nhất trước phase (spec §6.1). Không sửa code trong task này.

**Files:**
- Tạo (git-ignored): `.playwright-mcp/parity/baseline-1024.json`, `baseline-1280.json`, `baseline-1440.json`, `before-375.json`, `.playwright-mcp/lighthouse/before/*`

**Interfaces:**
- Consumes: `scripts/layout-probe.js`, `scripts/layout-diff.ts` (Task 1)
- Produces: các file baseline mà Task 14 so lại; số finding "trước" để báo cáo

- [ ] **Step 1: Build và chạy bản production**

Run: `npm run build:next`, sau đó chạy nền `npx next start -p 3001`.
Expected: build xanh; `curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/` in `200`.

- [ ] **Step 2: Chụp baseline desktop qua Chrome DevTools MCP**

1. `new_page` → `http://localhost:3001/robots.txt` (trang nhẹ, cùng origin).
2. Với mỗi cặp `(vw, vh)` trong `(1024, 768)`, `(1280, 900)`, `(1440, 900)`:
   - `evaluate_script` với `() => { window.PROBE = { vw: <vw>, vh: <vh> } }`.
   - `evaluate_script` với nội dung `scripts/layout-probe.js` làm `function`, `filePath` = `.playwright-mcp/parity/baseline-<vw>.json`.
3. Kiểm tra file: `node -e 'const s=require("./.playwright-mcp/parity/baseline-1280.json");const r=s.routes??s.result.routes;console.log(r.length, r.every(x=>x.clientWidth===1280))'`
   Expected: `27 true`.

- [ ] **Step 3: Chạy probe hai lần để chắc diff ổn định**

Chụp lại 1280 vào `.playwright-mcp/parity/check-1280.json`, rồi chạy `node scripts/layout-diff.ts diff .playwright-mcp/parity/baseline-1280.json .playwright-mcp/parity/check-1280.json`.
Expected: `0 change(s)`.

Nếu còn khác biệt, đó là nội dung tự chuyển động chưa nằm trong `DYNAMIC`. Thêm class đó vào regex `DYNAMIC` trong `lib/layout-audit.ts` kèm 1 test case trong `tests/layout-audit.test.ts`, rồi chụp lại cho tới khi ra 0.

- [ ] **Step 4: Ghi hiện trạng mobile**

`window.PROBE = { vw: 375, vh: 667 }`, chụp vào `.playwright-mcp/parity/before-375.json`. Chạy `node scripts/layout-diff.ts audit .playwright-mcp/parity/before-375.json | tail -1`, ghi lại số finding (để so ở Task 14).

- [ ] **Step 5: Lighthouse mobile trước phase**

`lighthouse_audit` (mobile, `outputDirPath: .playwright-mcp/lighthouse/before`) cho `/`, `/templates`, `/studio`, `/templates/song-hy?preview=1`. Ghi điểm Performance và Accessibility.

- [ ] **Step 6: Dọn**

Đóng page, kill `next start` (chỉ process đã khởi động ở Step 1).

- [ ] **Step 7: Ghi PROGRESS.md**

Dòng nhật ký: `2026-10-07 · Mobile-first Task 2: baseline desktop 1024/1280/1440 (.playwright-mcp/parity/), probe ổn định (diff 0), hiện trạng 375px: <N> finding, Lighthouse trước: / P<x> A<y>, /templates …` Mục ▶ → Task 3. Không có file trong git để commit.

---

### Task 3: Viewport export

Đã đọc `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-viewport.md`. `Viewport` của Next 16 hỗ trợ `themeColor` và `interactiveWidget` (`node_modules/next/dist/lib/metadata/types/extra-types.d.ts`). **Không** đặt `viewportFit: "cover"` (spec D5). **Không** đặt `maximumScale`/`userScalable`, vì chặn phóng to vi phạm WCAG 1.4.4.

**Files:**
- Modify: `lib/site.ts` (cuối file)
- Modify: `app/layout.tsx:1` (import) và sau khối `metadata`
- Test: `tests/site.test.ts`

**Interfaces:**
- Produces: `export const THEME_COLOR: string` trong `lib/site.ts`

- [ ] **Step 1: Viết test fail** (thêm vào cuối `tests/site.test.ts`)

```ts
import { readFileSync } from "node:fs";
import { THEME_COLOR } from "../lib/site.ts";

test("the browser bar matches the ivory paper token", () => {
  const tokens = readFileSync("app/styles/tokens.css", "utf8");
  assert.equal(`--paper: ${THEME_COLOR};`, tokens.match(/--paper: #[0-9a-f]{6};/)?.[0]);
});

test("the root layout sets the phone viewport without blocking zoom", () => {
  const layout = readFileSync("app/layout.tsx", "utf8");
  assert.match(layout, /export const viewport: Viewport = \{[^}]*themeColor: THEME_COLOR/);
  assert.match(layout, /interactiveWidget: "resizes-content"/);
  assert.doesNotMatch(layout, /maximumScale|userScalable|viewportFit/);
});
```

Đặt hai dòng `import` lên đầu file, cạnh các import sẵn có.

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `node --test tests/site.test.ts`
Expected: FAIL, `THEME_COLOR` không được export.

- [ ] **Step 3: Implement**

Cuối `lib/site.ts`:

```ts
// Browser chrome colour on phones (viewport themeColor). Mirrors --paper in app/styles/tokens.css, which a
// meta tag cannot read; tests/site.test.ts keeps the two equal.
export const THEME_COLOR = "#f8f4ee";
```

`app/layout.tsx`: đổi `import type { Metadata } from "next";` thành `import type { Metadata, Viewport } from "next";`, đổi `import { SITE_URL } from "@/lib/site";` thành `import { SITE_URL, THEME_COLOR } from "@/lib/site";`, và thêm ngay sau khối `metadata`:

```tsx
// Phones: ivory browser bar, and on Android the layout shrinks above the keyboard so Studio's bottom sheets and the
// guest RSVP form stay visible (iOS ignores it and scrolls the focused field into view itself). No viewportFit:
// the site runs as display "browser", where Safari keeps content clear of the notch (spec D5).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: THEME_COLOR,
  interactiveWidget: "resizes-content",
};
```

- [ ] **Step 4: Chạy test, xác nhận pass**

Run: `node --test tests/site.test.ts tests/design-system.test.ts && npm run typecheck`
Expected: PASS; test hex không báo `lib/site.ts` (test chỉ quét `app/` và `components/`).

- [ ] **Step 5: PROGRESS.md + lệnh commit**

```bash
git add lib/site.ts app/layout.tsx tests/site.test.ts PROGRESS.md
git commit -m "feat(viewport): ivory theme colour and keyboard-aware layout on phones"
```

---

### Task 4: Token mobile và guard vị trí CSS

**Files:**
- Modify: `app/styles/tokens.css` (cuối file)
- Create: `tests/mobile-css.test.ts`

**Interfaces:**
- Produces: các biến `--m-*` (bảng ở Step 3), dùng ở mọi task sau. Ghi đè `--fs-h1`, `--fs-h2`, `--fs-h3` ở ≤767px.
- Produces: mảng `FILES` trong `tests/mobile-css.test.ts`. **Mỗi task CSS sau thêm file của mình vào mảng này ở bước 1** (test đỏ), rồi mới thêm block (test xanh).

- [ ] **Step 1: Viết test fail**

`tests/mobile-css.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// docs/superpowers/specs/2026-10-07-mobile-first-design.md §2: phone rules live in max-width blocks at the very end
// of the file that owns the selectors, so they win by order and nothing above them (desktop) changes.
const FILES = ["app/styles/tokens.css"];
const MOBILE = /^@media\s*\(max-width:\s*(767|479|359)px\)$/;

type Block = { prelude: string; body: string };
function blocks(css: string): Block[] {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out: Block[] = [];
  let depth = 0;
  let from = 0;
  let start = 0;
  let prelude = "";
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === "{") {
      if (depth === 0) {
        prelude = src.slice(from, i).trim();
        start = i + 1;
      }
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0) {
        out.push({ prelude, body: src.slice(start, i) });
        from = i + 1;
      }
    } else if (c === ";" && depth === 0) from = i + 1;
  }
  return out;
}
const trailingMobile = (css: string): Block[] => {
  const all = blocks(css);
  let i = all.length;
  while (i > 0 && MOBILE.test(all[i - 1].prelude.replace(/\s+/g, " "))) i--;
  return all.slice(i);
};
const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

test("every file of the phase ends with its phone blocks, including a 767px one", () => {
  const bad = FILES.filter((f) => !trailingMobile(readFileSync(f, "utf8")).some((b) => b.prelude.includes("767px")));
  assert.deepEqual(bad, []);
});

test("phone rules never switch on pointer or hover capability", () => {
  const css = [...walk("app"), ...walk("components")].filter((f) => f.endsWith(".css"));
  assert.deepEqual(css.filter((f) => /\((any-)?pointer\s*:|hover:\s*none/.test(readFileSync(f, "utf8"))), []);
});

test("invitation phone rules only touch the real guest page, never the Studio preview", () => {
  const f = "components/invitation/invitation.css";
  if (!FILES.includes(f)) return;
  const selectors = trailingMobile(readFileSync(f, "utf8")).flatMap((b) => blocks(b.body).flatMap((r) => r.prelude.split(",").map((s) => s.trim())));
  assert.deepEqual(selectors.filter((s) => !s.startsWith('.inv-stage[data-mode="live"]')), []);
});

test("phone tokens exist", () => {
  const root = trailingMobile(readFileSync("app/styles/tokens.css", "utf8")).map((b) => b.body).join("");
  for (const t of ["--m-gutter", "--m-section-y", "--m-display-xl", "--m-display-l", "--m-h2", "--m-btn-h", "--m-tap", "--m-input-fs", "--m-header-h"]) assert.match(root, new RegExp(`${t}:`));
});
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `node --test tests/mobile-css.test.ts`
Expected: FAIL ở test 1 (`["app/styles/tokens.css"]`) và test 4.

- [ ] **Step 3: Thêm token** (cuối `app/styles/tokens.css`)

```css

/* Phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md §4.1. Desktop never reads --m-*, and the
   --fs-* overrides only apply below 768px, so nothing above changes. */
@media (max-width: 767px) {
  :root {
    --m-gutter: 20px;
    --m-section-y: 56px;
    --m-section-y-s: 40px;
    --m-hero-top: 28px;
    --m-hero-bottom: 40px;
    --m-stack: 20px;
    --m-display-xl: clamp(34px, 10vw, 42px);
    --m-display-l: clamp(30px, 8.6vw, 36px);
    --m-h2: clamp(26px, 7.4vw, 30px);
    --m-h3: 20px;
    --m-lede: 16px;
    --m-lede-lh: 1.65;
    --m-body: 15px;
    --m-kicker: 11px;
    --m-btn-h: 44px;
    --m-btn-px: 20px;
    --m-btn-fs: 14px;
    --m-tap: 44px;
    --m-input-fs: 16px;
    --m-radius-card: 18px;
    --m-header-h: 61px;
    --fs-h1: var(--m-display-l);
    --fs-h2: var(--m-h2);
    --fs-h3: var(--m-h3);
  }
}
@media (max-width: 359px) {
  :root {
    --m-gutter: 16px;
  }
}
```

- [ ] **Step 4: Chạy test, xác nhận pass**

Run: `npm test && npm run typecheck`
Expected: toàn bộ test pass, gồm 4 test mới và `tests/design-system.test.ts`.

- [ ] **Step 5: PROGRESS.md + lệnh commit**

```bash
git add app/styles/tokens.css tests/mobile-css.test.ts PROGRESS.md
git commit -m "feat(mobile): phone design tokens and a guard for trailing phone blocks"
```

---

### Task 5: Khung site — header, menu sheet, footer, primitive

**Files:**
- Modify: `app/globals.css` (cuối file)
- Modify: `components/site/MobileMenu.tsx`
- Modify: `tests/mobile-css.test.ts` (thêm `"app/globals.css"` vào `FILES`)

**Interfaces:**
- Consumes: token `--m-*` (Task 4)
- Produces: `.button-primary`/`.button-ghost` 44px, `.input`/`.select`/`.textarea` 16px, `.chip` 44px ở ≤767px cho mọi trang. Header cao `--m-header-h` (61px).

- [ ] **Step 1: Thêm `"app/globals.css"` vào `FILES`, chạy `node --test tests/mobile-css.test.ts`**

Expected: FAIL `["app/globals.css"]`.

- [ ] **Step 2: Thêm block cuối `app/globals.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md. Appended last so it wins by
   order; nothing above this line changes, so desktop stays pixel-identical. ---------- */
@media (max-width: 767px) {
  .lede { font-size: var(--m-lede); line-height: var(--m-lede-lh); }
  .wrap, .wrap-read, .wrap-narrow { padding-inline: var(--m-gutter); }
  .section { padding: var(--m-section-y) var(--m-gutter); }
  .section-head { margin-bottom: 28px; }
  .actions { gap: 10px; margin-top: 24px; }
  .eyebrow { font-size: var(--m-kicker); }

  /* header: one compact row of 44px targets */
  .site-header__inner { gap: 8px; padding: 8px var(--m-gutter); }
  .brand { min-height: var(--m-tap); }
  .brand-mark { width: 30px; height: 30px; font-size: 16px; }
  .brand-word { font-size: 16px; }
  .nav-cta { display: inline-flex; align-items: center; min-height: var(--m-tap); padding: 0 16px; font-size: var(--m-btn-fs); }

  /* menu: a full-width sheet right under the header, with a dimmed backdrop. Both are absolutely positioned from
     .nav-menu (position: relative, sitting var(--m-gutter) from the right edge and 8px + 1px border above the
     header's bottom), so they do not depend on what the sticky header does to fixed descendants. A tap on the
     backdrop lands on <details> itself, which MobileMenu treats as "close". */
  .nav-menu[open]::before {
    content: "";
    position: absolute;
    top: calc(100% + 9px);
    right: calc(-1 * var(--m-gutter));
    z-index: 59;
    width: 100vw;
    height: 100dvh;
    background: rgb(28 16 18 / 0.42);
    animation: mMenuFade 0.2s var(--ease) both;
  }
  .nav-menu nav {
    top: calc(100% + 9px);
    right: calc(-1 * var(--m-gutter));
    width: 100vw;
    max-height: calc(100dvh - var(--m-header-h) - 24px);
    overflow-y: auto;
    gap: 2px;
    padding: 8px var(--m-gutter) 20px;
    border: 0;
    border-top: 1px solid var(--line);
    border-radius: 0 0 22px 22px;
    animation: mMenuSheet 0.24s var(--ease) both;
  }
  .nav-menu nav a,
  .nav-menu nav button { display: flex; align-items: center; min-height: 52px; padding: 0 12px; font-size: 17px; }
  @keyframes mMenuFade { from { opacity: 0; } }
  @keyframes mMenuSheet { from { opacity: 0; transform: translateY(-8px); } }

  /* footer: shorter band, two link columns, 44px rows */
  .footer__wrap { gap: 40px; padding: 48px var(--m-gutter) 32px; }
  .footer__cta { gap: 20px; }
  .footer__cta h2 { font-size: clamp(32px, 9vw, 38px); }
  .footer__cta a { display: inline-flex; align-items: center; min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); font-size: var(--m-btn-fs); }
  .footer__cta a:hover { transform: none; }
  .footer__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px 20px; padding-top: 32px; }
  .footer__brand { grid-column: 1 / -1; }
  .footer__col { gap: 0; }
  .footer__title { margin-bottom: 4px; }
  .footer__col a { display: flex; align-items: center; min-height: var(--m-tap); }
  .footer__legal { font-size: 12px; }

  /* controls */
  .button-primary,
  .button-ghost { min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); font-size: var(--m-btn-fs); }
  .button-primary:hover { transform: none; }
  .chip { min-height: var(--m-tap); }
  .input,
  .select,
  .textarea { font-size: var(--m-input-fs); }
  .card--lift:hover { transform: none; box-shadow: var(--shadow-card); }

  /* /templates/[id]?preview=1 top bar */
  .preview-bar { padding: 8px var(--m-gutter); }
  .preview-bar > a { display: inline-flex; align-items: center; min-height: var(--m-tap); }
}
```

- [ ] **Step 3: Đóng menu khi chạm backdrop hoặc bấm Escape** (`components/site/MobileMenu.tsx`)

Thay toàn bộ file bằng:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

// The phone menu: a native <details> (works without JS, keyboard-accessible). Keyed by the path so it closes itself
// after a link is followed. Hidden on wide screens, where the inline nav is shown instead.
// .site-login/.site-user are hidden on mobile too (see the max-width:760px rule in globals.css), so `extra` is
// where the header's login/account controls move to on phones instead of sitting inline next to the CTA.
// Below 768px the open menu is a sheet over a dimmed backdrop drawn by details[open]::before (globals.css): a tap
// on the backdrop targets the <details> element itself, which closes the menu, and so does Escape.
export function MobileMenu({ links, extra }: { links: readonly { href: string; label: string }[]; extra?: ReactNode }) {
  const path = usePathname();
  const close = (menu: HTMLDetailsElement) => {
    menu.open = false;
    menu.querySelector("summary")?.focus();
  };
  return (
    <details
      className="nav-menu"
      key={path}
      onClick={(e: MouseEvent<HTMLDetailsElement>) => {
        if (e.target === e.currentTarget) close(e.currentTarget);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDetailsElement>) => {
        if (e.key === "Escape" && e.currentTarget.open) close(e.currentTarget);
      }}
    >
      <summary aria-label="Menu">
        <Menu size={22} aria-hidden="true" />
      </summary>
      <nav aria-label="Menu trên điện thoại">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
            {l.href === "/ung-ho" && (
              <span className="nav-heart nav-heart--after" aria-hidden="true">
                ♥
              </span>
            )}
          </Link>
        ))}
        {extra}
      </nav>
    </details>
  );
}
```

- [ ] **Step 4: Chạy test**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: PROGRESS.md + lệnh commit**

```bash
git add app/globals.css components/site/MobileMenu.tsx tests/mobile-css.test.ts PROGRESS.md
git commit -m "feat(mobile): compact header, sheet menu, footer and 44px controls on phones"
```

---

### Task 6: Trang thiệp khách (live)

Chỉ trang khách thật (`data-mode="live"`). Preview trong Studio và `/templates/[id]?preview=1` giữ đúng design (spec §2.1). Lỗi chính: chữ input RSVP và sổ lưu bút là 13px, nên iPhone tự zoom khi khách gõ.

**Files:**
- Modify: `components/invitation/invitation.css` (cuối file)
- Modify: `tests/mobile-css.test.ts` (thêm `"components/invitation/invitation.css"`)

**Interfaces:**
- Consumes: `--m-tap` (Task 4)

- [ ] **Step 1: Thêm file vào `FILES`, chạy `node --test tests/mobile-css.test.ts`**

Expected: FAIL `["components/invitation/invitation.css"]`.

- [ ] **Step 2: Thêm block cuối `components/invitation/invitation.css`**

```css

/* Phones opening the real guest page only (data-mode="live"; spec §2.1). The Studio preview and the template
   showcase keep design/ values, and no container-type is added because it would trap the fixed envelope gate and
   music button inside the 430px column. 16px inputs stop iOS from zooming in while a guest types. */
@media (max-width: 767px) {
  .inv-stage[data-mode="live"] .inv-rsvp__name,
  .inv-stage[data-mode="live"] .inv-rsvp__row input,
  .inv-stage[data-mode="live"] .inv-wishform input,
  .inv-stage[data-mode="live"] .inv-wishform textarea { font-size: 16px; }
  .inv-stage[data-mode="live"] .inv-rsvp__choices button { min-height: var(--m-tap); }
  .inv-stage[data-mode="live"] .inv-rsvp__yn button { min-height: var(--m-tap); padding: 0 16px; }
  .inv-stage[data-mode="live"] .inv-rsvp__submit { min-height: 48px; }
  .inv-stage[data-mode="live"] .inv-wishform__send { min-height: var(--m-tap); padding: 0 22px; }
  .inv-stage[data-mode="live"] .inv-cal a,
  .inv-stage[data-mode="live"] .inv-cal button { display: inline-flex; align-items: center; min-height: var(--m-tap); padding: 0 16px; }
  .inv-stage[data-mode="live"] .inv-party__map { display: inline-flex; align-items: center; min-height: var(--m-tap); }
  .inv-stage[data-mode="live"] .inv-nav > div { padding-block: 0; }
  .inv-stage[data-mode="live"] .inv-nav a { display: inline-flex; align-items: center; min-height: var(--m-tap); }
  .inv-stage[data-mode="live"] .inv-music { width: var(--m-tap); height: var(--m-tap); }
}
```

- [ ] **Step 3: Chạy test**

Run: `npm test && npm run typecheck`
Expected: PASS, gồm test "invitation phone rules only touch the real guest page".

- [ ] **Step 4: PROGRESS.md + lệnh commit**

```bash
git add components/invitation/invitation.css tests/mobile-css.test.ts PROGRESS.md
git commit -m "fix(invite): 16px guest inputs and 44px controls on phones"
```

---

### Task 7: Studio — trang tạo thiệp, Editor, dialog

**Files:**
- Modify: `components/studio/StudioHome.tsx` (thêm `id` cho aside, thêm thanh `.sh__jump`)
- Modify: `components/studio/studio.css` (thêm 1 rule gốc `.sh__jump { display: none; }` sau `.sh__meta span:last-child`, và block cuối file)
- Modify: `components/studio/panels.css` (cuối file)
- Modify: `tests/mobile-css.test.ts` (thêm `"components/studio/studio.css"`, `"components/studio/panels.css"`)

**Interfaces:**
- Consumes: token (Task 4), `.button-primary`/`.input` mobile (Task 5)
- Produces: aside `id="tao-thiep"`; link `.sh__jump` chỉ hiện ở ≤767px

Thiết kế mobile cho `/studio`: phần chọn mẫu ("BƯỚC 1 / 3") lên đầu, panel màu (xem trước + tên + ngày + nút tạo) xuống dưới. Một thanh nổi ở đáy ghi "Mẫu <tên> · Tiếp tục ↓" đưa người dùng tới panel. Thanh này `sticky` trong `.sh__left`, nên chỉ hiện khi đang ở vùng chọn mẫu.

- [ ] **Step 1: Thêm hai file vào `FILES`, chạy `node --test tests/mobile-css.test.ts`**

Expected: FAIL với hai file trên.

- [ ] **Step 2: Sửa `components/studio/StudioHome.tsx`**

Đổi `<aside className="sh__aside" aria-label="Thiệp đang chọn" style={...}>` thành `<aside id="tao-thiep" className="sh__aside" aria-label="Thiệp đang chọn" style={...}>` (giữ nguyên `style`).

Thêm ngay sau `</div>` đóng `.sh__grid` (vẫn bên trong `.sh__left`):

```tsx
          {/* Phones only (studio.css): the picker comes first there, so this bar takes the couple to the form. */}
          <a className="sh__jump" href="#tao-thiep">
            <span>Mẫu {selected.name}</span>
            <b>Tiếp tục ↓</b>
          </a>
```

- [ ] **Step 3: Thêm rule gốc ẩn thanh trên desktop**

Trong `components/studio/studio.css`, ngay sau dòng `.sh__meta span:last-child { … }` (dòng 56), thêm:

```css
.sh__jump { display: none; } /* phone-only bar, shown in the ≤767px block at the end of this file */
```

- [ ] **Step 4: Thêm block cuối `components/studio/studio.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  /* /studio: pick first (step 1), the tinted panel with names + create button follows */
  .sh__left { order: -1; gap: 20px; padding: 28px var(--m-gutter) 32px; }
  .sh__intro h1 { font-size: var(--m-display-l); }
  .sh__chips { flex-wrap: nowrap; overflow-x: auto; margin-inline: calc(-1 * var(--m-gutter)); padding: 0 var(--m-gutter) 4px; scrollbar-width: none; }
  .sh__chips button { flex: none; min-height: var(--m-tap); white-space: nowrap; }
  .sh__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px 14px; }
  .sh__grid > button:hover .sh__thumb { transform: none; }
  .sh__jump {
    position: sticky;
    bottom: 12px;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 52px;
    padding: 0 6px 0 18px;
    border-radius: var(--radius-full);
    background: var(--ink);
    color: var(--paper);
    box-shadow: 0 16px 30px -14px rgb(26 20 18 / 0.55);
    font-size: 14px;
  }
  .sh__jump span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sh__jump b { flex: none; display: inline-flex; align-items: center; min-height: 40px; padding: 0 16px; border-radius: var(--radius-full); background: var(--surface); color: var(--ink); font-weight: 600; }
  .sh__aside { gap: 18px; padding: 28px var(--m-gutter) 32px; scroll-margin-top: var(--m-header-h); }
  .sh__asideTop { gap: 16px; }
  .sh__steps { display: none; }
  .sh__bob { width: 128px; margin-top: 0; }
  .sh__fields input[type="date"] { min-height: var(--m-tap); font-size: var(--m-input-fs); }
  .sh__go { min-height: 48px; padding: 0 20px; }
  .my-item { padding: 18px; }
  .my-item__actions .button-primary,
  .my-item__actions .button-ghost { min-height: var(--m-tap); }
  .link-quiet { min-height: var(--m-tap); }

  /* Editor: sheets get a grab handle and sit higher; every control reaches 44px; 16px inputs so iOS never zooms */
  .ed-bar__back { min-width: var(--m-tap); min-height: var(--m-tap); }
  .ed-seg button { min-height: var(--m-tap); font-size: 12.5px; }
  .ed-publish { min-height: var(--m-tap); padding: 0 16px; font-size: 13px; }
  .ed-outline,
  .ed-form { top: 10%; box-shadow: 0 -18px 40px -20px rgb(26 20 18 / 0.45); }
  .ed-outline::before,
  .ed-form::before { content: ""; flex: none; align-self: center; width: 36px; height: 4px; margin: 10px 0 2px; border-radius: var(--radius-full); background: var(--line-strong); }
  .ed-outline__head button { min-width: var(--m-tap); min-height: var(--m-tap); }
  .ed-item__main { min-height: 48px; }
  .ed-switch { position: relative; }
  .ed-switch::after { content: ""; position: absolute; inset: -13px -6px; }
  .ed-form__head { padding: 12px var(--m-gutter) 14px; }
  .ed-form__head h1 { font-size: 22px; }
  .ed-form__body { gap: 16px; padding: 18px var(--m-gutter) 24px; }
  .ed-form__foot { padding: 10px var(--m-gutter); }
  .ed-form__prev,
  .ed-form__next { min-height: var(--m-tap); padding: 0 18px; font-size: 14px; }
  .ed-chipbtn { min-height: var(--m-tap); padding: 0 14px; }
  .edf-input,
  .edf-textarea { font-size: var(--m-input-fs); }
  .edf-input { min-height: 46px; }
  .edf-chip,
  .edf-chip--s { min-height: var(--m-tap); }
  .ed-guestbar .chip { min-height: var(--m-tap); }
  /* the preview is the phone: no device frame around it */
  .ed-canvas { padding: 8px 8px 80px; }
  .ed-frame { width: 100%; padding: 0; border-radius: 18px; background: transparent; box-shadow: 0 10px 30px -18px rgb(26 20 18 / 0.5); }
  .ed-frame[data-device="mobile"]::before { display: none; }
  .ed-frame__screen { border-radius: 18px; }
  .ed-mobilebar button { min-height: 48px; font-size: 14px; }

  /* publish dialog: a bottom sheet */
  .dlg { width: 100%; max-width: 100%; max-height: calc(100dvh - 24px); margin: auto 0 0; border-width: 1px 0 0; border-radius: 24px 24px 0 0; animation: mSheetUp 0.28s var(--ease) both; }
  .dlg__body { padding: 28px var(--m-gutter) 24px; }
  .dlg__body::before { content: ""; display: block; width: 36px; height: 4px; margin: -14px auto 14px; border-radius: var(--radius-full); background: var(--line-strong); }
  .dlg__body h2 { font-size: 26px; }
  .dlg__close { top: 10px; right: 10px; width: var(--m-tap); height: var(--m-tap); }
  .resp-stat strong { font-size: 24px; }
  @keyframes mSheetUp { from { transform: translateY(100%); } }
}
```

- [ ] **Step 5: Thêm block cuối `components/studio/panels.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .pn-icon-btn { min-width: var(--m-tap); min-height: var(--m-tap); }
  .pn-color-options button { min-height: var(--m-tap); }
  .pn-library__item button { min-height: var(--m-tap); }
  .pq__stage { min-height: 320px; padding: 24px 12px; }
  .pq__controls { padding: 18px; }
  .pq__chips button { min-height: var(--m-tap); }
}
```

- [ ] **Step 6: Chạy test**

Run: `npm test && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: PROGRESS.md + lệnh commit**

```bash
git add components/studio/StudioHome.tsx components/studio/studio.css components/studio/panels.css tests/mobile-css.test.ts PROGRESS.md
git commit -m "feat(studio): picker-first create page, frameless editor preview and sheet dialogs on phones"
```

---

### Task 8: Tài khoản và popup đăng nhập

Trên điện thoại, form đăng nhập lên đầu, panel story tối xuống dưới và thấp lại. Popup đăng nhập thành bottom sheet.

**Files:**
- Modify: `components/account/account.css` (cuối file)
- Modify: `tests/mobile-css.test.ts` (thêm `"components/account/account.css"`)

- [ ] **Step 1: Thêm file vào `FILES`, chạy test, xác nhận fail**

- [ ] **Step 2: Thêm block cuối `components/account/account.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .acc { min-height: 0; }
  .acc-access { order: -1; padding: 32px var(--m-gutter) 40px; }
  .acc-access > div { gap: 22px; }
  .acc-access__title h2 { font-size: 28px; }
  .acc-tabs button { min-height: var(--m-tap); padding: 0 11px; }
  .acc-google { min-height: 48px; }
  .acc-form input,
  .acc-claim input { font-size: var(--m-input-fs); }
  .acc-form button { min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); }
  .acc-form .acc-forgot { min-height: var(--m-tap); }
  .acc-story { min-height: 340px; padding: 36px var(--m-gutter) 40px; }
  .acc-story__a { top: 28px; right: 8%; width: 104px; height: 156px; font-size: 44px; }
  .acc-story__b { top: 64px; right: 34%; width: 88px; height: 130px; }
  .acc-story__b span:last-child { font-size: 22px; }
  .acc-story h1 { font-size: var(--m-display-l); }

  .acc-dash { gap: 28px; padding: var(--m-hero-top) var(--m-gutter) var(--m-section-y); }
  .acc-dash__head h1 { font-size: var(--m-display-l); }
  .acc-dash__head > div:last-child { width: 100%; margin-left: 0; }
  .acc-outline,
  .acc-new { display: inline-flex; flex: 1; align-items: center; justify-content: center; min-height: var(--m-btn-h); padding: 0 14px; }
  .acc-claim button { min-height: var(--m-btn-h); }
  .acc-card:hover { transform: none; }
  .acc-card__body > div:last-child a { display: inline-flex; align-items: center; justify-content: center; min-height: var(--m-tap); }
  .acc-empty-card h2 { font-size: 24px; }
  .acc-empty-card__cta { min-height: var(--m-tap); }

  /* header login popup: a bottom sheet */
  .login-dlg { width: 100%; max-width: 100%; max-height: calc(100dvh - 24px); margin: auto 0 0; border-radius: 24px 24px 0 0; animation: mLoginSheet 0.3s var(--ease) both; }
  .login-dlg__body { gap: 18px; padding: 30px var(--m-gutter) 28px; }
  .login-dlg__body::before { content: ""; position: absolute; top: 10px; left: 50%; width: 36px; height: 4px; margin-left: -18px; border-radius: var(--radius-full); background: var(--line-strong); }
  .login-dlg__close { top: 8px; right: 8px; width: var(--m-tap); height: var(--m-tap); }
  .login-dlg__mark { width: 44px; height: 44px; font-size: 22px; }
  .acc-authform--modal .acc-access__title h2 { font-size: 26px; }
  @keyframes mLoginSheet { from { transform: translateY(100%); } }
}
@media (max-width: 359px) {
  .acc-story__b { display: none; }
}
```

- [ ] **Step 3: Chạy test** — `npm test && npm run typecheck`, expected PASS.

- [ ] **Step 4: PROGRESS.md + lệnh commit**

```bash
git add components/account/account.css tests/mobile-css.test.ts PROGRESS.md
git commit -m "feat(account): form-first account page and bottom-sheet login on phones"
```

---

### Task 9: Trang chủ

Đây là ví dụ chủ dự án đưa: h1 hero 6 dòng ở 304–390px, hai nút 50px xếp hai hàng. Đích: h1 ≤4 dòng ở 375px (≤5 ở 320px), hai CTA cao 44px đứng cạnh nhau (xếp dọc dưới 360px), cả hai nằm trong 667px đầu.

**Files:**
- Modify: `components/home/home.css` (cuối file)
- Modify: `tests/mobile-css.test.ts` (thêm `"components/home/home.css"`)

- [ ] **Step 1: Thêm file vào `FILES`, chạy test, xác nhận fail**

- [ ] **Step 2: Thêm block cuối `components/home/home.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md §4 ---------- */
@media (max-width: 767px) {
  .hm-kicker { font-size: var(--m-kicker); letter-spacing: 0.2em; }
  .hm main h2 { font-size: var(--m-h2); line-height: 1.08; }
  /* text links keep their underline but grow a 44px hit box without moving */
  .hm-more,
  .hm-marquee__head > a { padding-block: 13px; margin-block: -13px; border-bottom: 0; text-decoration: underline; text-underline-offset: 4px; }

  /* hero */
  .hm-hero__inner { gap: 28px; padding: var(--m-hero-top) var(--m-gutter) var(--m-hero-bottom); }
  .hm-hero__copy { gap: 20px; }
  .hm-hero__kicker { letter-spacing: 0.2em; }
  .hm-hero h1 { font-size: var(--m-display-xl); line-height: 1.04; letter-spacing: -0.02em; }
  .hm-hero__lede { font-size: var(--m-lede); line-height: var(--m-lede-lh); }
  .hm-hero__actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .hm-btn-red,
  .hm-btn-line { display: inline-flex; align-items: center; justify-content: center; min-height: var(--m-btn-h); padding: 0 12px; font-size: var(--m-btn-fs); white-space: nowrap; }
  .hm-btn-red:hover { transform: none; }
  .hm-hero__proof { gap: 8px 16px; font-size: 12px; }
  /* smaller envelope: the stage still grows with the 9:16 card so the card never covers the copy */
  .hm-stage { --card: min(210px, 52vw); --env: min(330px, 84vw); height: calc(var(--card) * 16 / 9 + 56px); }
  .hm-env__card { width: var(--card); margin-left: calc(var(--card) / -2); }
  .hm-chip--rsvp { top: 64px; left: 0; }
  .hm-chip--days { top: 12px; right: 0; }
  .hm-chip--wish { right: 0; max-width: 200px; }
  .hm-chip--rsvp > div,
  .hm-chip--days > div,
  .hm-chip--wish > div { padding: 10px 12px; }
  .hm-chip__tick { width: 28px; height: 28px; font-size: 14px; }
  .hm-chip--days > div > span:last-child { font-size: 18px; }
  .hm-chip--wish > div > span:first-child { font-size: 15px; }

  /* template marquee */
  .hm-marquee { gap: 24px; padding: 16px 0 56px; }
  .hm-marquee__head { gap: 12px; padding: 0 var(--m-gutter); }
  .hm-marquee__track { gap: 18px; }
  .hm-marquee__track > a { width: 164px; gap: 10px; }
  .hm-marquee__track > a:hover { translate: 0 var(--off, 0px); rotate: 0deg; scale: 1; }
  .hm-marquee__meta > span:first-child { font-size: 16px; }
  .hm-marquee__track--small { gap: 16px; }
  .hm-marquee__track--small > a { width: 112px; }
  .hm-marquee__track--small > a:hover { translate: none; }

  /* quotes, stats */
  .hm-quotes { padding: 0 0 48px; }
  .hm-quotes__track > div { gap: 12px; padding: 0 24px; }
  .hm-quotes__track > div > span:last-child { font-size: 17px; }
  .hm-stats-wrap { padding: 48px var(--m-gutter) 16px; }
  .hm-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px 16px; }
  .hm-stats > div { padding-top: 14px; }
  .hm-stats > div > span:first-child { font-size: 34px; }
  .hm-stats > div > span:last-child { font-size: 12px; }

  /* three steps as rows: number left, title + text right */
  .hm-steps { padding: 40px var(--m-gutter) var(--m-section-y); }
  .hm-steps > .hm-head { margin-bottom: 28px; }
  .hm-steps__grid { gap: 0; }
  .hm-steps__grid > div { display: grid; grid-template-columns: 48px minmax(0, 1fr); column-gap: 14px; row-gap: 6px; padding: 20px 0; }
  .hm-steps__grid > div > span:nth-child(1) { grid-row: span 2; font-size: 40px; line-height: 1; }
  .hm-steps__grid > div > span:nth-child(2) { font-size: 22px; }
  .hm-steps__grid > div > span:nth-child(3) { grid-column: 2; font-size: 14px; line-height: 1.65; }

  /* eight feature cards: a swipeable row instead of eight full-height cards */
  .hm-feats { padding: var(--m-section-y) 0; }
  .hm-feats__inner { padding: 0; }
  .hm-feats__top { margin-bottom: 24px; padding: 0 var(--m-gutter); }
  .hm-feats__grid { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: var(--m-gutter); padding: 4px var(--m-gutter) 20px; scrollbar-width: none; overscroll-behavior-x: contain; }
  .hm-feats__grid::-webkit-scrollbar { display: none; }
  .hm-feat { flex: 0 0 min(80%, 300px); scroll-snap-align: start; padding: 20px; border-radius: var(--m-radius-card); }
  .hm-feat:hover { transform: none; box-shadow: none; }
  .hm-feat__art { height: 140px; }
  .hm-feat__title { font-size: 20px; }

  /* guest link band */
  .hm-guest { padding: var(--m-section-y) 0; }
  .hm-guest__inner { gap: 32px; padding: 0 var(--m-gutter); }
  .hm-guest__copy { gap: 18px; }
  .hm-guest__copy > p { font-size: 15px; }
  .hm-guest__tags span { padding: 7px 12px; font-size: 12px; }
  .hm-invite { gap: 14px; padding: 36px 22px 40px; }
  .hm-invite__name > span:first-child { font-size: 36px; }
  .hm-invite__caret { height: 32px; }
  .hm-invite__couple { font-size: 24px; }

  /* tools list */
  .hm-tools { padding: var(--m-section-y) var(--m-gutter); }
  .hm-tools__grid { gap: 24px; }
  .hm-tools__intro { position: static; gap: 14px; }
  .hm main .hm-tools__intro h2 { font-size: var(--m-h2); }
  .hm-tools__list > a { gap: 14px; min-height: 64px; padding: 16px 2px; }
  .hm-tools__list > a:hover { padding-left: 2px; background: none; }
  .hm-tools__list > a > div > span:first-child { font-size: 19px; }
  .hm-tools__list > a > div > span:last-child { font-size: 13px; line-height: 1.5; }

  /* pricing band */
  .hm-price-wrap { padding: 0 var(--m-gutter) var(--m-section-y); }
  .hm-price { gap: 24px; padding: 44px 24px; border-radius: 22px; }
  .hm-price__ring1 { top: -90px; right: -90px; width: 260px; height: 260px; }
  .hm-price__ring2 { top: -40px; right: -40px; width: 180px; height: 180px; }
  .hm .hm-price h2 { font-size: clamp(40px, 12vw, 52px); }
  .hm-price__body > p { font-size: 15px; }
  .hm-price__cta { display: inline-flex; align-items: center; min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); font-size: var(--m-btn-fs); }
  .hm-price__cta:hover { transform: none; }
}
@media (max-width: 359px) {
  .hm-hero__actions { grid-template-columns: minmax(0, 1fr); }
}
```

- [ ] **Step 3: Chạy test** — `npm test && npm run typecheck`, expected PASS.

- [ ] **Step 4: PROGRESS.md + lệnh commit**

```bash
git add components/home/home.css tests/mobile-css.test.ts PROGRESS.md
git commit -m "feat(home): phone hero, side-by-side CTAs and swipeable feature cards"
```

---

### Task 10: Gallery, chi tiết mẫu, xem thử

Thiết kế mobile:
- `/templates` dùng lưới 2 cột; hai nút "Xem thử / Dùng mẫu" xuống dưới ảnh bìa thay vì phủ lên ảnh.
- Rank rail vuốt ngang, bỏ nút mũi tên.
- Popup "Xem thử" thành điện thoại full chiều ngang, thông tin và nút nằm bên dưới.
- `/templates/[id]`: cặp nút dính đáy màn hình trong lúc đọc thông tin mẫu.

**Files:**
- Modify: `components/templates/gallery.css`, `app/templates/[id]/detail.css`, `app/demo/demo.css` (cuối mỗi file)
- Modify: `tests/mobile-css.test.ts` (thêm 3 file)

- [ ] **Step 1: Thêm 3 file vào `FILES`, chạy test, xác nhận fail**

- [ ] **Step 2: Thêm block cuối `components/templates/gallery.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .gal-kicker,
  .gal-hero__kicker { font-size: var(--m-kicker); letter-spacing: 0.2em; }
  .gal-hero { gap: 20px; padding: var(--m-hero-top) var(--m-gutter) 32px; }
  .gal-hero__kicker { margin-bottom: 16px; }
  .gal-hero h1 { font-size: var(--m-display-xl); line-height: 1.02; }
  .gal-hero__side { gap: 20px; }
  .gal-hero__side > p { font-size: var(--m-lede); line-height: var(--m-lede-lh); }
  .gal-stats > div > span:first-child { font-size: 17px; }
  .gal-stats > div > span:last-child { font-size: 11px; }

  /* rank rail: swipe, no arrow buttons */
  .gal-rank { padding: var(--m-section-y) 0; }
  .gal-rank__head { margin-bottom: 8px; padding: 0 var(--m-gutter); }
  .gal-rank h2 { font-size: var(--m-h2); }
  .gal-rank__nav { display: none; }
  .gal-rank__rail { gap: 18px; scroll-padding: 0 var(--m-gutter); padding: 36px var(--m-gutter) 8px; }
  .gal-rank__rail > a { flex-basis: min(64vw, 240px); gap: 14px; }
  .gal-rank__card:hover { translate: none; rotate: none; scale: 1; }
  .gal-rank__n { top: -16px; left: -10px; width: 38px; height: 38px; font-size: 19px; }
  .gal-rank__meta > span:first-child { font-size: 19px; }

  /* filters (the ≤760px block above already makes the chips a scrolling row) */
  .gal-filters { top: calc(var(--m-header-h) - 1px); }
  .gal-chips button { min-height: var(--m-tap); }
  .gal-dots { gap: 14px; }
  .gal-dots button { width: 26px; height: 26px; }

  /* catalogue: two columns, actions under the cover instead of over it */
  .gal-main { padding: 32px var(--m-gutter) var(--m-section-y); }
  .gal-main__head { margin-bottom: 28px; }
  .gal-main__head h2 { font-size: var(--m-h2); }
  .gal-sort button { min-height: var(--m-tap); }
  .gal-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 14px; }
  .gal-grid > article { gap: 12px; padding: 16px 10px 24px; margin: -16px -10px -24px; contain-intrinsic-size: auto 380px; }
  .gal-card { box-shadow: none; }
  .gal-card[data-hover] { transform: none; box-shadow: none; }
  .gal-card > a { overflow: hidden; border-radius: 10px; box-shadow: 0 14px 30px -20px rgb(26 20 18 / 0.45); }
  .gal-card__actions { position: static; gap: 6px; padding: 10px 0 0; border-radius: 0; background: none; }
  .gal-card__actions a,
  .gal-card__actions button { display: inline-flex; align-items: center; justify-content: center; min-height: var(--m-tap); padding: 0 6px; font-size: 12.5px; }
  .gal-card__actions > :first-child { background: var(--surface); box-shadow: inset 0 0 0 1px var(--line-strong); }
  .gal-card__meta { gap: 6px; }
  .gal-card__meta > div:first-child > span:first-child { font-size: 18px; }
  .gal-card__meta > div:first-child > span:last-child { font-size: 12px; }
  .gal-card__meta > div:last-child { flex-wrap: wrap; gap: 6px 10px; }
  .gal-swatches { gap: 8px; }
  .gal-swatches button { position: relative; }
  .gal-swatches button::after { content: ""; position: absolute; inset: -4px; }
  .gal-card__tags { font-size: 12px; }

  /* suggestion, collections, FAQ */
  .gal-discover { gap: 20px; padding: 0 var(--m-gutter) var(--m-section-y); }
  .gal-suggest { gap: 14px; padding: 28px 22px; border-radius: var(--m-radius-card); }
  .gal-suggest h3 { font-size: 26px; }
  .gal-suggest input { flex-basis: 100%; min-width: 0; padding: 12px 18px; font-size: var(--m-input-fs); }
  .gal-suggest button { flex: 1; min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); }
  .gal-collections a { min-height: var(--m-tap); padding: 0 14px; font-size: 13px; }
  .gal-links { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .gal-links a { padding: 18px 20px; }
  .gal-faq > div { gap: 24px; padding: var(--m-section-y) var(--m-gutter); }
  .gal-faq h2 { font-size: var(--m-h2); }
  .gal-faq__list button { min-height: 60px; padding: 18px 0; font-size: 18px; }
  .gal-faq__list p { padding: 0 8px 20px 0; font-size: 14.5px; }

  /* "Xem thử": the phone takes the width, details and actions follow below it */
  .gal-demo { align-content: flex-start; align-items: flex-start; gap: 18px; padding: 16px var(--m-gutter) 24px; }
  .gal-demo__phone { margin: 0 auto; padding: 10px; border-radius: 36px; }
  .gal-demo__scroller { width: min(300px, 100vw - 2 * var(--m-gutter) - 20px); height: min(62dvh, 560px); border-radius: 28px; }
  .gal-demo__zoom { width: calc(min(300px, 100vw - 2 * var(--m-gutter) - 20px) / 1.4); }
  .gal-demo__side { width: 100%; max-width: none; gap: 14px; }
  .gal-demo__title span:first-child { font-size: 30px; }
  .gal-demo__actions a,
  .gal-demo__actions button { display: inline-flex; flex: 1; align-items: center; justify-content: center; min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); font-size: var(--m-btn-fs); }
}
```

- [ ] **Step 3: Thêm block cuối `app/templates/[id]/detail.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .tdt { gap: 28px; padding: var(--m-hero-top) var(--m-gutter) var(--m-section-y); }
  .tdt__card { width: min(260px, 72vw); }
  .tdt__info { gap: 22px; }
  .tdt__head h1 { font-size: var(--m-display-l); }
  .tdt__head p { font-size: 15px; }
  .tdt__crumb a { padding-block: 12px; margin-block: -12px; }
  .tdt__colors > div { gap: 12px; }
  .tdt__colors a { width: 36px; height: 36px; }
  .tdt__incl { padding: 20px; }
  /* the two actions stay pinned to the bottom of the screen while the details scroll by */
  .tdt__actions { position: sticky; bottom: 0; z-index: 5; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-inline: calc(-1 * var(--m-gutter)); padding: 12px var(--m-gutter); background: linear-gradient(to top, var(--paper) 70%, transparent); }
  .tdt__actions a:first-child,
  .tdt__actions a:last-child { display: inline-flex; align-items: center; justify-content: center; min-height: var(--m-btn-h); padding: 0 12px; font-size: var(--m-btn-fs); white-space: nowrap; }
  .tdt__actions a:last-child { background: var(--paper); }
}
@media (max-width: 359px) {
  .tdt__actions { grid-template-columns: minmax(0, 1fr); }
}
```

- [ ] **Step 4: Thêm block cuối `app/demo/demo.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .demo-hero { gap: 20px; padding-block: var(--m-hero-top) 32px; }
  .demo-hero h1 { font-size: var(--m-display-xl); }
  /* five cover families: one swipeable row, labels readable again (the ≤760px block above shrank them to 9px) */
  .demo-family-grid { display: flex; gap: 8px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 4px; scrollbar-width: none; }
  .demo-family { flex: 0 0 84px; min-height: 64px; scroll-snap-align: start; }
  .demo-family small { font-size: 11px; }
  .demo-family:hover { transform: none; }
  .demo-color { min-height: var(--m-tap); }
  .demo-full-toggle { min-height: 64px; }
  .demo-actions .button-primary,
  .demo-actions .button-ghost { flex: 1; }
}
```

- [ ] **Step 5: Chạy test** — `npm test && npm run typecheck`, expected PASS.

- [ ] **Step 6: PROGRESS.md + lệnh commit**

```bash
git add components/templates/gallery.css "app/templates/[id]/detail.css" app/demo/demo.css tests/mobile-css.test.ts PROGRESS.md
git commit -m "feat(templates): two-column phone catalogue, sticky template actions, phone demo popup"
```

---

### Task 11: Trang marketing (landing SEO, bảng giá, ủng hộ, thiết kế riêng, trợ giúp, pháp lý)

**Files:**
- Modify (cuối mỗi file): `components/marketing/marketing.css`, `app/seo.css`, `app/bang-gia/pricing.css`, `app/ung-ho/donate.css`, `app/thiet-ke-thiep-rieng/custom.css`, `app/tro-giup/help.css`
- Modify: `tests/mobile-css.test.ts` (thêm 6 file)

- [ ] **Step 1: Thêm 6 file vào `FILES`, chạy test, xác nhận fail**

- [ ] **Step 2: Cuối `components/marketing/marketing.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .mk-hero { padding: var(--m-hero-top) var(--m-gutter) 32px; }
  .mk-hero h1 { margin: 14px auto 16px; font-size: var(--m-display-l); }
  .mk-hero .actions { gap: 10px; margin-top: 22px; }
  .mk-hero .actions > * { flex: 1 1 0; }
  .mk-crumbs { margin-bottom: 16px; }
  .mk-crumbs a { display: inline-block; padding-block: 12px; margin-block: -12px; }
  .mk-section { padding: 32px var(--m-gutter) 44px; }
  .mk-section > h2 { margin-bottom: 20px; font-size: var(--m-h2); }
  .mk-grid { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .mk-card { padding: 22px; border-radius: var(--m-radius-card); }
  a.mk-card:hover { transform: none; box-shadow: var(--shadow); }
  .mk-faq summary { min-height: 60px; padding: 14px 2px; font-size: 16px; }
  .mk-faq summary::after { width: 32px; height: 32px; }
  .mk-chips { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; margin-inline: calc(-1 * var(--m-gutter)); padding: 0 var(--m-gutter) 4px; scrollbar-width: none; }
  .mk-chips a { display: inline-flex; align-items: center; min-height: var(--m-tap); white-space: nowrap; }
  .mk-group { scroll-margin-top: calc(var(--m-header-h) + 16px); }
  .mk-group > h2 { font-size: 24px; }
  .mk-prose blockquote { padding-left: 16px; font-size: 20px; }
  .mk-cta { padding: var(--m-section-y) var(--m-gutter); }
  .mk-cta h2 { margin-bottom: 20px; font-size: var(--m-h2); }
  .legal { gap: 24px; padding: var(--m-hero-top) var(--m-gutter) var(--m-section-y); }
  .legal__head h1 { font-size: var(--m-display-l); line-height: 1.15; }
  .legal__tabs { overflow-x: auto; scrollbar-width: none; }
  .legal__tabs a { display: inline-flex; align-items: center; min-height: var(--m-tap); white-space: nowrap; }
  .legal__body h2 { font-size: 19px; line-height: 1.5; }
}
```

- [ ] **Step 3: Cuối `app/seo.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  /* !important: /tin-nhan-moi-cuoi passes its hero padding as an inline style */
  .lp-hero { gap: 16px; padding: var(--m-hero-top) var(--m-gutter) 40px !important; }
  .lp-kicker { font-size: var(--m-kicker); }
  .lp-hero h1 { font-size: var(--m-display-l); }
  .lp-hero > p { font-size: var(--m-lede); line-height: var(--m-lede-lh); }
  .lp-cta,
  .lp-cta--small,
  .lp-qr-hero__copy > a { display: inline-flex; align-items: center; justify-content: center; min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); font-size: var(--m-btn-fs); }
  .lp-steps { gap: 24px; padding: 16px var(--m-gutter) var(--m-section-y); }
  .lp-steps > div > span:nth-child(1) { font-size: 36px; }
  .lp-why { padding: var(--m-section-y) 0; }
  .lp-why > div { padding: 0 var(--m-gutter); }
  .lp-why__title { font-size: var(--m-h2); }
  .lp-why > div > div > div { padding: 18px; }
  .lp-checklist { padding: 16px var(--m-gutter) var(--m-section-y); }
  .lp-checklist > div > div { padding: 14px 0; font-size: 14.5px; }
  .lp-qr-hero { gap: 32px; padding: var(--m-hero-top) var(--m-gutter) 40px; }
  .lp-qr-hero h1 { font-size: var(--m-display-l); }
  .lp-qr { max-width: 260px; padding: 20px; }
  .lp-ruled { padding: 0 var(--m-gutter) var(--m-section-y); }
  .lp-ruled__title { font-size: 22px; }
  .lp-quotes { gap: 14px; padding: 0 var(--m-gutter) var(--m-section-y); }
  .lp-quotes > div { padding: 20px; }
  .lp-quotes > div > span:last-child { font-size: 17px; }
}
```

- [ ] **Step 4: Cuối `app/bang-gia/pricing.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .pricing-hero { gap: 16px; padding: var(--m-hero-top) var(--m-gutter) 36px; }
  .pricing-kicker { font-size: var(--m-kicker); }
  .pricing-zero { font-size: clamp(110px, 34vw, 140px); }
  .pricing-hero h1 { font-size: var(--m-display-l); }
  .pricing-hero > p { font-size: 15px; }
  .pricing-grid { gap: 16px; padding: 0 var(--m-gutter) var(--m-section-y); }
  .pricing-grid h2 { font-size: 26px; }
  .pricing-included,
  .pricing-planned,
  .pricing-donate { gap: 20px; padding: 28px 22px; border-radius: 22px; }
  .pricing-included li { padding: 12px 0; font-size: 14.5px; }
  .pricing-cta { display: flex; align-items: center; justify-content: center; min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); font-size: var(--m-btn-fs); }
  .pricing-donate h2 { font-size: 24px; }
}
```

- [ ] **Step 5: Cuối `app/ung-ho/donate.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .donate-hero__inner { gap: 32px; padding: var(--m-hero-top) var(--m-gutter) var(--m-section-y); }
  .donate-hero__copy { gap: 18px; }
  .donate-hero__heart { font-size: 34px; }
  .donate-hero h1 { font-size: var(--m-display-xl); }
  .donate-hero__copy > p { font-size: var(--m-lede); line-height: var(--m-lede-lh); }
  .donate-hero__copy li { font-size: 14px; }
  .donate-card { padding: 22px; border-radius: 22px; }
  .donate-rows button { min-height: var(--m-tap); padding: 0 14px; font-size: 13px; }
  .donate-quote { padding: var(--m-section-y) var(--m-gutter); }
  .donate-quote > span { font-size: 24px; }
  .donate-quote a { display: inline-flex; align-items: center; min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); font-size: var(--m-btn-fs); }
}
```

- [ ] **Step 6: Cuối `app/thiet-ke-thiep-rieng/custom.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .cd-kicker { font-size: var(--m-kicker); }
  .cd-hero__grid { gap: 8px; padding: var(--m-hero-top) var(--m-gutter) 36px; }
  .cd-hero h1 { font-size: var(--m-display-l); }
  .cd-hero__lede { font-size: 15px; }
  .cd-stats { gap: 16px 22px; }
  .cd-stats dt { font-size: 19px; }
  .cd-actions > a { flex: 1 1 auto; justify-content: center; }
  .cd-zalo-btn { min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); font-size: var(--m-btn-fs); }
  /* the floating card stack keeps its composition, just smaller */
  .cd-stack { height: 300px; margin-block: -28px; transform: scale(0.82); }
  .cd-steps { padding: 40px var(--m-gutter) 8px; }
  .cd-steps li { gap: 8px; }
  .cd-palettes { padding: 32px var(--m-gutter) 8px; }
  .cd-palettes h2 { font-size: 22px; }
  .cd-palettes ul { gap: 8px; }
  .cd-palettes li { padding: 6px 12px 6px 6px; font-size: 12.5px; }
  .cd-request { gap: 28px; padding: 40px var(--m-gutter) var(--m-section-y); }
  .cd-request__intro h2 { font-size: var(--m-h2); }
  .cd-zalo-link { min-height: var(--m-tap); }
  .custom-form .button-primary { justify-self: stretch; }
}
```

- [ ] **Step 7: Cuối `app/tro-giup/help.css`** (không dùng `scrollbar-width: none`, test có chặn)

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .help-hero { padding: 40px var(--m-gutter) 36px; }
  .help-hero__inner { gap: 18px; }
  .help-hero__kicker { font-size: var(--m-kicker); }
  .help-hero h1 { font-size: var(--m-display-l); }
  .help-search input { padding: 14px 20px; }
  .help-layout { gap: 24px; padding: 24px var(--m-gutter) var(--m-section-y); }
  .help-sidebar { gap: 6px; margin-inline: calc(-1 * var(--m-gutter)); padding: 0 var(--m-gutter) 4px; scroll-padding-inline: var(--m-gutter); }
  .help-sidebar > button { min-height: var(--m-tap); padding: 0 14px; border-radius: var(--radius-full); font-size: 14px; }
  .help-results { gap: 36px; }
  .help-results h2 { font-size: 26px; }
  .help-q button { gap: 12px; min-height: 60px; padding: 16px 0; font-size: 16px; }
  .help-q button span:last-child { width: 32px; height: 32px; }
  .help-q p { padding: 0 8px 20px 0; font-size: 14.5px; }
  .help-empty { padding: 40px 20px; font-size: 20px; }
}
```

- [ ] **Step 8: Chạy test** — `npm test && npm run typecheck`, expected PASS (gồm test scrollbar của `help.css`).

- [ ] **Step 9: PROGRESS.md + lệnh commit**

```bash
git add components/marketing/marketing.css app/seo.css app/bang-gia/pricing.css app/ung-ho/donate.css app/thiet-ke-thiep-rieng/custom.css app/tro-giup/help.css tests/mobile-css.test.ts PROGRESS.md
git commit -m "feat(marketing): phone layouts for landings, pricing, donate, custom design, help and legal"
```

---

### Task 12: Công cụ

Thiết kế mobile:
- Hub `/cong-cu-dam-cuoi`: 6 ô cao 300px chuyển thành 6 thẻ hàng ngang (icon trái, tên + mô tả phải).
- Trang công cụ: form một cột, input 16px.
- Danh sách khách: mỗi khách là một thẻ, tên chiếm cả dòng.

**Files:**
- Modify: `components/tools/tools.css` (cuối file)
- Modify: `tests/mobile-css.test.ts` (thêm `"components/tools/tools.css"`)

- [ ] **Step 1: Thêm file vào `FILES`, chạy test, xác nhận fail**

- [ ] **Step 2: Cuối `components/tools/tools.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  /* hub */
  .tools-hero { gap: 20px; padding: var(--m-hero-top) var(--m-gutter) 32px; }
  .tools-hero__head { gap: 16px; }
  .tools-hero__kicker { font-size: var(--m-kicker); }
  .tools-hero h1 { font-size: var(--m-display-xl); }
  .tools-hero__side p { font-size: var(--m-lede); line-height: var(--m-lede-lh); }
  .tools-hero__chips span { padding: 6px 12px; font-size: 12px; }
  .tools-grid { gap: 12px; padding: 0 var(--m-gutter) var(--m-section-y); }
  .tool-tile { display: grid; grid-template-columns: 52px minmax(0, 1fr); column-gap: 16px; row-gap: 6px; min-height: 0; padding: 22px; border-radius: var(--m-radius-card); }
  .tool-tile:hover { transform: none; box-shadow: none; }
  .tool-tile__top { grid-row: 1 / span 3; flex-direction: column; align-items: center; gap: 8px; }
  .tool-tile__glyph { width: 52px; height: 52px; border-radius: 14px; font-size: 22px; }
  .tool-tile__name { margin-top: 0; font-size: 21px; }
  .tool-tile__desc { font-size: 13.5px; }
  .tool-tile__orbit { top: -40px; right: -40px; width: 140px; height: 140px; }

  /* tool page shell (ToolPage sets max-width and gap inline; padding is ours) */
  .tool-page { padding: var(--m-hero-top) var(--m-gutter) var(--m-section-y); }
  .tool-page h1 { font-size: var(--m-display-l); line-height: 1.15; }
  .tool-crumb a { padding-block: 12px; margin-block: -12px; }
  .tool-guide { margin-top: 40px; }
  .tool-guide h2 { font-size: 21px; }

  /* forms: one column, 16px text */
  .tool-field .input,
  .tool-qr-input,
  .tool-form-grid input,
  .tool-add input,
  .tool-guests__detail .input,
  .tool-std__form input:not([type="file"]) { font-size: var(--m-input-fs); }
  .tool-form-grid { grid-template-columns: minmax(0, 1fr); }
  .tool-segment { width: 100%; }
  .tool-segment button { flex: 1; min-height: var(--m-tap); }
  .tool-add input { flex-basis: 100%; min-width: 0; }
  .tool-add input + input { flex: 1 1 0; min-width: 0; }
  .tool-add__btn { min-height: var(--m-btn-h); }
  .tool-drop { padding: 32px 20px; }
  .tool-qr { justify-content: center; gap: 20px; }
  .tool-qr__side { width: 100%; }
  .tool-qr__dl,
  .tool-std__dl { display: flex; align-items: center; justify-content: center; min-height: var(--m-btn-h); padding: 0 var(--m-btn-px); }
  .tool-copy,
  .tool-outline,
  .tool-dark-pill { display: inline-flex; align-items: center; justify-content: center; min-height: var(--m-tap); }
  .tool-link { min-height: var(--m-tap); padding: 0 6px; }

  /* guest list: each guest is a card, the name owns the first line */
  .tool-titlebar > div { flex-wrap: wrap; }
  .tool-guests__row { flex-wrap: wrap; gap: 6px 12px; padding: 14px 2px; }
  .tool-guests__name { flex: 1 1 100%; font-size: 15px; }
  .tool-guests__group { flex: 1 1 auto; }
  .tool-guests__status { min-height: var(--m-tap); }
  .tool-empty { padding: 36px 20px; }
  .tool-toast { bottom: 20px; max-width: calc(100vw - 2 * var(--m-gutter)); text-align: center; }
}
```

- [ ] **Step 3: Chạy test** — `npm test && npm run typecheck`, expected PASS.

- [ ] **Step 4: PROGRESS.md + lệnh commit**

```bash
git add components/tools/tools.css tests/mobile-css.test.ts PROGRESS.md
git commit -m "feat(tools): row tiles, one-column forms and guest cards on phones"
```

---

### Task 13: Blog

Blog đã có block 760/960 tốt (TOC thu gọn, ảnh lên đầu). Chỉ chỉnh cỡ chữ và vùng chạm.

**Files:**
- Modify: `components/blog/blog.css` (cuối file, sau block `prefers-reduced-motion`)
- Modify: `tests/mobile-css.test.ts` (thêm `"components/blog/blog.css"`)

- [ ] **Step 1: Thêm file vào `FILES`, chạy test, xác nhận fail**

- [ ] **Step 2: Cuối `components/blog/blog.css`**

```css

/* ---------- phones (≤767px): docs/superpowers/specs/2026-10-07-mobile-first-design.md ---------- */
@media (max-width: 767px) {
  .bl-feature__main { gap: 12px; padding: 22px; }
  .bl-feature__title { font-size: var(--m-h2); }
  .bl-feature__excerpt { font-size: 15px; }
  .bl-feature__go { display: inline-flex; align-items: center; min-height: var(--m-tap); }
  .bl-toc--fold summary { display: flex; align-items: center; min-height: var(--m-tap); padding: 0; }
  .bl-toc a { padding-block: 11px; }
  .bl-related h2 { font-size: 24px; }
  .bl-seal { margin-top: 40px; font-size: 36px; }
}
```

- [ ] **Step 3: Chạy test** — `npm test && npm run typecheck`, expected PASS.

- [ ] **Step 4: PROGRESS.md + lệnh commit**

```bash
git add components/blog/blog.css tests/mobile-css.test.ts PROGRESS.md
git commit -m "feat(blog): phone type sizes and 44px links"
```

---

### Task 14: Kiểm chứng cuối phase và tài liệu

Đây là lần browser QA cuối phase.

**Files:**
- Modify (chỉ khi audit tìm ra lỗi): block mobile của file sở hữu selector bị báo
- Modify: `DESIGN.md`, `PROGRESS.md`

- [ ] **Step 1: Gate tĩnh**

Run: `npm test && npm run typecheck && npm run build:next`
Expected: tất cả xanh.

Run: `git diff -U0 HEAD~13 -- '*.css' | grep -E '^-[^-]' || echo "no removed CSS lines"`
(thay `HEAD~13` bằng commit ngay trước Task 1)
Expected: `no removed CSS lines`.

- [ ] **Step 2: Desktop không đổi**

`npx next start -p 3001` chạy nền. Chụp lại 1024/1280/1440 như Task 2 Step 2, vào `.playwright-mcp/parity/after-<vw>.json`. Với mỗi độ rộng:

Run: `node scripts/layout-diff.ts diff .playwright-mcp/parity/baseline-1280.json .playwright-mcp/parity/after-1280.json`
Expected: `0 change(s)` (lặp cho 1024 và 1440).

Nếu có khác biệt: đó là rule mobile bị rò ra desktop (sai media query, hoặc rule gốc bị sửa). Sửa tận gốc rồi chụp lại. Không nới `DYNAMIC` để che lỗi.

- [ ] **Step 3: Audit mobile**

Chụp các viewport `(320, 568)`, `(360, 740)`, `(375, 667)`, `(390, 844)`, `(414, 896)`, `(768, 1024)`, cùng ngang `(667, 375)` và `(844, 390)`, vào `.playwright-mcp/parity/phone-<vw>x<vh>.json`. Thêm `/invite/ho6my9vg` vào `PROBE.routes` nếu `curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/invite/ho6my9vg` trả `200`.

Run: `node scripts/layout-diff.ts audit .playwright-mcp/parity/phone-375x667.json` (lặp cho từng file ≤767px)
Expected: `0 finding(s)` ở mọi file có `vw ≤ 767`. File 768 và hai file ngang ≥768px chỉ cần: không tràn ngang và không ảnh hỏng.

Mỗi finding còn lại được sửa trong block mobile của file sở hữu selector (đúng quy tắc §2), rồi chạy lại `npm test` và chụp lại viewport đó.

- [ ] **Step 4: Console**

`list_console_messages` với `types: ["error", "warn"]`, `pageSize: 50` sau khi probe chạy.
Expected: 0 message của app.

- [ ] **Step 5: Kiểm tra tay những gì probe không đo được (Chrome DevTools MCP, emulate 390×844 touch)**

Đánh dấu từng mục:
- Menu: mở → sheet toàn chiều ngang + nền tối; chạm nền tối → đóng; Escape → đóng.
- `/studio`: phần chọn mẫu ở trên, thanh "Mẫu … · Tiếp tục ↓" dính đáy, bấm thì tới panel tạo thiệp.
- Editor (mở bằng link sửa thật, click qua UI chứ không navigate, vì `#k=` sẽ mất):
  - sheet có tay kéo;
  - focus `.edf-input` không làm trang zoom;
  - preview không còn khung điện thoại.
- `/templates`: lưới 2 cột, nút dưới ảnh bìa; "Xem thử" mở popup dọc; rank rail vuốt được.
- `/templates/song-hy`: hai nút dính đáy khi cuộn.
- `/`: h1 ≤4 dòng, hai nút cạnh nhau, thẻ tính năng vuốt ngang.

Chụp màn hình chỉ khi cần so mắt, lưu bằng `filePath` vào `.playwright-mcp/mobile-*.png`.

- [ ] **Step 6: Thiết bị thật (chủ dự án, hoặc ghi rõ là chưa chạy)**

Trên iPhone (Safari) và Android (Chrome), cả dọc và ngang, kiểm tra:
- Bàn phím không che ô đang gõ: sheet Editor, form RSVP, form thiết kế riêng, đăng nhập.
- Thanh dưới Editor và toast không bị thanh trình duyệt che.

- [ ] **Step 7: Lighthouse mobile sau phase**

`lighthouse_audit` mobile cho 4 route ở Task 2 Step 5 (`outputDirPath: .playwright-mcp/lighthouse/after`).
Expected: Performance và Accessibility không thấp hơn số ở Task 2.

Kill `next start`.

- [ ] **Step 8: `DESIGN.md`**

Thêm mục:

```markdown
## Mobile (≤767px) — độ lệch có chủ đích so với design/

`design/` chỉ có mockup desktop (spec 2026-10-07 D4), nên giao diện điện thoại do MỘC tự thiết kế và chỉ cộng thêm: mọi rule nằm trong block `@media (max-width: 767px)` ở cuối file CSS, desktop không đổi (snapshot diff = 0).

- Token: `--m-*` trong `app/styles/tokens.css` (gutter 20px, section 56px, h1 hero `clamp(34px, 10vw, 42px)`, nút 44px chữ 14px, vùng chạm 44px, input 16px).
- Mẫu: hero gọn, cặp CTA đứng cạnh nhau, danh sách dài thành carousel vuốt ngang, menu và dialog thành sheet, lưới mẫu 2 cột với nút dưới ảnh.
- Trang khách chỉ đổi khi `data-mode="live"` (input 16px, vùng chạm 44px); preview trong Studio giữ đúng design.
- Không `viewport-fit=cover`, không safe-area (site chạy `display: "browser"`).
- Spec: `docs/superpowers/specs/2026-10-07-mobile-first-design.md`.
```

- [ ] **Step 9: `PROGRESS.md`**

- Bảng trạng thái: dòng "Mobile-first" → XONG, kèm kiểm chứng (diff desktop 0 ở 3 độ rộng; audit 0 finding ở 5 độ rộng điện thoại; Lighthouse trước/sau; thiết bị thật đã/chưa chạy).
- Một dòng nhật ký.
- Mục ▶ chỉ việc tiếp theo.
- Xoá các dòng mobile-first trung gian đã lỗi thời.

- [ ] **Step 10: Lệnh commit**

```bash
git add DESIGN.md PROGRESS.md <các file CSS sửa ở Step 3, nếu có>
git commit -m "docs(mobile): record phone design deviations and phase verification"
```

---

## Self-review (đã chạy khi viết plan)

- **Spec coverage:**
  - §2 additive: Global Constraints + `tests/mobile-css.test.ts` + Task 14 Step 1.
  - §2.1 trang khách: Task 6 + test invitation.
  - §3 các nhóm lỗi: chữ Task 9–13; nút Task 5, 9–11; khoảng cách mọi task; input Task 5–8, 10, 12; viewport Task 3; vùng chạm mọi task + audit; menu Task 5; modal Task 7, 8, 10; sticky Task 9; lưới cố định Task 7, 10, 12; hover dính mọi task.
  - §4 token: Task 4.
  - §5 phạm vi N0–N3: Task 3–13.
  - §6.1 baseline: Task 1, 2, 14. §6.2 tiêu chí: Task 14 Step 3–7.
  - §8 việc chủ dự án: mục "Trước khi bắt đầu".
- **Placeholder:** không có TBD. Mỗi bước code có code đầy đủ. Số liệu đo "trước" (Task 2) được ghi lúc chạy, vì không biết trước.
- **Tên nhất quán:**
  - `Snapshot`, `RouteSnapshot`, `diffSnapshots`, `auditMobile`, `DYNAMIC`, `SWATCH` dùng giống nhau ở Task 1 và 14.
  - Token `--m-lede-lh` có trong Task 4 và được dùng ở Task 5, 9–12.
  - `--m-header-h: 61px` dùng ở Task 5, 7, 10, 11.
  - Keyframes mới có tiền tố `m` (`mMenuFade`, `mMenuSheet`, `mSheetUp`, `mLoginSheet`) để không đụng keyframes cũ.
