import { expect, test, type Page } from "playwright/test";
import { ADMIN_EMAIL, ADMIN_PASSWORD, mockAdminApi, mockApi, type MockAdminApi, type MockApi } from "./support/mock-api";

// Khu quản trị (/admin). Mọi /api/** đều được mock (mockApi catch-all +
// mockAdminApi); `unmocked` phải rỗng sau mỗi test.
// PHẠM VI: guard redirect (server-side, chạy thật — không session là bounce về
// login) + trang login (sai/đúng). Flow panel (dashboard/users/cards/templates)
// BỊ CHẶN ở e2e: (panel)/layout.tsx gọi requireAdmin() server-side bằng cookie
// thật, mock /api/admin/me ở browser không mở được — cần session Supabase thật
// (xem ghi chú ở test "login đúng"). Mock panel trong mock-api.ts đã sẵn để
// dùng khi có session (dev login tay hoặc seed E2E có auth).
let api: MockApi;
let admin: MockAdminApi;

test.beforeEach(async ({ page }) => {
  api = await mockApi(page);
  admin = await mockAdminApi(page, api);
  // Trang login không gọi API khi mở; nếu app có gọi mà chưa mock thì ghi nhận để fail tường minh.
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/problem+json", body: "{}" }));
});
test.afterEach(() => {
  expect(api.unmocked, "API calls without a mock").toEqual([]);
});

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    // Trình duyệt tự log "Failed to load resource: … 401 …" cho response lỗi —
    // đó là hành vi mạng hiển nhiên khi test nhánh lỗi, không phải lỗi app.
    if (/Failed to load resource.*status of (401|403|429)/.test(msg.text())) return;
    errors.push(`console.error: ${msg.text()}`);
  });
  return errors;
}

for (const path of ["/admin", "/admin/users", "/admin/cards", "/admin/templates"]) {
  test(`guard: ${path} chưa login bounce về /admin/login`, async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { level: 1, name: "Đăng nhập quản trị" })).toBeVisible();
    const sideways = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(sideways, `${path} scrolls sideways`).toBe(false);
    expect(errors, `${path} console/page errors`).toEqual([]);
  });
}

test("login render đúng copy, không lộ gợi ý mật khẩu demo", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { level: 1, name: "Đăng nhập quản trị" })).toBeVisible();
  await expect(page.getByLabel("Email quản trị")).toBeVisible();
  await expect(page.getByLabel("Mật khẩu")).toBeVisible();
  await expect(page.getByRole("link", { name: "Về trang chủ" })).toBeVisible();
  // Spec §6: hint demo "mật khẩu là admin" của file design KHÔNG được mang sang bản thật.
  await expect(page.getByText("mật khẩu là admin")).toHaveCount(0);
  const sideways = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(sideways, "login scrolls sideways").toBe(false);
  expect(errors, "login console/page errors").toEqual([]);
});

test("login sai hiện lỗi chung, ở lại trang login", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/admin/login");
  await page.getByLabel("Email quản trị").fill("sai@moc.vn");
  await page.getByLabel("Mật khẩu").fill("sai-mat-khau");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("form", { name: "Đăng nhập quản trị" }).getByRole("alert")).toHaveText("Email hoặc mật khẩu chưa đúng.");
  await expect(page).toHaveURL(/\/admin\/login/);
  expect(admin.logins).toEqual([{ email: "sai@moc.vn", password: "sai-mat-khau" }]);
  expect(errors, "login-wrong console/page errors").toEqual([]);
});

test("login đúng gọi API chuẩn rồi bị server guard bounce (chưa có session thật)", async ({ page }) => {
  const errors = collectErrors(page);
  admin.setMe(200);
  await page.goto("/admin/login");
  const navToPanel = page.waitForRequest((req) => new URL(req.url()).pathname === "/admin");
  await page.getByLabel("Email quản trị").fill(ADMIN_EMAIL);
  await page.getByLabel("Mật khẩu").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  // App đã cố sang /admin (RSC request) — chứng tỏ nhánh success chạy.
  await navToPanel;
  expect(admin.logins).toEqual([{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }]);
  // Nhưng server render /admin bằng cookie thật: không session → redirect về
  // login. Đây là hành vi ĐÚNG (client mock không bypass được SSR guard), và là
  // lý do flow panel e2e cần session thật — không phải bug.
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("form", { name: "Đăng nhập quản trị" }).getByRole("alert")).toHaveCount(0);
  expect(errors, "login-ok console/page errors").toEqual([]);
});
