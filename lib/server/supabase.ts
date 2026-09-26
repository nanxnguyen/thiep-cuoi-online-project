import { createServerClient, type CookieMethodsServer, type SetAllCookies } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "./env.ts";

const statelessAuth = { persistSession: false, autoRefreshToken: false } as const;

export function authCookieOptions(production = process.env.NODE_ENV === "production") {
  return { httpOnly: true, secure: production, sameSite: "lax" as const, path: "/" };
}

export function createAnonClient() {
  const env = serverEnv();
  return createClient(env.supabaseUrl, env.supabaseAnonKey, { auth: statelessAuth });
}

export function createRequestClient(cookies: CookieMethodsServer) {
  const env = serverEnv();
  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, { cookies, cookieOptions: authCookieOptions() });
}

export function createAdminClient() {
  const env = serverEnv();
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: statelessAuth });
}

export function createRouteClient(request: NextRequest) {
  let pending: Parameters<SetAllCookies>[0] = [];
  let pendingHeaders: Parameters<SetAllCookies>[1] = {};
  const client = createRequestClient({
    getAll: () => request.cookies.getAll(),
    setAll: (cookies, headers) => { pending = cookies; pendingHeaders = headers; },
  });
  const applyCookies = <T extends NextResponse>(response: T): T => {
    for (const cookie of pending) response.cookies.set(cookie.name, cookie.value, { ...cookie.options, ...authCookieOptions() });
    for (const [name, value] of Object.entries(pendingHeaders)) response.headers.set(name, value);
    return response;
  };
  return { client, applyCookies };
}
