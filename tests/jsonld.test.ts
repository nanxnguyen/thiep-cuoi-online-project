import { test } from "node:test";
import assert from "node:assert/strict";
import { blogPosting, breadcrumbList, itemList, webApplication } from "../lib/jsonld.ts";

const B = "https://x.vn";

test("breadcrumbList numbers items from 1, absolutises paths and leaves the current page without item", () => {
  const j = breadcrumbList(B, [{ name: "Trang chủ", path: "/" }, { name: "Công cụ", path: "/cong-cu-dam-cuoi" }, { name: "Tạo QR" }]);
  assert.deepEqual(j.itemListElement.map((e) => e.position), [1, 2, 3]);
  assert.equal(j.itemListElement[0].item, "https://x.vn");
  assert.equal(j.itemListElement[1].item, "https://x.vn/cong-cu-dam-cuoi");
  assert.equal("item" in j.itemListElement[2], false);
});

test("itemList and webApplication use absolute URLs; tools are free", () => {
  assert.equal(itemList(B, [{ name: "A", path: "/a" }]).itemListElement[0].url, "https://x.vn/a");
  const w = webApplication(B, { name: "Tạo QR", path: "/cong-cu/tao-qr", description: "d" });
  assert.equal(w.url, "https://x.vn/cong-cu/tao-qr");
  assert.equal(w.offers.price, "0");
});

test("blogPosting is authored by the site, with absolute URLs and both dates", () => {
  const j = blogPosting(B, { slug: "bai-viet", title: "T", description: "d", date: "2026-10-04", updated: "2026-10-05" });
  assert.equal(j["@type"], "BlogPosting");
  assert.equal(j.url, "https://x.vn/blog/bai-viet");
  assert.equal(j.mainEntityOfPage["@id"], j.url);
  assert.equal(j.datePublished, "2026-10-04");
  assert.equal(j.dateModified, "2026-10-05");
  assert.equal(j.author.name, "MỘC Wedding");
  assert.equal(j.image, "https://x.vn/og.png");
  assert.equal(blogPosting(B, { slug: "b", title: "T", description: "d", date: "2026-10-04", updated: "2026-10-04", cover: { src: "/photos/a.jpg" } }).image, "https://x.vn/photos/a.jpg");
});
