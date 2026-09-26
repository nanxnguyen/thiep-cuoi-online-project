import assert from "node:assert/strict";
import test from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { defaultContent } from "../lib/content.ts";
import { createInvitation, toInvitationDto, updateInvitation, validateInvitationPatch } from "../lib/server/invitations.ts";
import { hashEditKey } from "../lib/server/edit-key.ts";
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

test("updateInvitation auto-suffixes a taken custom slug instead of failing", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const key = "test-edit-key-0123456789abcdef";
  const row = {
    id: "inv-1", owner_id: null, edit_key_hash: await hashEditKey(key),
    slug: "cu-moi", template_id: "song-hy", content: defaultContent(),
    published: false, published_at: null, updated_at: "2026-09-26T00:00:00Z",
  };
  const client = queuedClient([
    { body: row },
    { body: { code: "23505", message: "duplicate" }, status: 409 },
    { body: { ...row, slug: "placeholder" }, status: 200 },
  ], calls);
  const dto = await updateInvitation(client, "inv-1", { slug: "phan-duy-dong-ho-tran-thi-nhung" }, key);
  const retried = JSON.parse(String(calls[2].init?.body));
  assert.match(retried.slug, /^phan-duy-dong-ho-tran-thi-nhung-[a-z0-9]{4}$/);
  assert.equal(dto.slug, "placeholder"); // mock trả nguyên response, quan trọng là request đã gắn hậu tố
  assert.equal(calls.length, 3);
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
