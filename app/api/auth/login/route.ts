import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { loginUser } from "@/lib/server/auth";
import { parseJson, routeResponse } from "@/lib/server/http";
import { createRouteClient } from "@/lib/server/supabase";

const schema = z.object({ email: z.email().max(254), password: z.string().min(8).max(72) });

export async function POST(request: NextRequest) {
  return routeResponse(async () => {
    const input = await parseJson(request, schema);
    const { client, applyCookies } = createRouteClient(request);
    return applyCookies(NextResponse.json(await loginUser(client, input.email, input.password)));
  });
}
