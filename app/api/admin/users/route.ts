import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { AdminUserRow } from "@/lib/api";
import { adminUsersQuerySchema } from "@/lib/server/admin-schemas";
import { requireAdmin } from "@/lib/server/auth";
import { HttpError, routeResponse } from "@/lib/server/http";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";

// GET /api/admin/users — §5 of the admin spec. Auth users are enumerated via
// the Auth Admin API (max 10 pages x 100) because there is no denormalized
// profiles table in V1 (§8.3 follow-up); the invite count is merged with a
// single owner_id-only query aggregated in code (PostgREST exposes no
// group-by through supabase-js), so the whole handler is 1 auth walk + 1 DB
// round trip. The DTO is built field-by-field — auth metadata never leaves
// the server.
const AUTH_PAGE_SIZE = 100;
const AUTH_MAX_PAGES = 10;

// Supabase has no permanent-ban flag; a ~100-year ban is the convention.
export const ADMIN_BAN_DURATION = "876000h";

type AuthUserLike = Pick<User, "id" | "email" | "user_metadata" | "banned_until" | "created_at">;

export function adminDisplayName(user: AuthUserLike): string {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const raw = typeof metadata.full_name === "string"
    ? metadata.full_name
    : typeof metadata.name === "string"
    ? metadata.name
    : "";
  const trimmed = raw.trim().slice(0, 80);
  if (trimmed) return trimmed;
  return (user.email ?? "").split("@")[0] || "Người dùng";
}

export function adminAvatarUrl(user: AuthUserLike): string | undefined {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const raw = typeof metadata.avatar_url === "string"
    ? metadata.avatar_url
    : typeof metadata.picture === "string"
    ? metadata.picture
    : undefined;
  return raw && /^https:\/\//i.test(raw) ? raw : undefined;
}

export function adminUserStatus(user: AuthUserLike): "active" | "suspended" {
  return user.banned_until != null ? "suspended" : "active";
}

export function mapAuthUserToRow(user: AuthUserLike, inviteCount: number): AdminUserRow {
  const avatarUrl = adminAvatarUrl(user);
  return {
    id: user.id,
    email: user.email ?? "",
    name: adminDisplayName(user),
    ...(avatarUrl ? { avatarUrl } : {}),
    createdAt: user.created_at,
    inviteCount,
    status: adminUserStatus(user),
  };
}

// New users per week, oldest → newest, 7-day windows ending now. Computed
// over the full enumerated set (not the page slice) so the chart in the
// users page reflects the whole base.
export function bucketWeekly(createdAts: readonly string[], weeks = 8, now = Date.now()): number[] {
  const buckets = new Array<number>(weeks).fill(0);
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  for (const iso of createdAts) {
    const time = Date.parse(iso);
    if (!Number.isFinite(time) || time > now) continue;
    const index = weeks - 1 - Math.floor((now - time) / weekMs);
    if (index >= 0) buckets[index] += 1;
  }
  return buckets;
}

export async function GET(request: NextRequest) {
  return routeResponse(request, async () => {
    const { client, applyCookies } = createRouteClient(request);
    await requireAdmin(client);
    const parsed = adminUsersQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.issues[0]?.message ?? "Tham số không hợp lệ.");
    }
    const { q, status, page, perPage } = parsed.data;

    const admin = createAdminClient();
    const all: AuthUserLike[] = [];
    for (let listPage = 1; listPage <= AUTH_MAX_PAGES; listPage += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page: listPage, perPage: AUTH_PAGE_SIZE });
      if (error) throw new HttpError(500, "Chưa tải được danh sách người dùng.");
      all.push(...data.users);
      if (data.users.length < AUTH_PAGE_SIZE) break;
    }

    const { data: ownerRows, error: countError } = await admin.from("invitations").select("owner_id");
    if (countError) throw new HttpError(500, "Chưa tải được số thiệp của người dùng.");
    const counts = new Map<string, number>();
    for (const row of (ownerRows ?? []) as { owner_id: string | null }[]) {
      if (row.owner_id) counts.set(row.owner_id, (counts.get(row.owner_id) ?? 0) + 1);
    }

    const needle = q.toLowerCase();
    const filtered = all.filter((user) => {
      if (status !== "all" && adminUserStatus(user) !== status) return false;
      if (!needle) return true;
      const email = (user.email ?? "").toLowerCase();
      return email.includes(needle) || adminDisplayName(user).toLowerCase().includes(needle);
    });
    filtered.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));

    const total = filtered.length;
    const active = all.filter((u) => adminUserStatus(u) === "active").length;
    const pageCount = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(page, pageCount);
    const items = filtered
      .slice((safePage - 1) * perPage, safePage * perPage)
      .map((user) => mapAuthUserToRow(user, counts.get(user.id) ?? 0));

    const response = NextResponse.json({
      items,
      page: safePage,
      pageCount,
      total,
      weekly: bucketWeekly(all.map((u) => u.created_at)),
      summary: {
        total: all.length,
        active,
        suspended: all.length - active,
        cards: [...counts.values()].reduce((sum, n) => sum + n, 0),
      },
    });
    response.headers.set("Cache-Control", "private, no-store");
    return applyCookies(response);
  });
}
