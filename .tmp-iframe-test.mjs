import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded", timeout: 30000 });
const r = await page.evaluate(`(async () => {
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;left:0;top:0;width:1280px;height:900px;border:0;opacity:0;pointer-events:none;z-index:-1";
  const loaded = new Promise((res) => { f.onload = () => res(true); setTimeout(() => res(false), 20000); });
  f.src = "/";
  document.body.appendChild(f);
  const ok = await loaded;
  await new Promise((r) => setTimeout(r, 500));
  return { onloadFired: ok, hasDoc: !!f.contentDocument, url: f.contentWindow?.location?.href ?? "n/a" };
})()`, null, { timeout: 60000 });
console.log(JSON.stringify(r));
await browser.close();
