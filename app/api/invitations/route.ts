import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentSchema } from "@/lib/content";
import { createInvitation } from "@/lib/server/invitations";
import { parseJson, routeResponse } from "@/lib/server/http";
import { createAdminClient } from "@/lib/server/supabase";

const schema = z.object({ templateId: z.string().min(1).max(80), content: contentSchema });

export async function POST(request: NextRequest) {
  return routeResponse(async () => {
    const input = await parseJson(request, schema);
    return NextResponse.json(await createInvitation(createAdminClient(), input.templateId, input.content), { status: 201 });
  });
}
