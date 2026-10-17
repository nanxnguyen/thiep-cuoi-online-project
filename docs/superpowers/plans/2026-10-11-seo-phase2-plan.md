# SEO Phase 2 (Trust Signals) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Phase 2 SEO items from the audit action plan that are codeable *without* fabricating identity, reviews, or an author persona — contact/about infra, per-template Offer schema's sibling (Organization contactPoint/sameAs), per-post OG images, and a `/bang-gia` word-count top-up — and explicitly park the items that still need an owner decision instead of silently skipping them.

**Architecture:** Reuse the existing "env-gated optional field" pattern already in `lib/site.ts` (`CONTACT_ZALO`: empty until the owner sets the env var, then the UI reveals it) for every new identity field (email already exists, add phone/address/socials). Add one `organization()` builder to `lib/jsonld.ts` next to the existing builders. New `/ve-moc` page follows the `/blog` precedent: no `design/*.dc.html` mockup exists for it, so it is built from `app/styles/tokens.css` + the shared marketing primitives (`MarketingLayout`, `FaqList`-style primitives) and logged in `DESIGN.md` as a no-mockup page, same footnote style already used for blog.

**Tech Stack:** Next.js 16 App Router, TypeScript (erasable, no enums/parameter properties — `lib/` files run under plain `node --test`), existing `lib/jsonld.ts` / `lib/seo.ts` / `lib/site.ts` / `lib/navigation.ts` / `lib/route-inventory.ts`.

