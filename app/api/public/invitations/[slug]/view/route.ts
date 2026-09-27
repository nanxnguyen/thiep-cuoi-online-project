import { NextRequest, NextResponse } from "next/server";
import { recordInvitationView, viewCookieValue, visitorHash, VIEW_COOKIE } from "@/lib/server/analytics";
import { routeResponse } from "@/lib/server/http";
import { serverEnv } from "@/lib/server/env";
import { createAdminClient } from "@/lib/server/supabase";

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  return routeResponse(request, async () => {
    const { slug } = await context.params;
    const value = viewCookieValue(request.cookies.get(VIEW_COOKIE)?.value);
    const hash = await visitorHash(value, serverEnv().rateLimitHmacSecret);
    await recordInvitationView(createAdminClient(), slug, hash);
    const response = NextResponse.json({ recorded: true });
    if (!request.cookies.has(VIEW_COOKIE)) response.cookies.set(VIEW_COOKIE, value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return response;
  });
}
