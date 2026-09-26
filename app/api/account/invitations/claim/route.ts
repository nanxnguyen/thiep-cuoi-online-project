import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { claimInvitation } from "@/lib/server/invitations";
import { parseJson, routeResponse } from "@/lib/server/http";
import { createRouteClient } from "@/lib/server/supabase";

const schema = z.object({ id: z.uuid(), key: z.string().min(20).max(200) });

export async function POST(request: NextRequest) {
  return routeResponse(request, async () => {
    const input = await parseJson(request, schema);
    const { client, applyCookies } = createRouteClient(request);
    await requireUser(client);
    return applyCookies(NextResponse.json(await claimInvitation(client, input.id, input.key)));
  });
}
