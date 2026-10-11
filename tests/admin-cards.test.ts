import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { adminCardPatchSchema, adminCardsQuerySchema } from "../lib/server/admin-schemas.ts";
import { getTemplate } from "../lib/templates.ts";
import { toAccountInvitation } from "../lib/server/auth.ts";
import { buildCardSearchOr, escapeLikePattern } from "../lib/server/admin-card-search.ts";

// The admin cards slice keeps route handlers thin: validation lives in
// lib/server/admin-schemas.ts (executed below) while row mapping, bound
// search and query budgets live in the route modules, pinned by source
// assertions (same pattern as tests/design-request.test.ts — route modules
// import next/server, which plain node --test cannot resolve).

test("cards query defaults to page 1, 8 per page, no search, all statuses", () => {
  assert.deepEqual(adminCardsQuerySchema.parse({}), { page: 1, perPage: 8, q: "", status: "all" });
});

test("cards query clamps perPage into 1..50 instead of erroring", () => {
  assert.equal(adminCardsQuerySchema.parse({ perPage: "200" }).perPage, 50);
  assert.equal(adminCardsQuerySchema.parse({ perPage: "1000" }).perPage, 50);
  assert.equal(adminCardsQuerySchema.parse({ perPage: "0" }).perPage, 1);
  assert.equal(adminCardsQuerySchema.parse({ perPage: "-5" }).perPage, 1);
  assert.equal(adminCardsQuerySchema.parse({ perPage: "khong-phai-so" }).perPage, 8);
});

test("cards query falls back to page 1 for garbage page values", () => {
  assert.equal(adminCardsQuerySchema.parse({ page: "-3" }).page, 1);
  assert.equal(adminCardsQuerySchema.parse({ page: "abc" }).page, 1);
  assert.equal(adminCardsQuerySchema.parse({ page: "3" }).page, 3);
});

test("cards query accepts the four statuses and rejects unknown ones", () => {
  for (const status of ["all", "published", "draft", "reported"]) {
    assert.equal(adminCardsQuerySchema.parse({ status }).status, status);
  }
  assert.equal(adminCardsQuerySchema.safeParse({ status: "archived" }).success, false);
  assert.equal(adminCardsQuerySchema.parse({ status: "" }).status, "all");
});

test("cards query trims search text and requires 2..80 chars when present", () => {
  assert.equal(adminCardsQuerySchema.parse({ q: "  song hy  " }).q, "song hy");
  assert.equal(adminCardsQuerySchema.parse({ q: "" }).q, "");
  assert.equal(adminCardsQuerySchema.parse({ q: "   " }).q, "");
  assert.equal(adminCardsQuerySchema.safeParse({ q: "a" }).success, false);
  assert.equal(adminCardsQuerySchema.parse({ q: "ab" }).q, "ab");
  assert.equal(adminCardsQuerySchema.safeParse({ q: "x".repeat(81) }).success, false);
  assert.equal(adminCardsQuerySchema.safeParse({ q: "x".repeat(10_000) }).success, false);
});

test("card patch requires at least one field", () => {
  assert.equal(adminCardPatchSchema.safeParse({}).success, false);
  assert.deepEqual(adminCardPatchSchema.parse({ published: true }), { published: true });
  assert.deepEqual(adminCardPatchSchema.parse({ is_flagged: false }), { is_flagged: false });
  assert.deepEqual(adminCardPatchSchema.parse({ published: false, is_flagged: false }), {
    published: false,
    is_flagged: false,
  });
});

test("invitation mapping extracts groom/bride names from content.couple", () => {
  const dto = toAccountInvitation({
    id: "11111111-1111-4111-8111-111111111111",
    slug: "thu-ha-quoc-bao",
    template_id: "song-hy",
    published: true,
    updated_at: "2026-10-01T00:00:00Z",
    content: { couple: { groom: { name: "Quốc Bảo" }, bride: { name: "Thu Hà" } } },
  });
  assert.equal(dto.brideName, "Thu Hà");
  assert.equal(dto.groomName, "Quốc Bảo");
});

test("invitation mapping yields blank names for missing couple content", () => {
  const dto = toAccountInvitation({
    id: "11111111-1111-4111-8111-111111111111",
    slug: "thiep-moi",
    template_id: "song-hy",
    published: false,
    updated_at: "2026-10-01T00:00:00Z",
    content: {},
  });
  assert.equal(dto.brideName, "");
  assert.equal(dto.groomName, "");
  // The admin list joins the two names and falls back to "Thiệp chưa đặt tên"
  // (pinned on the route source below).
});

test("unknown template ids resolve to undefined so the route can fall back to the id", () => {
  assert.equal(getTemplate("song-hy")?.name, "Song Hỷ");
  assert.equal(getTemplate("mau-khong-ton-tai"), undefined);
});

const listSource = readFileSync(new URL("../app/api/admin/cards/route.ts", import.meta.url), "utf8");
const itemSource = readFileSync(new URL("../app/api/admin/cards/[id]/route.ts", import.meta.url), "utf8");

