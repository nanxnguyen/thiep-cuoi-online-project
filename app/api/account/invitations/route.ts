import { NextRequest, NextResponse } from "next/server";
import { listAccountInvitations, requireUser } from "@/lib/server/auth";
import { routeResponse } from "@/lib/server/http";
import { createRouteClient } from "@/lib/server/supabase";

export async function GET(request: NextRequest) {
  return routeResponse(async () => {
    const { client, applyCookies } = createRouteClient(request);
    const user = await requireUser(client);
    return applyCookies(NextResponse.json(await listAccountInvitations(client, user.id)));
  });
}
