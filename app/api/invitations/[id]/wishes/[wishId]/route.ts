import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { invitationRequestAccess } from "@/lib/server/invitation-request";
import { setWishModeration } from "@/lib/server/responses";

const schema = z.object({ hidden: z.boolean().optional(), approved: z.boolean().optional() }).strict()
  .refine((value) => Object.keys(value).length > 0, "Không có thay đổi để lưu.");

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string; wishId: string }> }) {
  return routeResponse(request, async () => {
    const { id, wishId } = await context.params;
    if (!z.uuid().safeParse(wishId).success) throw new HttpError(404, "Không tìm thấy lời chúc.");
    const patch = await parseJson(request, schema);
    const auth = await invitationRequestAccess(request, id);
    await setWishModeration(auth.admin, id, wishId, patch, auth.editKey, auth.userId);
    return auth.applyCookies(new NextResponse(null, { status: 204 }));
  });
}
