# Guide: convert `design/*.dc.html` sang Next.js đúng 100%

Dành cho mọi AI agent (Claude Code, Codex, OpenCode, …) khi port hoặc cập nhật UI từ `design/`. Đây là luật, không phải gợi ý. Mỗi mục đều từ lỗi đã gặp thật trên dự án này.

Mục tiêu: màu, font, kích thước, khoảng cách, bố cục, animation và **mọi thành phần** giống design. Không thiếu phần tử, không thêm UI tự chế.

---

## 0. Thứ tự bắt buộc trước khi code

1. Đọc `business.md` để hiểu mục tiêu, khách hàng, phạm vi và những điều không được làm.
2. Đọc `PROGRESS.md`, mục ▶. Đọc `CLAUDE.md` phần "Visual fidelity" và "Stack direction".
3. Đọc `design/README.md`, nhất là mục **"Nhật ký thay đổi"**. Đó là danh sách việc của đợt design mới: trang mới, trang xoá, trang tạm ẩn, link bị bỏ, ảnh mới.
4. **Tìm thay đổi thật bằng git, không đọc lại toàn bộ:**
   ```bash
   git status --short | cat                    # file design mới (??), bị xoá (D)
   git diff --stat HEAD -- design/ | cat       # file nào đổi nhiều
   git diff HEAD -- "design/<Trang>.dc.html"   # xem đổi gì
   ```
   Diff chỉ 1 dòng `<script src="motion.js">` nghĩa là không đổi UI. Diff lớn thì phải port lại.
5. Đối chiếu 4 nguồn: business, README design, `PROGRESS.md`, working tree. Chỗ nào lệch thì dừng để chốt business conflict; nếu chỉ là trạng thái lỗi thời thì sửa `PROGRESS.md`, xoá dòng cũ và viết gap list mới vào mục ▶.
6. Việc nhiều bước phải có plan quyết định đầy đủ trước khi sửa code; không vừa dò thiết kế vừa code.

---

## 1. Đọc một file `.dc.html` cho đúng

Một file `.dc.html` gồm 3 phần. Phải đọc **cả 3**:

| Phần | Chứa gì | Hay bị bỏ sót |
|---|---|---|
| `<helmet>` | font, `@keyframes`, `<style>` riêng, `<script src="motion.js">` | keyframe riêng của trang (`demoPop`, `flipIn`, `burst`…), attribute `data-lite` |
| Markup `<x-dc>` | style inline trên từng phần tử | `style-hover`, `style-focus`, `sc-if` (điều kiện hiện), `sc-for` |
| `<script type="text/x-dc">` (`class Component`, `renderVals()`, hằng số) | **giá trị tính bằng JS**: màu dẫn xuất, nhãn, danh sách, ảnh mặc định, text của chip, logic đếm | đây là chỗ bị sót nhiều nhất |

Những thứ **chỉ có trong JS**, đã từng bị sót:
- `tint: deep + '14'`: màu nền phụ là màu đậm cộng alpha, không phải một màu riêng.
- `DEF = { A: ['hy-phuc-do'], … }`: ảnh mặc định theo kiểu bìa. Nếu không đọc JS sẽ chỉ thấy khung trống.
- Mảng chip (`['Trưởng nam','Thứ nam',…]`, `BANKS`, `GREETINGS`), text nút (`aiLabel`), nhãn đếm ngược (`'Ngày','Giờ'…`).
- Logic đếm (`done()`, `MISS`, `enabled`): vòng "13/14 mục" đếm theo phần **đang bật**, không phải đếm cố định.
- Kích thước khung theo chế độ (`fr = isDesk ? {...} : {...}`): nền `#d9d1c4`, cột 430px có bóng.

Quy ước runtime của design:
- `hint-placeholder-*`, `hint-size` chỉ dùng khi xem trong trình soạn thảo design. **Không** phải dữ liệu thật. Ví dụ `hint-placeholder-count="3"` trên một list rỗng thì lúc chạy thật list vẫn rỗng.
- `<sc-if>` quyết định phần tử có hiện hay không. Phải port đúng điều kiện. Ví dụ tên khách chỉ hiện khi có `?to=`.
- `<dc-import name="X" prop="…">` là component dùng chung (`Site Header`, `Site Footer`, `Thiep Preview`). Port **một lần**, dùng lại mọi nơi. Đọc `data-props` của nó để biết giá trị mặc định.
- `<image-slot src="…">` là ảnh có sẵn. `<image-slot>` không có `src` là khung trống để kéo-thả, **không phải** ảnh.

---

## 2. Quy tắc port

