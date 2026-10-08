import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/server/auth";
import { adminCardPatchSchema } from "@/lib/server/admin-schemas";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";
import { HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { assertSameOrigin } from "@/lib/server/security";
import { getTemplate } from "@/lib/templates";
import type { AdminCardRow } from "@/lib/api";

const idSchema = z.uuid();
const NO_STORE = { "Cache-Control": "private, no-store" } as const;

function parseCardId(value: string): string {
  const parsed = idSchema.safeParse(value);
  if (!parsed.success) throw new HttpError(400, "Thiệp không tồn tại.");
  return parsed.data;
}

// PATCH returns the same AdminCardRow shape as the list (without the page's
// RSVP batch: one summary RPC call is a single round trip for one row).
async function readCardRow(admin: SupabaseClient, id: string): Promise<AdminCardRow | null> {
  const { data: row, error } = await admin
    .from("invitations")
    .select("id,slug,template_id,content,published,is_flagged,owner_id,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new HttpError(500, "Chưa tải được thiệp.");
  if (!row) return null;
  const invitation = row as {
    id: string;
    slug: string;
    template_id: string;
    content: unknown;
    published: boolean;
    is_flagged: boolean;
    owner_id: string | null;
    created_at: string;
  };
  let ownerEmail: string | null = null;
  if (invitation.owner_id) {
    try {
      const { data, error: ownerError } = await admin.auth.admin.getUserById(invitation.owner_id);
      ownerEmail = !ownerError && data.user?.email ? data.user.email : null;
    } catch {
      ownerEmail = null;
    }
  }
  let confirmed = "—";
  if (invitation.published) {
    const { data: summary, error: summaryError } = await admin
      .rpc("get_response_summary", { p_invitation_id: id })
      .single();
    if (summaryError || !summary) throw new HttpError(500, "Chưa tải được xác nhận tham dự.");
    const totals = summary as { attending: number | string; headcount: number | string };
    confirmed = `${Number(totals.attending)}/${Number(totals.headcount)}`;
  }
  const content = invitation.content && typeof invitation.content === "object"
    ? (invitation.content as Record<string, unknown>)
    : {};
  const couple = content.couple && typeof content.couple === "object" ? (content.couple as Record<string, unknown>) : {};
  const sideName = (side: unknown): string => {
    const person = side && typeof side === "object" ? (side as Record<string, unknown>) : {};
    return typeof person.name === "string" ? person.name.trim() : "";
  };
  const names = [sideName(couple.bride), sideName(couple.groom)].filter((name) => name.length > 0);
  return {
    id: invitation.id,
    slug: invitation.slug,
    couple: names.length > 0 ? names.join(" & ") : "Thiệp chưa đặt tên",
    templateId: invitation.template_id,
    templateName: getTemplate(invitation.template_id)?.name ?? invitation.template_id,
    ownerEmail: ownerEmail ?? "Khách vãng lai",
    createdAt: invitation.created_at,
    status: invitation.is_flagged ? "reported" : invitation.published ? "published" : "draft",
    confirmed,
  };
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { id: rawId } = await context.params;
    const id = parseCardId(rawId);
    const { client, applyCookies } = createRouteClient(request);
    await requireAdmin(client);
    const patch = await parseJson(request, adminCardPatchSchema);
    const admin = createAdminClient();
    const { data, error } = await admin.from("invitations").update(patch).eq("id", id).select("id").maybeSingle();
    if (error) throw new HttpError(500, "Chưa cập nhật được thiệp.");
    if (!data) throw new HttpError(404, "Không tìm thấy nội dung này.");
    const row = await readCardRow(admin, id);
    if (!row) throw new HttpError(404, "Không tìm thấy nội dung này.");
    return applyCookies(NextResponse.json(row, { headers: NO_STORE }));
  });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { id: rawId } = await context.params;
    const id = parseCardId(rawId);
    const { client, applyCookies } = createRouteClient(request);
    await requireAdmin(client);
    const admin = createAdminClient();
    // Guests/RSVPs/wishes cascade in the DB; media cleanup is best-effort.
    const { data, error } = await admin.from("invitations").delete().eq("id", id).select("id").maybeSingle();
    if (error) throw new HttpError(500, "Chưa xoá được thiệp.");
    if (!data) throw new HttpError(404, "Không tìm thấy nội dung này.");
    return applyCookies(new NextResponse(null, { status: 204 }));
  });
}
