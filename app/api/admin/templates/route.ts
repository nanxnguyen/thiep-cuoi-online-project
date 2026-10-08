import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";
import { adminTemplatesQuerySchema } from "@/lib/server/admin-schemas";
import { listAdminTemplates } from "@/lib/server/admin-templates";
import { HttpError, routeResponse } from "@/lib/server/http";

const NO_STORE = { "Cache-Control": "private, no-store" };

// GET /api/admin/templates?q&style&page&perPage — filter style + search name in
// SQL, order pop desc + id, exact count for pagination (§5 of the admin spec).
export async function GET(request: NextRequest) {
  return routeResponse(request, async () => {
    const { client, applyCookies } = createRouteClient(request);
    await requireAdmin(client);
    const parsed = adminTemplatesQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Thông tin chưa hợp lệ.");
    return applyCookies(NextResponse.json(await listAdminTemplates(createAdminClient(), parsed.data), { headers: NO_STORE }));
  });
}
