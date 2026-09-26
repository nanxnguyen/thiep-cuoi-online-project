import type { SupabaseClient } from "@supabase/supabase-js";
import { contentSchema, normalizeContent, publishIssues, type Content } from "../content.ts";
import type { CreatedInvitation, InvitationDto, PublicInvitationDto } from "../api.ts";
import { isValidSlug, randomSlug } from "../slug.ts";
import { createEditKey, hashEditKey, requireInvitationAccess, type InvitationAccessRow } from "./edit-key.ts";
import { HttpError } from "./http.ts";
import { toAccountInvitation } from "./auth.ts";

type InvitationRow = InvitationAccessRow & {
  slug: string;
  template_id: string;
  content: Content;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type InvitationPatch = { templateId?: string; content?: Content; slug?: string; published?: boolean };

export function toInvitationDto(row: Omit<InvitationRow, "owner_id" | "edit_key_hash"> & Partial<Pick<InvitationRow, "owner_id" | "edit_key_hash">>): InvitationDto {
  return {
    id: row.id,
    slug: row.slug,
    templateId: row.template_id,
    content: normalizeContent(row.content),
    published: row.published,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
  };
}

export function validateInvitationPatch(
  current: { templateId: string; content: Content; slug: string; published: boolean },
  patch: InvitationPatch,
) {
  const content = contentSchema.safeParse(patch.content ?? current.content);
  if (!content.success) throw new HttpError(400, content.error.issues[0]?.message ?? "Nội dung thiệp chưa hợp lệ.");
  const slug = patch.slug ?? current.slug;
  if (!isValidSlug(slug)) throw new HttpError(400, "Đường dẫn thiệp chưa hợp lệ.");
  const templateId = patch.templateId ?? current.templateId;
  if (!templateId || templateId.length > 80) throw new HttpError(400, "Mẫu thiệp chưa hợp lệ.");
  const published = patch.published ?? current.published;
  if (published) {
    const issues = publishIssues(content.data);
    if (issues.length) throw new HttpError(400, issues[0]);
  }
  return { templateId, content: content.data, slug, published };
}

export async function createInvitation(client: SupabaseClient, templateId: string, input: unknown): Promise<CreatedInvitation> {
  const content = contentSchema.safeParse(input);
  if (!content.success || !templateId || templateId.length > 80) throw new HttpError(400, "Thông tin thiệp chưa hợp lệ.");
  const key = createEditKey();
  const editKeyHash = await hashEditKey(key);
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await client
      .from("invitations")
      .insert({ slug: randomSlug(), template_id: templateId, content: content.data, edit_key_hash: editKeyHash })
      .select("id,slug")
      .single();
    if (!error && data) return { id: data.id, slug: data.slug, key };
    if (error?.code !== "23505") throw new HttpError(500, "Chưa tạo được thiệp.");
  }
  throw new HttpError(409, "Chưa tạo được đường dẫn thiệp, bạn thử lại nhé.");
}

export async function getInvitation(client: SupabaseClient, id: string, editKey?: string, userId?: string): Promise<InvitationDto> {
  return toInvitationDto(await requireInvitationAccess({ client, id, editKey, userId }) as InvitationRow);
}

export async function updateInvitation(
  client: SupabaseClient,
  id: string,
  patch: InvitationPatch,
  editKey?: string,
  userId?: string,
): Promise<InvitationDto> {
  const row = await requireInvitationAccess({ client, id, editKey, userId }) as InvitationRow;
  const next = validateInvitationPatch(
    { templateId: row.template_id, content: row.content, slug: row.slug, published: row.published },
    patch,
  );
  // Slug đẹp dễ đoán ("phan-duy...") nên trùng là chuyện thường: tự thêm hậu tố
  // ngẫu nhiên thay vì bắt chủ thiệp đoán tên khác. DTO trả về slug cuối cùng.
  const candidates = [next.slug];
  if (patch.slug && patch.slug !== row.slug) {
    for (let i = 0; i < 3; i++) {
      const stem = next.slug.length > 35 ? next.slug.slice(0, 35).replace(/-+$/, "") : next.slug;
      const alt = `${stem}-${randomSlug().slice(0, 4)}`;
      if (isValidSlug(alt)) candidates.push(alt);
    }
  }
  for (const slug of candidates) {
    const { data, error } = await client.from("invitations").update({
      template_id: next.templateId,
      content: next.content,
      slug,
      published: next.published,
      published_at: next.published && !row.published ? new Date().toISOString() : row.published_at,
    }).eq("id", id).select("*").single();
    if (!error && data) return toInvitationDto(data as InvitationRow);
    if (error?.code !== "23505") throw new HttpError(500, "Chưa lưu được thiệp.");
  }
  throw new HttpError(409, "Đường dẫn thiệp đã được dùng, bạn đổi tên khác nhé.");
}

export async function claimInvitation(client: SupabaseClient, id: string, editKey: string) {
  const { data, error } = await client.rpc("claim_invitation", { p_id: id, p_edit_key_hash: await hashEditKey(editKey) }).single();
  if (error?.code === "P0002") throw new HttpError(404, "Không tìm thấy nội dung này.");
  if (error?.code === "42501") throw new HttpError(403, "Link chỉnh sửa không đúng.");
  if (error?.code === "23505") throw new HttpError(409, "Thiệp đã thuộc tài khoản khác.");
  if (error || !data) throw new HttpError(500, "Chưa nhận được thiệp vào tài khoản.");
  return toAccountInvitation(data as Parameters<typeof toAccountInvitation>[0]);
}

export async function getPublicInvitation(client: SupabaseClient, slug: string): Promise<PublicInvitationDto | null> {
  const { data: invitation, error } = await client
    .from("invitations")
    .select("id,slug,template_id,content")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new HttpError(500, "Chưa tải được thiệp.");
  if (!invitation) return null;

  const { data: wishes, error: wishesError } = await client
    .from("wishes")
    .select("id,name,message,created_at")
    .eq("invitation_id", invitation.id)
    .eq("approved", true)
    .eq("hidden", false)
    .order("created_at", { ascending: true });
  if (wishesError) throw new HttpError(500, "Chưa tải được lời chúc.");
  return {
    id: invitation.id,
    slug: invitation.slug,
    templateId: invitation.template_id,
    content: normalizeContent(invitation.content),
    wishes: (wishes ?? []).map((wish) => ({
      id: wish.id,
      name: wish.name,
      message: wish.message,
      createdAt: wish.created_at,
    })),
  };
}
