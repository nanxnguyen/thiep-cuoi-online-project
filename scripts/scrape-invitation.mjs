// Capture a wedding-invitation page as a REFERENCE for building our own template.
//   node scripts/scrape-invitation.mjs <url> [url2 ...] [--out refs] [--delay 1500]
//
//   node scripts/scrape-invitation.mjs --crawl <gallery-url> [--suffix /demo] [--limit N]
//
// Per URL -> <out>/<host>-<slug>/: mobile-390.png, desktop-1280.png, page.html,
// assets/, tokens.json (fonts, palette, section order), meta.txt.
// --crawl: open a gallery page, collect links one path segment below it, capture each
// (use --suffix /demo when the live invitation sits at <template>/demo).
//
// Reference only: take layout, section rhythm, palette, font pairing. Do NOT copy
// images/ornaments/commercial fonts (copyright) — ornaments are self-drawn, fonts
// get a Google Fonts equivalent. Respect each site's ToS; robots.txt is checked.
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";

const UA = "Mozilla/5.0 (compatible; MocWeddingRefBot/1.0; design-reference snapshot)";
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i < 0 ? def : args.splice(i, 2)[1];
};
const outDir = opt("--out", "refs");
const delay = Number(opt("--delay", 1500));
const crawl = opt("--crawl", ""); // gallery URL: discover template links, then capture each
const suffix = opt("--suffix", ""); // appended to each discovered link, e.g. /demo (the live invitation)
const limit = Number(opt("--limit", 0)); // 0 = all discovered
const openRe = new RegExp(opt("--open", "m[ởo] thi[ệe]p|xem thi[ệe]p|open (the )?invitation"), "i"); // cover/envelope button
const urls = args;
if (!urls.length && !crawl) {
  console.error(`Usage: node scripts/scrape-invitation.mjs <url> [url2 ...] [--out refs] [--delay 1500]
       node scripts/scrape-invitation.mjs --crawl <gallery-url> [--suffix /demo] [--limit 10]
  e.g. npm run scrape:ref -- --crawl https://chungdoi.com/vi/mau-thiep --suffix /demo --limit 5
  Re-running skips pages already captured (delete the folder to redo).`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slugOf = (u) =>
  (u.hostname + u.pathname).replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase().slice(0, 80);

// ponytail: only "User-agent: *" Disallow prefixes, no wildcards/Allow — upgrade to a robots parser if needed.
async function allowedByRobots(u) {
  try {
    const res = await fetch(new URL("/robots.txt", u), { headers: { "user-agent": UA } });
    if (!res.ok) return true;
    let applies = false;
    for (const raw of (await res.text()).split("\n")) {
      const line = raw.split("#")[0].trim();
      const [k, ...v] = line.split(":");
      const val = v.join(":").trim();
      if (/^user-agent$/i.test(k)) applies = val === "*";
      else if (applies && /^disallow$/i.test(k) && val && u.pathname.startsWith(val)) return false;
    }
  } catch {}
  return true;
}

// Slowly scroll so lazy-loaded images and on-scroll animations render before capture.
// Handles SPA-style pages where content lives in an inner overflow container instead of the document.
async function autoScroll(page) {
  await page.evaluate(async () => {
    const scrollers = [document.scrollingElement, ...document.querySelectorAll("body *")].filter(
      (el) => el.scrollHeight > el.clientHeight + 50 && (el === document.scrollingElement || /auto|scroll/.test(getComputedStyle(el).overflowY)),
    );
    const el = scrollers.sort((a, b) => b.scrollHeight - a.scrollHeight)[0] || document.scrollingElement;
    const step = Math.max(300, innerHeight * 0.7);
    for (let y = 0; y < el.scrollHeight + step; y += step) {
      el.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 250));
    }
    el.scrollTo(0, 0);
    // Unclamp the scroller and its ancestors so fullPage screenshots see all content.
    if (el !== document.scrollingElement) {
      const full = el.scrollHeight;
      for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
        n.style.setProperty("height", n === el ? `${full}px` : "auto", "important");
        n.style.setProperty("max-height", "none", "important");
        n.style.setProperty("overflow", "visible", "important");
      }
    }
  });
  await page.waitForTimeout(500);
}

// Runs in the page: fonts, palette and section order from computed styles.
function extractTokens() {
  const count = (m, k) => k && m.set(k, (m.get(k) || 0) + 1);
  const fonts = new Map();
  const colors = new Map();
  for (const el of document.querySelectorAll("body, body *")) {
    const cs = getComputedStyle(el);
    if (cs.display === "none") continue;
    count(fonts, cs.fontFamily.split(",")[0].replace(/["']/g, "").trim());
    count(colors, `color ${cs.color}`);
    if (cs.backgroundColor !== "rgba(0, 0, 0, 0)") count(colors, `bg ${cs.backgroundColor}`);
    if (parseFloat(cs.borderTopWidth) > 0) count(colors, `border ${cs.borderTopColor}`);
  }
  const top = (m, n) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, c]) => ({ value: k, count: c }));
  const real = (el) => [...el.children].filter((c) => !/^(style|script|svg|link|noscript|meta|title)$/i.test(c.tagName) && c.getBoundingClientRect().height > 0);
  let root = document.querySelector("main") || document.body;
  // Descend through single-child wrappers (SPA shells) until the blocks fan out.
  for (let i = 0; i < 8 && real(root).length === 1; i++) root = real(root)[0];
  const sections = real(root).filter((el) => !/^(style|script|svg|link|noscript)$/i.test(el.tagName)).map((el) => ({
    tag: el.tagName.toLowerCase(),
    class: (el.getAttribute("class") || "").slice(0, 80),
    height: Math.round(el.getBoundingClientRect().height),
    heading: (el.querySelector("h1,h2,h3")?.textContent || "").trim().slice(0, 80),
  }));
  const googleFonts = [...document.querySelectorAll('link[href*="fonts.googleapis.com"]')].map((l) => l.href);
  return { fonts: top(fonts, 8), palette: top(colors, 20), googleFonts, sections };
}

