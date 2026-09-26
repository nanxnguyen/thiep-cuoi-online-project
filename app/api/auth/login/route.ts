import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/server/auth";
import { HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { requestFingerprint } from "@/lib/server/public-write";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";

const schema = z.object({ email: z.email().max(254), password: z.string().min(8).max(72) });

export async function POST(request: NextRequest) {
  return routeResponse(request, async () => {
    const input = await parseJson(request, schema);
    if (!await consumeRateLimit(createAdminClient(), `login:${requestFingerprint(request.headers)}`, 10, 900)) {
      throw new HttpError(429, "Bạn thử đăng nhập quá nhiều lần, hãy thử lại sau.");
    }
    const { client, applyCookies } = createRouteClient(request);
    return applyCookies(NextResponse.json(await loginUser(client, input.email, input.password)));
  });
}
