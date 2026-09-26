import assert from "node:assert/strict";
import test from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { authCookieOptions } from "../lib/server/supabase.ts";
import { HttpError, parseJson } from "../lib/server/http.ts";
import { loginUser, logoutUser, registerUser, requireUser, resendSignupEmail, resetPasswordEmail, toAccountInvitation, updatePassword } from "../lib/server/auth.ts";

type AuthResult = { data?: unknown; error?: { code?: string; message: string; status?: number } | null };

function clientWith(auth: Record<string, (...args: never[]) => Promise<AuthResult>>) {
  return { auth } as unknown as SupabaseClient;
}

test("parseJson rejects invalid auth input with status 400", async () => {
  const request = new Request("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: "bad", password: "short" }),
  });

  await assert.rejects(
    () => parseJson(request, z.object({ email: z.email(), password: z.string().min(8) })),
    (error: unknown) => error instanceof HttpError && error.status === 400,
  );
});

test("parseJson rejects oversized JSON before parsing it", async () => {
  const request = new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "content-length": String(1024 * 1024 + 1) },
    body: "{}",
  });
  await assert.rejects(
    () => parseJson(request, z.object({}), 1024 * 1024),
    (error: unknown) => error instanceof HttpError && error.status === 413,
  );
});

test("register maps duplicate users to 409 and returns a live session on success", async () => {
  const duplicate = clientWith({
    signUp: async () => ({ data: { user: null, session: null }, error: { code: "user_already_exists", message: "exists", status: 422 } }),
  });
  await assert.rejects(() => registerUser(duplicate, "a@example.com", "password1"), (error: unknown) => error instanceof HttpError && error.status === 409);

  const success = clientWith({
    signUp: async () => ({ data: { user: { id: "user-1", email: "a@example.com" }, session: { access_token: "access" } }, error: null }),
  });
  assert.deepEqual(await registerUser(success, "a@example.com", "password1"), {
    accessToken: "access",
    user: { id: "user-1", email: "a@example.com" },
  });
});

test("register accepts email confirmation without inventing a session", async () => {
  const client = clientWith({
    signUp: async () => ({ data: { user: { id: "user-1", email: "a@example.com" }, session: null }, error: null }),
  });
  assert.deepEqual(await registerUser(client, "a@example.com", "password1"), {
    user: { id: "user-1", email: "a@example.com" },
    emailConfirmationRequired: true,
  });
});

test("auth email helpers delegate to Supabase and map failures", async () => {
  const calls: unknown[] = [];
  const client = clientWith({
    resend: async (...args) => { calls.push(args); return { data: {}, error: null }; },
    resetPasswordForEmail: async (...args) => { calls.push(args); return { data: {}, error: null }; },
    updateUser: async (...args) => { calls.push(args); return { data: { user: { id: "user-1", email: "a@example.com" } }, error: null }; },
  });
  await resendSignupEmail(client, "a@example.com");
  await resetPasswordEmail(client, "a@example.com", "https://moc.vn/auth/callback");
  await updatePassword(client, "password2");
  assert.deepEqual(calls, [
    [{ type: "signup", email: "a@example.com" }],
    ["a@example.com", { redirectTo: "https://moc.vn/auth/callback" }],
    [{ password: "password2" }],
  ]);
});

test("login maps invalid credentials to 401", async () => {
  const client = clientWith({
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { code: "invalid_credentials", message: "bad login", status: 400 } }),
  });
  await assert.rejects(() => loginUser(client, "a@example.com", "wrongpass"), (error: unknown) => error instanceof HttpError && error.status === 401);
});

test("requireUser trusts getUser after refresh and cleanly rejects an expired session", async () => {
  const refreshed = clientWith({
    getUser: async () => ({ data: { user: { id: "user-1", email: "a@example.com" } }, error: null }),
  });
  assert.deepEqual(await requireUser(refreshed), { id: "user-1", email: "a@example.com" });

  const expired = clientWith({
    getUser: async () => ({ data: { user: null }, error: { message: "expired", status: 401 } }),
  });
  await assert.rejects(() => requireUser(expired), (error: unknown) => error instanceof HttpError && error.status === 401);
});

test("logout clears the auth state and cookies use secure server-only defaults", async () => {
  let signedOut = false;
  const client = clientWith({ signOut: async () => { signedOut = true; return { error: null }; } });
  await logoutUser(client);
  assert.equal(signedOut, true);
  assert.deepEqual(authCookieOptions(true), { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
  assert.deepEqual(authCookieOptions(false), { httpOnly: true, secure: false, sameSite: "lax", path: "/" });
});

test("account invitation mapping exposes card fields but no private hashes", () => {
  const dto = toAccountInvitation({
    id: "inv-1",
    slug: "minh-an",
    template_id: "song-hy",
    published: true,
    updated_at: "2026-09-26T10:00:00Z",
    content: {
      v: 1,
      paletteKey: "do",
      couple: { groom: { name: "Minh" }, bride: { name: "An" } },
      events: [{ date: "2026-12-20" }],
    },
    edit_key_hash: "must-not-leak",
  });

  assert.deepEqual(dto, {
    id: "inv-1",
    slug: "minh-an",
    templateId: "song-hy",
    published: true,
    updatedAt: "2026-09-26T10:00:00Z",
    groomName: "Minh",
    brideName: "An",
    weddingDate: "2026-12-20",
    paletteKey: "do",
  });
  assert.equal("editKeyHash" in dto, false);
});
