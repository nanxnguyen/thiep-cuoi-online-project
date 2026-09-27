import { NextRequest, NextResponse } from "next/server";
import { exchangeAuthCode } from "@/lib/server/auth";
import { routeResponse } from "@/lib/server/http";
import { createRouteClient } from "@/lib/server/supabase";

function safeNext(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/account";
}

export async function GET(request: NextRequest) {
  return routeResponse(request, async () => {
    const code = request.nextUrl.searchParams.get("code");
    const next = safeNext(request.nextUrl.searchParams.get("next"));
    if (!code) return NextResponse.redirect(new URL("/account?auth=error", request.url));
    const { client, applyCookies } = createRouteClient(request);
    try {
      await exchangeAuthCode(client, code);
      return applyCookies(NextResponse.redirect(new URL(next, request.url)));
    } catch {
      return NextResponse.redirect(new URL("/account?auth=error", request.url));
    }
  });
}
