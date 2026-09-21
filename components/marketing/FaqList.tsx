import type { Faq } from "@/lib/marketing/features";
import { JsonLd } from "./JsonLd";

// Questions as native <details> (no JS). With `schema`, the same items are also emitted as FAQPage structured data.
export function FaqList({ items, schema = false }: { items: readonly Faq[]; schema?: boolean }) {
  return (
    <>
      <div className="mk-faq">
        {items.map((i) => (
          <details key={i.q}>
            <summary>{i.q}</summary>
            <p>{i.a}</p>
          </details>
        ))}
      </div>
      {schema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
          }}
        />
      )}
    </>
  );
}
