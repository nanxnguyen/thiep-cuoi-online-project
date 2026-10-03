import { expect, test, type Locator, type Page } from "playwright/test";
import { defaultContent } from "../lib/content.ts";
import { templates } from "../lib/templates.ts";
import { EDIT_KEY, INVITATION_ID, mockApi, type MockApi } from "./support/mock-api";

// Flow: /studio (pick a template, names, date) -> POST /api/invitations -> /studio/{id}#k={key} -> edit -> autosave
// -> publish. Runs on every project in playwright.config.ts (desktop and mobile browsers) against a mocked API.
const GROOM = "Quang Huy";
const BRIDE = "Thu Lan";
const WEDDING_DATE = "2026-12-20";
const EDIT_URL = /\/studio\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}#k=/;

let api: MockApi;
test.beforeEach(async ({ page }) => {
  api = await mockApi(page);
});
test.afterEach(() => {
  // A call that was not mocked would hit the real backend on a live build: treat it as a bug in the test or the app.
  expect(api.unmocked, "API calls without a mock").toEqual([]);
});

const narrow = (page: Page) => (page.viewportSize()?.width ?? 1280) < 1024; // the editor switches to bottom sheets here
const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

async function fillCreateForm(page: Page, { groom = GROOM, bride = BRIDE, date = WEDDING_DATE } = {}) {
  const fields = page.locator(".sh__fields");
  await fields.getByLabel("Chú rể").fill(groom);
  await fields.getByLabel("Cô dâu").fill(bride);
  await fields.getByLabel("Ngày cưới").fill(date);
}
// Next's route announcer is also role="alert", so the app's own error paragraphs are matched by class.
const formError = (page: Page) => page.locator(".form-error");
const linkField = (page: Page) => page.getByRole("textbox", { name: "Link chỉnh sửa" });
const startButton = (page: Page) => page.getByRole("button", { name: /Bắt đầu chỉnh sửa|Đang tạo thiệp/ });

