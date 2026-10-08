import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../lib/server/http.ts";
import {
  ADMIN_BADGES,
  ADMIN_STYLES,
  adminTemplatePatchSchema,
  adminTemplatesQuerySchema,
} from "../lib/server/admin-schemas.ts";
import {
  listAdminTemplates,
  patchAdminTemplate,
  toAdminTemplateRow,
} from "../lib/server/admin-templates.ts";
import {
  TEMPLATE_STYLES,
  badgeLabel,
  nextBadge,
  templateStripColors,
} from "../components/admin/templatePalette.ts";
import { colors } from "../lib/templates.ts";

// --- validation: enums (style/badge lạ → 400 ở route qua safeParse fail) ---

test("templates query schema accepts a full valid filter set", () => {
  const parsed = adminTemplatesQuerySchema.safeParse({ page: "2", perPage: "12", q: "Song Hỷ", style: "Truyền thống" });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.deepEqual(parsed.data, { page: 2, perPage: 12, q: "Song Hỷ", style: "Truyền thống" });
  }
});

test("templates query schema falls back to all/defaults when filters are missing", () => {
  const parsed = adminTemplatesQuerySchema.safeParse({});
  assert.equal(parsed.success, true);
  if (parsed.success) assert.deepEqual(parsed.data, { page: 1, perPage: 8, q: "", style: "all" });
});

test("templates query schema rejects an unknown style", () => {
  assert.equal(adminTemplatesQuerySchema.safeParse({ style: "Baroque" }).success, false);
  assert.equal(adminTemplatesQuerySchema.safeParse({ style: "" }).success, true); // blank → all
});

test("templates query schema rejects a 1-char search but allows empty", () => {
  assert.equal(adminTemplatesQuerySchema.safeParse({ q: "a" }).success, false);
  assert.equal(adminTemplatesQuerySchema.safeParse({ q: "  " }).success, true);
});

test("templates query schema clamps perPage instead of erroring", () => {
  const huge = adminTemplatesQuerySchema.safeParse({ perPage: "999" });
  assert.equal(huge.success, true);
  if (huge.success) assert.equal(huge.data.perPage, 50);
  const negative = adminTemplatesQuerySchema.safeParse({ perPage: "-5" });
  assert.equal(negative.success, true);
  if (negative.success) assert.equal(negative.data.perPage, 1);
});

test("template patch schema accepts single-field patches and rejects empty/unknown enums", () => {
  assert.deepEqual(adminTemplatePatchSchema.safeParse({ hidden: true }).success, true);
  assert.deepEqual(adminTemplatePatchSchema.safeParse({ badge: "HOT" }).success, true);
  assert.deepEqual(adminTemplatePatchSchema.safeParse({}).success, false);
  assert.deepEqual(adminTemplatePatchSchema.safeParse({ style: "Baroque" }).success, false);
  assert.deepEqual(adminTemplatePatchSchema.safeParse({ badge: "NEW" }).success, false);
  assert.deepEqual(adminTemplatePatchSchema.safeParse({ name: "  " }).success, false);
  assert.deepEqual(
    adminTemplatePatchSchema.safeParse({ name: "Song Hỷ Mới", style: "Truyền thống", badge: "", hidden: false }).success,
    true,
  );
});

test("client style list mirrors the server ADMIN_STYLES contract", () => {
  assert.deepEqual([...TEMPLATE_STYLES], [...ADMIN_STYLES]);
  assert.deepEqual([...ADMIN_BADGES], ["", "MỚI", "HOT"]);
});

// --- service: query trong SQL, 404 id lạ ---

type ChainCall = { method: string; args: unknown[] };

function mockAdminClient(terminals: { range?: unknown; maybeSingle?: unknown; single?: unknown }) {
  const calls: ChainCall[] = [];
  const chain = {
    select: (...args: unknown[]) => { calls.push({ method: "select", args }); return chain; },
    eq: (...args: unknown[]) => { calls.push({ method: "eq", args }); return chain; },
    ilike: (...args: unknown[]) => { calls.push({ method: "ilike", args }); return chain; },
    order: (...args: unknown[]) => { calls.push({ method: "order", args }); return chain; },
    update: (...args: unknown[]) => { calls.push({ method: "update", args }); return chain; },
    range: (...args: unknown[]) => { calls.push({ method: "range", args }); return Promise.resolve(terminals.range); },
    maybeSingle: (...args: unknown[]) => {
      calls.push({ method: "maybeSingle", args });
      return Promise.resolve(terminals.maybeSingle);
    },
    single: (...args: unknown[]) => {
      calls.push({ method: "single", args });
      return Promise.resolve(terminals.single);
    },
  };
  return { client: { from: () => chain } as unknown as SupabaseClient, calls };
}

