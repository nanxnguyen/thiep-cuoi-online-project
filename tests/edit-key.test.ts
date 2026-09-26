import assert from "node:assert/strict";
import test from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createEditKey, hashEditKey, requireInvitationAccess } from "../lib/server/edit-key.ts";
import { HttpError } from "../lib/server/http.ts";

function clientReturning(body: unknown, status = 200): SupabaseClient {
  return createClient("http://supabase.test", "test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }) },
  });
}

test("edit keys contain 32 random bytes encoded as base64url", () => {
  const first = createEditKey();
  const second = createEditKey();
  assert.match(first, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(first, second);
});

test("edit key hashing is deterministic SHA-256 hex", async () => {
  assert.equal(await hashEditKey("secret"), "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b");
});

test("invitation access accepts its owner or edit key and rejects every other caller", async () => {
  const editKeyHash = await hashEditKey("right-key");
  const row = { id: "inv-1", owner_id: "owner-1", edit_key_hash: editKeyHash };

  assert.equal((await requireInvitationAccess({ client: clientReturning(row), id: "inv-1", userId: "owner-1" })).id, "inv-1");
  assert.equal((await requireInvitationAccess({ client: clientReturning(row), id: "inv-1", editKey: "right-key" })).id, "inv-1");
  await assert.rejects(
    () => requireInvitationAccess({ client: clientReturning(row), id: "inv-1" }),
    (error: unknown) => error instanceof HttpError && error.status === 401,
  );
  await assert.rejects(
    () => requireInvitationAccess({ client: clientReturning(row), id: "inv-1", editKey: "wrong", userId: "owner-2" }),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
  await assert.rejects(
    () => requireInvitationAccess({ client: clientReturning(null), id: "missing", editKey: "right-key" }),
    (error: unknown) => error instanceof HttpError && error.status === 404,
  );
});