// Playwright's WebKit build on macOS aborts the whole browser (native NSInvalidArgumentException, exit 134: a missing
// NSTextInputContext selector, not a page error) when a text field's selection changes in the editor. Desktop WebKit
// therefore sets the value through the DOM and fires the "input" event React listens to; every other browser types
// for real. Drop this when Playwright's WebKit stops crashing (mobile-safari and tablet-safari are not affected).
async function setText(field: Locator, text: string, { browserName, isMobile }: { browserName: string; isMobile: boolean }) {
  if (browserName === "webkit" && !isMobile && process.platform === "darwin") {
    await field.evaluate((el, value) => {
      const input = el as HTMLInputElement;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, text);
    return;
  }
  await field.fill(text);
}

async function openSection(page: Page, label: string) {
  if (narrow(page)) await page.getByRole("button", { name: "☰ Các phần" }).click();
  await page.getByRole("navigation", { name: "Các phần của thiệp" }).getByRole("button", { name: label }).click();
}

test.describe("create an invitation", () => {
  test("picks a template, creates the draft and opens it in the editor with an autosaved edit", async ({ page, browserName, isMobile }) => {
    await page.goto("/studio");
    await expect(page.getByRole("heading", { level: 1, name: "Tạo thiệp mới" })).toBeVisible();

    const second = templates[1];
    const picker = page.getByRole("group", { name: "Chọn mẫu thiệp" });
    await picker.getByRole("button").nth(1).click();
    await expect(picker.getByRole("button").nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(picker.getByRole("button").nth(0)).toHaveAttribute("aria-pressed", "false");

    await fillCreateForm(page);
    await startButton(page).click();

    await page.waitForURL(EDIT_URL);
    expect(new URL(page.url()).hash).toBe(`#k=${EDIT_KEY}`);

    // What the browser sent to create the draft.
    expect(api.created).toHaveLength(1);
    const sent = api.created[0] as { templateId: string; content: { couple: { groom: { name: string }; bride: { name: string } }; events: { date: string }[]; paletteKey: string } };
    expect(sent.templateId).toBe(second.id);
    expect(sent.content.couple.groom.name).toBe(GROOM);
    expect(sent.content.couple.bride.name).toBe(BRIDE);
    expect(sent.content.events.length).toBeGreaterThan(0);
    for (const event of sent.content.events) expect(event.date).toBe(WEDDING_DATE); // normalised to ISO, whatever the browser's date UI
    expect(sent.content.paletteKey).toBe("");

    // The editor opened the draft with the key from the URL fragment.
    await expect(page.locator(".ed-bar__title strong")).toHaveText(`${GROOM} & ${BRIDE}`);
    await expect(page.getByRole("status").filter({ hasText: "Đã lưu tự động" })).toBeVisible();

    // Edit a field: the debounced autosave sends it with the edit key.
    await openSection(page, "Cô dâu & chú rể");
    const form = page.getByRole("complementary", { name: /Chỉnh sửa: Cô dâu & chú rể/ });
    await setText(form.getByLabel("Cô dâu", { exact: true }), "Thu Lan Anh", { browserName, isMobile: !!isMobile });
    await expect.poll(() => api.patches.length, { timeout: 8_000 }).toBeGreaterThan(0);
    const patch = api.patches.at(-1)!;
    expect(patch.key).toBe(EDIT_KEY);
    expect((patch.body.content as { couple: { bride: { name: string } } }).couple.bride.name).toBe("Thu Lan Anh");
    await expect(page.getByRole("status").filter({ hasText: "Đã lưu tự động" })).toBeVisible();
    await expect(page.locator(".ed-bar__title strong")).toHaveText(`${GROOM} & Thu Lan Anh`);
  });

  test("remembers the new invitation on this browser and lists it on /studio", async ({ page }) => {
    await page.goto("/studio");
    await fillCreateForm(page);
    await startButton(page).click();
    await page.waitForURL(EDIT_URL);
    await expect(page.locator(".ed-bar__title strong")).toHaveText(`${GROOM} & ${BRIDE}`);

    await page.goto("/studio");
    await expect(page.getByRole("heading", { name: "Thiệp đã tạo" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Chỉnh sửa" })).toHaveAttribute("href", `/studio/${INVITATION_ID}#k=${EDIT_KEY}`);
  });

  test("blocks an empty wedding date before calling the API", async ({ page }) => {
    await page.goto("/studio");
    await fillCreateForm(page);
    await page.locator(".sh__fields").getByLabel("Ngày cưới").fill("");
    await startButton(page).click();
    await expect(formError(page)).toContainText("Ngày cưới chưa hợp lệ");
    expect(api.created).toHaveLength(0);
    await expect(page).toHaveURL(/\/studio$/);
  });

  test("shows the server's message when creating fails, then succeeds on retry", async ({ page }) => {
    api.failNextCreate(503, "Máy chủ đang bận, bạn thử lại sau ít phút.");
    await page.goto("/studio");
    await fillCreateForm(page);
    await startButton(page).click();
    await expect(formError(page)).toContainText("Máy chủ đang bận");
    await expect(startButton(page)).toBeEnabled(); // not stuck on "Đang tạo thiệp…"
    expect(api.created).toHaveLength(0);

    await startButton(page).click();
    await page.waitForURL(EDIT_URL);
    expect(api.created).toHaveLength(1);
  });

  test("a double click creates one invitation, not two", async ({ page }) => {
    api.delayCreate(600);
    await page.goto("/studio");
    await fillCreateForm(page);
    const button = startButton(page);
    await button.click();
    await expect(button).toBeDisabled();
    await expect(button).toContainText("Đang tạo thiệp");
    await button.click({ force: true, noWaitAfter: true }).catch(() => undefined); // a second tap on a disabled button must do nothing
    await page.waitForURL(EDIT_URL);
    expect(api.created).toHaveLength(1);
  });

  test("brings an invitation back from its edit link", async ({ page, baseURL }) => {
    api.seed(seededContent());
    await page.goto("/studio");
    await linkField(page).fill(`${baseURL}/studio/${INVITATION_ID}#k=${EDIT_KEY}`);
    await page.getByRole("button", { name: "Mở thiệp" }).click();
    await page.waitForURL(EDIT_URL);
    await expect(page.locator(".ed-bar__title strong")).toHaveText(`${GROOM} & ${BRIDE}`);
  });

  test("rejects a malformed edit link with a readable message", async ({ page }) => {
    await page.goto("/studio");
    await linkField(page).fill("không phải link");
    await page.getByRole("button", { name: "Mở thiệp" }).click();
    await expect(formError(page)).toContainText("Link chưa đúng");
    expect(api.unmocked).toEqual([]);
  });
});

test.describe("the editor", () => {
  test.beforeEach(async () => {
    api.seed(seededContent());
  });

  test("asks for the edit link when the URL has no key", async ({ page }) => {
    await page.goto(`/studio/${INVITATION_ID}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("link chỉnh sửa");
    await expect(linkField(page)).toBeVisible();
  });

  test("says the invitation is gone when the key is wrong", async ({ page }) => {
    await page.goto(`/studio/${INVITATION_ID}#k=sai-khoa`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".ed-bar")).toHaveCount(0);
  });

  test("uses bottom sheets on narrow screens and the side outline on wide ones", async ({ page }) => {
    await page.goto(`/studio/${INVITATION_ID}#k=${EDIT_KEY}`);
    await expect(page.locator(".ed-bar")).toBeVisible();
    if (narrow(page)) {
      await expect(page.getByRole("button", { name: "☰ Các phần" })).toBeVisible();
    } else {
      await expect(page.getByRole("navigation", { name: "Các phần của thiệp" })).toBeVisible();
    }
  });

  test("publishes: the dialog suggests a link, and the published state shows the guest URL", async ({ page, baseURL }) => {
    await page.goto(`/studio/${INVITATION_ID}#k=${EDIT_KEY}`);
    await page.getByRole("button", { name: "Xuất bản", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: /Gửi thiệp/ })).toBeVisible();
    const slug = dialog.getByLabel("Địa chỉ thiệp");
    await expect(slug).toBeEnabled();
    await expect(slug).toHaveValue(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

    await dialog.getByRole("button", { name: "Xuất bản thiệp" }).click();
    await expect(dialog.getByRole("heading", { name: /đã sẵn sàng/ })).toBeVisible();
    const chosen = await api.patches.at(-1)!.body.slug;
    await expect(dialog.getByLabel("Link thiệp")).toHaveValue(`${baseURL}/invite/${chosen ?? "e2e-thiep"}`);
    expect(api.patches.at(-1)!.key).toBe(EDIT_KEY);
    expect(api.patches.at(-1)!.body.published).toBe(true);
  });
});

test.describe("layout", () => {
  test("/studio does not scroll sideways", async ({ page }) => {
    await page.goto("/studio");
    await expect(page.getByRole("heading", { level: 1, name: "Tạo thiệp mới" })).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("the editor does not scroll sideways", async ({ page }) => {
    api.seed(seededContent());
    await page.goto(`/studio/${INVITATION_ID}#k=${EDIT_KEY}`);
    await expect(page.locator(".ed-bar")).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
  });

  test("the template picker and create button are reachable without horizontal scrolling", async ({ page }) => {
    await page.goto("/studio");
    const go = startButton(page);
    await go.scrollIntoViewIfNeeded();
    const box = await go.boundingBox();
    const width = page.viewportSize()!.width;
    expect(box && box.x >= 0 && box.x + box.width <= width + 1).toBe(true);
  });
});

// Content for a seeded invitation comes from the app's own default, so it always satisfies the current schema.
function seededContent() {
  const content = defaultContent(new Date("2026-10-04T00:00:00Z"));
  content.couple.groom.name = GROOM;
  content.couple.bride.name = BRIDE;
  return content as unknown as Record<string, unknown>;
}
