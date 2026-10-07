// Temp runner for scripts/layout-probe.js via Playwright (deleted after use).
// Usage: node run-probe.mjs <out.json> <vw> <vh> [routePrefix...] — routes narrowed by prefix match.
import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const [out, vwArg, vhArg, ...prefixes] = process.argv.slice(2);
const vw = Number(vwArg);
const vh = Number(vhArg);
const base = process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000";
const probeSrc = readFileSync(new URL("scripts/layout-probe.js", import.meta.url), "utf8");

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: vw + 160, height: vh + 120 } });
await page.goto(base + "/", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.evaluate(
  ({ vw, vh, prefixes }) => {
    window.PROBE = { vw, vh, settle: 900 };
    if (prefixes.length) {
      // narrowed later: keep full list here, filter in Node after? No — filter via PROBE.routes is read
      // inside the probe from ROUTES const; instead store prefixes for the probe to use.
      window.PROBE_PREFIXES = prefixes;
    }
  },
  { vw, vh, prefixes },
);
// Filter routes before the probe runs by patching: simplest is to evaluate a wrapper that trims ROUTES.
// The probe reads cfg.routes = ROUTES (full). Patch via string replace on the source:
const filteredSrc = prefixes.length
  ? probeSrc.replace("const routes = [];", `const ROUTES = ROUTES.filter((r) => ${JSON.stringify(prefixes)}.some((p) => r.startsWith(p))); const routes = [];`)
  : probeSrc;
const snapshot = await page.evaluate(`(${filteredSrc})()`, null, { timeout: 590000 });
writeFileSync(out, JSON.stringify(snapshot));
console.log(`wrote ${out}: ${(JSON.stringify(snapshot).length / 1048576).toFixed(1)}MB, ${snapshot.routes.length} routes`);
await browser.close();
