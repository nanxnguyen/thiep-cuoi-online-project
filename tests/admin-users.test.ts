import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { adminUserPatchSchema, adminUsersQuerySchema } from "../lib/server/admin-schemas.ts";

const listRoute = readFileSync(new URL("../app/api/admin/users/route.ts", import.meta.url), "utf8");
const idRoute = readFileSync(new URL("../app/api/admin/users/[id]/route.ts", import.meta.url), "utf8");
const clientSource = readFileSync(new URL("../components/admin/UsersClient.tsx", import.meta.url), "utf8");

// --- query schema: pagination defaults + perPage clamp (§8.6) ---

test("users query falls back to page 1, perPage 8, no search, all statuses", () => {
  assert.deepEqual(adminUsersQuerySchema.parse({}), { page: 1, perPage: 8, q: "", status: "all" });
});

test("users query clamps perPage into 1..50 instead of erroring", () => {
  assert.equal(adminUsersQuerySchema.parse({ perPage: "200" }).perPage, 50);
  assert.equal(adminUsersQuerySchema.parse({ perPage: "-5" }).perPage, 1);
  assert.equal(adminUsersQuerySchema.parse({ perPage: "abc" }).perPage, 8);
  assert.equal(adminUsersQuerySchema.parse({ perPage: "12.9" }).perPage, 12);
});

test("users query falls back to page 1 for garbage page values", () => {
  assert.equal(adminUsersQuerySchema.parse({ page: "-3" }).page, 1);
  assert.equal(adminUsersQuerySchema.parse({ page: "999999" }).page, 999999);
  assert.equal(adminUsersQuerySchema.parse({ page: "abc" }).page, 1);
});

test("users query rejects unknown status and short/long search terms", () => {
  assert.equal(adminUsersQuerySchema.safeParse({ status: "banned" }).success, false);
  assert.equal(adminUsersQuerySchema.safeParse({ q: "a" }).success, false);
  assert.equal(adminUsersQuerySchema.safeParse({ q: "x".repeat(81) }).success, false);
  assert.equal(adminUsersQuerySchema.safeParse({ q: "x".repeat(10_240) }).success, false);
  const ok = adminUsersQuerySchema.parse({ q: "  thuha  ", status: "suspended", page: "2", perPage: "6" });
  assert.deepEqual(ok, { q: "thuha", status: "suspended", page: 2, perPage: 6 });
});

// --- patch schema: ban/unban only ---

test("user patch accepts ban/unban and rejects anything else", () => {
  assert.deepEqual(adminUserPatchSchema.parse({ action: "ban" }), { action: "ban" });
  assert.deepEqual(adminUserPatchSchema.parse({ action: "unban" }), { action: "unban" });
  assert.equal(adminUserPatchSchema.safeParse({}).success, false);
  assert.equal(adminUserPatchSchema.safeParse({ action: "delete" }).success, false);
  assert.equal(adminUserPatchSchema.safeParse(null).success, false);
});

// --- source guards: DTO mapping, self-action block, strip sensitive fields ---

test("list route maps banned users to suspended with a metadata name fallback", () => {
  assert.match(listRoute, /banned_until\s*!=\s*null\s*\?\s*"suspended"\s*:\s*"active"/);
  assert.match(listRoute, /full_name/);
  assert.match(listRoute, /split\("@"\)/);
});

test("user rows are labelled so mobile renders them as stacked cards, not a side-scrolling table", () => {
  for (const label of ["Ngày tham gia", "Số thiệp", "Trạng thái"]) {
    assert.match(clientSource, new RegExp(`<td data-label="${label}"`));
  }
  assert.match(clientSource, /<td className="adm-cell-actions">/);
  assert.doesNotMatch(clientSource, /adm-hide-m/);
});

test("the admin's own row cannot be banned or deleted from the UI", () => {
  assert.match(clientSource, /disabled=\{mutating === row\.id \|\| row\.isSelf\}/);
  assert.match(listRoute, /isSelf: true/);
});

test("list route searches accent-insensitively on both sides", () => {
  assert.match(listRoute, /normalizeVi\(q\)/);
  assert.match(listRoute, /normalizeVi\(user\.email/);
  assert.match(listRoute, /normalizeVi\(adminDisplayName\(user\)\)/);
});

test("list route never leaks auth metadata and disables caching", () => {
  assert.doesNotMatch(listRoute, /app_metadata/);
  assert.doesNotMatch(listRoute, /\.\.\.[^\n]*metadata/i, "auth metadata must not be spread into the DTO");
  assert.match(listRoute, /"876000h"/, "ban duration constant lives with the list route");
  assert.match(listRoute, /Cache-Control/);
  assert.match(listRoute, /private, no-store/);
});

test("list route caps the auth walk at 10 pages of 100", () => {
  assert.match(listRoute, /AUTH_MAX_PAGES\s*=\s*10/);
  assert.match(listRoute, /perPage:\s*AUTH_PAGE_SIZE/);
});

test("item route validates uuid ids and blocks self ban/delete", () => {
  assert.match(idRoute, /z\.uuid\(\)/);
  assert.match(idRoute, /id === adminUser\.id/);
  assert.match(idRoute, /tự khoá|tự xoá/);
  assert.match(idRoute, /assertSameOrigin/);
});

test("item route uses the 100-year ban convention and a 204 delete", () => {
  assert.match(idRoute, /ADMIN_BAN_DURATION, mapAuthUserToRow \} from "\.\.\/route"/);
  assert.match(
    idRoute,
    /ban_duration: input\.action === "ban" \? ADMIN_BAN_DURATION : "none"/,
  );
  assert.match(idRoute, /\.auth\.admin\.deleteUser\(id\)/);
  assert.match(idRoute, /status:\s*204/);
  assert.doesNotMatch(idRoute, /app_metadata/);
});