async function capture(browser, url, dir) {
  const meta = [`url: ${url}`, `at: ${new Date().toISOString()}`];
  mkdirSync(join(dir, "assets"), { recursive: true });
  const ctx = await browser.newContext({
    userAgent: UA,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const seen = new Set();
  page.on("response", async (res) => {
    try {
      const type = res.request().resourceType();
      if (!["image", "stylesheet", "font"].includes(type) || !res.ok() || seen.has(res.url())) return;
      seen.add(res.url());
      const name = createHash("sha1").update(res.url()).digest("hex").slice(0, 8) + "-" +
        basename(new URL(res.url()).pathname).slice(-60).replace(/[^\w.-]/g, "_");
      writeFileSync(join(dir, "assets", name), await res.body());
    } catch {}
  });
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.screenshot({ path: join(dir, "cover-390.png") }); // first screen, before any "open" gate
    meta.push("cover-390.png: ok");
    // Many invitations hide the content behind an envelope/cover button ("Mở thiệp").
    const gate = page.locator("button, a, [role=button]").filter({ hasText: openRe }).first();
    if (await gate.isVisible().catch(() => false)) {
      await gate.click({ timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(2000);
      meta.push("open-gate: clicked");
    }
    await autoScroll(page);
    await page.screenshot({ path: join(dir, "mobile-390.png"), fullPage: true });
    meta.push("mobile-390.png: ok");

    writeFileSync(join(dir, "tokens.json"), JSON.stringify(await page.evaluate(extractTokens), null, 2));
    meta.push("tokens.json: ok");
    writeFileSync(join(dir, "page.html"), await page.content());
    meta.push(`page.html: ok, assets: ${seen.size}`);

    await page.setViewportSize({ width: 1280, height: 800 });
    await autoScroll(page);
    await page.screenshot({ path: join(dir, "desktop-1280.png"), fullPage: true });
    meta.push("desktop-1280.png: ok");
    meta.push(`title: ${await page.title()}`);
  } finally {
    await ctx.close();
  }
  return meta;
}

// Template links on a gallery page = same-origin links exactly one path segment below it.
async function discover(browser, galleryUrl) {
  const g = new URL(galleryUrl);
  const base = g.pathname.replace(/\/$/, "") + "/";
  const page = await browser.newPage({ userAgent: UA });
  try {
    await page.goto(galleryUrl, { waitUntil: "networkidle", timeout: 45000 });
    await autoScroll(page);
    const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.href));
    const found = new Set();
    for (const h of hrefs) {
      const u = new URL(h);
      if (u.origin !== g.origin || !u.pathname.startsWith(base)) continue;
      if (u.pathname.slice(base.length).replace(/\/$/, "").split("/").length !== 1 || u.pathname === base) continue;
      found.add(u.origin + u.pathname.replace(/\/$/, "") + suffix);
    }
    return [...found];
  } finally {
    await page.close();
  }
}

const browser = await chromium.launch();
let failed = 0;
if (crawl) {
  const found = await discover(browser, crawl);
  console.log(`Discovered ${found.length} template links from ${crawl}`);
  urls.push(...(limit ? found.slice(0, limit) : found));
}
for (const [i, raw] of urls.entries()) {
  if (i) await sleep(delay);
  let u;
  try {
    u = new URL(raw);
  } catch {
    console.error(`SKIP invalid url: ${raw}`);
    failed++;
    continue;
  }
  if (!(await allowedByRobots(u))) {
    console.warn(`SKIP robots.txt disallows: ${raw}`);
    failed++;
    continue;
  }
  const dir = join(outDir, slugOf(u));
  if (existsSync(join(dir, "meta.txt")) && readFileSync(join(dir, "meta.txt"), "utf8").includes("desktop-1280.png: ok")) {
    console.log(`SKIP already captured: ${raw}`);
    continue;
  }
  mkdirSync(dir, { recursive: true });
  try {
    const meta = await capture(browser, raw, dir);
    writeFileSync(join(dir, "meta.txt"), meta.join("\n") + "\n");
    console.log(`OK   ${raw} -> ${dir}`);
  } catch (e) {
    failed++;
    writeFileSync(join(dir, "meta.txt"), `url: ${raw}\nerror: ${e.message}\n`);
    console.error(`FAIL ${raw}: ${e.message}`);
  }
}
await browser.close();
process.exit(failed ? 1 : 0);
