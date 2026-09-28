import { siteUrl } from "../site.ts";
import { HttpError } from "./http.ts";

type TurnstileResult = {
  success?: boolean;
  hostname?: string;
  action?: string;
  challenge_ts?: string;
};

export async function verifyTurnstile(token: string, expectedAction: "rsvp" | "wish", fetchImpl: typeof fetch = fetch): Promise<void> {
  if (!token || token.length > 2048) throw new HttpError(403, "Vui lòng xác minh bạn không phải robot.");
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) throw new HttpError(503, "Xác minh chống spam chưa được cấu hình.");

  let result: TurnstileResult;
  try {
    const response = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error();
    result = await response.json() as TurnstileResult;
  } catch {
    throw new HttpError(503, "Chưa xác minh được, vui lòng thử lại.");
  }

  const issuedAt = Date.parse(result.challenge_ts ?? "");
  const age = Date.now() - issuedAt;
  if (!result.success || result.hostname !== new URL(siteUrl(process.env)).hostname || result.action !== expectedAction
    || !Number.isFinite(issuedAt) || age < -60_000 || age > 5 * 60_000) {
    throw new HttpError(403, "Xác minh chống spam không hợp lệ, vui lòng thử lại.");
  }
}
