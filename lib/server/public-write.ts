import { createHmac } from "node:crypto";
import type { RsvpInput, WishInput } from "../api.ts";
import { parsePayload, type PublicAction } from "../../supabase/functions/_shared/public-write.ts";
import { traceId } from "../../supabase/functions/_shared/logging.ts";
import { serverEnv } from "./env.ts";
import { HttpError } from "./http.ts";

export function parsePublicPayload(action: "rsvp", input: unknown): RsvpInput;
export function parsePublicPayload(action: "wish", input: unknown): WishInput;
export function parsePublicPayload(action: PublicAction, input: unknown): RsvpInput | WishInput {
  try {
    return parsePayload(action, input) as RsvpInput | WishInput;
  } catch {
    throw new HttpError(400, "Thông tin chưa hợp lệ.");
  }
}

export function requestFingerprint(headers: Headers): string {
  const forwarded = process.env.NODE_ENV === "production" ? null : headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = headers.get("x-nf-client-connection-ip")?.trim() || forwarded || "unknown";
  return createHmac("sha256", serverEnv().rateLimitHmacSecret).update(`client-ip:${ip}`).digest("hex");
}

export async function forwardPublicWrite(
  action: PublicAction,
  slug: string,
  payload: RsvpInput | WishInput,
  fingerprint: string,
  idempotencyKey: string,
  fetchImpl: typeof fetch = fetch,
  requestId = crypto.randomUUID(),
) {
  if (idempotencyKey.length < 16 || idempotencyKey.length > 120) throw new HttpError(400, "Idempotency-Key chưa hợp lệ.");
  const env = serverEnv();
  const safeRequestId = traceId(new Headers({ "x-request-id": requestId }));
  let response: Response;
  try {
    response = await fetchImpl(env.edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Edge-Secret": env.edgeSharedSecret,
        "Idempotency-Key": idempotencyKey,
        "X-Request-Id": safeRequestId,
        "X-Parent-Trace-Id": safeRequestId,
      },
      body: JSON.stringify({ action, slug, payload, fingerprint }),
    });
  } catch {
    throw new HttpError(502, "Chưa kết nối được dịch vụ gửi phản hồi.");
  }
  if (response.status === 204) return { status: 204, body: undefined };
  let body: unknown;
  try { body = await response.json(); } catch { body = { detail: "Máy chủ đang bận, bạn thử lại sau nhé." }; }
  return { status: response.status, body };
}
