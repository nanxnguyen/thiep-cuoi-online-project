# Giao diện mobile-first cho toàn site — Design Spec

**Ngày:** 2026-10-07

**Trạng thái:** Chủ dự án đã duyệt hướng đi trong phiên brainstorming 2026-10-07. Spec này chờ chủ dự án đọc lại.

**Mục tiêu:** Trên điện thoại, MỘC phải giống một ứng dụng được thiết kế cho mobile, không phải bản desktop thu nhỏ. Cần đẹp nhất có thể ở 320–767px. **Giao diện desktop (≥1024px) phải giữ nguyên từng pixel.**

## 1. Quyết định đã chốt

| # | Quyết định | Nguồn |
|---|---|---|
| D1 | Làm toàn bộ site trong một phase, chia task theo nhóm component và độ ưu tiên | Chủ dự án, 2026-10-07 |
| D2 | Điều hướng: giữ header, nâng menu thành sheet toàn chiều ngang; không dùng bottom tab bar | Chủ dự án, 2026-10-07 |
| D3 | Desktop không được đổi. Mobile được thiết kế lại tự do | Chủ dự án, 2026-10-07 |
| D4 | `design/` không ghim giá trị mobile nào. Các `@media` duy nhất trong mockup là `prefers-reduced-motion` và `Thiep Preview` `min-width: 860px` (đã port). Vì vậy quy tắc fidelity 100% chỉ áp dụng cho desktop; mỗi giá trị mobile được ghi vào `DESIGN.md` như một độ lệch có chủ đích | Kiểm tra `design/*.dc.html` |
| D5 | **Không bật `viewport-fit=cover`, không làm safe-area.** Manifest để `display: "browser"`; ở chế độ này Safari tự giữ nội dung ngoài tai thỏ/home bar, và `env(safe-area-inset-*)` bằng 0 khi không có `cover`. Thêm `cover` + safe-area chỉ khi app chuyển sang PWA standalone | `app/manifest.ts` |

## 2. Quy tắc bất biến: chỉ cộng thêm (additive-only)

Desktop được bảo vệ bằng cách làm, không bằng sự cẩn thận:

1. **Mọi thay đổi giao diện nằm trong block mới** `@media (max-width: 767px)` (thêm `@media (max-width: 479px)` / `(max-width: 359px)` để tinh chỉnh 320–414) **đặt ở cuối file CSS sở hữu selector đó**. Đặt cuối file vì media query không cộng specificity. Rule mobile phải đứng sau rule gốc trong cùng file thì mới thắng.
2. **Không sửa, không xoá dòng CSS nào đã có**, gồm cả `clamp()`, padding và token gốc. `git diff -U0 -- '*.css'` không được có dòng bắt đầu bằng `-`. Không gom breakpoint cũ (380/560/760/860/900/960/1023/1100): mỗi ngưỡng ở 768–1100px đã QA và giữ nguyên.
3. **Phần tử mới chỉ dùng trên mobile** (ví dụ thanh "đã chọn mẫu" ở `/studio`) được thêm một rule gốc `display: none` và chỉ hiện trong block mobile. Rule này không chạm phần tử cũ nên desktop không đổi.
4. **Không dùng `@media (pointer: coarse)` hay `(hover: none)` làm công tắc.** Hai điều kiện này khớp cả iPad ≥1024px và laptop cảm ứng (desktop), và không đo được trong cách QA bằng iframe trên Chrome desktop.
5. **Không tách component theo thiết bị.** Markup chỉ đổi khi CSS không làm được (ví dụ cần `<details>` để thu gọn), và thay đổi đó phải trông y hệt trên desktop.
6. **Token mobile** đặt trong `app/styles/tokens.css` dưới dạng `:root` bên trong `@media (max-width: 767px)`. Rule ở từng file chỉ đọc `var(--m-*)`.

### 2.1 Trang thiệp khách là trường hợp riêng

`InvitationRenderer` render ở ba nơi: trang khách `/invite/[slug]` (`data-mode="live"`), xem mẫu `/templates/[id]?preview=1`, và khung điện thoại trong Studio (`.ed-frame`, khoảng 380px, nằm trên desktop 1280px). Cột thiệp `.inv-col` có `max-width: 430px` ở **mọi** độ rộng, tức là đã là layout điện thoại.

