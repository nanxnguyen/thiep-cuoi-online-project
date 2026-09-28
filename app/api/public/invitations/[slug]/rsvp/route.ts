import { NextResponse } from "next/server";
import { z } from "zod";
import { JSON_MAX_BYTES, parseJson, routeResponse } from "@/lib/server/http";
import { forwardPublicWrite, parsePublicPayload, requestFingerprint, turnstileToken } from "@/lib/server/public-write";
import { verifyTurnstile } from "@/lib/server/turnstile";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  return routeResponse(request, async () => {
    const { slug } = await context.params;
    const input = await parseJson(request, z.unknown(), JSON_MAX_BYTES);
    const payload = parsePublicPayload("rsvp", input);
    await verifyTurnstile(turnstileToken(input), "rsvp");
    const result = await forwardPublicWrite("rsvp", slug, payload, requestFingerprint(request.headers), request.headers.get("idempotency-key") ?? "", fetch, request.headers.get("x-request-id") ?? undefined);
    return result.status === 204 ? new NextResponse(null, { status: 204 }) : NextResponse.json(result.body, { status: result.status });
  });
}
