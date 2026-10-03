// Collect high-quality bride & groom photos from Google Images as MOOD / REFERENCE for
// wedding-invitation templates (Korean, Western, Chinese; romantic, traditional, modern).
//   node scripts/scrape-couple-photos.mjs [--cat korean,western,chinese] [--per-cat 30]
//        [--out image-scrapt] [--min-long 1400] [--min-short 900] [--scrolls 6]
//        [--q "custom query"] [--headless] [--delay 4000] [--profile <dir>]
//
// Output: <out>/<category>/<category>-<hash>.jpg + <out>/index.json (source URL, size, hashes).
// Re-running is safe: index.json is the dedupe memory (URL, SHA-1, perceptual dHash), so
// nothing already collected is downloaded twice, and --per-cat counts what is already there.
//
// "Highly rated" proxy (Google has no ratings): Google's own relevance rank, how many
// different queries surface the same photo, large size only (tbs=isz:l), min resolution,
// stock-watermark hosts blocked. Pick the final shortlist by eye.
//
// Reference only: photos belong to their authors — do NOT ship them in the product without
// a licence. Google may show a CAPTCHA (esp. headless): run headed (default) and solve it;
// the script waits. Automated Google queries are against Google's ToS — keep volume low.
import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i < 0 ? def : args.splice(i, 2)[1];
};
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 && !!args.splice(i, 1);
};
const outDir = opt("--out", "image-scrapt");
const perCat = Number(opt("--per-cat", 30));
const minLong = Number(opt("--min-long", 1400));
const minShort = Number(opt("--min-short", 900));
const scrolls = Number(opt("--scrolls", 6));
const delay = Number(opt("--delay", 4000));
const headless = flag("--headless");
const customQ = opt("--q", "");
const profileDir = opt("--profile", join(outDir, ".browser-profile"));
const cats = opt("--cat", "korean,western,chinese").split(",").map((s) => s.trim());

const QUERIES = {
  korean: [
    "Hyun Bin Son Ye-jin wedding photo 2022",
    "Park Shin-hye Choi Tae-joon wedding photo 2022",
    "Lee Seung-gi Lee Da-in wedding photo 2023",
    "Kim Woo-bin Shin Min-a wedding photo 2026",
    "Ryu Jun-yeol Han So-hee couple photo",
    "korean actor actress wedding ceremony photos 2024",
    "korean celebrity wedding photo couple 2025",
    "Lee Jong-suk wedding photo",
  ],
  western: [
    "romantic wedding couple portrait golden hour",
    "award winning wedding photography couple",
    "fine art wedding couple portrait editorial",
    "luxury destination wedding couple photography",
    "classic timeless wedding couple photo",
  ],
  chinese: [
    "chinese pre wedding photography couple",
    "chinese traditional wedding couple qipao photo",
    "中式婚纱照 情侣 高清",
    "韩式婚纱照 唯美",
    "chinese modern wedding photo shoot elegant",
  ],
};

// Watermarked / low-value hosts and thumbnails.
const BLOCK = /(shutterstock|alamy|istockphoto|gettyimages|dreamstime|depositphotos|123rf|adobestock|stock\.adobe|vecteezy|freepik|pngtree|pinterest\.[a-z.]+\/(?!.*originals)|gstatic\.com|googleusercontent\.com\/proxy|lookaside\.fbsbx|ytimg|favicon|\.svg|\.gif)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms + Math.random() * 800));
const sha1 = (buf) => createHash("sha1").update(buf).digest("hex");

mkdirSync(outDir, { recursive: true });
const indexPath = join(outDir, "index.json");
const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : { items: [] };
const save = () => writeFileSync(indexPath, JSON.stringify(index, null, 2));

const hamming = (a, b) => {
  let x = BigInt("0x" + a) ^ BigInt("0x" + b), n = 0;
  for (; x; x >>= 1n) n += Number(x & 1n);
  return n;
};
const isDupe = (url, hash, dh) =>
  index.items.some((it) => it.url === url || it.sha1 === hash || (dh && it.dhash && hamming(it.dhash, dh) <= 6));

