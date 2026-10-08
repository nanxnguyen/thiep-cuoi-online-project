import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AdminStats } from "../api.ts";
import { getTemplate } from "../templates.ts";
import { toAccountInvitation } from "./auth.ts";
import { HttpError } from "./http.ts";

// Dashboard stats (Task 8, spec §5/§8.1). All reads go through the
// service-role client; the route guards with requireAdmin() first.
//
// DB round-trip budget: exactly 6 —
//   1-3. head counts on invitations (total / published / flagged;
//        draft is derived as total - published),
//   4.   one bounded scan (template_id + created_at, last 8 weeks) feeding
//        BOTH cardsWeekly and topTemplates,
//   5.   head count on wishes (approved = false),
//   6.   recent invitations (order updated_at desc, limit 5).
// User totals/weekly/recents come from the Auth Admin API (paged directory
// scan, max 10 pages x 100 — §8.3), not from the DB, so they sit outside the
// SQL budget. The query builder cannot express `count(*) filter (where …)`
// or `group by` in one statement, hence several narrow round trips instead
// of the single aggregate queries in §8.1.

export const ADMIN_STATS_WEEKS = 8;
export const ADMIN_STATS_RECENT_LIMIT = 5;
export const ADMIN_STATS_TOP_TEMPLATES_LIMIT = 5;
// The Auth Admin API has no server-side sort, so recents/page slices are
// derived in code from this same scan (sorted created_at desc).
const ADMIN_STATS_USER_PAGES = 10;
const ADMIN_STATS_USER_PER_PAGE = 100;
// PostgREST caps an unbounded select (default 1000 rows server-side); bound
// the scan explicitly. Follow-up past this scale: a dedicated
// `get_admin_stats` RPC doing the grouping in SQL.
const ADMIN_STATS_SCAN_LIMIT = 10000;

export const ADMIN_COUPLE_FALLBACK = "Thiệp chưa đặt tên";

export function adminCoupleLabel(groomName: string, brideName: string): string {
  const label = [groomName, brideName].filter(Boolean).join(" & ");
  return label || ADMIN_COUPLE_FALLBACK;
}

/** Monday 00:00 UTC starting the week that contains `date`. */
export function weekStartUtc(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Bucket ISO timestamps into `weeks` Monday-start week counts ending with
 * the current week. Always returns exactly `weeks` numbers (zeros when the
 * input is empty). Out-of-window future dates clamp into the latest bucket.
 */
export function bucketWeekly(dates: readonly string[], now: Date = new Date(), weeks: number = ADMIN_STATS_WEEKS): number[] {
  const buckets = new Array<number>(weeks).fill(0);
  if (weeks <= 0) return buckets;
  const oldest = weekStartUtc(now).getTime() - (weeks - 1) * WEEK_MS;
  for (const raw of dates) {
    const time = new Date(raw).getTime();
    if (!Number.isFinite(time) || time < oldest) continue;
    const index = Math.min(weeks - 1, Math.floor((time - oldest) / WEEK_MS));
    buckets[index] += 1;
  }
  return buckets;
}

/** Code-catalog name for a template id; unknown ids fall back to the id itself. */
export function resolveTemplateName(templateId: string): string {
  return getTemplate(templateId)?.name ?? templateId;
}

export function emptyAdminStats(): AdminStats {
  const zeros = new Array<number>(ADMIN_STATS_WEEKS).fill(0);
  return {
    users: { total: 0, active: 0, suspended: 0 },
    cards: { total: 0, published: 0, draft: 0, flagged: 0 },
    pendingWishes: 0,
    usersWeekly: zeros,
    cardsWeekly: [...zeros],
    topTemplates: [],
    recentUsers: [],
    recentCards: [],
  };
}

type DirectoryUser = { id: string; email: string; name: string; createdAt: string; suspended: boolean };

function mapDirectoryUser(user: User): DirectoryUser {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const rawName = typeof metadata.full_name === "string"
    ? metadata.full_name
    : typeof metadata.name === "string"
      ? metadata.name
      : "";
  const email = typeof user.email === "string" ? user.email : "";
  const name = rawName.trim().slice(0, 80) || email.split("@")[0] || "Người dùng";
  return {
    id: user.id,
    email,
    name,
    createdAt: user.created_at,
    // banned_until set (any non-null value) means suspended; unban clears it.
    suspended: user.banned_until != null,
  };
}

// Full directory scan for totals + weekly + recents in one pass (spec §5:
// sort created_at desc and slice in code). Stops early when a page is short;
// gives up after 10 pages — §8.3 follow-up is a denormalized profiles table.
async function listDirectoryUsers(admin: SupabaseClient): Promise<DirectoryUser[]> {
  const all: DirectoryUser[] = [];
  for (let page = 1; page <= ADMIN_STATS_USER_PAGES; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: ADMIN_STATS_USER_PER_PAGE });
    if (error) throw new HttpError(500, "Chưa tải được danh sách người dùng.");
    const users = data?.users ?? [];
    for (const user of users) all.push(mapDirectoryUser(user));
    if (users.length < ADMIN_STATS_USER_PER_PAGE) break;
  }
  return all;
}

