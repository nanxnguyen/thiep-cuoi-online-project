import { test } from "node:test";
import assert from "node:assert/strict";
import { createApi, ApiError, NETWORK_MESSAGE } from "../lib/api.ts";
import { defaultContent } from "../lib/content.ts";

type Call = { url: string; init: RequestInit };

function fake(status: number, body: unknown) {
  const calls: Call[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });
  }) as unknown as typeof fetch;
  return { calls, api: createApi("http://be", fetchImpl) };
}

test("createInvitation POSTs the template id and starting content as JSON", async () => {
  const { api, calls } = fake(201, { id: "i", slug: "s", key: "k" });
  const content = defaultContent(new Date("2026-09-20T00:00:00Z"));
  assert.deepEqual(await api.createInvitation("gallery-noir", content), { id: "i", slug: "s", key: "k" });
  assert.equal(calls[0].url, "http://be/api/invitations");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.body, JSON.stringify({ templateId: "gallery-noir", content }));
});

test("owner calls send X-Edit-Key", async () => {
  const { api, calls } = fake(200, { id: "i" });
  await api.getInvitation("i", "secret");
  const headers = new Headers(calls[0].init.headers);
  assert.equal(headers.get("x-edit-key"), "secret");
  assert.equal(calls[0].url, "http://be/api/invitations/i");
});

test("getPublicInvitation returns null on 404 and does not cache", async () => {
  const { api, calls } = fake(404, { title: "Not Found" });
  assert.equal(await api.getPublicInvitation("nope"), null);
  assert.equal(calls[0].url, "http://be/api/public/invitations/nope");
  assert.equal(calls[0].init.cache, "no-store");
});

test("errors surface the ProblemDetail text", async () => {
  const { api } = fake(409, { title: "Conflict", detail: "Slug đã được dùng" });
  await assert.rejects(
    api.updateInvitation("i", "k", { slug: "x" }),
    (e: unknown) => e instanceof ApiError && e.status === 409 && e.message === "Slug đã được dùng",
  );
});

test("failures without a ProblemDetail get a Vietnamese message for their status", async () => {
  const { api } = fake(429, { title: "Too Many Requests" });
  await assert.rejects(api.getResponses("i", "k"), (e: unknown) => e instanceof ApiError && e.status === 429 && /thử lại sau/.test(e.message));
  const html = createApi("http://be", (async () => new Response("<html>Bad gateway</html>", { status: 502 })) as unknown as typeof fetch);
  await assert.rejects(html.getResponses("i", "k"), (e: unknown) => e instanceof ApiError && e.status === 502 && /Máy chủ đang bận/.test(e.message));
});

test("a network failure becomes an ApiError(0) with the offline message", async () => {
  const down = createApi("http://be", (async () => {
    throw new TypeError("Failed to fetch");
  }) as unknown as typeof fetch);
  await assert.rejects(down.getInvitation("i", "k"), (e: unknown) => e instanceof ApiError && e.status === 0 && e.message === NETWORK_MESSAGE);
});

test("uploadMedia posts multipart with kind and file", async () => {
  const { api, calls } = fake(201, { url: "https://cdn/x.webp" });
  const out = await api.uploadMedia("i", "k", "image", new Blob(["x"], { type: "image/webp" }), "a.webp");
  assert.equal(out.url, "https://cdn/x.webp");
  const form = calls[0].init.body as FormData;
  assert.equal(form.get("kind"), "image");
  assert.ok(form.get("file") instanceof Blob);
  // fetch must set the multipart boundary itself, so no explicit Content-Type may be sent.
  assert.equal(new Headers(calls[0].init.headers).get("content-type"), null);
});

test("createGuest POSTs the household and sends X-Edit-Key", async () => {
  const { api, calls } = fake(201, { id: "g1", household: "Gia đình chú Ba", token: "tok" });
  await api.createGuest("i", "k", { household: "Gia đình chú Ba" });
  assert.equal(calls[0].url, "http://be/api/invitations/i/guests");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.body, JSON.stringify({ household: "Gia đình chú Ba" }));
  assert.equal(new Headers(calls[0].init.headers).get("x-edit-key"), "k");
});

test("listGuests GETs the collection", async () => {
  const { api, calls } = fake(200, { guests: [] });
  assert.deepEqual(await api.listGuests("i", "k"), { guests: [] });
  assert.equal(calls[0].url, "http://be/api/invitations/i/guests");
});

test("updateGuest PATCHes only the given fields", async () => {
  const { api, calls } = fake(200, { id: "g1" });
  await api.updateGuest("i", "k", "g1", { tableNo: "B1" });
  assert.equal(calls[0].url, "http://be/api/invitations/i/guests/g1");
  assert.equal(calls[0].init.method, "PATCH");
  assert.equal(calls[0].init.body, JSON.stringify({ tableNo: "B1" }));
});

test("deleteGuest sends DELETE with no body", async () => {
  const { api, calls } = fake(204, undefined);
  await api.deleteGuest("i", "k", "g1");
  assert.equal(calls[0].url, "http://be/api/invitations/i/guests/g1");
  assert.equal(calls[0].init.method, "DELETE");
});

test("importGuests POSTs a guests array to /import", async () => {
  const { api, calls } = fake(200, { created: 1, errors: [] });
  const out = await api.importGuests("i", "k", [{ household: "Hộ một" }]);
  assert.deepEqual(out, { created: 1, errors: [] });
  assert.equal(calls[0].url, "http://be/api/invitations/i/guests/import");
  assert.equal(calls[0].init.body, JSON.stringify({ guests: [{ household: "Hộ một" }] }));
});

test("resolveGuestToken returns the household name, and null on an unknown token", async () => {
  const { api, calls } = fake(200, { household: "Gia đình chú Ba" });
  assert.equal(await api.resolveGuestToken("s", "tok"), "Gia đình chú Ba");
  assert.equal(calls[0].url, "http://be/api/public/invitations/s/guests/tok");

  const notFound = fake(404, { title: "Not Found" });
  assert.equal(await notFound.api.resolveGuestToken("s", "sai"), null);
});
