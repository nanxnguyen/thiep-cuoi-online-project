import { test } from "node:test";
import assert from "node:assert/strict";
import { blogPosting, breadcrumbList, itemList, logoUrl, product, publisherLogo, webApplication } from "../lib/jsonld.ts";

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

test("blogPosting publisher carries a logo ImageObject (Article rich-result requirement)", () => {
  const j = blogPosting(B, { slug: "bai-viet", title: "T", description: "d", date: "2026-10-04", updated: "2026-10-05" });
  assert.equal(j.publisher.name, "MỘC Wedding");
  assert.equal(j.publisher.logo["@type"], "ImageObject");
  assert.equal(j.publisher.logo.url, "https://x.vn/logo.png");
  assert.equal(logoUrl(B), "https://x.vn/logo.png");
  assert.deepEqual(publisherLogo(B), { "@type": "ImageObject", url: "https://x.vn/logo.png" });
});

test("itemList includes image only when provided, as an absolute URL", () => {
  const j = itemList(B, [{ name: "A", path: "/a" }, { name: "B", path: "/b", image: "/photos/b.jpg" }]);
  assert.equal("image" in j.itemListElement[0], false);
  assert.equal(j.itemListElement[1].image, "https://x.vn/photos/b.jpg");
  assert.equal(itemList(B, [{ name: "C", path: "/c", image: "https://x.vn/photos/c.jpg" }]).itemListElement[0].image, "https://x.vn/photos/c.jpg");
});

test("product is a free Product with Offer, absolutised URLs and optional isRelatedTo", () => {
  const j = product(B, { name: "Mẫu thiệp cưới Mực Loang", description: "d", image: "/photos/a.jpg", url: "/templates/muc-loang" });
  assert.equal(j["@context"], "https://schema.org");
  assert.equal(j["@type"], "Product");
  assert.equal(j.image, "https://x.vn/photos/a.jpg");
  assert.equal(j.brand.name, "MỘC Wedding");
  assert.equal(j.offers.url, "https://x.vn/templates/muc-loang");
  assert.equal(j.offers.price, "0");
  assert.equal(j.offers.priceCurrency, "VND");
  assert.equal(j.offers.availability, "https://schema.org/InStock");
  assert.equal("isRelatedTo" in j, false);
  const rel = product(B, { name: "N", description: "d", image: "https://x.vn/photos/a.jpg", url: "https://x.vn/templates/x", relatedUrls: ["/templates/y"] });
  assert.deepEqual(rel.isRelatedTo, ["https://x.vn/templates/y"]);
});
