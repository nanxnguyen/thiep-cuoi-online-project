import { NextResponse } from "next/server";
import { z } from "zod";
import { JSON_MAX_BYTES, parseJson, routeResponse } from "@/lib/server/http";
import { forwardPublicWrite, parsePublicPayload, requestFingerprint } from "@/lib/server/public-write";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  return routeResponse(request, async () => {
    const { slug } = await context.params;
    const input = await parseJson(request, z.unknown(), JSON_MAX_BYTES);
    const payload = parsePublicPayload("wish", input);
    const result = await forwardPublicWrite("wish", slug, payload, requestFingerprint(request.headers), request.headers.get("idempotency-key") ?? "", fetch, request.headers.get("x-request-id") ?? undefined);
    return NextResponse.json(result.body, { status: result.status });
  });
}
