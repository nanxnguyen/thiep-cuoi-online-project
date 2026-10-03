import { JsonLd } from "./JsonLd";
import { breadcrumbList, itemList, webApplication } from "@/lib/jsonld";
import { SEO_PAGES } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type Parent = { name: string; path: string };

// Structured data for one indexable page: BreadcrumbList (Trang chủ > parents > this page), plus an ItemList
// (`list`) for hub pages or WebApplication (`app`) for the browser tools. Renders nothing visible.
export function PageJsonLd({ path, name, parents = [], list, app = false }: { path: string; name: string; parents?: Parent[]; list?: { name: string; path: string }[]; app?: boolean }) {
  const trail = [{ name: "Trang chủ", path: "/" }, ...parents, { name }];
  return (
    <>
      <JsonLd data={breadcrumbList(SITE_URL, trail)} />
      {list && <JsonLd data={itemList(SITE_URL, list)} />}
      {app && <JsonLd data={webApplication(SITE_URL, { name, path, description: SEO_PAGES[path].description })} />}
    </>
  );
}
