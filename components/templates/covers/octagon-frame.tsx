import type { CoverProps } from "./types";
import { polygonPoints, r2 } from "./util";

// Bát Giác — the photo is cut to a regular octagon and ringed by two more
// octagons offset 22.5deg (a 16-point star), with 16 rays behind. Geometry only.
const CX = 50;
const CY = 66;
const RAYS = Array.from({ length: 16 }, (_, i) => (i * Math.PI) / 8);
const VERTS = Array.from({ length: 8 }, (_, i) => {
  const t = ((-22.5 + 45 * i) * Math.PI) / 180;
  return [r2(CX + 41 * Math.cos(t)), r2(CY + 41 * Math.sin(t))] as const;
});
const CORNERS: [number, number][] = [[9, 9], [91, 9], [9, 169], [91, 169]];

export function OctagonFrameCover({ a, b, date, place, slot }: CoverProps) {
  return (
    <div className="cv-octagon-frame">
      <svg className="cv-octagon-frame__rays" viewBox="0 0 100 178" aria-hidden="true">
        <defs>
          <linearGradient id="cv-oct-ray" gradientUnits="userSpaceOnUse" x1="50" y1="66" x2="50" y2="0">
            <stop offset="0" stopColor="var(--cv-gold)" stopOpacity="0.5" />
            <stop offset="1" stopColor="var(--cv-gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="url(#cv-oct-ray)" strokeWidth="0.5">
          {RAYS.map((t) => (
            <line key={t} x1={r2(CX + 44 * Math.cos(t))} y1={r2(CY + 44 * Math.sin(t))} x2={r2(CX + 66 * Math.cos(t))} y2={r2(CY + 66 * Math.sin(t))} />
          ))}
        </g>
      </svg>
      <svg className="cv-octagon-frame__corners" viewBox="0 0 100 178" fill="none" stroke="var(--cv-gold)" strokeWidth="0.35" aria-hidden="true">
        {CORNERS.map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(45)`}>
            <rect x={-3.2} y={-3.2} width={6.4} height={6.4} />
            <rect x={-1.2} y={-1.2} width={2.4} height={2.4} fill="var(--cv-gold)" stroke="none" />
          </g>
        ))}
      </svg>
      <span className="cv-kicker cv-octagon-frame__kicker">TRÂN TRỌNG KÍNH MỜI</span>
      <div className="cv-octagon-frame__photo">{slot(0, "Mẫu thiệp cưới Bát Giác phong cách cổ điển khung bát giác")}</div>
      <svg className="cv-octagon-frame__frame" viewBox="0 0 100 178" fill="none" stroke="var(--cv-gold)" aria-hidden="true">
        <polygon points={polygonPoints(CX, CY, 40.4, 8, -22.5)} strokeWidth="0.6" />
        <polygon points={polygonPoints(CX, CY, 42.4, 8, -22.5)} strokeWidth="0.3" />
        <polygon points={polygonPoints(CX, CY, 44.2, 8, 0)} strokeWidth="0.3" />
        {VERTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={1} fill="var(--cv-gold)" stroke="none" />
        ))}
      </svg>
      <div className="cv-octagon-frame__text">
        <p className="cv-names cv-octagon-frame__names">
          {b} <span className="cv-octagon-frame__amp">&amp;</span> {a}
        </p>
        <p className="cv-date cv-octagon-frame__date">{date}</p>
        {place && <p className="cv-place cv-octagon-frame__place">{place}</p>}
      </div>
    </div>
  );
}
