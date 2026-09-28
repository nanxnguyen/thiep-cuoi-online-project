import { z } from "zod";
import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";
import { HttpError } from "./http.ts";
import { createAdminClient, createRouteClient } from "./supabase.ts";
import { serverEnv } from "./env.ts";

export function invitationActorKey(userId?: string, editKey?: string) {
  const actor = userId ? `user:${userId}` : editKey ? `edit:${editKey}` : "anonymous";
  return createHmac("sha256", serverEnv().rateLimitHmacSecret).update(actor).digest("hex");
}

export async function invitationRequestAccess(request: NextRequest, id: string) {
  if (!z.uuid().safeParse(id).success) throw new HttpError(404, "Không tìm thấy nội dung này.");
  const routeClient = createRouteClient(request);
  const { data } = await routeClient.client.auth.getUser();
  const editKey = request.headers.get("x-edit-key") ?? undefined;
  return {
    admin: createAdminClient(),
    editKey,
    userId: data.user?.id,
    actorKey: invitationActorKey(data.user?.id, editKey),
    applyCookies: routeClient.applyCookies,
  };
}
