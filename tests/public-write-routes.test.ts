import assert from "node:assert/strict";
import test from "node:test";
import { forwardPublicWrite, parsePublicPayload, requestFingerprint } from "../lib/server/public-write.ts";
import { HttpError } from "../lib/server/http.ts";

const previous = { ...process.env };
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service";
process.env.EDGE_SHARED_SECRET = "edge-secret";
process.env.RATE_LIMIT_HMAC_SECRET = "fingerprint-secret";

test.after(() => { process.env = previous; });

const rsvp = { name: " Lan ", attending: true, guests: 2, note: "", answers: {}, guestLabel: "", guestToken: "", website: "" };

test("public payload validation preserves the API contract", () => {
  assert.equal(parsePublicPayload("rsvp", rsvp).name, "Lan");
  assert.equal(parsePublicPayload("wish", { name: "Lan", message: "Chúc mừng", website: "" }).message, "Chúc mừng");
  assert.throws(() => parsePublicPayload("rsvp", { ...rsvp, guests: 101 }), (error: unknown) => error instanceof HttpError && error.status === 400);
});

test("fingerprint is deterministic HMAC and never contains the forwarded IP", () => {
  const headers = new Headers({ "x-nf-client-connection-ip": "203.0.113.9" });
  const value = requestFingerprint(headers);
  assert.match(value, /^[0-9a-f]{64}$/);
  assert.equal(value, requestFingerprint(headers));
  assert.equal(value.includes("203.0.113.9"), false);
});

test("Edge adapter forwards only its internal contract and secret", async () => {
  let captured: { url: string; init?: RequestInit } | undefined;
  const result = await forwardPublicWrite("rsvp", "minh-an", rsvp, "a".repeat(64), "request-key-123456", async (input, init) => {
    captured = { url: String(input), init };
    return new Response(null, { status: 204 });
  });
  assert.equal(result.status, 204);
  assert.equal(captured?.url, "https://project.supabase.co/functions/v1/public-write");
  assert.deepEqual(Object.fromEntries(new Headers(captured?.init?.headers)), {
    "content-type": "application/json",
    "idempotency-key": "request-key-123456",
    "x-edge-secret": "edge-secret",
  });
  assert.deepEqual(JSON.parse(String(captured?.init?.body)), { action: "rsvp", slug: "minh-an", payload: rsvp, fingerprint: "a".repeat(64) });
});
