import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { routeResponse } from "@/lib/server/http";
import { createRouteClient } from "@/lib/server/supabase";

export async function GET(request: NextRequest) {
  return routeResponse(request, async () => {
    const { client, applyCookies } = createRouteClient(request);
    return applyCookies(NextResponse.json(await requireUser(client)));
  });
}
