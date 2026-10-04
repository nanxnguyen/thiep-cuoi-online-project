import type { CoverProps } from "./types";

// Tơ Hồng — one red silk thread winds down the page, loops twice around the
// photo and ties a bow above it. The thread is a stroked path (two widths for a
// silk sheen); the photo sits under the loops so the thread passes in front.
export function SilkKnotCover({ a, b, date, place, slot }: CoverProps) {
  const thread = "M6-4C6 18 40 20 30 40S10 72 36 92S76 98 70 118S38 136 56 150S96 160 106 182";
  return (
    <div className="cv-silk-knot">
      <span className="cv-kicker cv-silk-knot__kicker">TRĂM NĂM HẠNH PHÚC</span>
      <div className="cv-silk-knot__photo">{slot(0, "Ảnh cưới", true)}</div>
      <svg className="cv-silk-knot__thread" viewBox="0 0 100 178" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
        <path d={thread} strokeWidth="1.5" opacity="0.9" />
        <path d={thread} strokeWidth="0.45" stroke="var(--cv-paper)" opacity="0.7" transform="translate(0.5 0.4)" />
        <ellipse cx="50" cy="72" rx="27" ry="24" strokeWidth="1.3" transform="rotate(-18 50 72)" />
        <ellipse cx="50" cy="72" rx="24" ry="27" strokeWidth="1.3" transform="rotate(24 50 72)" opacity="0.85" />
        <g strokeWidth="1.4" fill="none">
          <path d="M50 46C38 34 28 46 50 46C72 46 62 34 50 46Z" fill="currentColor" fillOpacity="0.12" />
          <path d="M50 46C46 56 40 60 33 62" />
          <path d="M50 46C54 56 60 60 67 62" />
        </g>
        <circle cx="50" cy="46" r="2" fill="currentColor" stroke="none" />
        <path d="M104 178l-3 8M106 178l1 9" strokeWidth="1" />
      </svg>
      <div className="cv-silk-knot__text">
        <p className="cv-names cv-silk-knot__names">
          {b} <span className="cv-silk-knot__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-silk-knot__date">{date}</p>
        <p className="cv-place cv-silk-knot__place">{place}</p>
      </div>
    </div>
  );
}
