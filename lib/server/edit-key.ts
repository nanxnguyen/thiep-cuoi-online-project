import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HttpError } from "./http.ts";

export function createEditKey(): string {
  return randomBytes(32).toString("base64url");
}

export async function hashEditKey(key: string): Promise<string> {
  return createHash("sha256").update(key).digest("hex");
}

export type InvitationAccessRow = {
  id: string;
  owner_id: string | null;
  edit_key_hash: string;
};

export async function requireInvitationAccess({
  client,
  id,
  editKey,
  userId,
}: {
  client: SupabaseClient;
  id: string;
  editKey?: string;
  userId?: string;
}): Promise<InvitationAccessRow> {
  const { data, error } = await client.from("invitations").select("*").eq("id", id).maybeSingle();
  if (error) throw new HttpError(500, "Chưa kiểm tra được quyền chỉnh sửa.");
  if (!data) throw new HttpError(404, "Không tìm thấy nội dung này.");
  const row = data as InvitationAccessRow;
  if (userId && row.owner_id === userId) return row;
  if (!editKey) throw new HttpError(401, "Cần link chỉnh sửa của thiệp này.");
  const actual = Buffer.from(await hashEditKey(editKey), "hex");
  const expected = Buffer.from(row.edit_key_hash, "hex");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new HttpError(403, "Link chỉnh sửa không đúng.");
  return row;
}
