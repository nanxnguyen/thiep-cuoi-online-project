import { NextResponse } from "next/server";
import { apiOpenApiDoc } from "@/lib/api-docs";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(apiOpenApiDoc);
}
