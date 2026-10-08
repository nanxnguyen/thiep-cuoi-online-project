// Client-safe pure helpers for the templates slice. Kept in a JSX-free module
// (instead of inside TemplatesClient.tsx) so tests/admin-templates.test.ts can
// import them under plain node, and free of raw hex so the design-system guard
// (tests/design-system.test.ts) stays green: real colours come from
// lib/templates.ts at runtime, the unknown-id fallback uses theme tokens.

import { colors, getTemplate } from "../../lib/templates.ts";

// Client-safe mirror of ADMIN_STYLES (lib/server/admin-schemas.ts pulls zod,
// which must not ship to the admin bundle for a 6-item list). The unit test
// asserts the two lists stay identical.
export const TEMPLATE_STYLES = ["Truyền thống", "Tối giản", "Hoa", "Cổ điển", "Lãng mạn", "Hiện đại"] as const;
export type TemplateStyle = (typeof TEMPLATE_STYLES)[number];
export type TemplateBadge = "" | "MỚI" | "HOT";

const BADGE_CYCLE: readonly TemplateBadge[] = ["", "MỚI", "HOT"];

// Badge button cycles Thường → MỚI → HOT → Thường (design/Admin Mau Thiep.dc.html).
export function nextBadge(badge: TemplateBadge): TemplateBadge {
  return BADGE_CYCLE[(BADGE_CYCLE.indexOf(badge) + 1) % BADGE_CYCLE.length];
}

export function badgeLabel(badge: TemplateBadge): string {
  return badge === "" ? "Thường" : badge;
}

// Neutral 3-colour strip for ids unknown to the code catalog (spec §4: colours
// resolve client-side from lib/templates.ts, never stored in DB).
export const TEMPLATE_FALLBACK_STRIP: readonly [string, string, string] = [
  "var(--paper-alt)",
  "var(--line-strong)",
  "var(--muted)",
];

// The dải 3 màu card header: deep / paper / gold of the template's first colour.
export function templateStripColors(id: string): readonly [string, string, string] {
  const template = getTemplate(id);
  const key = template?.colors[0];
  const entry = key ? colors[key] : undefined;
  if (!entry) return TEMPLATE_FALLBACK_STRIP;
  return [entry.deep, entry.paper, entry.gold];
}
