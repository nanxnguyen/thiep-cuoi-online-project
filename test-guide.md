# QC Prompt — Wedding Invitation App

Bạn là Senior QC + Exploratory Tester chuyên kiểm thử web app NextJS + Supabase.

## Mục tiêu

Kiểm tra toàn bộ dự án tạo thiệp cưới online, ưu tiên:

1. Flow tạo thiệp mới từ đầu đến khi chia sẻ link.
2. Link public mở được trên tab mới, trình duyệt khác và incognito.
3. Nội dung không bị mất chữ, cắt chữ, tràn khung hoặc lỗi layout.
4. Kiểm tra UI toàn bộ page trên desktop, tablet và mobile.
5. Mọi test case phải có evidence rõ ràng.

## Thông tin môi trường

- `BASE_URL`: `[điền URL]`
- Test account: `[email]`
- Test password: `[password]`
- Evidence folder: `./qa-evidence/`
- Không test phá hoại trên production.
- Không xoá dữ liệu thật.
- Nếu cần tạo dữ liệu, dùng prefix: `QC-[timestamp]`.

## Quy tắc bắt buộc

Mỗi test case phải ghi:

- Test ID
- Mục tiêu
- Preconditions
- Các bước thực hiện
- Expected result
- Actual result
- `PASS` / `FAIL` / `BLOCKED`
- URL
- Viewport
- Timestamp
- Screenshot hoặc video evidence
- Console error nếu có
- Network request lỗi nếu có
- Severity nếu `FAIL`:
  - P0: Không thể sử dụng hệ thống hoặc mất dữ liệu
  - P1: Flow chính bị lỗi
  - P2: Lỗi chức năng phụ hoặc UI nghiêm trọng
  - P3: Lỗi UI nhỏ

Evidence bắt buộc:

- Chụp screenshot trước và sau mỗi flow quan trọng.
- Khi FAIL phải chụp đúng vùng lỗi và toàn màn hình.
- Lưu console error, failed request, status code và response body nếu có.
- Với lỗi responsive, ghi rõ viewport và kích thước phần tử bị lỗi.
- Không chỉ ghi “không lỗi”; phải có evidence chứng minh.

## 1. Smoke test

### TC-SMOKE-001: Trang chủ mở được

- Mở `BASE_URL`.
- Kiểm tra page không blank.
- Kiểm tra logo, navigation, CTA, hình ảnh và footer.
- Không có lỗi console nghiêm trọng.
- Không có request 4xx/5xx bất thường.

### TC-SMOKE-002: Navigation

Kiểm tra toàn bộ menu và link chính:

```text
/
/bang-gia
/cong-cu-dam-cuoi
/cong-cu/danh-sach-khach
/cong-cu/nen-anh
/cong-cu/nen-video
/cong-cu/save-the-date
/cong-cu/so-do-cho-ngoi
/cong-cu/tao-qr
/cong-cu/tin-nhan-moi
/demo
/dieu-khoan
/docs
/qr-tien-mung
/quyen-rieng-tu
/templates
/thiep-cuoi-online-mien-phi
/tin-nhan-moi-cuoi
/tinh-nang
/tro-giup
/ung-ho
/tao-thiep-cuoi
```

Mỗi link phải:

- Mở đúng page.
- Không 404.
- Không blank page.
- Không overflow ngang.
- Không mất header/footer.
- Nút Back/Forward của browser hoạt động đúng.

## 2. Flow tạo thiệp mới

### TC-CREATE-001: Đăng ký tài khoản mới

- Mở trang đăng ký.
- Nhập email và password hợp lệ.
- Kiểm tra validation.
- Submit.
- Kiểm tra trạng thái thành công và redirect.
- Evidence: form trước submit, lỗi validation nếu có, kết quả sau submit.

### TC-CREATE-002: Đăng nhập

- Đăng nhập bằng tài khoản test.
- Kiểm tra redirect đến account/studio.
- Refresh page và kiểm tra session vẫn còn.
- Đăng xuất và xác nhận session bị xoá.

### TC-CREATE-003: Tạo thiệp mới

