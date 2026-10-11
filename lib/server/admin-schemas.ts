import { z } from "zod";

// Shared zod contracts for /api/admin/* (§5 of the admin spec). Slices parse
// GET query strings with the *Query schemas (searchParams values are
// string | null) and mutation bodies with parseJson + the *Patch schemas.

export const ADMIN_STYLES = ["Truyền thống", "Tối giản", "Hoa", "Cổ điển", "Lãng mạn", "Hiện đại"] as const;
export const ADMIN_BADGES = ["", "MỚI", "HOT"] as const;
export type AdminStyle = (typeof ADMIN_STYLES)[number];
export type AdminBadge = (typeof ADMIN_BADGES)[number];

export const adminLoginSchema = z.object({
  email: z.email("Email không hợp lệ.").max(254, "Email quá dài."),
  password: z.string().min(1, "Nhập mật khẩu.").max(128, "Mật khẩu quá dài."),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// page/perPage arrive as strings; garbage falls back to defaults and perPage
// is clamped to 1..50 (§8.6) instead of erroring, so huge/negative values
// return an (empty) page rather than a 500.
const pageSchema = z.coerce.number().int().min(1).catch(1);
const perPageSchema = z.coerce
  .number()
  .finite()
  .catch(8)
  .transform((v) => Math.min(50, Math.max(1, Math.floor(v))));
// Empty q means "no search"; a present q must be 2..80 chars after trimming.
const searchSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : (v ?? "")),
  z
    .string()
    .max(80)
    .refine((v) => v.length === 0 || v.length >= 2, {
      message: "Từ khoá tìm kiếm cần ít nhất 2 ký tự.",
    }),
);

// Unknown enum values must 400 (fuzz matrix §9), while a missing/blank
// filter falls back to "all".
function statusFilter<T extends [string, ...string[]]>(values: T) {
  return z.preprocess((v) => (v == null || v === "" ? values[0] : v), z.enum(values));
}

export const adminUsersQuerySchema = z.object({
  page: pageSchema,
  perPage: perPageSchema,
  q: searchSchema,
  status: statusFilter(["all", "active", "suspended"]),
});
export type AdminUsersQuery = z.infer<typeof adminUsersQuerySchema>;

export const adminCardsQuerySchema = z.object({
  page: pageSchema,
  perPage: perPageSchema,
  q: searchSchema,
  status: statusFilter(["all", "published", "draft", "reported"]),
});
export type AdminCardsQuery = z.infer<typeof adminCardsQuerySchema>;

const TEMPLATE_STYLE_FILTER_VALUES: [string, ...string[]] = ["all", ...ADMIN_STYLES];
export const adminTemplatesQuerySchema = z.object({
  page: pageSchema,
  perPage: perPageSchema,
  q: searchSchema,
  style: statusFilter(TEMPLATE_STYLE_FILTER_VALUES),
});
export type AdminTemplatesQuery = z.infer<typeof adminTemplatesQuerySchema>;

export const adminUserPatchSchema = z.object({
  action: z.enum(["ban", "unban"]),
});
export type AdminUserPatch = z.infer<typeof adminUserPatchSchema>;

const atLeastOneField = { message: "Cần ít nhất một trường để cập nhật." };

export const adminCardPatchSchema = z
  .object({
    published: z.boolean().optional(),
    is_flagged: z.boolean().optional(),
  })
  .refine((v) => v.published !== undefined || v.is_flagged !== undefined, atLeastOneField);
export type AdminCardPatch = z.infer<typeof adminCardPatchSchema>;

export const adminTemplatePatchSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    style: z.enum(ADMIN_STYLES).optional(),
    badge: z.enum(ADMIN_BADGES).optional(),
    hidden: z.boolean().optional(),
  })
  .refine(
    (v) => v.name !== undefined || v.style !== undefined || v.badge !== undefined || v.hidden !== undefined,
    atLeastOneField,
  );
export type AdminTemplatePatch = z.infer<typeof adminTemplatePatchSchema>;
