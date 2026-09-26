import { z } from "zod";
import type { NextRequest } from "next/server";
import { HttpError } from "./http.ts";
import { createAdminClient, createRouteClient } from "./supabase.ts";

export async function invitationRequestAccess(request: NextRequest, id: string) {
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "Không tìm thấy nội dung này.");
  const routeClient = createRouteClient(request);
  const { data } = await routeClient.client.auth.getUser();
  return {
    admin: createAdminClient(),
    editKey: request.headers.get("x-edit-key") ?? undefined,
    userId: data.user?.id,
    applyCookies: routeClient.applyCookies,
  };
}
