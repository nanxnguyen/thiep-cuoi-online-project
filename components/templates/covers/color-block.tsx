import type { CoverProps } from "./types";

// Khối Hỷ — three flat diagonal blocks (deep, gold, paper). An arched photo
// bridges deep and gold, a gold disc carries the day on the deep block and a
// 囍 sits in a half-circle on the gold. Names flow on the paper base.
export function ColorBlockCover({ a, b, date, place, day, month, slot }: CoverProps) {
  return (
    <div className="cv-color-block">
      <div className="cv-color-block__block cv-color-block__block--deep" aria-hidden="true" />
      <div className="cv-color-block__block cv-color-block__block--gold" aria-hidden="true" />
      <i className="cv-color-block__half" aria-hidden="true">
        <span className="xi">囍</span>
      </i>
      <i className="cv-color-block__dots" aria-hidden="true" />
      <span className="cv-kicker cv-color-block__kicker">THIỆP MỜI</span>
      <div className="cv-color-block__photo">{slot(0, "Mẫu thiệp cưới Khối Hỷ phong cách hiện đại mảng màu")}</div>
      <div className="cv-color-block__disc" aria-hidden="true">
        <b>{day || "—"}</b>
        <span>{month ? `THÁNG ${month}` : ""}</span>
      </div>
      <div className="cv-color-block__text">
        <p className="cv-names cv-color-block__names">
          {b} <span className="cv-color-block__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-color-block__date">{date}</p>
        {place && <p className="cv-place cv-color-block__place">{place}</p>}
      </div>
    </div>
  );
}
