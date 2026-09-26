import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteGuest, updateGuest } from "@/lib/server/guests";
import { HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { invitationRequestAccess } from "@/lib/server/invitation-request";

const patchSchema = z.object({
  household: z.string().optional(),
  groupName: z.string().optional(),
  tableNo: z.string().optional(),
  phone: z.string().optional(),
  expectedPax: z.number().int().optional(),
  note: z.string().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Không có thay đổi để lưu.");

async function params(context: { params: Promise<{ id: string; guestId: string }> }) {
  const value = await context.params;
  if (!z.uuid().safeParse(value.guestId).success) throw new HttpError(404, "Không tìm thấy khách mời.");
  return value;
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string; guestId: string }> }) {
  return routeResponse(async () => {
    const { id, guestId } = await params(context);
    const input = await parseJson(request, patchSchema);
    const auth = await invitationRequestAccess(request, id);
    return auth.applyCookies(NextResponse.json(await updateGuest(auth.admin, id, guestId, input, auth.editKey, auth.userId)));
  });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string; guestId: string }> }) {
  return routeResponse(async () => {
    const { id, guestId } = await params(context);
    const auth = await invitationRequestAccess(request, id);
    await deleteGuest(auth.admin, id, guestId, auth.editKey, auth.userId);
    return auth.applyCookies(new NextResponse(null, { status: 204 }));
  });
}
