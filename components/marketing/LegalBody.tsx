import type { ReactNode } from "react";

// A legal page is a list of numbered sections; each body item is a paragraph (string) or a bullet list (string[]).
export type LegalSection = { title: string; body: (string | string[])[] };

export function LegalBody({ sections, updated, children }: { sections: readonly LegalSection[]; updated: string; children?: ReactNode }) {
  return (
    <article className="mk-prose">
      <p className="mk-updated">Cập nhật lần cuối: {updated}</p>
      {sections.map((s, i) => (
        <section key={s.title} aria-labelledby={`sec-${i + 1}`}>
          <h2 id={`sec-${i + 1}`}>
            {i + 1}. {s.title}
          </h2>
          {s.body.map((b, j) =>
            typeof b === "string" ? (
              <p key={j}>{b}</p>
            ) : (
              <ul key={j}>
                {b.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            ),
          )}
        </section>
      ))}
      {children}
    </article>
  );
}
