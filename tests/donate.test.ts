import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import { normalizeDonation, verifyWebhookSignature, verifyWebhookToken } from "../lib/server/donate-webhook.ts";
import { readFileSync } from "node:fs";

test("Casso and SePay payloads normalize to the same donation shape", () => {
  assert.deepEqual(normalizeDonation("casso", { id: "tx-1", amount: 100000, description: "Ung ho MOC", when: "2026-09-27T00:00:00Z" }), {
    provider: "casso", providerTransactionId: "tx-1", amount: 100000, content: "Ung ho MOC", occurredAt: "2026-09-27T00:00:00Z",
  });
  assert.deepEqual(normalizeDonation("sepay", { id: "tx-1", transferAmount: 100000, content: "Ung ho MOC", transactionDate: "2026-09-27T00:00:00Z" }), {
    provider: "sepay", providerTransactionId: "tx-1", amount: 100000, content: "Ung ho MOC", occurredAt: "2026-09-27T00:00:00Z",
  });
});

test("webhook signature verification rejects a tampered body", async () => {
  assert.equal(await verifyWebhookSignature("body", "secret", "wrong"), false);
  assert.equal(await verifyWebhookSignature("body", "secret", "sha256=not-valid"), false);
});

test("webhook signature verification accepts the provider HMAC", async () => {
  const signature = createHmac("sha256", "secret").update("body").digest("hex");
  assert.equal(await verifyWebhookSignature("body", "secret", `sha256=${signature}`), true);
});

test("plain provider webhook tokens use constant-time equality semantics", () => {
  assert.equal(verifyWebhookToken("secret", "secret"), true);
  assert.equal(verifyWebhookToken("secret", "other"), false);
  assert.equal(verifyWebhookToken("secret", null), false);
});

test("webhook route bounds the raw body before signature verification", () => {
  const source = readFileSync(new URL("../app/api/webhooks/[provider]/route.ts", import.meta.url), "utf8");
  assert.match(source, /readBody\(request, JSON_MAX_BYTES\)/);
  assert.doesNotMatch(source, /await request\.text\(\)/);
});

test("vietQrUrl adds the amount only for a positive integer", async () => {
  const { vietQrUrl } = await import("../lib/vietqr.ts");
  const acc = { bankCode: "970423", accountNumber: "04123513201", accountName: "Nguyễn Anh Nhựt" };
  assert.match(vietQrUrl(acc, "Ung ho", 50000), /&addInfo=Ung%20ho&amount=50000$/);
  for (const bad of [0, -5, 1.5, Number.NaN]) assert.doesNotMatch(vietQrUrl(acc, "Ung ho", bad), /amount=/);
  assert.doesNotMatch(vietQrUrl(acc, "Ung ho"), /amount=/);
});

test("donate amounts match the design chips and are strictly increasing", async () => {
  const { DONATE_AMOUNTS } = await import("../lib/donate.ts");
  assert.deepEqual(DONATE_AMOUNTS.map((a) => a[1]), ["50.000đ", "100.000đ", "200.000đ", "500.000đ"]);
  assert.deepEqual(DONATE_AMOUNTS.map((a) => a[0]), [...DONATE_AMOUNTS.map((a) => a[0])].sort((x, y) => x - y));
});
