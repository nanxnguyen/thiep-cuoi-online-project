/// <reference lib="deno.ns" />
import { handlePublicWrite, type PublicWriteStore } from "../_shared/public-write.ts";

function assertEquals(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

const secret = "edge-shared-secret";
const fingerprint = "a".repeat(64);
const invitation = {
  id: "inv-1",
  content: { rsvp: { enabled: true, questions: [{ id: "meal" }] }, guestbook: { enabled: true } },
};

function fakeStore() {
  const rows: { action: string; value: Record<string, unknown> }[] = [];
  const limits = new Map<string, number>();
  const existing = new Map<string, Record<string, unknown>>();
  const store: PublicWriteStore = {
    findPublishedInvitation: async (slug) => slug === "published" ? invitation : null,
    consumeRateLimit: async (key, limit) => {
      const count = (limits.get(key) ?? 0) + 1;
      limits.set(key, count);
      return count <= limit;
    },
    findGuestId: async (_invitationId, tokenHash) => tokenHash === "bad" ? null : "guest-1",
    findExisting: async (action, _invitationId, key) => existing.get(`${action}:${key}`) ?? null,
    insertRsvp: async (value) => {
      rows.push({ action: "rsvp", value });
      const saved = { id: `rsvp-${rows.length}` };
      existing.set(`rsvp:${value.request_key}`, saved);
      return saved;
    },
    insertWish: async (value) => {
      rows.push({ action: "wish", value });
      const saved = { id: `wish-${rows.length}`, name: value.name, message: value.message, created_at: "2026-09-26T00:00:00Z" };
      existing.set(`wish:${value.request_key}`, saved);
      return saved;
    },
  };
  return { store, rows, limits };
}

function request(action: "rsvp" | "wish", payload: unknown, key = crypto.randomUUID(), edgeSecret = secret) {
  return new Request("http://edge.test", {
    method: "POST",
    headers: { "content-type": "application/json", "x-edge-secret": edgeSecret, "idempotency-key": key },
    body: JSON.stringify({ action, slug: "published", payload, fingerprint }),
  });
}

const rsvp = { name: "Lan", attending: true, guests: 2, note: "", answers: { meal: "chay", injected: "drop" }, guestLabel: "Nhà Lan", guestToken: "token", website: "" };
const wish = { name: "Lan", message: "Trăm năm hạnh phúc", website: "" };

Deno.test("shared secret and payload are validated before database access", async () => {
  const one = fakeStore();
  assertEquals((await handlePublicWrite(request("wish", wish, crypto.randomUUID(), "wrong"), one.store, { sharedSecret: secret })).status, 401);
  assertEquals((await handlePublicWrite(request("wish", { name: "" }), one.store, { sharedSecret: secret })).status, 400);
  assertEquals(one.rows.length, 0);
});

Deno.test("honeypot is a silent success and unpublished slugs stay private", async () => {
  const one = fakeStore();
  assertEquals((await handlePublicWrite(request("rsvp", { ...rsvp, website: "bot" }), one.store, { sharedSecret: secret })).status, 204);
  assertEquals(one.rows.length, 0);
  const unpublished = new Request("http://edge.test", { method: "POST", headers: { "x-edge-secret": secret, "idempotency-key": crypto.randomUUID() }, body: JSON.stringify({ action: "wish", slug: "draft", payload: wish, fingerprint }) });
  assertEquals((await handlePublicWrite(unpublished, one.store, { sharedSecret: secret })).status, 404);
});

Deno.test("valid RSVP links a hashed guest token and filters unknown answers", async () => {
  const one = fakeStore();
  assertEquals((await handlePublicWrite(request("rsvp", rsvp), one.store, { sharedSecret: secret })).status, 204);
  assertEquals(one.rows[0].value.guest_id, "guest-1");
  assertEquals(one.rows[0].value.answers, { meal: "chay" });
});

Deno.test("valid wishes default to pending moderation and duplicate keys return the original row", async () => {
  const one = fakeStore();
  const key = crypto.randomUUID();
  const first = await handlePublicWrite(request("wish", wish, key), one.store, { sharedSecret: secret });
  const second = await handlePublicWrite(request("wish", wish, key), one.store, { sharedSecret: secret });
  assertEquals(first.status, 201);
  assertEquals(await second.json(), await first.json());
  assertEquals(one.rows.length, 1);
  assertEquals(one.rows[0].value.approved, false);
});

Deno.test("atomic threshold allows exactly five concurrent writes and stores no raw IP", async () => {
  const one = fakeStore();
  const responses = await Promise.all(Array.from({ length: 6 }, () => handlePublicWrite(request("wish", wish), one.store, { sharedSecret: secret, limit: 5 })));
  assertEquals(responses.filter((response) => response.status === 201).length, 5);
  assertEquals(responses.filter((response) => response.status === 429).length, 1);
  assertEquals(one.rows.length, 5);
  assertEquals([...one.limits.keys()].every((key) => key.includes(fingerprint) && !key.includes("127.0.0.1")), true);
});
