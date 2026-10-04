# Template asset audit — 30 new templates

Source of truth for provenance and license of every production asset used by the
30 new invitation templates. Runtime manifest: `lib/template-assets.ts`
(gate: `tests/template-assets.test.ts`).

## Statuses

- `owned` — provided by the project owner, ownership confirmed. Shippable.
- `licensed` — licensed for use in this product; `licenseNote` names the license/ref. Shippable.
- `original` — drawn/created in-house for this project (CSS/SVG). Shippable.
- `reference-only` — analysis only. Never copy into `public/`.

## Default state

All 51 snapshots under `refs/` (20 Chung Đôi, 30 M-Invite, 1 catalog page) are
`reference-only` by default. Being inside `refs/` never proves reuse rights.

## Per-family log

| Family | Asset | Source | Status | License note |
|---|---|---|---|---|
| ink-wash | ink mist + mountains + brush ring (inline SVG filters; 囍 glyph) | drawn in-house | original | — |
| phoenix-fold | feather crest + scaled gatefold doors (inline SVG/CSS) | drawn in-house | original | — |
| lotus-scroll | lotus petals + bamboo rods + pond (inline SVG/CSS) | drawn in-house | original | — |
| porcelain-blue | tile pattern + scalloped plate (inline SVG) | drawn in-house | original | — |
| silk-knot | silk thread loops + bow (inline SVG) | drawn in-house | original | — |
| glasshouse | gable greenhouse + glazing bars + vine + pots (inline SVG/CSS) | drawn in-house | original | — |
| white-orchid | orchid branch + blooms symbol (inline SVG) | drawn in-house | original | — |
| pressed-garden | pressed sprigs + taped print + label (inline SVG/CSS) | drawn in-house | original | — |
| venue-sketch | pavilion line-art + bunting + trees (inline SVG) | drawn in-house | original | — |
| midnight-bloom | stars + layered peony + fireflies (inline SVG/CSS) | drawn in-house | original | — |
| edge-invite | outlined vertical words (CSS text stroke) | drawn in-house | original | — |
| mono-contact | contact sheet frames + grease-pencil mark (CSS/SVG) | drawn in-house | original | — |
| split-portrait | 40/60 split + seam names (CSS) | drawn in-house | original | — |
| pennant | bunting + swallow-tail pennant (inline SVG/CSS clip-path) | drawn in-house | original | — |
| duotone-script | duotone blend + handwriting (CSS blend modes) | drawn in-house | original | — |
| floral-monogram | initials + line-art bloom (inline SVG) | drawn in-house | original | — |
| octagon-frame | octagon clip + gold outlines + rays (inline SVG/CSS) | drawn in-house | original | — |
| champagne-line | flutes + bubbles + sparks (inline SVG/CSS) | drawn in-house | original | — |
| pearl-arch | pearl festoons + pearl ring (inline SVG) | drawn in-house | original | — |
| rose-cluster | drawn rose clusters (inline SVG) | drawn in-house | original | — |
| story-journal | ruled journal + spiral + tabs (CSS) | drawn in-house | original | — |
| route-map | city map + dashed route + pins (inline SVG) | drawn in-house | original | — |
| cafe-card | menu card + cup + coaster (inline SVG/CSS) | drawn in-house | original | — |
| overlap-rings | intersecting circles + multiply blend (CSS) | drawn in-house | original | — |
| floating-card | lattice pattern + floating card (inline SVG/CSS) | drawn in-house | original | — |
| kinetic-type | oversized sliding type + outlined numeral (CSS) | drawn in-house | original | — |
| color-block | flat colour field + gold disc + arch photo (CSS) | drawn in-house | original | — |
| chibi-story | chibi couple + bubble (inline SVG/CSS) | drawn in-house | original | — |
| paper-cut | stacked arched sheets + sprigs (CSS/SVG) | drawn in-house | original | — |
| constellation | date-seeded star map + orbit (inline SVG) | drawn in-house | original | — |

Sample photos under `public/photos/` predate this phase and are reused as
showcase placeholders only; no `refs/` image, pattern or copy was copied.
No files exist under `public/templates/`, so `TEMPLATE_ASSETS` stays empty —
all batch-1 ornaments ship as inline CSS/SVG.

## Rules

- Production assets live only under `public/templates/<family>/` with semantic
  names; never keep scraper hash filenames.
- Never import production code directly from `refs/`.
- Raster images ship as WebP/AVIF; SVGs are scanned for scripts/external refs.
- Every file under `public/templates/` must have exactly one manifest entry.
