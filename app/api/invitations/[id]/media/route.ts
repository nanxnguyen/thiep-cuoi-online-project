import { NextRequest, NextResponse } from "next/server";
import { HttpError, routeResponse } from "@/lib/server/http";
import { invitationRequestAccess } from "@/lib/server/invitation-request";
import { assertUploadRequestSize, uploadMedia, type MediaKind } from "@/lib/server/media";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { requestFingerprint } from "@/lib/server/public-write";
import { assertSameOrigin } from "@/lib/server/security";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { id } = await context.params;
    assertUploadRequestSize(request);
    const auth = await invitationRequestAccess(request, id);
    await enforceRateLimit(auth.admin, `upload-ip:${requestFingerprint(request.headers)}`, 60, 3600);
    await enforceRateLimit(auth.admin, `owner-write:${auth.actorKey}:${id}`, 120, 60);
    let form: FormData;
    try { form = await request.formData(); } catch { throw new HttpError(400, "Dữ liệu tải lên chưa hợp lệ."); }
    const kind = form.get("kind");
    const file = form.get("file");
    if ((kind !== "image" && kind !== "audio" && kind !== "video") || !(file instanceof File)) throw new HttpError(400, "Cần chọn loại và file tải lên.");
    return auth.applyCookies(NextResponse.json(await uploadMedia(auth.admin, id, kind as MediaKind, file, auth.editKey, auth.userId), { status: 201 }));
  });
}
