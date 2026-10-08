import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";
import { adminTemplatePatchSchema } from "@/lib/server/admin-schemas";
import { patchAdminTemplate } from "@/lib/server/admin-templates";
import { HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { assertSameOrigin } from "@/lib/server/security";

const NO_STORE = { "Cache-Control": "private, no-store" };
// Template ids mirror the code catalog (e.g. song-hy); the table constrains
// length(id) to 1..80, so the route validates the same range before touching SQL.
const idSchema = z.string().min(1).max(80);

// PATCH /api/admin/templates/[id] — { name?, style?, badge?, hidden? } with the
// 6-style / ""|"MỚI"|"HOT" enums from adminTemplatePatchSchema. Unknown id → 404.
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const { client, applyCookies } = createRouteClient(request);
    await requireAdmin(client);
    const { id } = await context.params;
    const parsedId = idSchema.safeParse(id);
    if (!parsedId.success) throw new HttpError(400, "Mã mẫu thiệp không hợp lệ.");
    const patch = await parseJson(request, adminTemplatePatchSchema);
    return applyCookies(
      NextResponse.json(await patchAdminTemplate(createAdminClient(), parsedId.data, patch), { headers: NO_STORE }),
    );
  });
}
