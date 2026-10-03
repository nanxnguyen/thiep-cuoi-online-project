import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Every internal link/button target written as a literal in app/, components/ and lib/ must land on a real page.
// Catches a CTA that points at a renamed or missing route (the "Xem mẫu có sẵn" kind of bug) without a browser.
const ROOT = join(import.meta.dirname, "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const pages = walk(join(ROOT, "app"))
  .filter((f) => /\/page\.tsx$/.test(f))
  .map((f) => f.slice(join(ROOT, "app").length, -"/page.tsx".length) || "/");

function routeExists(path: string): boolean {
  if (path === "/") return pages.includes("/");
  const want = path.split("/");
  return pages.some((page) => {
    const have = page.split("/");
    return have.length === want.length && have.every((seg, i) => /^\[.+\]$/.test(seg) || seg === want[i]);
  });
}

// Quoted literals only: backtick links like `/invite/${slug}` are dynamic.
const HREF = /(?:href=|href:\s*|to:\s*)\{?["'](\/[^"'#?\s]*)/g;

test("every literal internal href resolves to a page route", () => {
  const files = ["app", "components", "lib"].flatMap((d) => walk(join(ROOT, d))).filter((f) => /\.tsx?$/.test(f));
  const broken: string[] = [];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(HREF)) {
      const path = m[1].replace(/\/$/, "") || "/";
      if (path.startsWith("/api") || /\.[a-z0-9]+$/i.test(path)) continue; // endpoints and static files
      if (!routeExists(path) && !existsSync(join(ROOT, "public", path))) broken.push(`${file.slice(ROOT.length + 1)} -> ${path}`);
    }
  }
  assert.deepEqual(broken, []);
});

test("the custom-design page's 'Xem mẫu có sẵn' button goes to the template gallery", () => {
  const src = readFileSync(join(ROOT, "app/thiet-ke-thiep-rieng/page.tsx"), "utf8");
  assert.match(src, /href="\/templates"[^>]*>\s*Xem mẫu có sẵn/);
});
