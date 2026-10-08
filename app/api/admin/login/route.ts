import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { adminLoginSchema } from "@/lib/server/admin-schemas";
import { HttpError, parseJson, routeResponse } from "@/lib/server/http";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { assertSameOrigin } from "@/lib/server/security";
import { createAdminClient, createRouteClient } from "@/lib/server/supabase";

// Single generic message for every failure (wrong password, unknown email,
// valid user without the admin flag) so attackers cannot enumerate accounts.
const GENERIC_LOGIN_ERROR = "Email hoặc mật khẩu chưa đúng.";

function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  return routeResponse(request, async () => {
    assertSameOrigin(request);
    const input = await parseJson(request, adminLoginSchema);
    await enforceRateLimit(createAdminClient(), `admin-login:${clientIp(request)}`, 10, 600);
    const { client, applyCookies } = createRouteClient(request);
    const { error } = await client.auth.signInWithPassword({ email: input.email, password: input.password });
    if (error) throw new HttpError(401, GENERIC_LOGIN_ERROR);
    try {
      // requireAdmin returns the AccountUser DTO plus isAdmin: true.
      const admin = await requireAdmin(client);
      return applyCookies(NextResponse.json({ user: admin }));
    } catch {
      // Signed in but not an admin (or session unreadable): drop the session
      // immediately so a non-admin credential never leaves a cookie behind.
      await client.auth.signOut();
      throw new HttpError(401, GENERIC_LOGIN_ERROR);
    }
  });
}
