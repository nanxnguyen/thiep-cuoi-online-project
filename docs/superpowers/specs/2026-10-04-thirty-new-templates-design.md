# 30 mẫu thiệp mới (20 → 50) — thiết kế

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