// ponytail: regex over Google's embedded result JSON ([url,h,w] triples) — breaks if Google changes its payload; then fall back to clicking thumbnails.
function extract(text, into) {
  const t = text
    .replace(/\\+u003d/gi, "=").replace(/\\+u0026/gi, "&").replace(/\\+\//g, "/").replace(/\\+"/g, '"');
  for (const m of t.matchAll(/\["(https?:\/\/[^"\s\\]+)",(\d{3,5}),(\d{3,5})\]/g)) {
    const [, url, h, w] = m;
    if (BLOCK.test(url) || into.has(url)) continue;
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(url) && !/[?&](format|fm)=/i.test(url) && /\.[a-z]{3,4}(\?|$)/i.test(url)) continue;
    into.set(url, { url, w: +w, h: +h, rank: into.size });
  }
}

async function waitIfBlocked(page) {
  if (!/\/sorry\/|consent\.google/.test(page.url())) return;
  if (/consent\.google/.test(page.url())) {
    await page.locator("button").filter({ hasText: /reject all|accept all|từ chối tất cả|chấp nhận tất cả/i }).first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1500);
    return;
  }
  if (headless) throw new Error("Google CAPTCHA (/sorry). Re-run without --headless and solve it.");
  console.warn("  CAPTCHA — solve it in the browser window (waiting up to 3 min)…");
  await page.waitForURL((u) => !/\/sorry\//.test(u.href), { timeout: 180000 });
}

