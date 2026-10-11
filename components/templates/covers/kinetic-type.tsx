import type { CoverProps } from "./types";

// Chữ Chuyển Nhịp — two huge name lines slide in once around a tall photo band;
// the day numeral is solid and huge. Text flows in one column (the photo band
// absorbs slack) so long names never collide. Reduced motion shows the rest state.
const STRIP = "SAVE THE DATE · SAVE THE DATE · SAVE THE DATE · SAVE THE DATE · ";

export function KineticTypeCover({ a, b, date, place, day, month, slot }: CoverProps) {
  const long = Math.max(a.length, b.length) >= 12;
  return (
    <div className={`cv-kinetic-type${long ? " cv-kinetic-type--long" : ""}`}>
      <p className="cv-kinetic-type__strip cv-kinetic-type__strip--top" aria-hidden="true">
        {STRIP}
      </p>
      <div className="cv-kinetic-type__text">
        <span className="cv-kicker cv-kinetic-type__kicker">THIỆP MỜI</span>
        <p className="cv-names cv-kinetic-type__names">
          <span className="cv-kinetic-type__line cv-kinetic-type__line--a">{b}</span>
          <span className="cv-kinetic-type__photo">
            {slot(0, "Mẫu thiệp cưới Chữ Chuyển Nhịp phong cách hiện đại chữ lớn")}
            <svg className="cv-kinetic-type__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 5v14h14M5 19L19 5" />
            </svg>
          </span>
          <span className="cv-kinetic-type__line cv-kinetic-type__line--b">
            <i>&amp;</i> {a}
          </span>
        </p>
        <div className="cv-kinetic-type__when">
          <p className="cv-kinetic-type__day" aria-hidden="true">
            {day || "—"}
            <sup>{month ? `.${month}` : ""}</sup>
          </p>
          <div className="cv-kinetic-type__info">
            <p className="cv-date cv-kinetic-type__date">{date}</p>
            {place && <p className="cv-place cv-kinetic-type__place">{place}</p>}
          </div>
        </div>
      </div>
      <p className="cv-kinetic-type__strip cv-kinetic-type__strip--bottom" aria-hidden="true">
        {STRIP}
      </p>
    </div>
  );
}
