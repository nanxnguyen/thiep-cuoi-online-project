export const MAX_LOG_BODY_BYTES = 32 * 1024;

const SECRET_KEY = /(?:password|authorization|cookie|token|secret|editkey|guesttoken|access[_-]?token|refresh[_-]?token|service[_-]?role|api[_-]?key)/i;
const PII_KEY = /^(?:email|phone|name|message|note|address|household|groupname|table_no|tableNo)$/i;

export function traceId(headers: Headers): string {
  const supplied = headers.get("x-request-id")?.trim() ?? "";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(supplied)
    ? supplied
    : crypto.randomUUID();
}

export function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[TRUNCATED]";
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redactValue(item, depth + 1));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).slice(0, 100).map(([key, item]) => [
    key,
    SECRET_KEY.test(key) ? "[REDACTED]" : PII_KEY.test(key) ? "[PII_REDACTED]" : redactValue(item, depth + 1),
  ]));
}

export function redactHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  for (const name of ["content-type", "user-agent", "x-request-id", "cache-control"]) {
    const value = headers.get(name);
    if (value) result[name] = value.slice(0, 500);
  }
  return result;
}

export function redactJsonText(text: string): unknown {
  if (new TextEncoder().encode(text).byteLength > MAX_LOG_BODY_BYTES) return { omitted: true, reason: "body_too_large" };
  try { return redactValue(JSON.parse(text)); } catch { return { omitted: true, reason: "not_json" }; }
}

export async function sha256Text(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
