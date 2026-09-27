import { NextRequest, NextResponse } from "next/server";
import { startGoogleOAuth } from "@/lib/server/auth";
import { routeResponse } from "@/lib/server/http";
import { createRouteClient } from "@/lib/server/supabase";

export async function GET(request: NextRequest) {
  return routeResponse(request, async () => {
    const { client, applyCookies } = createRouteClient(request);
    // `next` lets the header's login popup (any page) bounce back to where it opened; /auth/callback re-validates
    // it (must start with "/") before the final redirect, so no extra checking is needed here.
    const next = request.nextUrl.searchParams.get("next");
    const callback = new URL("/auth/callback", request.nextUrl.origin);
    if (next) callback.searchParams.set("next", next);
    return applyCookies(NextResponse.redirect(await startGoogleOAuth(client, callback.toString())));
  });
}