- Viewport `@media` không bao giờ kích hoạt trong khung Studio trên desktop, nên preview luôn giữ đúng design.
- **Không được thêm `container-type` vào `.inv-col` hay `.inv-stage`.** Thuộc tính đó bật layout containment, biến cột thành containing block cho `position: fixed`. Khi đó phong bì `.inv-gate` và nút nhạc `.inv-music` sẽ neo vào cột 430px thay vì màn hình, và trang khách trên desktop sẽ vỡ.
- Sửa cho khách trên điện thoại viết thành `@media (max-width: 767px) { .inv-stage[data-mode="live"] … }`. Chấp nhận một khác biệt có ghi chép: preview trong Studio giữ input 13px theo design, còn điện thoại thật dùng 16px.

## 3. Hiện trạng (audit 2026-10-07)

Audit tĩnh toàn bộ `app/` và CSS liên quan trong `components/`. QA trước đó (2026-10-04) đã xác nhận 0 tràn ngang ở 390px, nên vấn đề là **cảm giác desktop thu nhỏ**, không phải layout vỡ.

| Nhóm | Phát hiện | Bằng chứng |
|---|---|---|
| Chữ display | 21 heading có sàn `clamp()` ≥34px, và không trang nào hạ xuống trên điện thoại. Hero Trang chủ `clamp(50px, 6.6vw, 96px)` thành 6 dòng ở 304–390px | `home.css:40`, `gallery.css:9`, `tools.css:63`, `demo.css:3`, `donate.css:11`, `help.css:7`, `pricing.css:6` (`clamp(140px…)`) |
| Nút CTA | Mỗi trang tự viết pill riêng, padding 16/26–32px, cao khoảng 50–54px, hai nút xếp hai hàng | `.hm-btn-red/.hm-btn-line/.hm-price__cta`, `.lp-cta`, `.lp-qr-hero__copy > a`, `.tdt__actions a`, `.pricing-cta`, `.donate-quote a`, `.cd-zalo-btn`, `.footer__cta a`, `.gal-suggest button`, `.gal-demo__actions a/button`, `.acc-claim button`, `.acc-form button` |
| Khoảng cách | Padding section 88–120px và padding ngang 32px của desktop được giữ nguyên trên điện thoại | 30 khai báo ≥64px; `home.css` có 0 media query |
| Input | Chữ input dưới 16px làm iOS Safari tự zoom khi focus. **Có ở form khách thật** | `.edf-input` 14px (Editor), `.input` 15px, `.inv-rsvp__row input` 13px, `.inv-wishform textarea` 13px, `tools.css` 14–15px, `.acc-form input` 15px, `.acc-claim input` 14px, `.gal-suggest input` 14px, `.sh__fields input[type=date]` 14px |
| Viewport | Không có `viewport` export: thiếu `themeColor` (thanh trình duyệt không cùng màu giấy ngà) và `interactiveWidget` (Chrome Android không co layout khi mở bàn phím, nên sheet Editor bị bàn phím che) | `app/layout.tsx` |
| Vùng chạm | Nhiều điều khiển dưới 44px | `.chip` 36px, `.ed-switch` 32×18, `.ed-item__main` khoảng 38px, `.ed-seg button` khoảng 28px, `.donate-rows button` khoảng 30px, `.tdt__colors a` 32px, `.demo-color i` 22px, `.ed-chipbtn` khoảng 26px, `.moc-welcome button` 32px |
| Menu | `<details>` thả xuống, rộng 220px, dòng 11px padding (khoảng 41px) | `globals.css:440-490` |
| Modal | Dialog đăng nhập, xuất bản và xem thử mẫu nổi giữa màn hình kiểu desktop | `.login-dlg`, `PublishDialog`, `.gal-demo` |
| Sticky | Sticky vẫn bật khi đã xuống một cột, nên phần intro bám đè lên danh sách | `.hm-tools__intro` (`top: 120px`), `.demo-*` đã xử lý, `.help-sidebar` đã xử lý |
| Lưới cố định | Lưới nhiều cột chật ở 320px | `.demo-family-grid` 5 cột (chữ 9px), `.sh__fields` 1fr 1fr, `.gal-stats` 3 cột, `.edf-three`/`.edf-tpls`/`.edf-fonts` 3 cột, `.hm-stats` 4 thẻ dồn 1 cột |
| Chữ nhỏ | 70 khai báo ≤11px; 24 trong `thiep-preview.css` là mockup thu nhỏ (giữ) | — |
| Hover dính | Hiệu ứng nâng/xoay trên thẻ bị "kẹt" sau khi chạm | `.hm-feat:hover`, `.card--lift:hover`, `.hm-marquee__track > a:hover`, `.demo-family:hover`, `.hm-tools__list > a:hover` (đổi padding, làm nhảy layout) |

