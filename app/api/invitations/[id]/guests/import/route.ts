import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importGuests } from "@/lib/server/guests";
import { INVITATION_JSON_MAX_BYTES, parseJson, routeResponse } from "@/lib/server/http";
import { invitationRequestAccess } from "@/lib/server/invitation-request";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { assertSameOrigin } from "@/lib/server/security";

const schema = z.object({ guests: z.array(z.unknown()) }).strict();

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { id } = await context.params;
    const input = await parseJson(request, schema, INVITATION_JSON_MAX_BYTES);
    const auth = await invitationRequestAccess(request, id);
    await enforceRateLimit(auth.admin, `owner-write:${auth.actorKey}:${id}`, 120, 60);
    return auth.applyCookies(NextResponse.json(await importGuests(auth.admin, id, input.guests, auth.editKey, auth.userId)));
  });
}
