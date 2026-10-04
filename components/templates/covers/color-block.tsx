import type { CoverProps } from "./types";

// Khối Hỷ — flat saturated blocks: a deep field, a gold disc carrying the day
// numeral, an arched photo and a paper base for the names. Flat colour only.
export function ColorBlockCover({ a, b, date, place, day, month, slot }: CoverProps) {
  return (
    <div className="cv-color-block">
      <div className="cv-color-block__field" aria-hidden="true" />
      <i className="cv-color-block__dots" aria-hidden="true" />
      <span className="cv-kicker cv-color-block__kicker">THIỆP MỜI</span>
      <div className="cv-color-block__photo">{slot(0, "Ảnh cưới")}</div>
      <div className="cv-color-block__disc" aria-hidden="true">
        <b>{day || "—"}</b>
        <span>{month ? `THÁNG ${month}` : ""}</span>
      </div>
      <div className="cv-color-block__base">
        <p className="cv-names cv-color-block__names">
          {b} <span className="cv-color-block__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-color-block__date">{date}</p>
        {place && <p className="cv-place cv-color-block__place">{place}</p>}
      </div>
    </div>
  );
}
