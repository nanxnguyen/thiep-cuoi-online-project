import Link from "next/link";

// A legal page is a list of numbered sections; each body item is a paragraph (string) or a bullet list (string[]).
export type LegalSection = { title: string; body: (string | string[])[] };

const DOCS = [
  ["/dieu-khoan", "Điều khoản sử dụng"],
  ["/quyen-rieng-tu", "Quyền riêng tư"],
] as const;

// design/Phap Ly.dc.html: one frame for both documents — heading, draft notice, two tab links, numbered sections.
export function LegalBody({ href, title, sections, updated }: { href: (typeof DOCS)[number][0]; title: string; sections: readonly LegalSection[]; updated: string }) {
  return (
    <article className="legal">
      <header className="legal__head">
        <p className="eyebrow">Pháp lý</p>
        <h1>{title}</h1>
        <p className="legal__updated">Cập nhật lần cuối: {updated}</p>
        <p className="legal__draft">Đây là bản nháp nội bộ, chưa được luật sư rà soát. Nội dung có thể thay đổi trước khi phát hành chính thức.</p>
      </header>
      <nav className="legal__tabs" aria-label="Văn bản pháp lý">
        {DOCS.map(([to, label]) => (
          <Link key={to} href={to} className="chip" aria-current={to === href ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="legal__body">
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
      </div>
    </article>
  );
}