test("cards list requires admin, uses the service role and never caches", () => {
  assert.match(listSource, /await requireAdmin\(client\)/);
  assert.match(listSource, /createAdminClient\(\)/);
  assert.match(listSource, /private, no-store/);
  assert.doesNotMatch(listSource, /createAnonClient/);
});

test("cards list filters status in SQL with reported winning over published", () => {
  assert.match(listSource, /\.eq\("published", true\)\.eq\("is_flagged", false\)/);
  assert.match(listSource, /\.eq\("published", false\)\.eq\("is_flagged", false\)/);
  assert.match(listSource, /\.eq\("is_flagged", true\)/);
  assert.match(listSource, /if \(row\.is_flagged\) return "reported";/);
  assert.match(listSource, /return row\.published \? "published" : "draft";/);
});

test("cards list orders newest first with offset pagination plus a count query", () => {
  assert.match(listSource, /\.order\("updated_at", \{ ascending: false \}\)/);
  assert.match(listSource, /\.range\(offset, offset \+ perPage - 1\)/);
  assert.match(listSource, /count: "exact", head: true/);
});

const searchSource = readFileSync(new URL("../lib/server/admin-card-search.ts", import.meta.url), "utf8");

test("card search escapes LIKE wildcards for both the LIKE and the PostgREST quoted-string layer", () => {
  assert.equal(escapeLikePattern("50%"), "50\\\\%");
  assert.equal(escapeLikePattern("a_b"), "a\\\\_b");
  assert.equal(escapeLikePattern('say "hi"'), 'say \\"hi\\"');
  assert.equal(escapeLikePattern("a\\b"), "a\\\\\\\\b");
  assert.equal(escapeLikePattern("a*b"), "a b", "* is PostgREST's own wildcard alias and cannot be escaped");
});

test("card search also matches the template display name (song hy -> song-hy)", () => {
  const clause = buildCardSearchOr("Song Hỷ");
  assert.match(clause, /^search_norm\.ilike\."\*song hy\*",template_id\.in\.\(.*song-hy.*\)$/);
  assert.equal(buildCardSearchOr("zzzz-no-such-template"), 'search_norm.ilike."*zzzz-no-such-template*"');
  // q cannot break out of the quoted value into another or() clause.
  assert.doesNotMatch(buildCardSearchOr('x",template_id.eq.y'), /,template_id\.eq\./);
});

test("cards list searches accent-insensitively through search_norm", () => {
  assert.match(listSource, /buildCardSearchOr\(q\)/);
  assert.match(searchSource, /search_norm\.ilike\./);
  assert.match(searchSource, /normalizeVi\(q\)/);
  assert.doesNotMatch(listSource, /content::text\.ilike\./);
  assert.match(listSource, /\.or\(searchOr\)/);
  // The validated q is folded with normalizeVi then escaped and bound through
  // the query builder — it is never interpolated into a SQL string.
  assert.doesNotMatch(listSource, /\$\{\s*q\s*\}/);
  assert.doesNotMatch(listSource, /request\.json\(/);
});

test("cards list maps couple fallback, guest owner label and the draft dash", () => {
  assert.match(listSource, /names\.join\(" & "\)/);
  assert.match(listSource, /"Thiệp chưa đặt tên"/);
  assert.match(listSource, /"Khách vãng lai"/);
  assert.match(listSource, /if \(!published\) return "—";/);
  assert.match(listSource, /`\$\{totals\.attending\}\/\$\{totals\.headcount\}`/);
  assert.match(listSource, /getTemplate\(templateId\)\?\.name \?\? templateId/);
});

test("cards list batches owner emails and confirmations instead of N+1 queries", () => {
  assert.match(listSource, /Promise\.all\(\s*ownerIds\.map/);
  assert.match(listSource, /getUserById/);
  assert.match(listSource, /\.in\("invitation_id", ids\)/);
});

test("card rows are labelled so mobile renders them as stacked cards, not a side-scrolling table", () => {
  const cardsClient = readFileSync(new URL("../components/admin/CardsClient.tsx", import.meta.url), "utf8");
  for (const label of ["Chủ tài khoản", "Trạng thái", "Xác nhận"]) {
    assert.match(cardsClient, new RegExp(`<td data-label="${label}"`));
  }
  assert.match(cardsClient, /<td className="adm-cell-actions">/);
  assert.doesNotMatch(cardsClient, /adm-hide-m/);
});

test("card item route guards origin, validates uuid and refines the patch body", () => {
  assert.match(itemSource, /assertSameOrigin\(request\)/);
  assert.match(itemSource, /z\.uuid\(\)/);
  assert.match(itemSource, /parseJson\(request, adminCardPatchSchema\)/);
  assert.match(itemSource, /await requireAdmin\(client\)/);
  assert.match(itemSource, /private, no-store/);
  assert.match(itemSource, /get_response_summary/);
  assert.match(itemSource, /HttpError\(404/);
  assert.match(itemSource, /status: 204/);
  assert.match(itemSource, /"Thiệp chưa đặt tên"/);
  assert.match(itemSource, /"Khách vãng lai"/);
});
