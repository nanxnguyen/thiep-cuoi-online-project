// Pure schema.org builders (one place, tested). Paths are site-relative; `base` is SITE_URL, passed in so this stays
// free of env access and runs under plain Node in tests.
type Crumb = { name: string; path?: string };
const abs = (base: string, path: string) => `${base}${path === "/" ? "" : path}`;
// Callers may pass a site-relative path ("/photos/a.jpg") or an already-absolute URL; never double-prefix.
const toAbs = (base: string, value: string) => (value.startsWith("http") ? value : abs(base, value.startsWith("/") ? value : `/${value}`));

// Absolute URL of the site logo (public/logo.png). Single source so Organization and publisher markup agree.
export function logoUrl(base: string) {
  return abs(base, "/logo.png");
}

// Shared publisher logo ImageObject (Google requires a logo for Article rich results).
export function publisherLogo(base: string) {
  return { "@type": "ImageObject", url: logoUrl(base) };
}

// The last crumb is the current page; Google wants its `item` omitted or equal to the page URL.
export function breadcrumbList(base: string, trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, ...(c.path ? { item: abs(base, c.path) } : {}) })),
  };
}

export function itemList(base: string, items: { name: string; path: string; image?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: abs(base, it.path), ...(it.image ? { image: toAbs(base, it.image) } : {}) })),
  };
}

// One article. Author and publisher are the site itself (Organization), never an invented person.
export function blogPosting(base: string, post: { slug: string; title: string; description: string; date: string; updated: string; cover?: { src: string } }) {
  const url = abs(base, `/blog/${post.slug}`);
  const org = { "@type": "Organization", name: "MỘC Wedding", url: abs(base, "/") };
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.date,
    dateModified: post.updated,
    inLanguage: "vi-VN",
    image: abs(base, post.cover?.src ?? "/og.png"),
    author: org,
    publisher: { ...org, logo: publisherLogo(base) },
  };
}

// One template (or the launch offer) as a Product with a free Offer. `image`/`url` accept site-relative
// paths or absolute URLs. `relatedUrls` is optional and omitted when there is nothing real to link.
export function product(base: string, p: { name: string; description: string; image: string; url: string; relatedUrls?: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: toAbs(base, p.image),
    brand: { "@type": "Brand", name: "MỘC Wedding" },
    ...(p.relatedUrls?.length ? { isRelatedTo: p.relatedUrls.map((u) => toAbs(base, u)) } : {}),
    offers: {
      "@type": "Offer",
      url: toAbs(base, p.url),
      price: "0",
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
  };
}

// Free browser tools: price 0, no install. WebApplication is the type Google documents for in-browser apps.
export function webApplication(base: string, app: { name: string; path: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: app.name,
    url: abs(base, app.path),
    description: app.description,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    inLanguage: "vi-VN",
    offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
  };
}
