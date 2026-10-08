// Vietnamese accent-insensitive matching, shared by admin search (JS side).
// The SQL mirror lives in supabase/migrations/202610090001_admin.sql
// (`search_norm` generated columns via translate() over the same mapping
// applied to lower()ed text). Keep both mappings identical: every char in
// VI_ACCENT_FROM maps positionally to VI_ACCENT_TO. `đ` is listed explicitly
// because NFD does not decompose it.
export const VI_ACCENT_FROM =
  "áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ";
export const VI_ACCENT_TO =
  "a".repeat(17) +
  "e".repeat(11) +
  "i".repeat(5) +
  "o".repeat(17) +
  "u".repeat(11) +
  "y".repeat(5) +
  "d";

// Lowercase, strip combining marks (U+0300-U+036F), fold đ → d. ASCII passes
// through unchanged, so it is safe to apply to already-plain queries.
export function normalizeVi(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}