const ROW = { id: "song-hy", name: "Song Hỷ", style: "Truyền thống", badge: "HOT", hidden: false, pop: 98 };

test("listAdminTemplates filters style + search in SQL and orders pop desc, id", async () => {
  const { client, calls } = mockAdminClient({ range: { data: [ROW], error: null, count: 1 } });
  const result = await listAdminTemplates(client, { page: 1, perPage: 12, q: "Song", style: "Truyền thống" });
  assert.deepEqual(result, { items: [ROW], page: 1, pageCount: 1, total: 1 });
  assert.ok(calls.some((c) => c.method === "eq" && c.args[0] === "style" && c.args[1] === "Truyền thống"), "style filter in SQL");
  assert.ok(calls.some((c) => c.method === "ilike" && c.args[0] === "name"), "name search in SQL");
  const orders = calls.filter((c) => c.method === "order");
  assert.deepEqual(orders.map((c) => c.args[0]), ["pop", "id"]);
  assert.deepEqual(calls.find((c) => c.method === "range")?.args, [0, 11]);
});

test("listAdminTemplates escapes LIKE wildcards in q", async () => {
  const { client, calls } = mockAdminClient({ range: { data: [], error: null, count: 0 } });
  await listAdminTemplates(client, { page: 2, perPage: 8, q: "100%_x", style: "all" });
  const ilike = calls.find((c) => c.method === "ilike");
  assert.equal(ilike?.args[1], "%100\\%\\_x%");
  assert.ok(!calls.some((c) => c.method === "eq" && c.args[0] === "style"), "style=all adds no filter");
  assert.deepEqual(calls.find((c) => c.method === "range")?.args, [8, 15]);
});

test("listAdminTemplates maps DB errors to 500 and computes pageCount", async () => {
  const { client } = mockAdminClient({ range: { data: null, error: { message: "db down" }, count: null } });
  await assert.rejects(
    () => listAdminTemplates(client, { page: 1, perPage: 8, q: "", style: "all" }),
    (error: unknown) => error instanceof HttpError && error.status === 500,
  );
  const ok = mockAdminClient({ range: { data: [], error: null, count: 50 } });
  const result = await listAdminTemplates(ok.client, { page: 1, perPage: 12, q: "", style: "all" });
  assert.equal(result.pageCount, 5);
});

test("patchAdminTemplate rejects overlong ids with 400 and unknown ids with 404", async () => {
  const { client } = mockAdminClient({});
  await assert.rejects(
    () => patchAdminTemplate(client, "", { hidden: true }),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
  await assert.rejects(
    () => patchAdminTemplate(client, "x".repeat(81), { hidden: true }),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
  const missing = mockAdminClient({ maybeSingle: { data: null, error: null } });
  await assert.rejects(
    () => patchAdminTemplate(missing.client, "id-la-xyz", { hidden: true }),
    (error: unknown) => error instanceof HttpError && error.status === 404,
  );
});

test("patchAdminTemplate persists the patch and returns the mapped row", async () => {
  const updated = { ...ROW, hidden: true };
  const { client, calls } = mockAdminClient({
    maybeSingle: { data: { id: "song-hy" }, error: null },
    single: { data: updated, error: null },
  });
  assert.deepEqual(await patchAdminTemplate(client, "song-hy", { hidden: true }), updated);
  const update = calls.find((c) => c.method === "update");
  assert.deepEqual(update?.args[0], { hidden: true });
});

test("toAdminTemplateRow normalizes unexpected badge values", () => {
  assert.equal(toAdminTemplateRow({ ...ROW, badge: "NEW" }).badge, "");
});

// --- mapping màu: resolve từ code theo id, fallback khi id lạ ---

test("templateStripColors resolves the 3-colour strip from the code catalog", () => {
  assert.deepEqual(templateStripColors("song-hy"), [colors.do.deep, colors.do.paper, colors.do.gold]);
  assert.deepEqual(templateStripColors("bia-bao"), [colors.muc.deep, colors.muc.paper, colors.muc.gold]);
});

test("templateStripColors falls back to neutral tokens for unknown ids", () => {
  const strip = templateStripColors("id-la-khong-co-trong-code");
  assert.equal(strip.length, 3);
  assert.ok(strip.every((c) => c.startsWith("var(--")), `fallback must use theme tokens, got ${strip}`);
  assert.ok(!strip.some((c) => /#[0-9a-fA-F]{3,6}\b/.test(c)), "fallback must not hardcode hex");
});

test("badge cycles Thường → MỚI → HOT → Thường", () => {
  assert.equal(nextBadge(""), "MỚI");
  assert.equal(nextBadge("MỚI"), "HOT");
  assert.equal(nextBadge("HOT"), "");
  assert.equal(badgeLabel(""), "Thường");
  assert.equal(badgeLabel("HOT"), "HOT");
});
