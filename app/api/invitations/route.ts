import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentSchema } from "@/lib/content";
import { createInvitation } from "@/lib/server/invitations";
import { HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { consumeRateLimit } from "@/lib/server/rate-limit";
import { requestFingerprint } from "@/lib/server/public-write";
import { createAdminClient } from "@/lib/server/supabase";

const schema = z.object({ templateId: z.string().min(1).max(80), content: contentSchema });

export async function POST(request: NextRequest) {
  return routeResponse(request, async () => {
    const input = await parseJson(request, schema);
    const client = createAdminClient();
    if (!await consumeRateLimit(client, `create:${requestFingerprint(request.headers)}`, 10, 3600)) {
      throw new HttpError(429, "Bạn tạo thiệp quá nhanh, hãy thử lại sau.");
    }
    return NextResponse.json(await createInvitation(client, input.templateId, input.content), { status: 201 });
  });
}
