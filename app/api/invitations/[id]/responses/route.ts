import { NextRequest, NextResponse } from "next/server";
import { routeResponse } from "@/lib/server/http";
import { invitationRequestAccess } from "@/lib/server/invitation-request";
import { getResponses } from "@/lib/server/responses";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    const { id } = await context.params;
    const auth = await invitationRequestAccess(request, id);
    return auth.applyCookies(NextResponse.json(await getResponses(auth.admin, id, auth.editKey, auth.userId)));
  });
}
