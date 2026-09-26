import { NextResponse } from "next/server";
import { resolveGuestToken } from "@/lib/server/guests";
import { routeResponse } from "@/lib/server/http";
import { createAdminClient } from "@/lib/server/supabase";

const noStore = { "Cache-Control": "no-store" };

export async function GET(_request: Request, context: { params: Promise<{ slug: string; token: string }> }) {
  return routeResponse(_request, async () => {
    const { slug, token } = await context.params;
    const guest = await resolveGuestToken(createAdminClient(), slug, token);
    return guest
      ? NextResponse.json(guest, { headers: noStore })
      : NextResponse.json({ detail: "Không tìm thấy nội dung này." }, { status: 404, headers: noStore });
  });
}
