import type { CoverProps } from "./types";

// Cắt Giấy — three crisp sheets tunnelled into an arch: the photo sits at the
// back of the cut arch framed by flat gold rings, a thread-and-diamond charm
// sways below it, and the names flow on the top sheet. Depth is shadow only,
// never gradient; one sway is the only ambient motion.
export function PaperCutCover({ a, b, date, place, slot }: CoverProps) {
  const long = a.length + b.length >= 22;
  return (
    <div className={`cv-paper-cut${long ? " cv-paper-cut--long" : ""}`}>
      <div className="cv-paper-cut__layer cv-paper-cut__layer--mid" aria-hidden="true" />
      <div className="cv-paper-cut__sheet">
        <span className="cv-kicker cv-paper-cut__kicker">TRÂN TRỌNG KÍNH MỜI</span>
        <div className="cv-paper-cut__photo">{slot(0, "Mẫu thiệp cưới Cắt Giấy phong cách lớp giấy cắt")}</div>
        <svg className="cv-paper-cut__charm" viewBox="0 0 20 34" aria-hidden="true">
          <g className="cv-paper-cut__sway">
            <line x1="10" y1="1" x2="10" y2="14" stroke="currentColor" strokeWidth="0.7" />
            <path
              d="M10 14L16 22L10 30L4 22Z"
              fill="var(--cv-gold)"
              stroke="currentColor"
              strokeWidth="0.7"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="22" r="2" fill="var(--cv-paper)" />
          </g>
        </svg>
        <div className="cv-paper-cut__text">
          <p className="cv-names cv-paper-cut__names">
            {b} <span className="cv-paper-cut__amp">&amp;</span> {a}
          </p>
          <p className="cv-date cv-paper-cut__date">{date}</p>
          {place && <p className="cv-place cv-paper-cut__place">{place}</p>}
        </div>
      </div>
    </div>
  );
}
