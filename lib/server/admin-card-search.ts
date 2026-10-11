import { templates } from "../templates.ts";
import { normalizeVi } from "../vietnamese.ts";

// PostgREST filter value for the admin cards search. The value passes through
// TWO unescape layers: PostgREST's quoted-string parser first (`\\` → `\`,
// `\"` → `"`), then Postgres LIKE (`\%`, `\_`, `\\` = literals). So LIKE
// specials are escaped first, then the result is escaped again for the quoted
// string — otherwise `%` and `_` in the search box act as wildcards.
// `*` is PostgREST's own alias for `%` and cannot be escaped, so it is dropped.
export function escapeLikePattern(value: string): string {
  return value
    .replace(/\*/g, " ")
    .replace(/[\\%_]/g, "\\$&")
    .replace(/[\\"]/g, "\\$&");
}

// Ids of catalog templates whose display name matches the folded query, so
// typing "song hy" finds template_id "song-hy" (search_norm only has the id).
export function matchingTemplateIds(foldedQuery: string): string[] {
  return templates
    .filter((template) => normalizeVi(template.name).includes(foldedQuery) && /^[a-z0-9-]+$/.test(template.id))
    .map((template) => template.id);
}

// Accent-insensitive: q is folded with normalizeVi() and matched against the
// `search_norm` generated column (migration 202610090001_admin). The result is
// the argument of `.or()`; q is always bound as a quoted filter value.
export function buildCardSearchOr(q: string): string {
  const folded = normalizeVi(q);
  const clauses = [`search_norm.ilike."*${escapeLikePattern(folded)}*"`];
  const ids = matchingTemplateIds(folded);
  if (ids.length > 0) clauses.push(`template_id.in.(${ids.join(",")})`);
  return clauses.join(",");
}
