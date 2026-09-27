import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteInvitation } from "../lib/server/invitations.ts";
import { HttpError } from "../lib/server/http.ts";

function fakeClient(ownerId: string | null, removed: string[]) {
  const invitationRead = { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: ownerId === null ? null : { id: "inv-1", owner_id: ownerId }, error: null }) }) }) };
  const invitationDelete = { delete: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }) };
  return {
    from: (table: string) => table === "invitations" ? { ...invitationRead, ...invitationDelete } : {},
    storage: { from: () => ({ list: async () => ({ data: [{ name: "photo.jpg" }], error: null }), remove: async (paths: string[]) => { removed.push(...paths); return { error: null }; } }) },
  } as unknown as SupabaseClient;
}

test("owner deletion removes the invitation media prefix", async () => {
  const removed: string[] = [];
  await deleteInvitation(fakeClient("user-1", removed), "inv-1", "user-1");
  assert.deepEqual(removed, ["inv-1/photo.jpg"]);
});

test("another user cannot delete an invitation", async () => {
  await assert.rejects(() => deleteInvitation(fakeClient("owner", []), "inv-1", "other"), (error: unknown) => error instanceof HttpError && error.status === 403);
});

test("missing invitation returns 404", async () => {
  await assert.rejects(() => deleteInvitation(fakeClient(null, []), "inv-1", "user-1"), (error: unknown) => error instanceof HttpError && error.status === 404);
});