**Spec:** No formal spec doc exists for this phase; the audit is the spec: `qa-evidence/seo-audit-20261009/FULL-AUDIT-REPORT.md` (Health 72/100, issues #2–#5) and `qa-evidence/seo-audit-20261009/ACTION-PLAN.md` (Phase 2 items #11, #13, #14; Phase 3 items #15–18 and Phase 2 item #12 are explicitly **not** covered by this plan — see "Not planned here" at the end).

## Global Constraints

- Vietnamese UI copy; code/commits/comments in English (project convention, `CLAUDE.md`).
- **Never fabricate** a contact value, review, testimonial, or author identity (`CLAUDE.md` "Agent không tự sửa văn bản pháp lý" + the audit's own "Gaps requiring owner input" list + the existing code comment in `lib/jsonld.ts:35` — "Author and publisher are the site itself (Organization), **never an invented person**"). Every new identity field ships empty/hidden until the owner supplies the real value via env var — exactly the `CONTACT_ZALO` pattern already in `lib/site.ts:16`.
- No new dependency; everything here is a few lines in existing `lib/` modules + one new page.
- `node --test` runs TypeScript with native erasable-syntax stripping: no enums, no parameter properties; new `lib/` files imported by tests use relative imports with an explicit `.ts` extension (not `@/`).
- Agent does not run `git commit` (permission layer blocks it) — each task ends with a "stage + command for the owner" step instead of an actual commit.
- A page with no matching `design/*.dc.html` mockup (this plan's `/ve-moc`) is built from tokens/primitives and the deviation is logged in `DESIGN.md`, same as `/blog` (`PROGRESS.md` line 83). Do not add new sections to pages that *do* have a mockup (`/bang-gia`, `/templates/[id]`) beyond what already exists in this plan's Task 4 — anything larger than that is a design decision, parked at the end.
- Full gate before calling any task done: `npm test`, `npm run typecheck`, `npm run build:next`.

---

### Task 1: Organization identity env vars + `organization()` schema builder

**Files:**
- Modify: `lib/site.ts` (add `CONTACT_PHONE`, `CONTACT_ADDRESS`, `SOCIAL_URLS`)
- Modify: `lib/jsonld.ts` (add `organization()`)
- Modify: `.env.example` (document the 3 new optional vars)
- Test: `tests/jsonld.test.ts`, `tests/site.test.ts` (create if it doesn't exist — check first: `ls tests/site.test.ts`)

**Interfaces:**
- Produces: `organization(base: string, opts?: { phone?: string; address?: string; sameAs?: string[] }) => object` — a schema.org `Organization` with `name: "MỘC Wedding"`, `url`, `logo` (reuses `publisherLogo(base)`), and only includes `contactPoint`/`address`/`sameAs` keys when the corresponding value is non-empty/non-undefined.
- Consumes: `publisherLogo`, `abs`-style absolutising already in `lib/jsonld.ts` (reuse `logoUrl`/`publisherLogo`, don't duplicate the URL join logic).

- [ ] **Step 1: Write the failing tests**

```ts
// tests/jsonld.test.ts — append
test("organization omits contactPoint/address/sameAs when not provided, includes them when given", () => {
  const bare = organization(B);
  assert.equal(bare["@type"], "Organization");
  assert.equal(bare.name, "MỘC Wedding");
  assert.equal(bare.url, "https://x.vn");
  assert.equal(bare.logo["@type"], "ImageObject");
  assert.equal("contactPoint" in bare, false);
  assert.equal("address" in bare, false);
  assert.equal("sameAs" in bare, false);

  const full = organization(B, { phone: "+84900000000", address: "Hà Nội, Việt Nam", sameAs: ["https://facebook.com/mocwedding"] });
  assert.equal(full.contactPoint.telephone, "+84900000000");
  assert.equal(full.contactPoint["@type"], "ContactPoint");
  assert.equal(full.address, "Hà Nội, Việt Nam");
  assert.deepEqual(full.sameAs, ["https://facebook.com/mocwedding"]);
});
```

```ts
// tests/site.test.ts — new file
import { test } from "node:test";
import assert from "node:assert/strict";
import { contactPhone, contactAddress, socialUrls } from "../lib/site.ts";

test("contactPhone/contactAddress are empty until the env var is set", () => {
  assert.equal(contactPhone({}), "");
  assert.equal(contactPhone({ NEXT_PUBLIC_CONTACT_PHONE: " +84900000000 " }), "+84900000000");
  assert.equal(contactAddress({}), "");
  assert.equal(contactAddress({ NEXT_PUBLIC_CONTACT_ADDRESS: "Hà Nội" }), "Hà Nội");
});

test("socialUrls parses a comma-separated list and drops empty entries", () => {
  assert.deepEqual(socialUrls({}), []);
  assert.deepEqual(socialUrls({ NEXT_PUBLIC_SOCIAL_URLS: "https://facebook.com/a, ,https://tiktok.com/@b" }), ["https://facebook.com/a", "https://tiktok.com/@b"]);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/jsonld.test.ts tests/site.test.ts`
Expected: FAIL — `organization`, `contactPhone`, `contactAddress`, `socialUrls` not exported.

- [ ] **Step 3: Implement**

`lib/site.ts` — add next to `CONTACT_ZALO` (keep the existing env-parsing style, pure functions so tests don't need `process.env`):

```ts
// Phone/address/social links shown on /ve-moc and in Organization schema. Empty/[] until the owner provides
// real values — same "hidden until set" pattern as CONTACT_ZALO above.
export function contactPhone(env: Record<string, string | undefined>): string {
  return (env.NEXT_PUBLIC_CONTACT_PHONE ?? "").trim();
}
export function contactAddress(env: Record<string, string | undefined>): string {
  return (env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "").trim();
}
export function socialUrls(env: Record<string, string | undefined>): string[] {
  return (env.NEXT_PUBLIC_SOCIAL_URLS ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

export const CONTACT_PHONE = contactPhone(process.env);
export const CONTACT_ADDRESS = contactAddress(process.env);
export const SOCIAL_URLS = socialUrls(process.env);
```

`lib/jsonld.ts` — add after `publisherLogo`:

```ts
// The business entity. Every identity field is optional and omitted when unset — never fabricate a phone,
// address or social link (see lib/site.ts: all three start empty until the owner sets the env var).
export function organization(base: string, opts?: { phone?: string; address?: string; sameAs?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MỘC Wedding",
    url: abs(base, "/"),
    logo: publisherLogo(base),
    ...(opts?.phone ? { contactPoint: { "@type": "ContactPoint", telephone: opts.phone, contactType: "customer support" } } : {}),
    ...(opts?.address ? { address: opts.address } : {}),
    ...(opts?.sameAs?.length ? { sameAs: opts.sameAs } : {}),
  };
}
```

`.env.example` — add under the existing `NEXT_PUBLIC_CONTACT_*` block:

```
NEXT_PUBLIC_CONTACT_PHONE=
NEXT_PUBLIC_CONTACT_ADDRESS=
NEXT_PUBLIC_SOCIAL_URLS=
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/jsonld.test.ts tests/site.test.ts`
Expected: PASS

- [ ] **Step 5: Stage (agent does not commit)**

```bash
git add lib/jsonld.ts lib/site.ts .env.example tests/jsonld.test.ts tests/site.test.ts
```
Give the owner: `git commit -m "feat(seo): add Organization contact schema, env-gated phone/address/social"`

---

### Task 2: `/ve-moc` about/trust page

**Files:**
- Create: `app/ve-moc/page.tsx`
- Create: `app/ve-moc/ve-moc.css` (or reuse `components/marketing/marketing.css` classes if they already cover this layout — check before adding new CSS)
- Modify: `lib/navigation.ts` (add a "Về MỘC" link to the `FOOTER_COLUMNS` "Sản phẩm" or a new column — pick the existing "Khám phá" column, it already holds `/blog`)
- Modify: `lib/route-inventory.ts` (add `/ve-moc` to `staticRoutes`)
- Modify: `DESIGN.md` (log the no-mockup deviation, same footnote style as `/blog`)
- Test: `tests/static-routes.test.ts` or `tests/seo.test.ts` (check which file asserts route-inventory coverage against `app/sitemap.ts` and extend it — don't create a parallel assertion)

**Interfaces:**
- Consumes: `organization` (Task 1), `CONTACT_EMAIL`/`contactPhone`/`contactAddress`/`socialUrls` from `lib/site.ts`, `pageMetadata`/`metadataFor` from `lib/seo.ts`, `MarketingLayout` from `components/marketing/MarketingLayout.tsx`.
- Produces: route `/ve-moc`, no new exports consumed by later tasks.

- [ ] **Step 1: Write the failing test**

First check how route-inventory completeness is currently tested:

```bash
grep -n "PUBLIC_ROUTES\|route-inventory" tests/*.test.ts
```

Add `/ve-moc` to whatever list that test already drives off `PUBLIC_ROUTES` (it will fail once Task 2's route-inventory edit lands if the sitemap/test pair doesn't already derive from the same array — if it does derive automatically, write this test instead, it's the one that matters for this task):

```ts
// tests/route-inventory.test.ts (or wherever PUBLIC_ROUTES is asserted) — append
test("/ve-moc is a static route", () => {
  assert.ok(PUBLIC_ROUTES.includes("/ve-moc"));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/route-inventory.test.ts` (or the actual file name found above)
Expected: FAIL — `/ve-moc` not in `PUBLIC_ROUTES`.

- [ ] **Step 3: Implement the page**

`lib/route-inventory.ts` — add `/ve-moc` to `staticRoutes` array (alphabetical slot next to `/ung-ho`).

`lib/navigation.ts` — add to the "Khám phá" column's `links` (same column that already holds `/blog`):
```ts
{ href: "/ve-moc", label: "Về MỘC" },
```

`app/ve-moc/page.tsx` — honest copy only; omit "since when" (unknown) rather than inventing a date; contact block renders nothing if all three contact fields are empty:

```tsx
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { organization } from "@/lib/jsonld";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_ADDRESS, SOCIAL_URLS, SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/marketing/JsonLd";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import "./ve-moc.css";

export const metadata: Metadata = pageMetadata("/ve-moc");

export default function AboutPage() {
  const hasContact = CONTACT_EMAIL || CONTACT_PHONE || CONTACT_ADDRESS;
  return (
    <MarketingLayout path="/ve-moc" name="Về MỘC">
      <ScrollReveal />
      <section className="vm-hero">
        <h1>MỘC làm thiệp cưới online, miễn phí toàn bộ.</h1>
        <p>
          MỘC là công cụ tạo thiệp cưới online: chọn mẫu, thêm ảnh và câu chuyện của hai bạn, gửi link cho khách qua Zalo.
          Khách xác nhận tham dự, viết lưu bút và mừng cưới ngay trên thiệp — không cần tải app, không cần tài khoản.
        </p>
      </section>
      <section className="vm-how">
        <h2>Vì sao miễn phí</h2>
        <p>
          Không có gói trả phí, không quảng cáo xen vào thiệp của khách. MỘC được duy trì bằng sự ủng hộ tự nguyện của
          những cặp đôi đã dùng — xem tại <a href="/ung-ho">trang Ủng hộ</a>.
        </p>
      </section>
      {hasContact && (
        <section className="vm-contact" aria-label="Liên hệ">
          <h2>Liên hệ</h2>
          <ul>
            {CONTACT_EMAIL && <li>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>}
            {CONTACT_PHONE && <li>Điện thoại: <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a></li>}
            {CONTACT_ADDRESS && <li>Địa chỉ: {CONTACT_ADDRESS}</li>}
          </ul>
        </section>
      )}
      <JsonLd data={organization(SITE_URL, { phone: CONTACT_PHONE || undefined, address: CONTACT_ADDRESS || undefined, sameAs: SOCIAL_URLS })} />
    </MarketingLayout>
  );
}
```

`app/ve-moc/ve-moc.css` — reuse `.mk-*`/token spacing from `components/marketing/marketing.css` (read it first; only add rules for `.vm-*` classes not already covered, following the same minimal-CSS pattern as the blog page per `DESIGN.md`).

`DESIGN.md` — append one line in whatever section documents the blog's no-mockup status:
```
- `/ve-moc`: no matching `design/*.dc.html` mockup (new page, SEO Phase 2). Built from tokens + the marketing primitives, same treatment as `/blog`.
```

- [ ] **Step 4: Run test to verify it passes, plus the full gate**

Run: `node --test tests/route-inventory.test.ts && npm run typecheck`
Expected: PASS

- [ ] **Step 5: Stage**

```bash
git add app/ve-moc lib/navigation.ts lib/route-inventory.ts DESIGN.md tests/route-inventory.test.ts
```
Give the owner: `git commit -m "feat(seo): add /ve-moc about page with Organization schema"`

---

### Task 3: Per-post blog Open Graph image

**Files:**
- Modify: `app/blog/[slug]/page.tsx:23-32` (`generateMetadata`)
- Test: `tests/blog.test.ts` or `tests/seo.test.ts` (check which file tests blog metadata and extend it)

**Interfaces:**
- Consumes: `post.cover?.src` (already on the `Post` type in `lib/blog/index.ts` — confirm the field name with `grep -n "cover" lib/blog/index.ts` before writing the code below).
- Produces: nothing new consumed elsewhere.

**Context:** `app/templates/[id]/page.tsx:25-26` already sets a per-page `openGraph.images` override; the blog page currently does not (`app/blog/[slug]/page.tsx:30` only sets `type`/`publishedTime`/`modifiedTime`/`authors`), so every blog post shares the generic `/og.png` from `lib/seo.ts:66`. This task applies the same override already used for templates.

- [ ] **Step 1: Write the failing test**

```ts
// append to whichever test file already imports generateMetadata for blog posts, or create tests/blog-seo.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";

test("blog post generateMetadata uses the post cover as its OG image, not the shared og.png", async () => {
  const mod = await import("../app/blog/[slug]/page.tsx");
  const meta = await mod.generateMetadata({ params: Promise.resolve({ slug: posts[0].slug }) });
  assert.ok(meta.openGraph?.images?.[0]?.url.includes(posts[0].cover?.src ?? "/og.png"));
});
```

(If importing a `page.tsx` directly under `node --test` doesn't work cleanly in this repo's test setup — check an existing test that imports a route file first; if none does, instead unit-test a small extracted helper, e.g. move the image-selection logic into `lib/blog.ts` as `postOgImage(post)` and test that pure function instead, keeping the route file as a thin caller.)

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/blog-seo.test.ts`
Expected: FAIL — OG image is `/og.png` regardless of post.

- [ ] **Step 3: Implement**

`app/blog/[slug]/page.tsx`:

```tsx
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const { title, description } = blogPostSeo(post);
  const meta = metadataFor(`/blog/${post.slug}`, title, description);
  const image = post.cover?.src ? `${SITE_URL}${post.cover.src}` : meta.openGraph?.images;
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      authors: ["MỘC Wedding"],
      ...(post.cover?.src ? { images: [{ url: image, width: 1200, height: 630, alt: title }] } : {}),
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/blog-seo.test.ts && npm run typecheck`
Expected: PASS

- [ ] **Step 5: Stage**

```bash
git add app/blog/\[slug\]/page.tsx tests/blog-seo.test.ts
```
Give the owner: `git commit -m "feat(seo): per-post OG image for blog posts"`

---

### Task 4: `/bang-gia` word-count top-up (149 → 400+ words)

**Files:**
- Modify: `app/bang-gia/page.tsx:30-43` (`PRICE_FAQ`), `:58` or a new paragraph near the hero
- Test: `tests/seo.test.ts` (check for an existing word-count assertion pattern before adding a new one)

**Context:** `app/bang-gia/page.tsx` already has hero copy + a 3-item `FaqList` (added in SEO Phase 1, see `PROGRESS.md` 2026-10-11 log entry). The audit's 149-word baseline predates that FAQ; this task adds one more paragraph and one more FAQ item reusing an existing `/tro-giup` answer, to clear 400 words with zero new design surface (same `FaqList`/`<section>` primitives already on the page).

- [ ] **Step 1: Write the failing test**

```ts
// tests/seo.test.ts — append
test("/bang-gia has at least 400 words of visible copy", () => {
  const src = readFileSync(new URL("../app/bang-gia/page.tsx", import.meta.url), "utf8");
  const strings = [...src.matchAll(/>([^<>{}]{3,})</g)].map((m) => m[1].trim()).filter(Boolean);
  const words = strings.join(" ").split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 400, `only ${words} words`);
});
```

(Adjust the regex to match whatever pattern `tests/seo.test.ts` already uses to count words on other pages — grep it first: `grep -n "words\|split(/\\\\s" tests/seo.test.ts`. Reuse that helper instead of writing a second one if it exists.)

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/seo.test.ts`
Expected: FAIL — current word count is below 400.

- [ ] **Step 3: Implement**

Add one FAQ item to `PRICE_FAQ` reusing an existing `/tro-giup` answer (check `lib/` or wherever the 31-question list lives — likely `app/tro-giup/page.tsx` — and copy one relevant Q&A verbatim rather than writing new facts):

```ts
const PRICE_FAQ: Faq[] = [
  // ...existing 3...
  {
    q: "MỘC kiếm tiền từ đâu nếu không bán gói trả phí?",
    a: "MỘC được duy trì nhờ ủng hộ tự nguyện từ các cặp đôi đã dùng, không chạy quảng cáo trong thiệp và không bán dữ liệu khách. Nếu thấy MỘC có ích, bạn có thể ủng hộ một khoản nhỏ ở trang Ủng hộ — hoàn toàn không bắt buộc.",
  },
];
```

Add one paragraph to the hero section (after the existing `<p>` at line 58):

```tsx
<p>
  Hai bạn dùng được ngay hôm nay: tạo thiệp, đổi mẫu, thêm ảnh và nhạc, gửi link riêng cho từng khách, nhận xác nhận
  tham dự và lời chúc, mừng cưới qua mã QR — không giới hạn số khách, không ẩn tính năng sau một bức tường trả phí.
</p>
```

- [ ] **Step 4: Run test to verify it passes, plus full gate**

Run: `node --test tests/seo.test.ts && npm run typecheck && npm run build:next`
Expected: PASS

- [ ] **Step 5: Stage**

```bash
git add app/bang-gia/page.tsx tests/seo.test.ts
```
Give the owner: `git commit -m "feat(seo): fatten /bang-gia copy past the 400-word thin-content threshold"`

---

## Not planned here — needs an owner decision first

| Action-plan # | Why it's parked |
|---|---|
| #12 Unique copy for 50 template pages | `app/templates/[id]` + `components/templates/TemplateDetailMain.tsx` render `design/Mau Thiep Chi Tiet.dc.html` value-for-value (`CLAUDE.md` 100%-fidelity rule). Adding a new copy section is a **layout change the design mockup doesn't have**, not just a content task — needs the owner (or a `design/` update) to say where it goes, plus 50×150-250 words of real product voice. Propose as its own plan once the owner picks a placement. |
| #14 Named blog authors | `lib/jsonld.ts:35` deliberately sets `author: org` — "never an invented person." Introducing a real named author is an identity decision only the owner can make; doing it from code risk is fabricating a persona, which `CLAUDE.md`/the audit both forbid. |
| #15 Cloudflare Always-HTTPS + HSTS | Dashboard toggle, not code. |
| #16 DNS `www → apex` redirect | DNS/dashboard change, not code. |
| #17 Search Console sitemap resubmit + indexing requests | Requires the owner's Search Console access. |
| #18 Google API key + OAuth, GBP verification | Requires owner-held credentials. |

Phase 4 (drift re-run after deploy, one PSI run, reviews program, cannibalization watch) stays as ongoing monitoring per `ACTION-PLAN.md` — not a one-time task, nothing to schedule here beyond re-running `seo-drift` after this plan's tasks deploy.
