import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "../lib/server/http.ts";
import { requireAdmin } from "../lib/server/auth.ts";
import { adminLoginSchema } from "../lib/server/admin-schemas.ts";
import { templateSamples, templates } from "../lib/templates.ts";

function clientWithGetUser(user: unknown, error: { message: string; status?: number } | null = null) {
  return {
    auth: { getUser: async () => ({ data: { user }, error }) },
  } as unknown as SupabaseClient;
}

const adminUser = {
  id: "admin-1",
  email: "admin@example.com",
  app_metadata: { is_admin: true },
  user_metadata: { full_name: "Quan Tri Vien" },
};

test("requireAdmin rejects a missing session with 401", async () => {
  const client = clientWithGetUser(null, { message: "expired", status: 401 });
  await assert.rejects(
    () => requireAdmin(client),
    (error: unknown) => error instanceof HttpError && error.status === 401,
  );
});

test("requireAdmin rejects a non-admin user with 403", async () => {
  const client = clientWithGetUser({ id: "user-1", email: "user@example.com", app_metadata: {}, user_metadata: {} });
  await assert.rejects(
    () => requireAdmin(client),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
});

test("requireAdmin ignores user_metadata when checking the admin flag", async () => {
  // user_metadata is user-editable, so is_admin there must NOT grant access.
  const spoofed = clientWithGetUser({
    id: "user-2",
    email: "spoof@example.com",
    app_metadata: {},
    user_metadata: { is_admin: true },
  });
  await assert.rejects(
    () => requireAdmin(spoofed),
    (error: unknown) => error instanceof HttpError && error.status === 403,
  );
});

test("requireAdmin returns the admin DTO for app_metadata.is_admin === true", async () => {
  const client = clientWithGetUser(adminUser);
  assert.deepEqual(await requireAdmin(client), {
    id: "admin-1",
    email: "admin@example.com",
    name: "Quan Tri Vien",
    isAdmin: true,
  });
});

test("admin login schema accepts valid input and rejects shape violations", () => {
  assert.equal(
    adminLoginSchema.safeParse({ email: "admin@moc.vn", password: "admin" }).success,
    true,
  );
  const bad = [
    { email: "not-an-email", password: "secret123" },
    { email: "admin@moc.vn", password: "" },
    { email: "admin@moc.vn", password: "x".repeat(129) },
    { email: `${"a".repeat(250)}@moc.vn`, password: "secret123" },
    { email: "admin@moc.vn" },
    { password: "secret123" },
    {},
    null,
  ];
  for (const body of bad) {
    assert.equal(adminLoginSchema.safeParse(body).success, false, JSON.stringify(body));
  }
});

// ---- Task 4 (auth slice): source guards for the 3 endpoints + 2 pages ----
// Route handlers import next/server + the @/* alias, which plain node --test
// cannot resolve, so the endpoint matrix is asserted textually (same pattern
// as the Header wiring test in tests/auth-routes.test.ts). The 401/403
// behaviour itself comes from requireAdmin, covered by unit tests above.
function readSource(rel: string): string {
  return readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
}

test("admin login route rate-limits by IP, signs out non-admins, uses one generic error", () => {
  const src = readSource("app/api/admin/login/route.ts");
  assert.match(src, /parseJson\(request, adminLoginSchema\)/);
  assert.match(src, /enforceRateLimit\(/);
  assert.match(src, /admin-login:/);
  assert.match(src, /x-forwarded-for/);
  assert.match(src, /"unknown"/);
  assert.match(src, /signInWithPassword/);
  assert.match(src, /signOut\(\)/);
  // One generic message for wrong password / unknown email / non-admin (anti-enumeration).
  assert.match(src, /Email hoặc mật khẩu chưa đúng\./);
  assert.doesNotMatch(src, /không tồn tại| Sai mật khẩu|không có quyền quản trị/i);
  // No admin email or default credential hardcoded in code (ops-managed).
  assert.doesNotMatch(src, /admin@moc\.vn/);
});

test("admin logout route reuses the public logout pattern", () => {
  const src = readSource("app/api/admin/logout/route.ts");
  assert.match(src, /assertSameOrigin\(request\)/);
  assert.match(src, /logoutUser\(client\)/);
  assert.match(src, /status: 204/);
  assert.match(src, /applyCookies\(/);
});

test("admin me route delegates the 401/403 matrix to requireAdmin", () => {
  const src = readSource("app/api/admin/me/route.ts");
  assert.match(src, /requireAdmin\(client\)/);
  assert.match(src, /NextResponse\.json\(/);
  assert.match(src, /private, no-store/);
  assert.doesNotMatch(src, /signInWithPassword/);
});

test("admin login page redirects signed-in admins and hides the demo hint", () => {
  const page = readSource("app/admin/login/page.tsx");
  assert.match(page, /requireAdmin\(/);
  assert.match(page, /redirect\("\/admin"\)/);
  assert.match(page, /index: false/);
  assert.match(page, /AdminLoginForm/);
  const form = readSource("app/admin/login/AdminLoginForm.tsx");
  assert.match(form, /api\.admin\.login/);
  assert.match(form, /router\.push\("\/admin"\)/);
  assert.match(form, /router\.refresh\(\)/);
  assert.match(form, /Về trang chủ/);
  assert.doesNotMatch(form, /mật khẩu là admin|Demo:/);
  assert.doesNotMatch(page, /mật khẩu là admin|Demo:/);
});

test("admin panel layout guards once and delegates shell state to AdminFrame", () => {
  const layout = readSource("app/admin/(panel)/layout.tsx");
  assert.match(layout, /requireAdmin\(/);
  assert.match(layout, /redirect\("\/admin\/login"\)/);
  assert.match(layout, /admin\.css/);
  assert.match(layout, /AdminFrame/);
  assert.match(layout, /index: false/);
  const frame = readSource("components/admin/AdminFrame.tsx");
  assert.match(frame, /usePathname/);
  assert.match(frame, /"overview"/);
  assert.match(frame, /"users"/);
  assert.match(frame, /"cards"/);
  assert.match(frame, /"templates"/);
  assert.match(frame, /api\.admin\.logout/);
  assert.match(frame, /\/admin\/login/);
  assert.match(frame, /AdminShell/);
});

const ADMIN_STYLES = new Set(["Truyền thống", "Tối giản", "Hoa", "Cổ điển", "Lãng mạn", "Hiện đại"]);
const ADMIN_BADGES = new Set(["", "MỚI", "HOT"]);

test("seed templates stay consistent with the code catalog", () => {
  const samples = Object.entries(templateSamples);
  assert.ok(samples.length > 0, "templateSamples must not be empty");
  const catalogIds = new Set(templates.map((t) => t.id));
  const catalogNames = new Map(templates.map((t) => [t.id, t.name]));
  for (const [id, sample] of samples) {
    assert.ok(catalogIds.has(id), `sample ${id} must exist in the templates catalog`);
    assert.ok(ADMIN_STYLES.has(sample.style), `sample ${id} has an unknown style: ${sample.style}`);
    assert.ok(ADMIN_BADGES.has(sample.badge), `sample ${id} has an unknown badge: ${sample.badge}`);
    assert.ok(sample.pop >= 0 && sample.pop <= 100, `sample ${id} pop out of range`);
    assert.ok((catalogNames.get(id) ?? "").length > 0, `catalog name missing for ${id}`);
  }

  const migration = readFileSync(
    new URL("../supabase/migrations/202610090001_admin.sql", import.meta.url),
    "utf8",
  );
  const inserts = migration.match(/insert into public\.templates \(/gi) ?? [];
  assert.equal(
    inserts.length,
    samples.length,
    `seed rows (${inserts.length}) must equal templateSamples keys (${samples.length})`,
  );
});
