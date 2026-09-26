import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentSchema } from "@/lib/content";
import { getInvitation, updateInvitation } from "@/lib/server/invitations";
import { parseJson, routeResponse } from "@/lib/server/http";
import { invitationRequestAccess } from "@/lib/server/invitation-request";

const patchSchema = z.object({
  templateId: z.string().min(1).max(80).optional(),
  content: contentSchema.optional(),
  slug: z.string().optional(),
  published: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Không có thay đổi để lưu.");

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(async () => {
    const { id } = await context.params;
    const auth = await invitationRequestAccess(request, id);
    return auth.applyCookies(NextResponse.json(await getInvitation(auth.admin, id, auth.editKey, auth.userId)));
  });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(async () => {
    const { id } = await context.params;
    const input = await parseJson(request, patchSchema);
    const auth = await invitationRequestAccess(request, id);
    return auth.applyCookies(NextResponse.json(await updateInvitation(auth.admin, id, input, auth.editKey, auth.userId)));
  });
}
