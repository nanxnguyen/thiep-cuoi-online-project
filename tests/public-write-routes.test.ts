import assert from "node:assert/strict";
import test from "node:test";
import { forwardPublicWrite, parsePublicPayload, requestFingerprint } from "../lib/server/public-write.ts";
import { HttpError } from "../lib/server/http.ts";
import { readFileSync } from "node:fs";

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

test("production fingerprint trusts Cloudflare, normalizes it, and ignores forwarded headers", () => {
  const headers = new Headers({
    "cf-connecting-ip": " 2001:DB8::1 ",
    "x-forwarded-for": "203.0.113.9",
    "x-nf-client-connection-ip": "203.0.113.10",
  });
  const value = requestFingerprint(headers, true);
  assert.match(value, /^[0-9a-f]{64}$/);
  assert.equal(value, requestFingerprint(new Headers({ "cf-connecting-ip": "2001:db8::1", "x-forwarded-for": "198.51.100.1" }), true));
  assert.equal(value.includes("2001:db8::1"), false);
});

test("production fingerprint fails closed without a valid Cloudflare address", () => {
  assert.throws(() => requestFingerprint(new Headers({ "x-forwarded-for": "203.0.113.9" }), true), (error: unknown) => error instanceof HttpError && error.status === 400);
  assert.throws(() => requestFingerprint(new Headers({ "cf-connecting-ip": "not-an-ip" }), true), (error: unknown) => error instanceof HttpError && error.status === 400);
});

test("development fingerprint accepts the local forwarding header", () => {
  const headers = new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" });
  assert.equal(requestFingerprint(headers, false), requestFingerprint(new Headers({ "x-forwarded-for": "203.0.113.9" }), false));
  assert.doesNotThrow(() => requestFingerprint(new Headers(), false));
});

test("public RSVP and wish routes parse through the 64 KiB bounded JSON reader", () => {
  for (const action of ["rsvp", "wishes"]) {
    const source = readFileSync(new URL(`../app/api/public/invitations/[slug]/${action}/route.ts`, import.meta.url), "utf8");
    assert.match(source, /parseJson\(request, z\.unknown\(\), JSON_MAX_BYTES\)/);
    assert.doesNotMatch(source, /request\.json\(/);
  }
});

test("Edge adapter forwards only its internal contract and secret", async () => {
  let captured: { url: string; init?: RequestInit } | undefined;
  const result = await forwardPublicWrite("rsvp", "minh-an", rsvp, "a".repeat(64), "request-key-123456", async (input, init) => {
    captured = { url: String(input), init };
    return new Response(null, { status: 204 });
  });
  assert.equal(result.status, 204);
  assert.equal(captured?.url, "https://project.supabase.co/functions/v1/public-write");
  const headers = Object.fromEntries(new Headers(captured?.init?.headers));
  assert.deepEqual({ ...headers, "x-request-id": undefined, "x-parent-trace-id": undefined }, {
    "content-type": "application/json",
    "idempotency-key": "request-key-123456",
    "x-edge-secret": "edge-secret",
    "x-request-id": undefined,
    "x-parent-trace-id": undefined,
  });
  assert.match(headers["x-request-id"], /^[0-9a-f-]{36}$/i);
  assert.equal(headers["x-parent-trace-id"], headers["x-request-id"]);
  assert.deepEqual(JSON.parse(String(captured?.init?.body)), { action: "rsvp", slug: "minh-an", payload: rsvp, fingerprint: "a".repeat(64) });
});
