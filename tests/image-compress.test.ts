import { test } from "node:test";
import assert from "node:assert/strict";
import { compressImage, encodeWithinLimit, fitWithin, MAX_IMAGE_BYTES } from "../lib/image-compress.ts";

test("fitWithin scales the longest edge down to maxEdge and keeps the aspect ratio", () => {
  assert.deepEqual(fitWithin(4000, 3000, 1600), { width: 1600, height: 1200 });
  assert.deepEqual(fitWithin(3000, 4000, 1600), { width: 1200, height: 1600 });
  assert.deepEqual(fitWithin(2400, 2400, 1600), { width: 1600, height: 1600 });
});

test("fitWithin never upscales", () => {
  assert.deepEqual(fitWithin(800, 600, 1600), { width: 800, height: 600 });
  assert.deepEqual(fitWithin(1600, 900, 1600), { width: 1600, height: 900 });
  assert.deepEqual(fitWithin(1, 1, 1600), { width: 1, height: 1 });
});

test("fitWithin returns integers and never collapses an edge to zero", () => {
  assert.deepEqual(fitWithin(3001, 2000, 1600), { width: 1600, height: 1066 });
  assert.deepEqual(fitWithin(10000, 1, 1600), { width: 1600, height: 1 });
  assert.deepEqual(fitWithin(1, 10000, 1600), { width: 1, height: 1600 });
});

test("fitWithin rejects sizes that cannot be an image", () => {
  for (const [w, h, m] of [[0, 10, 1600], [10, -1, 1600], [Number.NaN, 10, 1600], [10, 10, 0]] as const) {
    assert.throws(() => fitWithin(w, h, m), RangeError);
  }
});

const blobOf = (size: number, type: string) => new Blob([new Uint8Array(size)], { type });

test("encodeWithinLimit keeps the first WebP result when it fits", async () => {
  const calls: [string, number][] = [];
  const out = await encodeWithinLimit(async (mime, q) => {
    calls.push([mime, q]);
    return blobOf(1000, mime);
  });
  assert.equal(out.type, "image/webp");
  assert.deepEqual(calls, [["image/webp", 0.82]]);
});

test("encodeWithinLimit retries at 0.7 then 0.6 while the result is over the limit", async () => {
  const calls: number[] = [];
  const out = await encodeWithinLimit(async (mime, q) => {
    calls.push(q);
    return blobOf(q > 0.65 ? MAX_IMAGE_BYTES + 1 : 500, mime);
  });
  assert.deepEqual(calls, [0.82, 0.7, 0.6]);
  assert.equal(out.size, 500);
});

test("encodeWithinLimit switches to JPEG when the browser cannot encode WebP", async () => {
  const calls: [string, number][] = [];
  const out = await encodeWithinLimit(async (mime, q) => {
    calls.push([mime, q]);
    // Browsers without WebP support answer a WebP request with a PNG.
    return blobOf(1000, mime === "image/webp" ? "image/png" : mime);
  });
  assert.equal(out.type, "image/jpeg");
  assert.deepEqual(calls, [["image/webp", 0.82], ["image/jpeg", 0.82]]);
});

test("encodeWithinLimit fails in Vietnamese when nothing fits or the encoder gives up", async () => {
  await assert.rejects(encodeWithinLimit(async (mime) => blobOf(MAX_IMAGE_BYTES + 1, mime)), /2 MB/);
  await assert.rejects(encodeWithinLimit(async () => null), /Không xử lý được ảnh/);
});

test("importing the module in Node is safe and compressImage explains the missing browser support", async () => {
  await assert.rejects(compressImage(new File([blobOf(10, "image/png")], "a.png")), /trình duyệt/i);
});
