import { expect, test, type Page } from "playwright/test";
import { FOOTER_COLUMNS, NAV_LINKS } from "../lib/navigation.ts";
import { mockApi, type MockApi } from "./support/mock-api";

// Clicking a link/button must land on the page its href names. Static href checks live in tests/link-targets.test.ts;
// this proves the click itself works in a real browser (no overlay, no dead handler, no redirect to the wrong page).
let api: MockApi;
test.beforeEach(async ({ page }) => {
  api = await mockApi(page);
  // /account (a footer link) asks who is signed in; answer "nobody" instead of hitting the backend.
  await page.route("**/api/auth/me", (route) => route.fulfill({ status: 401, contentType: "application/problem+json", body: "{}" }));
});
test.afterEach(() => {
  expect(api.unmocked, "API calls without a mock").toEqual([]);
});

const pathOf = (page: Page) => new URL(page.url()).pathname;
const narrow = (page: Page) => (page.viewportSize()?.width ?? 1280) < 900; // header links collapse into a menu here

async function expectClickLands(page: Page, from: string, locatorFor: () => ReturnType<Page["locator"]>, href: string) {
  await page.goto(from);
  const link = locatorFor().first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
  const [path, hash] = href.split("#");
  if (path) await expect.poll(() => pathOf(page)).toBe(path);
  if (hash) await expect.poll(() => new URL(page.url()).hash).toBe(`#${hash}`);
}

test("header navigation links open their pages on wide and narrow screens", async ({ page }) => {
  if (narrow(page)) {
    // Màn hẹp: header gom thành menu <details> — mở menu rồi bấm từng link.
    for (const { href, label } of NAV_LINKS) {
      await page.goto("/");
      const summary = page.locator("header details.nav-menu > summary");
      if (!(await page.getByRole("navigation", { name: "Menu trên điện thoại" }).isVisible().catch(() => false))) {
        await summary.click();
      }
      await page.getByRole("navigation", { name: "Menu trên điện thoại" }).getByRole("link", { name: label, exact: true }).click();
      await expect.poll(() => pathOf(page)).toBe(href);
    }
    return;
  }
  for (const { href, label } of NAV_LINKS) {
    await expectClickLands(page, "/", () => page.locator("header").getByRole("link", { name: label, exact: true }), href);
  }
});

test("footer links open their pages", async ({ page }) => {
  const seen = new Set<string>();
  for (const { href, label } of FOOTER_COLUMNS.flatMap((c) => c.links)) {
    if (seen.has(href)) continue;
    seen.add(href);
    await expectClickLands(page, "/", () => page.locator("footer").getByRole("link", { name: label, exact: true }), href);
  }
});

// Marketing hero buttons ("Gửi yêu cầu", "Xem mẫu có sẵn", ...): discovered from the page, so a new CTA is covered for free.
const HERO_PAGES = [
  "/thiet-ke-thiep-rieng", "/thiep-cuoi-online-mien-phi", "/tao-thiep-cuoi", "/qr-tien-mung", "/tin-nhan-moi-cuoi",
  "/bang-gia", "/cong-cu-dam-cuoi", "/ung-ho", "/tro-giup",
];

for (const from of HERO_PAGES) {
  test(`hero buttons on ${from} go where their href says`, async ({ page }) => {
    await page.goto(from);
    const hrefs = await page.locator(".mk-hero .actions a").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
    for (const href of hrefs.filter((h) => h.startsWith("/") || h.startsWith("#"))) {
      const target = href.startsWith("#") ? from + href : href;
      await expectClickLands(page, from, () => page.locator(`.mk-hero .actions a[href="${href}"]`), target);
    }
  });
}

test("custom-design page: 'Xem mẫu có sẵn' opens the template gallery", async ({ page }) => {
  await page.goto("/thiet-ke-thiep-rieng");
  await page.getByRole("link", { name: "Xem mẫu có sẵn" }).click();
  await expect(page).toHaveURL(/\/templates$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
