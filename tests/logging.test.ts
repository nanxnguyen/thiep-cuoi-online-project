import assert from "node:assert/strict";
import test from "node:test";
import { redactHeaders, redactJsonText, shouldRecordTelemetry, traceId } from "../supabase/functions/_shared/logging.ts";
import { routeResponse } from "../lib/server/http.ts";

test("logging redacts credentials and PII while preserving safe shape", () => {
  assert.deepEqual(redactJsonText(JSON.stringify({
    password: "pw",
    guestToken: "guest-secret",
    email: "a@example.com",
    name: "Lan",
    attending: true,
  })), {
    password: "[REDACTED]",
    guestToken: "[REDACTED]",
    email: "[PII_REDACTED]",
    name: "[PII_REDACTED]",
    attending: true,
  });
});

test("logging truncates oversized bodies and keeps only safe headers", () => {
  assert.deepEqual(redactJsonText(JSON.stringify({ message: "x".repeat(40_000) })), { omitted: true, reason: "body_too_large" });
  assert.deepEqual(redactHeaders(new Headers({ authorization: "Bearer secret", cookie: "session=secret", "user-agent": "test", "x-request-id": "trace" })), {
    "user-agent": "test",
    "x-request-id": "trace",
  });
});

test("trace ID accepts a valid UUID and replaces forged values", () => {
  const valid = "11111111-1111-4111-8111-111111111111";
  assert.equal(traceId(new Headers({ "x-request-id": valid })), valid);
  assert.match(traceId(new Headers({ "x-request-id": "forged" })), /^[0-9a-f-]{36}$/i);
});

test("telemetry keeps important failures but samples routine successes", () => {
  assert.equal(shouldRecordTelemetry("GET", "/api/public/invitations/demo", 200, "00000000-0000-4000-8000-000000000000"), false);
  assert.equal(shouldRecordTelemetry("POST", "/api/public/invitations/demo/view", 201, "00000000-0000-4000-8000-000000000000"), false);
  assert.equal(shouldRecordTelemetry("POST", "/api/auth/login", 200, "00000000-0000-4000-8000-000000000000"), true);
  assert.equal(shouldRecordTelemetry("POST", "/api/auth/login", 200, "ffffffff-ffff-4fff-8fff-ffffffffffff"), false);
  assert.equal(shouldRecordTelemetry("POST", "/api/auth/login", 429, "ffffffff-ffff-4fff-8fff-ffffffffffff"), true);
  assert.equal(shouldRecordTelemetry("POST", "/api/test", 500, "ffffffff-ffff-4fff-8fff-ffffffffffff"), true);
});

test("route responses expose a correlation ID on success and errors", async () => {
  const request = new Request("http://localhost/api/test", { headers: { "x-request-id": "11111111-1111-4111-8111-111111111111" } });
  const ok = await routeResponse(request, async () => Response.json({ ok: true }));
  assert.equal(ok.headers.get("x-request-id"), "11111111-1111-4111-8111-111111111111");
  const failure = await routeResponse(new Request("http://localhost/api/test"), async () => { throw new Error("boom"); });
  assert.match(failure.headers.get("x-request-id") ?? "", /^[0-9a-f-]{36}$/i);
  assert.equal(failure.status, 500);
});
