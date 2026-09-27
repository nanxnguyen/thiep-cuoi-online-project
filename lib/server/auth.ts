import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { AccountInvitation, AccountUser, AuthResponse } from "../api.ts";
import { HttpError } from "./http.ts";

function userDto(user: User): AccountUser {
  if (!user.email) throw new HttpError(401, "Phiên đăng nhập không hợp lệ.");
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const avatarUrl = typeof metadata?.avatar_url === "string"
    ? metadata.avatar_url
    : typeof metadata?.picture === "string" ? metadata.picture : undefined;
  return avatarUrl && /^https:\/\//i.test(avatarUrl)
    ? { id: user.id, email: user.email, avatarUrl }
    : { id: user.id, email: user.email };
}

export async function registerUser(client: SupabaseClient, email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await client.auth.signUp({ email, password });
  if (error?.code === "user_already_exists" || error?.message.toLowerCase().includes("already registered")) {
    throw new HttpError(409, "Email này đã có tài khoản.");
  }
  if (error) throw new HttpError(error.status === 429 ? 429 : 400, error.message);
  if (!data.user) throw new HttpError(503, "Chưa tạo được tài khoản.");
  const user = userDto(data.user);
  return data.session
    ? { accessToken: data.session.access_token, user }
    : { user, emailConfirmationRequired: true };
}

export async function loginUser(client: SupabaseClient, email: string, password: string): Promise<AuthResponse> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) throw new HttpError(401, "Email hoặc mật khẩu chưa đúng.");
  return { accessToken: data.session.access_token, user: userDto(data.user) };
}

export async function requireUser(client: SupabaseClient): Promise<AccountUser> {
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) throw new HttpError(401, "Phiên đăng nhập đã hết hạn.");
  return userDto(data.user);
}

export async function logoutUser(client: SupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) throw new HttpError(400, "Chưa đăng xuất được, bạn thử lại nhé.");
}

export async function resendSignupEmail(client: SupabaseClient, email: string): Promise<void> {
  const { error } = await client.auth.resend({ type: "signup", email });
  if (error) throw new HttpError(error.status === 429 ? 429 : 400, "Chưa gửi lại được email xác minh.");
}

export async function resetPasswordEmail(client: SupabaseClient, email: string, redirectTo: string): Promise<void> {
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new HttpError(error.status === 429 ? 429 : 400, "Chưa gửi được email đặt lại mật khẩu.");
}

export async function updatePassword(client: SupabaseClient, password: string): Promise<void> {
  const { error } = await client.auth.updateUser({ password });
  if (error) throw new HttpError(401, "Liên kết đặt lại mật khẩu đã hết hạn.");
}

export async function startGoogleOAuth(client: SupabaseClient, redirectTo: string): Promise<string> {
  const { data, error } = await client.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  if (error || !data.url) throw new HttpError(400, "Chưa mở được đăng nhập Google.");
  return data.url;
}

export async function exchangeAuthCode(client: SupabaseClient, code: string): Promise<void> {
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) throw new HttpError(400, "Liên kết xác minh đã hết hạn hoặc không hợp lệ.");
}

type InvitationRow = {
  id: string;
  slug: string;
  template_id: string;
  published: boolean;
  updated_at: string;
  content: unknown;
};

export function toAccountInvitation(row: InvitationRow & Record<string, unknown>): AccountInvitation {
  const content = row.content && typeof row.content === "object" ? row.content as Record<string, unknown> : {};
  const couple = content.couple && typeof content.couple === "object" ? content.couple as Record<string, unknown> : {};
  const groom = couple.groom && typeof couple.groom === "object" ? couple.groom as Record<string, unknown> : {};
  const bride = couple.bride && typeof couple.bride === "object" ? couple.bride as Record<string, unknown> : {};
  const events = Array.isArray(content.events) ? content.events : [];
  const firstEvent = events[0] && typeof events[0] === "object" ? events[0] as Record<string, unknown> : {};
  return {
    id: row.id,
    slug: row.slug,
    templateId: row.template_id,
    published: row.published,
    updatedAt: row.updated_at,
    groomName: typeof groom.name === "string" ? groom.name : "",
    brideName: typeof bride.name === "string" ? bride.name : "",
    weddingDate: typeof firstEvent.date === "string" ? firstEvent.date : "",
    paletteKey: typeof content.paletteKey === "string" ? content.paletteKey : "",
  };
}

export async function listAccountInvitations(client: SupabaseClient, userId: string): Promise<AccountInvitation[]> {
  const { data, error } = await client
    .from("invitations")
    .select("id,slug,template_id,published,updated_at,content")
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw new HttpError(500, "Chưa tải được danh sách thiệp.");
  return (data ?? []).map((row) => toAccountInvitation(row as InvitationRow));
}
