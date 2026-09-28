import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/server/auth";
import { routeResponse } from "@/lib/server/http";
import { createRouteClient } from "@/lib/server/supabase";
import { assertSameOrigin } from "@/lib/server/security";

export async function POST(request: NextRequest) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { client, applyCookies } = createRouteClient(request);
    await logoutUser(client);
    return applyCookies(new NextResponse(null, { status: 204 }));
  });
}
