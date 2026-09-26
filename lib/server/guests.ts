import { createHash, createHmac, randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { GuestDto, GuestImportResult, GuestInput, GuestRsvpStatus } from "../api.ts";
import { requireInvitationAccess, type InvitationAccessRow } from "./edit-key.ts";
import { serverEnv } from "./env.ts";
import { HttpError } from "./http.ts";

type InvitationRow = InvitationAccessRow & { slug: string };
type GuestRow = {
  id: string;
  invitation_id: string;
  household: string;
  group_name: string;
  table_no: string;
  phone: string;
  expected_pax: number;
  note: string;
  created_at: string;
  updated_at: string;
};
type RsvpRow = { guest_id: string; attending: boolean; guests: number; created_at: string };
type ValidGuest = Required<GuestInput>;

const MAX_IMPORT_ROWS = 1000;
const limits = { household: 120, groupName: 80, tableNo: 40, phone: 30, note: 500 } as const;

function tokenSecret(secret?: string) {
  return secret ?? serverEnv().rateLimitHmacSecret;
}

// ponytail: rotating this shared HMAC secret invalidates old guest links; split the key only when independent rotation is required.
export function guestToken(id: string, secret?: string): string {
  return createHmac("sha256", tokenSecret(secret)).update(`guest-token:${id}`).digest("base64url");
}

export function hashGuestToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function validateGuestInput(input: unknown, create: boolean): Partial<ValidGuest> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new HttpError(400, "Thông tin khách mời chưa hợp lệ.");
  const value = input as Record<string, unknown>;
  const allowed = new Set(["household", "groupName", "tableNo", "phone", "expectedPax", "note"]);
  if (Object.keys(value).some((key) => !allowed.has(key))) throw new HttpError(400, "Thông tin khách mời chưa hợp lệ.");

  const out: Partial<ValidGuest> = {};
  for (const key of ["household", "groupName", "tableNo", "phone", "note"] as const) {
    const raw = value[key];
    if (raw === undefined) continue;
    if (typeof raw !== "string") throw new HttpError(400, "Thông tin khách mời chưa hợp lệ.");
    const text = key === "household" ? raw.trim() : raw;
    if (key === "household" && !text) throw new HttpError(400, "Tên hộ/nhóm không được để trống.");
    if (text.length > limits[key]) {
      const labels = { household: "Tên hộ/nhóm", groupName: "Tên nhóm", tableNo: "Số bàn", phone: "Số điện thoại", note: "Ghi chú" };
      throw new HttpError(400, `${labels[key]} tối đa ${limits[key]} ký tự.`);
    }
    out[key] = text;
  }
  if (value.expectedPax !== undefined) {
    if (!Number.isInteger(value.expectedPax) || (value.expectedPax as number) < 1 || (value.expectedPax as number) > 100) {
      throw new HttpError(400, "Số khách dự kiến phải từ 1 đến 100.");
    }
    out.expectedPax = value.expectedPax as number;
  }
  if (create) {
    if (!out.household) throw new HttpError(400, "Tên hộ/nhóm không được để trống.");
    return { household: out.household, groupName: out.groupName ?? "", tableNo: out.tableNo ?? "", phone: out.phone ?? "", expectedPax: out.expectedPax ?? 1, note: out.note ?? "" };
  }
  if (!Object.keys(out).length) throw new HttpError(400, "Không có thay đổi để lưu.");
  return out;
}

function databaseValues(input: Partial<ValidGuest>) {
  return {
    ...(input.household !== undefined && { household: input.household }),
    ...(input.groupName !== undefined && { group_name: input.groupName }),
    ...(input.tableNo !== undefined && { table_no: input.tableNo }),
    ...(input.phone !== undefined && { phone: input.phone }),
    ...(input.expectedPax !== undefined && { expected_pax: input.expectedPax }),
    ...(input.note !== undefined && { note: input.note }),
  };
}

