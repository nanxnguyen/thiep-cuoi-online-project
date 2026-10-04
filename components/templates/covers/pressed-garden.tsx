import type { CoverProps } from "./types";

// Vườn Ép Hoa — a herbarium sheet: pressed sprigs in two corners, the photo
// taped like a specimen print, a dashed-edge label for the names.
function Sprig({ flip }: { flip?: boolean }) {
  const heads: [number, number, number][] = [
    [14, 30, 5.2],
    [26, 18, 4],
    [8, 52, 3.6],
    [34, 44, 3],
  ];
  return (
    <svg className={`cv-pressed-garden__sprig${flip ? " cv-pressed-garden__sprig--flip" : ""}`} viewBox="0 0 50 80" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <path d="M22 80C20 60 16 44 14 30M22 80C24 56 28 34 26 18M22 62C16 56 10 56 8 52M24 52C30 50 34 48 34 44" strokeWidth="0.8" />
      <g fill="currentColor" fillOpacity="0.16" strokeWidth="0.7">
        <path d="M21 70c-7-1-12-6-13-12 7 1 12 6 13 12ZM23 64c7-1 12-6 13-12-7 1-12 6-13 12ZM18 46c-6 0-10-3-11-8 6 0 10 3 11 8Z" />
      </g>
      {heads.map(([x, y, r]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} strokeWidth="0.6" fill="var(--cv-paper)">
          {[0, 72, 144, 216, 288].map((deg) => (
            <ellipse key={deg} cx="0" cy={-r * 0.62} rx={r * 0.46} ry={r * 0.7} transform={`rotate(${deg})`} />
          ))}
          <circle r={r * 0.22} fill="var(--cv-gold)" stroke="none" />
        </g>
      ))}
    </svg>
  );
}

export function PressedGardenCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-pressed-garden">
      <div className="cv-pressed-garden__sheet" aria-hidden="true" />
      <Sprig />
      <Sprig flip />
      <span className="cv-kicker cv-pressed-garden__kicker">TIÊU BẢN MÙA CƯỚI</span>
      <div className="cv-pressed-garden__print">
        <div className="cv-pressed-garden__photo">{slot(0, "Ảnh cưới")}</div>
        <i className="cv-pressed-garden__tape cv-pressed-garden__tape--a" aria-hidden="true" />
        <i className="cv-pressed-garden__tape cv-pressed-garden__tape--b" aria-hidden="true" />
      </div>
      <div className="cv-pressed-garden__label">
        <p className="cv-names cv-pressed-garden__names">
          {b} &amp; {a}
        </p>
        <p className="cv-date cv-pressed-garden__date">{date}</p>
        <p className="cv-place cv-pressed-garden__place">{place}</p>
      </div>
    </div>
  );
}
