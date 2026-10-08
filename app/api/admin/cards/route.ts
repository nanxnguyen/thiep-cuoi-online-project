import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { adminCardsQuerySchema, type AdminCardsQuery } from "@/lib/server/admin-schemas";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";
import { HttpError, routeResponse } from "@/lib/server/http";
import { getTemplate } from "@/lib/templates";
import type { AdminCardRow, AdminList } from "@/lib/api";

const GUEST_OWNER_EMAIL = "Khách vãng lai";
const UNTITLED_COUPLE = "Thiệp chưa đặt tên";
const NO_STORE = { "Cache-Control": "private, no-store" } as const;

// Columns the admin list needs: identity + content (couple names are read
// server-side so the DTO never leaks raw content to the client).
const CARD_COLUMNS = "id,slug,template_id,content,published,is_flagged,owner_id,created_at,updated_at";
const RSVP_COLUMNS = "invitation_id,guest_id,name,attending,guests,created_at,id";

type InvitationRow = {
  id: string;
  slug: string;
  template_id: string;
  content: unknown;
  published: boolean;
  is_flagged: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
};

type RsvpLite = {
  invitation_id: string;
  guest_id: string | null;
  name: string;
  attending: boolean;
  guests: number;
  created_at: string;
  id: string;
};

type CardSummary = { attending: number; declined: number; headcount: number };

// Reported wins regardless of published (§5: reported = flagged bất kể published).
function cardStatus(row: Pick<InvitationRow, "published" | "is_flagged">): AdminCardRow["status"] {
  if (row.is_flagged) return "reported";
  return row.published ? "published" : "draft";
}

// Same content.couple shape as toAccountInvitation (lib/server/auth.ts) and the
// same "bride & groom" order as AccountClient; blank names fall back.
function coupleDisplayName(content: unknown): string {
  const root = content && typeof content === "object" ? (content as Record<string, unknown>) : {};
  const couple = root.couple && typeof root.couple === "object" ? (root.couple as Record<string, unknown>) : {};
  const sideName = (side: unknown): string => {
    const person = side && typeof side === "object" ? (side as Record<string, unknown>) : {};
    return typeof person.name === "string" ? person.name.trim() : "";
  };
  const names = [sideName(couple.bride), sideName(couple.groom)].filter((name) => name.length > 0);
  return names.length > 0 ? names.join(" & ") : UNTITLED_COUPLE;
}

function templateDisplayName(templateId: string): string {
  return getTemplate(templateId)?.name ?? templateId;
}

// Drafts show "—" even when RSVP rows exist; published cards show attending/headcount.
function confirmedDisplay(published: boolean, summary: CardSummary | null): string {
  if (!published) return "—";
  const totals = summary ?? { attending: 0, declined: 0, headcount: 0 };
  return `${totals.attending}/${totals.headcount}`;
}

// PostgREST `ilike` uses `*` wildcards. Escape SQL LIKE specials (`\`, `%`, `_`)
// and the or() structural chars (via double-quote wrapping) so the validated q
// travels as a bound filter value — it is never concatenated into SQL.
function escapeLikePattern(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_").replace(/"/g, '\\"');
}

function buildCardSearchOr(q: string): string {
  const pattern = `*${escapeLikePattern(q)}*`;
  return `slug.ilike."${pattern}",template_id.ilike."${pattern}",content::text.ilike."${pattern}"`;
}

// Replicates public.get_response_summary (supabase/migrations/202609260001_backend.sql):
// the latest RSVP row per guest identity wins (ordered created_at desc, id desc),
// attending counts heads, headcount sums guests of attending rows only.
// supabase-js cannot express the LATERAL join without a stored function, so the
// page's RSVPs are fetched with ONE batched `in()` query and deduped here —
// same numbers, still a single query, no N+1.
function summarizeRsvps(rows: readonly RsvpLite[]): Map<string, CardSummary> {
  const seen = new Set<string>();
  const out = new Map<string, CardSummary>();
  for (const row of rows) {
    const identity = row.guest_id ? `g:${row.guest_id}` : `n:${row.name.trim().toLowerCase()}`;
    const key = `${row.invitation_id}|${identity}`;
    if (seen.has(key)) continue;
    seen.add(key);
    let slot = out.get(row.invitation_id);
    if (!slot) {
      slot = { attending: 0, declined: 0, headcount: 0 };
      out.set(row.invitation_id, slot);
    }
    if (row.attending) {
      slot.attending += 1;
      slot.headcount += Number(row.guests) || 0;
    } else {
      slot.declined += 1;
    }
  }
  return out;
}

