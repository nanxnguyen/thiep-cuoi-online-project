import { NextResponse } from "next/server";
import { resolveGuestToken } from "@/lib/server/guests";
import { routeResponse } from "@/lib/server/http";
import { createAdminClient } from "@/lib/server/supabase";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { requestFingerprint } from "@/lib/server/public-write";

const noStore = { "Cache-Control": "no-store" };

export async function GET(request: Request, context: { params: Promise<{ slug: string; token: string }> }) {
  return routeResponse(request, async () => {
    const { slug, token } = await context.params;
    const admin = createAdminClient();
    await enforceRateLimit(admin, `guest-token:${requestFingerprint(request.headers)}:${slug}`, 30, 60);
    const guest = await resolveGuestToken(admin, slug, token);
    return guest
      ? NextResponse.json(guest, { headers: noStore })
      : NextResponse.json({ detail: "Không tìm thấy nội dung này." }, { status: 404, headers: noStore });
  });
}