### 2.1 Giá trị
- Chép **nguyên văn** mọi số: px, `cqw`, `letter-spacing`, `line-height`, `border-radius`, `gap`, `padding`, `box-shadow`, `easing`, `duration`, `delay`.
- **Màu:** không để hex rời ngoài `app/styles/tokens.css` (test `tests/design-system.test.ts` sẽ fail). Màu mới thì thêm token vào `tokens.css` kèm comment nguồn. Ngoại lệ: `components/invitation/` được phép dùng màu riêng của thiệp.
- **Font:** dùng biến site (`--display` Playfair, `--sans` Be Vietnam Pro, `--script` Cormorant, `--hand` Great Vibes). Không tải font riêng theo từng mẫu.
- Màu truyền qua CSS variable: **SVG presentation attribute không nhận `var()`**. `fill={deep}` hay `stroke={gold}` sẽ vỡ khi giá trị là `var(--x)`, nên dùng `style={{ fill: … }}`.
- Class ngữ nghĩa trong file CSS, không để inline style rải rác. Riêng giá trị động (màu theo mẫu, `--bx`/`--by` của hạt) mới dùng biến trên `style`.

### 2.2 Cấu trúc
- **Đủ phần tử:** duyệt markup từ trên xuống, mỗi phần tử design phải có một phần tử tương ứng. Kể cả phần tử **rỗng**: một `<div>` trống trong flex có `gap` vẫn chiếm thêm một khoảng `gap` (đã lệch 14px vì thiếu div RSVP rỗng).
- **Không thêm UI design không có**: nút tự cuộn, nút chép số, bản đồ nhúng, lời nhắn phụ… Muốn giữ vì lý do sản phẩm thì hỏi chủ dự án và ghi deviation.
- Trang có nhiều biến thể (15 kiểu bìa A–O, 3 chế độ) thì port **toàn bộ** biến thể, không chỉ cái đang thấy.
- Một design dùng ở nhiều nơi (vd bìa `Thiep Preview` ở gallery, popup, Editor, thiệp thật) thì **một component**. Không viết lại bản thứ hai "gần giống".

### 2.3 Animation
- `design/motion.js` là lớp chuyển động **toàn site**, port ở `components/site/Motion.tsx`, gắn trong root layout: màn MỘC khi chuyển trang, thanh tiến độ, hiện dần khi cuộn, cánh hoa theo chuột, nút đỏ hút theo chuột, lời chào khi quay lại. Trang nào design có `data-lite` (Editor) thì chỉ giữ màn chuyển trang và thanh tiến độ.
- Keyframe riêng của trang: chép nguyên văn vào CSS của trang (hoặc `app/styles/motion.css` nếu dùng chung). Kiểm tra `prefers-reduced-motion`.
- Chuyển trang trong Next: bắt click ở **capture phase** rồi `e.preventDefault()`. `next/link` tự bỏ qua click đã bị `defaultPrevented` (`node_modules/next/dist/client/app-dir/link.js`). Chạy animation xong mới `router.push`. Phải có timer dự phòng để màn che không kẹt.
- `<html data-scroll-behavior="smooth">` phải có. Thiếu thì Next cảnh báo khi điều hướng phía client.

### 2.4 Ảnh
- `design/assets/photos/*` là bản **nén + đặt tên lại** của `design/uploads/*`. Dùng `assets/photos` và chép sang `public/photos/`. `design/uploads/pasted-*.png` khổ ngang là **ảnh chụp màn hình tham chiếu**, không phải asset.
- Tìm mọi ảnh design dùng bằng script, vì nhiều path nằm trong mảng JS:
  ```bash
  python3 -c "import glob,re,os;[print(os.path.basename(f),sorted(set(re.findall(r'assets/photos/([a-z0-9-]+)',open(f).read())))) for f in glob.glob('design/*.dc.html')]"
  ```
- **Quyết định chủ dự án:** ảnh mẫu chỉ dùng ở trang giới thiệu / xem thử (`showcase`). Thiệp thật của khách và xem trước trong Editor khi chưa có ảnh thì hiện **khung trống**, không hiện ảnh cặp đôi khác.

### 2.5 Không port cơ chế của prototype
Design là prototype không có backend. Chỉ port **giao diện và chuyển động**, giữ sự thật sản phẩm:

