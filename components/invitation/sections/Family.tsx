import type { Content } from "@/lib/content";
import { Reveal } from "../client/Reveal";

type Side = Content["family"]["groomSide"];

const lines = (s: Side) => [s.father, s.mother].map((v) => v.trim()).filter(Boolean);
const hasContent = (s: Side) => lines(s).length > 0 || s.address.trim() !== "";

// "Nhà trai" is listed first, as on a printed Vietnamese invitation. A side with nothing typed is skipped.
export function Family({ content }: { content: Content }) {
  const sides = [
    { title: "Nhà trai", side: content.family.groomSide },
    { title: "Nhà gái", side: content.family.brideSide },
  ].filter((s) => hasContent(s.side));
  if (sides.length === 0) return null;

  return (
    <section className="inv-section inv-family" aria-labelledby="inv-family-h">
      <Reveal>
        <h2 className="inv-label" id="inv-family-h">
          Hai họ
        </h2>
        <div className="inv-sides">
          {sides.map(({ title, side }) => (
            <div className="inv-side" key={title}>
              <h3 className="inv-side__title">{title}</h3>
              {lines(side).map((line) => (
                <p className="inv-side__name" key={line}>
                  {line}
                </p>
              ))}
              {side.address.trim() && <p className="inv-side__addr">{side.address}</p>}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
