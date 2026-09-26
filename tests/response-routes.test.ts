import assert from "node:assert/strict";
import test from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getResponses, setWishModeration } from "../lib/server/responses.ts";
import { subscribeToWishes } from "../lib/supabase-browser.ts";
import { HttpError } from "../lib/server/http.ts";

const invitation = { id: "11111111-1111-4111-8111-111111111111", owner_id: "user-1", edit_key_hash: "0".repeat(64) };
const wishId = "22222222-2222-4222-8222-222222222222";

function queuedClient(responses: { body: unknown; status?: number }[], calls: { url: string; init?: RequestInit }[] = []): SupabaseClient {
  return createClient("http://supabase.test", "service-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input, init) => {
      calls.push({ url: String(input), init });
      const response = responses.shift();
      if (!response) throw new Error("Unexpected Supabase request");
      return new Response(JSON.stringify(response.body), { status: response.status ?? 200, headers: { "content-type": "application/json" } });
    } },
  });
}

test("responses use the database summary and map deterministic owner rows", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const rsvps = [{ id: "r2", name: "Lan", attending: false, guests: 0, note: "", answers: {}, guest_label: "Nhà Lan", created_at: "2026-09-26T02:00:00Z" }];
  const summary = { attending: 2, declined: 1, headcount: 5 };
  const wishes = [{ id: wishId, name: "Mai", message: "Chúc mừng", hidden: false, approved: false, created_at: "2026-09-26T03:00:00Z" }];
  const dto = await getResponses(queuedClient([{ body: invitation }, { body: rsvps }, { body: summary }, { body: wishes }], calls), invitation.id, undefined, "user-1");
  assert.deepEqual(dto.summary, summary);
  assert.deepEqual(dto.rsvps[0], { id: "r2", name: "Lan", attending: false, guests: 0, note: "", answers: {}, guestLabel: "Nhà Lan", createdAt: "2026-09-26T02:00:00Z" });
  assert.equal(dto.wishes[0].approved, false);
  assert.match(calls[1].url, /order=created_at\.desc%2Cid\.desc/);
  assert.match(calls[2].url, /rpc\/get_response_summary/);
});

test("wish moderation supports approve/reject and hide/show within one invitation", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  await setWishModeration(queuedClient([{ body: invitation }, { body: { id: wishId } }], calls), invitation.id, wishId, { approved: true, hidden: false }, undefined, "user-1");
  assert.deepEqual(JSON.parse(String(calls[1].init?.body)), { approved: true, hidden: false });
  assert.match(calls[1].url, new RegExp(`invitation_id=eq\\.${invitation.id}`));

  await assert.rejects(
    () => setWishModeration(queuedClient([{ body: invitation }, { body: null }]), invitation.id, wishId, { hidden: true }, undefined, "user-1"),
    (error: unknown) => error instanceof HttpError && error.status === 404,
  );
  await assert.rejects(
    () => setWishModeration(queuedClient([{ body: invitation }]), invitation.id, wishId, {}, undefined, "user-1"),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
});

test("Realtime subscription is scoped and always returns an unsubscribe cleanup", () => {
  let config: Record<string, unknown> | undefined;
  let callback: (() => void) | undefined;
  let removed = false;
  const channel = {
    on: (_kind: string, next: Record<string, unknown>, handler: () => void) => { config = next; callback = handler; return channel; },
    subscribe: () => channel,
  };
  const client = { channel: () => channel, removeChannel: () => { removed = true; } };
  let changes = 0;
  const cleanup = subscribeToWishes(invitation.id, () => { changes++; }, client);
  assert.equal(config?.filter, `invitation_id=eq.${invitation.id}`);
  callback?.();
  assert.equal(changes, 1);
  cleanup();
  assert.equal(removed, true);
});
