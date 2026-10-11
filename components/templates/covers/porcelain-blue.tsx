import type { CoverProps } from "./types";

// Lam Sứ — a hand-painted cobalt frame on bright paper: a double wobbling
// border with one small sprig tucked into each corner. The names sit above a
// small oval photo, all three inside a bottom-anchored cartouche with the
// date and place — long names wrap inside, never under the frame.
function Corner({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? "translate(100 0) scale(-1 1)" : undefined}>
      <path d="M10 34C10 22 18 12 32 10" fill="none" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M14 30C14 22 20 15 30 14" fill="none" strokeWidth="0.5" strokeLinecap="round" opacity="0.7" />
      <path d="M18 22c3-4 8-5 12-3-2 4-8 5-12 3ZM22 28c2.4-3 6.4-3.6 9.6-2-1.6 3-6.6 3.6-9.6 2Z" fill="currentColor" opacity="0.75" stroke="none" />
      <circle cx="32" cy="10" r="1.3" stroke="none" fill="currentColor" />
      <circle cx="10" cy="34" r="1.3" stroke="none" fill="currentColor" />
    </g>
  );
}

export function PorcelainBlueCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-porcelain-blue">
      <svg className="cv-porcelain-blue__frame" viewBox="0 0 100 178" fill="none" stroke="currentColor" aria-hidden="true">
        <g className="cv-porcelain-blue__settle">
          <rect x="5" y="4" width="90" height="170" rx="3" strokeWidth="1.2" />
          <rect x="8.5" y="7.5" width="83" height="163" rx="2" strokeWidth="0.5" opacity="0.7" />
          <g transform="translate(5 4)">
            <Corner />
          </g>
          <g transform="translate(-5 4)">
            <Corner flip />
          </g>
          <g transform="translate(5 174) scale(1 -1)">
            <Corner />
          </g>
          <g transform="translate(-5 174) scale(-1 -1)">
            <Corner flip />
          </g>
          <path d="M44 5.5h12" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="50" cy="5.5" r="1.6" fill="currentColor" stroke="none" />
        </g>
      </svg>
      <span className="cv-kicker cv-porcelain-blue__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <div className="cv-porcelain-blue__label">
        <p className="cv-names cv-porcelain-blue__names">
          {b} &amp; {a}
        </p>
        <div className="cv-porcelain-blue__photo">
          {slot(0, "Mẫu thiệp cưới Lam Sứ phong cách cổ điển men lam", true)}
          <span className="cv-porcelain-blue__glaze" aria-hidden="true" />
        </div>
        <p className="cv-date cv-porcelain-blue__date">{date}</p>
        {place && <p className="cv-place cv-porcelain-blue__place">{place}</p>}
      </div>
    </div>
  );
}
