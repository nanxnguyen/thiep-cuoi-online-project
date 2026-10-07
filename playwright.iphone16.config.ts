import { defineConfig, devices } from "playwright/test";

// Temp config: all-pages gate on desktop Chrome + real iPhone 16 (WebKit). Deleted after use.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  outputDir: "test-results",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["line"]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure", locale: "vi-VN", timezoneId: "Asia/Ho_Chi_Minh" },
  // Không tự start server ngầm. Tự chạy server trước rồi trỏ tới nó bằng E2E_BASE_URL hoặc E2E_PORT.
  projects: [
    { name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "iphone16", use: { ...devices["iPhone 16"] } },
  ],
});