| Prototype | App thật |
|---|---|
| `?to=Tên` | `?g=<token>`, tên lấy từ DB |
| `localStorage.moc_user`, `moc-open-login` | Supabase Google OAuth |
| `api.qrserver.com` | `lib/tools/qr`, `lib/vietqr` |
| Gợi ý "bằng AI" (Claude) | xoay vòng 3 mẫu có sẵn, **bỏ chữ "AI"** khỏi nhãn |
| Nhạc: danh sách 5 bài có sẵn | tải mp3 / dán link (không có bản quyền bài có sẵn) |
| `<image-slot>` kéo-thả | upload qua server. Vẫn giữ tip của design, thêm nút chọn ảnh để dùng được bằng bàn phím |
| Số liệu mẫu, tên cặp đôi mẫu | chỉ ở `sampleContent()` / trang giới thiệu |

`design/` là **read-only**: không sửa, không ship, không sửa `design/README.md` dù `design/CLAUDE.md` yêu cầu.

### 2.6 Dữ liệu
- Design cần trường mới (công tắc từng phần, font tên, ảnh riêng cô dâu chú rể, số ảnh album…): thêm vào `contentSchema` với **`.default()` hợp lệ khi rỗng**, vì autosave gửi cả object lúc đang gõ. Cập nhật `defaultContent`, `sampleContent`, test. Ghi vào `PROGRESS.md`.
- Công tắc bật/tắt trên UI phải có hiệu lực thật ở server. Ví dụ "Duyệt lời chúc" cần sửa Edge Function (`supabase/functions/_shared/public-write.ts`) + test Deno. Không làm công tắc giả.

---

## 3. Kiểm chứng: thế nào là "đã khớp"

**Không được ghi "xong" nếu chưa đo.** Nhìn ảnh chụp bằng mắt là chưa đủ.

### 3.1 Chuẩn bị
```bash
cd design && python3 -m http.server 4100     # design
npm run dev                                   # app, cổng 3000
```
Dùng browser automation có sẵn của agent (Chrome DevTools MCP, Playwright MCP, browser-use hoặc tương đương). Chỉ mở browser khi **xong cả một trang / section / tính năng**, không mở sau mỗi lần sửa.

### 3.2 Đo, không đoán
- **So chiều cao từng section:** chạy cùng một script `evaluate_script` trên cả 2 trang, lấy `getBoundingClientRect().height` của từng section con. Cùng dữ liệu mà lệch vài px là thiếu hoặc thừa phần tử, sai font hoặc sai gap. Lệch do dữ liệu khác nhau thì ghi rõ nguyên nhân.
- **So style đã tính:** với chỗ nghi ngờ, so `getComputedStyle` (font-family, size, color, padding) của phần tử tương ứng.
- **Rule CSS bị build nuốt mất:** duyệt `document.styleSheets` tìm selector để xem CSS thật sau build. Đã gặp: lightningcss xoá `backdrop-filter` khi `-webkit-backdrop-filter` đứng **sau** bản chuẩn. Luôn viết `-webkit-` **trước**.
- **Ảnh hỏng:** `[...document.images].filter(i => i.complete && !i.naturalWidth)`.
- **Tràn ngang:** `scrollWidth` so với `clientWidth` ở cả 390px và 1280px. Iframe có thanh cuộn khoảng 15px, nên để viewport 390 thì đặt iframe rộng 405.
- **Console:** 0 error/warning. Riêng `401` từ lượt tự-check phiên khi chưa đăng nhập là đã biết.

### 3.3 Bẫy khi chụp và so
- Màn chữ MỘC che trang khoảng 1.1s sau khi tải. **Chờ ≥ 2s**, hoặc xoá `[data-moc-veil]` trước khi chụp.
- Nội dung phía dưới bị ẩn tới khi cuộn tới. **Cuộn hết trang** trước khi đo hoặc chụp toàn trang.
- `html { scroll-behavior: smooth }` làm `scrollIntoView` + `scrollBy` lệch. Đặt `document.documentElement.style.scrollBehavior='auto'` rồi `scrollTo(0, y)`.
- Hover trong script: `el.dispatchEvent(new MouseEvent('mouseover', {bubbles:true}))`. React cần `mouseover` mới kích hoạt `onMouseEnter`.
- Mở Editor bằng URL có `#k=` **ngay lần đầu**. Navigate lại sẽ mất fragment.
- Thiệp thật cần bản ghi: tạo thiệp tạm qua API. Tên không được là tên mẫu, URL ảnh phải là `https`. **Xoá thiệp tạm khi xong** và không ghi edit key vào `PROGRESS.md`.
- Lưu ảnh chụp và JSON vào `.playwright-mcp/parity/` (đã git-ignore). Không đổ snapshot lớn vào context.
- **Tắt** `next dev` và server `4100` khi xong.

