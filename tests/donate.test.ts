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
