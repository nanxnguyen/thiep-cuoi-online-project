import { NextResponse } from "next/server";
import { apiOpenApiDoc } from "@/lib/api-docs";
import { routeResponse } from "@/lib/server/http";

export const dynamic = "force-static";

export async function GET(request: Request) {
  return routeResponse(request, async () => NextResponse.json(apiOpenApiDoc));
}
