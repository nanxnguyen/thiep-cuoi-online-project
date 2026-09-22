import type { Block } from "@/lib/marketing/blog";

// Renders the article blocks as plain semantic HTML; styling lives in .mk-prose.
export function BlogBody({ blocks }: { blocks: readonly Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return <h2 key={i}>{b.text}</h2>;
          case "p":
            return <p key={i}>{b.text}</p>;
          case "quote":
            return <blockquote key={i}>{b.text}</blockquote>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ol>
            );
        }
      })}
    </>
  );
}
