import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { importGuests } from "@/lib/server/guests";
import { parseJson, routeResponse } from "@/lib/server/http";
import { invitationRequestAccess } from "@/lib/server/invitation-request";

const schema = z.object({ guests: z.array(z.unknown()) }).strict();

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    const { id } = await context.params;
    const input = await parseJson(request, schema);
    const auth = await invitationRequestAccess(request, id);
    return auth.applyCookies(NextResponse.json(await importGuests(auth.admin, id, input.guests, auth.editKey, auth.userId)));
  });
}