function toGuestDto(row: GuestRow, slug: string, secret: string, rsvp?: RsvpRow): GuestDto {
  const token = guestToken(row.id, secret);
  const rsvpStatus: GuestRsvpStatus = !rsvp ? "pending" : rsvp.attending ? "attending" : "declined";
  return {
    id: row.id,
    household: row.household,
    groupName: row.group_name,
    tableNo: row.table_no,
    phone: row.phone,
    expectedPax: row.expected_pax,
    note: row.note,
    token,
    link: `/invite/${slug}?g=${token}`,
    rsvpStatus,
    confirmedPax: rsvp?.attending ? rsvp.guests : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function invitation(client: SupabaseClient, id: string, editKey?: string, userId?: string): Promise<InvitationRow> {
  return await requireInvitationAccess({ client, id, editKey, userId }) as InvitationRow;
}

async function latestRsvps(client: SupabaseClient, invitationId: string): Promise<Map<string, RsvpRow>> {
  const { data, error } = await client.from("rsvps").select("guest_id,attending,guests,created_at")
    .eq("invitation_id", invitationId).not("guest_id", "is", null).order("created_at", { ascending: false });
  if (error) throw new HttpError(500, "Chưa tải được trạng thái xác nhận.");
  const latest = new Map<string, RsvpRow>();
  for (const row of (data ?? []) as RsvpRow[]) if (!latest.has(row.guest_id)) latest.set(row.guest_id, row);
  return latest;
}

export async function listGuests(client: SupabaseClient, id: string, editKey?: string, userId?: string, secret?: string) {
  const inv = await invitation(client, id, editKey, userId);
  const { data, error } = await client.from("guests").select("*").eq("invitation_id", id).order("created_at", { ascending: false });
  if (error) throw new HttpError(500, "Chưa tải được danh sách khách mời.");
  const latest = await latestRsvps(client, id);
  const key = tokenSecret(secret);
  return { guests: ((data ?? []) as GuestRow[]).map((row) => toGuestDto(row, inv.slug, key, latest.get(row.id))) };
}

export async function createGuest(client: SupabaseClient, id: string, input: unknown, editKey?: string, userId?: string, secret?: string): Promise<GuestDto> {
  const inv = await invitation(client, id, editKey, userId);
  const guest = validateGuestInput(input, true) as ValidGuest;
  const guestId = randomUUID();
  const key = tokenSecret(secret);
  const { data, error } = await client.from("guests").insert({
    id: guestId,
    invitation_id: id,
    ...databaseValues(guest),
    token_hash: hashGuestToken(guestToken(guestId, key)),
  }).select("*").single();
  if (error || !data) throw new HttpError(500, "Chưa thêm được khách mời.");
  return toGuestDto(data as GuestRow, inv.slug, key);
}

export async function updateGuest(client: SupabaseClient, id: string, guestId: string, input: unknown, editKey?: string, userId?: string, secret?: string): Promise<GuestDto> {
  const inv = await invitation(client, id, editKey, userId);
  const patch = validateGuestInput(input, false);
  const { data, error } = await client.from("guests").update(databaseValues(patch)).eq("id", guestId).eq("invitation_id", id).select("*").maybeSingle();
  if (error) throw new HttpError(500, "Chưa cập nhật được khách mời.");
  if (!data) throw new HttpError(404, "Không tìm thấy khách mời.");
  const latest = await latestRsvps(client, id);
  return toGuestDto(data as GuestRow, inv.slug, tokenSecret(secret), latest.get(guestId));
}

export async function deleteGuest(client: SupabaseClient, id: string, guestId: string, editKey?: string, userId?: string): Promise<void> {
  await invitation(client, id, editKey, userId);
  const { data, error } = await client.from("guests").delete().eq("id", guestId).eq("invitation_id", id).select("id").maybeSingle();
  if (error) throw new HttpError(500, "Chưa xoá được khách mời.");
  if (!data) throw new HttpError(404, "Không tìm thấy khách mời.");
}

export async function importGuests(client: SupabaseClient, id: string, rows: unknown[], editKey?: string, userId?: string, secret?: string): Promise<GuestImportResult> {
  if (!Array.isArray(rows)) throw new HttpError(400, "Danh sách khách mời chưa hợp lệ.");
  if (rows.length > MAX_IMPORT_ROWS) throw new HttpError(413, `Mỗi lần chỉ nhập tối đa ${MAX_IMPORT_ROWS} khách mời.`);
  await invitation(client, id, editKey, userId);
  const key = tokenSecret(secret);
  const errors: GuestImportResult["errors"] = [];
  const inserts: Record<string, unknown>[] = [];
  for (const [index, row] of rows.entries()) {
    try {
      const guest = validateGuestInput(row, true) as ValidGuest;
      const guestId = randomUUID();
      inserts.push({ id: guestId, invitation_id: id, ...databaseValues(guest), token_hash: hashGuestToken(guestToken(guestId, key)) });
    } catch (error) {
      errors.push({ index, message: error instanceof HttpError ? error.message : "Thông tin khách mời chưa hợp lệ." });
    }
  }
  if (inserts.length) {
    const { error } = await client.from("guests").insert(inserts).select("id");
    if (error) throw new HttpError(500, "Chưa nhập được danh sách khách mời.");
  }
  return { created: inserts.length, errors };
}

export async function resolveGuestToken(client: SupabaseClient, slug: string, token: string): Promise<{ household: string } | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const { data: inv, error } = await client.from("invitations").select("id").eq("slug", slug).eq("published", true).maybeSingle();
  if (error) throw new HttpError(500, "Chưa kiểm tra được khách mời.");
  if (!inv) return null;
  const { data: guest, error: guestError } = await client.from("guests").select("household")
    .eq("invitation_id", inv.id).eq("token_hash", hashGuestToken(token)).maybeSingle();
  if (guestError) throw new HttpError(500, "Chưa kiểm tra được khách mời.");
  return guest ? { household: guest.household } : null;
}