function toAdminCardRow(
  row: InvitationRow,
  ownerEmail: string | null,
  summary: CardSummary | null,
): AdminCardRow {
  return {
    id: row.id,
    slug: row.slug,
    couple: coupleDisplayName(row.content),
    templateId: row.template_id,
    templateName: templateDisplayName(row.template_id),
    ownerEmail: ownerEmail ?? GUEST_OWNER_EMAIL,
    createdAt: row.created_at,
    status: cardStatus(row),
    confirmed: confirmedDisplay(row.published, summary),
  };
}

export async function GET(request: NextRequest) {
  return routeResponse(request, async () => {
    const { client, applyCookies } = createRouteClient(request);
    await requireAdmin(client);
    const parsed = adminCardsQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Thông tin chưa hợp lệ.");
    const query: AdminCardsQuery = parsed.data;
    const { q, status, page, perPage } = query;
    const admin = createAdminClient();

    // 1 count query + 1 page query, both filtered in SQL, newest first.
    let countQuery = admin.from("invitations").select("id", { count: "exact", head: true });
    let pageQuery = admin.from("invitations").select(CARD_COLUMNS);
    if (status === "published") {
      countQuery = countQuery.eq("published", true).eq("is_flagged", false);
      pageQuery = pageQuery.eq("published", true).eq("is_flagged", false);
    } else if (status === "draft") {
      countQuery = countQuery.eq("published", false).eq("is_flagged", false);
      pageQuery = pageQuery.eq("published", false).eq("is_flagged", false);
    } else if (status === "reported") {
      countQuery = countQuery.eq("is_flagged", true);
      pageQuery = pageQuery.eq("is_flagged", true);
    }
    if (q) {
      const searchOr = buildCardSearchOr(q);
      countQuery = countQuery.or(searchOr);
      pageQuery = pageQuery.or(searchOr);
    }
    const offset = (page - 1) * perPage;
    const [{ count, error: countError }, { data: pageRows, error: pageError }] = await Promise.all([
      countQuery,
      pageQuery.order("updated_at", { ascending: false }).range(offset, offset + perPage - 1),
    ]);
    if (countError || pageError) throw new HttpError(500, "Chưa tải được danh sách thiệp.");
    const rows = (pageRows ?? []) as InvitationRow[];
    const total = count ?? 0;

    // Owner emails: one Auth Admin lookup per DISTINCT owner of this page
    // (null → "Khách vãng lai"); a failed lookup degrades to the same label.
    const ownerIds = [...new Set(rows.map((row) => row.owner_id).filter((id): id is string => id !== null))];
    const ownerEntries = await Promise.all(
      ownerIds.map(async (ownerId): Promise<[string, string | null]> => {
        try {
          const { data, error } = await admin.auth.admin.getUserById(ownerId);
          return [ownerId, !error && data.user?.email ? data.user.email : null];
        } catch {
          return [ownerId, null];
        }
      }),
    );
    const ownerEmails = new Map(ownerEntries);

    // Confirmations: ONE batched rsvps query for every id on the page.
    let summaries = new Map<string, CardSummary>();
    const ids = rows.map((row) => row.id);
    if (ids.length > 0) {
      const { data: rsvpRows, error: rsvpError } = await admin
        .from("rsvps")
        .select(RSVP_COLUMNS)
        .in("invitation_id", ids)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
      if (rsvpError) throw new HttpError(500, "Chưa tải được xác nhận tham dự.");
      summaries = summarizeRsvps((rsvpRows ?? []) as RsvpLite[]);
    }

    const items = rows.map((row) =>
      toAdminCardRow(row, row.owner_id ? (ownerEmails.get(row.owner_id) ?? null) : null, summaries.get(row.id) ?? null),
    );
    const body: AdminList<AdminCardRow> = { items, page, pageCount: Math.max(1, Math.ceil(total / perPage)), total };
    return applyCookies(NextResponse.json(body, { headers: NO_STORE }));
  });
}
