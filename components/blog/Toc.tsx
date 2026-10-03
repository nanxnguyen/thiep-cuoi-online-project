type Item = { id: string; text: string };

// Outline of the article's own h2s. Wide screens get a sticky side rail, narrow ones a collapsed <details>:
// two pieces of markup, one visible at a time, so no script is needed to switch between them.
export function Toc({ items }: { items: Item[] }) {
  const list = (
    <ol>
      {items.map((h) => (
        <li key={h.id}>
          <a href={`#${h.id}`}>{h.text}</a>
        </li>
      ))}
    </ol>
  );
  return (
    <>
      <nav className="bl-toc bl-toc--rail" aria-label="Trong bài này">
        <span className="bl-toc__title">TRONG BÀI NÀY</span>
        {list}
      </nav>
      <details className="bl-toc bl-toc--fold">
        <summary>Trong bài này</summary>
        {list}
      </details>
    </>
  );
}