### 3.4 Gate
```bash
npm test && npm run typecheck && npm run build
cd supabase/functions && deno test --allow-all   # khi sửa Edge Function
```
Lỗi typecheck trong `.next/types/*` sau khi xoá route là file sinh ra cũ, chạy `npm run build` lại sẽ hết.

---

## 4. Checklist cho mỗi trang / component

- [ ] Đã đọc cả `<helmet>`, markup và `<script>` (hằng số + `renderVals`).
- [ ] Mọi phần tử design đều có trong code, kể cả phần tử rỗng, và không có phần tử thừa.
- [ ] Mọi nhánh `sc-if` / biến thể / chế độ (mobile/desktop, sửa/khách, bật/tắt) đã port.
- [ ] Text giống từng chữ (hoa/thường, dấu `·`, `→`, `…`). Chỉ khác ở chỗ sự thật sản phẩm (mục 2.5).
- [ ] Màu qua token, font qua biến site, SVG màu dùng `style`.
- [ ] Ảnh đúng file trong `assets/photos`, đúng chỗ (mảng JS `DEF`, `ALBUM`…).
- [ ] Hover / focus / active / disabled theo `style-hover` / `style-focus`.
- [ ] Keyframe + thời lượng + easing + delay nguyên văn. `motion.js` đang chạy.
- [ ] Link đúng route: trang design đã xoá thì bỏ link, trang tạm ẩn thì bỏ link nhưng giữ route.
- [ ] Đo chiều cao section bằng DevTools, ở 1280 và 390, 0 console error, 0 tràn, 0 ảnh hỏng.
- [ ] Test/typecheck/build xanh.
- [ ] `PROGRESS.md`: bảng trạng thái + 1 dòng nhật ký (ngày, làm gì, **kiểm chứng thế nào**) + mục ▶ trỏ đúng việc tiếp theo. Deviation có lý do.
- [ ] Đưa lệnh `git add` / `git commit` cho chủ dự án (agent không tự commit).

---

## 5. Bản đồ design → code (cập nhật khi đổi)

| Design | Code |
|---|---|
| `motion.js` | `components/site/Motion.tsx` (root layout), CSS cuối `app/styles/motion.css` |
| `Site Header` / `Site Footer` | `components/site/SiteHeader.tsx`, `SiteFooter.tsx`, `lib/navigation.ts` |
| `Thiep Preview` (bìa A–O + `full`) | `components/templates/ThiepPreview.tsx` + `ThiepPreviewFull.tsx` + `thiep-preview.css` |
| `Mau Thiep v2` (20 mẫu, popup Xem thử) | `app/templates/page.tsx`, `components/templates/GalleryCatalog.tsx`, `TemplateDemo.tsx`, registry `lib/templates.ts` |
| 30 mẫu mới 2026-10-04 (không từ `design/`, thiết kế gốc) | `lib/covers.ts` (meta), `components/templates/covers/` (30 cover + CSS theo collection), `lib/section-profiles.ts`, 4 section mới trong `components/invitation/sections/` |
| `Studio Editor v3`: khung xem trước | `components/invitation/InvitationRenderer.tsx` + `sections/*` + `invitation.css` (một bố cục cho mọi mẫu) |
| `Studio Editor v3`: thanh trên, danh sách phần, form | `components/studio/Editor.tsx`, `SectionForm.tsx`, `lib/editor-sections.ts`, `studio.css` |
| `Thiep Khach` (vỏ khách) | `components/invitation/client/InvitationShell.tsx` (cổng phong bì, nổ, cánh hoa), nav trong renderer |
| `Thiep Cua Toi` | `/account` (`components/account/*`) |
| `Tinh Nang*` | đã xoá khỏi design, route đã xoá |
| `Ung Ho`, `Tai Khoan` | tạm ẩn: bỏ link (footer design vẫn giữ "Ủng hộ") |

---

## 6. Sai lầm đã gặp và cách phòng tránh

Chỉ thêm một mục khi lỗi đã được tái hiện, root cause đã xác minh và cách kiểm chứng chạy được. Tìm trong file trước để không ghi trùng. Lỗi chỉ thuộc một lần chạy nằm trong `process.md` hoặc artifact `.design-workflow/`, không ghi ở đây.

Mẫu ghi:

```markdown
### Tên lỗi ngắn
- Dấu hiệu: lỗi nhìn thấy hoặc kết quả đo sai.
- Root cause: nguyên nhân kỹ thuật đã xác minh.
- Cách phòng tránh: quy tắc cần làm ở lần port sau.
- Cách kiểm chứng: lệnh hoặc phép đo chứng minh lỗi không còn.
```
