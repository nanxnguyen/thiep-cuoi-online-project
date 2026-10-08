import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminStats } from "@/lib/server/admin-stats";
import { routeResponse } from "@/lib/server/http";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";

export async function GET(request: NextRequest) {
  return routeResponse(request, async () => {
    const { client, applyCookies } = createRouteClient(request);
    // 401 anon / 403 non-admin before touching the service role.
    await requireAdmin(client);
    const stats = await getAdminStats(createAdminClient());
    return applyCookies(
      NextResponse.json(stats, { headers: { "Cache-Control": "private, no-store" } }),
    );
  });
}
