import { existsSync } from "node:fs";
import { defineConfig, devices } from "playwright/test";

// Browser matrix for the invitation-creation flow (e2e/). Run one project at a time on a laptop:
//   npm run build:next && npm run e2e -- --project=chrome
// WebKit (Safari engine) and Firefox are not installed by default: `npx playwright install webkit firefox`.
// Chrome and Edge use the browsers installed on the machine (channel "chrome" / "msedge").
// Playwright cannot drive the real Safari app: "safari" and "mobile-safari" run WebKit, the engine Safari uses.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

// Cốc Cốc is Chromium-based. With the real app installed (or COCCOC_PATH set) the "coccoc" project launches it;
// without it, "coccoc-emulated" runs Chromium with Cốc Cốc's user agent, which checks UA handling but not the app itself.
const COCCOC_PATH = process.env.COCCOC_PATH ?? "/Applications/CocCoc.app/Contents/MacOS/CocCoc";
const COCCOC_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 coc_coc_browser/138.0.0";
const coccoc = existsSync(COCCOC_PATH)
  ? { name: "coccoc", use: { ...devices["Desktop Chrome"], launchOptions: { executablePath: COCCOC_PATH } } }
  : { name: "coccoc-emulated", use: { ...devices["Desktop Chrome"], userAgent: COCCOC_UA } };

export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1, // a Playwright run next to `next start` has already starved this machine once
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure", locale: "vi-VN", timezoneId: "Asia/Ho_Chi_Minh" },
  // Serves the production build; set E2E_BASE_URL to test an already running server (dev, preview, staging) instead.
  webServer: process.env.E2E_BASE_URL ? undefined : { command: `npx next start -p ${PORT}`, url: baseURL, reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
    { name: "safari", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    coccoc,
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"], channel: "chrome" } },
    { name: "tablet-safari", use: { ...devices["iPad Pro 11"] } },
  ],
});
