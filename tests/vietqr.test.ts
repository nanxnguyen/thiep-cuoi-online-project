import { test } from "node:test";
import assert from "node:assert/strict";
import { vietQrUrl, isAccountComplete } from "../lib/vietqr.ts";

const acc = { holder: "groom", bankCode: "970436", accountNumber: "0123456789", accountName: "NGUYEN VAN MINH" } as const;

test("vietQrUrl builds the compact2 image URL", () => {
  assert.equal(vietQrUrl(acc), "https://img.vietqr.io/image/970436-0123456789-compact2.png?accountName=NGUYEN%20VAN%20MINH");
  assert.equal(
    vietQrUrl(acc, "Mung cuoi"),
    "https://img.vietqr.io/image/970436-0123456789-compact2.png?accountName=NGUYEN%20VAN%20MINH&addInfo=Mung%20cuoi",
  );
});

test("isAccountComplete needs bank, 6-20 digit number and holder name", () => {
  assert.equal(isAccountComplete(acc), true);
  assert.equal(isAccountComplete({ ...acc, bankCode: "" }), false);
  assert.equal(isAccountComplete({ ...acc, accountNumber: "123" }), false);
  assert.equal(isAccountComplete({ ...acc, accountName: "  " }), false);
});
