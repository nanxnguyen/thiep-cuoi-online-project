import type { CoverProps } from "./types";

// Cờ Hiệu — a sagging line of bunting and one big swallow-tail pennant hung
// from a rod, carrying the photo, the names and the date. Bunting is SVG;
// the pennant is a clip-path so its text stays HTML.
const r2 = (n: number) => Math.round(n * 100) / 100;
const FLAGS = Array.from({ length: 9 }, (_, i) => {
  const t = (i + 0.5) / 9;
  const u = 1 - t;
  // quadratic bezier M-2 4 Q50 28 102 4
  return { i, x: r2(u * u * -2 + 2 * u * t * 50 + t * t * 102), y: r2(u * u * 4 + 2 * u * t * 28 + t * t * 4) };
});
const TONES = ["var(--cv-deep)", "var(--cv-gold)", "color-mix(in srgb, var(--cv-deep) 40%, var(--cv-paper))"];

export function PennantCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-pennant">
      <svg className="cv-pennant__bunting" viewBox="0 0 100 40" aria-hidden="true">
        <path d="M-2 4Q50 28 102 4" fill="none" stroke="currentColor" strokeWidth="0.5" />
        {FLAGS.map(({ i, x, y }) => (
          <path
            key={i}
            className="cv-pennant__tri"
            style={{ animationDelay: `${i * 120}ms` }}
            d={`M${x - 4.4} ${y}L${x + 4.4} ${y}L${x} ${r2(y + 10.5)}Z`}
            fill={TONES[i % 3]}
          />
        ))}
      </svg>
      <i className="cv-pennant__rod" aria-hidden="true" />
      <i className="cv-pennant__knot" aria-hidden="true" />
      <div className="cv-pennant__flag">
        <div className="cv-pennant__sway">
          <div className="cv-pennant__cloth">
            <div className="cv-pennant__photo">{slot(0, "Mẫu thiệp cưới Cờ Hiệu phong cách lãng mạn cờ đuôi nheo", true)}</div>
            <span className="cv-kicker cv-pennant__save">SAVE THE DATE</span>
            <p className="cv-names cv-pennant__names">
              {b}
              <span className="cv-pennant__amp"> &amp; </span>
              {a}
            </p>
            <p className="cv-date cv-pennant__date">{date}</p>
          </div>
        </div>
      </div>
      {place && <p className="cv-place cv-pennant__place">{place}</p>}
    </div>
  );
}
