import { createHmac, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./http.ts";

export const VIEW_COOKIE = "moc.invitation.visitor";
export const VIEW_WINDOW_MS = 30 * 60 * 1000;

export function viewCookieValue(existing?: string): string {
  return existing?.trim() || randomBytes(18).toString("base64url");
}

export async function visitorHash(value: string, secret: string): Promise<string> {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export async function recordInvitationView(client: SupabaseClient, slug: string, hash: string): Promise<void> {
  const { data: invitation, error: invitationError } = await client.from("invitations").select("id").eq("slug", slug).eq("published", true).maybeSingle();
  if (invitationError) throw new HttpError(500, "Chưa ghi nhận được lượt xem.");
  if (!invitation) throw new HttpError(404, "Không tìm thấy thiệp.");
  const now = new Date();
  const { error } = await client.from("invitation_view_events").upsert({ invitation_id: invitation.id, visitor_hash: hash, view_day: now.toISOString().slice(0, 10), view_bucket: Math.floor(now.getTime() / VIEW_WINDOW_MS) }, { onConflict: "invitation_id,visitor_hash,view_bucket", ignoreDuplicates: true });
  if (error) throw new HttpError(500, "Chưa ghi nhận được lượt xem.");
}

export async function getInvitationViewSummary(client: SupabaseClient, invitationId: string, userId: string, days = 30): Promise<{ views: number; visitors: number }> {
  const { data: invitation, error: invitationError } = await client.from("invitations").select("owner_id").eq("id", invitationId).maybeSingle();
  if (invitationError) throw new HttpError(500, "Chưa tải được thống kê.");
  if (!invitation) throw new HttpError(404, "Không tìm thấy thiệp.");
  if (invitation.owner_id !== userId) throw new HttpError(403, "Bạn không có quyền xem thống kê thiệp này.");
  const { data, error } = await client.rpc("get_invitation_view_summary", { p_invitation_id: invitationId, p_days: days });
  if (error) throw new HttpError(500, "Chưa tải được thống kê.");
  const row = Array.isArray(data) ? data[0] : data;
  return { views: Number(row?.views ?? 0), visitors: Number(row?.visitors ?? 0) };
}
