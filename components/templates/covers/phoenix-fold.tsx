import type { CoverProps } from "./types";

// Phụng Vũ — an art-deco phoenix fan: nine tail feathers rise in a symmetric
// sunburst over two thin arc bands, then two scaled gatefold doors part to
// reveal the arched photo. The names rest under the fold in a bottom-anchored
// wrapper so long names never touch the doors.
const FEATHERS = [-72, -54, -36, -18, 0, 18, 36, 54, 72];

function Crest() {
  return (
    <svg className="cv-phoenix-fold__crest" viewBox="0 0 100 56" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <g className="cv-phoenix-fold__sway">
        <path d="M14 54A36 36 0 0 1 86 54" strokeWidth="0.7" opacity="0.7" />
        <path d="M22 54A28 28 0 0 1 78 54" strokeWidth="0.5" opacity="0.5" />
        {FEATHERS.map((angle, i) => {
          const s = 0.62 + 0.38 * Math.cos((angle * Math.PI) / 180);
          return (
            <g key={angle} transform={`translate(50 54) rotate(${angle}) scale(${s})`}>
              <g className="cv-phoenix-fold__feather" style={{ animationDelay: `${0.35 + i * 0.07}s` }}>
                <path d="M0 0C7-10 7-30 0-46C-7-30-7-10 0 0Z" strokeWidth="1.2" />
                <path d="M0-6V-38" strokeWidth="0.6" opacity="0.6" />
                <circle cx="0" cy="-35" r="2.6" strokeWidth="0.9" />
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function PhoenixFoldCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-phoenix-fold">
      <span className="cv-kicker cv-phoenix-fold__kicker">LỄ THÀNH HÔN</span>
      <Crest />
      <div className="cv-phoenix-fold__stage">
        <div className="cv-phoenix-fold__photo">{slot(0, "Mẫu thiệp cưới Phụng Vũ phong cách truyền thống cánh phụng")}</div>
        <div className="cv-phoenix-fold__door cv-phoenix-fold__door--l" aria-hidden="true" />
        <div className="cv-phoenix-fold__door cv-phoenix-fold__door--r" aria-hidden="true" />
      </div>
      <div className="cv-phoenix-fold__text">
        <p className="cv-names cv-phoenix-fold__names">
          {b} <span className="cv-phoenix-fold__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-phoenix-fold__date">{date}</p>
        {place && <p className="cv-place cv-phoenix-fold__place">{place}</p>}
      </div>
    </div>
  );
}
