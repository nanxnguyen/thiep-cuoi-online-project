import assert from "node:assert/strict";
import test from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  ADMIN_STATS_WEEKS,
  adminCoupleLabel,
  bucketWeekly,
  emptyAdminStats,
  getAdminStats,
  resolveTemplateName,
} from "../lib/server/admin-stats.ts";

test("empty envelope: zeros, 8-point series and empty lists", () => {
  const stats = emptyAdminStats();
  assert.deepEqual(stats.users, { total: 0, active: 0, suspended: 0 });
  assert.deepEqual(stats.cards, { total: 0, published: 0, draft: 0, flagged: 0 });
  assert.equal(stats.pendingWishes, 0);
  assert.equal(stats.usersWeekly.length, ADMIN_STATS_WEEKS);
  assert.equal(stats.cardsWeekly.length, ADMIN_STATS_WEEKS);
  assert.ok(stats.usersWeekly.every((v) => v === 0));
  assert.ok(stats.cardsWeekly.every((v) => v === 0));
  assert.deepEqual(stats.topTemplates, []);
  assert.deepEqual(stats.recentUsers, []);
  assert.deepEqual(stats.recentCards, []);
});

test("bucketWeekly always returns 8 Monday-start points", () => {
  // Wednesday 2026-10-07: current week starts Mon 2026-10-05.
  const now = new Date("2026-10-07T12:00:00Z");
  assert.deepEqual(bucketWeekly([], now), [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(
    bucketWeekly(
      [
        "2026-10-06T00:00:00Z", // this week
        "2026-10-06T23:00:00Z", // this week
        "2026-09-29T10:00:00Z", // previous week
        "2026-08-01T10:00:00Z", // older than 8 weeks: dropped
        "not-a-date",
      ],
      now,
    ),
    [0, 0, 0, 0, 0, 0, 1, 2],
  );
});

test("couple label falls back when content has no names", () => {
  assert.equal(adminCoupleLabel("Thu Hà", "Quốc Bảo"), "Thu Hà & Quốc Bảo");
  assert.equal(adminCoupleLabel("", ""), "Thiệp chưa đặt tên");
});

test("template names resolve from the code catalog", () => {
  assert.equal(resolveTemplateName("song-hy"), "Song Hỷ");
  assert.equal(resolveTemplateName("no-such-template"), "no-such-template");
});

// --- getAdminStats with a stubbed Supabase wire (PostgREST + GoTrue) ---

const NOW = new Date("2026-10-07T12:00:00Z");

function stubClient(handlers: {
  scan: unknown[];
  recent: unknown[];
  users: unknown[];
  counts: { total: number; published: number; flagged: number; wishes: number };
}): { client: SupabaseClient; calls: string[] } {
  const calls: string[] = [];
  const head = (n: number) =>
    new Response(null, { status: 200, headers: { "content-range": `*/${n}` } });
  const json = (body: unknown) =>
    new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
  const client = createClient("http://supabase.test", "service-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, init) => {
        const url = new URL(String(input));
        const method = String(init?.method ?? "GET").toUpperCase();
        calls.push(`${method} ${url.pathname}${url.search}`);
        if (url.pathname.endsWith("/rest/v1/invitations") && method === "HEAD") {
          if (url.searchParams.get("published") === "eq.true") return head(handlers.counts.published);
          if (url.searchParams.get("is_flagged") === "eq.true") return head(handlers.counts.flagged);
          return head(handlers.counts.total);
        }
        if (url.pathname.endsWith("/rest/v1/wishes") && method === "HEAD") return head(handlers.counts.wishes);
        if (url.pathname.endsWith("/rest/v1/invitations")) {
          const select = url.searchParams.get("select") ?? "";
          return json(select.includes("content") ? handlers.recent : handlers.scan);
        }
        if (url.pathname.endsWith("/auth/v1/admin/users")) {
          return json({ users: url.searchParams.get("page") === "1" ? handlers.users : [] });
        }
        throw new Error(`Unexpected Supabase request: ${method} ${url}`);
      },
    },
  });
  return { client, calls };
}

const SCAN = [
  { template_id: "song-hy", created_at: "2026-10-06T08:00:00Z" },
  { template_id: "song-hy", created_at: "2026-10-05T08:00:00Z" },
  { template_id: "net-muc", created_at: "2026-09-30T08:00:00Z" },
  { template_id: "mystery-id", created_at: "2026-09-20T08:00:00Z" },
];

