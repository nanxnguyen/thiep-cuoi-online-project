import type { CoverProps } from "./types";

// Song Ảnh — two portraits split 40/60 with the second one stepped down; the
// names run vertically on the seam between them, the date sits in a base bar.
export function SplitPortraitCover({ a, b, date, place, day, month, slot }: CoverProps) {
  return (
    <div className="cv-split-portrait">
      <div className="cv-split-portrait__photo cv-split-portrait__photo--a">{slot(0, `Ảnh ${b}`)}</div>
      <div className="cv-split-portrait__block" aria-hidden="true" />
      <div className="cv-split-portrait__photo cv-split-portrait__photo--b">{slot(1, `Ảnh ${a}`)}</div>
      <p className="cv-names cv-split-portrait__names">
        {b} · {a}
      </p>
      <div className="cv-split-portrait__base">
        <span className="cv-split-portrait__day" aria-hidden="true">
          {day || "—"}
          <sup>{month ? `.${month}` : ""}</sup>
        </span>
        <span className="cv-date cv-split-portrait__date">{date}</span>
        {place && <span className="cv-place cv-split-portrait__place">{place}</span>}
      </div>
    </div>
  );
}
