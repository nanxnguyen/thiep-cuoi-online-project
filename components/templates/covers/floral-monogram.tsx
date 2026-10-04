import type { CoverProps } from "./types";
import { initial } from "./util";

// Hoa Chữ — the couple's two initials stand on either side of one line-art
// stem and bloom. The bloom is three wavy rings (petal edges) around a spiral
// bud, computed once; no photo here, the couple's photos live further down.
function wavy(r: number, n: number, amp: number, phase: number) {
  const pts = Array.from({ length: 96 }, (_, i) => {
    const t = (i / 96) * Math.PI * 2;
    const rr = r * (1 + amp * Math.sin(n * t + phase));
    return `${(30 + rr * Math.cos(t)).toFixed(2)} ${(34 + rr * Math.sin(t)).toFixed(2)}`;
  });
  return `M${pts.join("L")}Z`;
}

export function FloralMonogramCover({ a, b, date, place }: CoverProps) {
  return (
    <div className="cv-floral-monogram">
      <span className="cv-kicker cv-floral-monogram__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <span className="cv-floral-monogram__letter cv-floral-monogram__letter--l" aria-hidden="true">
        {initial(b)}
      </span>
      <span className="cv-floral-monogram__letter cv-floral-monogram__letter--r" aria-hidden="true">
        {initial(a)}
      </span>
      <svg className="cv-floral-monogram__stem" viewBox="0 0 60 120" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M30 118C30 92 27 70 30 50" strokeWidth="0.9" />
        <path d="M30 100C20 98 11 90 8 80C19 80 27 88 30 100Z" strokeWidth="0.8" fill="currentColor" fillOpacity="0.1" />
        <path d="M30 88C40 86 49 78 52 68C41 68 33 76 30 88Z" strokeWidth="0.8" fill="currentColor" fillOpacity="0.1" />
        <path d="M30 72C22 70 15 64 13 56C21 56 27 62 30 72Z" strokeWidth="0.8" fill="currentColor" fillOpacity="0.1" />
        <g strokeWidth="0.8">
          <path d={wavy(17, 6, 0.11, 0)} fill="var(--cv-paper)" />
          <path d={wavy(12, 5, 0.12, 0.6)} fill="var(--cv-paper)" />
          <path d={wavy(7.5, 4, 0.14, 1.1)} fill="var(--cv-paper)" />
          <path d="M30 34m-2.4 0a2.4 2.4 0 1 1 4.8 0a4 4 0 1 1-8 0" />
        </g>
      </svg>
      <p className="cv-names cv-floral-monogram__names">
        {b} <span className="cv-floral-monogram__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-floral-monogram__date">{date}</p>
      {place && <p className="cv-place cv-floral-monogram__place">{place}</p>}
      <i className="cv-floral-monogram__rule" aria-hidden="true" />
    </div>
  );
}
