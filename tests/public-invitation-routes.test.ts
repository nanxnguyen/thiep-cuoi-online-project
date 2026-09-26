import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import { defaultContent } from "../lib/content.ts";
import { getPublicInvitation } from "../lib/server/invitations.ts";

function clientReturning(...bodies: unknown[]) {
  return createClient("http://supabase.test", "anon-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async () => new Response(JSON.stringify(bodies.shift()), { headers: { "content-type": "application/json" } }) },
  });
}

test("public invitation projection includes approved visible wishes and no private fields", async () => {
  const content = defaultContent();
  const invitation = {
    id: "inv-1", slug: "minh-an", template_id: "song-hy", content,
    owner_id: "must-not-leak", edit_key_hash: "must-not-leak",
  };
  const wishes = [{ id: "w1", name: "Lan", message: "Trăm năm hạnh phúc", created_at: "2026-09-26T00:00:00Z" }];
  const dto = await getPublicInvitation(clientReturning(invitation, wishes), "minh-an");

  assert.deepEqual(dto, {
    id: "inv-1",
    slug: "minh-an",
    templateId: "song-hy",
    content,
    wishes: [{ id: "w1", name: "Lan", message: "Trăm năm hạnh phúc", createdAt: "2026-09-26T00:00:00Z" }],
  });
  assert.equal(JSON.stringify(dto).includes("must-not-leak"), false);
});

test("draft and unknown slugs both resolve to null", async () => {
  assert.equal(await getPublicInvitation(clientReturning(null), "draft"), null);
  assert.equal(await getPublicInvitation(clientReturning(null), "unknown"), null);
});
