import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { photoVariantUrl } from "../lib/image-loader.ts";
import { PHOTO_WIDTHS } from "../scripts/build-photo-variants.mjs";

test("next.config uses the build-time loader, not the Images binding", () => {
  const src = readFileSync(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(src, /loaderFile:\s*"\.\/lib\/image-loader\.ts"/);
  assert.doesNotMatch(src, /image\/avif|formats:/);
});

test("loader picks the smallest pre-built width that covers the request", () => {
  assert.equal(photoVariantUrl("/photos/o-hoa.jpg", 100), "/photos/w/o-hoa-384.webp");
  assert.equal(photoVariantUrl("/photos/o-hoa.jpg", 640), "/photos/w/o-hoa-640.webp");
  assert.equal(photoVariantUrl("/photos/o-hoa.jpg", 750), "/photos/w/o-hoa-828.webp");
  assert.equal(photoVariantUrl("/photos/o-hoa.jpg", 3840), "/photos/w/o-hoa-1200.webp");
});

test("loader leaves non-photo sources alone and widths match the generator", () => {
  assert.equal(photoVariantUrl("/og.png", 640), null);
  assert.equal(photoVariantUrl("https://example.com/x.jpg", 640), null);
  assert.deepEqual(PHOTO_WIDTHS, [384, 640, 828, 1200]);
});