async function searchGoogle(page, q) {
  const found = new Map();
  const onResp = async (res) => {
    try {
      if (!/google\.[a-z.]+\//.test(res.url())) return;
      const ct = res.headers()["content-type"] || "";
      if (/text|json|javascript/.test(ct)) extract(await res.text(), found);
    } catch {}
  };
  page.on("response", onResp);
  try {
    const url = `https://www.google.com/search?tbm=isch&hl=en&safe=active&tbs=isz:l&q=${encodeURIComponent(q)}`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await waitIfBlocked(page);
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    extract(await page.content(), found);
    for (let i = 0; i < scrolls; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator("input[value*='Show more'], div[role=button]:has-text('Show more results')").first().click({ timeout: 800 }).catch(() => {});
      await page.waitForTimeout(1200);
    }
    extract(await page.content(), found);
  } finally {
    page.off("response", onResp);
  }
  return [...found.values()];
}

// Official route (no CAPTCHA): set GOOGLE_CSE_KEY + GOOGLE_CSE_CX (Programmable Search Engine with
// "Image search" on, "Search the entire web" on). Free quota: 100 queries/day, 10 results each.
const CSE_KEY = process.env.GOOGLE_CSE_KEY, CSE_CX = process.env.GOOGLE_CSE_CX;
const USE_API = !!(CSE_KEY && CSE_CX);
async function searchApi(q) {
  const out = [];
  for (let start = 1; start <= 91; start += 10) { // API caps at 100 results per query
    const u = new URL("https://www.googleapis.com/customsearch/v1");
    u.search = new URLSearchParams({ key: CSE_KEY, cx: CSE_CX, q, searchType: "image", imgSize: "huge", safe: "active", num: "10", start: String(start) });
    const res = await fetch(u);
    if (!res.ok) throw new Error(`CSE ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const { items = [] } = await res.json();
    for (const it of items) if (!BLOCK.test(it.link)) out.push({ url: it.link, w: it.image?.width ?? 0, h: it.image?.height ?? 0, rank: out.length });
    if (items.length < 10) break;
  }
  return out;
}

// Decode in the browser: true dimensions + 64-bit difference hash (no native deps needed).
async function inspect(page, buf) {
  return page.evaluate(async (b64) => {
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const bmp = await createImageBitmap(new Blob([bin]));
    const c = new OffscreenCanvas(9, 8);
    const g = c.getContext("2d");
    g.drawImage(bmp, 0, 0, 9, 8);
    const d = g.getImageData(0, 0, 9, 8).data;
    const lum = (i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    let bits = "";
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += lum((y * 9 + x) * 4) > lum((y * 9 + x + 1) * 4) ? "1" : "0";
    const hex = bits.match(/.{4}/g).map((b) => parseInt(b, 2).toString(16)).join("");
    return { w: bmp.width, h: bmp.height, dhash: hex };
  }, buf.toString("base64"));
}

async function download(ctx, page, cand, cat, query) {
  const res = await ctx.request.get(cand.url, { timeout: 25000, headers: { referer: "https://www.google.com/" } });
  if (!res.ok()) return "http " + res.status();
  const type = (res.headers()["content-type"] || "").split(";")[0];
  const ext = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type];
  if (!ext) return "type " + type;
  const buf = await res.body();
  if (buf.length < 80_000) return "too small (" + Math.round(buf.length / 1024) + "KB)";
  const hash = sha1(buf);
  if (isDupe(cand.url, hash, null)) return "duplicate (exact)";
  const { w, h, dhash } = await inspect(page, buf).catch(() => ({}));
  if (!w) return "undecodable";
  if (Math.max(w, h) < minLong || Math.min(w, h) < minShort) return `low-res ${w}x${h}`;
  const ar = w / h;
  if (ar > 2.2 || ar < 0.4) return `odd aspect ${ar.toFixed(2)}`;
  if (isDupe(cand.url, hash, dhash)) return "duplicate (similar)";
  const dir = join(outDir, cat);
  mkdirSync(dir, { recursive: true });
  const file = `${cat}-${hash.slice(0, 10)}.${ext}`;
  writeFileSync(join(dir, file), buf);
  index.items.push({ file: `${cat}/${file}`, category: cat, query, url: cand.url, w, h, bytes: buf.length, sha1: hash, dhash, hits: cand.hits, at: new Date().toISOString() });
  save();
  return null;
}

// Persistent profile: a CAPTCHA you solve once (or a Google login) is remembered across runs.
const ctx = await chromium.launchPersistentContext(profileDir, {
  headless: headless || USE_API,
  locale: "en-US",
  viewport: { width: 1440, height: 900 },
});
const page = await ctx.newPage();
const work = await ctx.newPage(); // blank page used only for canvas decoding
let failed = 0;

for (const cat of cats) {
  const queries = customQ ? [customQ] : QUERIES[cat];
  if (!queries) {
    console.error(`SKIP unknown category: ${cat} (known: ${Object.keys(QUERIES).join(", ")})`);
    failed++;
    continue;
  }
  let have = index.items.filter((i) => i.category === cat).length;
  if (have >= perCat) {
    console.log(`[${cat}] already ${have}/${perCat}`);
    continue;
  }
  // Merge candidates across queries: photos surfacing in several queries rank higher.
  const pool = new Map();
  for (const q of queries) {
    try {
      const list = USE_API ? await searchApi(q) : await searchGoogle(page, q);
      console.log(`[${cat}] "${q}" -> ${list.length} candidates`);
      for (const c of list) {
        if (Math.max(c.w, c.h) < minLong || Math.min(c.w, c.h) < minShort) continue;
        const p = pool.get(c.url) || { ...c, hits: 0, bestRank: Infinity, q };
        p.hits++;
        p.bestRank = Math.min(p.bestRank, c.rank);
        pool.set(c.url, p);
      }
    } catch (e) {
      failed++;
      console.error(`[${cat}] FAIL "${q}": ${e.message}`);
    }
    await sleep(delay);
  }
  const ranked = [...pool.values()].sort((a, b) => b.hits - a.hits || a.bestRank - b.bestRank || b.w * b.h - a.w * a.h);
  console.log(`[${cat}] ${ranked.length} candidates after size filter, need ${perCat - have} more`);
  for (const cand of ranked) {
    if (have >= perCat) break;
    try {
      const why = await download(ctx, work, cand, cat, cand.q);
      if (why) console.log(`  skip ${why}: ${cand.url.slice(0, 90)}`);
      else {
        have++;
        console.log(`  OK ${have}/${perCat} ${cand.w}x${cand.h} hits=${cand.hits}`);
      }
    } catch (e) {
      console.log(`  skip ${e.message.split("\n")[0]}: ${cand.url.slice(0, 90)}`);
    }
  }
}

await ctx.close();
console.log(`Done. ${index.items.length} photos in ${outDir}/ (index.json)`);
process.exit(failed ? 1 : 0);
