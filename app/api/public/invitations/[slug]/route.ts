import { NextResponse } from "next/server";
import { isValidSlug } from "@/lib/slug";
import { getPublicInvitation } from "@/lib/server/invitations";
import { HttpError, routeResponse } from "@/lib/server/http";
import { createAnonClient } from "@/lib/server/supabase";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const response = await routeResponse(async () => {
    const { slug } = await context.params;
    if (!isValidSlug(slug)) throw new HttpError(404, "Không tìm thấy nội dung này.");
    const invitation = await getPublicInvitation(createAnonClient(), slug);
    if (!invitation) throw new HttpError(404, "Không tìm thấy nội dung này.");
    return NextResponse.json(invitation);
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
