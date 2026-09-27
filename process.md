# Quy trình tự động design → production

## Lệnh duy nhất

```bash
npm run design
```

Chạy lại cùng lệnh nếu phiên trước bị ngắt; workflow đọc state trong `.design-workflow/` và tiếp tục từ gate an toàn gần nhất.

Workflow tự nhận diện agent đang chạy (`Codex`, `Claude Code` hoặc `OpenCode`) và dùng CLI tương ứng; không cần chọn hay đổi lệnh.

## Các giai đoạn

1. **Analyze:** đọc `business.md`, `design/README.md`, `Guide-convert-html-design-to-code.md`, design diff, `PROGRESS.md`, `CLAUDE.md` và code hiện tại.
2. **Planning:** agent read-only tạo plan quyết định đầy đủ, liệt kê file, route, test, SEO, performance và security impact.
3. **Implementation:** agent hiện tại thực hiện plan với quyền ghi workspace, không sửa `design/` và không chạy lại workflow.
4. **Verification:** chạy `npm test`, `npm run typecheck`, `npm run build`.
5. **Security:** tự bật khi có backend/trust-boundary change; Critical/High và Medium tại trust boundary đều chặn deploy.
6. **Browser QC/QA:** agent độc lập bắt buộc mở design và app bằng browser, đo visual parity ở 390/1280, lưu evidence, kiểm console, overflow, ảnh, accessibility, performance và SEO 100.
7. **Preview:** tạo Netlify deploy preview và smoke-test URL trả về.
8. **Production:** chỉ chạy sau khi người dùng xác nhận `y` trong cùng lệnh.

## Gate bắt buộc

- Test, typecheck và build phải xanh.
- Route public bị ảnh hưởng phải đạt Lighthouse SEO 100; SEO kỹ thuật không đồng nghĩa cam kết thứ hạng Google.
- Performance mobile ≥ 90; Accessibility và Best Practices ≥ 95 khi browser tooling hỗ trợ đo.
- Backend change phải có runtime validation, server-side authorization và abuse-case tests tương ứng.
- Security hoặc QC không chạy được là `BLOCKED`, không được coi là pass.
- Thiếu browser evidence ở một trong hai viewport 390px/1280px, parity dưới 100%, console error, ảnh hỏng hoặc overflow đều chặn deploy.
- Source thay đổi sau Security/QC làm kết quả cũ mất hiệu lực.

## Bài học

Lỗi riêng của một run nằm trong artifact `.design-workflow/runs/<run-id>/`. Chỉ bài học đã xác minh, có thể tái sử dụng mới được ghi vào `Guide-convert-html-design-to-code.md`; workflow tìm trùng trước khi thêm.

## Lịch sử run

| Run | Thời gian | Design | Test/Build | Security | SEO/QC | Preview | Production |
|---|---|---|---|---|---|---|---|
