import Link from "next/link";
import type { Block } from "@/lib/blog";
import { headingId } from "@/lib/blog";
import { PostPhoto } from "./PostPhoto";

// "[label](/path)" becomes an internal link; every other character is plain text (React escapes it).
// Only site-relative paths match, so a post can never link off-site.
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\(\/[^)\s]*\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const m = /^\[([^\]]+)\]\((\/[^)\s]*)\)$/.exec(part);
        return m ? (
          <Link key={i} href={m[2]} prefetch={false}>
            {m[1]}
          </Link>
        ) : (
          part
        );
      })}
    </>
  );
}

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="bl-body">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "img":
            return (
              <figure key={i} className="bl-fig">
                <div className="bl-fig__frame">
                  <PostPhoto image={b.image} sizes="(max-width: 760px) 100vw, 680px" />
                </div>
                {b.caption && <figcaption>{b.caption}</figcaption>}
              </figure>
            );
          case "p":
            return (
              <p key={i}>
                <Inline text={b.text} />
              </p>
            );
          case "h2":
            return (
              <h2 key={i} id={headingId(b.text)}>
                {b.text}
              </h2>
            );
          case "h3":
            return <h3 key={i}>{b.text}</h3>;
          case "ul":
          case "ol": {
            const List = b.t;
            return (
              <List key={i}>
                {b.items.map((item) => (
                  <li key={item}>
                    <Inline text={item} />
                  </li>
                ))}
              </List>
            );
          }
          case "tip":
            return (
              <aside key={i} className="bl-tip">
                <strong>{b.title}</strong>
                <p>
                  <Inline text={b.text} />
                </p>
              </aside>
            );
          case "link":
            return (
              <Link key={i} className="bl-link" href={b.href} prefetch={false}>
                <span className="bl-link__label">{b.label}</span>
                <span className="bl-link__text">{b.text}</span>
                <span className="bl-link__go" aria-hidden="true">
                  →
                </span>
              </Link>
            );
        }
      })}
    </div>
  );
}
