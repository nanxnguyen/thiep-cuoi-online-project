// Pure schema.org builders (one place, tested). Paths are site-relative; `base` is SITE_URL, passed in so this stays
// free of env access and runs under plain Node in tests.
type Crumb = { name: string; path?: string };
const abs = (base: string, path: string) => `${base}${path === "/" ? "" : path}`;

// The last crumb is the current page; Google wants its `item` omitted or equal to the page URL.
export function breadcrumbList(base: string, trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, ...(c.path ? { item: abs(base, c.path) } : {}) })),
  };
}

export function itemList(base: string, items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: abs(base, it.path) })),
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
    publisher: org,
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
