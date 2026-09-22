import { test } from "node:test";
import assert from "node:assert/strict";
import { qrImageUrl } from "../lib/tools/qr.ts";

test("qrImageUrl builds a qrserver.com URL with encoded data", () => {
  assert.equal(
    qrImageUrl("https://moc.wedding/invite/nam-lan"),
    "https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=8&data=https%3A%2F%2Fmoc.wedding%2Finvite%2Fnam-lan",
  );
});

test("qrImageUrl clamps size to a sane range", () => {
  assert.match(qrImageUrl("https://a.b", 50), /size=120x120/);
  assert.match(qrImageUrl("https://a.b", 5000), /size=1000x1000/);
  assert.match(qrImageUrl("https://a.b", 240), /size=240x240/);
});
