import type { CoverProps } from "./types";

// Cờ Hiệu — party bunting across the top and one big swallow-tail pennant on a
// rod, carrying the photo, "Save the date", the names and the date. The strings
// and flags are SVG; the pennant itself is a clip-path so text stays HTML.
const FLAGS = Array.from({ length: 11 }, (_, i) => i);

export function PennantCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-pennant">
      <svg className="cv-pennant__bunting" viewBox="0 0 100 24" aria-hidden="true">
        <path d="M-2 3C30 18 70 18 102 3" fill="none" stroke="currentColor" strokeWidth="0.5" />
        {FLAGS.map((i) => {
          const t = i / 10;
          const x = 4 + t * 92;
          const y = 3 + 14.2 * Math.sin(Math.PI * t) * 0.99 + 0.6;
          const tone = i % 3 === 0 ? "var(--cv-deep)" : i % 3 === 1 ? "var(--cv-gold)" : "color-mix(in srgb, var(--cv-deep) 45%, var(--cv-paper))";
          return <path key={i} d={`M${x - 3.4} ${y - 0.4}L${x + 3.4} ${y - 0.4}L${x} ${y + 6.4}Z`} fill={tone} />;
        })}
      </svg>
      <i className="cv-pennant__rod" aria-hidden="true" />
      <div className="cv-pennant__flag">
        <div className="cv-pennant__photo">{slot(0, "Ảnh cưới", true)}</div>
        <span className="cv-pennant__save">SAVE THE DATE</span>
        <p className="cv-names cv-pennant__names">
          {b}
          <span className="cv-pennant__amp"> &amp; </span>
          {a}
        </p>
        <p className="cv-date cv-pennant__date">{date}</p>
      </div>
      {place && <p className="cv-place cv-pennant__place">{place}</p>}
      <i className="cv-pennant__dot cv-pennant__dot--a" aria-hidden="true" />
      <i className="cv-pennant__dot cv-pennant__dot--b" aria-hidden="true" />
      <i className="cv-pennant__dot cv-pennant__dot--c" aria-hidden="true" />
    </div>
  );
}