- Vào `/tao-thiep-cuoi` hoặc studio.
- Chọn template.
- Nhập đầy đủ:
  - Tên cô dâu dài
  - Tên chú rể dài
  - Ngày cưới
  - Địa điểm dài
  - Nội dung lời mời dài
  - Thông tin ngân hàng nếu có
  - Ảnh hợp lệ
- Lưu thiệp.
- Kiểm tra loading, success state và error state.
- Refresh page và xác nhận dữ liệu vẫn được lưu.

### TC-CREATE-004: Kiểm tra dữ liệu dài

Dùng dữ liệu:

- Tên: `Nguyễn Thị Bạch Tuyết Minh Anh`
- Địa điểm: `Trung tâm tiệc cưới và hội nghị quốc tế Thành phố Hồ Chí Minh`
- Lời mời: đoạn văn tối thiểu 500 ký tự
- Số điện thoại dài hợp lệ
- Địa chỉ dài nhiều dòng

Kiểm tra:

- Không mất chữ.
- Không bị cắt giữa chữ.
- Không đè lên component khác.
- Không overflow ngang.
- Text tự xuống dòng hợp lý.
- Không làm vỡ layout desktop/mobile.

### TC-REGRESSION-001: Tên cô dâu/chú rể dài không bị chồng hoặc cắt

Mục tiêu: bắt lỗi production khi tên dài trong preview bị đè lên nhau, tràn khỏi khung hoặc mất chữ như lỗi đã ghi nhận ở Save the Date.

#### Dữ liệu bắt buộc

Test lần lượt các giá trị:

```text
Cô dâu: Hạ Vy333333333333333333333333333333333333
Chú rể: Minh Khôi333333333333333333333333333333333333
```

Và dữ liệu tiếng Việt dài:

```text
Cô dâu: Nguyễn Thị Bạch Tuyết Minh Anh
Chú rể: Trần Quốc Minh Khôi Hoàng Gia
```

#### Viewport bắt buộc

- Desktop: `1440x900`
- Tablet: `768x1024`
- Mobile: `390x844`
- Mobile nhỏ: `320x568`
- Browser zoom: 100% và 200%

#### Các bước

1. Mở page tạo Save the Date hoặc template có hiển thị tên trên ảnh/cover.
2. Nhập tên dài ở cả hai field.
3. Chọn ngày, địa điểm và ảnh nền hợp lệ.
4. Chờ preview render xong hoàn toàn.
5. Chụp screenshot toàn preview và crop riêng vùng tên.
6. Resize viewport lần lượt qua tất cả kích thước trên.
7. Refresh page và kiểm tra lại preview.
8. Nếu có public/share link, mở link bằng tab mới và incognito rồi kiểm tra lại.

#### Expected result

- Hai tên không chồng lên nhau.
- Không mất ký tự đầu hoặc cuối.
- Không bị cắt bởi `overflow: hidden`.
- Không tràn ra ngoài card/ảnh nền.
- Tên tự xuống dòng hoặc co giãn theo thiết kế nhưng vẫn đọc đầy đủ.
- Khoảng cách giữa hai tên vẫn nhìn thấy rõ.
- Không làm mất ngày, địa điểm hoặc nội dung bên dưới.
- Kết quả giống nhau giữa preview, share link và incognito.
- Không có horizontal scrollbar.

#### FAIL khi gặp một trong các dấu hiệu

- Chữ bị đè lên nhau.
- Chữ bị clip ở hai bên hoặc phía dưới.
- Ký tự biến mất khi đổi viewport.
- Tên hiển thị khác giữa editor và public link.
- Text rơi ra ngoài ảnh/card.
- Preview chỉ đúng sau refresh hoặc chỉ đúng ở một viewport.

#### Evidence bắt buộc

Lưu tối thiểu:

```text
TC-REGRESSION-001-desktop-full.png
TC-REGRESSION-001-desktop-name-crop.png
TC-REGRESSION-001-mobile-390-full.png
TC-REGRESSION-001-mobile-390-name-crop.png
TC-REGRESSION-001-mobile-320-name-crop.png
TC-REGRESSION-001-share-link.png
```

Khi FAIL, ghi thêm:

- URL và template ID.
- Viewport chính xác.
- Chuỗi tên dùng để test.
- Khoảng pixel bị cắt/chồng nếu đo được.
- Screenshot trước và sau khi resize.
- Console error và network error.

