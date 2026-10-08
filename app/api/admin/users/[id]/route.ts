import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminUserPatchSchema } from "@/lib/server/admin-schemas";
import { requireAdmin } from "@/lib/server/auth";
import { HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { assertSameOrigin } from "@/lib/server/security";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";
import { ADMIN_BAN_DURATION, mapAuthUserToRow } from "../route";

// PATCH = ban/unban, DELETE = hard delete (their invitations keep
// owner_id = null via the FK `on delete set null`). Both refuse to touch the
// admin performing the action. Not-found vs invalid input follows the repo
// convention for bad uuids (404, like invitation-request.ts).
function assertUserId(id: string): void {
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "Không tìm thấy người dùng.");
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { id } = await context.params;
    assertUserId(id);
    const { client, applyCookies } = createRouteClient(request);
    const adminUser = await requireAdmin(client);
    if (id === adminUser.id) throw new HttpError(400, "Bạn không thể tự khoá chính mình.");
    const input = await parseJson(request, adminUserPatchSchema);
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.updateUserById(
      id,
      { ban_duration: input.action === "ban" ? ADMIN_BAN_DURATION : "none" },
    );
    if (error || !data.user) {
      throw new HttpError(
        /not found/i.test(error?.message ?? "") ? 404 : 400,
        "Không cập nhật được trạng thái người dùng.",
      );
    }
    const { count } = await admin.from("invitations").select("id", { count: "exact", head: true }).eq("owner_id", id);
    const response = NextResponse.json(mapAuthUserToRow(data.user, count ?? 0));
    response.headers.set("Cache-Control", "private, no-store");
    return applyCookies(response);
  });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { id } = await context.params;
    assertUserId(id);
    const { client, applyCookies } = createRouteClient(request);
    const adminUser = await requireAdmin(client);
    if (id === adminUser.id) throw new HttpError(400, "Bạn không thể tự xoá chính mình.");
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      throw new HttpError(
        /not found/i.test(error.message ?? "") ? 404 : 400,
        "Không xoá được người dùng.",
      );
    }
    return applyCookies(new NextResponse(null, { status: 204 }));
  });
}
