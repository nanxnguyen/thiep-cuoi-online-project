# SEO optimization: design

Date: 2026-09-30. Domain: `https://taothiepcuoi.raystudio.com.vn` (Cloudflare Workers, OpenNext).

## Goal and scope

- Goal: organic traffic from keywords ("thiệp cưới online", "tạo thiệp cưới miễn phí", "mẫu thiệp cưới", "QR mừng cưới"...).
- Scope: optimize existing public pages only. No blog, no new landing pages, no hreflang (`?lang=` is a query, not a page), no off-page work.
- Constraint: no layout/colour change (design parity 100% with `design/`). Only copy, semantic tags, metadata, structured data, infra.

## Finding that blocks everything (checked 2026-09-30)

The live domain serves `canonical`, `sitemap.xml`, `robots.txt` Sitemap line and OG URLs pointing at `thiep-cuoi-online.nguyenvtt18.workers.dev`, because `NEXT_PUBLIC_SITE_URL` is baked at build time and the last build used the workers.dev value. The workers.dev host is also still publicly reachable (duplicate content). `http://` returns 200 without redirecting to https.

## Phases

### Phase 0: Domain and infra (do first, ~1 deploy)
1. Set `NEXT_PUBLIC_SITE_URL=https://taothiepcuoi.raystudio.com.vn` in `wrangler.jsonc` vars and the build env. Rebuild and deploy (`NEXT_PUBLIC_SITE_URL=... npm run build && npx wrangler deploy`).
2. Add the new hostname in Turnstile widget `thiep-cuoi-production` (server checks `hostname === SITE_URL hostname`, otherwise wishes/RSVP fail with 403).
3. Stop workers.dev from being a second indexable host: disable `workers_dev` in `wrangler.jsonc` (`"workers_dev": false`) or 301 it to the custom domain. Add a Cloudflare rule: http→https (Always Use HTTPS) and www→apex 301 (only if a www record exists).
4. Update `DEPLOY.md` section 4c and the `netlify.toml` redirect note with the new domain.
5. Verify with curl: canonical, sitemap `<loc>`, robots `Sitemap:` all use the new host; workers.dev no longer serves 200 pages.
6. Search Console: add the new domain property (the existing verification file/meta is for the old host), submit `sitemap.xml`.

### Phase 1: Sitemap, robots, manifest, test guard
- `app/sitemap.ts`: replace `lastModified = new Date()` (changes every request) with fixed per-page dates; keep `/ung-ho` and `/demo` (owner decision 2026-09-30).
- Add `app/manifest.ts`.
- New `tests/seo.test.ts`: every route in the sitemap has a title ≤ 60 chars, description 70–160 chars, a canonical equal to its own path, and titles/descriptions are unique across pages.
- `/invite/*`, `/studio`, `/account` return `noindex` in metadata (not only in robots.txt).

### Phase 2: Metadata per page
- One primary keyword per page (table below), title ≤ 60, description 70–160, no duplicates.
- `/templates/[id]`: per-template Open Graph image (`opengraph-image.tsx` or the template preview) plus title/description with template name and style.
- Home OG/Twitter image stays `og.png` (1200×630).

| Page | Primary keyword |
|---|---|
| `/` | thiệp cưới online |
| `/thiep-cuoi-online-mien-phi` | thiệp cưới online miễn phí |
| `/tao-thiep-cuoi` | tạo thiệp cưới online |
| `/templates`, `/templates/[id]` | mẫu thiệp cưới online |
| `/qr-tien-mung` | QR mừng cưới |
| `/tin-nhan-moi-cuoi` | lời mời cưới hay |
| `/cong-cu-dam-cuoi` | công cụ đám cưới |
| `/cong-cu/*` | one tool keyword each (tạo QR thiệp cưới, nén ảnh cưới...) |
| `/bang-gia`, `/demo`, `/tro-giup` | brand + intent (giá, xem thử, hướng dẫn) |

### Phase 3: Structured data
- One helper in `lib/` (with test) building JSON-LD; `JsonLd` component unchanged.
- `Organization` + `WebSite` on home; `BreadcrumbList` on every non-home page; `FAQPage` on `/tro-giup` and the 4 landings (reuse `FaqList`); `ItemList` on `/templates`; `SoftwareApplication` on `/cong-cu/*`.
- Validate with Google Rich Results Test on the live domain.

### Phase 4: On-page content
- Exactly one `h1` per page containing the primary keyword; sensible `h2/h3` order; meaningful `alt` on images.
- Internal links between the 4 landings, tools and template pages (start from `lib/navigation.ts` / `route-inventory`).
- Output: the keyword ↔ page table above kept up to date, one keyword per page to avoid cannibalization.

### Phase 5: Performance and crawlability
- View-source check: server HTML contains the real text (Motion veil and `ScrollReveal` must not hide content from crawlers).
- Mobile Lighthouse on every touched route (LCP for hero / `ThiepPreview`, CLS, font loading).
- After launch: Search Console coverage and queries for 4 weeks; adjust titles by CTR.

## Testing and done criteria
- `npm test`, `npm run typecheck`, `npm run build` green; new `tests/seo.test.ts` passes.
- Live curl checks from Phase 0 pass; Rich Results Test passes for home, `/tro-giup`, one template.
- Lighthouse mobile SEO score ≥ 95 on touched routes.

## Owner inputs needed
- Cloudflare access to: Turnstile hostname, Always Use HTTPS, workers.dev toggle.
- Search Console access for the new property.
