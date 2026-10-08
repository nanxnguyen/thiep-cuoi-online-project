import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminList, AdminTemplateRow } from "../api.ts";
import type { AdminTemplatePatch, AdminTemplatesQuery } from "./admin-schemas.ts";
import { normalizeVi } from "../vietnamese.ts";
import { HttpError } from "./http.ts";

// Service layer for the templates slice (spec §5): thin API routes in
// app/api/admin/templates/* delegate here so the SQL mapping stays unit
// testable under plain node (routes import next/server and cannot).

export type TemplateRow = {
  id: string;
  name: string;
  style: string;
  badge: string;
  hidden: boolean;
  pop: number;
};

export function toAdminTemplateRow(row: TemplateRow): AdminTemplateRow {
  return {
    id: row.id,
    name: row.name,
    style: row.style,
    badge: row.badge === "MỚI" || row.badge === "HOT" ? row.badge : "",
    hidden: row.hidden,
    pop: row.pop,
  };
}

// LIKE wildcards in user input must match literally, not act as wildcards.
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export async function listAdminTemplates(
  admin: SupabaseClient,
  query: AdminTemplatesQuery,
): Promise<AdminList<AdminTemplateRow>> {
  const { page, perPage, q, style } = query;
  let select = admin.from("templates").select("id,name,style,badge,hidden,pop", { count: "exact" });
  if (style !== "all") select = select.eq("style", style);
  // Accent-insensitive: fold q and match the `search_norm` generated column
  // (migration 202610090001_admin), whose translate() mapping mirrors normalizeVi.
  if (q) select = select.ilike("search_norm", `%${escapeLike(normalizeVi(q))}%`);
  const from = (page - 1) * perPage;
  const { data, error, count } = await select
    .order("pop", { ascending: false })
    .order("id")
    .range(from, from + perPage - 1);
  if (error) throw new HttpError(500, "Chưa tải được danh sách mẫu thiệp.");
  const total = count ?? 0;
  return {
    items: ((data ?? []) as TemplateRow[]).map(toAdminTemplateRow),
    page,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
    total,
  };
}

export async function patchAdminTemplate(
  admin: SupabaseClient,
  id: string,
  patch: AdminTemplatePatch,
): Promise<AdminTemplateRow> {
  if (id.length < 1 || id.length > 80) throw new HttpError(400, "Mã mẫu thiệp không hợp lệ.");
  const { data: existing, error: readError } = await admin.from("templates").select("id").eq("id", id).maybeSingle();
  if (readError) throw new HttpError(500, "Chưa tải được mẫu thiệp này.");
  if (!existing) throw new HttpError(404, "Không tìm thấy mẫu thiệp này.");
  const { data, error } = await admin
    .from("templates")
    .update(patch)
    .eq("id", id)
    .select("id,name,style,badge,hidden,pop")
    .single();
  if (error || !data) throw new HttpError(500, "Chưa lưu được thay đổi mẫu thiệp.");
  return toAdminTemplateRow(data as TemplateRow);
}