const RECENT = [
  {
    id: "inv-1",
    slug: "thu-ha-quoc-bao",
    template_id: "song-hy",
    published: true,
    is_flagged: false,
    updated_at: "2026-10-06T09:00:00Z",
    content: { couple: { groom: { name: "Quốc Bảo" }, bride: { name: "Thu Hà" } } },
  },
  {
    id: "inv-2",
    slug: "no-name-yet",
    template_id: "net-muc",
    published: false,
    is_flagged: true,
    updated_at: "2026-10-05T09:00:00Z",
    content: {},
  },
];

const USERS = [
  {
    id: "u-new",
    email: "new@example.com",
    created_at: "2026-10-06T07:00:00Z",
    banned_until: null,
    user_metadata: { full_name: "Người Mới" },
  },
  {
    id: "u-old",
    email: "old@example.com",
    created_at: "2026-09-01T07:00:00Z",
    banned_until: "3026-01-01T00:00:00Z",
    user_metadata: {},
  },
];

test("getAdminStats maps counts, series, top templates and recents", async () => {
  const { client } = stubClient({
    scan: SCAN,
    recent: RECENT,
    users: USERS,
    counts: { total: 5, published: 3, flagged: 1, wishes: 2 },
  });
  const stats = await getAdminStats(client, NOW);

  assert.deepEqual(stats.cards, { total: 5, published: 3, draft: 2, flagged: 1 });
  assert.equal(stats.pendingWishes, 2);
  assert.deepEqual(stats.users, { total: 2, active: 1, suspended: 1 });

  assert.equal(stats.usersWeekly.length, 8);
  assert.equal(stats.cardsWeekly.length, 8);
  assert.equal(stats.usersWeekly[7], 1);
  assert.equal(stats.cardsWeekly[7], 2);
  assert.equal(
    stats.cardsWeekly.reduce((a, b) => a + b, 0),
    SCAN.length,
  );

  assert.deepEqual(stats.topTemplates, [
    { templateId: "song-hy", name: "Song Hỷ", count: 2 },
    { templateId: "mystery-id", name: "mystery-id", count: 1 },
    { templateId: "net-muc", name: "Nét Mực", count: 1 },
  ]);

  assert.deepEqual(stats.recentUsers, [
    { id: "u-new", email: "new@example.com", name: "Người Mới", createdAt: "2026-10-06T07:00:00Z" },
    { id: "u-old", email: "old@example.com", name: "old", createdAt: "2026-09-01T07:00:00Z" },
  ]);

  assert.deepEqual(stats.recentCards, [
    {
      id: "inv-1",
      slug: "thu-ha-quoc-bao",
      couple: "Thu Hà & Quốc Bảo",
      templateId: "song-hy",
      status: "published",
      confirmed: "—",
      createdAt: "2026-10-06T09:00:00Z",
    },
    {
      id: "inv-2",
      slug: "no-name-yet",
      couple: "Thiệp chưa đặt tên",
      templateId: "net-muc",
      status: "reported",
      confirmed: "—",
      createdAt: "2026-10-05T09:00:00Z",
    },
  ]);
});

test("getAdminStats on an empty DB returns the empty envelope", async () => {
  const { client, calls } = stubClient({
    scan: [],
    recent: [],
    users: [],
    counts: { total: 0, published: 0, flagged: 0, wishes: 0 },
  });
  const stats = await getAdminStats(client, NOW);
  assert.deepEqual(stats, emptyAdminStats());
  // Budget: 3 counts + scan + wishes + recents = 6 DB round trips, then Auth.
  const dbCalls = calls.filter((c) => c.includes("/rest/v1/"));
  assert.equal(dbCalls.length, 6);
  assert.ok(calls.some((c) => c.includes("/auth/v1/admin/users")));
});

test("getAdminStats surfaces DB failures instead of partial stats", async () => {
  const head = (n: number) =>
    new Response(null, { status: 200, headers: { "content-range": `*/${n}` } });
  const broken = createClient("http://supabase.test", "service-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, init) => {
        const url = new URL(String(input));
        const method = String(init?.method ?? "GET").toUpperCase();
        if (method === "HEAD") return head(1);
        return new Response(JSON.stringify({ message: "boom" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      },
    },
  });
  await assert.rejects(() => getAdminStats(broken, NOW), /thống kê thiệp theo tuần/);
});
