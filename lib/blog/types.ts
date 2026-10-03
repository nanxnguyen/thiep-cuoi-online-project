// Blog content is typed data, not MDX: one renderer (components/blog/PostBody) turns blocks into markup.
// Paragraph/list/tip text may contain internal links as [label](/path); nothing else is interpreted.
/** A photo served from public/. `w`/`h` are the file's real pixel size (next/image needs them); `focus` is the CSS
 *  object-position used when the photo is cropped, so faces stay in frame. */
export type PostImage = { src: string; w: number; h: number; alt: string; focus?: string };

export type Block =
  | { t: "img"; image: PostImage; caption?: string }
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "h3"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "tip"; title: string; text: string }
  | { t: "link"; href: string; label: string; text: string };

export type PostFaq = { q: string; a: string };

export type Post = {
  slug: string;
  /** Visible h1. */
  title: string;
  /** <title> text. The layout appends " | MỘC Wedding", so keep it within 46 characters. */
  metaTitle: string;
  /** Meta description, 70-160 characters. */
  description: string;
  category: string;
  /** Cover shown on the index and at the top of the article. */
  cover: PostImage;
  /** The one search phrase this article targets. */
  keyword: string;
  /** ISO dates (YYYY-MM-DD). `updated` feeds the sitemap and JSON-LD dateModified. */
  date: string;
  updated: string;
  excerpt: string;
  blocks: Block[];
  faq: PostFaq[];
  /** Slugs of related posts shown under the article. */
  related: string[];
};