**Đã ổn, không làm lại:** trang thiệp khách (mobile-first, cột 430px, `100dvh`); Editor dưới 1024px đã có bottom sheet; `/tro-giup` đã có sidebar cuộn ngang; `/templates/[id]` và `/demo` đã có block 760/860.

## 4. Ngôn ngữ thiết kế mobile

Giữ nguyên nhận diện (giấy ngà, đỏ sơn mài, vàng kim, Playfair cho tiêu đề, Be Vietnam Pro cho chữ thường) và hạ nhịp để vừa màn hình nhỏ: **gọn, nhiều khoảng thở theo chiều dọc, mỗi màn hình một ý.**

### 4.1 Token mobile (`tokens.css`, trong `@media (max-width: 767px)`)

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--m-gutter` | `20px` (`16px` khi ≤359px) | padding ngang mọi section |
| `--m-section-y` | `56px` | padding dọc section (thay 88–120px) |
| `--m-section-y-s` | `40px` | section phụ, band nối tiếp |
| `--m-hero-top` / `--m-hero-bottom` | `28px` / `40px` | hero mọi trang |
| `--m-stack` | `20px` | gap giữa các khối trong một cột |
| `--m-display-xl` | `clamp(34px, 10vw, 42px)` | h1 hero chính: Trang chủ, gallery, công cụ |
| `--m-display-l` | `clamp(30px, 8.6vw, 36px)` | h1 các trang khác |
| `--m-h2` | `clamp(26px, 7.4vw, 30px)` | h2 section |
| `--m-h3` | `20px` | tiêu đề thẻ |
| `--m-lede` | `16px / 1.65` | đoạn mở đầu (thay 17px/1.75) |
| `--m-body` | `15px / 1.6` | thân bài |
| `--m-kicker` | `11px`, letter-spacing `.2em` | dòng kicker |
| `--m-btn-h` | `44px` | chiều cao nút |
| `--m-btn-px` | `20px` | padding ngang nút |
| `--m-btn-fs` | `14px`, weight 500 | chữ nút |
| `--m-tap` | `44px` | vùng chạm tối thiểu |
| `--m-input-fs` | `16px` | mọi input/select/textarea |
| `--m-radius-card` | `18px` | thẻ |
| `--m-header-h` | `60px` | offset cho mọi phần tử sticky dưới header |

`--fs-h1` và `--fs-h2` được ghi đè trong cùng block để các h1/h2 dùng rule chung tự hạ theo.

### 4.2 Mẫu thành phần

| Thành phần | Mobile (≤767px) |
|---|---|
| **Hero** | Padding `--m-hero-top/bottom`, gap 20px. h1 `--m-display-xl` (≤4 dòng ở 375px, ≤5 dòng ở 320px), `letter-spacing: -.02em`. Lede `--m-lede`. CTA nằm trong màn hình đầu ở 375×667 |
| **Cặp CTA** | Hai nút xếp ngang, mỗi nút `flex: 1 1 0` (lưới 2 cột bằng nhau) khi ≥360px; dưới 360px xếp dọc. Nút cao 44px, chữ 14px. **Không làm nút full-width đơn lẻ mặc định**, vì người dùng chê nút to |
| **Danh sách thẻ dài** (8 thẻ tính năng Trang chủ, rank rail) | Carousel ngang `scroll-snap-type: x mandatory`, thẻ rộng 78vw, lộ mép thẻ kế tiếp để báo còn nội dung, thanh cuộn ẩn |
| **Bước 01-02-03** | Dạng hàng: số 40px bên trái, tiêu đề + mô tả bên phải (lưới `48px 1fr`) |
| **Số liệu** | Lưới 2×2 thay vì 4 hàng dọc; số 32px |
| **Section tối** (guest band, pricing band) | Radius 22px, padding 40px 24px, vòng trang trí thu nhỏ 60% |
| **Menu** | Sheet toàn chiều ngang ngay dưới header, scrim mờ phía sau, mỗi dòng 52px chữ 17px, CTA "Tạo thiệp" đặt cuối sheet (cao 48px). Từ 768–900px giữ dropdown hiện tại |
| **Modal** | Bottom sheet: sát đáy, `border-radius: 24px 24px 0 0`, `max-height: calc(100dvh - 24px)`, tay kéo trang trí 36×4px ở đỉnh, trượt lên 280ms (tắt khi `prefers-reduced-motion`) |
| **Form** | Một cột; nhãn trên ô nhập; input cao ≥46px, chữ 16px; nút gửi `align-self: stretch` **chỉ trong form** |
| **Danh sách công cụ / FAQ** | Hàng chạm cao ≥56px; FAQ giữ accordion sẵn có, nút `+` vùng chạm 44px |
| **Footer** | Padding 48px `--m-gutter` 32px; CTA h2 32px; cột link 2 cột, cột thương hiệu chiếm cả hàng |
| **Hover** | Trong block mobile, đặt lại `transform` của các hover nâng/xoay về `none` và bỏ hover đổi padding, để không còn trạng thái kẹt sau khi chạm |

## 5. Phạm vi theo nhóm

Thứ tự là thứ tự ưu tiên.

| Nhóm | Bề mặt | File |
|---|---|---|
| **N0 Nền tảng** | viewport, token, primitive, header/menu/footer, công cụ đo | `app/layout.tsx`, `lib/site.ts`, `tokens.css`, `globals.css`, `motion.css`, `scripts/` |
| **N1 Luồng chính** | Trang khách live, Studio (tạo + Editor + dialog), header/menu, đăng nhập | `invitation.css`, `studio.css`, `panels.css`, `account.css` (`.login-dlg`), `globals.css` |
| **N2 Marketing** | `/`, `/templates`, `/templates/[id]`, `/demo`, `/bang-gia`, `/ung-ho`, `/thiet-ke-thiep-rieng`, 4 landing SEO, `/tro-giup`, pháp lý, 404 | `home.css`, `gallery.css`, `detail.css`, `demo.css`, `pricing.css`, `donate.css`, `custom.css`, `seo.css`, `marketing.css`, `help.css` |
| **N3 Còn lại** | `/cong-cu-dam-cuoi` + 6 công cụ, `/blog` + bài, `/account` | `tools.css`, `blog.css`, `account.css` |

**Ngoài phạm vi:** `/docs` (Swagger, nội bộ); `thiep-preview.css` và 50 cover (`components/templates/covers/*.css`), vì đó là thiệp thu nhỏ đo bằng `cqw`; bottom tab bar; mọi thay đổi ở ≥768px trừ safe-area; nội dung/copy.

## 6. Bảo vệ desktop và kiểm chứng

### 6.1 Snapshot layout desktop

Trong repo không có script extractor, nên phase này viết một script dùng lại được:

- `scripts/layout-probe.js`: đoạn JS chạy qua Chrome DevTools MCP `evaluate_script`. Nó lặp các route của `lib/route-inventory.ts` trong iframe cùng origin (rộng bằng đích + 15px cho thanh cuộn), bật reduced motion, chờ font tải xong.
  - Với mỗi phần tử trong `body`, ghi `offsetLeft/Top/Width/Height` (không bị ảnh hưởng bởi `transform` của animation) cùng computed `font-size`, `line-height`, `font-family`, `font-weight`, `letter-spacing`, `color`, `background-color`, `padding`, `margin`, `gap`, `display`, `grid-template-columns`, `flex-direction`, `border-radius`.
  - Lưu ra file qua tham số `filePath`, không đưa vào context.
- `scripts/layout-diff.ts`: so hai file JSON, in số khác biệt theo route và 20 khác biệt đầu tiên. Logic có `tests/layout-diff.test.ts`.
- **Baseline chụp một lần trước khi sửa dòng CSS đầu tiên**, ở 1024, 1280 và 1440px, lưu `.playwright-mcp/parity/baseline-<width>.json` (thư mục đã git-ignore). Đây là một lần chạy trước phase, không phải QA giữa chừng.
- **Cuối phase:** chạy lại và diff phải ra **0 khác biệt** ở cả ba độ rộng. Riêng nội dung động (đếm ngược, marquee mount dần) được loại theo danh sách selector cố định trong script.

### 6.2 Tiêu chí hoàn thành mobile

Đo ở 320, 360, 375, 390, 414, 768px dọc, cùng ngang 667×375 và 844×390:

1. Không tràn ngang (`scrollWidth ≤ clientWidth`), 0 ảnh hỏng, 0 lỗi hoặc cảnh báo console.
2. Mọi phần tử tương tác (`a`, `button`, `input`, `select`, `textarea`, `summary`, `[role=button]`) đang hiện có hộp chạm ≥44×44px ở ≤767px.
   - Vùng chạm mở rộng bằng `::after { position: absolute; inset: -Npx }` được tính vào kích thước.
   - Ngoại lệ 1: link nằm trong đoạn văn (`p a`).
   - Ngoại lệ 2: nhóm chấm màu (`gal-swatches`, `gal-dots`, `tdt__colors`, `demo-color`, `pn-color-options`, `pq__swatches`, `edf-swatch`) chỉ cần ≥24×24px theo WCAG 2.5.8 AA, vì một hàng chấm 44px không vừa trong thẻ 2 cột. Danh sách nằm trong `lib/layout-audit.ts` (`SWATCH`).
3. Mọi `input/select/textarea` có `font-size ≥ 16px` ở ≤767px.
4. Hero `/`: h1 ≤4 dòng ở 375px, ≤5 dòng ở 320px; hai CTA nằm trọn trong 667px đầu ở 375×667.
5. Phần tử fixed/sticky (thanh dưới Editor, toast, sheet) không bị thanh công cụ trình duyệt che: kiểm tra trên iPhone thật (Safari) và Android thật (Chrome), cả dọc lẫn ngang.
6. Bàn phím ảo: ô đang gõ trong sheet Editor, form RSVP, form thiết kế riêng và đăng nhập luôn nhìn thấy được trên iOS Safari và Chrome Android.
7. Desktop: diff baseline bằng 0 (mục 6.1).
8. Gate: `npm test`, `npm run typecheck`, `npm run build:next` xanh. Lighthouse mobile của `/`, `/templates`, `/studio` và một trang khách không tụt điểm Performance/Accessibility so với lần đo trước phase.

## 7. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Rule mobile thua specificity của rule gốc (ví dụ `.tdt__actions a:first-child`) | Selector trong block mobile phải giống hệt rule gốc, và đặt cuối file |
| CSS route bị nạp theo thứ tự khác giữa các trang | Mỗi file chỉ ghi đè selector của chính nó; không sửa selector của file khác từ `globals.css` |
| Không có `cover` nên trên iPhone có dải nền hai bên khi xoay ngang | Chấp nhận (D5); nền `body` là `--paper` nên dải này cùng màu giấy |
| `interactiveWidget: "resizes-content"` thay đổi chiều cao `dvh` khi mở bàn phím trên Android | Có chủ đích, để sheet co lên trên bàn phím; kiểm ở tiêu chí số 6 |
| Hex trong `layout.tsx` làm fail `tests/design-system.test.ts` | Đặt `THEME_COLOR` trong `lib/site.ts` (ngoài phạm vi test quét) |
| Quy tắc "không Playwright/browser giữa feature" | Baseline chỉ chụp một lần trước phase, và sweep một lần cuối phase, đều qua Chrome DevTools MCP |

## 8. Việc chủ dự án cần làm trước

- Commit phần việc đang nằm ở working tree (lệnh ở `PROGRESS.md`). Khi đó `git diff` của phase này chỉ còn thay đổi mobile, và người review kiểm được quy tắc additive-only bằng mắt.
