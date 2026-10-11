import { expect, test, type Page } from "playwright/test";

// Khu quản trị — flow panel với session Supabase THẬT (không mock): layout.tsx
// guard bằng cookie server-side nên mock browser không đủ. Cần server trỏ tới
// một Supabase LOCAL (npx supabase start + db reset) có sẵn 1 admin và vài
// thiệp/user; KHÔNG chạy với DB production. Bỏ qua nếu thiếu env:
//   E2E_ADMIN_EMAIL=admin@moc.test E2E_ADMIN_PASSWORD=... npm run e2e -- e2e/admin-panel.spec.ts --project=chrome --project=mobile-chrome
// Mọi thao tác đều đảo ngược được (khoá→hoàn tác, xuất bản→hoàn tác, huỷ xoá).
const EMAIL = process.env.E2E_ADMIN_EMAIL;
const PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.skip(!EMAIL || !PASSWORD, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD chưa đặt (cần Supabase local)");

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email quản trị").fill(EMAIL!);
  await page.getByLabel("Mật khẩu").fill(PASSWORD!);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function expectNoSideScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, "no horizontal page scroll").toBeLessThanOrEqual(1);
}

test.beforeEach(async ({ page }) => {
  await login(page);
});

test("dashboard hiện số liệu và link sang các trang chi tiết", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Chào,");
  await expect(page.getByRole("region", { name: "Tổng người dùng" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Tổng số thiệp" })).toBeVisible();
  await expectNoSideScroll(page);
  await page.getByRole("link", { name: "Xem tất cả →" }).first().click();
  await expect(page).toHaveURL(/\/admin\/(users|cards)$/);
});

test("người dùng: tìm không dấu, khoá rồi hoàn tác, dòng của chính mình bị vô hiệu", async ({ page }) => {
  await page.goto("/admin/users");
  const rows = page.locator(".adm-table tbody tr");
  await expect(rows.first()).toBeVisible();
  await expectNoSideScroll(page);

  await page.getByRole("searchbox").fill("quan tri");
  const self = rows.filter({ hasText: EMAIL! });
  await expect(self).toHaveCount(1);
  await expect(self.getByRole("button", { name: "Khoá" })).toBeDisabled();
  await expect(self.getByRole("button", { name: "Xoá" })).toBeDisabled();

  await page.getByRole("searchbox").fill("");
  const target = rows.filter({ hasNotText: EMAIL! }).filter({ has: page.getByRole("button", { name: "Khoá", exact: true }) }).first();
  await expect(target).toBeVisible();
  await target.getByRole("button", { name: "Khoá", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Đã khoá tài khoản");
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(page.getByRole("status")).toContainText("Đã mở khoá tài khoản");
});

test("người dùng: xoá luôn qua hộp xác nhận, mặc định focus nút Huỷ bỏ", async ({ page }) => {
  await page.goto("/admin/users");
  const target = page.locator(".adm-table tbody tr").filter({ hasNotText: EMAIL! }).first();
  await target.getByRole("button", { name: "Xoá" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Huỷ bỏ" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("thiệp: lọc, tìm theo tên mẫu, xuất bản/ẩn có hoàn tác, wildcard % không khớp tất cả", async ({ page }) => {
  await page.goto("/admin/cards");
  const rows = page.locator(".adm-table tbody tr");
  await expect(rows.first()).toBeVisible();
  await expectNoSideScroll(page);

  await page.getByRole("searchbox").fill("%%");
  await expect(page.getByText("Không có thiệp nào khớp.")).toBeVisible();
  await page.getByRole("searchbox").fill("");
  await expect(rows.first()).toBeVisible();

  // Một ký tự không được gây trạng thái lỗi (API cần >= 2 ký tự).
  await page.getByRole("searchbox").fill("a");
  await page.waitForTimeout(600);
  await expect(page.getByText("Từ khoá tìm kiếm cần ít nhất 2 ký tự.")).toHaveCount(0);
  await page.getByRole("searchbox").fill("");

  const toggle = rows.getByRole("button", { name: /^(Xuất bản|Ẩn xuất bản)$/ }).first();
  const before = (await toggle.innerText()).trim();
  await toggle.click();
  await expect(page.getByRole("status")).toContainText(/Đã (xuất bản|ẩn xuất bản) thiệp/);
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(rows.getByRole("button", { name: before, exact: true }).first()).toBeVisible();

  await expect(rows.first().getByRole("link", { name: "Xem" })).toHaveAttribute("target", "_blank");
});

test("mẫu thiệp: đổi nhãn, ẩn/hiện, sửa tên trong modal rồi hoàn tác", async ({ page }) => {
  await page.goto("/admin/templates");
  const card = page.locator("article").first();
  await expect(card).toBeVisible();
  await expectNoSideScroll(page);

  await card.getByRole("button", { name: "Ẩn mẫu" }).click();
  await expect(page.getByRole("status")).toContainText("Đã ẩn mẫu");
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(card.getByRole("button", { name: "Ẩn mẫu" })).toBeVisible();

  await card.getByRole("button", { name: "Sửa" }).click();
  const dialog = page.getByRole("dialog", { name: /Sửa mẫu/ });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox").fill("   ");
  await expect(dialog.getByRole("button", { name: "Lưu" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("đăng xuất xoá phiên: /admin quay lại trang đăng nhập", async ({ page }) => {
  const burger = page.getByRole("button", { name: "Mở menu quản trị" });
  if (await burger.isVisible()) await burger.click(); // mobile: sidebar lives in the drawer
  await page.getByRole("button", { name: "Đăng xuất quản trị" }).and(page.locator(":visible")).first().click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/admin\/login/);
});
