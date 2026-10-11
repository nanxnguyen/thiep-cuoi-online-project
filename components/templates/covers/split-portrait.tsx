import type { CoverProps } from "./types";

// Song Ảnh — two portraits flank a gold seam; the names run vertically in the
// gap between them, a big day numeral anchors the base.
export function SplitPortraitCover({ a, b, date, place, day, month, slot }: CoverProps) {
  return (
    <div className="cv-split-portrait">
      <div className="cv-split-portrait__photo cv-split-portrait__photo--a">{slot(0, `Ảnh ${b}`)}</div>
      <div className="cv-split-portrait__photo cv-split-portrait__photo--b">{slot(1, `Ảnh ${a}`)}</div>
      <i className="cv-split-portrait__crop cv-split-portrait__crop--a" aria-hidden="true" />
      <i className="cv-split-portrait__crop cv-split-portrait__crop--b" aria-hidden="true" />
      <div className="cv-split-portrait__gap">
        <i className="cv-split-portrait__rule" aria-hidden="true" />
        <p className="cv-names cv-split-portrait__names">
          <span>{b}</span>
          <span>{a}</span>
        </p>
        <i className="cv-split-portrait__rule" aria-hidden="true" />
      </div>
      <div className="cv-split-portrait__base">
        <span className="cv-split-portrait__day" aria-hidden="true">
          {day || "—"}
          <sup>{month ? `.${month}` : ""}</sup>
        </span>
        <span className="cv-split-portrait__info">
          <span className="cv-date cv-split-portrait__date">{date}</span>
          {place && <span className="cv-place cv-split-portrait__place">{place}</span>}
        </span>
      </div>
    </div>
  );
}
