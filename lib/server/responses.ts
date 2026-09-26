import type { SupabaseClient } from "@supabase/supabase-js";
import type { ResponsesDto } from "../api.ts";
import { requireInvitationAccess } from "./edit-key.ts";
import { HttpError } from "./http.ts";

type RsvpRow = { id: string; name: string; attending: boolean; guests: number; note: string; answers: Record<string, string>; guest_label: string; created_at: string };
type WishRow = { id: string; name: string; message: string; hidden: boolean; approved: boolean; created_at: string };

export async function getResponses(client: SupabaseClient, id: string, editKey?: string, userId?: string): Promise<ResponsesDto> {
  await requireInvitationAccess({ client, id, editKey, userId });
  const [rsvps, summary, wishes] = await Promise.all([
    client.from("rsvps").select("id,name,attending,guests,note,answers,guest_label,created_at").eq("invitation_id", id).order("created_at", { ascending: false }).order("id", { ascending: false }),
    client.rpc("get_response_summary", { p_invitation_id: id }).single(),
    client.from("wishes").select("id,name,message,hidden,approved,created_at").eq("invitation_id", id).order("created_at", { ascending: false }).order("id", { ascending: false }),
  ]);
  if (rsvps.error || summary.error || wishes.error || !summary.data) throw new HttpError(500, "Chưa tải được phản hồi.");
  const totals = summary.data as { attending: number | string; declined: number | string; headcount: number | string };
  return {
    rsvps: ((rsvps.data ?? []) as RsvpRow[]).map((row) => ({
      id: row.id, name: row.name, attending: row.attending, guests: row.guests, note: row.note,
      answers: row.answers, guestLabel: row.guest_label, createdAt: row.created_at,
    })),
    summary: {
      attending: Number(totals.attending),
      declined: Number(totals.declined),
      headcount: Number(totals.headcount),
    },
    wishes: ((wishes.data ?? []) as WishRow[]).map((row) => ({
      id: row.id, name: row.name, message: row.message, hidden: row.hidden, approved: row.approved, createdAt: row.created_at,
    })),
  };
}

export async function setWishModeration(
  client: SupabaseClient,
  id: string,
  wishId: string,
  patch: { hidden?: boolean; approved?: boolean },
  editKey?: string,
  userId?: string,
): Promise<void> {
  if (!Object.keys(patch).length || Object.values(patch).some((value) => typeof value !== "boolean")) throw new HttpError(400, "Không có thay đổi để lưu.");
  await requireInvitationAccess({ client, id, editKey, userId });
  const { data, error } = await client.from("wishes").update(patch).eq("id", wishId).eq("invitation_id", id).select("id").maybeSingle();
  if (error) throw new HttpError(500, "Chưa cập nhật được lời chúc.");
  if (!data) throw new HttpError(404, "Không tìm thấy lời chúc.");
}
