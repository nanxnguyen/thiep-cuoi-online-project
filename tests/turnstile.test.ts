import assert from "node:assert/strict";
import test from "node:test";
import { verifyTurnstile } from "../lib/server/turnstile.ts";
import { HttpError } from "../lib/server/http.ts";
import { readFileSync } from "node:fs";

const previous = { ...process.env };
process.env.TURNSTILE_SECRET_KEY = "test-secret";
process.env.NEXT_PUBLIC_SITE_URL = "https://thiep-cuoi-online.nguyenvtt18.workers.dev";
test.after(() => { process.env = previous; });

function response(value: Record<string, unknown>) {
  return async () => Response.json(value);
}

test("Turnstile rejects missing and malformed tokens before calling Cloudflare", async () => {
  let calls = 0;
  const fetcher = async () => { calls++; return Response.json({ success: true }); };
  await assert.rejects(() => verifyTurnstile("", "rsvp", fetcher), (error: unknown) => error instanceof HttpError && error.status === 403);
  await assert.rejects(() => verifyTurnstile("x".repeat(2049), "rsvp", fetcher), (error: unknown) => error instanceof HttpError && error.status === 403);
  assert.equal(calls, 0);
});

test("Turnstile validates success, hostname, action, and challenge age", async () => {
  const valid = { success: true, hostname: "thiep-cuoi-online.nguyenvtt18.workers.dev", action: "wish", challenge_ts: new Date().toISOString() };
  await assert.doesNotReject(() => verifyTurnstile("token", "wish", response(valid)));
  for (const patch of [
    { success: false },
    { hostname: "evil.example" },
    { action: "rsvp" },
    { challenge_ts: new Date(Date.now() - 6 * 60_000).toISOString() },
  ]) {
    await assert.rejects(
      () => verifyTurnstile("token", "wish", response({ ...valid, ...patch })),
      (error: unknown) => error instanceof HttpError && error.status === 403,
    );
  }
});

test("Turnstile fails closed when verification times out or is unavailable", async () => {
  await assert.rejects(
    () => verifyTurnstile("token", "rsvp", async () => { throw new Error("timeout"); }),
    (error: unknown) => error instanceof HttpError && error.status === 503,
  );
});

test("RSVP and wish forms render Turnstile and submit its token", () => {
  for (const path of ["components/invitation/client/RsvpForm.tsx", "components/invitation/client/WishesPanel.tsx"]) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
    assert.match(source, /<TurnstileWidget/);
    assert.match(source, /turnstileToken/);
    assert.match(source, /resetSignal/);
  }
});
