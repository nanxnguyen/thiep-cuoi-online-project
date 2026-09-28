import { SITE_URL } from "../site.ts";
import { HttpError } from "./http.ts";

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  try {
    if (!origin || new URL(origin).origin !== new URL(SITE_URL).origin) throw new Error();
  } catch {
    throw new HttpError(403, "Nguồn yêu cầu không hợp lệ.");
  }
}

export function securityHeaders(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  };
}
