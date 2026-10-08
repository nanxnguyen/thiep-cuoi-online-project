import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { routeResponse } from "@/lib/server/http";
import { createRouteClient } from "@/lib/server/supabase";

// requireAdmin throws 401 when signed out, 403 when signed in without the
// app_metadata.is_admin flag — that is the whole 401/403 matrix for this endpoint.
export async function GET(request: NextRequest) {
  return routeResponse(request, async () => {
    const { client, applyCookies } = createRouteClient(request);
    const response = NextResponse.json(await requireAdmin(client));
    response.headers.set("Cache-Control", "private, no-store");
    return applyCookies(response);
  });
}
