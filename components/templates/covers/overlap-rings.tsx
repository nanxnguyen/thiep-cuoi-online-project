import type { CoverProps } from "./types";

// Giao Điểm — two large circles overlap diagonally: the photo ring top-left and
// a solid ring bottom-right carrying the day. The names sit in the paper lens
// between them. No blend modes: the lens is a solid paper layer.
export function OverlapRingsCover({ a, b, date, place, day, month, year, slot }: CoverProps) {
  return (
    <div className="cv-overlap-rings">
      <span className="cv-kicker cv-overlap-rings__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <div className="cv-overlap-rings__photo">{slot(0, "Mẫu thiệp cưới Giao Điểm phong cách tối giản vòng tròn", true)}</div>
      <div className="cv-overlap-rings__solid" aria-hidden="true" />
      <span className="cv-overlap-rings__outline" aria-hidden="true" />
      <i className="cv-overlap-rings__dot cv-overlap-rings__dot--1" aria-hidden="true" />
      <i className="cv-overlap-rings__dot cv-overlap-rings__dot--2" aria-hidden="true" />
      <div className="cv-overlap-rings__day" aria-hidden="true">
        <b>{day || "—"}</b>
        <span>
          {month ? `THÁNG ${month}` : ""}
          {year ? ` · ${year}` : ""}
        </span>
      </div>
      <div className="cv-overlap-rings__text">
        <p className="cv-names cv-overlap-rings__names">
          {b} <span className="cv-overlap-rings__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-overlap-rings__date">{date}</p>
        {place && <p className="cv-place cv-overlap-rings__place">{place}</p>}
      </div>
    </div>
  );
}
