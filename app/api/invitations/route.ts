import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentSchema } from "@/lib/content";
import { createInvitation } from "@/lib/server/invitations";
import { HttpError, INVITATION_JSON_MAX_BYTES, parseJson, routeResponse } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { requestFingerprint } from "@/lib/server/public-write";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";

const schema = z.object({ templateId: z.string().min(1).max(80), content: contentSchema });

export async function POST(request: NextRequest) {
  return routeResponse(request, async () => {
    const input = await parseJson(request, schema, INVITATION_JSON_MAX_BYTES);
    const { client: authClient, applyCookies } = createRouteClient(request);
    const { data: { user } } = await authClient.auth.getUser();
    const client = createAdminClient();
    await enforceRateLimit(client, `create:${requestFingerprint(request.headers)}`, 10, 3600);
    return applyCookies(NextResponse.json(await createInvitation(client, input.templateId, input.content, user?.id), { status: 201 }));
  });
}
