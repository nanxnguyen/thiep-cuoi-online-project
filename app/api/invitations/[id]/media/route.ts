import { NextRequest, NextResponse } from "next/server";
import { HttpError, routeResponse } from "@/lib/server/http";
import { invitationRequestAccess } from "@/lib/server/invitation-request";
import { uploadMedia, type MediaKind } from "@/lib/server/media";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(async () => {
    const { id } = await context.params;
    let form: FormData;
    try { form = await request.formData(); } catch { throw new HttpError(400, "Dữ liệu tải lên chưa hợp lệ."); }
    const kind = form.get("kind");
    const file = form.get("file");
    if ((kind !== "image" && kind !== "audio") || !(file instanceof File)) throw new HttpError(400, "Cần chọn loại và file tải lên.");
    const auth = await invitationRequestAccess(request, id);
    return auth.applyCookies(NextResponse.json(await uploadMedia(auth.admin, id, kind as MediaKind, file, auth.editKey, auth.userId), { status: 201 }));
  });
}
