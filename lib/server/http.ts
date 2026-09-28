import type { ZodType } from "zod";
import { recordApiRequest, requestTraceId } from "./logging.ts";

export const JSON_MAX_BYTES = 64 * 1024;
export const INVITATION_JSON_MAX_BYTES = 1024 * 1024;

export class HttpError extends Error {
  status: number;
  headers?: HeadersInit;
  constructor(status: number, message: string, headers?: HeadersInit) {
    super(message);
    this.status = status;
    this.headers = headers;
  }
}

export function requestOriginUrl(request: { url: string; nextUrl: URL }, path: string): URL {
  return new URL(path, request.nextUrl.origin);
}

export async function readBody(request: Request, maxBytes: number): Promise<Uint8Array> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number.isSafeInteger(Number(contentLength)) && Number(contentLength) > maxBytes) {
    throw new HttpError(413, "Nội dung yêu cầu quá lớn.");
  }
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > maxBytes) {
      await reader.cancel();
      throw new HttpError(413, "Nội dung yêu cầu quá lớn.");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function parseJson<T>(request: Request, schema: ZodType<T>, maxBytes = JSON_MAX_BYTES): Promise<T> {
  let value: unknown;
  try {
    value = JSON.parse(new TextDecoder().decode(await readBody(request, maxBytes)));
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(400, "Nội dung JSON không hợp lệ.");
  }
  const result = schema.safeParse(value);
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message ?? "Thông tin chưa hợp lệ.");
  return result.data;
}

export function problem(status: number, detail: string, headers?: HeadersInit): Response {
  return Response.json({ detail }, { status, headers });
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
    response = error instanceof HttpError ? problem(error.status, error.message, error.headers) : problem(500, "Máy chủ đang bận, bạn thử lại sau nhé.");
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
