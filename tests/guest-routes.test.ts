import assert from "node:assert/strict";
import test from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  createGuest,
  deleteGuest,
  guestToken,
  importGuests,
  listGuests,
  resolveGuestToken,
  updateGuest,
} from "../lib/server/guests.ts";
import { HttpError } from "../lib/server/http.ts";

const secret = "test-secret-at-least-32-characters-long";
const invitation = { id: "11111111-1111-4111-8111-111111111111", slug: "minh-an", owner_id: "user-1", edit_key_hash: "0".repeat(64) };
const row = {
  id: "22222222-2222-4222-8222-222222222222",
  invitation_id: invitation.id,
  household: "Gia đình cô Lan",
  group_name: "Nhà gái",
  table_no: "B2",
  phone: "0900000000",
  expected_pax: 4,
  note: "Ăn chay",
  token_hash: "a".repeat(64),
  created_at: "2026-09-26T01:00:00Z",
  updated_at: "2026-09-26T01:00:00Z",
};

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

test("guest token is stable, URL-safe, and only its hash is inserted", async () => {
  assert.equal(guestToken(row.id, secret), guestToken(row.id, secret));
  assert.notEqual(guestToken(row.id, secret), guestToken("33333333-3333-4333-8333-333333333333", secret));
  assert.match(guestToken(row.id, secret), /^[A-Za-z0-9_-]{43}$/);

  const calls: { url: string; init?: RequestInit }[] = [];
  const dto = await createGuest(queuedClient([{ body: invitation }, { body: row, status: 201 }], calls), invitation.id, {
    household: "  Gia đình cô Lan  ", expectedPax: 4,
  }, undefined, "user-1", secret);
  const stored = JSON.parse(String(calls[1].init?.body));
  assert.equal(stored.household, "Gia đình cô Lan");
  assert.match(stored.token_hash, /^[0-9a-f]{64}$/);
  assert.equal(JSON.stringify(stored).includes(dto.token), false);
  assert.equal(dto.link, `/invite/${invitation.slug}?g=${dto.token}`);
});

test("guest list maps the newest RSVP for each guest", async () => {
  const rsvps = [
    { guest_id: row.id, attending: false, guests: 0, created_at: "2026-09-26T03:00:00Z" },
    { guest_id: row.id, attending: true, guests: 4, created_at: "2026-09-26T02:00:00Z" },
  ];
  const result = await listGuests(queuedClient([{ body: invitation }, { body: [row] }, { body: rsvps }]), invitation.id, undefined, "user-1", secret);
  assert.equal(result.guests[0].rsvpStatus, "declined");
  assert.equal(result.guests[0].confirmedPax, null);
});

test("guest validation enforces household and 1–100 expected pax", async () => {
  for (const input of [{ household: "" }, { household: "Lan", expectedPax: 0 }, { household: "Lan", expectedPax: 101 }]) {
    await assert.rejects(
      () => createGuest(queuedClient([{ body: invitation }]), invitation.id, input, undefined, "user-1", secret),
      (error: unknown) => error instanceof HttpError && error.status === 400,
    );
  }
});

test("update and delete constrain guest IDs to the invitation", async () => {
  await assert.rejects(
    () => updateGuest(queuedClient([{ body: invitation }, { body: null }]), invitation.id, row.id, { note: "Mới" }, undefined, "user-1", secret),
    (error: unknown) => error instanceof HttpError && error.status === 404,
  );
  await deleteGuest(queuedClient([{ body: invitation }, { body: { id: row.id } }]), invitation.id, row.id, undefined, "user-1");
});

test("import inserts valid rows once and reports invalid row indexes", async () => {
  const calls: { url: string; init?: RequestInit }[] = [];
  const result = await importGuests(queuedClient([{ body: invitation }, { body: [row], status: 201 }], calls), invitation.id, [
    { household: "Hộ một", expectedPax: 2 },
    { household: "", expectedPax: 2 },
    { household: "Hộ ba", expectedPax: 101 },
  ], undefined, "user-1", secret);
  assert.deepEqual(result, { created: 1, errors: [{ index: 1, message: "Tên hộ/nhóm không được để trống." }, { index: 2, message: "Số khách dự kiến phải từ 1 đến 100." }] });
  assert.equal(Array.isArray(JSON.parse(String(calls[1].init?.body))), true);

  await assert.rejects(
    () => importGuests(queuedClient([]), invitation.id, Array.from({ length: 1001 }, () => ({ household: "Hộ" })), undefined, "user-1", secret),
    (error: unknown) => error instanceof HttpError && error.status === 413,
  );
});

test("public token resolution only returns a household for a published invitation", async () => {
  const token = guestToken(row.id, secret);
  assert.deepEqual(await resolveGuestToken(queuedClient([{ body: { id: invitation.id } }, { body: { household: row.household } }]), invitation.slug, token), { household: row.household });
  assert.equal(await resolveGuestToken(queuedClient([{ body: null }]), invitation.slug, token), null);
  assert.equal(await resolveGuestToken(queuedClient([{ body: { id: invitation.id } }, { body: null }]), invitation.slug, token), null);
});
