import assert from "node:assert/strict";
import test from "node:test";
import { securityHeaders } from "../lib/server/security.ts";
import { consumeRateLimit } from "../lib/server/rate-limit.ts";

test("security headers prevent framing, MIME sniffing, and referrer leakage", () => {
  assert.deepEqual(securityHeaders(), {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });
});

test("security headers are fresh objects for each response", () => {
  const first = securityHeaders();
  first["X-Frame-Options"] = "bad";
  assert.equal(securityHeaders()["X-Frame-Options"], "DENY");
});

test("rate limit denies only after the database says the window is exhausted", async () => {
  const calls: unknown[] = [];
  const client = { rpc: async (...args: unknown[]) => { calls.push(args); return { data: false, error: null }; } };
  assert.equal(await consumeRateLimit(client as never, "create:abc", 3, 3600), false);
  assert.deepEqual(calls, [["consume_rate_limit", { p_key: "create:abc", p_limit: 3, p_window_seconds: 3600 }]]);
});
