// /llms.txt (llmstxt.org): a plain Markdown map of the public site for AI assistants. Built from the same sources
// as the sitemap (SEO_PAGES, template registry, blog), so a new page shows up here without a second list.
import { posts } from "./blog/index.ts";
import { SEO_PAGES } from "./seo.ts";
import { templates } from "./templates.ts";

export function llmsTxt(base: string): string {
  const url = (path: string) => `${base}${path === "/" ? "" : path}`;
  const line = (title: string, path: string, note: string) => `- [${title}](${url(path)}): ${note}`;
  const pages = Object.entries(SEO_PAGES).filter(([path]) => path !== "/");
  return [
    "# MỘC Wedding",
    "",
    `> ${SEO_PAGES["/"].description.replace(/ →$/, "")}`,
    "",
    "Tiếng Việt. Thiệp của từng cặp đôi (/invite/), trang chỉnh sửa (/studio) và tài khoản là riêng tư, không được lập chỉ mục.",
    "",
    "## Trang chính",
    ...pages.map(([path, p]) => line(p.title, path, p.description)),
    "",
    "## Mẫu thiệp",
    ...templates.map((t) => line(`Mẫu thiệp cưới ${t.name}`, `/templates/${t.id}`, t.seo)),
    "",
    "## Blog",
    ...posts.map((p) => line(p.title, `/blog/${p.slug}`, p.description)),
    "",
  ].join("\n");
}