async function headCount(
  admin: SupabaseClient,
  table: "invitations" | "wishes",
  failure: string,
  equals?: readonly [column: string, value: boolean],
): Promise<number> {
  const base = admin.from(table).select("id", { count: "exact", head: true });
  const { count, error } = equals ? await base.eq(equals[0], equals[1]) : await base;
  if (error) throw new HttpError(500, failure);
  return count ?? 0;
}

type InvitationScanRow = { template_id: string; created_at: string };

type RecentCardRow = {
  id: string;
  slug: string;
  template_id: string;
  published: boolean;
  is_flagged: boolean;
  updated_at: string;
  content: unknown;
};

export async function getAdminStats(admin: SupabaseClient, now: Date = new Date()): Promise<AdminStats> {
  const [total, published, flagged] = await Promise.all([
    headCount(admin, "invitations", "Chưa tải được tổng số thiệp."),
    headCount(admin, "invitations", "Chưa tải được số thiệp đã xuất bản.", ["published", true]),
    headCount(admin, "invitations", "Chưa tải được số thiệp bị báo cáo.", ["is_flagged", true]),
  ]);

  const windowStart = new Date(weekStartUtc(now).getTime() - (ADMIN_STATS_WEEKS - 1) * WEEK_MS);
  const { data: scan, error: scanError } = await admin
    .from("invitations")
    .select("template_id,created_at")
    .gte("created_at", windowStart.toISOString())
    .limit(ADMIN_STATS_SCAN_LIMIT);
  if (scanError) throw new HttpError(500, "Chưa tải được thống kê thiệp theo tuần.");
  const scanRows = (scan ?? []) as InvitationScanRow[];

  const cardsWeekly = bucketWeekly(scanRows.map((row) => row.created_at), now);

  const templateCounts = new Map<string, number>();
  for (const row of scanRows) {
    if (typeof row.template_id === "string" && row.template_id) {
      templateCounts.set(row.template_id, (templateCounts.get(row.template_id) ?? 0) + 1);
    }
  }
  const topTemplates = [...templateCounts.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, ADMIN_STATS_TOP_TEMPLATES_LIMIT)
    .map(([templateId, count]) => ({ templateId, name: resolveTemplateName(templateId), count }));

  const pendingWishes = await headCount(
    admin,
    "wishes",
    "Chưa tải được số lời chúc cần duyệt.",
    ["approved", false],
  );

  const { data: recentRows, error: recentError } = await admin
    .from("invitations")
    .select("id,slug,template_id,published,is_flagged,updated_at,content")
    .order("updated_at", { ascending: false })
    .limit(ADMIN_STATS_RECENT_LIMIT);
  if (recentError) throw new HttpError(500, "Chưa tải được thiệp gần đây.");
  const recentCards: AdminStats["recentCards"] = ((recentRows ?? []) as RecentCardRow[]).map((row) => {
    const account = toAccountInvitation({
      id: row.id,
      slug: row.slug,
      template_id: row.template_id,
      published: row.published,
      updated_at: row.updated_at,
      content: row.content,
    });
    return {
      id: row.id,
      slug: row.slug,
      couple: adminCoupleLabel(account.groomName, account.brideName),
      templateId: row.template_id,
      status: row.is_flagged ? ("reported" as const) : row.published ? ("published" as const) : ("draft" as const),
      // The dashboard never surfaces per-card RSVP counts, so stats skips the
      // per-card get_response_summary RPCs (5 extra round trips). The cards
      // slice owns the single-LATERAL confirmation summary.
      confirmed: "—",
      createdAt: row.updated_at,
    };
  });

  const directory = await listDirectoryUsers(admin);
  const byNewest = [...directory].sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  const suspended = directory.filter((user) => user.suspended).length;

  return {
    users: { total: directory.length, active: directory.length - suspended, suspended },
    cards: { total, published, draft: total - published, flagged },
    pendingWishes,
    usersWeekly: bucketWeekly(directory.map((user) => user.createdAt), now),
    cardsWeekly,
    topTemplates,
    recentUsers: byNewest.slice(0, ADMIN_STATS_RECENT_LIMIT).map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    })),
    recentCards,
  };
}
