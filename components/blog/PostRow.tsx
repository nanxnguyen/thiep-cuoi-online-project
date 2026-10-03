import Link from "next/link";
import { readingMinutes, type Post } from "@/lib/blog";
import { PostPhoto } from "./PostPhoto";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" });
export const formatPostDate = (iso: string) => dateFormat.format(new Date(`${iso}T00:00:00Z`));

export function PostRow({ post }: { post: Post }) {
  return (
    <li>
      <Link className="bl-row" href={`/blog/${post.slug}`} prefetch={false}>
        <span className="bl-row__thumb">
          <PostPhoto image={post.cover} sizes="(max-width: 760px) 88px, 132px" />
        </span>
        <span className="bl-row__main">
          <span className="bl-row__cat">{post.category}</span>
          <h3>{post.title}</h3>
          <span className="bl-row__excerpt">{post.excerpt}</span>
        </span>
        <span className="bl-row__meta">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span>{readingMinutes(post)} phút đọc</span>
        </span>
      </Link>
    </li>
  );
}
