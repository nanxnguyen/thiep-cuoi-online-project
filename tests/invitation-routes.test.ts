import assert from "node:assert/strict";
import test from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultContent } from "../lib/content.ts";
import { createInvitation, toInvitationDto, validateInvitationPatch } from "../lib/server/invitations.ts";
import { HttpError } from "../lib/server/http.ts";

function queuedClient(responses: { body: unknown; status?: number }[], calls: { url: string; init?: RequestInit }[]): SupabaseClient {
  return createClient("http://supabase.test", "service-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, init) => {
        calls.push({ url: String(input), init });
        const response = responses.shift();
        if (!response) throw new Error("Unexpected Supabase request");
        return new Response(JSON.stringify(response.body), {
          status: response.status ?? 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  });
}

test("createInvitation validates content and stores only the key hash", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const client = queuedClient([{ body: { id: "inv-1", slug: "abc12345" }, status: 201 }], calls);
  const content = defaultContent(new Date("2026-09-26T00:00:00Z"));
  const created = await createInvitation(client, "song-hy", content);
  assert.equal(created.id, "inv-1");
  assert.equal(created.slug, "abc12345");
  assert.match(created.key, /^[A-Za-z0-9_-]{43}$/);

  const stored = JSON.parse(String(calls[0].init?.body));
  assert.equal(stored.edit_key_hash.length, 64);
  assert.equal(JSON.stringify(stored).includes(created.key), false);

  await assert.rejects(
    () => createInvitation(client, "song-hy", { nope: true }),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
});

test("createInvitation retries a generated slug collision", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const client = queuedClient([
    { body: { code: "23505", message: "duplicate" }, status: 409 },
    { body: { id: "inv-1", slug: "second123" }, status: 201 },
  ], calls);
  assert.equal((await createInvitation(client, "song-hy", defaultContent())).id, "inv-1");
  assert.equal(calls.length, 2);
});

test("patch validation merges only allowed fields and blocks invalid publishing", () => {
  const current = {
    templateId: "song-hy",
    slug: "minh-an",
    published: false,
    content: defaultContent(new Date("2026-09-26T00:00:00Z")),
  };
  assert.equal(validateInvitationPatch(current, { slug: "minh-an-moi" }).slug, "minh-an-moi");
  assert.throws(() => validateInvitationPatch(current, { slug: "Sai Slug" }), (error: unknown) => error instanceof HttpError && error.status === 400);
  assert.throws(() => validateInvitationPatch(current, { published: true }), (error: unknown) => error instanceof HttpError && error.status === 400);
});

test("invitation rows map to the existing DTO contract", () => {
  const dto = toInvitationDto({
    id: "inv-1", slug: "minh-an", template_id: "song-hy", content: defaultContent(), published: false,
    published_at: null, updated_at: "2026-09-26T00:00:00Z",
  });
  assert.equal(dto.templateId, "song-hy");
  assert.equal(dto.publishedAt, null);
  assert.equal("edit_key_hash" in dto, false);
});
