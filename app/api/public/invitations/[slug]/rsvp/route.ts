import { NextResponse } from "next/server";
import { routeResponse } from "@/lib/server/http";
import { forwardPublicWrite, parsePublicPayload, requestFingerprint } from "@/lib/server/public-write";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  return routeResponse(request, async () => {
    const { slug } = await context.params;
    const payload = parsePublicPayload("rsvp", await request.json().catch(() => null));
    const result = await forwardPublicWrite("rsvp", slug, payload, requestFingerprint(request.headers), request.headers.get("idempotency-key") ?? "", fetch, request.headers.get("x-request-id") ?? undefined);
    return result.status === 204 ? new NextResponse(null, { status: 204 }) : NextResponse.json(result.body, { status: result.status });
  });
}
