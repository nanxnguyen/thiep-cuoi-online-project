import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { getInvitationViewSummary } from "@/lib/server/analytics";
import { routeResponse } from "@/lib/server/http";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    const { id } = await context.params;
    const { client, applyCookies } = createRouteClient(request);
    const user = await requireUser(client);
    return applyCookies(NextResponse.json(await getInvitationViewSummary(createAdminClient(), id, user.id)));
  });
}
