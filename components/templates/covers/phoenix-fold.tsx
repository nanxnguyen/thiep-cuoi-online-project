import type { CoverProps } from "./types";

// Phụng Vũ — a gatefold: two scaled doors swing open onto the arched photo,
// under a fan of tail feathers. Feathers and scales are drawn, not imported.
function Crest() {
  const feathers = [-72, -54, -36, -18, 0, 18, 36, 54, 72];
  return (
    <svg className="cv-phoenix-fold__crest" viewBox="0 0 100 56" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      {feathers.map((angle) => {
        const s = 0.62 + 0.38 * Math.cos((angle * Math.PI) / 180);
        return (
          <g key={angle} transform={`translate(50 54) rotate(${angle}) scale(${s})`}>
            <path d="M0 0C7-10 7-30 0-46C-7-30-7-10 0 0Z" strokeWidth="1.2" />
            <path d="M0-6V-38" strokeWidth="0.6" opacity="0.6" />
            <circle cx="0" cy="-35" r="2.6" strokeWidth="0.9" />
          </g>
        );
      })}
    </svg>
  );
}

export function PhoenixFoldCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-phoenix-fold">
      <span className="cv-kicker cv-phoenix-fold__kicker">LỄ THÀNH HÔN</span>
      <Crest />
      <div className="cv-phoenix-fold__stage">
        <div className="cv-phoenix-fold__photo">{slot(0, "Ảnh cưới")}</div>
        <div className="cv-phoenix-fold__door cv-phoenix-fold__door--l" aria-hidden="true" />
        <div className="cv-phoenix-fold__door cv-phoenix-fold__door--r" aria-hidden="true" />
      </div>
      <p className="cv-names cv-phoenix-fold__names">
        {b} <span className="cv-phoenix-fold__amp">&amp;</span> {a}
      </p>
      <p className="cv-date cv-phoenix-fold__date">{date}</p>
      <p className="cv-place cv-phoenix-fold__place">{place}</p>
    </div>
  );
}
