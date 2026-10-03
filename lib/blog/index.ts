import type { Block, Post } from "./types.ts";
import { post as cachLamThiepCuoiOnline } from "./posts/cach-lam-thiep-cuoi-online.ts";
import { post as cachVietLoiMoiCuoi } from "./posts/cach-viet-loi-moi-cuoi.ts";
import { post as mungCuoiBangQr } from "./posts/mung-cuoi-bang-qr.ts";
import { post as checklistChuanBiDamCuoi } from "./posts/checklist-chuan-bi-dam-cuoi.ts";
import { post as guiThiepCuoiTruocBaoLau } from "./posts/gui-thiep-cuoi-truoc-bao-lau.ts";
import { post as lapDanhSachKhachMoiCuoi } from "./posts/lap-danh-sach-khach-moi-cuoi.ts";

export type { Block, Post, PostFaq, PostImage } from "./types.ts";

// Newest first; ties broken by title so the order is stable.
export const posts: readonly Post[] = [
  cachLamThiepCuoiOnline,
  cachVietLoiMoiCuoi,
  mungCuoiBangQr,
  checklistChuanBiDamCuoi,
  guiThiepCuoiTruocBaoLau,
  lapDanhSachKhachMoiCuoi,
].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "vi"));

export const getPost = (slug: string): Post | undefined => posts.find((p) => p.slug === slug);

export const blogPostSeo = (p: Post): { title: string; description: string } => ({ title: p.metaTitle, description: p.description });

// "Chọn mẫu thiệp" -> "chon-mau-thiep". Unlike lib/slug.ts there is no length cap: ids must not collide when truncated.
export function headingId(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const headings = (p: Post): { id: string; text: string }[] =>
  p.blocks.filter((b): b is Extract<Block, { t: "h2" }> => b.t === "h2").map((b) => ({ id: headingId(b.text), text: b.text }));

const blockText = (b: Block): string => {
  switch (b.t) {
    case "ul":
    case "ol":
      return b.items.join(" ");
    case "tip":
      return `${b.title} ${b.text}`;
    case "link":
      return `${b.label} ${b.text}`;
    case "img":
      return b.caption ?? "";
    default:
      return b.text;
  }
};

/** Every piece of readable text in the post (body + FAQ), link syntax included. */
export const postText = (p: Post): string => [...p.blocks.map(blockText), ...p.faq.flatMap((f) => [f.q, f.a])].join("\n");

export const wordCount = (p: Post): number => postText(p).replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").split(/\s+/).filter(Boolean).length;

/** Reading time at about 200 words a minute, never below 1. */
export const readingMinutes = (p: Post): number => Math.max(1, Math.ceil(wordCount(p) / 200));

/** Internal hrefs used in the post: link blocks plus [label](/path) inside text. */
export function internalLinks(p: Post): string[] {
  const inline = [...postText(p).matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);
  const cards = p.blocks.flatMap((b) => (b.t === "link" ? [b.href] : []));
  return [...new Set([...cards, ...inline])];
}
