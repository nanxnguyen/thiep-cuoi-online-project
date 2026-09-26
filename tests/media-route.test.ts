import assert from "node:assert/strict";
import test from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertUploadRequestSize, detectMedia, IMAGE_MAX_BYTES, UPLOAD_REQUEST_MAX_BYTES, uploadMedia } from "../lib/server/media.ts";
import { HttpError } from "../lib/server/http.ts";

const id = "11111111-1111-4111-8111-111111111111";
const invitation = { id, owner_id: "user-1", edit_key_hash: "0".repeat(64) };

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

test("media detection trusts bytes, not browser MIME or filename", () => {
  assert.deepEqual(detectMedia("image", new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), { contentType: "image/png", extension: "png" });
  assert.deepEqual(detectMedia("image", new Uint8Array([0xff, 0xd8, 0xff])), { contentType: "image/jpeg", extension: "jpg" });
  assert.deepEqual(detectMedia("image", new TextEncoder().encode("RIFFxxxxWEBP")), { contentType: "image/webp", extension: "webp" });
  assert.deepEqual(detectMedia("audio", new TextEncoder().encode("ID3music")), { contentType: "audio/mpeg", extension: "mp3" });
  assert.throws(() => detectMedia("image", new Uint8Array()), (error: unknown) => error instanceof HttpError && error.status === 400);
  assert.throws(() => detectMedia("audio", new TextEncoder().encode("fake")), (error: unknown) => error instanceof HttpError && error.status === 415);
  const maxImage = new Uint8Array(IMAGE_MAX_BYTES);
  maxImage.set([0xff, 0xd8, 0xff]);
  assert.deepEqual(detectMedia("image", maxImage), { contentType: "image/jpeg", extension: "jpg" });
  assert.throws(() => detectMedia("image", new Uint8Array(IMAGE_MAX_BYTES + 1)), (error: unknown) => error instanceof HttpError && error.status === 413);
});

test("upload request size is bounded before multipart parsing", () => {
  assert.doesNotThrow(() => assertUploadRequestSize(new Request("http://localhost", { headers: { "content-length": String(UPLOAD_REQUEST_MAX_BYTES) } })));
  assert.throws(() => assertUploadRequestSize(new Request("http://localhost", { headers: { "content-length": String(UPLOAD_REQUEST_MAX_BYTES + 1) } })), (error: unknown) => error instanceof HttpError && error.status === 413);
  assert.throws(() => assertUploadRequestSize(new Request("http://localhost")), (error: unknown) => error instanceof HttpError && error.status === 413);
});

test("authorized upload uses an invitation-scoped random path and detected content type", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const client = queuedClient([{ body: invitation }, { body: true }, { body: { Key: "ok" } }], calls);
  const result = await uploadMedia(client, id, "image", new File([new Uint8Array([0xff, 0xd8, 0xff])], "lying.exe", { type: "application/x-msdownload" }), undefined, "user-1");
  assert.match(result.url, new RegExp(`/storage/v1/object/public/media/${id}/[0-9a-f-]{36}\\.jpg$`));
  assert.match(calls[2].url, new RegExp(`/storage/v1/object/media/${id}/[0-9a-f-]{36}\\.jpg$`));
  assert.equal(new Headers(calls[2].init?.headers).get("content-type"), "image/jpeg");
  assert.equal(new Headers(calls[2].init?.headers).get("x-upsert"), "false");
});

test("authorization happens before upload and Storage failures are contract-safe", async () => {
  await assert.rejects(
    () => uploadMedia(queuedClient([{ body: invitation }]), id, "audio", new Blob(["ID3"]), "wrong-key"),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
  await assert.rejects(
    () => uploadMedia(queuedClient([{ body: invitation }, { body: true }, { body: { message: "internal detail" }, status: 500 }]), id, "audio", new Blob(["ID3"]), undefined, "user-1"),
    (error: unknown) => error instanceof HttpError && error.status === 502 && !error.message.includes("internal detail"),
  );
});
