import { test } from "node:test";
import assert from "node:assert/strict";
import { blogPostSeo, getPost, headingId, headings, internalLinks, posts, readingMinutes, wordCount } from "../lib/blog/index.ts";
import { PUBLIC_ROUTES } from "../lib/route-inventory.ts";
import { readFileSync } from "node:fs";
import type { PostImage } from "../lib/blog/index.ts";

test("six posts with unique kebab-case slugs, newest first", () => {
  assert.equal(posts.length, 6);
  assert.equal(new Set(posts.map((p) => p.slug)).size, posts.length);
  for (const p of posts) assert.match(p.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, p.slug);
  const dates = posts.map((p) => p.date);
  assert.deepEqual([...dates].sort().reverse(), dates);
  assert.equal(getPost(posts[0].slug), posts[0]);
  assert.equal(getPost("khong-ton-tai"), undefined);
});

test("every post is substantial and structured", () => {
  for (const p of posts) {
    assert.ok(wordCount(p) >= 700, `${p.slug}: ${wordCount(p)} words`);
    assert.ok(headings(p).length >= 3, `${p.slug}: needs at least 3 h2`);
    assert.equal(new Set(headings(p).map((h) => h.id)).size, headings(p).length, `${p.slug}: duplicate h2 ids`);
    assert.ok(p.faq.length >= 3, `${p.slug}: needs at least 3 FAQ`);
    assert.ok(readingMinutes(p) >= 1);
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(p.date) && /^\d{4}-\d{2}-\d{2}$/.test(p.updated) && p.updated >= p.date, p.slug);
    assert.ok(p.excerpt.length >= 60 && p.excerpt.length <= 220, `${p.slug}: excerpt ${p.excerpt.length}`);
  }
});

test("the target keyword appears in the title or description", () => {
  for (const p of posts) {
    const hay = `${p.title} ${p.metaTitle} ${p.description}`.toLowerCase();
    assert.ok(hay.includes(p.keyword.toLowerCase()), `${p.slug}: "${p.keyword}" missing`);
  }
  assert.equal(new Set(posts.map((p) => p.keyword)).size, posts.length, "one keyword per post");
});

test("meta title fits with the site suffix and description is 70-160 chars", () => {
  for (const p of posts) {
    const { title, description } = blogPostSeo(p);
    assert.ok(title.length + " | MỘC Wedding".length <= 60, `${p.slug}: title ${title.length}`);
    assert.ok(description.length >= 70 && description.length <= 160, `${p.slug}: description ${description.length}`);
  }
});

test("posts link to at least two internal pages and every link resolves to a public route", () => {
  const routes = new Set(PUBLIC_ROUTES);
  for (const p of posts) {
    const links = internalLinks(p);
    assert.ok(links.length >= 2, `${p.slug}: ${links.length} internal links`);
    for (const href of links) assert.ok(routes.has(href.split(/[?#]/)[0]), `${p.slug}: ${href} is not a public route`);
  }
});

test("related posts exist and never point at themselves", () => {
  const slugs = new Set(posts.map((p) => p.slug));
  for (const p of posts) {
    assert.ok(p.related.length >= 2, p.slug);
    for (const r of p.related) assert.ok(slugs.has(r) && r !== p.slug, `${p.slug} -> ${r}`);
  }
});

test("headingId strips Vietnamese diacritics without a length cap", () => {
  assert.equal(headingId("Chọn mẫu thiệp & đặt lịch"), "chon-mau-thiep-dat-lich");
  assert.ok(headingId("a ".repeat(60)).length > 40);
});

test("blog content never links off-site or uses raw HTML", () => {
  for (const p of posts) {
    const text = JSON.stringify(p);
    assert.ok(!/https?:\/\//i.test(text), `${p.slug}: external URL`);
    assert.ok(!/<\/?[a-z][^>]*>/i.test(text), `${p.slug}: raw HTML`);
  }
});

// Pixel size from the JPEG's SOF marker, so a wrong w/h in the data (which would distort the crop) fails here.
function jpegSize(file: string): { w: number; h: number } {
  const b = readFileSync(file);
  for (let i = 2; i < b.length - 9; ) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`no SOF marker in ${file}`);
}

test("every post has a cover and an in-body photo; images exist, match their size and have real alt text", () => {
  for (const p of posts) {
    const inline = p.blocks.flatMap((b) => (b.t === "img" ? [b.image] : []));
    assert.ok(inline.length >= 1, `${p.slug}: needs an in-body photo`);
    for (const img of [p.cover, ...inline] as PostImage[]) {
      assert.match(img.src, /^\/photos\/[a-z0-9-]+\.jpg$/, `${p.slug}: ${img.src}`);
      assert.deepEqual(jpegSize(`public${img.src}`), { w: img.w, h: img.h }, `${p.slug}: ${img.src} size`);
      assert.ok(img.alt.length >= 20, `${p.slug}: alt too short for ${img.src}`);
      assert.ok(!img.focus || /^\d{1,3}% \d{1,3}%$/.test(img.focus), `${p.slug}: focus ${img.focus}`);
    }
  }
  assert.equal(new Set(posts.map((p) => p.cover.src)).size, posts.length, "each post has its own cover");
});
