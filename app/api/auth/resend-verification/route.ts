import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resendSignupEmail } from "@/lib/server/auth";
import { HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { requestFingerprint } from "@/lib/server/public-write";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";

const schema = z.object({ email: z.email().max(254) });

export async function POST(request: NextRequest) {
  return routeResponse(request, async () => {
    const input = await parseJson(request, schema);
    if (!await consumeRateLimit(createAdminClient(), `verify:${requestFingerprint(request.headers)}`, 5, 3600)) {
      throw new HttpError(429, "Bạn yêu cầu quá nhanh, hãy thử lại sau.");
    }
    const { client, applyCookies } = createRouteClient(request);
    await resendSignupEmail(client, input.email);
    return applyCookies(NextResponse.json({ sent: true }));
  });
}
