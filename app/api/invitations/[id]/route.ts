import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentSchema } from "@/lib/content";
import { deleteInvitation, getInvitation, updateInvitation } from "@/lib/server/invitations";
import { requireUser } from "@/lib/server/auth";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";
import { INVITATION_JSON_MAX_BYTES, parseJson, routeResponse } from "@/lib/server/http";
import { invitationActorKey, invitationRequestAccess } from "@/lib/server/invitation-request";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { assertSameOrigin } from "@/lib/server/security";

const patchSchema = z.object({
  templateId: z.string().min(1).max(80).optional(),
  content: contentSchema.optional(),
  slug: z.string().optional(),
  published: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Không có thay đổi để lưu.");

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    const { id } = await context.params;
    const auth = await invitationRequestAccess(request, id);
    return auth.applyCookies(NextResponse.json(await getInvitation(auth.admin, id, auth.editKey, auth.userId)));
  });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { id } = await context.params;
    const input = await parseJson(request, patchSchema, INVITATION_JSON_MAX_BYTES);
    const auth = await invitationRequestAccess(request, id);
    await enforceRateLimit(auth.admin, `owner-write:${auth.actorKey}:${id}`, 120, 60);
    return auth.applyCookies(NextResponse.json(await updateInvitation(auth.admin, id, input, auth.editKey, auth.userId)));
  });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { id } = await context.params;
    const { client, applyCookies } = createRouteClient(request);
    const user = await requireUser(client);
    const admin = createAdminClient();
    await enforceRateLimit(admin, `owner-write:${invitationActorKey(user.id)}:${id}`, 120, 60);
    await deleteInvitation(admin, id, user.id);
    return applyCookies(new NextResponse(null, { status: 204 }));
  });
}
