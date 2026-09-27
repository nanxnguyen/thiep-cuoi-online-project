import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, updatePassword } from "@/lib/server/auth";
import { parseJson, routeResponse } from "@/lib/server/http";
import { createRouteClient } from "@/lib/server/supabase";

const schema = z.object({ password: z.string().min(8).max(72) });

export async function POST(request: NextRequest) {
  return routeResponse(request, async () => {
    const input = await parseJson(request, schema);
    const { client, applyCookies } = createRouteClient(request);
    await requireUser(client);
    await updatePassword(client, input.password);
    return applyCookies(NextResponse.json({ updated: true }));
  });
}
