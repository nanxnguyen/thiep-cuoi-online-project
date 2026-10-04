import { expect, test, type Page } from "playwright/test";
import { mockApi, type MockApi } from "./support/mock-api";

// Case bắt buộc 1+2 trước mỗi lần lên prod: mọi trang public phải mở được,
// có h1, không scroll ngang, không console error — trên mọi project của
// playwright.config.ts (chrome/edge/safari/firefox/coccoc + mobile/tablet).
const PUBLIC_PAGES = [
  "/",
  "/templates",
  "/templates/song-hy",
  "/bang-gia",
  "/blog",
  "/tro-giup",
  "/thiep-cuoi-online-mien-phi",
  "/tao-thiep-cuoi",
  "/qr-tien-mung",
  "/tin-nhan-moi-cuoi",
  "/cong-cu-dam-cuoi",
  "/cong-cu/tao-qr",
  "/cong-cu/nen-anh",
  "/cong-cu/nen-video",
  "/cong-cu/tin-nhan-moi",
  "/cong-cu/danh-sach-khach",
  "/cong-cu/save-the-date",
  "/ung-ho",
  "/dieu-khoan",
  "/quyen-rieng-tu",
  "/thiet-ke-thiep-rieng",
  "/demo",
  "/docs",
];

let api: MockApi;
test.beforeEach(async ({ page }) => {
  api = await mockApi(page);
  // Trang tĩnh không gọi API; nếu có gọi mà chưa mock thì ghi nhận để fail tường minh.
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/problem+json", body: "{}" }));
});
test.afterEach(() => {
  expect(api.unmocked, "API calls without a mock").toEqual([]);
});

for (const path of PUBLIC_PAGES) {
  test(`${path} loads with a heading, no sideways scroll and no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
    });

    const response = await page.goto(path);
    expect(response?.status(), `${path} HTTP status`).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    const sideways = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(sideways, `${path} scrolls sideways`).toBe(false);
    expect(errors, `${path} console/page errors`).toEqual([]);
  });
}
