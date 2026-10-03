import { NextResponse } from "next/server";
import { designRequestSchema } from "@/lib/design-request";
import { JSON_MAX_BYTES, HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { requestFingerprint } from "@/lib/server/public-write";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { assertSameOrigin } from "@/lib/server/security";
import { createAdminClient } from "@/lib/server/supabase";

export async function POST(request: Request) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const input = await parseJson(request, designRequestSchema, JSON_MAX_BYTES);
    // Honeypot filled: pretend it worked so bots learn nothing, store nothing.
    if (input.website) return NextResponse.json({ received: true }, { status: 201 });
    const admin = createAdminClient();
    await enforceRateLimit(admin, `design-request:${requestFingerprint(request.headers)}`, 3, 3600);
    const { error } = await admin.from("design_requests").insert({
      name: input.name,
      phone: input.phone,
      email: input.email,
      wedding_date: input.weddingDate || null,
      budget: input.budget,
      details: input.details,
      reference_links: input.referenceLinks,
    });
    if (error) throw new HttpError(500, "Chưa gửi được yêu cầu, bạn thử lại sau nhé.");
    return NextResponse.json({ received: true }, { status: 201 });
  });
}

