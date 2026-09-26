import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireInvitationAccess } from "./edit-key.ts";
import { HttpError } from "./http.ts";

export type MediaKind = "image" | "audio";
type DetectedMedia = { contentType: "image/png" | "image/jpeg" | "image/webp" | "audio/mpeg"; extension: "png" | "jpg" | "webp" | "mp3" };

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const AUDIO_MAX_BYTES = 8 * 1024 * 1024;
export const UPLOAD_REQUEST_MAX_BYTES = AUDIO_MAX_BYTES + 256 * 1024;

function startsWith(data: Uint8Array, head: number[]) {
  return head.every((byte, index) => data[index] === byte);
}

export function detectMedia(kind: MediaKind, data: Uint8Array): DetectedMedia {
  if (!data.length) throw new HttpError(400, "File rỗng.");
  const max = kind === "image" ? IMAGE_MAX_BYTES : AUDIO_MAX_BYTES;
  if (data.length > max) throw new HttpError(413, `File quá lớn (tối đa ${max / 1024 / 1024}MB).`);
  if (kind === "image") {
    if (startsWith(data, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { contentType: "image/png", extension: "png" };
    if (startsWith(data, [0xff, 0xd8, 0xff])) return { contentType: "image/jpeg", extension: "jpg" };
    if (startsWith(data, [0x52, 0x49, 0x46, 0x46]) && data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50) return { contentType: "image/webp", extension: "webp" };
    throw new HttpError(415, "Chỉ nhận ảnh WebP, JPEG hoặc PNG.");
  }
  if (startsWith(data, [0x49, 0x44, 0x33]) || (data[0] === 0xff && (data[1] & 0xe0) === 0xe0)) return { contentType: "audio/mpeg", extension: "mp3" };
  throw new HttpError(415, "Chỉ nhận nhạc MP3.");
}

export function assertUploadRequestSize(request: Request): void {
  const rawLength = request.headers.get("content-length");
  const length = rawLength === null ? NaN : Number(rawLength);
  if (!Number.isSafeInteger(length) || length <= 0 || length > UPLOAD_REQUEST_MAX_BYTES) {
    throw new HttpError(413, "File quá lớn hoặc yêu cầu tải lên không hợp lệ.");
  }
}

export async function uploadMedia(
  client: SupabaseClient,
  invitationId: string,
  kind: MediaKind,
  file: Blob,
  editKey?: string,
  userId?: string,
): Promise<{ url: string }> {
  await requireInvitationAccess({ client, id: invitationId, editKey, userId });
  const max = kind === "image" ? IMAGE_MAX_BYTES : AUDIO_MAX_BYTES;
  if (!file.size) throw new HttpError(400, "File rỗng.");
  if (file.size > max) throw new HttpError(413, `File quá lớn (tối đa ${max / 1024 / 1024}MB).`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const media = detectMedia(kind, bytes);
  const { data: allowed, error: rateError } = await client.rpc("consume_rate_limit", {
    p_key: `upload:${invitationId}`,
    p_limit: 30,
    p_window_seconds: 3600,
  });
  if (rateError) throw new HttpError(500, "Chưa kiểm tra được giới hạn tải file.");
  if (!allowed) throw new HttpError(429, "Bạn tải file quá nhanh, hãy thử lại sau.");

  const path = `${invitationId}/${randomUUID()}.${media.extension}`;
  const { error } = await client.storage.from("media").upload(path, bytes, { contentType: media.contentType, upsert: false });
  if (error) throw new HttpError(502, "Không lưu được file lên kho lưu trữ, hãy thử lại.");
  return { url: client.storage.from("media").getPublicUrl(path).data.publicUrl };
}
