import assert from "node:assert/strict";
import test from "node:test";
import { securityHeaders } from "../lib/server/security.ts";
import { enforceRateLimit, consumeRateLimit } from "../lib/server/rate-limit.ts";
import { routeResponse } from "../lib/server/http.ts";
import { readFileSync } from "node:fs";

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

test("rate-limit enforcement returns 429 with Retry-After", async () => {
  const client = { rpc: async () => ({ data: false, error: null }) };
  const response = await routeResponse(() => enforceRateLimit(client as never, "create:abc", 3, 90).then(() => new Response(null)));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "90");
});

test("abuse-prone routes enforce their documented buckets", () => {
  const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  assert.match(read("app/api/public/invitations/[slug]/view/route.ts"), /`view:\$\{requestFingerprint\(request\.headers\)\}:\$\{slug\}`\s*,\s*30,\s*60/);
  assert.match(read("app/api/public/invitations/[slug]/guests/[token]/route.ts"), /`guest-token:\$\{requestFingerprint\(request\.headers\)\}:\$\{slug\}`\s*,\s*30,\s*60/);
  assert.match(read("app/api/webhooks/[provider]/route.ts"), /`webhook:\$\{requestFingerprint\(request\.headers\)\}:\$\{provider\}`\s*,\s*20,\s*60/);
  assert.match(read("app/api/invitations/[id]/media/route.ts"), /`upload-ip:\$\{requestFingerprint\(request\.headers\)\}`\s*,\s*60,\s*3600/);
  assert.match(read("app/api/invitations/route.ts"), /`create:\$\{requestFingerprint\(request\.headers\)\}`\s*,\s*10,\s*3600/);
});

test("owner write buckets include both actor and invitation", () => {
  const routes = [
    "app/api/invitations/[id]/route.ts",
    "app/api/invitations/[id]/guests/route.ts",
    "app/api/invitations/[id]/guests/import/route.ts",
    "app/api/invitations/[id]/guests/[guestId]/route.ts",
    "app/api/invitations/[id]/wishes/[wishId]/route.ts",
  ];
  for (const path of routes) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    assert.match(source, /`owner-write:\$\{auth\.actorKey\}:\$\{id\}`\s*,\s*120,\s*60/, path);
  }
  const invitationRoute = readFileSync(new URL("../app/api/invitations/[id]/route.ts", import.meta.url), "utf8");
  assert.equal(invitationRoute.match(/owner-write:/g)?.length, 2, "PATCH and DELETE must both be limited");
});
