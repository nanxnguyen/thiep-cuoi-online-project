import { createAdminClient } from "./supabase.ts";
import { MAX_LOG_BODY_BYTES, redactHeaders, redactJsonText, sha256Text, traceId } from "../../supabase/functions/_shared/logging.ts";

type BodySnapshot = { body: unknown; hash: string | null };

async function snapshot(request: Request | Response): Promise<BodySnapshot> {
  const contentType = request.headers.get("content-type") ?? "";
  const rawLength = request.headers.get("content-length");
  const length = rawLength === null ? NaN : Number(rawLength);
  if (!contentType.toLowerCase().includes("json") || !Number.isSafeInteger(length) || length > MAX_LOG_BODY_BYTES) {
    return { body: { omitted: true, reason: contentType.includes("multipart") ? "multipart" : "body_unavailable" }, hash: null };
  }
  try {
    const text = await request.clone().text();
    return { body: redactJsonText(text), hash: await sha256Text(text) };
  } catch {
    return { body: { omitted: true, reason: "body_unavailable" }, hash: null };
  }
}

export function requestTraceId(request: Request): string {
  return traceId(request.headers);
}

export async function recordApiRequest({
  request,
  response,
  trace,
  startedAt,
  error,
}: {
  request: Request;
  response: Response;
  trace: string;
  startedAt: number;
  error?: unknown;
}): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    const [requestBody, responseBody] = await Promise.all([snapshot(request), snapshot(response)]);
    const client = createAdminClient();
    await client.from("api_request_logs").insert({
      trace_id: trace,
      service: "next-api",
      method: request.method,
      route: new URL(request.url).pathname,
      status_code: response.status,
      duration_ms: Math.max(0, Date.now() - startedAt),
      request_headers: redactHeaders(request.headers),
      request_body: requestBody.body,
      response_headers: redactHeaders(response.headers),
      response_body: responseBody.body,
      request_body_sha256: requestBody.hash,
      response_body_sha256: responseBody.hash,
      error_code: error instanceof Error ? error.name : null,
      error_message: error instanceof Error ? error.message.slice(0, 500) : null,
    });
  } catch (loggingError) {
    console.error("request log write failed", loggingError instanceof Error ? loggingError.message : "unknown error");
  }
}
