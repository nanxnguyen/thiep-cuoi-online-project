import type { ZodType } from "zod";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function parseJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
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

export async function routeResponse(action: () => Promise<Response>): Promise<Response> {
  try {
    return await action();
  } catch (error) {
    if (error instanceof HttpError) return problem(error.status, error.message);
    console.error(error);
    return problem(500, "Máy chủ đang bận, bạn thử lại sau nhé.");
  }
}