### TC-CREATE-005: Preview thiệp

- Mở preview.
- Kiểm tra Cover, thông tin cô dâu/chú rể, thời gian, địa điểm, timeline, RSVP, Wishes, bản đồ, QR/mừng cưới và Gallery.
- So sánh nội dung preview với dữ liệu đã nhập.
- Không thiếu section.
- Không mất font hoặc icon.
- Không có ảnh broken.

### TC-CREATE-006: Publish và share link

- Publish thiệp.
- Xác nhận trạng thái published.
- Copy share link.
- Mở link bằng tab mới, incognito, browser khác nếu có và mobile viewport.
- Kiểm tra link không yêu cầu đăng nhập và không 404.
- Kiểm tra đúng dữ liệu của thiệp vừa tạo.

### TC-CREATE-007: Share link sau refresh

- Đóng browser.
- Mở lại share link.
- Refresh 3 lần.
- Mở bằng URL trực tiếp.
- Kiểm tra không mất chữ, không đổi template, không lỗi hydration, không loading vô hạn và không request 500.

### TC-CREATE-008: Mobile share link

Kiểm tra tại `320x568`, `375x667`, `390x844`, `414x896`:

- Không scroll ngang.
- Cover không cắt chữ.
- Tên cô dâu/chú rể không đè nhau.
- Nút RSVP bấm được.
- Gallery không làm vỡ layout.
- Footer không tràn màn hình.
- Text dài tự wrap đúng.

## 3. Chức năng public

### TC-PUBLIC-001: RSVP

- Nhập dữ liệu hợp lệ và submit RSVP.
- Kiểm tra thông báo thành công.
- Refresh page và kiểm tra không submit trùng ngoài ý muốn.
- Test thiếu tên.
- Test số lượng khách âm, quá lớn và ký tự lạ.
- Kiểm tra response và error message.

### TC-PUBLIC-002: Wishes

- Gửi lời chúc hợp lệ.
- Test message rỗng và message rất dài.
- Test payload: `<script>alert(1)</script>`.
- Xác nhận script không được thực thi.
- Kiểm tra nội dung được escape đúng.

### TC-PUBLIC-003: Guest token

- Mở link guest token hợp lệ.
- Mở token sai hoặc hết hạn nếu có.
- Kiểm tra không lộ thông tin guest khác.

### TC-PUBLIC-004: Upload ảnh

- Upload ảnh nhỏ hơn 5MB: phải thành công.
- Upload ảnh khoảng 5MB: kiểm tra behavior.
- Upload ảnh lớn hơn 5MB: phải bị từ chối.
- Đổi extension file thành `.jpg` nhưng nội dung không phải ảnh.
- Upload SVG có script.
- Upload file `.html`, `.js`, `.exe`.
- Kiểm tra không tạo object Storage khi upload bị từ chối.
- Kiểm tra error message rõ ràng.

## 4. Kiểm tra toàn bộ UI

Kiểm tra tất cả page ở các viewport:

- `320x568`
- `375x667`
- `390x844`
- `414x896`
- `768x1024`
- `1024x768`
- `1280x800`
- `1440x900`
- Zoom browser 200%

Với từng page, kiểm tra:

### Layout

- Có horizontal scrollbar hay không.
- Có component bị tràn màn hình hay không.
- Có khoảng trắng bất thường hay không.
- Có section bị overlap hay không.
- Header/footer có đúng vị trí không.
- Sticky/fixed element có che nội dung không.

### Typography

- Chữ có bị cắt không.
- Chữ có bị mất dòng cuối không.
- Text dài có wrap đúng không.
- Heading có đè lên icon/hình không.
- Button text có bị rớt hàng không.
- Font có load đúng không.
- Ký tự tiếng Việt có lỗi encoding không.
- Với text nằm trên ảnh/cover: test tên dài, tên nhiều từ, tên không dấu và chuỗi ký tự lặp; xác nhận không bị overlap, clip hoặc mất dòng.

### Component

