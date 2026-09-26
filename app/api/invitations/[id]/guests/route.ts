import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createGuest, listGuests } from "@/lib/server/guests";
import { parseJson, routeResponse } from "@/lib/server/http";
import { invitationRequestAccess } from "@/lib/server/invitation-request";

const createSchema = z.object({
  household: z.string(),
  groupName: z.string().optional(),
  tableNo: z.string().optional(),
  phone: z.string().optional(),
  expectedPax: z.number().int().optional(),
  note: z.string().optional(),
}).strict();

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    const { id } = await context.params;
    const auth = await invitationRequestAccess(request, id);
    return auth.applyCookies(NextResponse.json(await listGuests(auth.admin, id, auth.editKey, auth.userId)));
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    const { id } = await context.params;
    const input = await parseJson(request, createSchema);
    const auth = await invitationRequestAccess(request, id);
    return auth.applyCookies(NextResponse.json(await createGuest(auth.admin, id, input, auth.editKey, auth.userId), { status: 201 }));
  });
}
