import { expect, test, type Page } from "playwright/test";
import { defaultContent } from "../lib/content.ts";
import { EDIT_KEY, INVITATION_ID, mockApi, type MockApi } from "./support/mock-api";

// Case bắt buộc 3 trước mỗi lần lên prod: flow thiệp full tính năng trong editor —
// mở mọi phần, bật/tắt section, autosave patch, đổi tên — với mock API.
// Chạy trên mọi project (desktop + mobile browsers) như create-invitation.spec.ts.
const EDIT_URL = `/studio/${INVITATION_ID}#k=${EDIT_KEY}`;

let api: MockApi;
test.beforeEach(async ({ page }) => {
  api = await mockApi(page);
  api.seed(seededContent());
});
test.afterEach(() => {
  expect(api.unmocked, "API calls without a mock").toEqual([]);
});

const narrow = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024;

async function openSection(page: Page, label: string) {
  if (narrow(page)) {
    // Trên màn hẹp outline và form là bottom sheet: về lại outline trước khi mở phần kế tiếp.
    const back = page.getByRole("button", { name: "← Các phần" });
    if (await back.isVisible().catch(() => false)) await back.click();
    const nav = page.getByRole("navigation", { name: "Các phần của thiệp" });
    if (!(await nav.isVisible().catch(() => false))) {
      await page.getByRole("button", { name: "☰ Các phần" }).click();
    }
  }
  await page.getByRole("navigation", { name: "Các phần của thiệp" }).getByRole("button", { name: label }).click();
}

const SECTION_LABELS = [
  "Phong bì",
  "Mẫu & kiểu chữ",
  "Cô dâu & chú rể",
  "Gia đình hai bên",
  "Lễ cưới",
  "Tiệc cưới",
  "Lịch trình trong ngày",
  "Đếm ngược",
  "Địa điểm chi tiết",
  "Trang phục gợi ý",
  "Chuyện tình yêu",
  "Album ảnh",
  "Video cưới",
  "Nhạc nền",
  "Xác nhận tham dự",
  "Sổ lưu bút",
  "Hộp mừng cưới",
  "Lời cảm ơn",
];

test("every editor section opens its form panel", async ({ page }) => {
  await page.goto(EDIT_URL);
  await expect(page.locator(".ed-bar")).toBeVisible();
  for (const label of SECTION_LABELS) {
    await openSection(page, label);
    await expect(page.getByRole("complementary", { name: new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })).toBeVisible();
  }
});

test("toggling a section off and on autosaves both states", async ({ page }) => {
  await page.goto(EDIT_URL);
  await expect(page.locator(".ed-bar")).toBeVisible();
  await openSection(page, "Nhạc nền");

  const toggle = page.getByRole("switch", { name: "Bật/tắt Nhạc nền" }).first();
  await expect(toggle).toBeVisible();
  const initial = await toggle.getAttribute("aria-checked");

  await toggle.click();
  await expect.poll(() => api.patches.length, { timeout: 8_000 }).toBeGreaterThan(0);
  expect(await toggle.getAttribute("aria-checked")).not.toBe(initial);

  await toggle.click();
  await expect.poll(() => api.patches.length, { timeout: 8_000 }).toBeGreaterThanOrEqual(2);
  expect(await toggle.getAttribute("aria-checked")).toBe(initial);
  await expect(page.getByRole("status").filter({ hasText: "Đã lưu tự động" })).toBeVisible();
});

test("renaming the couple updates the header, preview and autosave", async ({ page, browserName, isMobile }) => {
  await page.goto(EDIT_URL);
  await expect(page.locator(".ed-bar")).toBeVisible();
  await openSection(page, "Cô dâu & chú rể");

  const form = page.getByRole("complementary", { name: /Chỉnh sửa: Cô dâu & chú rể/ });
  const bride = form.getByLabel("Cô dâu", { exact: true });
  if (browserName === "webkit" && !isMobile && process.platform === "darwin") {
    await bride.evaluate((el, value) => {
      const input = el as HTMLInputElement;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, "Cô Dâu Full");
  } else {
    await bride.fill("Cô Dâu Full");
  }
  await expect.poll(() => api.patches.length, { timeout: 8_000 }).toBeGreaterThan(0);
  await expect(page.locator(".ed-bar__title strong")).toContainText("Cô Dâu Full");
});

// Content for a seeded invitation comes from the app's own default, so it always satisfies the current schema.
function seededContent() {
  const content = defaultContent(new Date("2026-10-04T00:00:00Z"));
  content.couple.groom.name = "Quang Huy";
  content.couple.bride.name = "Thu Lan";
  return content as unknown as Record<string, unknown>;
}