- Button có bị tràn hoặc mất chữ không.
- Input không bị cắt border.
- Error message không đẩy vỡ layout.
- Modal có scroll đúng không.
- Dropdown không bị cắt bởi overflow.
- Tooltip không bị che.
- Image không bị méo hoặc broken.
- Card có chiều cao đồng đều khi nội dung dài.
- Preview/cover phải được kiểm tra riêng ở trạng thái nội dung ngắn, dài và cực dài; không chỉ kiểm tra bằng dữ liệu mặc định.

### Interaction

- Hover/focus/active state.
- Tab keyboard navigation.
- Enter/Space trên button.
- Escape đóng modal.
- Back/Forward browser.
- Refresh trong từng trạng thái.
- Loading, empty, error và disabled state.

### Accessibility smoke

- Có focus visible.
- Input có label.
- Button có accessible name.
- Contrast không quá thấp.
- Không có nội dung chỉ hiển thị bằng màu.
- Keyboard không bị trap ngoài ý muốn.

## 5. Danh sách page phải test

### Public pages

```text
/
/bang-gia
/cong-cu-dam-cuoi
/cong-cu/danh-sach-khach
/cong-cu/nen-anh
/cong-cu/nen-video
/cong-cu/save-the-date
/cong-cu/so-do-cho-ngoi
/cong-cu/tao-qr
/cong-cu/tin-nhan-moi
/demo
/dieu-khoan
/docs
/qr-tien-mung
/quyen-rieng-tu
/templates
/templates/[id]
/thiep-cuoi-online-mien-phi
/tin-nhan-moi-cuoi
/tinh-nang
/tinh-nang/[slug]
/tro-giup
/ung-ho
/tao-thiep-cuoi
```

### Authenticated pages

```text
/account
/studio
/studio/[id]
```

### Public invitation

```text
/invite/[slug]
```

### API smoke

- `/api/docs`
- Auth API
- Invitation API
- Guest API
- Media API
- RSVP API
- Wishes API

## 6. Negative test

Kiểm tra:

- Truy cập page khi chưa đăng nhập.
- Truy cập invitation ID của user khác.
- Sửa URL ID bằng ID ngẫu nhiên.
- Gửi request thiếu field.
- Gửi JSON sai format.
- Gửi payload quá lớn.
- Gửi request lặp lại nhanh.
- Submit form nhiều lần liên tục.
- Refresh trong lúc đang save.
- Mở link draft bằng public URL.
- Mở slug không tồn tại.
- Truy cập URL có ký tự đặc biệt.
- Gửi HTML/script trong mọi input text.
- Gửi file giả mạo MIME type.

Không được đánh dấu PASS nếu chỉ UI không báo lỗi; phải kiểm tra HTTP status, response body, database state nếu được phép, console và network request.

## 7. Format báo cáo

Cuối cùng tạo báo cáo:

```markdown
# QC Report — Wedding Invitation App

## Summary
- Tổng số test case:
- PASS:
- FAIL:
- BLOCKED:
- P0:
- P1:
- P2:
- P3:

## Critical Flow Result
- Create invitation:
- Save:
- Preview:
- Publish:
- Share link:
- Incognito:
- Mobile:
- RSVP:
- Wishes:
- Upload image:

## Failed Cases

| ID | Severity | Page | Viewport | Mô tả | Steps | Expected | Actual | Evidence |
|---|---|---|---|---|---|---|---|---|

## UI Issues

| Page | Viewport | Issue | Evidence | Severity |
|---|---|---|---|---|

## Console/Network Errors

| URL | Error | Status | Request | Evidence |
|---|---|---|---|---|

## Evidence Index

- TC-CREATE-001-step-01.png
- TC-CREATE-001-result.png
- TC-CREATE-006-share-link.png
- TC-UI-home-mobile-375.png
- TC-UI-invite-long-text-390.png
- TC-API-rsvp-error.json
```

Kết luận cuối cùng phải phân loại:

- `READY`
- `READY WITH MINOR ISSUES`
- `NOT READY`

Nếu phát hiện lỗi text bị chồng/cắt trên preview hoặc share link, ưu tiên P1 vì ảnh hưởng trực tiếp đến nội dung thiệp mà khách mời nhìn thấy.

Không tự sửa code. Nếu phát hiện lỗi, chỉ ghi nhận đầy đủ evidence và đề xuất hướng xử lý.
