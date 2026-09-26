import type { ZodType } from "zod";
import { recordApiRequest, requestTraceId } from "./logging.ts";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function parseJson<T>(request: Request, schema: ZodType<T>, maxBytes = 1024 * 1024): Promise<T> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.isSafeInteger(Number(contentLength)) && Number(contentLength) > maxBytes) {
    throw new HttpError(413, "Nội dung yêu cầu quá lớn.");
  }
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new HttpError(400, "Nội dung JSON không hợp lệ.");
  }
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? "Thông tin chưa hợp lệ.");
  return result.data;
}

export function problem(status: number, detail: string): Response {
  return Response.json({ detail }, { status });
}

export async function routeResponse(action: () => Promise<Response>): Promise<Response>;
export async function routeResponse(request: Request, action: () => Promise<Response>): Promise<Response>;
export async function routeResponse(requestOrAction: Request | (() => Promise<Response>), maybeAction?: () => Promise<Response>): Promise<Response> {
  const request = requestOrAction instanceof Request ? requestOrAction : undefined;
  const action = maybeAction ?? requestOrAction as () => Promise<Response>;
  const startedAt = Date.now();
  const trace = request ? requestTraceId(request) : undefined;
  if (request && trace) {
    try { request.headers.set("x-request-id", trace); } catch { /* immutable request headers */ }
  }
  let response: Response;
  try {
    response = await action();
  } catch (error) {
    response = error instanceof HttpError ? problem(error.status, error.message) : problem(500, "Máy chủ đang bận, bạn thử lại sau nhé.");
    if (!(error instanceof HttpError)) console.error(error);
    if (request && trace) {
      response.headers.set("x-request-id", trace);
      void recordApiRequest({ request, response, trace, startedAt, error });
    }
    return response;
  }
  if (request && trace) {
    response.headers.set("x-request-id", trace);
    void recordApiRequest({ request, response, trace, startedAt });
  }
  return response;
}
