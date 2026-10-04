import type { CoverProps } from "./types";

// Giao Điểm — two large circles intersect: the photo ring and a solid ring
// carrying the day. Where they overlap the solid ring multiplies over the
// photo; the names sit at the lower intersection.
export function OverlapRingsCover({ a, b, date, place, day, month, year, slot }: CoverProps) {
  return (
    <div className="cv-overlap-rings">
      <span className="cv-kicker cv-overlap-rings__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <div className="cv-overlap-rings__photo">{slot(0, "Ảnh cưới", true)}</div>
      <div className="cv-overlap-rings__solid" aria-hidden="true" />
      <span className="cv-overlap-rings__outline" aria-hidden="true" />
      <div className="cv-overlap-rings__day" aria-hidden="true">
        <b>{day || "—"}</b>
        <span>
          {month ? `THÁNG ${month}` : ""}
          {year ? ` · ${year}` : ""}
        </span>
      </div>
      <p className="cv-names cv-overlap-rings__names">
        {b} <span className="cv-overlap-rings__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-overlap-rings__date">{date}</p>
      {place && <p className="cv-place cv-overlap-rings__place">{place}</p>}
    </div>
  );
}
